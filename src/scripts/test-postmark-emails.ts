/**
 * Test script for PostMark email integration
 * Run with: npx tsx src/scripts/test-postmark-emails.ts
 */

import { postmarkService } from '../services/postmarkService';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

async function testWelcomeEmail() {
  console.log('\n🧪 Testing Welcome Email...');
  try {
    const result = await postmarkService.sendWelcomeEmail(
      TEST_EMAIL,
      'John Doe',
      'https://www.mokmzansibooks.com/login'
    );
    console.log('✅ Welcome email sent successfully:', {
      messageId: result.messageId,
      to: result.to,
      submittedAt: result.submittedAt
    });
  } catch (error) {
    console.error('❌ Welcome email failed:', error);
  }
}

async function testInvoiceEmail() {
  console.log('\n🧪 Testing Invoice Email...');
  try {
    const result = await postmarkService.sendInvoiceEmail(
      TEST_EMAIL,
      {
        invoiceNumber: 'INV-2024-001',
        clientName: 'Jane Smith',
        dueDate: '2024-02-15',
        total: 'R 1,250.00',
        items: [
          {
            description: 'African Literature Collection - Premium Package',
            quantity: 1,
            unitPrice: 'R 800.00',
            amount: 'R 800.00'
          },
          {
            description: 'Digital Access Subscription (1 Year)',
            quantity: 1,
            unitPrice: 'R 450.00',
            amount: 'R 450.00'
          }
        ]
      }
    );
    console.log('✅ Invoice email sent successfully:', {
      messageId: result.messageId,
      to: result.to,
      submittedAt: result.submittedAt
    });
  } catch (error) {
    console.error('❌ Invoice email failed:', error);
  }
}

async function testQuotationEmail() {
  console.log('\n🧪 Testing Quotation Email...');
  try {
    const result = await postmarkService.sendQuotationEmail(
      TEST_EMAIL,
      {
        quotationNumber: 'QUO-2024-001',
        clientName: 'ABC Publishing House',
        validUntil: '2024-02-28',
        total: 'R 5,500.00',
        items: [
          {
            description: 'Custom Book Publishing Service',
            quantity: 1,
            unitPrice: 'R 3,000.00',
            amount: 'R 3,000.00'
          },
          {
            description: 'Editorial Review and Proofreading',
            quantity: 1,
            unitPrice: 'R 1,500.00',
            amount: 'R 1,500.00'
          },
          {
            description: 'Digital Distribution Setup',
            quantity: 1,
            unitPrice: 'R 1,000.00',
            amount: 'R 1,000.00'
          }
        ]
      }
    );
    console.log('✅ Quotation email sent successfully:', {
      messageId: result.messageId,
      to: result.to,
      submittedAt: result.submittedAt
    });
  } catch (error) {
    console.error('❌ Quotation email failed:', error);
  }
}

async function testPasswordResetEmail() {
  console.log('\n🧪 Testing Password Reset Email...');
  try {
    const result = await postmarkService.sendPasswordResetEmail(
      TEST_EMAIL,
      'https://www.mokmzansibooks.com/reset-password?token=abc123xyz',
      'John Doe'
    );
    console.log('✅ Password reset email sent successfully:', {
      messageId: result.messageId,
      to: result.to,
      submittedAt: result.submittedAt
    });
  } catch (error) {
    console.error('❌ Password reset email failed:', error);
  }
}

async function testTeamInvitationEmail() {
  console.log('\n🧪 Testing Team Invitation Email...');
  try {
    const result = await postmarkService.sendTeamInvitationEmail(
      TEST_EMAIL,
      'Sarah Johnson',
      'MOK Mzansi Books',
      'https://www.mokmzansibooks.com/invite?token=inv123xyz'
    );
    console.log('✅ Team invitation email sent successfully:', {
      messageId: result.messageId,
      to: result.to,
      submittedAt: result.submittedAt
    });
  } catch (error) {
    console.error('❌ Team invitation email failed:', error);
  }
}

async function testLowStockAlert() {
  console.log('\n🧪 Testing Low Stock Alert Email...');
  try {
    const result = await postmarkService.sendLowStockAlert(
      TEST_EMAIL,
      [
        {
          name: 'Things Fall Apart - Chinua Achebe',
          currentStock: 2,
          minimumStock: 10,
          sku: 'TFA-001'
        },
        {
          name: 'Purple Hibiscus - Chimamanda Ngozi Adichie',
          currentStock: 1,
          minimumStock: 5,
          sku: 'PH-002'
        },
        {
          name: 'Born a Crime - Trevor Noah',
          currentStock: 0,
          minimumStock: 8,
          sku: 'BAC-003'
        }
      ]
    );
    console.log('✅ Low stock alert sent successfully:', {
      messageId: result.messageId,
      to: result.to,
      submittedAt: result.submittedAt
    });
  } catch (error) {
    console.error('❌ Low stock alert failed:', error);
  }
}

async function testCustomEmail() {
  console.log('\n🧪 Testing Custom HTML Email...');
  try {
    const result = await postmarkService.sendEmail({
      to: TEST_EMAIL,
      subject: 'Test Custom Email from MOK Mzansi Books',
      htmlBody: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #667eea;">Custom Email Test</h2>
              <p>This is a test of the custom email functionality using PostMark.</p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3>Features Tested:</h3>
                <ul>
                  <li>✅ PostMark API Integration</li>
                  <li>✅ Blob Storage Assets</li>
                  <li>✅ Custom HTML Templates</li>
                  <li>✅ Email Delivery</li>
                </ul>
              </div>
              <p>Best regards,<br>MOK Mzansi Books Team</p>
            </div>
          </body>
        </html>
      `,
      textBody: 'This is a test of the custom email functionality using PostMark. Features tested: PostMark API Integration, Blob Storage Assets, Custom HTML Templates, Email Delivery. Best regards, MOK Mzansi Books Team',
      tag: 'test-email',
      metadata: {
        test: 'true',
        environment: process.env.NODE_ENV || 'development'
      }
    });
    console.log('✅ Custom email sent successfully:', {
      messageId: result.messageId,
      to: result.to,
      submittedAt: result.submittedAt
    });
  } catch (error) {
    console.error('❌ Custom email failed:', error);
  }
}

async function testEmailStats() {
  console.log('\n📊 Testing Email Statistics...');
  try {
    const stats = await postmarkService.getEmailStats();
    console.log('✅ Email statistics retrieved:', {
      sent: stats.Sent,
      bounced: stats.Bounced,
      spamComplaints: stats.SpamComplaints,
      tracked: stats.Tracked,
      withClientRecorded: stats.WithClientRecorded
    });
  } catch (error) {
    console.error('❌ Email statistics failed:', error);
  }
}

async function runAllTests() {
  console.log('🚀 Starting PostMark Email Integration Tests');
  console.log('=' .repeat(50));
  
  // Check if PostMark is configured
if (!process.env.POSTMARK_SERVER_TOKEN) {
  console.log('❌ POSTMARK_SERVER_TOKEN not found in environment variables');
  console.log('Please add your PostMark API token to .env file:');
  console.log('POSTMARK_SERVER_TOKEN="your-postmark-server-api-token"');
  process.exit(1);
}
  
  console.log(`📧 Test emails will be sent to: ${TEST_EMAIL}`);
  console.log('Note: Make sure this is a valid email address you have access to.');
  
  // Run all email tests
  await testWelcomeEmail();
  await testInvoiceEmail();
  await testQuotationEmail();
  await testPasswordResetEmail();
  await testTeamInvitationEmail();
  await testLowStockAlert();
  await testCustomEmail();
  
  // Test statistics (optional)
  await testEmailStats();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎉 PostMark Email Integration Tests Completed!');
  console.log('Check your email inbox for the test messages.');
  console.log('\n💡 Next Steps:');
  console.log('1. Verify all emails were received correctly');
  console.log('2. Check email formatting and assets loading');
  console.log('3. Test email links and functionality');
  console.log('4. Configure PostMark templates in your PostMark dashboard');
  console.log('5. Set up webhook endpoints for bounce/spam handling');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export {
  testWelcomeEmail,
  testInvoiceEmail,
  testQuotationEmail,
  testPasswordResetEmail,
  testTeamInvitationEmail,
  testLowStockAlert,
  testCustomEmail,
  testEmailStats,
  runAllTests
};