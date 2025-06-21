import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase';
import { DatabaseUser } from '@/integrations/supabase';
import { User } from '@/hooks/useAuth'; // Using same User type for consistency

export interface SupabaseAuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: Record<string, any>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error checking auth session:', error);
        setLoading(false);
        return;
      }

      if (data && data.session) {
        try {
          const { user } = data.session;
          if (user) {
            const userToSet: User = {
              id: user.id,
              email: user.email || '',
              user_metadata: user.user_metadata
            };
            setUser(userToSet);
          }
        } catch (error) {
          console.error('Error setting user:', error);
        }
      }
      setLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const user = session.user;
        if (user) {
          const userToSet: User = {
            id: user.id,
            email: user.email || '',
            user_metadata: user.user_metadata
          };
          setUser(userToSet);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    checkAuth();

    // Clean up auth listener
    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      const userToSet: User = {
        id: data.user.id,
        email: data.user.email || '',
        user_metadata: data.user.user_metadata
      };
      setUser(userToSet);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      const userToSet: User = {
        id: data.user.id,
        email: data.user.email || '',
        user_metadata: data.user.user_metadata
      };
      setUser(userToSet);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    setUser(null);
    navigate('/');
  };

  return (
    <SupabaseAuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

// Hook for accessing the context
export const useSupabaseAuth = (): SupabaseAuthContextType => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};
