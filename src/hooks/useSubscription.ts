
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  access_level: string;
  paystack_reference?: string;
  start_date: string;
  end_date?: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (planType: string, paystackReference?: string) => {
    if (!user) throw new Error('User not authenticated');

    const subscriptionData = {
      user_id: user.id,
      plan_type: planType,
      status: planType === 'trial' ? 'trial' : 'active',
      access_level: 'full',
      paystack_reference: paystackReference,
      end_date: planType === 'trial' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null
    };

    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (error) throw error;
    setSubscription(data);
    return data;
  };

  const createPayment = async (subscriptionId: string, amount: number, paystackReference: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        subscription_id: subscriptionId,
        paystack_reference: paystackReference,
        amount,
        status: 'success',
        payment_date: new Date().toISOString()
      });

    if (error) throw error;
  };

  return {
    subscription,
    loading,
    createSubscription,
    createPayment,
    refetch: fetchSubscription
  };
};
