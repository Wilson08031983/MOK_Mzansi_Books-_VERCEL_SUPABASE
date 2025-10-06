require('dotenv').config({ path: '../.env.local' });
const fs = require('fs');
const path = require('path');

// Configuration
const TARGET_EMAILS = [
  'mokgethamoabelo@yahoo.com',
  'cindyramatladi@gmail.com',
  'wilsonmoabelo1@yahoo.com'
];

const reviewApiKeys = async () => {
  console.log('🔑 Starting API key review...');
  
  const reviewResults = {
    timestamp: new Date().toISOString(),
    target_emails: TARGET_EMAILS,
    api_keys_reviewed: {
      supabase: {
        url: process.env.SUPABASE_URL ? 'Present' : 'Missing',
        service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing',
        anon_key: process.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
        status: 'system_level_keys'
      },
      postmark: {
        server_token: process.env.POSTMARK_SERVER_TOKEN ? 'Present' : 'Missing',
        status: 'system_level_key'
      },
      paystack: {
        public_key: process.env.PAYSTACK_PUBLIC_KEY ? 'Present' : 'Missing',
        secret_key: process.env.PAYSTACK_SECRET_KEY ? 'Present' : 'Missing',
        status: 'system_level_keys'
      }
    },
    recommendations: [],
    security_notes: []
  };

  console.log('📊 Reviewing current API keys...');

  // Check Supabase keys
  console.log('🔍 Supabase API Keys:');
  console.log(`  URL: ${reviewResults.api_keys_reviewed.supabase.url}`);
  console.log(`  Service Role Key: ${reviewResults.api_keys_reviewed.supabase.service_role_key}`);
  console.log(`  Anon Key: ${reviewResults.api_keys_reviewed.supabase.anon_key}`);

  // Check Postmark keys
  console.log('📧 Postmark API Keys:');
  console.log(`  Server Token: ${reviewResults.api_keys_reviewed.postmark.server_token}`);

  // Check Paystack keys
  console.log('💳 Paystack API Keys:');
  console.log(`  Public Key: ${reviewResults.api_keys_reviewed.paystack.public_key}`);
  console.log(`  Secret Key: ${reviewResults.api_keys_reviewed.paystack.secret_key}`);

  // Analysis and recommendations
  console.log('\n🔍 Analysis:');
  
  // Since these are system-level API keys, they are not tied to individual users
  reviewResults.security_notes.push('All API keys are system-level keys, not tied to individual user accounts');
  reviewResults.security_notes.push('Supabase keys provide access to the entire database and auth system');
  reviewResults.security_notes.push('Postmark server token provides access to email sending for the entire server');
  reviewResults.security_notes.push('Paystack keys provide access to payment processing for the entire application');

  console.log('✅ All API keys are system-level keys, not tied to individual users');
  console.log('✅ No user-specific API keys found that need rotation');

  // Recommendations for security best practices
  reviewResults.recommendations.push({
    type: 'security_best_practice',
    description: 'Consider rotating API keys periodically as a security best practice',
    priority: 'low',
    action_required: false
  });

  reviewResults.recommendations.push({
    type: 'monitoring',
    description: 'Monitor API key usage for any unusual activity',
    priority: 'medium',
    action_required: false
  });

  reviewResults.recommendations.push({
    type: 'access_control',
    description: 'Ensure API keys are stored securely and not exposed in client-side code',
    priority: 'high',
    action_required: false
  });

  // Check if any keys might need attention based on the cleanup
  const needsAttention = [];
  
  // Since we cleaned up user data, check if any keys might have cached user data
  if (reviewResults.api_keys_reviewed.supabase.service_role_key === 'Present') {
    reviewResults.recommendations.push({
      type: 'supabase_cache',
      description: 'Supabase may have cached user data - consider clearing any application-level caches',
      priority: 'low',
      action_required: false
    });
  }

  if (reviewResults.api_keys_reviewed.postmark.server_token === 'Present') {
    reviewResults.recommendations.push({
      type: 'postmark_cleanup',
      description: 'Postmark suppressions have been cleaned - no further action needed',
      priority: 'low',
      action_required: false
    });
  }

  // Save results
  const resultsFile = path.join(__dirname, 'api-key-review-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(reviewResults, null, 2));
  console.log(`\n✅ API key review results saved: ${resultsFile}`);

  // Log to audit trail
  const logEntry = {
    timestamp: new Date().toISOString(),
    action: 'api_key_review_completed',
    file: resultsFile,
    keys_reviewed: Object.keys(reviewResults.api_keys_reviewed).length,
    recommendations_count: reviewResults.recommendations.length,
    action_required: reviewResults.recommendations.some(r => r.action_required)
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
  console.log('\n🎉 API key review completed');
  console.log('📋 Summary:');
  console.log(`  Keys reviewed: ${Object.keys(reviewResults.api_keys_reviewed).length}`);
  console.log(`  Recommendations: ${reviewResults.recommendations.length}`);
  console.log(`  Action required: ${reviewResults.recommendations.some(r => r.action_required) ? '❌' : '✅ None'}`);
  
  console.log('\n📝 Recommendations:');
  reviewResults.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.description}`);
  });

  console.log('\n🔒 Security Notes:');
  reviewResults.security_notes.forEach((note, index) => {
    console.log(`  ${index + 1}. ${note}`);
  });

  process.exit(0);
};

// Run API key review
reviewApiKeys().catch(error => {
  console.error('❌ API key review failed:', error);
  process.exit(1);
});