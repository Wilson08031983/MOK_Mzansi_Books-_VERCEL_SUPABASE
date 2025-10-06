import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCompleteFlow() {
  console.log('🚀 Starting complete verification flow test...\n');
  
  // Step 1: Create a new user
  console.log('📝 Step 1: Creating new user...');
  const testEmail = 'test-complete-' + Date.now() + '@example.com';
  
  const signupResponse = await fetch('http://localhost:3000/api/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: testEmail,
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      surname: 'TestSurname',
      position: 'Test Position',
      companyName: 'Test Company'
    }),
  });
  
  const signupResult = await signupResponse.json();
  console.log('✅ Signup result:', signupResult);
  
  if (!signupResult.success) {
    console.error('❌ Signup failed');
    return;
  }
  
  const userId = signupResult.userId;
  console.log('👤 User ID:', userId);
  
  // Step 2: Get the verification token from database
  console.log('\n🔍 Step 2: Getting verification token...');
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
    console.error('❌ No verification token found');
    return;
  }
  
  const tokenRecord = tokens[0];
  console.log('📧 Token record:', {
    id: tokenRecord.id,
    user_id: tokenRecord.user_id,
    token_hash: tokenRecord.token_hash,
    purpose: tokenRecord.purpose,
    expires_at: tokenRecord.expires_at
  });
  
  // Step 3: Generate a raw token and test verification
  console.log('\n🔧 Step 3: Creating raw token for verification...');
  
  // Generate a new raw token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  
  console.log('🔑 Generated raw token:', rawToken);
  console.log('🔒 Token hash:', tokenHash);
  
  // Update the database with our new token hash
  const { error: updateError } = await supabase
    .from('verification_tokens')
    .update({ token_hash: tokenHash })
    .eq('id', tokenRecord.id);
  
  if (updateError) {
    console.error('❌ Error updating token:', updateError.message);
    return;
  }
  
  console.log('✅ Token updated in database');
  
  // Step 4: Test verification
  console.log('\n🔐 Step 4: Testing verification...');
  
  const verificationResponse = await fetch(`http://localhost:3000/api/verify-email?userId=${userId}&token=${rawToken}`, {
    method: 'GET',
  });
  
  let verificationResult;
  const responseText = await verificationResponse.text();
  
  try {
    verificationResult = JSON.parse(responseText);
  } catch (e) {
    console.log('📊 Verification response status:', verificationResponse.status);
    console.log('📋 Raw response (first 500 chars):', responseText.substring(0, 500));
    console.log('❌ Response is not JSON, likely an HTML error page');
    return;
  }
  
  console.log('📊 Verification response status:', verificationResponse.status);
  console.log('📋 Verification result:', verificationResult);
  
  // Step 5: Check if user is verified
  console.log('\n✅ Step 5: Checking user verification status...');
  
  // Check auth.users table
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
  
  if (authError) {
    console.error('❌ Error fetching auth user:', authError.message);
  } else {
    console.log('👤 Auth user email_confirmed:', authUser.user?.email_confirmed_at ? 'YES' : 'NO');
  }
  
  // Check if token was marked as used
  const { data: updatedToken, error: tokenError } = await supabase
    .from('verification_tokens')
    .select('*')
    .eq('id', tokenRecord.id)
    .single();
  
  if (tokenError) {
    console.error('❌ Error fetching updated token:', tokenError.message);
  } else {
    console.log('🎫 Token used_at:', updatedToken.used_at ? 'USED' : 'NOT USED');
  }
  
  console.log('\n🎉 Complete flow test finished!');
  
  if (verificationResult.success) {
    console.log('✅ VERIFICATION SUCCESSFUL - Email verification is working correctly!');
  } else {
    console.log('❌ VERIFICATION FAILED - There may be an issue with the verification process');
  }
}

testCompleteFlow().catch(console.error);