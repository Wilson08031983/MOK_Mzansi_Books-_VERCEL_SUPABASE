import { CronJob } from 'cron';
import { db } from '@/lib/db';
import { emailService } from '@/services/email/emailService';
import emailServiceClient from '@/services/emailService';
import postmarkService from '@/services/postmarkService';
import { SUBSCRIPTION_PLANS } from '@/lib/paystack';
import { paystackService } from '@/services/paystackService';
import { startOfDay, differenceInCalendarDays } from 'date-fns';
// Function to find users in grace period (payment failed, but within 5 days)
const findUsersInGracePeriod = async () => {
  const now = new Date();
  const gracePeriodStart = new Date();
  gracePeriodStart.setDate(gracePeriodStart.getDate() - 5);

  return db.subscription.findMany({
    where: {
      status: 'past_due',
      paymentDeclinedDate: {
        gte: gracePeriodStart,
        lt: now,
      },
    },
    include: {
      user: true,
    },
  });
};

// Function to find users whose accounts should be locked (grace period expired)
const findUsersForAccountLockout = async () => {
  const gracePeriodEnd = new Date();
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() - 5);

  return db.subscription.findMany({
    where: {
      status: 'past_due',
      paymentDeclinedDate: {
        lt: gracePeriodEnd,
      },
    },
    include: {
      user: true,
    },
  });
};

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
          const msInDay = 1000 * 60 * 60 * 24;
          const daysLeft = user.trialEndsAt
            ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / msInDay))
            : undefined;

          await postmarkService.sendTrialReminderEmail(user.email, {
            userName: user.name,
            loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
            daysLeft,
            upgradeLink: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`
          });
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
      const gracePeriodEndDate = new Date(subscription.paymentDeclinedDate || now);
      gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + 5);

      if (subscription.paymentDeclinedDate && now > gracePeriodEndDate) {
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

// Cron job to send grace period reminder emails
export const gracePeriodReminderJob = new CronJob(
  '0 10 * * *', // Runs every day at 10:00 AM
  async () => {
    try {
      const subscriptionsInGracePeriod = await findUsersInGracePeriod();
      
      for (const subscription of subscriptionsInGracePeriod) {
        if (subscription.user.email && subscription.user.name) {
          const plan = SUBSCRIPTION_PLANS[subscription.tier as keyof typeof SUBSCRIPTION_PLANS];
          if (!plan) continue;

          const gracePeriodEnd = new Date(subscription.paymentDeclinedDate!);
          gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 5);
          
          const daysRemaining = Math.ceil((gracePeriodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

          await postmarkService.sendGracePeriodReminderEmail(subscription.user.email, {
            userName: subscription.user.name,
            companyName: subscription.user.name, // Fallback to user name
            daysRemaining,
            amountDue: plan.price,
            currency: 'ZAR',
            gracePeriodEndDate: gracePeriodEnd.toISOString(),
            paymentLink: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
            accountManagementLink: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
          });
        }
      }
    } catch (error) {
      console.error('Error in grace period reminder cron job:', error);
    }
  },
  null,
  true,
  'Africa/Johannesburg'
);

// Cron job to send account lockout emails and lock accounts
export const accountLockoutJob = new CronJob(
  '0 11 * * *', // Runs every day at 11:00 AM
  async () => {
    try {
      const subscriptionsForLockout = await findUsersForAccountLockout();
      
      for (const subscription of subscriptionsForLockout) {
        if (subscription.user.email && subscription.user.name) {
          const plan = SUBSCRIPTION_PLANS[subscription.tier as keyof typeof SUBSCRIPTION_PLANS];
          if (!plan) continue;

          const gracePeriodEnd = new Date(subscription.paymentDeclinedDate!);
          gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 5);
          
          // Use date boundaries to avoid off-by-one from time zones/DST
          const daysPastDue = Math.max(
            0,
            differenceInCalendarDays(
              startOfDay(new Date()),
              startOfDay(gracePeriodEnd)
            )
          );
          
          // Send lockout email before locking the account
          await postmarkService.sendAccountLockoutEmail(subscription.user.email, {
            userName: subscription.user.name,
            companyName: subscription.user.name, // Fallback to user name
            lockoutDate: new Date().toISOString(),
            gracePeriodEndDate: gracePeriodEnd.toISOString(),
            amountDue: plan.price,
            currency: 'ZAR',
            daysPastDue,
            paymentLink: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
            accountManagementLink: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
          });

          // Lock the account by setting status to canceled
          await db.subscription.update({
            where: { id: subscription.id },
            data: { status: 'canceled' },
          });

          // Optionally deactivate the user
          await db.user.update({
            where: { id: subscription.user.id },
            data: { isActive: false },
          });
        }
      }
    } catch (error) {
      console.error('Error in account lockout cron job:', error);
    }
  },
  null,
  true,
  'Africa/Johannesburg'
);

// Add helper to perform daily transitions (cancel_at_period_end)
export const runBillingDailyTransitions = async () => {
  const now = new Date();
  // Flip subscriptions that reached the end of period with cancelAtPeriodEnd flag
  const toCancel = await db.subscription.findMany({
    where: {
      cancelAtPeriodEnd: true,
      status: { in: ['trial', 'active', 'past_due'] },
      currentPeriodEnd: { lte: now },
    },
    select: { id: true, userId: true },
  });

  if (toCancel.length > 0) {
    const ids = toCancel.map((s) => s.id);
    await db.subscription.updateMany({
      where: { id: { in: ids } },
      data: { status: 'canceled', canceledAt: now },
    });

    // Write audit logs
    for (const sub of toCancel) {
      await db.auditLog.create({
        data: {
          userId: sub.userId,
          action: 'subscription.canceled_at_period_end',
          payload: { reason: 'period_end_reached' },
        },
      });
    }
  }
};

// Cron job for subscription renewals
export const subscriptionRenewalJob = new CronJob(
  '0 0 * * *', // Runs every day at midnight
  async () => {
    try {
      // First perform daily transitions (e.g., cancel_at_period_end flips)
      await runBillingDailyTransitions();
      // Then process renewals for active/past_due subscriptions
      await processRenewals();
    } catch (error) {
      console.error('Error in subscription renewal cron job:', error);
    }
  },
  null,
  true,
  'Africa/Johannesburg'
);

export const processRenewals = async () => {
  const due = await db.subscription.findMany({
    where: { status: 'active', currentPeriodEnd: { lte: new Date() } },
    include: { user: true },
  });

  for (const sub of due) {
    try {
      const plan = SUBSCRIPTION_PLANS[sub.tier as keyof typeof SUBSCRIPTION_PLANS];
      if (!plan) continue;

      // Find latest saved payment method (temporary via AuditLog payload)
      const lastSaved = await db.auditLog.findFirst({
        where: { userId: sub.userId, action: 'payment_method.saved' },
        orderBy: { createdAt: 'desc' },
      });
      const authCode = (lastSaved?.payload as any)?.authorization_code as string | undefined;
      if (!authCode) {
        console.warn(`No saved authorization for user ${sub.userId}, skipping auto-renew.`);
        continue;
      }

      const charge = await paystackService.chargeAuthorization(sub.user.email || '', plan.price, authCode, {
        reason: 'subscription_renewal',
        subscription_tier: sub.tier,
        user_id: sub.userId,
      });

      await db.payment.create({
        data: {
          userId: sub.userId,
          amount: plan.price / 100,
          amountMinor: plan.price,
          currency: 'ZAR',
          status: 'succeeded',
          reference: charge?.reference || `renewal_${Date.now()}`,
          providerPaymentId: String(charge?.id ?? ''),
          subscriptionId: sub.id,
        },
      });

      const now = new Date();
      const newEnd = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);
      await db.subscription.update({
        where: { id: sub.id },
        data: { currentPeriodStart: now, currentPeriodEnd: newEnd },
      });

      await db.auditLog.create({
        data: {
          userId: sub.userId,
          action: 'subscription.renewed',
          payload: { provider: 'paystack', chargeId: charge?.id, reference: charge?.reference },
        },
      });
    } catch (e) {
      console.error('Renewal failed for', sub.userId, e);
      await db.auditLog.create({
        data: { userId: sub.userId, action: 'subscription.renewal_failed', payload: { error: String(e) } },
      });
    }
  }
};