const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkVerificationTokensTable() {
  console.log('🔍 Checking verification_tokens table...');
  
  try {
    // Try to query the verification_tokens table
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error accessing verification_tokens table:', error);
      return false;
    }
    
    console.log('✅ verification_tokens table exists and is accessible');
    console.log('📊 Sample data count:', data?.length || 0);
    
    // Try to insert a test token to verify write access
    console.log('🧪 Testing token insertion...');
    const testUserId = 'f517b87b-0906-48fc-b87f-e70784f2552e'; // Our test user
    const testTokenHash = 'test_hash_' + Date.now();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    const { data: insertData, error: insertError } = await supabase
      .from('verification_tokens')
      .insert([{
        user_id: testUserId,
        token_hash: testTokenHash,
        purpose: 'email_verification',
        expires_at: expiresAt
      }])
      .select('id')
      .single();
    
    if (insertError) {
      console.error('❌ Error inserting test token:', insertError);
      return false;
    }
    
    console.log('✅ Test token inserted successfully:', insertData.id);
    
    // Clean up test token
    const { error: deleteError } = await supabase
      .from('verification_tokens')
      .delete()
      .eq('id', insertData.id);
    
    if (deleteError) {
      console.warn('⚠️  Warning: Could not clean up test token:', deleteError);
    } else {
      console.log('🧹 Test token cleaned up');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

checkVerificationTokensTable().catch(console.error);