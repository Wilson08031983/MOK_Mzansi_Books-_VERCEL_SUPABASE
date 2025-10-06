#!/usr/bin/env node

const { Client } = require('postmark');
require('dotenv').config({ path: '.env.local' });

const POSTMARK_TOKEN = process.env.POSTMARK_SERVER_TOKEN;

if (!POSTMARK_TOKEN) {
  console.error('❌ POSTMARK_SERVER_TOKEN not found in environment variables');
  process.exit(1);
}

const client = new Client(POSTMARK_TOKEN);

async function checkSuppressionList() {
  try {
    console.log('🔍 Checking Postmark suppression list...');
    
    // Get suppressed emails using the correct API method without message stream
    const suppressions = await client.getSuppressions({
      count: 500,
      offset: 0
    });
    
    console.log(`📋 Found ${suppressions.Suppressions.length} suppressed emails:`);
    
    suppressions.Suppressions.forEach((suppression, index) => {
      console.log(`${index + 1}. ${suppression.EmailAddress}`);
      console.log(`   - Origin: ${suppression.Origin}`);
      console.log(`   - Reason: ${suppression.SuppressionReason}`);
      console.log(`   - Created: ${suppression.CreatedAt}`);
      console.log('');
    });
    
    return suppressions.Suppressions;
    
  } catch (error) {
    console.error('❌ Error checking suppression list:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    
    // Try alternative approach - get bounces instead
    try {
      console.log('🔄 Trying to get bounced emails instead...');
      const bounces = await client.getBounces({
        count: 500,
        offset: 0
      });
      
      console.log(`📋 Found ${bounces.Bounces.length} bounced emails:`);
      
      bounces.Bounces.forEach((bounce, index) => {
        console.log(`${index + 1}. ${bounce.Email}`);
        console.log(`   - Type: ${bounce.Type}`);
        console.log(`   - Description: ${bounce.Description}`);
        console.log(`   - Bounced At: ${bounce.BouncedAt}`);
        console.log('');
      });
      
      return bounces.Bounces.map(bounce => ({
        EmailAddress: bounce.Email,
        Origin: 'Bounce',
        SuppressionReason: bounce.Type,
        CreatedAt: bounce.BouncedAt
      }));
      
    } catch (bounceError) {
      console.error('❌ Error getting bounces:', bounceError.message);
      return [];
    }
  }
}

async function removeFromSuppression(emailAddress) {
  try {
    console.log(`🗑️  Removing ${emailAddress} from suppression list...`);
    
    const result = await client.deleteSuppressions([emailAddress]);
    
    console.log('✅ Successfully removed from suppression list');
    console.log('Result:', result);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error removing ${emailAddress} from suppression:`, error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    return false;
  }
}

async function testEmailSend(emailAddress) {
  try {
    console.log(`📧 Testing email send to ${emailAddress}...`);
    
    const result = await client.sendEmail({
      From: process.env.POSTMARK_SENDER_EMAIL || 'noreply@mokmzansibooks.com',
      To: emailAddress,
      Subject: 'Test Email - Suppression Check',
      TextBody: 'This is a test email to verify that the email address is no longer suppressed.',
      HtmlBody: '<p>This is a test email to verify that the email address is no longer suppressed.</p>',
      Tag: 'suppression-test'
    });
    
    console.log('✅ Test email sent successfully');
    console.log('Message ID:', result.MessageID);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error sending test email to ${emailAddress}:`, error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    return false;
  }
}

async function main() {
  console.log('🚀 Postmark Suppression Management Tool');
  console.log('=====================================\n');
  
  // Check current suppression list
  const suppressions = await checkSuppressionList();
  
  if (suppressions.length === 0) {
    console.log('✅ No emails found in suppression list');
    return;
  }
  
  // Target emails to remove
  const targetEmails = [
    'wilson@mokmzansibooks.com',
    'test.user@example.com',
    'mokgethamoabelo@yahoo.com'
  ];
  
  console.log('🎯 Target emails to remove from suppression:');
  targetEmails.forEach(email => console.log(`   - ${email}`));
  console.log('');
  
  // Remove target emails from suppression
  for (const email of targetEmails) {
    const suppressed = suppressions.find(s => s.EmailAddress === email);
    
    if (suppressed) {
      console.log(`📍 Found ${email} in suppression list (${suppressed.SuppressionReason})`);
      
      const removed = await removeFromSuppression(email);
      
      if (removed) {
        // Wait a moment for the change to propagate
        console.log('⏳ Waiting 3 seconds for changes to propagate...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Test sending an email
        await testEmailSend(email);
      }
      
      console.log('');
    } else {
      console.log(`✅ ${email} is not in suppression list`);
    }
  }
  
  // Check suppression list again
  console.log('🔄 Checking suppression list after removal...');
  await checkSuppressionList();
}

main().catch(console.error);