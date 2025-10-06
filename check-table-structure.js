require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

(async () => {
  try {
    // Try to select from the table to see what columns exist
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Error selecting from verification_tokens:', error);
    } else {
      console.log('Sample data from verification_tokens:', data);
      if (data && data.length > 0) {
        console.log('Available columns:', Object.keys(data[0]));
      }
    }
    
    // Try different column names to see what works
    const testColumns = [
      { type: 'email_verification' },
      { purpose: 'email_verification' },
      { token_type: 'email_verification' },
      { verification_type: 'email_verification' }
    ];
    
    for (const testCol of testColumns) {
      const testRecord = {
        id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000001',
        token_hash: 'test_hash',
        expires_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        ...testCol
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('verification_tokens')
        .insert(testRecord)
        .select();
      
      console.log(`Testing column ${Object.keys(testCol)[0]}:`, insertError ? insertError.message : 'Success');
      
      if (!insertError) {
        // Clean up the test record
        await supabase
          .from('verification_tokens')
          .delete()
          .eq('id', '00000000-0000-0000-0000-000000000000');
        break;
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
})();