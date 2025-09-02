import { CronJob } from 'cron';
import { db } from '@/lib/db';
import { emailService } from '@/services/email/emailService';

// Function to find users whose trial is ending in 5 days
const findUsersWithExpiringTrials = async () => {
  const fiveDaysFromNow = new Date();
  fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

  return db.user.findMany({
    where: {
      trialEndsAt: {
        gte: new Date(),
        lt: fiveDaysFromNow,
      },
      isActive: true,
    },
  });
};

// Cron job to send trial reminder emails
export const trialReminderJob = new CronJob(
  '0 9 * * *', // Runs every day at 9:00 AM
  async () => {
    try {
      const users = await findUsersWithExpiringTrials();
      for (const user of users) {
        if (user.email && user.name) {
          await emailService.sendTrialReminder(user.email, user.name);
        }
      }
    } catch (error) {
      console.error('Error in trial reminder cron job:', error);
    }
  },
  null,
  true,
  'Africa/Johannesburg'
);

import { SUBSCRIPTION_PLANS } from '@/lib/paystack';
import { paystackService } from '@/services/paystackService';

// Placeholder for payment processing
const chargeCard = async (userId: string, tier: string): Promise<boolean> => {
  // In a real application, you would integrate with a payment provider like Paystack here
  console.log(`Attempting to charge card for user ${userId} for tier ${tier}`);
  
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !user.email) {
    console.error(`User with ID ${userId} not found or has no email.`);
    return false;
  }

  const plan = SUBSCRIPTION_PLANS[tier as keyof typeof SUBSCRIPTION_PLANS];
  if (!plan) {
    console.error(`Invalid subscription tier: ${tier}`);
    return false;
  }

  try {
    await paystackService.chargeCard(user.email, plan.price, { 
      user_id: userId, 
      subscription_tier: tier 
    });
    console.log(`Successfully initiated charge for user ${userId}`);
    return true;
  } catch (error) {
    console.error(`Failed to charge card for user ${userId}:`, error);
    return false;
  }
};

// Function to handle subscription renewals
const processSubscriptionRenewals = async () => {
  const now = new Date();
  const subscriptionsToRenew = await db.subscription.findMany({
    where: {
      currentPeriodEnd: {
        lt: now,
      },
      status: { in: ['active', 'past_due'] },
    },
    include: {
      user: true,
    },
  });

  for (const subscription of subscriptionsToRenew) {
    const paymentSuccess = await chargeCard(subscription.user.id, subscription.tier);

    if (paymentSuccess) {
      const newEndDate = new Date(subscription.currentPeriodEnd);
      if (subscription.tier === 'monthly') {
        newEndDate.setMonth(newEndDate.getMonth() + 1);
      } else if (subscription.tier === 'annual') {
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      }

      await db.subscription.update({
        where: { id: subscription.id },
        data: { 
          status: 'active', 
          currentPeriodEnd: newEndDate,
          paymentDeclinedDate: null
        },
      });
    } else {
      const gracePeriodEnd = new Date();
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 5);

      if (subscription.paymentDeclinedDate && now > subscription.paymentDeclinedDate) {
         await db.subscription.update({
          where: { id: subscription.id },
          data: { status: 'canceled' },
        });
      } else {
        await db.subscription.update({
          where: { id: subscription.id },
          data: { 
            status: 'past_due', 
            paymentDeclinedDate: subscription.paymentDeclinedDate || now 
          },
        });
      }
    }
  }
};

// Cron job for subscription renewals
export const subscriptionRenewalJob = new CronJob(
  '0 0 * * *', // Runs every day at midnight
  async () => {
    try {
      await processSubscriptionRenewals();
    } catch (error) {
      console.error('Error in subscription renewal cron job:', error);
    }
  },
  null,
  true,
  'Africa/Johannesburg'
);