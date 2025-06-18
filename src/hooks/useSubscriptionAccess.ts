
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
      const { data, error } = await supabase
        .rpc('check_subscription_access', { user_uuid: user?.id });

      if (error) {
        console.error('Error checking subscription access:', error);
        setAccessLevel('limited');
      } else {
        setAccessLevel(data === 'full' ? 'full' : 'limited');
      }
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
