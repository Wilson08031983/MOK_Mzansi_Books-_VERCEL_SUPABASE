import { getAdminPermissions, saveUserPermissions } from "./permissionService";
import { v4 as uuidv4 } from 'uuid';
import { safeLocalStorage, safeString } from '@/utils/safeAccess';

// Import the UserCredentials type from localAuthService
export interface UserCredentials {
  email: string;
  password: string;
  role?: string;
  permissions?: Record<string, unknown>;
  fullName?: string;
  isDefaultAdmin?: boolean;
}

/**
 * Reset authentication and permissions data in localStorage
 * This allows for a fresh start with properly configured test accounts
 * Ensures Wilson Moabelo's account is properly set up as CEO with full admin access
 */
export const resetLocalAuth = () => {
  // Only remove other data but preserve Wilson's account if it exists
  const existingCredentials = window.localStorage.getItem('userCredentials');
  let wilsonAccount = null;
  
  if (existingCredentials) {
    const credentials = JSON.parse(existingCredentials) as Record<string, UserCredentials>;
    // Find Wilson's account if it exists
    Object.entries(credentials).forEach(([id, cred]: [string, UserCredentials]) => {
      if (safeString(cred.email) === 'mokgethwamoabelo@gmail.com') {
        wilsonAccount = { id, ...cred };
      }
    });
  }
  
  // Clear all existing data
  window.localStorage.removeItem('userCredentials');
  safeLocalStorage.removeItem('userPermissions');
  safeLocalStorage.removeItem('mokUser');
  safeLocalStorage.removeItem('invites');

  // Create admin user with full permissions
  const adminId = 'admin-' + Date.now();
  const adminPermissions = getAdminPermissions();
  
  // Create Wilson Moabelo's account with full access (use existing ID if available)
  const wilsonId = wilsonAccount ? wilsonAccount.id : 'wilson-' + uuidv4();
  const wilsonPermissions = getAdminPermissions();
  
  // Store the permissions
  saveUserPermissions(adminId, adminPermissions);
  saveUserPermissions(wilsonId, wilsonPermissions);
  
  // Store the user credentials
  const defaultCredentials = {
    [adminId]: {
      email: 'admin@mokmzansibooks.com',
      password: 'admin123',
      role: 'Manager',
      fullName: 'Admin User',
      permissions: adminPermissions
    },
    [wilsonId]: {
      email: 'mokgethwamoabelo@gmail.com',
      password: 'Ka!gi#so123J',
      role: 'CEO',
      fullName: 'Wilson Moabelo',
      permissions: wilsonPermissions,
      isDefaultAdmin: true  // Special flag to identify this as a permanent admin account
    },
    'trial-user': {
      email: 'trial@mokmzansibooks.com',
      password: 'trial123',
      fullName: 'Trial User',
      role: 'Staff',
      permissions: {
        dashboard: { read: true, write: false, delete: false },
        clients: { read: true, write: false, delete: false },
        quotations: { read: true, write: false, delete: false },
        invoices: { read: true, write: false, delete: false },
        inventory: { read: true, write: false, delete: false },
        projects: { read: true, write: false, delete: false },
        hrManagement: { read: false, write: false, delete: false },
        accounting: { read: false, write: false, delete: false },
        reports: { read: true, write: false, delete: false },
        settings: { read: false, write: false, delete: false },
        company: { read: false, write: false, delete: false }
      }
    }
  };
  
  window.localStorage.setItem('userCredentials', JSON.stringify(defaultCredentials));
  console.log('Local authentication reset with Admin and Wilson accounts');
};

// Export a function to run this from the browser
export const resetAndReload = () => {
  resetLocalAuth();
  window.location.reload();
};
