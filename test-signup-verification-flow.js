#!/usr/bin/env node

// Use built-in fetch for Node.js 18+
require('dotenv').config({ path: '.env.local' });

const API_BASE_URL = process.env.APP_HOST || 'http://localhost:8080';

console.log('🧪 Testing Complete Signup & Verification Flow');
console.log('===============================================\n');

console.log('📋 Configuration:');
console.log(`API Base URL: ${API_BASE_URL}`);
console.log('');

// Generate unique test data
const timestamp = Date.now();
const testEmail = `test.user.${timestamp}@example.com`;
const testCompanyName = `Test Company ${timestamp}`;

async function testCompleteFlow() {
  console.log('🚀 Starting complete signup and verification flow test...\n');

  let userId = null;
  let verificationToken = null;

  // Test 1: Signup with new user
  console.log('📧 Test 1: User Signup');
  console.log('----------------------------------------');
  try {
    const signupData = {
      email: testEmail,
      password: 'TestPassword123!',
      companyName: testCompanyName,
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '+27123456789'
    };

    console.log('Signup data:', signupData);

    const response = await fetch(`${API_BASE_URL}/api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData)
    });

    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    
    if (response.status === 201 && result.success) {
      console.log('✅ Signup test PASSED');
      userId = result.userId;
      console.log(`User ID: ${userId}`);
    } else {
      console.log('❌ Signup test FAILED');
      return;
    }
  } catch (error) {
    console.log('❌ Signup test ERROR:', error.message);
    return;
  }
  console.log('');

  // Test 2: Duplicate email prevention
  console.log('📧 Test 2: Duplicate Email Prevention');
  console.log('----------------------------------------');
  try {
    const duplicateSignupData = {
      email: testEmail, // Same email
      password: 'AnotherPassword123!',
      companyName: 'Another Company',
      firstName: 'Another',
      lastName: 'User',
      phoneNumber: '+27987654321'
    };

    const response = await fetch(`${API_BASE_URL}/api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(duplicateSignupData)
    });

    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    
    if (response.status === 400 && result.message && result.message.includes('already exists')) {
      console.log('✅ Duplicate email prevention test PASSED');
    } else {
      console.log('❌ Duplicate email prevention test FAILED');
    }
  } catch (error) {
    console.log('❌ Duplicate email prevention test ERROR:', error.message);
  }
  console.log('');

  // Test 3: Duplicate company name prevention
  console.log('📧 Test 3: Duplicate Company Name Prevention');
  console.log('----------------------------------------');
  try {
    const duplicateCompanyData = {
      email: `another.${timestamp}@example.com`,
      password: 'AnotherPassword123!',
      companyName: testCompanyName, // Same company name
      firstName: 'Another',
      lastName: 'User',
      phoneNumber: '+27987654321'
    };

    const response = await fetch(`${API_BASE_URL}/api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(duplicateCompanyData)
    });

    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    
    if (response.status === 400 && result.message && result.message.includes('company name')) {
      console.log('✅ Duplicate company name prevention test PASSED');
    } else {
      console.log('❌ Duplicate company name prevention test FAILED');
    }
  } catch (error) {
    console.log('❌ Duplicate company name prevention test ERROR:', error.message);
  }
  console.log('');

  // Test 4: Login attempt before verification
  console.log('📧 Test 4: Login Before Email Verification');
  console.log('----------------------------------------');
  try {
    const loginData = {
      email: testEmail,
      password: 'TestPassword123!'
    };

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    
    if (response.status === 400 && result.message && result.message.includes('verify')) {
      console.log('✅ Login before verification prevention test PASSED');
    } else {
      console.log('❌ Login before verification prevention test FAILED');
    }
  } catch (error) {
    console.log('❌ Login before verification test ERROR:', error.message);
  }
  console.log('');

  console.log('📋 Test Summary');
  console.log('=====================================');
  console.log('Complete signup and verification flow tests completed.');
  console.log(`Test email used: ${testEmail}`);
  console.log(`Test company: ${testCompanyName}`);
  if (userId) {
    console.log(`User ID created: ${userId}`);
  }
}

testCompleteFlow().catch(console.error);