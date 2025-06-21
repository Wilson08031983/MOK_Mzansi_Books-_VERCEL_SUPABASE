
import { useState, useEffect } from 'react';
import { useAuth } from './useAuthHook';

export const useSubscriptionAccess = () => {
  const { user } = useAuth();
  const [accessLevel, setAccessLevel] = useState<'full' | 'limited' | 'loading'>('loading');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkAccess();
    } else {
      setAccessLevel('limited');
      setLoading(false);
    }
  }, [user]);

  const checkAccess = async () => {
    try {
      // For development, always provide full access
      setAccessLevel('full');
    } catch (error) {
      console.error('Error checking subscription access:', error);
      setAccessLevel('limited');
    } finally {
      setLoading(false);
    }
  };

  const hasFullAccess = accessLevel === 'full';
  const hasLimitedAccess = accessLevel === 'limited';

  return {
    accessLevel,
    loading,
    hasFullAccess,
    hasLimitedAccess,
    refetch: checkAccess
  };
};
