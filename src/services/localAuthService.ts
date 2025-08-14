// Local authentication service to handle user authentication and role-based access
// without requiring Supabase cloud connection
import { getDefaultPermissions, getAdminPermissions, UserPermissions } from './permissionService';

// Define user roles and types
export type UserRole = 'CEO' | 'Manager' | 'Bookkeeper' | 'Director' | 'Founder' | 'Staff';
const ADMIN_ROLES: UserRole[] = ['CEO', 'Manager', 'Bookkeeper', 'Director', 'Founder'];

// Type for stored user credentials
interface StoredUserCredential {
  email: string;
  password: string;
  fullName?: string;
  role: UserRole;
  permissions?: UserPermissions;
}

type StoredCredentials = Record<string, StoredUserCredential>;

// Type for user data returned by the auth service
export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
  permissions?: UserPermissions;
  user_metadata?: {
    role: string;
    first_name: string;
    last_name: string;
    company_name: string;
    phone: string;
  };
}

// Helper functions
const safeGet = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error accessing localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const safeSet = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

// Helper function for safe string handling
const safeString = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

// Helper function for safe localStorage access
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting localStorage key "${key}":`, error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }
};

// Check if a role is an admin role
export const isAdminRole = (role: string): boolean => {
  return ADMIN_ROLES.includes(role as UserRole);
};

// Save user permissions to localStorage
const saveUserPermissions = (userId: string, permissions: UserPermissions): void => {
  try {
    const permissionsKey = `user_permissions_${userId}`;
    localStorage.setItem(permissionsKey, JSON.stringify(permissions));
  } catch (error) {
    console.error('Error saving user permissions:', error);
  }
};

// Type guard for user role
const isUserRole = (role: string): role is UserRole => {
  return [...ADMIN_ROLES, 'Staff'].includes(role as UserRole);
};

// Initialize with default admin and regular users if no users exist
export const initializeDefaultUsers = (): void => {
  const credentials = safeGet<StoredCredentials>('userCredentials', {});
  
  if (Object.keys(credentials).length === 0) {
    // Create default admin user
    const adminUser: StoredUserCredential = {
      email: 'admin@mokmzansibooks.com',
      password: 'admin123',
      fullName: 'Admin User',
      role: 'Manager',
      permissions: getAdminPermissions()
    };
    
    credentials['default-admin'] = adminUser;
    safeSet<StoredCredentials>('userCredentials', credentials);
  } else {
    // Check for and add admin user if it doesn't exist
    let adminExists = false;
    
    // Check if admin exists
    Object.values(credentials).forEach(user => {
      if (user.email === 'admin@mokmzansibooks.com') adminExists = true;
    });
    
    // Add admin if not exists
    if (!adminExists) {
      const adminUser: StoredUserCredential = {
        email: 'admin@mokmzansibooks.com',
        password: 'admin123',
        fullName: 'Admin User',
        role: 'Manager',
        permissions: getAdminPermissions()
      };
      credentials['default-admin'] = adminUser;
      safeSet<StoredCredentials>('userCredentials', credentials);
    }
  }
};

// Initialize auth system
export const initializeAuth = (): void => {
  // Initialize default users
  initializeDefaultUsers();
};

// Authenticate user with email and password
export const authenticateUser = async (
  email: string, 
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    if (!email || !password) {
      return { user: null, error: 'Email and password are required' };
    }
    
    const credentials = safeGet<StoredCredentials>('userCredentials', {});
    
    // Find user with matching email (case insensitive)
    const userEntry = Object.entries(credentials).find(
      ([_, cred]) => cred.email.toLowerCase() === email.toLowerCase()
    );
    
    if (!userEntry) {
      return { user: null, error: 'Invalid email or password' };
    }
    
    const [userId, userCred] = userEntry;
    
    // Verify password
    if (userCred.password !== password) {
      return { user: null, error: 'Invalid email or password' };
    }
    
    // Create user object
    const user: AuthUser = {
      id: userId,
      email: userCred.email,
      fullName: userCred.fullName,
      role: userCred.role,
      permissions: userCred.permissions,
      user_metadata: {
        role: userCred.role,
        first_name: userCred.fullName?.split(' ')[0] || '',
        last_name: userCred.fullName?.split(' ').slice(1).join(' ') || '',
        company_name: 'MOK Mzansi Books',
        phone: ''
      }
    };
    
    // Store current user in localStorage
    safeSet('currentUser', user);
    
    return { user, error: null };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return { user: null, error: 'Authentication failed' };
  }
};

// Get current authenticated user
export const getCurrentUser = (): AuthUser | null => {
  const userJson = localStorage.getItem('currentUser');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as AuthUser;
  } catch (error) {
    console.error('Error parsing current user:', error);
    return null;
  }
};

// Sign out current user
export const signOut = (): void => {
  try {
    localStorage.removeItem('currentUser');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

// Check if user has admin role
export const isAdmin = (user: AuthUser | null): boolean => {
  if (!user) return false;
  return ADMIN_ROLES.includes(user.role);
};

// Add a new user with specified credentials
export const addUser = (
  email: string,
  password: string,
  role: UserRole,
  fullName?: string,
  permissions?: UserPermissions
): { success: boolean; error?: string } => {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  if (!isUserRole(role)) {
    return { success: false, error: 'Invalid user role' };
  }

  const credentials = safeGet<StoredCredentials>('userCredentials', {});
  
  // Check if email already exists
  const emailExists = Object.values(credentials).some(
    cred => cred.email.toLowerCase() === email.toLowerCase()
  );

  if (emailExists) {
    return { success: false, error: 'Email already exists' };
  }

  // Generate a unique ID
  const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Create user with provided role and permissions
  const userPermissions = permissions || 
    (isAdminRole(role) ? getAdminPermissions() : getDefaultPermissions());
  
  const newUser: StoredUserCredential = {
    email,
    password,
    fullName,
    role,
    permissions: userPermissions
  };
  
  credentials[userId] = newUser;
  safeSet<StoredCredentials>('userCredentials', credentials);
  
  return { success: true };
};

// Verify if user has admin permission
export const verifyAdminPermission = async (email: string, password: string): Promise<boolean> => {
  const result = await authenticateUser(email, password);
  if (!result.user) return false;
  
  return ADMIN_ROLES.includes(result.user.role);
};

// Initialize with some default users for testing if none exist
export const initializeLocalAuth = (): void => {
  const credentials = safeGet<StoredCredentials>('userCredentials', {});
  
  if (Object.keys(credentials).length === 0) {
    // Create default admin user
    const adminUser: StoredUserCredential = {
      email: 'admin@mokmzansibooks.com',
      password: 'admin123',
      fullName: 'Admin User',
      role: 'Manager',
      permissions: getAdminPermissions()
    };
    
    // Create default regular user
    const regularUser: StoredUserCredential = {
      email: 'user@mokmzansibooks.com',
      password: 'user123',
      fullName: 'Regular User',
      role: 'Staff',
      permissions: getDefaultPermissions()
    };
    
    credentials['admin-user'] = adminUser;
    credentials['regular-user'] = regularUser;
    
    safeSet<StoredCredentials>('userCredentials', credentials);
    
    console.log('Initialized local auth with default users');
  }
};

// Helper function to reset auth state (for testing)
export const resetAuthState = (): void => {
  try {
    localStorage.removeItem('userCredentials');
    localStorage.removeItem('currentUser');
    console.log('Auth state reset successfully');
  } catch (error) {
    console.error('Error resetting auth state:', error);
  }
};

// Add a new user with specified credentials
export const addNewUser = (email: string, password: string, role: string): { success: boolean; error?: string } => {
  try {
    const safeEmail = safeString(email);
    const safePassword = safeString(password);
    const safeRole = safeString(role);
    
    if (!isUserRole(safeRole)) {
      return { success: false, error: 'Invalid user role' };
    }
    
    const credentials = safeGet<StoredCredentials>('userCredentials', {});
    
    // Check if email already exists
    const existingUser = Object.values(credentials).find(cred => cred.email === safeEmail);
    if (existingUser) {
      return { success: false, error: 'A user with this email already exists.' };
    }
    
    // Generate a new user ID
    const userId = `user${Date.now()}`;
    
    // Add new user
    const userPermissions = isAdminRole(safeRole) ? getAdminPermissions() : getDefaultPermissions();
    
    const newCredentials: StoredUserCredential = {
      email: safeEmail,
      password: safePassword,
      role: safeRole as UserRole,
      permissions: userPermissions
    };
    
    // Save updated credentials
    credentials[userId] = newCredentials;
    safeSet<StoredCredentials>('userCredentials', credentials);
    
    return { success: true };
  } catch (error) {
    console.error('Error adding new user:', error);
    return { success: false, error: 'Failed to add new user' };
  }
};

// Get all team members (excluding sensitive data like passwords)
export const getAllTeamMembers = () => {
  try {
    const credentials = safeGet<StoredCredentials>('userCredentials', {});
    
    // Transform credentials into team members array without passwords
    return Object.entries(credentials).map(([id, user]) => {
      const role: UserRole = isUserRole(user.role) ? user.role : 'Staff';
      return {
        id,
        email: user.email,
        fullName: user.fullName || user.email.split('@')[0],
        role,
        isAdmin: isAdminRole(role)
      };
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
};

// Ensure that Wilson's account is properly set up as CEO with all admin privileges
export const ensureWilsonHasCEOAccess = () => {
  try {
    const credentials = safeGet<StoredCredentials>('userCredentials', {});
    let wilsonFound = false;
    let wilsonId = '';
    
    // Check if Wilson's account exists
    Object.entries(credentials).forEach(([id, cred]) => {
      if (safeString(cred?.email) === 'mokgethwamoabelo@gmail.com') {
        wilsonFound = true;
        wilsonId = id;
        
        // Make sure the account has CEO role and admin access
        credentials[id] = {
          ...cred,
          role: 'CEO',
          password: 'Ka!gi#so123J', // Ensure password is correct
          permissions: getAdminPermissions()
        };
      }
    });
    
    // If Wilson's account was found and updated, save the changes
    if (wilsonFound) {
      safeSet<StoredCredentials>('userCredentials', credentials);
      
      // Also update permissions storage
      const permissions = getAdminPermissions();
      saveUserPermissions(wilsonId, permissions);
    }
  } catch (error) {
    console.error('Error ensuring Wilson has CEO access:', error);
  }
};

// Get user credentials by email and password
export const getUserCredentialsByEmail = (email: string, password: string): { success: boolean; user?: AuthUser; error?: string } => {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }
  try {
    console.log('getUserCredentialsByEmail called with:', { email, password });
    
    const safeEmail = email?.toLowerCase().trim();
    console.log('Processed email:', safeEmail);
    
    // Get stored credentials from localStorage
    const storedCredentials: StoredCredentials = safeGet<StoredCredentials>('userCredentials', {});
    console.log('Stored credentials:', storedCredentials);
    
    if (!storedCredentials || Object.keys(storedCredentials).length === 0) {
      console.error('No user credentials found in localStorage');
      return { success: false, error: 'No users found' };
    }
    
    // Find user with matching email (case insensitive)
    const userEntry = Object.entries(storedCredentials).find(
      ([_, cred]) => cred?.email?.toLowerCase() === safeEmail
    );
    
    console.log('Found user entry:', userEntry ? 'User found' : 'No user found');
    
    if (!userEntry) {
      console.error('No user found with email:', email);
      return { success: false, error: 'Invalid email or password' };
    }
    
    const [userId, userCreds] = userEntry;
    
    // Verify password (exact match)
    if (userCreds.password !== password) {
      console.error('Invalid password for email:', email);
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Return user data with proper typing
    const userData: AuthUser = {
      id: userId,
      email: userCreds.email,
      fullName: userCreds.fullName,
      role: (userCreds.role as UserRole) || 'Staff',
      permissions: userCreds.permissions || {}
    };
    
    console.log('Returning authenticated user:', userData);
    return { 
      success: true, 
      user: userData
    };
  } catch (error) {
    console.error('Error retrieving user credentials:', error);
    return { success: false, error: 'Authentication failed' };
  }
};

// Delete a user by ID
export const deleteUser = (userId: string): { success: boolean; error?: string } => {
  try {
    const safeUserId = safeString(userId);
    
    // Get stored credentials with proper type checking
    const credentials = safeGet<StoredCredentials>('userCredentials', {});
    
    // Check if user exists
    if (!credentials[safeUserId]) {
      return { success: false, error: 'User not found' };
    }
    
    // Check if this is the last admin user
    const isUserAdmin = isAdminRole(credentials[safeUserId].role);
    if (isUserAdmin) {
      // Count other admin users
      const otherAdmins = Object.entries(credentials).filter(
        ([id, cred]) => id !== safeUserId && isAdminRole(cred.role)
      );
      
      if (otherAdmins.length === 0) {
        return { success: false, error: 'Cannot delete the last admin user' };
      }
    }
    
    // Delete the user
    delete credentials[safeUserId];
    
    // Save updated credentials
    safeSet<StoredCredentials>('userCredentials', credentials);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
};

// Export the localAuthService object with all functions
export const localAuthService = {
  initializeAuth,
  authenticateUser,
  getCurrentUser,
  signOut,
  isAdmin,
  addUser,
  verifyAdminPermission,
  initializeLocalAuth,
  resetAuthState,
  addNewUser,
  getAllTeamMembers,
  ensureWilsonHasCEOAccess,
  getUserCredentialsByEmail,
  deleteUser
};

// Re-export as default for backward compatibility
export default localAuthService;
