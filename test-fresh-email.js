#!/usr/bin/env node

const https = require('https');

function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testSignupWithFreshEmail() {
  // Generate a unique email address
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const freshEmail = `test.${timestamp}.${randomId}@gmail.com`;
  
  console.log('🧪 Testing signup with fresh email:', freshEmail);
  
  const signupData = {
    email: freshEmail,
    password: "TestPassword123!",
    confirmPassword: "TestPassword123!",
    firstName: "Test",
    lastName: "User",
    surname: "User",
    position: "Developer",
    companyName: `Fresh Email Test Company ${timestamp}`
  };
  
  try {
    const response = await makeRequest('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, signupData);
    
    const result = response.data;
    
    console.log('📊 Signup Response:');
    console.log('Status:', response.status);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Signup successful!');
      console.log('User ID:', result.userId);
      console.log('Company ID:', result.companyId);
      
      // Wait a moment and check for any email sending logs
      console.log('\n⏳ Waiting 5 seconds to check for email sending...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } else {
      console.log('❌ Signup failed:', result.message);
      if (result.error) {
        console.log('Error details:', result.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testSignupWithFreshEmail().catch(console.error);