const fetch = require('node-fetch');

async function testVerificationLink() {
  try {
    console.log('Testing email verification link...');
    
    // Use the raw token from the debug logs and the corresponding user ID
    const rawToken = 'igIsp9_EyZDQ5gyTxVr_0pbYfBBiaSQjzhNBrrKXGf4';
    const userId = '0a0795eb-f5f4-4aea-b5d2-e60586908d50';
    
    console.log('Raw Token:', rawToken);
    console.log('User ID:', userId);
    
    const response = await fetch('http://localhost:3000/api/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: rawToken,
        userId: userId
      })
    });

    console.log('Response Status:', response.status);
    
    const responseText = await response.text();
    console.log('Response Body:', responseText);
    
    // Try to parse as JSON
    try {
      const responseJson = JSON.parse(responseText);
      console.log('Parsed Response:', JSON.stringify(responseJson, null, 2));
      
      if (responseJson.success) {
        console.log('✅ Email verification successful!');
      } else {
        console.log('❌ Email verification failed:', responseJson.message);
      }
    } catch (parseError) {
      console.log('❌ Response is not valid JSON');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVerificationLink();