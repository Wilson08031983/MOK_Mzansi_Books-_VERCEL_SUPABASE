
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Properly typed user interface without Supabase dependency
export interface User {
  id: string;
  email: string;
  user_metadata?: UserMetadata;
}

export interface UserMetadata {
  first_name?: string;
  last_name?: string;
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
    // Create mock user
    const newUser = {
      id: Date.now().toString(),
      email,
      user_metadata: userData
    };
    
    // Store in local storage
    localStorage.setItem('mokUser', JSON.stringify(newUser));
    setUser(newUser);
    
    // Simulate async behavior
    return Promise.resolve();
  };

  const signIn = async (email: string, password: string) => {
    // For development, just create a mock user and sign in
    const mockUser = {
      id: 'mock-user-id',
      email,
      user_metadata: {
        first_name: 'Test',
        last_name: 'User'
      }
    };
    
    localStorage.setItem('mokUser', JSON.stringify(mockUser));
    setUser(mockUser);
    
    return Promise.resolve();
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
