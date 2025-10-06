require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getLatestToken() {
  try {
    // Get the most recent verification token
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('*')
      .eq('user_id', '02e6e8a4-dba5-4128-a0e9-a8b5260987ca')
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
    console.log('Latest Token Details:');
    console.log('User ID:', token.user_id);
    console.log('Token Hash:', token.token_hash);
    console.log('Purpose:', token.purpose);
    console.log('Expires At:', token.expires_at);
    console.log('Used At:', token.used_at);
    console.log('Created At:', token.created_at);

    return {
      userId: token.user_id,
      tokenHash: token.token_hash
    };
    
  } catch (error) {
    console.error('Error:', error);
  }
}

getLatestToken();