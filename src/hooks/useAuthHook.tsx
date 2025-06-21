import { useContext } from 'react';
import { AuthContext, AuthContextType } from './useAuth';

// Separate file for the hook to avoid fast refresh issues
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
