import { useState, useEffect } from 'react';
import { useAuth } from './useAuthHook';

interface SubscriptionAccessHook {
  hasFullAccess: boolean;
  hasLimitedAccess: boolean;
  loading: boolean;
}

export const useSubscriptionAccess = (): SubscriptionAccessHook => {
  const { user } = useAuth();
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [hasLimitedAccess, setHasLimitedAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!user) {
        setHasFullAccess(false);
        setHasLimitedAccess(false);
        setLoading(false);
        return;
      }

      try {
        // Check if we have subscription info in localStorage
        const subscriptionData = localStorage.getItem('mokSubscription');
        
        if (subscriptionData) {
          const { tier } = JSON.parse(subscriptionData);
          setHasFullAccess(tier === 'premium');
          setHasLimitedAccess(tier === 'basic' || tier === 'premium');
        } else {
          // Default to giving access in development environment
          console.log('No subscription found, defaulting to basic access');
          setHasFullAccess(false);
          setHasLimitedAccess(true);
          
          // Store a default subscription
          localStorage.setItem('mokSubscription', JSON.stringify({
            tier: 'basic',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }));
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasFullAccess(false);
        setHasLimitedAccess(true); // Default to limited access to avoid blocking UI
      } finally {
        setLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, [user]);

  return { hasFullAccess, hasLimitedAccess, loading };
};
