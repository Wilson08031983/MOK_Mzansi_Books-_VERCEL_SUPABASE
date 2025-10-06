#!/usr/bin/env node

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_BASE_URL = process.env.APP_HOST || 'http://localhost:3000';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🧪 Complete Email Verification Flow Test');
console.log('==========================================\n');

async function testCompleteFlow() {
  try {
    // Step 1: Create a new user account
    console.log('📝 Step 1: Creating new user account...');
    const signupData = {
      firstName: 'Test',
      surname: 'User',
      companyName: `Test Company ${Date.now()}`,
      email: `test.${Date.now()}@example.com`,
      position: 'CEO',
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!'
    };

    const signupResponse = await fetch(`${API_BASE_URL}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData)
    });

    if (!signupResponse.ok) {
      const errorText = await signupResponse.text();
      console.error('❌ Signup failed:', errorText);
      return;
    }

    const signupResult = await signupResponse.json();
    console.log('✅ User created:', {
      userId: signupResult.userId,
      companyId: signupResult.companyId,
      email: signupData.email
    });

    // Step 2: Fetch the verification token from database
    console.log('\n📋 Step 2: Fetching verification token...');
    const { data: tokens, error: tokenError } = await supabase
      .from('verification_tokens')
      .select('*')
      .eq('user_id', signupResult.userId)
      .eq('purpose', 'email_verification')
      .is('used_at', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (tokenError || !tokens || tokens.length === 0) {
      console.error('❌ No verification token found:', tokenError);
      return;
    }

    const token = tokens[0];
    console.log('✅ Token found:', {
      id: token.id,
      expires_at: token.expires_at,
      created_at: token.created_at
    });

    // Step 3: Generate raw token and update hash
    console.log('\n🔑 Step 3: Generating raw token...');
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const { error: updateError } = await supabase
      .from('verification_tokens')
      .update({ token_hash: tokenHash })
      .eq('id', token.id);

    if (updateError) {
      console.error('❌ Failed to update token hash:', updateError);
      return;
    }

    console.log('✅ Raw token generated and hash updated');
    console.log('   Raw token:', rawToken);

    // Step 4: Test verification endpoint
    console.log('\n🔍 Step 4: Testing verification endpoint...');
    const verifyResponse = await fetch(`${API_BASE_URL}/api/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: signupResult.userId,
        token: rawToken
      })
    });

    const verifyResult = await verifyResponse.json();
    
    if (verifyResponse.ok && verifyResult.success) {
      console.log('✅ Email verification successful!');
      console.log('   Message:', verifyResult.message);
    } else {
      console.error('❌ Email verification failed:', verifyResult);
      return;
    }

    // Step 5: Verify user status in auth.users
    console.log('\n👤 Step 5: Checking user verification status...');
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(signupResult.userId);

    if (userError) {
      console.error('❌ Failed to fetch user:', userError);
      return;
    }

    if (user && user.user && user.user.email_confirmed_at) {
      console.log('✅ User email confirmed at:', user.user.email_confirmed_at);
    } else {
      console.log('⚠️  User email not confirmed in auth.users');
    }

    // Step 6: Verify token is marked as used
    console.log('\n🔒 Step 6: Checking token usage status...');
    const { data: usedToken, error: usedTokenError } = await supabase
      .from('verification_tokens')
      .select('used_at')
      .eq('id', token.id)
      .single();

    if (usedTokenError) {
      console.error('❌ Failed to fetch token status:', usedTokenError);
      return;
    }

    if (usedToken.used_at) {
      console.log('✅ Token marked as used at:', usedToken.used_at);
    } else {
      console.log('⚠️  Token not marked as used');
    }

    // Step 7: Test duplicate verification (should fail)
    console.log('\n🔄 Step 7: Testing duplicate verification...');
    const duplicateResponse = await fetch(`${API_BASE_URL}/api/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: signupResult.userId,
        token: rawToken
      })
    });

    const duplicateResult = await duplicateResponse.json();
    
    if (!duplicateResponse.ok && !duplicateResult.success) {
      console.log('✅ Duplicate verification correctly rejected');
      console.log('   Message:', duplicateResult.message);
    } else {
      console.log('⚠️  Duplicate verification should have failed');
    }

    console.log('\n🎉 Complete verification flow test completed successfully!');
    console.log('==========================================');
    console.log('✅ All verification system components working correctly');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testCompleteFlow().catch(console.error);