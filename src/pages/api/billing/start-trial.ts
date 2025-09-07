import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { SUBSCRIPTION_PLANS } from '@/lib/paystack';
import { getUserId } from '@/middleware/trialLimitMiddleware';
import { daysRemainingZA, isSentinelDate, endOfDayZAToUTC } from '@/utils/dateUtils';

// Keep snapshot consistent with /api/billing/me
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

    // If user already has a subscription, return its snapshot (no trial start)
    const existing = await db.subscription.findUnique({ where: { userId } });
    if (existing) {
      const status = (existing.status as 'trial' | 'active' | 'past_due' | 'canceled') || 'canceled';
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

    // Only allow starting a trial if user hasn't started one before
    if (user.trialEndsAt) {
      const trialEnd = new Date(user.trialEndsAt);
      const now = new Date();
      // If trial is still active or has already been used, just return snapshot inference
      const duration = SUBSCRIPTION_PLANS.trial.duration;
      const start = new Date(trialEnd.getTime() - duration * 24 * 60 * 60 * 1000);
      return res.status(200).json(
        buildSnapshot({
          status: now < trialEnd ? 'trial' : 'canceled',
          planCode: now < trialEnd ? 'trial' : null,
          currentPeriodStart: now < trialEnd ? start : null,
          currentPeriodEnd: endOfDayZAToUTC(trialEnd),
          cancelAtPeriodEnd: false,
          canceledAt: null,
          graceEnd: null,
        })
      );
    }

    // Start a new trial window for the user and create a trial subscription record
    const now = new Date();
    const trialDurationDays = SUBSCRIPTION_PLANS.trial.duration;
    const trialEnd = new Date(now.getTime() + trialDurationDays * 24 * 60 * 60 * 1000);

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { trialEndsAt: trialEnd },
    });

    const created = await db.subscription.create({
      data: {
        userId,
        status: 'trial',
        tier: 'trial',
        currentPeriodStart: now,
        currentPeriodEnd: endOfDayZAToUTC(trialEnd),
        cancelAtPeriodEnd: false,
      } as any,
    });

    await db.auditLog.create({
      data: {
        userId,
        action: 'subscription.trial_started',
        payload: { trialEndsAt: updatedUser.trialEndsAt },
      },
    });

    return res.status(200).json(
      buildSnapshot({
        status: 'trial',
        planCode: 'trial',
        currentPeriodStart: (created as any).currentPeriodStart ? new Date((created as any).currentPeriodStart) : now,
        currentPeriodEnd: (created as any).currentPeriodEnd ? new Date((created as any).currentPeriodEnd) : endOfDayZAToUTC(trialEnd),
        cancelAtPeriodEnd: false,
        canceledAt: null,
        graceEnd: null,
      })
    );
  } catch (error) {
    console.error('Error in POST /api/billing/start-trial:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}