import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { env } from '@/env.mjs';
import { db } from '@/lib/db';
import { SUBSCRIPTION_PLANS } from '@/lib/paystack';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const secret = env.PAYSTACK_SECRET_KEY;
  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).json({ message: 'Invalid signature' });
  }

  const event = req.body;

  try {
    switch (event.event) {
      case 'charge.success':
        const { reference, amount, customer } = event.data;
        const { email } = customer;
        const { user_id, subscription_tier } = event.data.metadata;

        const user = await db.user.findUnique({ where: { id: user_id } });

        if (!user) {
          console.error(`Webhook Error: User with ID ${user_id} not found`);
          break;
        }

        const plan = SUBSCRIPTION_PLANS[subscription_tier as keyof typeof SUBSCRIPTION_PLANS];
        if (!plan) {
          console.error(`Webhook Error: Subscription plan ${subscription_tier} not found`);
          break;
        }

        const currentPeriodEnd = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);

        const subscription = await db.subscription.upsert({
          where: { userId: user.id },
          update: {
            tier: subscription_tier,
            status: 'active',
            currentPeriodEnd,
          },
          create: {
            userId: user.id,
            tier: subscription_tier,
            status: 'active',
            currentPeriodEnd,
          },
        });

        await db.payment.create({
          data: {
            userId: user.id,
            amount: amount / 100, // Convert from kobo
            currency: 'ZAR',
            status: 'succeeded',
            reference,
            subscriptionId: subscription.id,
          },
        });

        break;
      case 'invoice.payment_failed':
        const { customer: failedCustomer } = event.data;
        const { email: failedEmail } = failedCustomer;

        const failedUser = await db.user.findUnique({ where: { email: failedEmail } });

        if (failedUser) {
          await db.subscription.update({
            where: { userId: failedUser.id },
            data: { status: 'past_due' },
          });
        }
        break;
      default:
        console.log(`Unhandled Paystack event: ${event.event}`);
    }

    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default handler;