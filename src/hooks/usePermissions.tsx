import { useAuth } from '@/hooks/useAuthHook';
import { hasReadPermission, hasWritePermission, isAdminRole } from '@/services/permissionService';

export const usePermissions = () => {
  const { user } = useAuth();
  
  const canAccessPage = (pageName: string): boolean => {
    // If no user is logged in, no access
    if (!user) return false;

    // Special override for Wilson Moabelo - always has access
    if (user.email === 'mokgethwamoabelo@gmail.com') return true;
    
    // Admin users always have access to all pages
    if (user.user_metadata.role && isAdminRole(user.user_metadata.role)) {
      return true;
    }
    
    // For non-admin users, check permissions
    return hasReadPermission(user.id, pageName);
  };
  
  const canEditPage = (pageName: string): boolean => {
    // If no user is logged in, no access
    if (!user) return false;

    // Special override for Wilson Moabelo - always has access
    if (user.email === 'mokgethwamoabelo@gmail.com') return true;
    
    // Admin users always have full edit rights
    if (user.user_metadata.role && isAdminRole(user.user_metadata.role)) {
      return true;
    }
    
    // For non-admin users, check permissions
    return hasWritePermission(user.id, pageName);
  };
  
  const isAdmin = (): boolean => {
    if (!user || !user.user_metadata || !user.user_metadata.role) {
      return false;
    }
    
    return isAdminRole(user.user_metadata.role);
  };
  
  return {
    canAccessPage,
    canEditPage,
    isAdmin
  };
};

export default usePermissions;
