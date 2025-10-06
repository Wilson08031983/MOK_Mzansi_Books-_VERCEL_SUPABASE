require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getStoredToken() {
  try {
    // Get the most recent verification token for our test user
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('*')
      .eq('user_id', 'b73eb6db-0c23-40c8-a9e3-ea6a17e87f24')
      .eq('purpose', 'email_verification')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching token:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('No verification token found');
      return;
    }

    const token = data[0];
    console.log('Stored Token Details:');
    console.log('ID:', token.id);
    console.log('User ID:', token.user_id);
    console.log('Token Hash:', token.token_hash);
    console.log('Purpose:', token.purpose);
    console.log('Expires At:', token.expires_at);
    console.log('Used At:', token.used_at);
    console.log('Created At:', token.created_at);

    // Now let's try to understand what the raw token should be
    // The token hash we have is: d0c643af613072e794168ed5d939605f750ff4caf0816e147ac3523c5b6216c4
    
    console.log('\n--- Analysis ---');
    console.log('Token hash length:', token.token_hash.length);
    console.log('This is a SHA256 hash (64 hex characters)');
    
    // The issue is that we need the RAW token that was generated, not the hash
    // Let's check if there's any pattern or if we can find it elsewhere
    
  } catch (error) {
    console.error('Error:', error);
  }
}

getStoredToken();