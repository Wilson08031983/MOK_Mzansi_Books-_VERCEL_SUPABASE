import { useAuth } from '@/hooks/useAuthHook';
import { hasReadPermission, hasWritePermission, isAdminRole, ALWAYS_ACCESSIBLE_PAGES } from '@/services/permissionService';
import { useSubscription } from '@/hooks/useSubscription';

export const usePermissions = () => {
  const { user } = useAuth();
  const { subscription, loading } = useSubscription();
  
  // Helper function to get user role from either location
  const getUserRole = () => {
    if (!user) return null;
    
    // Check for role in user_metadata first (Supabase style)
    if (user.user_metadata?.role) {
      return user.user_metadata.role;
    }
    
    // Check for role at root level (Mock auth style)
    if ((user as any).role) {
      return (user as any).role;
    }
    
    return null;
  };

  // Fallback: read local active/trial state for current user (used during initial loading)
  const getLocalActive = (): boolean => {
    try {
      if (!user) return false;
      const email = (user as any)?.email?.toLowerCase?.() || '';
      const raw = JSON.parse(localStorage.getItem('mokSubscription') || '{}');
      const ownerOk = (raw?.ownerEmail?.toLowerCase?.() === email) || (email === 'admin@mokmzansibooks.com');
      const endStr = raw?.end_date || raw?.validUntil;
      const end = endStr ? new Date(endStr) : new Date(0);
      const status = (raw?.status || '').toString().toLowerCase();
      const activeStatuses = ['active', 'trial', 'trialing', 'past_due'];
      return ownerOk && activeStatuses.includes(status) && end.getTime() > Date.now();
    } catch {
      return false;
    }
  };

  const hasValidSubscription = () => {
    // While subscription is loading, avoid transient locks by allowing access optimistically
    if (loading) {
      // Prefer a user-scoped local snapshot when available
      const localOk = getLocalActive();
      return localOk || true; // optimistic to prevent 5s padlock flicker post-payment
    }

    // If we have no subscription object (unexpected), consult localStorage
    if (!subscription) return getLocalActive();

    // Allow full navigation during active subscription, during trial, and during grace (past_due)
    return (
      subscription.status === 'active' ||
      subscription.status === 'trial' ||
      subscription.status === 'trialing' ||
      subscription.status === 'past_due' // treat grace period as valid access
    );
  };
  
  const canAccessPage = (pageName: string): boolean => {
    // If no user is logged in, no access
    if (!user) return false;

    // Always allow access to certain pages regardless of subscription
    if (ALWAYS_ACCESSIBLE_PAGES.includes(pageName) || pageName === 'Settings') {
      return true;
    }

    // Check subscription status first
    if (!hasValidSubscription()) {
      return false;
    }
    
    // Get user role from either location
    const userRole = getUserRole();
    
    // Admin users always have access to all pages
    if (userRole && isAdminRole(userRole)) {
      return true;
    }
    
    // For non-admin users, check permissions
    return hasReadPermission(user.id, pageName);
  };
  
  const canEditPage = (pageName: string): boolean => {
    // If no user is logged in, no access
    if (!user) return false;

    // Check subscription status first
    if (!hasValidSubscription()) {
      return false;
    }
    
    // Get user role from either location
    const userRole = getUserRole();
    
    // Admin users always have full edit rights
    if (userRole && isAdminRole(userRole)) {
      return true;
    }
    
    // For non-admin users, check permissions
    return hasWritePermission(user.id, pageName);
  };
  
  const isAdmin = (): boolean => {
    const userRole = getUserRole();
    return userRole ? isAdminRole(userRole) : false;
  };
  
  return {
    canAccessPage,
    canEditPage,
    isAdmin
  };
};

export default usePermissions;
