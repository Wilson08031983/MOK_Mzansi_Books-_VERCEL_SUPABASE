
import { useEffect, useMemo, useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

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

const toDate = (val: any): Date | null => {
  if (!val) return null;
  try {
    if (val instanceof Date) return val;
    if (typeof val === 'string') return new Date(val);
    return null;
  } catch {
    return null;
  }
};

export const useSubscriptionAccess = () => {
  const { subscription, loading } = useSubscription();
  const [tier, setTier] = useState<string>('trial');
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const t = (subscription?.tier || 'trial').toString().toLowerCase();
    setTier(t);

    const end = toDate(subscription?.currentPeriodEnd);
    if (end) {
      const year = end.getFullYear();
      if (year < 2099 && year >= 2000) {
        const diffMs = end.getTime() - Date.now();
        setDaysLeft(Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      } else {
        setDaysLeft(null);
      }
    } else {
      setDaysLeft(null);
    }
  }, [subscription?.tier, subscription?.currentPeriodEnd]);

  const status = (subscription?.status || 'trial').toString().toLowerCase();

  // Decide access level from normalized tier + status
  const isTrial = useMemo(() => status === 'trial' || status === 'trialing' || tier === 'trial', [status, tier]);
  const hasFullAccess = useMemo(() => {
    const paidTier = ['monthly', 'annual', 'premium', 'pro'].includes(tier);
    return paidTier && status === 'active';
  }, [tier, status]);
  const hasLimitedAccess = true; // App remains usable in limited mode for all tiers

  const accessLevel: 'full' | 'limited' = hasFullAccess ? 'full' : 'limited';

  // Expose standard limits and a helper
  const limits = TRIAL_LIMITS;
  const getLimit = (key: LimitKey) => limits[key];

  // Lock UI if subscription exists with a past end_date
  const locked = useMemo(() => {
    if (daysLeft === null) return false; // no end date specified or sentinel filtered out
    return daysLeft <= 0 && !hasFullAccess;
  }, [daysLeft, hasFullAccess]);

  // New: grace period support
  const graceEnd = useMemo(() => {
    return toDate((subscription as any)?.graceEnd);
  }, [subscription?.graceEnd]);

  const isInGrace = useMemo(() => {
    if (status !== 'past_due') return false;
    if (!graceEnd) return false;
    return Date.now() <= graceEnd.getTime();
  }, [status, graceEnd]);

  const graceDaysLeft = useMemo(() => {
    if (!graceEnd) return null;
    const diffMs = graceEnd.getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, [graceEnd]);

  // Override lock during grace: keep app unlocked while in grace
  const finalLocked = useMemo(() => {
    if (isInGrace) return false;
    return locked;
  }, [isInGrace, locked]);

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
    locked: finalLocked,
    // Grace fields
    isInGrace,
    graceEnd,
    graceDaysLeft,
  } as const;
};
