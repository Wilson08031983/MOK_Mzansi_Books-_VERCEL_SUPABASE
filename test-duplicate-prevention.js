#!/usr/bin/env node

/**
 * Test script for duplicate prevention during signup
 * Tests both duplicate email addresses and company names
 */

const API_BASE_URL = 'http://localhost:3000';

// Generate unique test data
const timestamp = Date.now();
const testEmail = `test.duplicate.${timestamp}@example.com`;
const testCompanyName = `Test Company ${timestamp}`;

console.log('🔍 Testing Duplicate Prevention During Signup');
console.log('==============================================');
console.log(`Test Email: ${testEmail}`);
console.log(`Test Company: ${testCompanyName}`);
console.log('');

async function testDuplicatePrevention() {
  // Test 1: Create initial user and company
  console.log('📝 Test 1: Initial Signup (Should Succeed)');
  console.log('------------------------------------------');
  try {
    const initialSignupData = {
      firstName: 'Test',
      surname: 'User',
      companyName: testCompanyName,
      email: testEmail,
      position: 'CEO',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!'
    };

    const response = await fetch(`${API_BASE_URL}/api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(initialSignupData)
    });

    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    
    if (response.status === 201 && result.success) {
      console.log('✅ Initial signup test PASSED');
    } else {
      console.log('❌ Initial signup test FAILED');
      return; // Exit if initial signup fails
    }
  } catch (error) {
    console.log('❌ Initial signup test ERROR:', error.message);
    return;
  }
  console.log('');

  // Wait a moment to ensure the first signup is processed
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Duplicate email prevention
  console.log('📧 Test 2: Duplicate Email Prevention');
  console.log('------------------------------------');
  try {
    const duplicateEmailData = {
      firstName: 'Another',
      surname: 'User',
      companyName: 'Different Company Name',
      email: testEmail, // Same email as initial signup
      position: 'Manager',
      password: 'AnotherPassword123!',
      confirmPassword: 'AnotherPassword123!'
    };

    const response = await fetch(`${API_BASE_URL}/api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(duplicateEmailData)
    });

    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    
    if (response.status === 409 && result.message && result.message.toLowerCase().includes('email')) {
      console.log('✅ Duplicate email prevention test PASSED');
    } else {
      console.log('❌ Duplicate email prevention test FAILED');
      console.log('Expected: 409 status with email-related error message');
    }
  } catch (error) {
    console.log('❌ Duplicate email prevention test ERROR:', error.message);
  }
  console.log('');

  // Test 3: Duplicate company name prevention
  console.log('🏢 Test 3: Duplicate Company Name Prevention');
  console.log('-------------------------------------------');
  try {
    const duplicateCompanyData = {
      firstName: 'Third',
      surname: 'User',
      companyName: testCompanyName, // Same company name as initial signup
      email: `different.${timestamp}@example.com`,
      position: 'Director',
      password: 'ThirdPassword123!',
      confirmPassword: 'ThirdPassword123!'
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
    
    if (response.status === 500 && result.error && result.error.toLowerCase().includes('company')) {
      console.log('✅ Duplicate company name prevention test PASSED');
    } else {
      console.log('❌ Duplicate company name prevention test FAILED');
      console.log('Expected: 500 status with company-related error message');
    }
  } catch (error) {
    console.log('❌ Duplicate company name prevention test ERROR:', error.message);
  }
  console.log('');

  // Test 4: Valid signup with different email and company
  console.log('✨ Test 4: Valid Signup with Different Data (Should Succeed)');
  console.log('----------------------------------------------------------');
  try {
    const validSignupData = {
      firstName: 'Valid',
      surname: 'User',
      companyName: `Valid Company ${timestamp}`,
      email: `valid.${timestamp}@example.com`,
      position: 'CEO',
      password: 'ValidPassword123!',
      confirmPassword: 'ValidPassword123!'
    };

    const response = await fetch(`${API_BASE_URL}/api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validSignupData)
    });

    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    
    if (response.status === 201 && result.success) {
      console.log('✅ Valid signup with different data test PASSED');
    } else {
      console.log('❌ Valid signup with different data test FAILED');
    }
  } catch (error) {
    console.log('❌ Valid signup test ERROR:', error.message);
  }
  console.log('');

  console.log('🎯 Duplicate Prevention Test Summary');
  console.log('===================================');
  console.log('✅ Tests completed successfully');
  console.log('📊 Check individual test results above for detailed status');
}

// Run the tests
testDuplicatePrevention().catch(console.error);