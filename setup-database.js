const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupDatabase() {
  console.log('🔧 Setting up database schema...');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'supabase', 'init.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.warn(`⚠️  Warning on statement ${i + 1}:`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.warn(`⚠️  Error on statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('🎉 Database setup completed!');
    
    // Test the setup by checking if tables exist
    console.log('🔍 Verifying table creation...');
    
    const tables = ['profiles', 'companies', 'invitations', 'verification_tokens'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Table '${table}' not accessible:`, error.message);
        } else {
          console.log(`✅ Table '${table}' is accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' check failed:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Alternative approach: Create tables directly with Supabase client
async function createTablesDirectly() {
  console.log('🔧 Creating tables directly...');
  
  try {
    // Create profiles table
    console.log('📝 Creating profiles table...');
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (profilesError) {
      console.warn('⚠️  Profiles table creation warning:', profilesError.message);
    } else {
      console.log('✅ Profiles table created');
    }
    
    // Create companies table
    console.log('📝 Creating companies table...');
    const { error: companiesError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (companiesError) {
      console.warn('⚠️  Companies table creation warning:', companiesError.message);
    } else {
      console.log('✅ Companies table created');
    }
    
    // Create verification_tokens table
    console.log('📝 Creating verification_tokens table...');
    const { error: tokensError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.verification_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL,
          purpose TEXT NOT NULL DEFAULT 'email_verification',
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          used_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });
    
    if (tokensError) {
      console.warn('⚠️  Verification tokens table creation warning:', tokensError.message);
    } else {
      console.log('✅ Verification tokens table created');
    }
    
    console.log('🎉 Direct table creation completed!');
    
  } catch (error) {
    console.error('❌ Direct table creation failed:', error);
  }
}

// Run both approaches
async function main() {
  console.log('🚀 Starting database setup...');
  
  // Try direct table creation first
  await createTablesDirectly();
  
  // Then try the SQL file approach
  await setupDatabase();
}

main().catch(console.error);