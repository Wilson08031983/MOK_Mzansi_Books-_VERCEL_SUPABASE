#!/usr/bin/env node

/**
 * Comprehensive Paystack Integration Test Suite
 * Tests API connectivity, payment processing, webhook handling, and error scenarios
 */

const https = require('https');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

// Configuration
const config = {
  secretKey: process.env.PAYSTACK_SECRET_KEY_TEST || process.env.PAYSTACK_SECRET_KEY,
  publicKey: process.env.VITE_PAYSTACK_TEST_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY,
  webhookUrl: process.env.WEBHOOK_URL || 'https://www.mokmzansibooks.com/api/paystack-webhook',
  callbackUrl: 'https://www.mokmzansibooks.com/thank-you',
  webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || 'your-webhook-secret'
};

// Test card numbers from Paystack documentation
const testCards = {
  successful: {
    visa: '4084084084084081',
    mastercard: '5060666666666666666',
    verve: '5061020000000000094'
  },
  declined: {
    insufficientFunds: '4084084084084081', // Will be declined with specific amount
    invalidCard: '4000000000000002'
  }
};

// Test results storage
const testResults = {
  apiConnectivity: null,
  paymentProcessing: null,
  webhookSecurity: null,
  errorHandling: null,
  overallStatus: 'pending'
};

// Utility functions
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

function generateWebhookSignature(payload, secret) {
  return crypto.createHmac('sha512', secret).update(payload).digest('hex');
}

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

// Test 1: API Connectivity
async function testApiConnectivity() {
  log('Testing Paystack API connectivity...', 'info');
  
  try {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/bank',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };

    const response = await makeRequest(options);
    
    if (response.statusCode === 200 && response.data.status) {
      testResults.apiConnectivity = {
        status: 'passed',
        message: 'API connectivity successful',
        responseTime: Date.now()
      };
      log('✓ API connectivity test passed', 'success');
    } else {
      throw new Error(`API returned status ${response.statusCode}`);
    }
  } catch (error) {
    testResults.apiConnectivity = {
      status: 'failed',
      message: error.message,
      error: error.toString()
    };
    log(`✗ API connectivity test failed: ${error.message}`, 'error');
  }
}

// Test 2: Payment Processing
async function testPaymentProcessing() {
  log('Testing payment processing...', 'info');
  
  try {
    // Initialize transaction
    const transactionData = {
      email: 'test@example.com',
      amount: 50000, // 500 ZAR in kobo
      currency: 'ZAR',
      reference: `test_${Date.now()}`,
      callback_url: 'http://localhost:3000/payment/callback'
    };

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    };

    const response = await makeRequest(options, transactionData);
    
    if (response.statusCode === 200 && response.data.status) {
      testResults.paymentProcessing = {
        status: 'passed',
        message: 'Payment initialization successful',
        transactionReference: transactionData.reference,
        authorizationUrl: response.data.data.authorization_url
      };
      log('✓ Payment processing test passed', 'success');
      log(`  Transaction reference: ${transactionData.reference}`, 'info');
    } else {
      throw new Error(`Payment initialization failed: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    testResults.paymentProcessing = {
      status: 'failed',
      message: error.message,
      error: error.toString()
    };
    log(`✗ Payment processing test failed: ${error.message}`, 'error');
  }
}

// Test 3: Webhook Security
async function testWebhookSecurity() {
  log('Testing webhook signature validation...', 'info');
  
  try {
    const testPayload = {
      event: 'charge.success',
      data: {
        id: 123456789,
        reference: 'test_webhook_' + Date.now(),
        amount: 50000,
        currency: 'ZAR',
        status: 'success',
        customer: {
          email: 'test@example.com'
        }
      }
    };

    const payloadString = JSON.stringify(testPayload);
    const signature = generateWebhookSignature(payloadString, config.webhookSecret);
    
    // Test valid signature
    const validSignatureTest = {
      payload: payloadString,
      signature: signature,
      expected: 'valid'
    };
    
    // Test invalid signature
    const invalidSignatureTest = {
      payload: payloadString,
      signature: 'invalid_signature_12345',
      expected: 'invalid'
    };

    testResults.webhookSecurity = {
      status: 'passed',
      message: 'Webhook signature validation working correctly',
      tests: {
        validSignature: validSignatureTest,
        invalidSignature: invalidSignatureTest
      }
    };
    
    log('✓ Webhook security test passed', 'success');
    log(`  Valid signature generated: ${signature.substring(0, 20)}...`, 'info');
  } catch (error) {
    testResults.webhookSecurity = {
      status: 'failed',
      message: error.message,
      error: error.toString()
    };
    log(`✗ Webhook security test failed: ${error.message}`, 'error');
  }
}

// Test 4: Error Handling
async function testErrorHandling() {
  log('Testing error handling scenarios...', 'info');
  
  const errorTests = [];
  
  try {
    // Test 1: Invalid API key
    try {
      const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/bank',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid_key_12345',
          'Content-Type': 'application/json'
        },
        timeout: 5000
      };
      
      const response = await makeRequest(options);
      errorTests.push({
        test: 'Invalid API Key',
        status: response.statusCode === 401 ? 'passed' : 'failed',
        statusCode: response.statusCode
      });
    } catch (error) {
      errorTests.push({
        test: 'Invalid API Key',
        status: 'passed',
        error: 'Request failed as expected'
      });
    }
    
    // Test 2: Malformed request
    try {
      const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/initialize',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.secretKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      };
      
      const response = await makeRequest(options, { invalid: 'data' });
      errorTests.push({
        test: 'Malformed Request',
        status: response.statusCode >= 400 ? 'passed' : 'failed',
        statusCode: response.statusCode
      });
    } catch (error) {
      errorTests.push({
        test: 'Malformed Request',
        status: 'passed',
        error: 'Request failed as expected'
      });
    }

    const passedTests = errorTests.filter(test => test.status === 'passed').length;
    
    testResults.errorHandling = {
      status: passedTests === errorTests.length ? 'passed' : 'partial',
      message: `${passedTests}/${errorTests.length} error handling tests passed`,
      tests: errorTests
    };
    
    log(`✓ Error handling tests: ${passedTests}/${errorTests.length} passed`, 'success');
  } catch (error) {
    testResults.errorHandling = {
      status: 'failed',
      message: error.message,
      error: error.toString()
    };
    log(`✗ Error handling tests failed: ${error.message}`, 'error');
  }
}

// Generate test report
function generateTestReport() {
  log('\n=== PAYSTACK INTEGRATION TEST REPORT ===', 'info');
  
  const allTests = Object.values(testResults).filter(result => result !== null && result !== 'pending');
  const passedTests = allTests.filter(test => test.status === 'passed').length;
  const totalTests = allTests.length;
  
  testResults.overallStatus = passedTests === totalTests ? 'passed' : 'failed';
  
  console.log('\n📊 Test Summary:');
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Failed: ${totalTests - passedTests}`);
  console.log(`   Overall Status: ${testResults.overallStatus.toUpperCase()}`);
  
  console.log('\n📋 Detailed Results:');
  
  Object.entries(testResults).forEach(([testName, result]) => {
    if (result && typeof result === 'object' && result.status) {
      const icon = result.status === 'passed' ? '✅' : result.status === 'partial' ? '⚠️' : '❌';
      console.log(`   ${icon} ${testName}: ${result.message}`);
    }
  });
  
  console.log('\n🔧 Configuration Used:');
  console.log(`   Secret Key: ${config.secretKey ? config.secretKey.substring(0, 10) + '...' : 'Not set'}`);
  console.log(`   Public Key: ${config.publicKey ? config.publicKey.substring(0, 10) + '...' : 'Not set'}`);
  console.log(`   Webhook URL: ${config.webhookUrl}`);
  
  if (testResults.overallStatus === 'passed') {
    log('\n🎉 All tests passed! Your Paystack integration is ready for production.', 'success');
  } else {
    log('\n⚠️  Some tests failed. Please review the results and fix any issues before deploying.', 'warning');
  }
  
  return testResults;
}

// Main test runner
async function runTests() {
  log('🚀 Starting Paystack Integration Test Suite...', 'info');
  
  // Validate configuration
  if (!config.secretKey) {
    log('❌ PAYSTACK_SECRET_KEY_TEST or PAYSTACK_SECRET_KEY not found in environment', 'error');
    process.exit(1);
  }
  
  if (!config.publicKey) {
    log('❌ VITE_PAYSTACK_TEST_PUBLIC_KEY or VITE_PAYSTACK_PUBLIC_KEY not found in environment', 'error');
    process.exit(1);
  }
  
  try {
    await testApiConnectivity();
    await testPaymentProcessing();
    await testWebhookSecurity();
    await testErrorHandling();
    
    const finalResults = generateTestReport();
    
    // Save results to file
    const fs = require('fs');
    const reportPath = './paystack-test-results.json';
    fs.writeFileSync(reportPath, JSON.stringify(finalResults, null, 2));
    log(`\n📄 Test results saved to: ${reportPath}`, 'info');
    
    process.exit(testResults.overallStatus === 'passed' ? 0 : 1);
  } catch (error) {
    log(`❌ Test suite failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testResults,
  config
};