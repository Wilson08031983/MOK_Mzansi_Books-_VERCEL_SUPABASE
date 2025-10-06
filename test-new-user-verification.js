import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testNewUserVerification() {
  const userId = 'e1e15a7a-c156-4bdd-9383-1788531ac510';
  
  console.log('🔍 Getting verification token for user:', userId);
  
  // Get the verification token for this user
  const { data: tokens, error } = await supabase
    .from('verification_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('purpose', 'email_verification')
    .is('used_at', null)
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) {
    console.error('❌ Error fetching token:', error.message);
    return;
  }
  
  if (!tokens || tokens.length === 0) {
    console.error('❌ No unused verification token found for user');
    return;
  }
  
  const token = tokens[0];
  console.log('📧 Found token:', {
    id: token.id,
    user_id: token.user_id,
    purpose: token.purpose,
    expires_at: token.expires_at,
    used_at: token.used_at
  });
  
  // We need to get the raw token - but we only have the hash
  // For testing, let's create a new token
  console.log('🔧 Creating a new test token...');
  
  const testResponse = await fetch('http://localhost:3000/api/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test-verification-' + Date.now() + '@example.com',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      surname: 'TestSurname',
      position: 'Test Position',
      companyName: 'Test Company'
    }),
  });
  
  const testResult = await testResponse.json();
  console.log('📝 Test signup result:', testResult);
  
  if (testResult.success && testResult.userId) {
    // Get the token for this new user
    const { data: newTokens, error: newError } = await supabase
      .from('verification_tokens')
      .select('*')
      .eq('user_id', testResult.userId)
      .eq('purpose', 'email_verification')
      .is('used_at', null)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (newError) {
      console.error('❌ Error fetching new token:', newError.message);
      return;
    }
    
    if (newTokens && newTokens.length > 0) {
      console.log('✅ New token created for testing');
      console.log('🔗 Use this in your verification URL: userId=' + testResult.userId + '&token=<RAW_TOKEN>');
      console.log('📋 Token hash in database:', newTokens[0].token_hash);
    }
  }
}

testNewUserVerification();