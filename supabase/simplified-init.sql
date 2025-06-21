-- Create basic schema for MOK Mzansi Books application
CREATE SCHEMA IF NOT EXISTS public;

-- Create users table (since we don't have auth schema)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create company table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT,
    vat_number TEXT,
    registration_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_token TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    company_id UUID REFERENCES public.companies(id),
    invited_by UUID REFERENCES public.users(id),
    status TEXT DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert some sample data
INSERT INTO public.companies (id, name, email) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'MOK Mzansi Books', 'info@mokmzansibooks.com')
ON CONFLICT DO NOTHING;

-- Sample invitation
INSERT INTO public.invitations (invitation_token, email, company_id, status, expires_at) VALUES
  ('sample-token-12345', 'test@example.com', '11111111-1111-1111-1111-111111111111', 'pending', (now() + interval '7 days'))
ON CONFLICT DO NOTHING;
