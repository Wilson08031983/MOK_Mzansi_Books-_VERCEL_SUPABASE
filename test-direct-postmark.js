require('dotenv').config({ path: '.env.local' });
const postmark = require('postmark');

async function testDirectPostmarkSend() {
  console.log('🚀 Testing Direct Postmark Email Send');
  console.log('=====================================\n');

  const serverToken = process.env.POSTMARK_SERVER_TOKEN;
  const senderEmail = process.env.POSTMARK_SENDER_EMAIL || 'noreply@mokmzansibooks.com';
  
  console.log(`📧 Using sender email: ${senderEmail}`);
  console.log(`🔑 Using server token: ${serverToken ? serverToken.substring(0, 8) + '...' : 'NOT SET'}\n`);

  const client = new postmark.ServerClient(serverToken);

  // Test with a reactivated email
  const testEmail = 'mokgethamoabelo@yahoo.com';
  
  try {
    console.log(`📤 Attempting to send test email to: ${testEmail}`);
    
    const result = await client.sendEmail({
      From: senderEmail,
      To: testEmail,
      Subject: 'Test Email After Reactivation',
      HtmlBody: `
        <h2>Email Verification Test</h2>
        <p>This is a test email sent after reactivating bounced addresses in Postmark.</p>
        <p>If you receive this email, the email verification system is working correctly.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `,
      TextBody: `
        Email Verification Test
        
        This is a test email sent after reactivating bounced addresses in Postmark.
        If you receive this email, the email verification system is working correctly.
        
        Sent at: ${new Date().toISOString()}
      `,
      MessageStream: process.env.POSTMARK_MESSAGE_STREAM || 'outbound'
    });

    console.log('✅ Email sent successfully!');
    console.log('📋 Response details:');
    console.log(`   - Message ID: ${result.MessageID}`);
    console.log(`   - Submitted At: ${result.SubmittedAt}`);
    console.log(`   - To: ${result.To}`);
    console.log(`   - Status: ${result.ErrorCode === 0 ? 'Success' : 'Error'}`);
    
    if (result.ErrorCode !== 0) {
      console.log(`   - Error: ${result.Message}`);
    }

  } catch (error) {
    console.log('❌ Failed to send email:');
    console.log(`   - Error: ${error.message}`);
    console.log(`   - Code: ${error.code || 'N/A'}`);
    
    if (error.code === 406) {
      console.log('\n🔍 This indicates the recipient is still marked as inactive in Postmark.');
      console.log('   You may need to reactivate this specific email address.');
    }
  }
}

testDirectPostmarkSend().catch(console.error);