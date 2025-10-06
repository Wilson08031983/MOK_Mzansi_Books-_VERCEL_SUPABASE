const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function monitorVerificationTokens() {
  console.log('🔍 Monitoring verification_tokens table...\n');
  
  try {
    // Get current tokens
    const { data: tokens, error } = await supabase
      .from('verification_tokens')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching tokens:', error.message);
      return;
    }

    console.log(`📊 Current verification tokens: ${tokens.length}`);
    
    if (tokens.length > 0) {
      console.log('\n📋 Token Details:');
      tokens.forEach((token, index) => {
        console.log(`\n${index + 1}. Token ID: ${token.id}`);
        console.log(`   User ID: ${token.user_id}`);
        console.log(`   Purpose: ${token.purpose}`);
        console.log(`   Created: ${new Date(token.created_at).toLocaleString()}`);
        console.log(`   Expires: ${new Date(token.expires_at).toLocaleString()}`);
        console.log(`   Used: ${token.used_at ? new Date(token.used_at).toLocaleString() : 'Not used'}`);
        console.log(`   Status: ${token.used_at ? '✅ Used' : (new Date(token.expires_at) > new Date() ? '⏳ Active' : '❌ Expired')}`);
      });
    } else {
      console.log('📝 No verification tokens found');
    }

    // Get recent users for context
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, email, email_verified, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!userError && users.length > 0) {
      console.log('\n👥 Recent Users:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.email_verified ? '✅ Verified' : '❌ Unverified'} (${new Date(user.created_at).toLocaleString()})`);
      });
    }

  } catch (error) {
    console.error('❌ Monitoring error:', error.message);
  }
}

// Run monitoring
monitorVerificationTokens();

// Optional: Set up real-time monitoring
console.log('\n🔄 Setting up real-time monitoring...');
console.log('Press Ctrl+C to stop monitoring\n');

setInterval(async () => {
  console.log('\n' + '='.repeat(50));
  console.log(`🕐 ${new Date().toLocaleString()}`);
  await monitorVerificationTokens();
}, 10000); // Check every 10 seconds