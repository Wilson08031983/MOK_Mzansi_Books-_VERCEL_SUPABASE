const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '../.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TARGET_EMAILS = [
  'mokgethamoabelo@yahoo.com',
  'cindyramatladi@gmail.com',
  'wilsonmoabelo1@yahoo.com'
];

async function discoverUserRecords() {
  console.log('🔍 Discovering user records across all tables...');
  
  const discoveries = {
    timestamp: new Date().toISOString(),
    target_emails: TARGET_EMAILS,
    findings: {}
  };
  
  try {
    // Check auth.users table (Supabase built-in)
    console.log('📊 Checking auth.users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (!authError && authUsers?.users) {
      const targetAuthUsers = authUsers.users.filter(user => 
        TARGET_EMAILS.includes(user.email?.toLowerCase())
      );
      discoveries.findings['auth.users'] = targetAuthUsers;
      console.log(`✅ Found ${targetAuthUsers.length} users in auth.users`);
    } else {
      console.log('❌ Could not access auth.users:', authError?.message);
      discoveries.findings['auth.users'] = { error: authError?.message || 'Access denied' };
    }
    
    // Check profiles table
    console.log('📊 Checking profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('email', TARGET_EMAILS);
    
    if (!profilesError) {
      discoveries.findings['profiles'] = profiles || [];
      console.log(`✅ Found ${profiles?.length || 0} records in profiles`);
    } else {
      console.log('❌ Error checking profiles:', profilesError.message);
      discoveries.findings['profiles'] = { error: profilesError.message };
    }
    
    // Check companies table
    console.log('📊 Checking companies...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .in('email', TARGET_EMAILS);
    
    if (!companiesError) {
      discoveries.findings['companies'] = companies || [];
      console.log(`✅ Found ${companies?.length || 0} records in companies`);
    } else {
      console.log('❌ Error checking companies:', companiesError.message);
      discoveries.findings['companies'] = { error: companiesError.message };
    }
    
    // Check invitations table
    console.log('📊 Checking invitations...');
    const { data: invitations, error: invitationsError } = await supabase
      .from('invitations')
      .select('*')
      .in('email', TARGET_EMAILS);
    
    if (!invitationsError) {
      discoveries.findings['invitations'] = invitations || [];
      console.log(`✅ Found ${invitations?.length || 0} records in invitations`);
    } else {
      console.log('❌ Error checking invitations:', invitationsError.message);
      discoveries.findings['invitations'] = { error: invitationsError.message };
    }
    
    // Try to check User table (Prisma style)
    console.log('📊 Checking User table...');
    const { data: users, error: usersError } = await supabase
      .from('User')
      .select('*')
      .in('email', TARGET_EMAILS);
    
    if (!usersError) {
      discoveries.findings['User'] = users || [];
      console.log(`✅ Found ${users?.length || 0} records in User table`);
    } else {
      console.log('❌ Error checking User table:', usersError.message);
      discoveries.findings['User'] = { error: usersError.message };
    }
    
    // Check EmailStatus table
    console.log('📊 Checking EmailStatus...');
    const { data: emailStatus, error: emailStatusError } = await supabase
      .from('EmailStatus')
      .select('*')
      .in('email', TARGET_EMAILS);
    
    if (!emailStatusError) {
      discoveries.findings['EmailStatus'] = emailStatus || [];
      console.log(`✅ Found ${emailStatus?.length || 0} records in EmailStatus`);
    } else {
      console.log('❌ Error checking EmailStatus:', emailStatusError.message);
      discoveries.findings['EmailStatus'] = { error: emailStatusError.message };
    }
    
    // Check EmailEvent table
    console.log('📊 Checking EmailEvent...');
    const { data: emailEvents, error: emailEventsError } = await supabase
      .from('EmailEvent')
      .select('*')
      .in('email', TARGET_EMAILS);
    
    if (!emailEventsError) {
      discoveries.findings['EmailEvent'] = emailEvents || [];
      console.log(`✅ Found ${emailEvents?.length || 0} records in EmailEvent`);
    } else {
      console.log('❌ Error checking EmailEvent:', emailEventsError.message);
      discoveries.findings['EmailEvent'] = { error: emailEventsError.message };
    }
    
    // Save discoveries
    const discoveryFile = path.join(__dirname, 'user-discovery.json');
    fs.writeFileSync(discoveryFile, JSON.stringify(discoveries, null, 2));
    
    console.log(`✅ Discovery completed: ${discoveryFile}`);
    
    // Log the discovery
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: 'user_discovery_completed',
      file: discoveryFile,
      total_findings: Object.keys(discoveries.findings).length,
      target_emails: TARGET_EMAILS
    };
    
    // Append to logs
    const logsFile = path.join(__dirname, 'logs.json');
    const logs = JSON.parse(fs.readFileSync(logsFile, 'utf8'));
    logs.push(logEntry);
    fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2));
    
    return discoveries;
    
  } catch (error) {
    console.error('❌ Discovery failed:', error);
    throw error;
  }
}

// Run discovery if called directly
if (require.main === module) {
  discoverUserRecords()
    .then(discoveries => {
      console.log('🎉 User discovery successful');
      console.log('📋 Summary:');
      Object.entries(discoveries.findings).forEach(([table, records]) => {
        if (records.error) {
          console.log(`  ${table}: ERROR - ${records.error}`);
        } else {
          console.log(`  ${table}: ${Array.isArray(records) ? records.length : 0} records`);
        }
      });
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Discovery failed:', error);
      process.exit(1);
    });
}

module.exports = { discoverUserRecords };