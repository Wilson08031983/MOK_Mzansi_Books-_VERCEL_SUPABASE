import { createClient } from '@supabase/supabase-js';

// Local Supabase setup for development
const SUPABASE_URL = 'http://localhost:8000';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MTYzOTIxLCJleHAiOjE5MzE3Mzk5MjF9._lnGXgxQKVJ_r9Z14ADqBDHxkl6V32RXndDQYYPJd5w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
