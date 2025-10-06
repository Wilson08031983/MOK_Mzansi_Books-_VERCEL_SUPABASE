import dotenv from 'dotenv';
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

async function createFreshToken() {
  // Use an existing user ID
  const userId = '0a0795eb-f5f4-4aea-b5d2-e60586908d50';
  
  console.log('🔧 Creating fresh verification token for user:', userId);
  
  // Generate a new raw token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  
  console.log('🔑 Generated raw token:', rawToken);
  console.log('🔒 Token hash:', tokenHash);
  
  // Create expiration date (24 hours from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  
  // Insert new token
  const { data, error } = await supabase
    .from('verification_tokens')
    .insert({
      user_id: userId,
      token_hash: tokenHash,
      purpose: 'email_verification',
      expires_at: expiresAt.toISOString(),
      used_at: null
    })
    .select()
    .single();
  
  if (error) {
    console.error('❌ Error creating token:', error.message);
    return;
  }
  
  console.log('✅ Fresh token created:', {
    id: data.id,
    user_id: data.user_id,
    expires_at: data.expires_at
  });
  
  console.log('\n🔗 Test verification with:');
  console.log(`curl "http://localhost:3000/api/verify-email?userId=${userId}&token=${rawToken}"`);
  
  console.log('\n📋 Or use in test script:');
  console.log(`Raw Token: ${rawToken}`);
  console.log(`User ID: ${userId}`);
}

createFreshToken().catch(console.error);