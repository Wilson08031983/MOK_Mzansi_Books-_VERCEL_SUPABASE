
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuthHook';

// Centralized definition of feature limits for the trial tier
export type LimitKey =
  | 'projects'
  | 'clients'
  | 'quotationsPerMonth'
  | 'invoicesPerMonth'
  | 'inventoryItems'
  | 'suppliers'
  | 'storageLocations';

const TRIAL_LIMITS: Record<LimitKey, number> = {
  projects: 5,
  clients: 5,
  quotationsPerMonth: 5,
  invoicesPerMonth: 5,
  inventoryItems: 5,
  suppliers: 5,
  storageLocations: 5,
};

interface SubscriptionInfoLike {
  tier?: string;
  status?: string;
  plan_type?: string;
  plan?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  [key: string]: any;
}

const readSubscription = (): SubscriptionInfoLike | null => {
  try {
    const raw = localStorage.getItem('mokSubscription');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const normalizeTier = (info: SubscriptionInfoLike | null): string => {
  if (!info) return 'free';
  const raw = (
    info.tier ||
    info.plan_type ||
    info.plan ||
    info.type ||
    info.status ||
    'free'
  )
    .toString()
    .toLowerCase();
  return raw;
};

const calcDaysLeft = (info: SubscriptionInfoLike | null): number | null => {
  if (!info?.end_date) return null;
  const now = Date.now();
  const end = new Date(info.end_date).getTime();
  if (isNaN(end)) return null;
  const diffMs = end - now;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const useSubscriptionAccess = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<string>('free');
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    // Simulate async readiness (in real app this could be a network call)
    const check = async () => {
      try {
        const info = readSubscription();
        setTier(normalizeTier(info));
        setDaysLeft(calcDaysLeft(info));
      } catch (e) {
        // Fall back to limited if anything goes wrong
        setTier('free');
        setDaysLeft(null);
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      // Not logged in -> treat as limited to avoid locking UI
      setTier('free');
      setDaysLeft(null);
      setLoading(false);
      return;
    }

    check();
  }, [user]);

  // Decide access level from normalized tier
  const isTrial = useMemo(() => tier === 'trial' || tier === 'free' || tier === 'basic', [tier]);
  const hasFullAccess = useMemo(() => !isTrial && ['monthly', 'annual', 'premium', 'pro'].includes(tier), [isTrial, tier]);
  const hasLimitedAccess = true; // App remains usable in limited mode for all tiers

  const accessLevel: 'full' | 'limited' = hasFullAccess ? 'full' : 'limited';

  // Expose standard limits and a helper
  const limits = TRIAL_LIMITS;
  const getLimit = (key: LimitKey) => limits[key];

  // Lock UI if subscription exists with a past end_date
  const locked = useMemo(() => {
    if (!user) return false; // don't lock for signed-out view
    if (daysLeft === null) return false; // no end date specified
    return daysLeft <= 0 && !hasFullAccess;
  }, [user, daysLeft, hasFullAccess]);

  return {
    // Backward-compatible fields used by AccessGuard and others
    accessLevel,
    loading,
    hasFullAccess,
    hasLimitedAccess,

    // New helpers for gating
    tier,
    isTrial,
    limits,
    getLimit,

    // New fields for UI/billing engine
    daysLeft,
    locked,
  } as const;
};
