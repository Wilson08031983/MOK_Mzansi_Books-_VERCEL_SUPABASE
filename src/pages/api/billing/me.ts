import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { SUBSCRIPTION_PLANS } from '@/lib/paystack';
import { getUserId } from '@/middleware/trialLimitMiddleware';
import { daysRemainingZA, isSentinelDate, endOfDayZAToUTC } from '@/utils/dateUtils';

// Helper to build snapshot consistently
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
  const show_days_left = !!(currentPeriodEnd && !isSentinelDate(currentPeriodEnd) && typeof days_remaining === 'number' && days_remaining >= 1);

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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User authentication required' });
  }

  try {
    // Fetch user and subscription
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Not found', message: 'User not found' });

    const sub = await db.subscription.findUnique({ where: { userId } });

    // If no subscription, infer trial from user.trialEndsAt if available
    if (!sub) {
      const trialEnd = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
      const now = new Date();
      if (trialEnd && now < trialEnd) {
        // Trial ongoing
        const duration = SUBSCRIPTION_PLANS.trial.duration;
        const start = new Date(trialEnd.getTime() - duration * 24 * 60 * 60 * 1000);
        return res.status(200).json(
          buildSnapshot({
            status: 'trial',
            planCode: 'trial',
            currentPeriodStart: start,
            currentPeriodEnd: endOfDayZAToUTC(trialEnd),
            cancelAtPeriodEnd: false,
            canceledAt: null,
            graceEnd: null,
          })
        );
      }
      // No subscription and no trial => canceled/ended
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
    }

    // Build snapshot from subscription
    const status = (sub.status as 'trial' | 'active' | 'past_due' | 'canceled') || 'canceled';
    const planCode = (sub.tier as 'trial' | 'monthly' | 'annual') || null;
    const currentPeriodStart = sub.currentPeriodStart ? new Date(sub.currentPeriodStart) : null;
    const currentPeriodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
    const cancelAtPeriodEnd = !!sub.cancelAtPeriodEnd;
    const canceledAt = sub.canceledAt ? new Date(sub.canceledAt) : null;
    const graceEnd = sub.graceEnd ? new Date(sub.graceEnd) : null;

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
  } catch (error) {
    console.error('Error in GET /api/billing/me:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}