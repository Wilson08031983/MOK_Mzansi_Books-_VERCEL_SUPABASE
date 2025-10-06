const fetch = require('node-fetch');

async function testSignupFlow() {
  console.log('Testing updated signup flow...');
  
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'testpassword123',
    confirmPassword: 'testpassword123',
    firstName: 'Test',
    surname: 'User',
    companyName: 'Test Company',
    position: 'Developer'
  };

  try {
    console.log('Sending signup request...');
    const response = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const result = await response.json();
    console.log('Signup response:', JSON.stringify(result, null, 2));
    
    if (result.success && result.userId) {
      console.log('✅ Signup successful!');
      console.log('User ID:', result.userId);
      console.log('Company ID:', result.companyId);
      
      // Check if the user ID is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(result.userId)) {
        console.log('✅ User ID is in valid UUID format');
      } else {
        console.log('❌ User ID is NOT in valid UUID format');
      }
      
      return { success: true, userId: result.userId, email: testUser.email };
    } else {
      console.log('❌ Signup failed:', result.message);
      return { success: false, error: result.message };
    }
  } catch (error) {
    console.error('❌ Error during signup test:', error);
    return { success: false, error: error.message };
  }
}

testSignupFlow().then(result => {
  if (result.success) {
    console.log('\n🎉 Test completed successfully!');
    console.log('Next step: Check your email for the verification link');
  } else {
    console.log('\n❌ Test failed:', result.error);
  }
});