import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { SUBSCRIPTION_PLANS } from '@/lib/paystack';
import { getUserId } from '@/middleware/trialLimitMiddleware';
import { daysRemainingZA, isSentinelDate, endOfDayZAToUTC } from '@/utils/dateUtils';

// Reuse the same snapshot shape as /api/billing/me for consistency
function buildSnapshot(params: {
  status: 'trial' | 'active' | 'past_due' | 'canceled';
  planCode: 'trial' | 'monthly' | 'annual' | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  graceEnd: Date | null;
}) {
  const { status, planCode, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, canceledAt, graceEnd } = params;
  const plan = planCode
    ? {
        code: planCode,
        price_minor: SUBSCRIPTION_PLANS[planCode].price,
        currency: 'ZAR' as const,
        duration_days: SUBSCRIPTION_PLANS[planCode].duration,
      }
    : null;

  const days_remaining = currentPeriodEnd ? daysRemainingZA(currentPeriodEnd) : null;
  const show_days_left = !!(
    currentPeriodEnd &&
    !isSentinelDate(currentPeriodEnd) &&
    typeof days_remaining === 'number' &&
    days_remaining >= 1
  );

  return {
    status,
    plan,
    current_period_start: currentPeriodStart ? currentPeriodStart.toISOString() : null,
    current_period_end: currentPeriodEnd ? currentPeriodEnd.toISOString() : null,
    cancel_at_period_end: cancelAtPeriodEnd,
    canceled_at: canceledAt ? canceledAt.toISOString() : null,
    grace_end: graceEnd ? graceEnd.toISOString() : null,
    days_remaining,
    flags: {
      is_trial: status === 'trial',
      is_canceled: status === 'canceled',
      is_in_grace: status === 'past_due' && !!graceEnd && new Date() <= graceEnd,
      show_days_left,
    },
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User authentication required' });
  }

  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Not found', message: 'User not found' });

    const existing = await db.subscription.findUnique({ where: { userId } });

    // If a subscription exists, update idempotently
    if (existing) {
      // Already canceled => idempotent no-op, return snapshot
      if (existing.status === 'canceled') {
        const status = 'canceled' as const;
        const planCode = (existing.tier as 'trial' | 'monthly' | 'annual') || null;
        const sx = existing as any;
        const currentPeriodStart = sx.currentPeriodStart ? new Date(sx.currentPeriodStart) : null;
        const currentPeriodEnd = sx.currentPeriodEnd ? new Date(sx.currentPeriodEnd) : null;
        const cancelAtPeriodEnd = !!sx.cancelAtPeriodEnd;
        const canceledAt = sx.canceledAt ? new Date(sx.canceledAt) : null;
        const graceEnd = sx.graceEnd ? new Date(sx.graceEnd) : null;

        return res.status(200).json(
          buildSnapshot({
            status,
            planCode,
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd,
            canceledAt,
            graceEnd,
          })
        );
      }

      // If already set to cancel_at_period_end, idempotent no-op
      if ((existing as any).cancelAtPeriodEnd) {
        const status = (existing.status as 'trial' | 'active' | 'past_due' | 'canceled') || 'canceled';
        const planCode = (existing.tier as 'trial' | 'monthly' | 'annual') || null;
        const sx = existing as any;
        const currentPeriodStart = sx.currentPeriodStart ? new Date(sx.currentPeriodStart) : null;
        const currentPeriodEnd = sx.currentPeriodEnd ? new Date(sx.currentPeriodEnd) : null;
        const canceledAt = sx.canceledAt ? new Date(sx.canceledAt) : null;
        const graceEnd = sx.graceEnd ? new Date(sx.graceEnd) : null;

        return res.status(200).json(
          buildSnapshot({
            status,
            planCode,
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: true,
            canceledAt,
            graceEnd,
          })
        );
      }

      // Set cancel_at_period_end = true and keep status unchanged (trial/active/past_due)
      const updated = await db.subscription.update({
        where: { id: existing.id },
        data: {
          cancelAtPeriodEnd: true,
        } as any,
      });

      await db.auditLog.create({
        data: {
          userId,
          action: 'subscription.cancel_requested',
          payload: { previous_status: existing.status },
        },
      });

      const status = (updated.status as 'trial' | 'active' | 'past_due' | 'canceled') || 'canceled';
      const planCode = (updated.tier as 'trial' | 'monthly' | 'annual') || null;
      const ux = updated as any;
      const currentPeriodStart = ux.currentPeriodStart ? new Date(ux.currentPeriodStart) : null;
      const currentPeriodEnd = ux.currentPeriodEnd ? new Date(ux.currentPeriodEnd) : null;
      const cancelAtPeriodEnd = !!ux.cancelAtPeriodEnd;
      const canceledAt = ux.canceledAt ? new Date(ux.canceledAt) : null;
      const graceEnd = ux.graceEnd ? new Date(ux.graceEnd) : null;

      return res.status(200).json(
        buildSnapshot({
          status,
          planCode,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd,
          canceledAt,
          graceEnd,
        })
      );
    }

    // No subscription exists - if user is on trial via user.trialEndsAt, create a trial subscription and set cancel_at_period_end
    const now = new Date();
    const trialEnd = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
    if (trialEnd && now < trialEnd) {
      const plan = SUBSCRIPTION_PLANS.trial;
      const start = new Date(trialEnd.getTime() - plan.duration * 24 * 60 * 60 * 1000);
      const created = await db.subscription.create({
        data: {
          userId,
          status: 'trial',
          tier: 'trial',
          currentPeriodStart: start,
          currentPeriodEnd: endOfDayZAToUTC(trialEnd),
          cancelAtPeriodEnd: true,
        } as any,
      });

      await (db as any).auditLog.create({
        data: {
          userId,
          action: 'subscription.cancel_requested',
          payload: { previous_status: 'trial', inferred: true },
        },
      });

      return res.status(200).json(
        buildSnapshot({
          status: 'trial',
          planCode: 'trial',
          currentPeriodStart: (created as any).currentPeriodStart ? new Date((created as any).currentPeriodStart) : null,
          currentPeriodEnd: (created as any).currentPeriodEnd ? new Date((created as any).currentPeriodEnd) : null,
          cancelAtPeriodEnd: true,
          canceledAt: null,
          graceEnd: null,
        })
      );
    }

    // No subscription and no active trial => nothing to cancel; return a canceled-like snapshot
    return res.status(200).json(
      buildSnapshot({
        status: 'canceled',
        planCode: null,
        currentPeriodStart: null,
        currentPeriodEnd: trialEnd ? endOfDayZAToUTC(trialEnd) : null,
        cancelAtPeriodEnd: false,
        canceledAt: null,
        graceEnd: null,
      })
    );
  } catch (error) {
    console.error('Error in POST /api/billing/cancel:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}