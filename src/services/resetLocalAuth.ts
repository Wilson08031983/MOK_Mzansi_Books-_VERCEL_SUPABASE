import { getAdminPermissions, getDefaultPermissions, saveUserPermissions } from "./permissionService";
import { v4 as uuidv4 } from 'uuid';

// Import the UserCredentials type from localAuthService
interface UserCredentials {
  email: string;
  password: string;
  role?: string;
  permissions?: any;
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
  const existingCredentials = localStorage.getItem('userCredentials');
  let wilsonAccount = null;
  
  if (existingCredentials) {
    const credentials = JSON.parse(existingCredentials);
    // Find Wilson's account if it exists
    Object.entries(credentials).forEach(([id, cred]: [string, UserCredentials]) => {
      if (cred.email === 'mokgethwamoabelo@gmail.com') {
        wilsonAccount = { id, ...cred };
      }
    });
  }
  
  // Clear all existing data
  localStorage.removeItem('userCredentials');
  localStorage.removeItem('userPermissions');
  localStorage.removeItem('mokUser');
  localStorage.removeItem('invites');

  // Create admin user with full permissions
  const adminId = 'admin-' + Date.now();
  const adminPermissions = getAdminPermissions();
  
  // Create Wilson Moabelo's account with full access (use existing ID if available)
  const wilsonId = wilsonAccount ? wilsonAccount.id : 'wilson-' + uuidv4();
  const wilsonPermissions = getAdminPermissions();
  
  // Create regular user with basic permissions
  const userId = 'user-' + Date.now();
  const userPermissions = getDefaultPermissions();
  // Add some basic permissions for regular user
  userPermissions['Clients'] = { read: true, write: false };
  userPermissions['Quotations'] = { read: true, write: false };
  userPermissions['Invoices'] = { read: true, write: false };
  
  // Store the permissions
  saveUserPermissions(adminId, adminPermissions);
  saveUserPermissions(wilsonId, wilsonPermissions);
  saveUserPermissions(userId, userPermissions);
  
  // Store the user credentials
  const credentials = {
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
    [userId]: {
      email: 'user@mokmzansibooks.com',
      password: 'user123',
      role: 'Staff',
      fullName: 'Regular User',
      permissions: userPermissions
    }
  };
  
  localStorage.setItem('userCredentials', JSON.stringify(credentials));
  console.log('Local authentication reset with admin and user accounts');
};

// Export a function to run this from the browser
export const resetAndReload = () => {
  resetLocalAuth();
  window.location.reload();
};
