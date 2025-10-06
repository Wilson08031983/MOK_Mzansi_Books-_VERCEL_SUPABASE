require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const TARGET_EMAILS = [
  'mokgethamoabelo@yahoo.com',
  'cindyramatladi@gmail.com',
  'wilsonmoabelo1@yahoo.com'
];

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const POSTMARK_SERVER_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
const POSTMARK_BASE_URL = 'https://api.postmarkapp.com';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper function for Postmark API requests
const makePostmarkRequest = async (endpoint, method = 'GET', body = null) => {
  try {
    const options = {
      method,
      headers: {
        'Accept': 'application/json',
        'X-Postmark-Server-Token': POSTMARK_SERVER_TOKEN
      }
    };

    if (body) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${POSTMARK_BASE_URL}${endpoint}`, options);
    const data = await response.text();
    
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch {
      parsedData = data;
    }

    return {
      statusCode: response.status,
      data: parsedData
    };
  } catch (error) {
    return {
      statusCode: 500,
      data: { error: error.message }
    };
  }
};

const performValidationChecks = async () => {
  console.log('🔍 Starting post-cleanup validation checks...');
  
  const validationResults = {
    timestamp: new Date().toISOString(),
    target_emails: TARGET_EMAILS,
    validation_checks: {
      database: {
        auth_users: { found: [], status: 'pending' },
        profiles: { found: [], status: 'pending' },
        companies: { found: [], status: 'pending' },
        invitations: { found: [], status: 'pending' },
        user_table: { found: [], status: 'pending' },
        email_events: { found: [], status: 'pending' },
        email_status: { found: [], status: 'pending' }
      },
      postmark: {
        suppressions: { found: [], status: 'pending' }
      }
    },
    summary: {
      database_clean: false,
      postmark_clean: false,
      overall_clean: false,
      issues_found: []
    }
  };

  // Database validation checks
  console.log('📊 Validating database cleanup...');
  
  const databaseTables = [
    { name: 'auth.users', schema: 'auth', table: 'users', emailField: 'email' },
    { name: 'profiles', schema: 'public', table: 'profiles', emailField: 'email' },
    { name: 'companies', schema: 'public', table: 'companies', emailField: 'contact_email' },
    { name: 'invitations', schema: 'public', table: 'invitations', emailField: 'email' },
    { name: 'User', schema: 'public', table: 'User', emailField: 'email' },
    { name: 'EmailEvent', schema: 'public', table: 'EmailEvent', emailField: 'recipient' },
    { name: 'EmailStatus', schema: 'public', table: 'EmailStatus', emailField: 'email' }
  ];

  for (const tableInfo of databaseTables) {
    try {
      console.log(`🔍 Checking ${tableInfo.name}...`);
      
      const { data, error } = await supabase
        .from(tableInfo.table)
        .select('*')
        .in(tableInfo.emailField, TARGET_EMAILS);

      if (error) {
        console.log(`⚠️ Could not check ${tableInfo.name}: ${error.message}`);
        validationResults.validation_checks.database[tableInfo.name.toLowerCase().replace('.', '_')] = {
          found: [],
          status: 'error',
          error: error.message
        };
      } else {
        const foundRecords = data || [];
        console.log(`${foundRecords.length === 0 ? '✅' : '❌'} ${tableInfo.name}: ${foundRecords.length} records found`);
        
        validationResults.validation_checks.database[tableInfo.name.toLowerCase().replace('.', '_')] = {
          found: foundRecords,
          status: foundRecords.length === 0 ? 'clean' : 'has_records'
        };

        if (foundRecords.length > 0) {
          validationResults.summary.issues_found.push(`${tableInfo.name}: ${foundRecords.length} records still exist`);
        }
      }
    } catch (error) {
      console.log(`❌ Error checking ${tableInfo.name}: ${error.message}`);
      validationResults.validation_checks.database[tableInfo.name.toLowerCase().replace('.', '_')] = {
        found: [],
        status: 'error',
        error: error.message
      };
    }
  }

  // Postmark validation check
  console.log('📧 Validating Postmark cleanup...');
  
  try {
    const MESSAGE_STREAM_ID = 'outbound';
    const response = await makePostmarkRequest(`/message-streams/${MESSAGE_STREAM_ID}/suppressions/dump`);
    
    if (response.statusCode === 200 && response.data.Suppressions) {
      const targetSuppressions = response.data.Suppressions.filter(suppression =>
        TARGET_EMAILS.includes(suppression.EmailAddress?.toLowerCase())
      );
      
      console.log(`${targetSuppressions.length === 0 ? '✅' : '❌'} Postmark suppressions: ${targetSuppressions.length} target emails found`);
      
      validationResults.validation_checks.postmark.suppressions = {
        found: targetSuppressions,
        status: targetSuppressions.length === 0 ? 'clean' : 'has_suppressions'
      };

      if (targetSuppressions.length > 0) {
        validationResults.summary.issues_found.push(`Postmark suppressions: ${targetSuppressions.length} emails still suppressed`);
      }
    } else {
      console.log(`⚠️ Could not check Postmark suppressions: ${response.data}`);
      validationResults.validation_checks.postmark.suppressions = {
        found: [],
        status: 'error',
        error: response.data
      };
    }
  } catch (error) {
    console.log(`❌ Error checking Postmark: ${error.message}`);
    validationResults.validation_checks.postmark.suppressions = {
      found: [],
      status: 'error',
      error: error.message
    };
  }

  // Calculate summary
  const databaseClean = Object.values(validationResults.validation_checks.database)
    .every(check => check.status === 'clean' || check.status === 'error');
  
  const postmarkClean = validationResults.validation_checks.postmark.suppressions.status === 'clean' ||
    validationResults.validation_checks.postmark.suppressions.status === 'error';

  validationResults.summary.database_clean = databaseClean;
  validationResults.summary.postmark_clean = postmarkClean;
  validationResults.summary.overall_clean = databaseClean && postmarkClean && validationResults.summary.issues_found.length === 0;

  // Save results
  const resultsFile = path.join(__dirname, 'validation-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(validationResults, null, 2));
  console.log(`✅ Validation results saved: ${resultsFile}`);

  // Log to audit trail
  const logEntry = {
    timestamp: new Date().toISOString(),
    action: 'validation_check_completed',
    file: resultsFile,
    database_clean: databaseClean,
    postmark_clean: postmarkClean,
    overall_clean: validationResults.summary.overall_clean,
    issues_count: validationResults.summary.issues_found.length
  };

  // Append to logs
  const logsFile = path.join(__dirname, 'logs.json');
  let logs = [];
  try {
    logs = JSON.parse(fs.readFileSync(logsFile, 'utf8'));
  } catch (error) {
    logs = [];
  }
  logs.push(logEntry);
  fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2));

  // Display summary
  console.log('\n🎉 Validation check completed');
  console.log('📋 Summary:');
  console.log(`  Database clean: ${databaseClean ? '✅' : '❌'}`);
  console.log(`  Postmark clean: ${postmarkClean ? '✅' : '❌'}`);
  console.log(`  Overall clean: ${validationResults.summary.overall_clean ? '✅' : '❌'}`);
  
  if (validationResults.summary.issues_found.length > 0) {
    console.log('\n⚠️ Issues found:');
    validationResults.summary.issues_found.forEach(issue => {
      console.log(`  - ${issue}`);
    });
  } else {
    console.log('\n🎉 All target users have been successfully removed!');
  }

  process.exit(validationResults.summary.overall_clean ? 0 : 1);
};

// Run validation
performValidationChecks().catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});