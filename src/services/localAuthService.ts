// Local authentication service to handle user authentication and role-based access
// without requiring Supabase cloud connection
import { getDefaultPermissions, getAdminPermissions, UserPermissions } from './permissionService';

// Define user roles and types
type UserRole = 'CEO' | 'Manager' | 'Bookkeeper' | 'Director' | 'Founder' | 'Staff';
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

// Type guard for user role
const isValidUserRole = (role: string): role is UserRole => 
  [...ADMIN_ROLES, 'Staff'].includes(role as UserRole);

// Initialize with default admin user if no users exist
export const initializeAuth = (): void => {
  const credentials = safeGet<StoredCredentials>('userCredentials', {});
  
  if (Object.keys(credentials).length === 0) {
    // Create default admin user if no users exist
    const defaultAdmin: StoredUserCredential = {
      email: 'admin@mokmzansibooks.com',
      password: 'admin123',
      fullName: 'Admin User',
      role: 'Manager',
      permissions: getAdminPermissions()
    };
    
    credentials['default-admin'] = defaultAdmin;
    safeSet('userCredentials', credentials);
  }
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
    const userEntry = Object.entries(credentials).find(
      ([_, cred]) => cred.email.toLowerCase() === email.toLowerCase()
    );

    if (!userEntry) {
      return { user: null, error: 'Invalid email or password' };
    }

    const [userId, userCreds] = userEntry;

    if (userCreds.password !== password) {
      return { user: null, error: 'Invalid email or password' };
    }

    const user: AuthUser = {
      id: userId,
      email: userCreds.email,
      fullName: userCreds.fullName,
      role: userCreds.role,
      permissions: userCreds.permissions
    };

    // Store current user in localStorage
    safeSet('currentUser', user);
    
    return { user, error: null };
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'An error occurred during authentication' };
  }
};

// Get current authenticated user
export const getCurrentUser = (): AuthUser | null => {
  return safeGet<AuthUser | null>('currentUser', null);
};

// Sign out current user
export const signOut = (): void => {
  localStorage.removeItem('currentUser');
};

// Check if user has admin role
export const isAdmin = (user: AuthUser | null): boolean => {
  return user ? ADMIN_ROLES.includes(user.role) : false;
};

// Add a new user with specified credentials
export const addUser = (
  email: string,
  password: string,
  role: UserRole,
  fullName?: string,
  permissions?: UserPermissions
): { success: boolean; error?: string } => {
  try {
    if (!email || !password || !role) {
      return { success: false, error: 'Email, password, and role are required' };
    }

    if (!isValidUserRole(role)) {
      return { success: false, error: 'Invalid user role' };
    }

    const credentials = safeGet<StoredCredentials>('userCredentials', {});
    
    // Check if email already exists
    const emailExists = Object.values(credentials).some(
      cred => cred.email.toLowerCase() === email.toLowerCase()
    );
    
    if (emailExists) {
      return { success: false, error: 'A user with this email already exists' };
    }

    // Generate a unique ID for the new user
    const userId = `user-${Date.now()}`;
    
    // Create new user credential
    const userCred: StoredUserCredential = {
      email: email.toLowerCase(),
      password,
      role,
      fullName,
      permissions: permissions || (isAdmin({ id: userId, email, role, fullName, permissions }) ? getAdminPermissions() : getDefaultPermissions())
    };
    
    // Add to credentials store
    credentials[userId] = userCred;
    safeSet('userCredentials', credentials);
    
    // Create user object for return
    const user: AuthUser = {
      id: userId,
      email: userCred.email,
      fullName: userCred.fullName,
      role: userCred.role,
      permissions: userCred.permissions,
      user_metadata: {
        role: userCred.role || '',
        first_name: 'User',
        last_name: 'Account',
        company_name: 'MOK Mzansi Books',
        phone: ''
      }
    };
    
    // Return success
    return { success: true };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
};

// Verify if user has admin permission
export const verifyAdminPermission = async (email: string, password: string): Promise<boolean> => {
  // Special case for Wilson Moabelo - case insensitive email check to be safe
  if (email.toLowerCase().trim() === 'mokgethwamoabelo@gmail.com' && password === 'Ka!gi#so123J') {
    console.log('CEO admin verification bypass activated for Wilson');
    
    // Ensure Wilson's account exists and has proper admin rights
    ensureWilsonHasCEOAccess();
    
    return true; // Always grant admin permission to Wilson Moabelo
  }
  
  // First authenticate the user
  const { user, error } = await authenticateUser(email, password);
  
  if (error || !user) {
    return false;
  }
  
  // Check if the user has an admin role
  return isAdmin(user);
};

// Initialize with some default users for testing if none exist
export const initializeLocalAuth = (): void => {
  try {
    // Check if credentials already exist
    const storedCredentials = safeGet<StoredCredentials>('userCredentials', {});
    if (Object.keys(storedCredentials).length > 0) {
      console.log('User credentials already exist, skipping initialization');
      return;
    }
    
    console.log('Initializing default users...');
    
    // Create users with different roles for testing
    const defaultCredentials: StoredCredentials = {
      'user1': {
        email: 'admin@mokmzansibooks.com',
        password: 'admin123',
        role: 'Manager' as UserRole,  // This is an admin role
        fullName: 'Admin User'
      },
      'user2': {
        email: 'user@mokmzansibooks.com',
        password: 'user123',
        role: 'Staff' as UserRole,    // This is NOT an admin role
        fullName: 'Regular User'
      },
      'user3': {
        email: 'ceo@mokmzansibooks.com',
        password: 'ceo123',
        role: 'CEO' as UserRole,      // Another admin role for testing
        fullName: 'CEO User'
      },
      'user4': {
        email: 'bookkeeper@mokmzansibooks.com',
        password: 'book123',
        role: 'Bookkeeper' as UserRole, // Another admin role for testing
        fullName: 'Bookkeeper User'
      }
    };
    
    // Save the updated user credentials
    safeSet('userCredentials', defaultCredentials);
    
    // Log initialization
    console.log('Authentication system initialized with test users');
    console.log('- Admin users: admin@mokmzansibooks.com, ceo@mokmzansibooks.com, bookkeeper@mokmzansibooks.com');
    console.log('- Regular user: user@mokmzansibooks.com');
  } catch (error) {
    console.error('Error initializing local auth:', error);
  }
};

// Helper function to reset auth state (for testing)
export const resetAuthState = (): void => {
  try {
    // Clear existing credentials by setting to empty object
    safeSet('userCredentials', {});
    
    // Reinitialize with default users
    initializeLocalAuth();
    
    console.log('Auth state reset and default users reinitialized.');
  } catch (error) {
    console.error('Error resetting auth state:', error);
    throw new Error('Failed to reset auth state: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Add a new user with specified credentials
export const addNewUser = (email: string, password: string, role: string, permissions?: UserPermissions): { success: boolean; error?: string } => {
  try {
    const safeEmail = safeString(email);
    const safePassword = safeString(password);
    const safeRole = safeString(role);
    
    const storedCredentials = safeLocalStorage.getItem('userCredentials', {});
    let credentials: Record<string, UserCredentials> = safeGet(storedCredentials, {});
    
    // Check if email already exists
    const existingUser = Object.values(credentials).find(cred => cred.email === safeEmail);
    if (existingUser) {
      return { success: false, error: 'A user with this email already exists.' };
    }
    
    // Generate a new user ID
    const userId = `user${Date.now()}`;
    
    // Add new user
    const userPermissions = permissions || (isAdminRole(safeRole) ? getAdminPermissions() : getDefaultPermissions());
    
    const newCredentials: UserCredentials = {
      email: safeEmail,
      password: safePassword,
      role: safeRole,
      permissions: userPermissions
    };
    
    // Save updated credentials
    credentials[userId] = newCredentials;
    safeLocalStorage.setItem('userCredentials', credentials);
    
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
    const userCredentials = safeLocalStorage.getItem('userCredentials', null);
    if (!userCredentials) return;
    
    const credentials = safeGet(userCredentials, {});
    let wilsonFound = false;
    let wilsonId = '';
    
    // Check if Wilson's account exists
    Object.entries(credentials).forEach(([id, cred]: [string, UserCredentials]) => {
      if (safeString(cred?.email) === 'mokgethwamoabelo@gmail.com') {
        wilsonFound = true;
        wilsonId = id;
        
        // Make sure the account has CEO role and admin access
        credentials[id] = {
          ...cred,
          role: 'CEO',
          isDefaultAdmin: true,
          password: 'Ka!gi#so123J', // Ensure password is correct
          permissions: getAdminPermissions()
        };
      }
    });
    
    // If Wilson's account was found and updated, save the changes
    if (wilsonFound) {
      safeLocalStorage.setItem('userCredentials', credentials);
      
      // Also update permissions storage
      const permissions = getAdminPermissions();
      saveUserPermissions(wilsonId, permissions);
    }
  } catch (error) {
    console.error('Error ensuring Wilson has CEO access:', error);
  }
};

// User type for authentication response
export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
  permissions?: UserPermissions;
}

import { UserPermissions } from './permissionService';

// Define interface for user credentials
interface UserCredentials {
  email: string;
  password: string;
  fullName?: string;
  role: string;
  permissions?: UserPermissions;
}

// StoredUserCredential represents how user credentials are stored in localStorage
interface StoredUserCredential {
  email: string;
  password: string;
  fullName?: string;
  role: string;
  permissions?: UserPermissions;
}

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
    const storedCredentials: StoredCredentials = safeGet<StoredCredentials>('userCredentials', {});
    if (!storedCredentials) {
      return { success: false, error: 'No user found with this email' };
    }
    
    const credentials = safeGet(storedCredentials, {}) as Record<string, UserCredentials>;
    
    // Check if user exists
    if (!credentials[safeUserId]) {
      return { success: false, error: 'User not found' };
    }
    
    // Delete the user
    delete credentials[safeUserId];
    
    // Save updated credentials
    safeLocalStorage.setItem('userCredentials', credentials);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
};
