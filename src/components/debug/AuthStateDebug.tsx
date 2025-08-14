import React from 'react';
import { useAuth } from '@/hooks/useAuthHook';
import { usePermissions } from '@/hooks/usePermissions';
import { isAdminRole } from '@/services/permissionService';

const AuthStateDebug: React.FC = () => {
  const { user } = useAuth();
  const { canAccessPage, isAdmin } = usePermissions();

  const debugInfo = {
    user: user ? {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
      role_at_root: (user as any).role,
      role_in_metadata: user.user_metadata?.role
    } : null,
    localStorage: {
      mokUser: localStorage.getItem('mokUser'),
      currentUser: localStorage.getItem('currentUser'),
      userCredentials: localStorage.getItem('userCredentials')
    },
    permissions: {
      isAdmin: isAdmin(),
      canAccessCompany: canAccessPage('My Company'),
      canAccessClients: canAccessPage('Clients'),
      canAccessQuotations: canAccessPage('Quotations'),
      canAccessInvoices: canAccessPage('Invoices'),
      canAccessProjects: canAccessPage('Projects'),
      canAccessInventory: canAccessPage('Inventory'),
      canAccessHR: canAccessPage('HR Management'),
      canAccessAccounting: canAccessPage('Accounting'),
      canAccessSettings: canAccessPage('Settings')
    }
  };

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

  const userRole = getUserRole();
  const isUserAdmin = userRole ? isAdminRole(userRole) : false;

  return (
    <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg max-w-md max-h-96 overflow-auto text-xs">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      
      <div className="mb-2">
        <strong>User Role Detection:</strong>
        <div>Role from metadata: {user?.user_metadata?.role || 'null'}</div>
        <div>Role from root: {(user as any)?.role || 'null'}</div>
        <div>Final role: {userRole || 'null'}</div>
        <div>Is Admin Role: {isUserAdmin ? 'YES' : 'NO'}</div>
        <div>Permission isAdmin(): {isAdmin() ? 'YES' : 'NO'}</div>
      </div>

      <div className="mb-2">
        <strong>Page Access:</strong>
        {Object.entries(debugInfo.permissions).map(([page, access]) => (
          <div key={page}>{page}: {access ? 'YES' : 'NO'}</div>
        ))}
      </div>

      <details className="mb-2">
        <summary className="cursor-pointer font-semibold">Full Debug Data</summary>
        <pre className="mt-2 text-xs overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </details>

      <button 
        onClick={() => {
          console.log('=== AUTH DEBUG INFO ===');
          console.log('User object:', user);
          console.log('User role (detected):', userRole);
          console.log('Is admin role:', isUserAdmin);
          console.log('Permission isAdmin():', isAdmin());
          console.log('Full debug info:', debugInfo);
          console.log('========================');
        }}
        className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
      >
        Log to Console
      </button>
    </div>
  );
};

export default AuthStateDebug;