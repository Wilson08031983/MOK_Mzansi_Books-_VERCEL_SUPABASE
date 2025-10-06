require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testTableStructure() {
  console.log('🔍 Testing verification_tokens table after SQL execution...\n');
  
  try {
    // Test 1: Check table structure
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('id, user_id, token_hash, purpose, expires_at, used_at, created_at, updated_at')
      .limit(0);
      
    if (error) {
      console.log('❌ Table structure test failed:', error.message);
      return;
    }
    
    console.log('✅ Table structure test passed!');
    
    // Test 2: Test cleanup function
    const { data: cleanupResult, error: cleanupError } = await supabase
      .rpc('cleanup_expired_verification_tokens');
      
    if (cleanupError) {
      console.log('⚠️  Cleanup function test failed:', cleanupError.message);
    } else {
      console.log('✅ Cleanup function test passed!');
    }
    
    console.log('\n🎉 Table is ready for email verification flow!');
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

testTableStructure();
