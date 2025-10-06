import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createProfilesTable() {
  console.log('🔧 Creating profiles table...');
  
  try {
    // First, check if the table exists
    const { data: existingTables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles');
    
    if (checkError) {
      console.log('⚠️  Could not check existing tables:', checkError.message);
    }
    
    // Create the profiles table using raw SQL
    const createTableSQL = `
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
    `;
    
    const { data, error } = await supabase.rpc('exec', { sql: createTableSQL });
    
    if (error) {
      console.error('❌ Error creating profiles table:', error.message);
      
      // Try alternative approach - create table using direct SQL execution
      console.log('🔄 Trying alternative approach...');
      
      const { data: altData, error: altError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (altError && altError.message.includes('does not exist')) {
        console.log('📝 Table does not exist, attempting to create via SQL...');
        
        // Use the SQL editor approach
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({ sql: createTableSQL })
        });
        
        if (response.ok) {
          console.log('✅ Profiles table created successfully via REST API');
        } else {
          const errorText = await response.text();
          console.error('❌ Failed to create table via REST API:', errorText);
        }
      } else {
        console.log('✅ Profiles table already exists or is accessible');
      }
    } else {
      console.log('✅ Profiles table created successfully');
    }
    
    // Verify the table was created
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      console.log('✅ Profiles table is accessible');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createProfilesTable();