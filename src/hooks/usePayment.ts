
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { PAYSTACK_CONFIG, SUBSCRIPTION_PLANS } from '@/lib/paystack';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';
import { toast } from '@/hooks/use-toast';

export const usePayment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createSubscription, createPayment } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const generatePaymentReference = () => {
    return new Date().getTime().toString();
  };

  const createPaymentConfig = (email: string) => ({
    reference: generatePaymentReference(),
    email: email || user?.email || 'user@example.com',
    amount: selectedPlan ? SUBSCRIPTION_PLANS[selectedPlan as keyof typeof SUBSCRIPTION_PLANS].price : 0,
    publicKey: PAYSTACK_CONFIG.publicKey,
  });

  const handlePaymentSuccess = async (reference: any) => {
    console.log('Payment successful:', reference);
    setIsProcessing(false);
    setShowPaymentModal(false);
    
    try {
      // Create subscription in database
      const subscription = await createSubscription(selectedPlan!, reference.reference);
      
      // Create payment record with success status
      const planPrice = SUBSCRIPTION_PLANS[selectedPlan! as keyof typeof SUBSCRIPTION_PLANS].price;
      await createPayment(subscription.id, planPrice, reference.reference);
      
      toast({
        title: "Payment Successful!",
        description: "Your subscription has been activated.",
      });
      
      navigate('/thank-you');
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Payment Error",
        description: "Payment successful but there was an error setting up your subscription. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentClose = () => {
    console.log('Payment closed or failed');
    setIsProcessing(false);
    setShowPaymentModal(false);
    
    // Show toast notification for payment failure
    toast({
      title: "Payment Failed",
      description: "Your payment was not successful. We'll retry automatically for the next 7 days.",
      variant: "destructive",
    });
  };

  const handleSelectPlan = async (planKey: string) => {
    if (!user) {
      // Redirect to signup if not authenticated
      navigate('/signup');
      return;
    }

    setSelectedPlan(planKey);
    
    if (planKey === 'trial') {
      try {
        await createSubscription('trial');
        toast({
          title: "Trial Started!",
          description: "Your 30-day free trial has been activated.",
        });
        navigate('/dashboard');
      } catch (error) {
        console.error('Error creating trial subscription:', error);
        toast({
          title: "Error",
          description: "Error starting trial. Please try again.",
          variant: "destructive",
        });
      }
      return;
    }
    
    setShowPaymentModal(true);
  };

  const initiatePayment = (email: string) => {
    if (!email && !user?.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    const config = createPaymentConfig(email);
    const initializePayment = usePaystackPayment(config);
    
    initializePayment({
      onSuccess: handlePaymentSuccess,
      onClose: handlePaymentClose,
    });
  };

  return {
    selectedPlan,
    showPaymentModal,
    isProcessing,
    handleSelectPlan,
    initiatePayment,
    setShowPaymentModal,
  };
};
