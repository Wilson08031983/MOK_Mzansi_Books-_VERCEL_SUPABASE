-- Create verification_tokens table
-- Run this SQL in your Supabase Dashboard SQL Editor

-- Create the verification_tokens table
CREATE TABLE IF NOT EXISTS public.verification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON public.verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON public.verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at ON public.verification_tokens(expires_at);

-- Enable Row Level Security
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert their own verification tokens" ON public.verification_tokens;
DROP POLICY IF EXISTS "Users can view their own verification tokens" ON public.verification_tokens;
DROP POLICY IF EXISTS "Users can delete their own verification tokens" ON public.verification_tokens;
DROP POLICY IF EXISTS "Service role can manage all verification tokens" ON public.verification_tokens;

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

-- Policy for service role to manage all tokens (for API operations)
CREATE POLICY "Service role can manage all verification tokens" ON public.verification_tokens
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Create a function to clean up expired tokens (optional but recommended)
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

-- Grant execute permission on the cleanup function
GRANT EXECUTE ON FUNCTION public.cleanup_expired_verification_tokens() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_verification_tokens() TO service_role;

-- Test the table by inserting and immediately deleting a test record
-- (This will only work if you have a valid user_id in auth.users)
-- DO $$
-- DECLARE
--   test_user_id UUID;
-- BEGIN
--   -- Get a user ID for testing (if any users exist)
--   SELECT id INTO test_user_id FROM auth.users LIMIT 1;
--   
--   IF test_user_id IS NOT NULL THEN
--     -- Insert test token
--     INSERT INTO public.verification_tokens (user_id, token, expires_at)
--     VALUES (test_user_id, 'test-token-' || gen_random_uuid(), NOW() + INTERVAL '1 hour');
--     
--     -- Clean up test token
--     DELETE FROM public.verification_tokens WHERE token LIKE 'test-token-%';
--     
--     RAISE NOTICE 'verification_tokens table test completed successfully!';
--   ELSE
--     RAISE NOTICE 'No users found for testing, but table structure is ready.';
--   END IF;
-- END $$;