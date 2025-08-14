// Authentication service for MOK Mzansi Books
import { 
  getDefaultPermissions, 
  getAdminPermissions, 
  type UserPermissions
} from './permissionService';
import { safeLocalStorage } from '@/utils/safeAccess';

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

// Type guard for user role
const isValidUserRole = (role: string): role is UserRole => 
  [...ADMIN_ROLES, 'Staff'].includes(role as UserRole);

// Initialize with default admin user if no users exist
export const initializeAuth = (): void => {
  const credentials = safeLocalStorage.getItem<StoredCredentials>('userCredentials', {});
  
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
    safeLocalStorage.setItem('userCredentials', credentials);
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

    const credentials = safeLocalStorage.getItem<StoredCredentials>('userCredentials', {});
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
    safeLocalStorage.setItem('currentUser', user);
    
    return { user, error: null };
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'An error occurred during authentication' };
  }
};

// Get current authenticated user
export const getCurrentUser = (): AuthUser | null => {
  return safeLocalStorage.getItem<AuthUser | null>('currentUser', null);
};

export const signOut = (): void => {
  safeLocalStorage.removeItem('currentUser');
};

export const isAdmin = (user: AuthUser | null): boolean => {
  return user ? ADMIN_ROLES.includes(user.role) : false;
};

export const getAllTeamMembers = () => {
  const credentials = safeLocalStorage.getItem<StoredCredentials>('userCredentials', {});
  
  return Object.entries(credentials).map(([id, credential]) => ({
    id,
    email: credential.email,
    fullName: credential.fullName || 'Unknown',
    role: credential.role,
    permissions: credential.permissions,
    created: new Date().toISOString()
  }));
};

export const resetAuthState = (): void => {
  safeLocalStorage.removeItem('userCredentials');
  safeLocalStorage.removeItem('currentUser');
};

export const addUser = (email: string, password: string, role: UserRole = 'Staff', fullName?: string): { success: boolean; error?: string } => {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    if (!isValidUserRole(role)) {
      return { success: false, error: 'Invalid user role' };
    }

    const credentials = safeLocalStorage.getItem<StoredCredentials>('userCredentials', {});
    
    // Check if user already exists
    const existingUser = Object.values(credentials).find(
      cred => cred.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }

    // Generate user ID
    const userId = `user-${Date.now()}`;
    
    // Determine permissions based on role
    const permissions = ADMIN_ROLES.includes(role) ? getAdminPermissions() : getDefaultPermissions();
    
    // Create new user
    const newUser: StoredUserCredential = {
      email,
      password,
      fullName,
      role,
      permissions
    };
    
    credentials[userId] = newUser;
    safeLocalStorage.setItem('userCredentials', credentials);
    
    console.log(`User ${email} added with role ${role}`);
    return { success: true };
  } catch (error) {
    console.error('Error adding user:', error);
    return { success: false, error: 'Failed to add user' };
  }
};
