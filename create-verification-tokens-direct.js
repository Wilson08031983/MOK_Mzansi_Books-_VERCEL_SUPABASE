import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createVerificationTokensTable() {
  console.log('Creating verification_tokens table...');
  
  // Create the table with all necessary columns and constraints
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.verification_tokens (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      token VARCHAR(255) NOT NULL UNIQUE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    });
    
    if (error) {
      console.error('Error creating table with exec_sql:', error);
      
      // Try alternative approach using raw SQL
      console.log('Trying alternative approach...');
      const { data: altData, error: altError } = await supabase
        .from('verification_tokens')
        .select('*')
        .limit(1);
        
      if (altError && altError.code === 'PGRST116') {
        console.log('Table does not exist, this confirms we need to create it.');
        console.log('Please create the table manually in Supabase SQL Editor:');
        console.log('\n--- Copy this SQL to Supabase SQL Editor ---');
        console.log(createTableSQL);
        console.log('\n--- Also add RLS policies ---');
        console.log(`
-- Enable RLS
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to insert their own tokens
CREATE POLICY "Users can insert their own verification tokens" ON public.verification_tokens
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to select their own tokens
CREATE POLICY "Users can view their own verification tokens" ON public.verification_tokens
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Policy for authenticated users to delete their own tokens
CREATE POLICY "Users can delete their own verification tokens" ON public.verification_tokens
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Policy for service role to manage all tokens
CREATE POLICY "Service role can manage all verification tokens" ON public.verification_tokens
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
        `);
        return false;
      } else {
        console.log('Table might already exist or other error:', altError);
      }
    } else {
      console.log('Table created successfully:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }

  // Test table access
  console.log('\nTesting table access...');
  try {
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('count(*)')
      .single();
      
    if (error) {
      console.error('Error accessing table:', error);
      return false;
    }
    
    console.log('Table access successful. Current count:', data?.count || 0);
    return true;
  } catch (err) {
    console.error('Error testing table access:', err);
    return false;
  }
}

// Run the function
createVerificationTokensTable()
  .then((success) => {
    if (success) {
      console.log('\n✅ verification_tokens table is ready!');
    } else {
      console.log('\n❌ Please create the table manually using the SQL provided above.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });