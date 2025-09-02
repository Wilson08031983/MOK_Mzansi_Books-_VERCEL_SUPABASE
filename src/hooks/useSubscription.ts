
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SUBSCRIPTION_PLANS } from '@/lib/paystack';

export interface SubscriptionInfo {
  id?: string;
  userId?: string;
  tier: string;
  status: 'trial' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';
  currentPeriodEnd: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // If the user is an admin, provide a full-access subscription
      if (user.role && ['Manager', 'CEO', 'Admin'].includes(user.role)) {
        setSubscription({
          tier: 'business',
          status: 'active',
          currentPeriodEnd: new Date('2099-12-31'), // A date far in the future
          userId: user.id
        });
        setLoading(false);
        return;
      }
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;
    try {
      // First try localStorage
      const storedSub = localStorage.getItem('mokSubscription');
      if (storedSub) {
        const parsed = JSON.parse(storedSub);
        setSubscription({
          tier: parsed.tier || parsed.plan_type || 'trial',
          status: parsed.status || 'trial',
          currentPeriodEnd: parsed.end_date || parsed.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          userId: user.id
        });
      } else {
        // Default to trial subscription
        const defaultSub = {
          tier: 'trial',
          status: 'trial' as const,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          userId: user.id
        };
        setSubscription(defaultSub);
        localStorage.setItem('mokSubscription', JSON.stringify({
          tier: 'trial',
          status: 'trial',
          validUntil: defaultSub.currentPeriodEnd.toISOString()
        }));
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (planType: string, paystackReference?: string) => {
    if (!user) throw new Error('User not authenticated');

    const plan = SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan) {
      throw new Error(`Subscription plan ${planType} not found`);
    }

    const currentPeriodEnd = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);

    const newSubscription: SubscriptionInfo = {
      userId: user.id,
      tier: planType,
      status: planType === 'trial' ? 'trial' : 'active',
      currentPeriodEnd,
    };

    setSubscription(newSubscription);
    
    // Store in localStorage
    localStorage.setItem('mokSubscription', JSON.stringify({
      tier: planType,
      status: newSubscription.status,
      validUntil: currentPeriodEnd.toISOString()
    }));

    return newSubscription;
  };

  const createPayment = async (subscriptionId: string, amount: number, paystackReference: string) => {
    if (!user) throw new Error('User not authenticated');

    // In a real implementation, this would create a payment record via API
    const newPayment = {
      userId: user.id,
      amount,
      currency: 'ZAR',
      status: 'succeeded',
      reference: paystackReference,
      createdAt: new Date(),
    };

    return newPayment;
  };

  const upgradeToAnnualPlan = async () => {
    if (!user || !subscription) throw new Error('User or subscription not found');

    const annualPlan = SUBSCRIPTION_PLANS.annual;
    if (!annualPlan) {
      throw new Error('Annual subscription plan not found');
    }

    const currentPeriodEnd = new Date(Date.now() + annualPlan.duration * 24 * 60 * 60 * 1000);

    const updatedSubscription: SubscriptionInfo = {
      ...subscription,
      tier: 'annual',
      status: 'active',
      currentPeriodEnd,
    };

    setSubscription(updatedSubscription);
    
    // Store in localStorage
    localStorage.setItem('mokSubscription', JSON.stringify({
      tier: 'annual',
      status: 'active',
      validUntil: currentPeriodEnd.toISOString()
    }));

    return updatedSubscription;
  };

  const fetchPaymentHistory = useCallback(async () => {
    if (!user) return [];
    try {
      // In a real implementation, this would fetch from API
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }, [user]);

  return {
    subscription,
    loading,
    createSubscription,
    createPayment,
    upgradeToAnnualPlan,
    fetchPaymentHistory,
    refreshSubscription: fetchSubscription
  };
};
