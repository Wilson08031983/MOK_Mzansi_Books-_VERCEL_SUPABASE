const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTable() {
  console.log('🔧 Creating verification_tokens table...');
  
  try {
    // First, let's try to check if the table exists
    const { data: existingData, error: existingError } = await supabase
      .from('verification_tokens')
      .select('*')
      .limit(1);
    
    if (!existingError) {
      console.log('✅ verification_tokens table already exists!');
      return true;
    }
    
    console.log('Table does not exist, creating it...');
    
    // Use raw SQL query through the REST API
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: `
          CREATE TABLE IF NOT EXISTS public.verification_tokens (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            token VARCHAR(255) NOT NULL UNIQUE,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON public.verification_tokens(user_id);
          CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON public.verification_tokens(token);
          CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at ON public.verification_tokens(expires_at);
          
          ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
        `
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to create table:', response.status, errorText);
      return false;
    }
    
    console.log('✅ Table created successfully!');
    
    // Test access
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

createTable().then(success => {
  process.exit(success ? 0 : 1);
});
