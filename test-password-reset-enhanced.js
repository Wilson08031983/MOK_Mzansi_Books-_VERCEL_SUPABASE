require('dotenv').config({ path: '.env.local' });

async function testPasswordResetAPI() {
  console.log('🧪 Testing Password Reset API with Enhanced Debugging...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('- POSTMARK_SERVER_TOKEN:', process.env.POSTMARK_SERVER_TOKEN ? process.env.POSTMARK_SERVER_TOKEN.substring(0, 8) + '...' : 'NOT SET');
  console.log('- POSTMARK_SENDER_EMAIL:', process.env.POSTMARK_SENDER_EMAIL || 'NOT SET');
  console.log('- POSTMARK_SENDER_NAME:', process.env.POSTMARK_SENDER_NAME || 'NOT SET');
  console.log('- POSTMARK_MESSAGE_STREAM:', process.env.POSTMARK_MESSAGE_STREAM || 'NOT SET');
  
  const testData = {
    to: 'mokgethwamoabelo@gmail.com',
    resetToken: 'test-reset-token-' + Date.now()
  };
  
  console.log('\n📤 Sending POST request to password reset API...');
  console.log('Request data:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch('http://localhost:3001/api/emails/password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('\n📥 Response Status:', response.status, response.statusText);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response Body (raw):', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('Response Body (parsed):', JSON.stringify(responseJson, null, 2));
    } catch (parseError) {
      console.log('Response is not valid JSON');
    }
    
    if (response.ok) {
      console.log('\n✅ Password reset email sent successfully!');
    } else {
      console.log('\n❌ Password reset failed with status:', response.status);
    }
    
  } catch (error) {
    console.error('\n💥 Request failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testPasswordResetAPI();
