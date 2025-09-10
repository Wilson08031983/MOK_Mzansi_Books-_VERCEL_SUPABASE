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
  emailVerified?: boolean;
  verifyToken?: string;
  verifyTokenExpiresAt?: number;
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

// Add or update a user's role and adjust permissions accordingly
export const updateUserRole = (userId: string, newRole: UserRole): { success: boolean; error?: string } => {
  try {
    if (!isUserRole(newRole)) {
      return { success: false, error: 'Invalid user role' };
    }

    const credentials = safeGet<StoredCredentials>('userCredentials', {});
    const safeUserId = safeString(userId);
    const user = credentials[safeUserId];

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Prevent demotion of the primary company user via this path
    if (user.email && user.email.toLowerCase() === 'admin@mokmzansibooks.com' && newRole === 'Staff') {
      return { success: false, error: 'Cannot demote the primary company user' };
    }

    // Update role
    credentials[safeUserId] = {
      ...user,
      role: newRole,
      // Update permissions to match role
      permissions: ADMIN_ROLES.includes(newRole) ? getAdminPermissions() : getDefaultPermissions()
    };

    // Persist changes
    safeSet<StoredCredentials>('userCredentials', credentials);

    // Also persist permissions in dedicated storage for compatibility
    saveUserPermissions(safeUserId, ADMIN_ROLES.includes(newRole) ? getAdminPermissions() : getDefaultPermissions());

    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
};

// Initialize with default admin and regular users if no users exist
export const initializeDefaultUsers = (): void => {
  const credentials = safeGet<StoredCredentials>('userCredentials', {});
  
  console.log('🔧 initializeDefaultUsers: Starting with credentials:', Object.keys(credentials));
  
  if (Object.keys(credentials).length === 0) {
    // Create default admin user
    const adminUser: StoredUserCredential = {
      email: 'admin@mokmzansibooks.com',
      password: 'admin123',
      fullName: 'Admin User',
      role: 'Manager',
      permissions: getAdminPermissions(),
      emailVerified: true
    };
    
    console.log('🔧 initializeDefaultUsers: Creating initial admin user:', adminUser);
    credentials['default-admin'] = adminUser;
    safeSet<StoredCredentials>('userCredentials', credentials);
  } else {
    // Check for and add admin user if it doesn't exist
    let adminExists = false;
    let existingAdminId: string | null = null;
    
    // Check if admin exists
    Object.entries(credentials).forEach(([id, user]) => {
      if (user.email === 'admin@mokmzansibooks.com') {
        adminExists = true;
        existingAdminId = id;
        // Ensure seeded admin is verified
        credentials[id] = { ...user, emailVerified: true } as StoredUserCredential;
      }
    });
    
    console.log('🔧 initializeDefaultUsers: Admin exists:', adminExists, 'ID:', existingAdminId);
    
    // Add admin if not exists (preserve existing fullName if admin already exists)
    if (!adminExists) {
      const adminUser: StoredUserCredential = {
        email: 'admin@mokmzansibooks.com',
        password: 'admin123',
        fullName: 'Admin User',
        role: 'Manager',
        permissions: getAdminPermissions(),
        emailVerified: true
      };
      console.log('🔧 initializeDefaultUsers: Creating missing admin user:', adminUser);
      credentials['default-admin'] = adminUser;
      safeSet<StoredCredentials>('userCredentials', credentials);
      existingAdminId = 'default-admin';
    } else {
      // Persist potential verification flag update
      safeSet<StoredCredentials>('userCredentials', credentials);
    }
  }
  
  // After ensuring admin exists, try to sync their profile from saved company details
  try {
    const savedCompanyDetailsRaw = safeLocalStorage.getItem('companyDetails');
    if (savedCompanyDetailsRaw) {
      const savedCompanyDetails = JSON.parse(savedCompanyDetailsRaw);
      const ownerName = (savedCompanyDetails.ownerName || '').trim();
      const ownerSurname = (savedCompanyDetails.ownerSurname || '').trim();
      const ownerPosition = (savedCompanyDetails.ownerPosition || '').trim();
      
      const adminId = Object.keys(credentials).find(id => credentials[id].email === 'admin@mokmzansibooks.com');
      if (adminId) {
        const current = credentials[adminId];
        const newFullName = `${ownerName} ${ownerSurname}`.trim();
        const newRole = ownerPosition || 'CEO';
        
        // Only update if we have at least a name or a position to apply
        if (newFullName || ownerPosition) {
          credentials[adminId] = {
            ...current,
            fullName: newFullName || current.fullName || (current.email ? current.email.split('@')[0] : ''),
            role: newRole
          };
          safeSet<StoredCredentials>('userCredentials', credentials);
          console.log('🔧 initializeDefaultUsers: Synced primary admin from companyDetails', { fullName: credentials[adminId].fullName, role: credentials[adminId].role });
        }
      }
    }
  } catch (syncErr) {
    console.warn('initializeDefaultUsers: Could not sync primary admin from company details', syncErr);
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
    permissions: userPermissions,
    emailVerified: false
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

// Initialize with default admin user only if none exist
export const initializeLocalAuth = (): void => {
  const credentials = safeGet<StoredCredentials>('userCredentials', {});
  
  // Remove Regular User if it exists (cleanup)
  if (credentials['regular-user']) {
    delete credentials['regular-user'];
    safeSet<StoredCredentials>('userCredentials', credentials);
    console.log('Removed Regular User from credentials');
  }
  
  if (Object.keys(credentials).length === 0) {
    // Create default admin user only
    const adminUser: StoredUserCredential = {
      email: 'admin@mokmzansibooks.com',
      password: 'admin123',
      fullName: 'Admin User',
      role: 'Manager',
      permissions: getAdminPermissions(),
      emailVerified: true
    };
    
    credentials['admin-user'] = adminUser;
    
    safeSet<StoredCredentials>('userCredentials', credentials);
    
    console.log('Initialized local auth with admin user only');
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
    return Object.entries(credentials)
      // Exclude the seeded Regular User from Team Management display
      .filter(([id, user]) => {
        const email = (user.email || '').toLowerCase();
        const name = (user.fullName || '').toLowerCase();
        return email !== 'user@mokmzansibooks.com' && name !== 'regular user' && id !== 'regular-user';
      })
      .map(([id, user]) => {
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
    // Determine robust development mode and localhost checks safely across environments
    const isLocalhost = (typeof window !== 'undefined') && /localhost|127\.0\.0\.1/.test((window.location && window.location.hostname) || '');
    const __DEV__ = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') || isLocalhost;

    // Avoid logging raw passwords; only log masked info in development
    try {
      if (__DEV__) {
        const masked = password ? '*'.repeat(Math.min(password.length, 8)) : '';
        console.log('getUserCredentialsByEmail called with:', { email, password: masked });
      }
    } catch {}

    // Load credentials and find user entry
    const credentials = safeGet<StoredCredentials>('userCredentials', {});
    const userEntry = Object.entries(credentials).find(
      ([_, cred]) => cred.email.toLowerCase() === email.toLowerCase()
    );

    if (!userEntry) {
      return { success: false, error: 'Invalid email or password' };
    }

    const [userId, userCreds] = userEntry;

    // Verify password
    if (userCreds.password !== password) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Enforce email verification with bypass in dev/preview/local
    let localBypass = false;
    try {
      localBypass = typeof window !== 'undefined' && (
        localStorage.getItem('mokBypassEmailVerification') === 'true' ||
        localStorage.getItem('mokDisableEmailVerification') === 'true'
      );
    } catch {}

    // NEW: one-time bypass flag scoped by email; consume after use
    let oneTimeBypass = false;
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('mokBypassEmailVerificationOnce');
        if (raw) {
          const map: Record<string, any> = JSON.parse(raw || '{}');
          const key = String(email || '').toLowerCase();
          if (map && key && (map[key] === true || map[key] === 'true' || (typeof map[key] === 'number' && map[key] > Date.now()))) {
            oneTimeBypass = true;
            // Consume the one-time flag for this email
            try {
              delete map[key];
              localStorage.setItem('mokBypassEmailVerificationOnce', JSON.stringify(map));
            } catch {}
          }
        }
      }
    } catch {}

    const isPreviewDomain = typeof window !== 'undefined' && /localhost|127\.0\.0\.1|\.vercel\.app$|\.netlify\.app$/i.test((window.location && window.location.hostname) || '');
    const bypassVerification = __DEV__ || isPreviewDomain || localBypass || oneTimeBypass;

    if (userCreds.emailVerified !== true && !bypassVerification) {
      return { success: false, error: 'Please verify your email address before signing in.' };
    }

    // Return user data with proper typing
    const userData: AuthUser = {
      id: userId,
      email: userCreds.email,
      fullName: userCreds.fullName,
      role: (userCreds.role as UserRole) || 'Staff',
      permissions: userCreds.permissions || {}
    };

    try { if (__DEV__) console.log('Returning authenticated user:', userData); } catch {}

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
    
    console.log('User deleted:', safeUserId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
};


// Update primary user information in team members table
export const updatePrimaryUserInTeamMembers = (companyDetails: {
  ownerName: string;
  ownerSurname: string;
  ownerPosition?: string;
  email: string;
  phone?: string;
}): { success: boolean; error?: string } => {
  try {
    console.log('🔄 updatePrimaryUserInTeamMembers: Starting update with:', companyDetails);
    
    const credentials = safeGet<StoredCredentials>('userCredentials', {});
    const PRIMARY_USER_EMAIL = 'admin@mokmzansibooks.com';
    
    console.log('🔄 updatePrimaryUserInTeamMembers: Current credentials:', Object.keys(credentials).map(id => ({
      id,
      email: credentials[id].email,
      fullName: credentials[id].fullName,
      role: credentials[id].role
    })));
    
    // Find the primary user in team members
    let primaryUserFound = false;
    let primaryUserId = '';
    
    Object.entries(credentials).forEach(([id, cred]) => {
      if (cred.email.toLowerCase() === PRIMARY_USER_EMAIL.toLowerCase()) {
        primaryUserFound = true;
        primaryUserId = id;
        
        const oldUser = { ...cred };
        
        // Update the primary user's information with company details
        credentials[id] = {
          ...cred,
          fullName: `${companyDetails.ownerName} ${companyDetails.ownerSurname}`.trim() || cred.fullName || (cred.email ? cred.email.split('@')[0] : ''),
          role: (companyDetails.ownerPosition as UserRole) || 'CEO',
          // Keep existing password and permissions
          password: cred.password,
          permissions: cred.permissions
        };
        
        console.log('🔄 updatePrimaryUserInTeamMembers: Updated user from:', {
          fullName: oldUser.fullName,
          role: oldUser.role
        }, 'to:', {
          fullName: credentials[id].fullName,
          role: credentials[id].role
        });
      }
    });
    
    if (!primaryUserFound) {
      console.error('🔄 updatePrimaryUserInTeamMembers: Primary user not found');
      return { success: false, error: 'Primary user not found in team members' };
    }
    
    // Save updated credentials with explicit error handling
    try {
      safeSet<StoredCredentials>('userCredentials', credentials);
      console.log('🔄 updatePrimaryUserInTeamMembers: Credentials saved to localStorage');
      
      // Verify the save worked
      const verifyCredentials = safeGet<StoredCredentials>('userCredentials', {});
      const verifyUser = Object.values(verifyCredentials).find(user => 
        user.email.toLowerCase() === PRIMARY_USER_EMAIL.toLowerCase()
      );
      console.log('🔄 updatePrimaryUserInTeamMembers: Verification - saved user:', {
        fullName: verifyUser?.fullName,
        role: verifyUser?.role
      });
    } catch (saveError) {
      console.error('🔄 updatePrimaryUserInTeamMembers: Error saving credentials:', saveError);
      return { success: false, error: 'Failed to save updated user information' };
    }
    
    // Notify listeners that team members have been updated
    try {
      console.log('🔄 updatePrimaryUserInTeamMembers: Dispatching teamMembersUpdated event');
      window.dispatchEvent(new CustomEvent('teamMembersUpdated', { 
        detail: { 
          reason: 'primaryUserUpdated',
          source: 'updatePrimaryUserInTeamMembers',
          updatedUser: {
            email: PRIMARY_USER_EMAIL,
            fullName: credentials[primaryUserId].fullName,
            role: credentials[primaryUserId].role
          }
        } 
      }));
    } catch (evtErr) {
      console.warn('Could not dispatch teamMembersUpdated event:', evtErr);
    }
    
    console.log('🔄 updatePrimaryUserInTeamMembers: Primary user updated successfully:', primaryUserId);
    return { success: true };
  } catch (error) {
    console.error('Error updating primary user in team members:', error);
    return { success: false, error: 'Failed to update primary user information' };
  }
};

// Email verification helpers
const generateRandomToken = (): string => {
  try {
    const bytes = new Uint8Array(16);
    (window.crypto || (window as any).msCrypto).getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }
};

export const createEmailVerificationToken = (email: string): { success: boolean; token?: string; error?: string } => {
  try {
    const credentials = safeGet<StoredCredentials>('userCredentials', {});
    const entry = Object.entries(credentials).find(([_id, cred]) => cred.email.toLowerCase() === email.toLowerCase());
    if (!entry) return { success: false, error: 'User not found' };
    const [userId, user] = entry;

    const token = generateRandomToken();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24h

    credentials[userId] = {
      ...user,
      emailVerified: false,
      verifyToken: token,
      verifyTokenExpiresAt: expiresAt
    };
    safeSet<StoredCredentials>('userCredentials', credentials);

    return { success: true, token };
  } catch (e) {
    console.error('Failed to create verification token:', e);
    return { success: false, error: 'Failed to create verification token' };
  }
};

export const verifyEmailByToken = (token: string): { success: boolean; email?: string; error?: string } => {
  try {
    const credentials = safeGet<StoredCredentials>('userCredentials', {});
    const entry = Object.entries(credentials).find(([_id, cred]) => cred.verifyToken === token);
    if (!entry) return { success: false, error: 'Invalid verification link' };
    const [userId, user] = entry;

    if (!user.verifyTokenExpiresAt || user.verifyTokenExpiresAt < Date.now()) {
      return { success: false, error: 'This verification link has expired' };
    }

    credentials[userId] = {
      ...user,
      emailVerified: true,
      verifyToken: undefined,
      verifyTokenExpiresAt: undefined
    } as StoredUserCredential;

    safeSet<StoredCredentials>('userCredentials', credentials);
    return { success: true, email: user.email };
  } catch (e) {
    console.error('Failed to verify email by token:', e);
    return { success: false, error: 'Verification failed' };
  }
};

export const isEmailVerified = (email: string): boolean => {
  try {
    const credentials = safeGet<StoredCredentials>('userCredentials', {});
    const entry = Object.values(credentials).find(cred => cred.email.toLowerCase() === email.toLowerCase());
    return !!entry && entry.emailVerified === true;
  } catch {
    return false;
  }
};

export const setEmailVerifiedByEmail = (email: string, verified: boolean): { success: boolean; error?: string } => {
  try {
    const credentials = safeGet<StoredCredentials>('userCredentials', {});
    const entry = Object.entries(credentials).find(([_id, cred]) => cred.email.toLowerCase() === email.toLowerCase());
    if (!entry) return { success: false, error: 'User not found' };
    const [userId, user] = entry;
    credentials[userId] = {
      ...user,
      emailVerified: verified,
      // Clear tokens when setting verified to true
      ...(verified ? { verifyToken: undefined, verifyTokenExpiresAt: undefined } : {})
    } as StoredUserCredential;
    safeSet<StoredCredentials>('userCredentials', credentials);
    return { success: true };
  } catch (e) {
    console.error('Failed to set email verified:', e);
    return { success: false, error: 'Failed to update verification status' };
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
  deleteUser,
  updateUserRole,
  createEmailVerificationToken,
  verifyEmailByToken,
  isEmailVerified,
  setEmailVerifiedByEmail
};

// Re-export as default for backward compatibility
export default localAuthService;
