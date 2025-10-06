const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestUser() {
  console.log('👤 Creating test user for verification testing...');
  
  try {
    // Create a test user
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'mokgethamoabelo@yahoo.com',
      password: 'TestPassword123!',
      email_confirm: false, // User needs to verify email
      user_metadata: {
        first_name: 'Mokgetha',
        last_name: 'Moabelo',
        company_name: 'MOK Mzansi Books'
      }
    });
    
    if (error) {
      console.error('❌ Failed to create test user:', error.message);
      return;
    }
    
    console.log('✅ Test user created successfully!');
    console.log('📧 Email:', data.user.email);
    console.log('🆔 User ID:', data.user.id);
    console.log('✉️  Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
    
    // List all users to verify
    console.log('\n📋 All users in auth.users:');
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Failed to list users:', listError.message);
    } else {
      users.users.forEach(user => {
        console.log(`- ${user.email} (ID: ${user.id}, Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

createTestUser().catch(console.error);