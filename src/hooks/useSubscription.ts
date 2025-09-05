
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SUBSCRIPTION_PLANS } from '@/lib/paystack';
import { supabase } from '@/integrations/supabase';

export interface SubscriptionInfo {
  id?: string;
  userId?: string;
  tier: string;
  status: 'trial' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';
  currentPeriodEnd: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Helpers
const toDate = (value: any): Date => {
  try {
    if (value instanceof Date) return value;
    if (typeof value === 'string') return new Date(value);
    return new Date();
  } catch {
    return new Date();
  }
};

const normalizeTier = (row: any): string => {
  const raw = (row?.tier || row?.plan_type || row?.plan || row?.type || 'trial').toString().toLowerCase();
  return raw;
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Check localStorage first for cancelled status, even for admin users
      const localData = localStorage.getItem('mokSubscription');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (parsed.status === 'canceled') {
            setSubscription({
              ...parsed,
              currentPeriodEnd: toDate(parsed.currentPeriodEnd || parsed.validUntil)
            });
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error parsing localStorage subscription:', error);
        }
      }
      
      // If the user is an admin and no cancelled status in localStorage, provide a full-access subscription
      if ((user as any).role && ['Manager', 'CEO', 'Admin'].includes((user as any).role)) {
        setSubscription({
          tier: 'business',
          status: 'active',
          currentPeriodEnd: new Date('2099-12-31'),
          userId: (user as any).id
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
    setLoading(true);
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', (user as any).id)
        .single();

      if (!error && data) {
        const sub: SubscriptionInfo = {
          id: data.id || undefined,
          userId: data.user_id || (user as any).id,
          tier: normalizeTier(data),
          status: (data.status || 'trial').toString().toLowerCase(),
          currentPeriodEnd: data.end_date || data.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: data.created_at || undefined,
          updatedAt: data.updated_at || undefined,
        };
        setSubscription(sub);
        localStorage.setItem('mokSubscription', JSON.stringify({
          tier: sub.tier,
          status: sub.status,
          end_date: toDate(sub.currentPeriodEnd).toISOString(),
          validUntil: toDate(sub.currentPeriodEnd).toISOString(),
        }));
        return;
      }

      // Fallback to localStorage
      const storedSub = localStorage.getItem('mokSubscription');
      if (storedSub) {
        const parsed = JSON.parse(storedSub);
        setSubscription({
          tier: parsed.tier || parsed.plan_type || 'trial',
          status: (parsed.status || 'trial').toString().toLowerCase(),
          currentPeriodEnd: parsed.end_date || parsed.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          userId: (user as any).id
        });
      } else {
        // Default to trial subscription
        const defaultEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const defaultSub: SubscriptionInfo = {
          tier: 'trial',
          status: 'trial',
          currentPeriodEnd: defaultEnd,
          userId: (user as any).id
        };
        setSubscription(defaultSub);
        localStorage.setItem('mokSubscription', JSON.stringify({
          tier: 'trial',
          status: 'trial',
          validUntil: defaultEnd.toISOString(),
          end_date: defaultEnd.toISOString(),
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
      userId: (user as any).id,
      tier: planType,
      status: planType === 'trial' ? 'trial' : 'active',
      currentPeriodEnd,
    };

    setSubscription(newSubscription);

    try {
      const { error } = await supabase.from('subscriptions').upsert({
        user_id: (user as any).id,
        tier: planType,
        status: newSubscription.status,
        start_date: new Date().toISOString(),
        end_date: currentPeriodEnd.toISOString(),
        reference: paystackReference || null,
      }, { onConflict: 'user_id' });
      if (error) throw error;
    } catch (e) {
      console.warn('Supabase upsert subscription failed, using localStorage fallback:', e);
    }

    localStorage.setItem('mokSubscription', JSON.stringify({
      tier: planType,
      status: newSubscription.status,
      validUntil: currentPeriodEnd.toISOString(),
      end_date: currentPeriodEnd.toISOString(),
    }));

    return newSubscription;
  };

  const createPayment = async (subscriptionId: string, amount: number, paystackReference: string) => {
    if (!user) throw new Error('User not authenticated');

    const paymentRecord = {
      user_id: (user as any).id,
      amount,
      currency: 'ZAR',
      status: 'succeeded',
      reference: paystackReference,
      created_at: new Date().toISOString(),
      description: 'Subscription payment',
      subscription_id: subscriptionId || null,
    } as any;

    try {
      const { error } = await supabase.from('payments').insert(paymentRecord);
      if (error) throw error;
    } catch (e) {
      console.warn('Supabase insert payment failed, storing locally:', e);
      try {
        const key = 'mokSubscriptionPayments';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.unshift({
          date: paymentRecord.created_at,
          amount: paymentRecord.amount,
          currency: paymentRecord.currency,
          status: paymentRecord.status,
          reference: paymentRecord.reference,
          description: paymentRecord.description,
        });
        localStorage.setItem(key, JSON.stringify(existing));
      } catch { /* noop */ }
    }

    return {
      userId: (user as any).id,
      amount,
      currency: 'ZAR',
      status: 'succeeded',
      reference: paystackReference,
      createdAt: new Date(),
    };
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

    try {
      const { error } = await supabase.from('subscriptions').upsert({
        user_id: (user as any).id,
        tier: 'annual',
        status: 'active',
        end_date: currentPeriodEnd.toISOString(),
      }, { onConflict: 'user_id' });
      if (error) throw error;
    } catch (e) {
      console.warn('Supabase upsert annual subscription failed, using localStorage fallback:', e);
    }

    localStorage.setItem('mokSubscription', JSON.stringify({
      tier: 'annual',
      status: 'active',
      validUntil: currentPeriodEnd.toISOString(),
      end_date: currentPeriodEnd.toISOString(),
    }));

    return updatedSubscription;
  };

  const cancelSubscriptionAtPeriodEnd = async () => {
    if (!user || !subscription) throw new Error('User or subscription not found');

    // Always update localStorage to ensure persistence
    const updateLocalStorage = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('mokSubscription') || '{}');
        stored.status = 'canceled';
        if (!stored.end_date && subscription.currentPeriodEnd) {
          stored.end_date = toDate(subscription.currentPeriodEnd).toISOString();
        }
        if (!stored.validUntil && subscription.currentPeriodEnd) {
          stored.validUntil = toDate(subscription.currentPeriodEnd).toISOString();
        }
        localStorage.setItem('mokSubscription', JSON.stringify(stored));
      } catch (e) {
        console.error('Failed to update localStorage:', e);
      }
    };

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('user_id', (user as any).id);
      if (error) throw error;
      
      // Update localStorage even when Supabase succeeds
      updateLocalStorage();
    } catch (e) {
      console.warn('Supabase cancel update failed, falling back to localStorage:', e);
      updateLocalStorage();
    }

    setSubscription(prev => prev ? { ...prev, status: 'canceled' } : prev);
  };

  const fetchPaymentHistory = useCallback(async () => {
    if (!user) return [] as Array<{ date: string | Date; amount: number; status: string; description?: string; reference?: string; }>; 
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', (user as any).id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return (data || []).map((p: any) => ({
          date: p.created_at,
          amount: p.amount,
          status: (p.status || 'succeeded').toString().toLowerCase(),
          description: p.description || 'Subscription payment',
          reference: p.reference,
        }));
      }
    } catch (error) {
      console.error('Error fetching payment history from Supabase:', error);
    }

    try {
      const key = 'mokSubscriptionPayments';
      const local = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(local) ? local : [];
    } catch (e) {
      console.error('Error reading local payment history:', e);
      return [];
    }
  }, [user]);

  return {
    subscription,
    loading,
    createSubscription,
    createPayment,
    upgradeToAnnualPlan,
    cancelSubscriptionAtPeriodEnd,
    fetchPaymentHistory,
    refreshSubscription: fetchSubscription
  };
};
