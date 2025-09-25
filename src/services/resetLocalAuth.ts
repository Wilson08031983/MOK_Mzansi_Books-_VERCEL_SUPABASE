import { getAdminPermissions, saveUserPermissions } from "./permissionService";
import { safeLocalStorage } from '@/utils/safeAccess';

/**
 * Reset authentication and permissions data in localStorage
 * This allows for a fresh start with only the admin user
 */
export const resetLocalAuth = () => {
  // Clear all existing data
  window.localStorage.removeItem('userCredentials');
  safeLocalStorage.removeItem('userPermissions');
  safeLocalStorage.removeItem('mokUser');
  safeLocalStorage.removeItem('invites');

  // Create only admin user with full permissions
  const adminId = 'admin-' + Date.now();
  const adminPermissions = getAdminPermissions();

  // Store the permissions
  saveUserPermissions(adminId, adminPermissions);

  // Store only the admin user credentials
  const defaultCredentials = {
    [adminId]: {
      email: 'admin@mokmzansibooks.com',
      password: 'admin123',
      role: 'Manager',
      fullName: 'Admin User',
      permissions: adminPermissions
    }
  };

  window.localStorage.setItem('userCredentials', JSON.stringify(defaultCredentials));
  console.log('Local authentication reset with only Admin account');
};

// Export a function to run this from the browser
export const resetAndReload = () => {
  resetLocalAuth();
  window.location.reload();
};
