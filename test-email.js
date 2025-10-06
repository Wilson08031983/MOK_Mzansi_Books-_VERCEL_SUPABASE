// Test script to verify Postmark email sending
const { Client } = require('postmark');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const serverToken = process.env.POSTMARK_SERVER_TOKEN;
const senderEmail = process.env.POSTMARK_FROM_EMAIL;

console.log('Testing Postmark configuration...');
console.log('Server Token:', serverToken ? `${serverToken.substring(0, 8)}...` : 'NOT FOUND');
console.log('Sender Email:', senderEmail || 'NOT FOUND');

if (!serverToken) {
  console.error('❌ POSTMARK_SERVER_TOKEN not found in environment variables');
  process.exit(1);
}

if (!senderEmail) {
  console.error('❌ POSTMARK_FROM_EMAIL not found in environment variables');
  process.exit(1);
}

// Initialize Postmark client
const client = new Client(serverToken);

// Test email data
const testEmail = {
  From: senderEmail,
  To: 'cindyramatladi@gmail.com',
  Subject: 'Test Email from MOK Mzansi Books',
  HtmlBody: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Test Email</h2>
      <p>This is a test email to verify Postmark configuration.</p>
      <p>If you receive this email, the Postmark setup is working correctly.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
    </div>
  `,
  TextBody: 'This is a test email to verify Postmark configuration.',
  MessageStream: 'outbound'
};

async function sendTestEmail() {
  try {
    console.log('\n🚀 Sending test email...');
    const result = await client.sendEmail(testEmail);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.MessageID);
    console.log('To:', result.To);
    console.log('Submitted At:', result.SubmittedAt);
    console.log('Error Code:', result.ErrorCode);
    
    if (result.ErrorCode === 0) {
      console.log('\n🎉 SUCCESS: Test email was sent successfully to', testEmail.To);
    } else {
      console.log('\n⚠️  WARNING: Email sent but with error code:', result.ErrorCode);
    }
  } catch (error) {
    console.error('\n❌ ERROR sending email:');
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
sendTestEmail();