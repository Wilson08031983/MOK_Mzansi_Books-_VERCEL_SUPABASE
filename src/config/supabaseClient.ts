import { createClient } from '@supabase/supabase-js';

// Prefer Vite client env vars; fall back to server envs, then local defaults
const SUPABASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL)
  || process.env.SUPABASE_URL
  || 'http://localhost:8000';

const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY)
  || process.env.SUPABASE_ANON_KEY
  || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
