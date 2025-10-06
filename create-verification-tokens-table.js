const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createVerificationTokensTable() {
  console.log('🔧 Creating verification_tokens table...');
  
  try {
    // Create the verification_tokens table with proper structure
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.verification_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        purpose TEXT NOT NULL DEFAULT 'email_verification',
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;
    
    // Execute the SQL directly using the REST API
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });
    
    if (error) {
      console.error('❌ Error creating table with RPC:', error);
      
      // Try alternative approach using raw SQL
      console.log('🔄 Trying alternative approach...');
      
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({ sql: createTableSQL })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Alternative approach failed:', errorText);
        return false;
      }
      
      console.log('✅ Table created using alternative approach');
    } else {
      console.log('✅ Table created successfully using RPC');
    }
    
    // Enable RLS on the table
    console.log('🔒 Enabling Row Level Security...');
    const enableRLSSQL = `
      ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
    `;
    
    await supabase.rpc('exec_sql', { sql: enableRLSSQL });
    
    // Create RLS policies
    console.log('📋 Creating RLS policies...');
    const createPoliciesSQL = `
      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can view their own verification tokens" ON public.verification_tokens;
      DROP POLICY IF EXISTS "Service role can manage verification tokens" ON public.verification_tokens;
      
      -- Create policy for users to view their own tokens
      CREATE POLICY "Users can view their own verification tokens"
        ON public.verification_tokens FOR SELECT
        USING (auth.uid() = user_id);
      
      -- Create policy for service role to manage all tokens
      CREATE POLICY "Service role can manage verification tokens"
        ON public.verification_tokens FOR ALL
        USING (auth.role() = 'service_role');
    `;
    
    await supabase.rpc('exec_sql', { sql: createPoliciesSQL });
    
    console.log('🎉 verification_tokens table setup completed!');
    
    // Test the table
    console.log('🧪 Testing table access...');
    const { data: testData, error: testError } = await supabase
      .from('verification_tokens')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Table test failed:', testError);
      return false;
    }
    
    console.log('✅ Table is accessible and working!');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

createVerificationTokensTable().catch(console.error);