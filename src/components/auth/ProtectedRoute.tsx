import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthHook';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  pageName: string;
  requiresAuthentication?: boolean;
}

/**
 * Protected Route Component
 * Ensures the user has appropriate permissions to access a page
 * Redirects to login page if not authenticated
 * Redirects to dashboard if authenticated but lacking permissions
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  pageName,
  requiresAuthentication = true
}) => {
  const { user } = useAuth();
  const { canAccessPage, isAdmin } = usePermissions();
  const location = useLocation();
  const { toast } = useToast();
  
  // Always allow access to Dashboard
  const isDashboard = pageName === 'Dashboard';
  
  // Check if user is logged in
  if (requiresAuthentication && !user) {
    // Redirect to login page
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Check page permissions (admins always have access, Dashboard is always accessible)
  if (user && !isDashboard && !isAdmin() && !canAccessPage(pageName)) {
    // Show access denied toast
    toast({
      title: "Access Denied",
      description: `You don't have permission to access ${pageName}.`,
      variant: "destructive"
    });
    
    // Redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  // User has permission or the page doesn't require authentication
  return <Outlet />;
};

export default ProtectedRoute;
