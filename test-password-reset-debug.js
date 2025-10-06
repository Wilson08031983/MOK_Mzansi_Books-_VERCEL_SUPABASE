// Test script to debug password reset email sending
const fetch = require('node-fetch');

async function testPasswordResetAPI() {
  const testData = {
    to: 'test@example.com',
    subject: 'Password Reset Test',
    resetToken: 'test-token-123',
    firstName: 'Test User'
  };

  try {
    console.log('Testing password reset API endpoint...');
    console.log('Request data:', testData);
    
    const response = await fetch('http://localhost:3000/api/emails/password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseData = await response.text();
    console.log('Response body:', responseData);
    
    if (response.ok) {
      console.log('✅ Password reset API call successful');
    } else {
      console.log('❌ Password reset API call failed');
    }
  } catch (error) {
    console.error('Error testing password reset API:', error);
  }
}

testPasswordResetAPI();