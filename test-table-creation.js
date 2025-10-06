const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testTableCreation() {
  console.log('🔧 Testing verification_tokens table access...');
  
  try {
    // First, check if table exists by trying to select from it
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('*')
      .limit(1);
    
    if (!error) {
      console.log('✅ verification_tokens table already exists!');
      console.log('Current records:', data?.length || 0);
      return true;
    }
    
    console.log('Table access error:', error.message);
    
    if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
      console.log('❌ Table does not exist. Please create it manually in Supabase Dashboard.');
      console.log('\n📋 Copy and paste this SQL in your Supabase Dashboard SQL Editor:');
      console.log('\n--- START SQL ---');
      console.log(`
-- Create the verification_tokens table
CREATE TABLE IF NOT EXISTS public.verification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON public.verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON public.verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at ON public.verification_tokens(expires_at);

-- Enable Row Level Security
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can insert their own verification tokens" ON public.verification_tokens
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own verification tokens" ON public.verification_tokens
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own verification tokens" ON public.verification_tokens
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all verification tokens" ON public.verification_tokens
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Create cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.verification_tokens 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.cleanup_expired_verification_tokens() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_verification_tokens() TO service_role;
      `);
      console.log('--- END SQL ---\n');
      
      console.log('🌐 Go to: https://ulduqjddmhnwvdeeldsb.supabase.co/project/ulduqjddmhnwvdeeldsb/sql/new');
      console.log('📝 Paste the SQL above and click "Run"');
      
      return false;
    }
    
    console.log('❌ Unexpected error:', error);
    return false;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

testTableCreation().then(success => {
  if (success) {
    console.log('\n🎉 Table is ready for use!');
  } else {
    console.log('\n⚠️  Please create the table manually using the SQL provided above.');
  }
  process.exit(success ? 0 : 1);
});
