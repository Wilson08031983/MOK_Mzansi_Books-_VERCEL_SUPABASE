// Test script to simulate the exact signup email flow using direct Postmark client
const { Client } = require('postmark');
require('dotenv').config({ path: '.env.local' });

// Test data matching the signup form
const testSignupData = {
  firstName: 'Test',
  lastName: 'User',
  email: 'cindyramatladi@gmail.com',
  companyName: 'Test Company',
  position: 'CEO'
};

// Simulate the verification token creation
function createMockVerificationToken(email) {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return {
    success: true,
    token: token
  };
}

async function testSignupEmailFlow() {
  console.log('🧪 Testing Signup Email Flow...');
  console.log('Test Data:', testSignupData);
  
  // Get environment variables
  const serverToken = process.env.VITE_POSTMARK_SERVER_TOKEN || process.env.POSTMARK_SERVER_TOKEN;
  const senderEmail = process.env.VITE_POSTMARK_SENDER_EMAIL || process.env.POSTMARK_SENDER_EMAIL;
  
  console.log('Server Token:', serverToken ? `${serverToken.substring(0, 8)}...` : 'NOT FOUND');
  console.log('Sender Email:', senderEmail || 'NOT FOUND');
  
  if (!serverToken || !senderEmail) {
    console.error('❌ Missing Postmark configuration');
    return;
  }
  
  try {
    // Step 1: Create verification token (simulated)
    const tokenResult = createMockVerificationToken(testSignupData.email);
    console.log('✅ Verification token created:', tokenResult.token.substring(0, 8) + '...');
    
    // Step 2: Create verification link
    const baseUrl = 'http://localhost:8081';
    const verifyLink = `${baseUrl}/verify-email?token=${tokenResult.token}&email=${encodeURIComponent(testSignupData.email)}`;
    console.log('✅ Verification link created:', verifyLink);
    
    // Step 3: Send confirmation email using direct Postmark client (same as working test)
    console.log('\n📧 Sending confirmation email...');
    
    const client = new Client(serverToken);
    
    // Create the exact same HTML content as in the signup process
    const fullName = `${testSignupData.firstName} ${testSignupData.lastName}`;
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://www.mokmzansibooks.com/email-assets/logo.png" alt="MOK Mzansi Books" style="width: 120px; height: auto;" />
        </div>
        <h2 style="color: #1f2937; text-align: center; margin-bottom: 20px;">Confirm Your Email Address</h2>
        <p style="color: #4b5563; line-height: 1.6;">Hi ${fullName},</p>
        <p style="color: #4b5563; line-height: 1.6;">Thank you for signing up! Please click the button below to confirm your email address and activate your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyLink}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; text-decoration: none; border-radius: 4px; font-weight: 600;">Confirm Email Address</a>
        </div>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">If you can't click the button, copy and paste this link into your browser:</p>
        <p style="color: #6b7280; font-size: 14px; word-break: break-all;">${verifyLink}</p>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">© 2024 MOK Mzansi Books. All rights reserved.</p>
      </div>
    `;
    
    const result = await client.sendEmail({
      From: senderEmail,
      To: testSignupData.email,
      Subject: 'Confirm Your MOK Mzansi Books Account',
      HtmlBody: htmlContent,
      MessageStream: 'outbound',
      TrackOpens: true
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.MessageID);
    console.log('To:', result.To);
    console.log('Submitted At:', result.SubmittedAt);
    console.log('Error Code:', result.ErrorCode);
    
    if (result.ErrorCode === 0) {
      console.log('\n🎉 SUCCESS: Signup confirmation email sent successfully!');
      console.log('📧 Email sent to:', testSignupData.email);
      console.log('🔗 Verification link:', verifyLink);
      console.log('\n💡 This proves that Postmark is configured correctly.');
      console.log('💡 The issue might be in the frontend application environment.');
    } else {
      console.log('\n⚠️  WARNING: Email sent but with error code:', result.ErrorCode);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR in signup email flow:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    
    if (error.code === 300) {
      console.error('\n💡 This is likely an invalid email address or sender signature issue.');
    } else if (error.code === 10) {
      console.error('\n💡 This is likely an authentication issue. Check your server token.');
    } else if (error.code === 405) {
      console.error('\n💡 This is likely a sender signature issue. Make sure your sender email is verified in Postmark.');
    }
  }
}

// Run the test
testSignupEmailFlow();