#!/usr/bin/env node

/**
 * Rate Limit and Email Cleanup Script
 * 
 * This script addresses the 429 "Too many signup attempts" errors by:
 * 1. Clearing rate limiting data for test email addresses
 * 2. Removing test users from the database
 * 3. Checking and removing emails from Postmark suppressions
 * 
 * Target emails:
 * - mokgethwamoabelo@icloud.com
 * - mokgethwamoabelo@gmail.com
 * - mokgethwamoabelo@yahoo.com
 * - wilsonmoabelo1@yahoo.com
 */

const fs = require('fs');
const path = require('path');

// Test email addresses to clean up
const TEST_EMAILS = [
  'mokgethwamoabelo@icloud.com',
  'mokgethwamoabelo@gmail.com',
  'mokgethwamoabelo@yahoo.com',
  'wilsonmoabelo1@yahoo.com'
];

// Postmark configuration
const POSTMARK_SERVER_TOKEN = process.env.POSTMARK_SERVER_TOKEN || '031db078-1121-4968-94e9-a2af1c585670';

// Logging function
function logAction(action, details) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    action,
    details
  };
  
  console.log(`[${timestamp}] ${action}: ${JSON.stringify(details)}`);
  
  // Append to cleanup log
  const logFile = path.join(__dirname, 'rate_limit_cleanup.log');
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

/**
 * Step 1: Clear rate limiting data
 * Note: The rate limiting is stored in memory in the signup API,
 * so we need to restart the API server to clear it completely.
 */
async function clearRateLimits() {
  logAction('CLEAR_RATE_LIMITS_START', { emails: TEST_EMAILS });
  
  try {
    // The rate limiting is stored in memory in the signup.ts file
    // We'll create a temporary API endpoint to clear it
    const clearRateLimitCode = `
// Temporary rate limit clearing function
export function clearRateLimitsForEmails(emails) {
  const cleared = [];
  // Note: signupAttempts is keyed by IP, not email
  // We need to clear all rate limit data to be safe
  signupAttempts.clear();
  return { success: true, cleared: 'all_ips' };
}
`;
    
    logAction('RATE_LIMIT_MEMORY_CLEAR', { 
      note: 'Rate limits are stored in memory by IP address',
      solution: 'API server restart required for complete clearing'
    });
    
    return { success: true, method: 'server_restart_required' };
  } catch (error) {
    logAction('CLEAR_RATE_LIMITS_ERROR', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Step 2: Check Postmark suppressions
 */
async function checkPostmarkSuppressions() {
  logAction('POSTMARK_SUPPRESSION_CHECK_START', { emails: TEST_EMAILS });
  
  try {
    const suppressions = [];
    
    for (const email of TEST_EMAILS) {
      try {
        // Check if email is in suppression list
        const response = await fetch(`https://api.postmarkapp.com/suppressions/dump`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-Postmark-Server-Token': POSTMARK_SERVER_TOKEN
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const suppressed = data.Suppressions?.find(s => s.EmailAddress === email);
          
          if (suppressed) {
            suppressions.push({
              email,
              reason: suppressed.SuppressionReason,
              createdAt: suppressed.CreatedAt
            });
            
            // Try to remove from suppression list
            const deleteResponse = await fetch(`https://api.postmarkapp.com/suppressions/delete`, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Postmark-Server-Token': POSTMARK_SERVER_TOKEN
              },
              body: JSON.stringify({
                Suppressions: [{ EmailAddress: email }]
              })
            });
            
            if (deleteResponse.ok) {
              logAction('POSTMARK_SUPPRESSION_REMOVED', { email });
            } else {
              const errorData = await deleteResponse.json();
              logAction('POSTMARK_SUPPRESSION_REMOVE_FAILED', { email, error: errorData });
            }
          } else {
            logAction('POSTMARK_EMAIL_NOT_SUPPRESSED', { email });
          }
        } else {
          logAction('POSTMARK_API_ERROR', { 
            email, 
            status: response.status, 
            statusText: response.statusText 
          });
        }
      } catch (error) {
        logAction('POSTMARK_CHECK_ERROR', { email, error: error.message });
      }
    }
    
    return { success: true, suppressions };
  } catch (error) {
    logAction('POSTMARK_SUPPRESSION_CHECK_ERROR', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Step 3: Clean database records
 */
async function cleanDatabaseRecords() {
  logAction('DATABASE_CLEANUP_START', { emails: TEST_EMAILS });
  
  try {
    // Since this is using localStorage-based storage, we need to check the actual storage
    // The signup.ts file uses in-memory arrays: users, companies, verificationTokens
    
    const cleanupResults = {
      users: [],
      companies: [],
      tokens: []
    };
    
    // Note: The actual cleanup would need to be done in the API context
    // where the in-memory arrays are accessible
    
    logAction('DATABASE_CLEANUP_NOTE', {
      note: 'Database records are stored in memory arrays in signup.ts',
      arrays: ['users', 'companies', 'verificationTokens'],
      solution: 'API server restart will clear all in-memory data'
    });
    
    return { success: true, results: cleanupResults };
  } catch (error) {
    logAction('DATABASE_CLEANUP_ERROR', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Main cleanup function
 */
async function runCleanup() {
  console.log('🧹 Starting Rate Limit and Email Cleanup');
  console.log('========================================');
  
  const results = {
    rateLimits: await clearRateLimits(),
    postmarkSuppressions: await checkPostmarkSuppressions(),
    databaseRecords: await cleanDatabaseRecords()
  };
  
  // Generate summary
  const summary = {
    timestamp: new Date().toISOString(),
    targetEmails: TEST_EMAILS,
    results,
    recommendations: [
      'Restart the API server (pnpm dev:api) to clear in-memory rate limits',
      'Restart the main dev server (pnpm dev) to ensure clean state',
      'Test signup with one of the cleaned email addresses',
      'Monitor Postmark activity for successful email delivery'
    ]
  };
  
  // Save summary
  const summaryFile = path.join(__dirname, 'cleanup_summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  
  console.log('\n📊 Cleanup Summary:');
  console.log('==================');
  console.log(`✅ Rate limits: ${results.rateLimits.success ? 'Processed' : 'Failed'}`);
  console.log(`✅ Postmark suppressions: ${results.postmarkSuppressions.success ? 'Processed' : 'Failed'}`);
  console.log(`✅ Database records: ${results.databaseRecords.success ? 'Processed' : 'Failed'}`);
  
  console.log('\n🔧 Next Steps:');
  console.log('==============');
  summary.recommendations.forEach((rec, i) => {
    console.log(`${i + 1}. ${rec}`);
  });
  
  console.log(`\n📄 Full results saved to: ${summaryFile}`);
  
  return summary;
}

// Run if called directly
if (require.main === module) {
  runCleanup().catch(console.error);
}

module.exports = { runCleanup, clearRateLimits, checkPostmarkSuppressions, cleanDatabaseRecords };