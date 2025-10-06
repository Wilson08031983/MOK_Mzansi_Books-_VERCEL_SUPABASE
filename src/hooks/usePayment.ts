
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { PAYSTACK_CONFIG, SUBSCRIPTION_PLANS } from '@/lib/paystack';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from './useSubscription';
import { toast } from '@/hooks/use-toast';
import { useLocalization } from '@/hooks/useLocalization';

// Environment helper
const __DEV__ = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') ||
  (typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test((window.location && window.location.hostname) || ''));

export const usePayment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createSubscription, createPayment } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalMode, setModalMode] = useState<'subscribe' | 'update'>('subscribe');
  const { t } = useLocalization();

  // Helper to pause between polling attempts
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // After a successful verification, poll backend subscription snapshot to ensure activation via webhook
  const waitForServerActivation = async (
    expectedPlan?: string | null,
    totalMs = 10000,
    intervalMs = 1000
  ): Promise<boolean> => {
    if (__DEV__) return true; // In dev, assume activation for local testing

    const attempts = Math.max(1, Math.floor(totalMs / intervalMs));
    for (let i = 0; i < attempts; i++) {
      try {
        const r = await fetch('/api/billing/me');
        if (r.ok) {
          const snap = await r.json();
          const status = (snap?.status || '').toString().toLowerCase();
          const planCode = (snap?.plan?.code || snap?.planCode || '').toString().toLowerCase();
          if (status === 'active' && (!expectedPlan || !planCode || planCode === expectedPlan)) {
            return true;
          }
        }
      } catch {
        // ignore and retry
      }
      await sleep(intervalMs);
    }
    return false;
  };

  const generatePaymentReference = () => new Date().getTime().toString();

  const createPaymentConfig = (email: string, savePaymentMethod?: boolean) => ({
    reference: generatePaymentReference(),
    email: email || user?.email || 'user@example.com',
    amount: selectedPlan ? SUBSCRIPTION_PLANS[selectedPlan as keyof typeof SUBSCRIPTION_PLANS].price : 0,
    // PaystackPop.newTransaction expects `key`, not `publicKey`
    key: PAYSTACK_CONFIG.publicKey,
    currency: 'ZAR' as const,
    metadata: {
      save_payment_method: !!savePaymentMethod,
      custom_fields: [
        { display_name: 'User ID', variable_name: 'user_id', value: user?.id || 'guest' },
        { display_name: 'Subscription Tier', variable_name: 'subscription_tier', value: selectedPlan || 'unknown' },
        { display_name: 'Email', variable_name: 'email', value: email || user?.email || 'user@example.com' },
      ],
    },
  });

  const handlePaymentSuccess = async (reference: any) => {
    console.log('Payment successful (client):', reference);
    setShowPaymentModal(false);
    setIsProcessing(true);

    const maxRetries = 3;
    const retryDelay = 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let verified = false;
      try {
        if (__DEV__) {
          console.log('Dev mode: Verifying via API route (preferred)');
          // Prefer server-side verification even in dev to avoid exposing secrets
          try {
            const resp = await fetch('/api/paystack-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reference: reference?.reference || reference }),
            });
            if (resp.ok) {
              const body = await resp.json().catch(() => ({}));
              verified = !!body?.verified;
              if (!verified && (body?.status === 'pending' || body?.message?.includes('pending'))) {
                if (attempt < maxRetries) {
                  await new Promise(res => setTimeout(res, retryDelay));
                  continue;
                }
              }
            } else {
              throw new Error('Server verification failed');
            }
          } catch (_serverErr) {
            console.log('Dev mode: Server verification failed; not using client secrets');
            throw _serverErr;
          }
        } else {
          // Production mode: use API route
          const resp = await fetch('/api/paystack-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: reference?.reference || reference }),
          });
          if (resp.ok) {
            const body = await resp.json().catch(() => ({}));
            verified = !!body?.verified;
            if (!verified && (body?.status === 'pending' || body?.message?.includes('pending'))) {
              if (attempt < maxRetries) {
                await new Promise(res => setTimeout(res, retryDelay));
                continue;
              }
            }
          } else {
            throw new Error('Server verification failed');
          }
        }
      } catch (error) {
        console.error('Verification error:', error);
        if (attempt < maxRetries) {
          await new Promise(res => setTimeout(res, retryDelay));
          continue;
        }
      }

      if (verified) {
        // Persist subscription and payment history
        try {
          const planKey = (selectedPlan || '') as keyof typeof SUBSCRIPTION_PLANS;
          const amount = planKey ? (SUBSCRIPTION_PLANS[planKey]?.price || 0) : 0;
          const refStr = reference?.reference || reference;

          if (modalMode === 'update') {
            // Record payment in update mode when a charge actually occurred
            if (amount > 0) {
              try {
                await createPayment('', amount, refStr);
              } catch (e) {
                console.warn('Failed to record payment (update mode):', e);
              }
            }

            setIsProcessing(false);
            toast({
              title: t('settings.billing.toasts.paymentUpdatedTitle'),
              description: t('settings.billing.toasts.paymentUpdatedDesc'),
            });
            return;
          }

          if (selectedPlan && selectedPlan !== 'trial') {
            try {
              await createSubscription(selectedPlan as any, refStr);
            } catch (e) {
              console.warn('Failed to create/activate subscription locally:', e);
            }
            try {
              await createPayment('', amount, refStr);
            } catch (e) {
              console.warn('Failed to record payment:', e);
            }
          }
        } catch (e) {
          console.warn('Post-verify persistence warnings:', e);
        }

        const activated = await waitForServerActivation(selectedPlan);
        if (!activated) console.warn('Subscription not yet active on server after verify; proceeding while webhook completes');

        toast({
          title: t('settings.billing.toasts.paymentSuccessTitle'),
          description: t('settings.billing.toasts.paymentSuccessDesc'),
        });
        setIsProcessing(false);
        navigate('/thank-you');
        return;
      }
    }

    // If not verified after retries, notify user gracefully
    toast({
      title: t('settings.billing.toasts.paymentProcessingTitle') || 'Payment Processing',
      description: t('settings.billing.toasts.paymentProcessingDesc') || 'Your payment is being processed. Please check your email for confirmation.',
    });
    setIsProcessing(false);
    navigate('/thank-you');
  };

  const handlePaymentClose = () => {
    console.log('Payment closed or failed');
    setIsProcessing(false);
    setShowPaymentModal(false);
    toast({
      title: t('settings.billing.toasts.paymentFailedTitle'),
      description: t('settings.billing.toasts.paymentFailedDesc'),
      variant: 'destructive',
    });
  };

  const handleSelectPlan = async (planKey: string) => {
    if (!user) {
      navigate('/signup');
      return;
    }

    setSelectedPlan(planKey);
    setModalMode('subscribe');

    if (planKey === 'trial') {
      try {
        const resp = await fetch('/api/billing/start-trial', { method: 'POST' });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err?.message || 'Failed to start trial');
        }
        await resp.json();
        toast({
          title: t('settings.billing.toasts.trialStartedTitle'),
          description: t('settings.billing.toasts.trialStartedDesc'),
        });
        navigate('/dashboard');
      } catch (error) {
        console.error('Error starting trial:', error);
        toast({
          title: t('common.error'),
          description: t('settings.billing.toasts.trialErrorDesc'),
          variant: 'destructive',
        });
      }
      return;
    }

    setShowPaymentModal(true);
  };

  const initiatePayment = (email: string, savePaymentMethod?: boolean) => {
    if (!email && !user?.email) {
      toast({
        title: t('settings.billing.toasts.emailRequiredTitle'),
        description: t('settings.billing.toasts.emailRequiredDesc'),
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    const config = createPaymentConfig(email, savePaymentMethod);

    // Close our Dialog before launching Paystack to ensure no overlay blocks clicks
    setShowPaymentModal(false);

    // Defer initialization slightly so the overlay is unmounted first
    setTimeout(() => {
      try {
        // @ts-ignore - PaystackPop is globally available when the script is loaded
        if (!window.PaystackPop) {
          throw new Error('Payment library failed to load. Please refresh and try again.');
        }
        // @ts-ignore - PaystackPop is globally available when the script is loaded
        const paystack = new window.PaystackPop();
        paystack.newTransaction({
          ...config,
          onSuccess: handlePaymentSuccess,
          onClose: handlePaymentClose,
        });
      } catch (error) {
        console.error('Error initializing Paystack:', error);
        const fallbackDesc = 'Failed to initialize payment';
        const translated = t('settings.billing.toasts.paymentInitError');
        const description = translated === 'settings.billing.toasts.paymentInitError' ? fallbackDesc : translated || fallbackDesc;
        toast({ title: t('common.error'), description, variant: 'destructive' });
        setIsProcessing(false);
      }
    }, 200);
  };

  // New helper: open modal for a given plan without triggering trial logic
  const openPaymentModalForPlan = (planKey: string) => {
    setSelectedPlan(planKey);
    setModalMode('update');
    setIsProcessing(false);
    setShowPaymentModal(true);
  };

  const openPaymentModalForCardManagement = () => {
    setSelectedPlan(null);
    setModalMode('update');
    setIsProcessing(false);
    setShowPaymentModal(true);
  };

  const resetPaymentState = () => {
    setIsProcessing(false);
  };

  return {
    selectedPlan,
    showPaymentModal,
    isProcessing,
    handleSelectPlan,
    initiatePayment,
    setShowPaymentModal,
    openPaymentModalForPlan,
    openPaymentModalForCardManagement,
    modalMode,
    resetPaymentState,
  };
};
