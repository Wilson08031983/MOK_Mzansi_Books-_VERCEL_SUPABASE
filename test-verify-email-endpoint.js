#!/usr/bin/env node

// Use built-in fetch for Node.js 18+
require('dotenv').config({ path: '.env.local' });

const API_BASE_URL = process.env.APP_HOST || 'http://localhost:8080';

console.log('🧪 Testing /api/verify-email Endpoint');
console.log('=====================================\n');

console.log('📋 Configuration:');
console.log(`API Base URL: ${API_BASE_URL}`);
console.log('');

async function testVerifyEmailEndpoint() {
  console.log('🚀 Starting verify-email endpoint tests...\n');

  // Test 1: Missing parameters
  console.log('📧 Test 1: Missing Parameters');
  console.log('----------------------------------------');
  try {
    const response = await fetch(`${API_BASE_URL}/api/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    
    if (response.status === 400 && result.message.includes('Missing required parameters')) {
      console.log('✅ Missing parameters test PASSED');
    } else {
      console.log('❌ Missing parameters test FAILED');
    }
  } catch (error) {
    console.log('❌ Missing parameters test ERROR:', error.message);
  }
  console.log('');

  // Test 2: Invalid token
  console.log('📧 Test 2: Invalid Token');
  console.log('----------------------------------------');
  try {
    const response = await fetch(`${API_BASE_URL}/api/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'invalid-token-123',
        userId: 'test-user-id'
      })
    });

    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    
    if (response.status === 400 && result.message.includes('invalid or expired')) {
      console.log('✅ Invalid token test PASSED');
    } else {
      console.log('❌ Invalid token test FAILED');
    }
  } catch (error) {
    console.log('❌ Invalid token test ERROR:', error.message);
  }
  console.log('');

  // Test 3: Wrong HTTP method
  console.log('📧 Test 3: Wrong HTTP Method (GET)');
  console.log('----------------------------------------');
  try {
    const response = await fetch(`${API_BASE_URL}/api/verify-email?token=test&userId=test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    
    if (response.status === 405 && result.message.includes('Method not allowed')) {
      console.log('✅ Wrong method test PASSED');
    } else {
      console.log('❌ Wrong method test FAILED');
    }
  } catch (error) {
    console.log('❌ Wrong method test ERROR:', error.message);
  }
  console.log('');

  // Test 4: Check if endpoint is accessible
  console.log('📧 Test 4: Endpoint Accessibility');
  console.log('----------------------------------------');
  try {
    const response = await fetch(`${API_BASE_URL}/api/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'test-token',
        userId: 'test-user'
      })
    });

    console.log(`Status: ${response.status}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.status !== 404) {
      console.log('✅ Endpoint is accessible');
    } else {
      console.log('❌ Endpoint not found (404)');
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused - API server may not be running');
    } else {
      console.log('❌ Endpoint accessibility ERROR:', error.message);
    }
  }
  console.log('');

  console.log('📋 Test Summary');
  console.log('=====================================');
  console.log('All tests completed. Check results above.');
}

testVerifyEmailEndpoint().catch(console.error);