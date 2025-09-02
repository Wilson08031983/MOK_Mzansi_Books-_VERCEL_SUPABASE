import { useAuth } from '@/hooks/useAuthHook';
import { hasReadPermission, hasWritePermission, isAdminRole, ALWAYS_ACCESSIBLE_PAGES } from '@/services/permissionService';
import { useSubscription } from '@/hooks/useSubscription';

export const usePermissions = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  
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

  const hasValidSubscription = () => {
    if (!subscription) return false;
    return subscription.status === 'active' || subscription.status === 'trialing';
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
