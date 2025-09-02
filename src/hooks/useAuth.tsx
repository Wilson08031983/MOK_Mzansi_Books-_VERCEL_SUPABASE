
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserCredentialsByEmail, addUser } from '@/services/localAuthService';
import { getCurrentDeviceSession, addDeviceSession, sendLoginNotification } from '@/services/securityService';
import { getAdminPermissions, getDefaultPermissions, saveUserPermissions, isAdminRole as isAdminRolePermission } from '@/services/permissionService';

// Properly typed user interface without Supabase dependency
export interface User {
  id: string;
  email: string;
  user_metadata?: UserMetadata;
  role?: string; // Add role at root level for mock auth compatibility
}

export interface UserMetadata {
  first_name?: string;
  last_name?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  [key: string]: string | undefined;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: UserMetadata) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is stored in local storage
    const storedUser = localStorage.getItem('mokUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, userData: UserMetadata) => {
    try {
      // Determine role (default first owner is CEO; invitations may pass a role in userData.role)
      const role = (userData?.role as string) || 'CEO';
      const fullName = [userData?.first_name, userData?.last_name].filter(Boolean).join(' ') || email.split('@')[0];

      // Persist credentials to local storage credentials registry
      const addRes = addUser(email, password, role as any, fullName);
      if (!addRes.success) {
        throw new Error(addRes.error || 'Failed to create user');
      }

      // Look up created user to obtain consistent id and role
      const lookup = getUserCredentialsByEmail(email, password);
      if (!lookup.success || !lookup.user) {
        throw new Error(lookup.error || 'User lookup failed after registration');
      }

      // Add trial period for new, non-invited users
      if (!userData.invitation_token) {
        const trialStartDate = new Date();
        const trialEndDate = new Date();
        trialEndDate.setDate(trialStartDate.getDate() + 30);
        
        userData.trial_start_date = trialStartDate.toISOString();
        userData.trial_end_date = trialEndDate.toISOString();
      }

      // Ensure permissions are saved in centralized permission store for UI gating
      const perms = isAdminRolePermission(lookup.user.role) ? getAdminPermissions() : getDefaultPermissions();
      saveUserPermissions(lookup.user.id, perms);

      // Store session user with correct id and role
      const newUser: User = {
        id: lookup.user.id,
        email,
        user_metadata: userData,
        role: lookup.user.role,
      };

      localStorage.setItem('mokUser', JSON.stringify(newUser));
      setUser(newUser);

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', { email, password });
      
      // Get user from localAuthService
      console.log('Calling getUserCredentialsByEmail...');
      const authResult = getUserCredentialsByEmail(email, password);
      console.log('getUserCredentialsByEmail result:', authResult);
      
      if (authResult.success && authResult.user) {
        const { user: localUser } = authResult;
        console.log('Authentication successful for user:', localUser);
        
        // Create user with proper metadata including role
        const authenticatedUser = {
          id: localUser.id,
          email: localUser.email,
          user_metadata: {
            first_name: localUser.fullName?.split(' ')[0] || 'User',
            last_name: localUser.fullName?.split(' ').slice(1).join(' ') || '',
            role: localUser.role || 'Staff', // Changed from 'staff' to 'Staff' to match UserRole type
            full_name: localUser.fullName
          },
          role: localUser.role || 'Staff' // Add role at the root level as well
        };
        
        console.log('Saving user to localStorage:', authenticatedUser);
        localStorage.setItem('mokUser', JSON.stringify(authenticatedUser));
        setUser(authenticatedUser);
        
        // Device session tracking + login notification
        try {
          const deviceSession = getCurrentDeviceSession();
          addDeviceSession(deviceSession);
          await sendLoginNotification(authenticatedUser.email, deviceSession);
        } catch (e) {
          console.warn('Non-blocking: failed to process device session or login notification', e);
        }
        
        console.log('User successfully logged in and saved');
        return Promise.resolve();
      } else {
        const errorMsg = authResult.error || 'Invalid email or password';
        console.error('Authentication failed:', errorMsg);
        return Promise.reject(new Error(errorMsg));
      }
    } catch (error) {
      console.error('Error signing in:', error);
      return Promise.reject(error);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('mokUser');
    setUser(null);
    navigate('/');
    
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook directly from this file to maintain compatibility
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
// This file only contains the AuthProvider component now
