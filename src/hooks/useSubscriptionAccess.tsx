import { useState, useEffect } from 'react';
import { useAuth } from './useAuthHook';

interface SubscriptionAccessHook {
  hasFullAccess: boolean;
  hasLimitedAccess: boolean;
  loading: boolean;
}

// Helper to read the current tier synchronously to avoid initial UI flicker
const getInitialTier = (): string | null => {
  try {
    const data = localStorage.getItem('mokSubscription');
    if (!data) return null;
    const parsed = JSON.parse(data);
    return parsed?.tier ?? null;
  } catch {
    return null;
  }
};

export const useSubscriptionAccess = (): SubscriptionAccessHook => {
  const { user } = useAuth();

  const initialTier = getInitialTier();
  const [hasFullAccess, setHasFullAccess] = useState<boolean>(initialTier === 'premium');
  const [hasLimitedAccess, setHasLimitedAccess] = useState<boolean>(
    initialTier === 'basic' || initialTier === 'premium' || initialTier === 'trial'
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      // Start loading only for async verification stage
      setLoading(true);

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
          setHasLimitedAccess(tier === 'basic' || tier === 'premium' || tier === 'trial');
        } else {
          // Default to giving access in development environment while persisting owner context
          console.log('No subscription found, defaulting to basic access');
          setHasFullAccess(false);
          setHasLimitedAccess(true);
          
          // Store a default subscription snapshot, including owner context to prevent resets
          const ownerEmail = (user?.email || '').toLowerCase();
          const userId = user?.id;
          localStorage.setItem('mokSubscription', JSON.stringify({
            tier: 'basic',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            ownerEmail,
            userId,
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
