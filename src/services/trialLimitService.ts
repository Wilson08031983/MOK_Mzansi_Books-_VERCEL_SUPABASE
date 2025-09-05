import { supabase } from '@/integrations/supabase';

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

interface SubscriptionInfo {
  tier?: string;
  status?: string;
  plan_type?: string;
  plan?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  user_id: string;
}

interface ValidationResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  message?: string;
}

export class TrialLimitService {
  private static normalizeTier(subscription: SubscriptionInfo | null): string {
    if (!subscription) return 'free';
    const raw = (
      subscription.tier ||
      subscription.plan_type ||
      subscription.plan ||
      subscription.type ||
      subscription.status ||
      'free'
    )
      .toString()
      .toLowerCase();
    return raw;
  }

  private static isTrial(tier: string): boolean {
    return tier === 'trial' || tier === 'free' || tier === 'basic';
  }

  private static hasFullAccess(tier: string): boolean {
    return ['monthly', 'annual', 'premium', 'pro'].includes(tier);
  }

  /**
   * Get user's subscription information from database
   */
  static async getUserSubscription(userId: string): Promise<SubscriptionInfo | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.warn('No subscription found for user:', userId);
        return null;
      }

      return data as SubscriptionInfo;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  }

  /**
   * Get current count for a specific feature
   */
  private static async getCurrentCount(
    userId: string,
    limitKey: LimitKey
  ): Promise<number> {
    try {
      let tableName: string;
      let dateFilter = false;

      switch (limitKey) {
        case 'projects':
          tableName = 'projects';
          break;
        case 'clients':
          tableName = 'clients';
          break;
        case 'quotationsPerMonth':
          tableName = 'quotations';
          dateFilter = true;
          break;
        case 'invoicesPerMonth':
          tableName = 'invoices';
          dateFilter = true;
          break;
        case 'inventoryItems':
          tableName = 'inventory_items';
          break;
        case 'suppliers':
          tableName = 'suppliers';
          break;
        case 'storageLocations':
          tableName = 'storage_locations';
          break;
        default:
          throw new Error(`Unknown limit key: ${limitKey}`);
      }

      let query = supabase
        .from(tableName)
        .select('id', { count: 'exact' })
        .eq('user_id', userId);

      // For monthly limits, filter by current month
      if (dateFilter) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        query = query
          .gte('created_at', startOfMonth.toISOString())
          .lte('created_at', endOfMonth.toISOString());
      }

      const { count, error } = await query;

      if (error) {
        console.error(`Error counting ${tableName}:`, error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting current count:', error);
      return 0;
    }
  }

  /**
   * Validate if user can perform an action based on trial limits
   */
  static async validateTrialLimit(
    userId: string,
    limitKey: LimitKey
  ): Promise<ValidationResult> {
    try {
      // Get user's subscription
      const subscription = await this.getUserSubscription(userId);
      const tier = this.normalizeTier(subscription);

      // If user has full access, allow unlimited usage
      if (this.hasFullAccess(tier)) {
        return {
          allowed: true,
          currentCount: 0,
          limit: -1, // Unlimited
          message: 'Full access - unlimited usage'
        };
      }

      // For trial users, check limits
      if (this.isTrial(tier)) {
        const limit = TRIAL_LIMITS[limitKey];
        const currentCount = await this.getCurrentCount(userId, limitKey);

        const allowed = currentCount < limit;
        const message = allowed 
          ? `Usage: ${currentCount}/${limit}` 
          : `Trial limit reached: ${currentCount}/${limit}. Upgrade to continue.`;

        return {
          allowed,
          currentCount,
          limit,
          message
        };
      }

      // Default to allowing for unknown tiers
      return {
        allowed: true,
        currentCount: 0,
        limit: -1,
        message: 'Unknown tier - allowing access'
      };
    } catch (error) {
      console.error('Error validating trial limit:', error);
      // In case of error, allow access to prevent blocking users
      return {
        allowed: true,
        currentCount: 0,
        limit: -1,
        message: 'Validation error - allowing access'
      };
    }
  }

  /**
   * Get all current usage counts for a user
   */
  static async getUserUsage(userId: string): Promise<Record<LimitKey, number>> {
    const usage: Record<LimitKey, number> = {} as Record<LimitKey, number>;
    
    for (const limitKey of Object.keys(TRIAL_LIMITS) as LimitKey[]) {
      usage[limitKey] = await this.getCurrentCount(userId, limitKey);
    }
    
    return usage;
  }

  /**
   * Get trial limits configuration
   */
  static getTrialLimits(): Record<LimitKey, number> {
    return { ...TRIAL_LIMITS };
  }
}

export default TrialLimitService;