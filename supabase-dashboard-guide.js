require('dotenv').config({ path: '.env.local' });

console.log('🔧 Supabase Dashboard Access Guide');
console.log('=====================================\n');

const supabaseUrl = process.env.SUPABASE_URL;
if (supabaseUrl) {
  // Extract project ID from URL
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (projectId) {
    console.log('📋 Your Supabase Project Details:');
    console.log(`   Project ID: ${projectId}`);
    console.log(`   Project URL: ${supabaseUrl}\n`);
    
    console.log('🌐 Correct Dashboard URLs:');
    console.log(`   Main Dashboard: https://supabase.com/dashboard/project/${projectId}`);
    console.log(`   SQL Editor: https://supabase.com/dashboard/project/${projectId}/sql/new`);
    console.log(`   Table Editor: https://supabase.com/dashboard/project/${projectId}/editor\n`);
    
    console.log('📝 Steps to Create the Table:');
    console.log('   1. Go to the SQL Editor URL above');
    console.log('   2. Paste the SQL provided earlier');
    console.log('   3. Click "Run" to execute\n');
    
    console.log('🔄 Alternative Method - Table Editor:');
    console.log('   1. Go to the Table Editor URL above');
    console.log('   2. Click "Create a new table"');
    console.log('   3. Name it "verification_tokens"');
    console.log('   4. Add columns manually\n');
  }
} else {
  console.log('❌ Could not find SUPABASE_URL in .env.local');
}

console.log('📋 Table Schema (for manual creation):');
console.log('=====================================');
console.log('Table Name: verification_tokens');
console.log('Schema: public\n');

console.log('Columns:');
console.log('- id: UUID, Primary Key, Default: gen_random_uuid()');
console.log('- user_id: UUID, Foreign Key to auth.users(id), NOT NULL');
console.log('- token: VARCHAR(255), UNIQUE, NOT NULL');
console.log('- expires_at: TIMESTAMP WITH TIME ZONE, NOT NULL');
console.log('- created_at: TIMESTAMP WITH TIME ZONE, Default: NOW()');
console.log('- updated_at: TIMESTAMP WITH TIME ZONE, Default: NOW()');
