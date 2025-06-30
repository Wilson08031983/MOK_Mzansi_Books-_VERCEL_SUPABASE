// Authentication service for MOK Mzansi Books
import { 
  getDefaultPermissions, 
  getAdminPermissions, 
  type UserPermissions
} from './permissionService';

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
}

// Helper functions for localStorage with type safety
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
    console.log('Default admin user created');
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

// Get all team members (excluding sensitive data like passwords)
export const getAllTeamMembers = () => {
  try {
    const credentials = safeGet<StoredCredentials>('userCredentials', {});
    
    return Object.entries(credentials).map(([id, user]) => ({
      id,
      email: user.email,
      fullName: user.fullName || user.email.split('@')[0],
      role: user.role,
      isAdmin: ADMIN_ROLES.includes(user.role)
    }));
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
};

// Reset authentication state (for testing/development)
export const resetAuthState = (): void => {
  localStorage.removeItem('userCredentials');
  localStorage.removeItem('currentUser');
  initializeAuth(); // Re-initialize with default users
};

// Add a new user with specified credentials
export const addUser = (email: string, password: string, role: UserRole = 'Staff', fullName?: string): { success: boolean; error?: string } => {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
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

    // Generate a new user ID
    const userId = `user-${Date.now()}`;
    
    // Create new user with appropriate permissions
    const newUser: StoredUserCredential = {
      email,
      password,
      fullName,
      role,
      permissions: isAdmin(role) ? getAdminPermissions() : getDefaultPermissions()
    };

    // Save updated credentials
    credentials[userId] = newUser;
    safeSet('userCredentials', credentials);
    
    return { success: true };
  } catch (error) {
    console.error('Error adding user:', error);
    return { success: false, error: 'Failed to add user' };
  }
};
