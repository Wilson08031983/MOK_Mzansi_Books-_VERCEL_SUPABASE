import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client using secret key (new) or service role key (legacy)
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:8000';
const SUPABASE_ADMIN_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_ADMIN_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});