
import { useState, useEffect } from 'react';
import { useAuth } from './useAuthHook';

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
      // Mock subscription data for development
      const mockSubscription = {
        id: 'mock-subscription',
        plan_type: 'premium',
        status: 'active',
        access_level: 'full',
        paystack_reference: 'mock-ref-123',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      setSubscription(mockSubscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (planType: string, paystackReference?: string) => {
    if (!user) throw new Error('User not authenticated');

    const subscriptionData = {
      id: `subscription-${Date.now()}`,
      user_id: user.id,
      plan_type: planType,
      status: planType === 'trial' ? 'trial' : 'active',
      access_level: 'full',
      paystack_reference: paystackReference,
      start_date: new Date().toISOString(),
      end_date: planType === 'trial' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined
    };

    // Store in local storage for persistence
    localStorage.setItem('mokSubscription', JSON.stringify(subscriptionData));
    
    setSubscription(subscriptionData);
    return subscriptionData;
  };

  const createPayment = async (subscriptionId: string, amount: number, paystackReference: string) => {
    if (!user) throw new Error('User not authenticated');

    // Create mock payment record
    const paymentData = {
      id: `payment-${Date.now()}`,
      user_id: user.id,
      subscription_id: subscriptionId,
      paystack_reference: paystackReference,
      amount,
      status: 'success',
      payment_date: new Date().toISOString()
    };
    
    // Store in local storage
    const payments = JSON.parse(localStorage.getItem('mokPayments') || '[]');
    payments.push(paymentData);
    localStorage.setItem('mokPayments', JSON.stringify(payments));
    
    return Promise.resolve(paymentData);
  };

  return {
    subscription,
    loading,
    createSubscription,
    createPayment,
    refetch: fetchSubscription
  };
};
