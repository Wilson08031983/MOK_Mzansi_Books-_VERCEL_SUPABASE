const { Client } = require('postmark');
const crypto = require('crypto');

// Test configuration
const testConfig = {
  email: 'mokgethamoabelo@yahoo.com', // Using the reactivated email
  firstName: 'Test',
  lastName: 'User',
  companyName: 'Test Company',
  userId: 'test-user-' + Date.now(),
  companyId: 'test-company-' + Date.now()
};

// Environment variables
const serverToken = process.env.POSTMARK_SERVER_TOKEN;
const senderEmail = process.env.POSTMARK_SENDER_EMAIL || 'noreply@mokmzansibooks.com';
const senderName = process.env.POSTMARK_SENDER_NAME || 'MOK Mzansi Books';
const appUrl = process.env.APP_HOST || 'http://localhost:8080';

console.log('🧪 Testing Verification Email Integration with Postmark');
console.log('='.repeat(60));

// Check environment variables
console.log('\n📋 Environment Configuration:');
console.log(`Server Token: ${serverToken ? serverToken.substring(0, 8) + '...' : 'NOT SET'}`);
console.log(`Sender Email: ${senderEmail}`);
console.log(`Sender Name: ${senderName}`);
console.log(`App URL: ${appUrl}`);

if (!serverToken) {
  console.error('❌ POSTMARK_SERVER_TOKEN is not set');
  process.exit(1);
}

// Initialize Postmark client
const client = new Client(serverToken);

// Generate test verification token
function generateTestToken() {
  return crypto.randomBytes(32).toString('base64url');
}

// Create verification URL
function createVerificationUrl(token, userId, email) {
  const baseUrl = appUrl;
  return `${baseUrl}/auth/verify-email?token=${token}&uid=${userId}&email=${encodeURIComponent(email)}`;
}

// Test 1: Direct Postmark API call
async function testDirectPostmarkCall() {
  console.log('\n📧 Test 1: Direct Postmark API Call');
  console.log('-'.repeat(40));
  
  try {
    const token = generateTestToken();
    const verifyUrl = createVerificationUrl(token, testConfig.userId, testConfig.email);
    
    console.log(`Generated token: ${token.substring(0, 16)}...`);
    console.log(`Verification URL: ${verifyUrl}`);
    
    const response = await client.sendEmail({
      From: `${senderName} <${senderEmail}>`,
      To: testConfig.email,
      Subject: `Verify your ${testConfig.companyName} account`,
      ReplyTo: 'support@mokmzansibooks.com',
      HtmlBody: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${appUrl}/logo.png" alt="MOK Mzansi Books" style="width: 120px; height: auto;" />
          </div>
          
          <h1 style="color: #4c1d95; text-align: center; margin-bottom: 24px;">
            Verify Your Email Address
          </h1>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
            Hello ${testConfig.firstName} ${testConfig.lastName},
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Welcome to ${testConfig.companyName}! Please confirm your email address to activate your account and keep it secure.
          </p>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background-color: #4c1d95; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);">
              Confirm Email Address
            </a>
          </div>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              If the button above doesn't work, copy and paste this link into your browser:
            </p>
            <p style="font-size: 14px; color: #4c1d95; word-break: break-all; margin: 8px 0 0 0;">
              ${verifyUrl}
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            This verification link will expire in 24 hours for security reasons.
          </p>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">
            If you didn't create an account with ${testConfig.companyName}, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          
          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} ${testConfig.companyName}. All rights reserved.
          </p>
        </div>
      `,
      TextBody: `
Hello ${testConfig.firstName} ${testConfig.lastName},

Welcome to ${testConfig.companyName}! Please confirm your email address to activate your account.

Click here to verify your email: ${verifyUrl}

This verification link will expire in 24 hours for security reasons.

If you didn't create an account with ${testConfig.companyName}, please ignore this email.

© ${new Date().getFullYear()} ${testConfig.companyName}. All rights reserved.
      `,
      MessageStream: 'outbound',
      Metadata: {
        userId: testConfig.userId,
        companyId: testConfig.companyId,
        emailType: 'verification',
        environment: 'test',
        testRun: 'true'
      }
    });

    console.log('✅ Direct Postmark call successful!');
    console.log(`   Message ID: ${response.MessageID}`);
    console.log(`   To: ${response.To}`);
    console.log(`   Submitted At: ${response.SubmittedAt}`);
    
    return { success: true, messageId: response.MessageID };
    
  } catch (error) {
    console.error('❌ Direct Postmark call failed:', error.message);
    if (error.code) console.error(`   Error Code: ${error.code}`);
    return { success: false, error: error.message };
  }
}

// Test 2: API endpoint call
async function testApiEndpoint() {
  console.log('\n🔗 Test 2: API Endpoint Call');
  console.log('-'.repeat(40));
  
  try {
    const token = generateTestToken();
    const verifyUrl = createVerificationUrl(token, testConfig.userId, testConfig.email);
    
    const response = await fetch('http://localhost:8081/api/emails/verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: testConfig.email,
        firstName: testConfig.firstName,
        lastName: testConfig.lastName,
        companyName: testConfig.companyName,
        verifyUrl: verifyUrl,
        userId: testConfig.userId,
        companyId: testConfig.companyId,
        subject: `Verify your ${testConfig.companyName} account`,
        metadata: {
          testRun: 'true',
          environment: 'test'
        }
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ API endpoint call successful!');
      console.log(`   Message ID: ${result.id}`);
      console.log(`   Submitted At: ${result.submittedAt}`);
      return { success: true, messageId: result.id };
    } else {
      console.error('❌ API endpoint call failed:', result.message || 'Unknown error');
      return { success: false, error: result.message };
    }
    
  } catch (error) {
    console.error('❌ API endpoint call failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Test 3: Check Postmark activity logs
async function checkPostmarkActivity() {
  console.log('\n📊 Test 3: Checking Postmark Activity');
  console.log('-'.repeat(40));
  
  try {
    // Get recent outbound messages
    const messages = await client.getOutboundMessages({
      count: 10,
      offset: 0
    });

    console.log(`✅ Retrieved ${messages.Messages.length} recent messages`);
    
    // Filter for our test emails
    const testMessages = messages.Messages.filter(msg => 
      msg.To.includes(testConfig.email) && 
      msg.Subject.includes('Verify your')
    );

    if (testMessages.length > 0) {
      console.log(`📧 Found ${testMessages.length} verification email(s) to ${testConfig.email}:`);
      testMessages.forEach((msg, index) => {
        console.log(`   ${index + 1}. Message ID: ${msg.MessageID}`);
        console.log(`      Status: ${msg.Status}`);
        console.log(`      Sent: ${msg.SentAt}`);
        console.log(`      Subject: ${msg.Subject}`);
      });
    } else {
      console.log('📭 No verification emails found for test recipient');
    }

    return { success: true, messageCount: testMessages.length };
    
  } catch (error) {
    console.error('❌ Failed to check Postmark activity:', error.message);
    return { success: false, error: error.message };
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Starting Verification Email Integration Tests...\n');
  
  const results = {
    directCall: await testDirectPostmarkCall(),
    apiEndpoint: await testApiEndpoint(),
    activityCheck: await checkPostmarkActivity()
  };
  
  console.log('\n📋 Test Results Summary:');
  console.log('='.repeat(60));
  console.log(`Direct Postmark Call: ${results.directCall.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`API Endpoint Call: ${results.apiEndpoint.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Activity Check: ${results.activityCheck.success ? '✅ PASS' : '❌ FAIL'}`);
  
  const passCount = Object.values(results).filter(r => r.success).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passCount}/${totalTests} tests passed`);
  
  if (passCount === totalTests) {
    console.log('🎉 All verification email integration tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
  }
}

// Run the tests
runAllTests().catch(console.error);