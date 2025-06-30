import { type ReactNode, useState, useEffect, useCallback } from 'react';
import { 
  type AuthUser, 
  authenticateUser, 
  getCurrentUser as getLocalCurrentUser, 
  signOut as localSignOut,
  addUser
} from '@/services/localAuthService';
import { AuthContext, type AuthContextType } from './auth.types';

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = getLocalCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { user: authUser, error } = await authenticateUser(email, password);
      if (authUser) {
        setUser(authUser);
      }
      return { error: error || null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Failed to sign in' };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      // Use addUser from localAuthService with default role 'Staff'
      const result = addUser(email, password, 'Staff', fullName);
      if (result.success) {
        // Auto-login after successful signup
        const { user: authUser, error } = await authenticateUser(email, password);
        if (authUser) {
          setUser(authUser);
        }
        return { error: error || null };
      }
      return { error: result.error || 'Failed to create account' };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'Failed to create account' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      localSignOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export the AuthProvider component
export default AuthProvider;

// Re-export the useAuth hook
export { useAuth } from "./useAuth";
