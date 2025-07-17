import { createContext, useContext, useState } from 'react';
import { AuthProvider as MockAuthProvider } from './useAuth';
import { SupabaseAuthProvider } from './useSupabaseAuth';

// Context to manage which auth provider to use
type AuthProviderType = 'mock' | 'supabase';

interface AuthProviderContextType {
  providerType: AuthProviderType;
  toggleProvider: () => void;
}

const AuthProviderContext = createContext<AuthProviderContextType | undefined>(undefined);

// Provider component that determines which auth implementation to use
export const AuthProviderSelector = ({ children }: { children: React.ReactNode }) => {
  const [providerType, setProviderType] = useState<AuthProviderType>(() => {
    try {
      // Try to get stored preference, default to 'mock' for now
      const stored = localStorage.getItem('mokAuthProvider');
      // Validate that it's a valid provider type
      if (stored === 'mock' || stored === 'supabase') {
        return stored as AuthProviderType;
      }
      return 'mock'; // Default if invalid
    } catch (error) {
      console.error('Error retrieving auth provider preference:', error);
      return 'mock'; // Default to mock on error
    }
  });

  const toggleProvider = () => {
    try {
      const newType: AuthProviderType = providerType === 'mock' ? 'supabase' : 'mock';
      localStorage.setItem('mokAuthProvider', newType);
      setProviderType(newType);
      // Force reload to apply the new auth provider
      window.location.reload();
    } catch (error) {
      console.error('Error toggling auth provider:', error);
      // Continue with current provider
    }
  };

  // Wrap with the appropriate auth provider based on the current setting
  // Default to MockAuthProvider if anything goes wrong
  const AuthProviderComponent = providerType === 'supabase' ? SupabaseAuthProvider : MockAuthProvider;
  
  return (
    <AuthProviderContext.Provider value={{ providerType, toggleProvider }}>
      <AuthProviderComponent>
        {children}
      </AuthProviderComponent>
    </AuthProviderContext.Provider>
  );
};

// Hook to access the provider context
export const useAuthProvider = (): AuthProviderContextType => {
  const context = useContext(AuthProviderContext);
  if (context === undefined) {
    throw new Error('useAuthProvider must be used within an AuthProviderSelector');
  }
  return context;
};

// Export both hooks for convenience
export { useAuth } from './useAuth';
export { useSupabaseAuth } from './useSupabaseAuth';
