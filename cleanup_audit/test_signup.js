#!/usr/bin/env node

/**
 * Test Signup Script
 * 
 * This script tests signup with the cleaned email addresses to verify
 * that the 429 rate limiting errors have been resolved.
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const API_BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'mokgethwamoabelo@icloud.com'; // First email to test

// Test data
const TEST_SIGNUP_DATA = {
  firstName: 'Test',
  surname: 'User',
  companyName: `Test Company ${Date.now()}`,
  email: TEST_EMAIL,
  position: 'CEO',
  password: 'TestPassword123!',
  confirmPassword: 'TestPassword123!'
};

// Logging function
function logTest(action, details) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    action,
    details
  };
  
  console.log(`[${timestamp}] ${action}: ${JSON.stringify(details)}`);
  
  // Append to test log
  const logFile = path.join(__dirname, 'signup_test.log');
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

/**
 * Test signup with cleaned email address
 */
async function testSignup() {
  logTest('SIGNUP_TEST_START', { email: TEST_EMAIL });
  
  try {
    console.log('🧪 Testing signup with cleaned email address...');
    console.log(`📧 Email: ${TEST_EMAIL}`);
    console.log(`🌐 API URL: ${API_BASE_URL}/api/signup`);
    
    const response = await fetch(`${API_BASE_URL}/api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_SIGNUP_DATA)
    });
    
    const result = await response.json();
    
    logTest('SIGNUP_RESPONSE', {
      status: response.status,
      statusText: response.statusText,
      result
    });
    
    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📄 Response Body:`, JSON.stringify(result, null, 2));
    
    // Analyze the result
    if (response.status === 429) {
      console.log('\n❌ CLEANUP FAILED: Still getting 429 rate limit error');
      console.log('🔧 Possible solutions:');
      console.log('   - Wait for the rate limit window to expire');
      console.log('   - Check if servers were properly restarted');
      console.log('   - Verify rate limiting is cleared from memory');
      
      return { success: false, error: '429_rate_limit_still_active' };
    } else if (response.status === 201 && result.success) {
      console.log('\n✅ CLEANUP SUCCESS: Signup worked without rate limit error');
      console.log('🎉 Email address is now available for testing');
      
      return { success: true, message: 'Signup successful' };
    } else if (response.status === 400 && result.message?.includes('already exists')) {
      console.log('\n⚠️  PARTIAL SUCCESS: No rate limit error, but email already exists');
      console.log('🔧 This means rate limits are cleared but database records remain');
      console.log('💡 The email can be used for testing other flows (login, resend verification)');
      
      return { success: true, message: 'Rate limits cleared, email exists in database' };
    } else {
      console.log('\n❓ UNEXPECTED RESULT: Different error occurred');
      console.log('🔍 This may indicate other issues with the signup process');
      
      return { success: false, error: 'unexpected_response', details: result };
    }
    
  } catch (error) {
    logTest('SIGNUP_TEST_ERROR', { error: error.message });
    console.log('\n💥 TEST ERROR:', error.message);
    
    return { success: false, error: error.message };
  }
}

/**
 * Test all cleaned email addresses
 */
async function testAllEmails() {
  const emails = [
    'mokgethwamoabelo@icloud.com',
    'mokgethwamoabelo@gmail.com',
    'mokgethwamoabelo@yahoo.com',
    'wilsonmoabelo1@yahoo.com'
  ];
  
  console.log('🧪 Testing all cleaned email addresses...');
  console.log('==========================================');
  
  const results = [];
  
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    console.log(`\n📧 Testing ${i + 1}/${emails.length}: ${email}`);
    
    const testData = {
      ...TEST_SIGNUP_DATA,
      email,
      companyName: `Test Company ${email.split('@')[0]} ${Date.now()}`
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      const result = await response.json();
      
      const testResult = {
        email,
        status: response.status,
        success: response.status !== 429,
        rateLimitCleared: response.status !== 429,
        message: result.message || result.error || 'No message'
      };
      
      results.push(testResult);
      
      if (response.status === 429) {
        console.log(`   ❌ Still rate limited: ${result.message}`);
      } else {
        console.log(`   ✅ Rate limit cleared (Status: ${response.status})`);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   💥 Error: ${error.message}`);
      results.push({
        email,
        status: 'error',
        success: false,
        rateLimitCleared: false,
        message: error.message
      });
    }
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const cleared = results.filter(r => r.rateLimitCleared).length;
  const total = results.length;
  
  console.log(`✅ Rate limits cleared: ${cleared}/${total} emails`);
  
  if (cleared === total) {
    console.log('🎉 SUCCESS: All email addresses are now available for testing!');
  } else {
    console.log('⚠️  Some emails still have rate limiting issues');
  }
  
  // Save detailed results
  const summaryFile = path.join(__dirname, 'signup_test_results.json');
  const summary = {
    timestamp: new Date().toISOString(),
    totalTested: total,
    rateLimitsCleared: cleared,
    results
  };
  
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  console.log(`\n📄 Detailed results saved to: ${summaryFile}`);
  
  return summary;
}

/**
 * Main test function
 */
async function runTest() {
  console.log('🧪 Starting Signup Test After Cleanup');
  console.log('=====================================');
  
  // Wait a moment for servers to be fully ready
  console.log('⏳ Waiting for servers to be ready...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test all emails
  const results = await testAllEmails();
  
  return results;
}

// Run if called directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = { runTest, testSignup, testAllEmails };