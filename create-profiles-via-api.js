import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

async function createProfilesTableViaAPI() {
  console.log('🔧 Creating profiles table via REST API...');
  
  const createTableSQL = `
    -- Create the profiles table
    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
      email TEXT,
      first_name TEXT,
      last_name TEXT,
      company_name TEXT,
      phone TEXT,
      email_verified BOOLEAN DEFAULT FALSE,
      verified_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY IF NOT EXISTS "Users can view their own profile"
      ON public.profiles FOR SELECT
      USING (auth.uid() = id);

    CREATE POLICY IF NOT EXISTS "Users can update their own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id);

    -- Create a trigger to automatically create a profile when a user signs up
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, email)
      VALUES (NEW.id, NEW.email);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Create the trigger
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `;

  try {
    // Try using the SQL editor endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql: createTableSQL })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Profiles table created successfully via REST API');
      console.log('Result:', result);
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to create table via REST API:', response.status, errorText);
      
      // Try alternative endpoint
      console.log('🔄 Trying alternative endpoint...');
      const altResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ sql: createTableSQL })
      });
      
      if (altResponse.ok) {
        const altResult = await altResponse.json();
        console.log('✅ Profiles table created successfully via alternative endpoint');
        console.log('Result:', altResult);
      } else {
        const altErrorText = await altResponse.text();
        console.error('❌ Alternative endpoint also failed:', altResponse.status, altErrorText);
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createProfilesTableViaAPI();