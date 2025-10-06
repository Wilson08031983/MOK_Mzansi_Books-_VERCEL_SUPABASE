-- Update verification_tokens table to match code expectations
-- This script adds the missing columns and updates the structure

-- First, add the missing columns
ALTER TABLE public.verification_tokens 
ADD COLUMN IF NOT EXISTS token_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS purpose VARCHAR(50) DEFAULT 'email_verification',
ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE;

-- Update existing data if any (rename token to token_hash)
UPDATE public.verification_tokens 
SET token_hash = token 
WHERE token_hash IS NULL AND token IS NOT NULL;

-- Drop the old token column after copying data
ALTER TABLE public.verification_tokens DROP COLUMN IF EXISTS token;

-- Make token_hash NOT NULL and UNIQUE
ALTER TABLE public.verification_tokens 
ALTER COLUMN token_hash SET NOT NULL;

-- Add unique constraint on token_hash
ALTER TABLE public.verification_tokens 
ADD CONSTRAINT IF NOT EXISTS unique_token_hash UNIQUE (token_hash);

-- Update indexes to use token_hash instead of token
DROP INDEX IF EXISTS idx_verification_tokens_token;
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token_hash ON public.verification_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_purpose ON public.verification_tokens(purpose);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_used_at ON public.verification_tokens(used_at);

-- Update RLS policies to work with new structure
DROP POLICY IF EXISTS "Users can insert their own verification tokens" ON public.verification_tokens;
DROP POLICY IF EXISTS "Users can view their own verification tokens" ON public.verification_tokens;
DROP POLICY IF EXISTS "Users can delete their own verification tokens" ON public.verification_tokens;
DROP POLICY IF EXISTS "Service role can manage all verification tokens" ON public.verification_tokens;

-- Recreate policies with updated structure
CREATE POLICY "Users can insert their own verification tokens" ON public.verification_tokens 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own verification tokens" ON public.verification_tokens 
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification tokens" ON public.verification_tokens 
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own verification tokens" ON public.verification_tokens 
  FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all verification tokens" ON public.verification_tokens 
  FOR ALL TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Update the cleanup function to also clean up used tokens older than 7 days
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete expired tokens and used tokens older than 7 days
  DELETE FROM public.verification_tokens 
  WHERE expires_at < NOW() 
     OR (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '7 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.cleanup_expired_verification_tokens() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_verification_tokens() TO service_role;

-- Display final table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'verification_tokens' 
  AND table_schema = 'public'
ORDER BY ordinal_position;