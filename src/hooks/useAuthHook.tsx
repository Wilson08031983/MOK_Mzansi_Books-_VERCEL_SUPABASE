import { useContext } from 'react';
import { AuthContext, AuthContextType } from './useAuth';
import { SupabaseAuthContext, SupabaseAuthContextType } from './useSupabaseAuth';
import { useAuthProvider } from './useAuthProvider';

// Unified hook that selects the correct provider's auth context
export const useAuth = (): AuthContextType => {
  const { providerType } = useAuthProvider();

  if (providerType === 'supabase') {
    const supa = useContext(SupabaseAuthContext);
    if (supa === undefined) {
      throw new Error('useAuth (supabase) must be used within a SupabaseAuthProvider');
    }
    // The SupabaseAuthContextType is structurally compatible with AuthContextType
    return supa as unknown as AuthContextType;
  }

  // Default to mock/local auth provider
  const mock = useContext(AuthContext);
  if (mock === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return mock;
};
