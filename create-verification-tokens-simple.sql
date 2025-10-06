-- Simplified SQL script to create verification_tokens table
-- Execute this step by step in Supabase SQL Editor

-- Step 1: Drop existing table if it has issues (CAUTION: This will delete data)
DROP TABLE IF EXISTS public.verification_tokens CASCADE;

-- Step 2: Create the verification_tokens table with all required columns
CREATE TABLE public.verification_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    purpose TEXT NOT NULL DEFAULT 'email_verification',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Add foreign key constraint
ALTER TABLE public.verification_tokens 
ADD CONSTRAINT fk_verification_tokens_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 4: Create indexes
CREATE INDEX idx_verification_tokens_user_id ON public.verification_tokens(user_id);
CREATE INDEX idx_verification_tokens_token_hash ON public.verification_tokens(token_hash);
CREATE INDEX idx_verification_tokens_expires_at ON public.verification_tokens(expires_at);
CREATE INDEX idx_verification_tokens_purpose ON public.verification_tokens(purpose);

-- Step 5: Enable RLS
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
CREATE POLICY "Users can access own tokens" ON public.verification_tokens
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON public.verification_tokens
    FOR ALL USING (auth.role() = 'service_role');

-- Step 7: Grant permissions
GRANT ALL ON public.verification_tokens TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.verification_tokens TO authenticated;

-- Step 8: Create cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.verification_tokens 
    WHERE expires_at < NOW() 
       OR (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '7 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Step 9: Grant function permissions
GRANT EXECUTE ON FUNCTION public.cleanup_expired_verification_tokens() TO service_role;

-- Step 10: Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Step 11: Create trigger
CREATE TRIGGER verification_tokens_updated_at
    BEFORE UPDATE ON public.verification_tokens
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Step 12: Verify table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'verification_tokens'
ORDER BY ordinal_position;