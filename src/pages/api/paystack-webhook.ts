import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { env } from '@/env.mjs';
import { db } from '@/lib/db';
import { SUBSCRIPTION_PLANS } from '@/lib/paystack';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Use test secret in non-production if available
  const secret = process.env.NODE_ENV !== 'production'
    ? (env.PAYSTACK_SECRET_KEY_TEST || env.PAYSTACK_SECRET_KEY)
    : env.PAYSTACK_SECRET_KEY;

  const signature = req.headers['x-paystack-signature'] as string | undefined;
  const computedHash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

  if (!signature || computedHash !== signature) {
    return res.status(401).json({ message: 'Invalid signature' });
  }

  const event = req.body;

  // Derive idempotency key (prefer data.id, fallback to data.reference)
  const provider = 'paystack';
  const eventType = event.event as string;
  const eventId = (event?.data?.id ?? event?.data?.reference ?? `${Date.now()}-${Math.random()}`) as string;

  try {
    // Idempotency: record or short-circuit if already processed
    const existing = await db.webhookEvent.findUnique({ where: { provider_eventId: { provider, eventId: String(eventId) } } as any });
    if (existing && existing.processedAt) {
      return res.status(200).json({ message: 'Already processed' });
    }
    const recorded = existing ?? (await db.webhookEvent.create({ data: { provider, eventType, eventId: String(eventId), payload: event } }));

    switch (event.event) {
      case 'charge.success': {
        const { reference, amount, customer, authorization } = event.data;
        const { email } = customer;

        // Metadata may come either as flat keys or inside custom_fields array
        const metadata = event.data?.metadata || {};
        let user_id: string | undefined = metadata.user_id;
        let subscription_tier: string | undefined = metadata.subscription_tier;
        const save_payment_method = Boolean(metadata.save_payment_method);

        if ((!user_id || !subscription_tier) && Array.isArray(metadata.custom_fields)) {
          for (const field of metadata.custom_fields) {
            if (field.variable_name === 'user_id') user_id = field.value;
            if (field.variable_name === 'subscription_tier') subscription_tier = field.value;
          }
        }

        if (!user_id) {
          // Fallback lookup by email
          const u = await db.user.findUnique({ where: { email } });
          if (u) user_id = u.id;
        }
        if (!user_id || !subscription_tier) break;

        const plan = SUBSCRIPTION_PLANS[subscription_tier as keyof typeof SUBSCRIPTION_PLANS];
        if (!plan) break;

        const now = new Date();
        const newEnd = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

        await db.subscription.upsert({
          where: { userId: user_id },
          update: {
            status: 'active',
            tier: subscription_tier,
            currentPeriodStart: now,
            currentPeriodEnd: newEnd,
            cancelAtPeriodEnd: false,
            paymentDeclinedDate: null,
            graceEnd: null,
          },
          create: {
            userId: user_id,
            status: 'active',
            tier: subscription_tier,
            currentPeriodStart: now,
            currentPeriodEnd: newEnd,
            cancelAtPeriodEnd: false,
          },
        });

        // Record payment (amount is in kobo from Paystack)
        await db.payment.create({
          data: {
            userId: user_id,
            amount: (amount as number) / 100, // legacy major units
            amountMinor: amount as number,
            currency: 'ZAR',
            status: 'succeeded',
            reference,
            providerPaymentId: String(event.data?.id ?? ''),
            subscription: { connect: { userId: user_id } },
          },
        });

        // If user opted to save card and we received authorization, persist minimal details for later use
        if (save_payment_method && authorization?.authorization_code) {
          await db.auditLog.create({
            data: {
              userId: user_id,
              action: 'payment_method.saved',
              payload: {
                provider: 'paystack',
                authorization_code: authorization.authorization_code,
                last4: authorization.last4,
                bin: authorization.bin,
                brand: authorization.brand,
                exp_month: authorization.exp_month,
                exp_year: authorization.exp_year,
                reusable: authorization.reusable,
              },
            },
          });
        }

        await db.auditLog.create({
          data: {
            userId: user_id,
            action: 'payment.succeeded',
            payload: { reference, amount, eventType },
          },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const failedCustomer = event.data.customer;
        const { email: failedEmail } = failedCustomer;
        const failedUser = await db.user.findUnique({ where: { email: failedEmail } });

        if (failedUser) {
          const now = new Date();
          const grace = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
          await db.subscription.update({
            where: { userId: failedUser.id },
            data: { status: 'past_due', paymentDeclinedDate: now, graceEnd: grace },
          });
          await db.auditLog.create({
            data: {
              userId: failedUser.id,
              action: 'payment.failed',
              payload: { eventType },
            },
          });
        }
        break;
      }
      default:
        console.log(`Unhandled Paystack event: ${event.event}`);
    }

    // Mark processed
    await db.webhookEvent.update({ where: { id: recorded.id }, data: { processedAt: new Date() } });

    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default handler;