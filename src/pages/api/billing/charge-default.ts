import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { SUBSCRIPTION_PLANS } from '@/lib/paystack';
import { getUserId } from '@/middleware/trialLimitMiddleware';
import { paystackService } from '@/services/paystackService';

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
    if (!user) return res.status(404).json({ error: 'not_found', message: 'User not found' });

    const existingSub = await db.subscription.findUnique({ where: { userId } });
    const requestedTier = (req.body?.tier as string | undefined) || (existingSub?.tier as string | undefined) || 'monthly';

    const plan = SUBSCRIPTION_PLANS[requestedTier as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan) {
      return res.status(400).json({ error: 'invalid_tier', message: 'Invalid or unsupported subscription tier' });
    }

    // Find latest saved payment method (temporary via AuditLog payload)
    const lastSaved = await db.auditLog.findFirst({
      where: { userId, action: 'payment_method.saved' },
      orderBy: { createdAt: 'desc' },
    });

    const authCode = (lastSaved?.payload as any)?.authorization_code as string | undefined;
    if (!authCode) {
      return res.status(400).json({ error: 'no_saved_payment_method', message: 'No saved payment method found for this user' });
    }

    // Charge saved authorization with Paystack
    const charge = await paystackService.chargeAuthorization(
      user.email || '',
      plan.price, // minor units expected by Paystack service
      authCode,
      {
        reason: 'manual_retry',
        subscription_tier: requestedTier,
        user_id: userId,
      }
    );

    // Compute new subscription period
    const now = new Date();
    const newEnd = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

    // Upsert subscription and clear any past-due flags
    const updatedSub = await db.subscription.upsert({
      where: { userId },
      update: {
        status: 'active',
        tier: requestedTier,
        currentPeriodStart: now,
        currentPeriodEnd: newEnd,
        paymentDeclinedDate: null,
        graceEnd: null,
      },
      create: {
        userId,
        status: 'active',
        tier: requestedTier,
        currentPeriodStart: now,
        currentPeriodEnd: newEnd,
        cancelAtPeriodEnd: false,
      },
    });

    // Record payment (amount is in minor units)
    await db.payment.create({
      data: {
        userId,
        amount: plan.price / 100, // legacy major units
        amountMinor: plan.price,
        currency: 'ZAR',
        status: 'succeeded',
        reference: (charge as any)?.reference || `manual_${Date.now()}`,
        providerPaymentId: String((charge as any)?.id ?? ''),
        subscriptionId: updatedSub.id,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId,
        action: 'subscription.renewed',
        payload: { provider: 'paystack', reason: 'manual_retry', chargeId: (charge as any)?.id, reference: (charge as any)?.reference },
      },
    });

    return res.status(200).json({
      ok: true,
      reference: (charge as any)?.reference,
      subscription: {
        status: 'active',
        tier: requestedTier,
        current_period_start: now.toISOString(),
        current_period_end: newEnd.toISOString(),
      },
    });
  } catch (e: any) {
    // Attempt to log failure for observability
    try {
      await db.auditLog.create({
        data: {
          userId,
          action: 'subscription.manual_charge_failed',
          payload: { error: String(e?.message || e) },
        },
      });
    } catch {
      // noop
    }
    return res.status(500).json({ error: 'charge_failed', message: e?.message || 'Failed to charge saved card' });
  }
}