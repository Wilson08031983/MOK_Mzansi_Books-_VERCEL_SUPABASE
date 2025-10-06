require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  console.log('SUPABASE_URL:', supabaseUrl ? 'present' : 'missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'present' : 'missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkVerificationToken() {
  try {
    console.log('Checking verification_tokens table...');
    
    // Get the most recent verification token
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error querying verification_tokens:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Most recent verification token found:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('❌ No verification tokens found in the table');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkVerificationToken();