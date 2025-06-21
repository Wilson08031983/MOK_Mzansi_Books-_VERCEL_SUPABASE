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
    // Try to get stored preference, default to 'mock' for now
    const stored = localStorage.getItem('mokAuthProvider');
    return (stored as AuthProviderType) || 'mock';
  });

  const toggleProvider = () => {
    const newType: AuthProviderType = providerType === 'mock' ? 'supabase' : 'mock';
    localStorage.setItem('mokAuthProvider', newType);
    setProviderType(newType);
    // Force reload to apply the new auth provider
    window.location.reload();
  };

  // Wrap with the appropriate auth provider based on the current setting
  const AuthProviderComponent = providerType === 'mock' ? MockAuthProvider : SupabaseAuthProvider;
  
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
