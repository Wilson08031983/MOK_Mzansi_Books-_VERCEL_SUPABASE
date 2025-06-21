// This file re-exports Supabase client and related utilities for local development
export { supabase } from '@/config/supabaseClient';

// Helper functions that work with Supabase
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

// Common database types
export interface DatabaseUser {
  id: string;
  email: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    company_name?: string;
    phone?: string;
    [key: string]: any;
  };
  created_at?: string;
}

export interface InvitationType {
  id?: string;
  invitation_token: string;
  email: string; 
  company_id?: string;
  invited_by?: string;
  status: 'pending' | 'accepted' | 'expired';
  expires_at: string;
  created_at?: string;
}
