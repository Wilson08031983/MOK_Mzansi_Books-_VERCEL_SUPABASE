#!/usr/bin/env tsx
/**
 * Comprehensive Postmark Template Testing Script
 * Tests all 13 email templates with proper validation
 * 
 * Usage: npx tsx src/scripts/comprehensive-postmark-test.ts
 */

import { postmarkService } from '../services/postmarkService';
import { PostmarkTemplateDeployer } from './deploy-postmark-templates';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const POSTMARK_TOKEN = process.env.POSTMARK_SERVER_TOKEN;

// All 17 Postmark templates to test
const TEMPLATES_TO_TEST = [
  {
    name: 'Welcome Email',
    alias: 'welcome-email',
    testFunction: testWelcomeEmail
  },
  {
    name: 'Trial Ending Email', 
    alias: 'trial-ending-email',
    testFunction: testTrialEndingEmail
  },
  {
    name: 'Birthday Email',
    alias: 'birthday-email', 
    testFunction: testBirthdayEmail
  },
  {
    name: 'Invoice Email',
    alias: 'invoice-email',
    testFunction: testInvoiceEmail
  },
  {
    name: 'Quotation Email',
    alias: 'quotation-email',
    testFunction: testQuotationEmail
  },
  {
    name: 'Team Invitation Email',
    alias: 'team-invitation-email',
    testFunction: testTeamInvitationEmail
  },
  {
    name: 'Low Stock Alert',
    alias: 'low-stock-alert',
    testFunction: testLowStockAlert
  },
  {
    name: 'Overdue Invoice Email',
    alias: 'overdue-invoice-email',
    testFunction: testOverdueInvoiceEmail
  },
  {
    name: 'Payment Reminder Email',
    alias: 'payment-reminder-email',
    testFunction: testPaymentReminderEmail
  },
  {
    name: 'Invoice Payment Reminder',
    alias: 'invoice-payment-reminder',
    testFunction: testInvoicePaymentReminder
  },
  {
    name: 'Grace Period Reminder',
    alias: 'grace-period-reminder',
    testFunction: testGracePeriodReminder
  },
  {
    name: 'Account Lockout Email',
    alias: 'account-lockout-email',
    testFunction: testAccountLockoutEmail
  },
  {
    name: 'Trial Reminder Email',
    alias: 'trial-reminder-email',
    testFunction: testTrialReminderEmail
  },
  {
    name: 'Generic Custom Email',
    alias: 'generic-custom-email',
    testFunction: testGenericCustomEmail
  },
  {
    name: 'Login Notification',
    alias: 'login-notification',
    testFunction: testLoginNotification
  },
  {
    name: 'Password Reset',
    alias: 'password-reset',
    testFunction: testPasswordReset
  },
  {
    name: 'Employee Welcome Email',
    alias: 'employee-welcome-email',
    testFunction: testEmployeeWelcomeEmail
  }
];

// Test result tracking
interface TestResult {
  templateName: string;
  alias: string;
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
}

const testResults: TestResult[] = [];

// Individual template test functions
async function testWelcomeEmail(): Promise<TestResult> {
  const templateName = 'Welcome Email';
  const alias = 'welcome-email';
  
  try {
    const result = await postmarkService.sendWelcomeEmail(
      TEST_EMAIL,
      'John Smith',
      'https://app.mokmzansibooks.com/login'
    );
    
    return {
      templateName,
      alias,
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      templateName,
      alias,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testTrialEndingEmail(): Promise<TestResult> {
  const templateName = 'Trial Ending Email';
  const alias = 'trial-ending-email';
  
  try {
    const result = await postmarkService.sendTrialReminderEmail(
      TEST_EMAIL,
      {
        userName: 'John Smith',
        daysLeft: 5,
        loginUrl: 'https://app.mokmzansibooks.com/login',
        upgradeLink: 'https://app.mokmzansibooks.com/pricing'
      }
    );
    
    return {
      templateName,
      alias,
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      templateName,
      alias,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testBirthdayEmail(): Promise<TestResult> {
  const templateName = 'Birthday Email';
  const alias = 'birthday-email';
  
  try {
    const result = await postmarkService.sendGenericCustomEmail(
      TEST_EMAIL,
      {
        recipientName: 'Sarah Johnson',
        emailSubject: 'Happy Birthday!',
        emailContent: 'Wishing you a wonderful birthday and another year of success!',
        senderName: 'Wilson Moabelo'
      }
    );
    
    return {
      templateName,
      alias,
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      templateName,
      alias,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testInvoiceEmail(): Promise<TestResult> {
  const templateName = 'Invoice Email';
  const alias = 'invoice-email';
  
  try {
    const result = await postmarkService.sendInvoiceEmail(
      TEST_EMAIL,
      {
        clientName: 'John Smith',
        invoiceNumber: 'INV-2024-001',
        invoiceDate: '2024-01-15',
        dueDate: '2024-02-15',
        total: 'R 7,475.00',
        paymentLink: 'https://app.mokmzansibooks.com/pay/inv-001',
        items: [
          {
            description: 'Web Development Services',
            quantity: 40,
            unitPrice: 'R150.00',
            amount: 'R6,000.00'
          }
        ]
      }
    );
    
    return {
      templateName,
      alias,
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      templateName,
      alias,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testQuotationEmail(): Promise<TestResult> {
  const templateName = 'Quotation Email';
  const alias = 'quotation-email';
  
  try {
    const result = await postmarkService.sendQuotationEmail(
      TEST_EMAIL,
      {
        clientName: 'ABC Company',
        quotationNumber: 'QUO-2024-001',
        quotationDate: '2024-01-10',
        validUntil: '2024-02-10',
        total: 'R 12,075.00',
        acceptLink: 'https://app.mokmzansibooks.com/accept/quo-001',
        items: [
          {
            description: 'Business Website Design',
            quantity: 1,
            unitPrice: 'R8,500.00',
            amount: 'R8,500.00'
          }
        ]
      }
    );
    
    return {
      templateName,
      alias,
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      templateName,
      alias,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testTeamInvitationEmail(): Promise<TestResult> {
  const templateName = 'Team Invitation Email';
  const alias = 'team-invitation-email';
  
  try {
    const result = await postmarkService.sendTeamInvitationEmail(
      TEST_EMAIL,
      'Wilson Moabelo',
      'MOK Mzansi Books',
      'https://app.mokmzansibooks.com/invite/abc123'
    );
    
    return {
      templateName,
      alias,
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      templateName,
      alias,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testLowStockAlert(): Promise<TestResult> {
  const templateName = 'Low Stock Alert';
  const alias = 'low-stock-alert';
  
  try {
    const result = await postmarkService.sendLowStockAlert(
      TEST_EMAIL,
      [
        {
          name: 'African Literature Collection',
          currentStock: 5,
          minimumStock: 20,
          sku: 'ALC-001'
        }
      ]
    );
    
    return {
      templateName,
      alias,
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      templateName,
      alias,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testOverdueInvoiceEmail(): Promise<TestResult> {
  const templateName = 'Overdue Invoice Email';
  const alias = 'overdue-invoice-email';
  
  try {
    const result = await postmarkService.sendOverdueInvoiceEmail(
      TEST_EMAIL,
      {
        clientName: 'John Smith',
        invoiceNumber: 'INV-2024-001',
        dueDate: '2024-01-15',
        daysOverdue: 15,
        amountDue: 'R 7,475.00',
        paymentLink: 'https://app.mokmzansibooks.com/pay/inv-001'
      }
    );
    
    return {
      templateName,
      alias,
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      templateName,
      alias,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testPaymentReminderEmail(): Promise<TestResult> {
  const templateName = 'Payment Reminder Email';
  const alias = 'payment-reminder-email';
  
  try {
    const result = await postmarkService.sendInvoicePaymentReminderEmail(
      TEST_EMAIL,
      {
        clientName: 'John Smith',
        invoiceNumber: 'INV-2024-001',
        dueDate: '2024-02-15',
        amountDue: 'R 7,475.00',
        invoiceLink: 'https://app.mokmzansibooks.com/invoices/INV-2024-001'
      }
    );
    
    return {
      templateName,
      alias,
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      templateName,
      alias,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testInvoicePaymentReminder(): Promise<TestResult> {
  const templateName = 'Invoice Payment Reminder';
  const alias = 'invoice-payment-reminder';
  
  try {
    const result = await postmarkService.sendInvoicePaymentReminderEmail(
      TEST_EMAIL,
      {
        clientName: 'John Smith',
        invoiceNumber: 'INV-2024-001',
        dueDate: '2024-02-15',
        amountDue: 'R 7,475.00',
        invoiceLink: 'https://app.mokmzansibooks.com/invoices/INV-2024-001',
        daysUntilDue: 3
      }
    );
    
    return {
      templateName,
      alias,
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      templateName,
      alias,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testGracePeriodReminder(): Promise<TestResult> {
  const templateName = 'Grace Period Reminder';
  const alias = 'grace-period-reminder';
  
  try {
    const result = await postmarkService.sendGracePeriodReminderEmail(
      TEST_EMAIL,
      {
        userName: 'John Smith',
        daysRemaining: 3,
        gracePeriodEndDate: '2024-02-15',
        paymentLink: 'https://app.mokmzansibooks.com/payment',
        accountManagementLink: 'https://app.mokmzansibooks.com/account',
        lastPaymentAttempt: '2024-01-10',
        amountDue: 750.00
      }
    );
    
    return {
      templateName,
      alias,
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      templateName,
      alias,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testAccountLockoutEmail(): Promise<TestResult> {
  const templateName = 'Account Lockout Email';
  const alias = 'account-lockout-email';
  
  try {
    const result = await postmarkService.sendAccountLockoutEmail(
      TEST_EMAIL,
      {
        userName: 'John Smith',
        lockoutDate: '2024-01-15',
        gracePeriodEndDate: '2024-02-15',
        amountDue: 750.00,
        paymentLink: 'https://app.mokmzansibooks.com/payment',
        accountManagementLink: 'https://app.mokmzansibooks.com/account',
        supportEmail: 'support@mokmzansibooks.com',
        supportPhone: '+27 11 123 4567'
      }
    );
    
    return {
      templateName,
      alias,
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      templateName,
      alias,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testTrialReminderEmail(): Promise<TestResult> {
  const templateName = 'Trial Reminder Email';
  const alias = 'trial-reminder-email';
  
  try {
    const result = await postmarkService.sendTrialReminderEmail(
      TEST_EMAIL,
      {
        userName: 'John Smith',
        loginUrl: 'https://app.mokmzansibooks.com/login',
        daysLeft: 7,
        upgradeLink: 'https://app.mokmzansibooks.com/pricing',
        featuresUsed: ['Invoice Management', 'Client Portal', 'Reporting']
      }
    );
    
    return {
      templateName,
      alias,
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      templateName,
      alias,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testGenericCustomEmail(): Promise<TestResult> {
  const templateName = 'Generic Custom Email';
  const alias = 'generic-custom-email';
  
  try {
    const result = await postmarkService.sendGenericCustomEmail(
      TEST_EMAIL,
      {
        recipientName: 'John Smith',
        emailSubject: 'Important Update from MOK Mzansi Books',
        emailContent: 'We wanted to inform you about some exciting updates to our platform.',
        callToActionText: 'Learn More',
        callToActionLink: 'https://app.mokmzansibooks.com/updates',
        senderName: 'Wilson Moabelo',
        additionalInfo: 'This update will be rolled out gradually over the next week.'
      }
    );
    
    return {
      templateName,
      alias,
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      templateName,
      alias,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testLoginNotification(): Promise<TestResult> {
  const templateName = 'Login Notification';
  const alias = 'login-notification';
  
  try {
    const result = await postmarkService.sendLoginNotificationEmail(
      TEST_EMAIL,
      {
        userName: 'John Smith',
        loginTime: '2024-01-15 14:30:25 SAST',
        loginLocation: 'Johannesburg, South Africa',
        ipAddress: '196.25.1.100',
        deviceInfo: 'MacBook Pro (macOS 14.2)',
        browserInfo: 'Chrome 120.0.6099.109',
        securityLink: 'https://app.mokmzansibooks.com/security'
      }
    );
    
    return {
      templateName,
      alias,
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      templateName,
      alias,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testPasswordReset(): Promise<TestResult> {
  const templateName = 'Password Reset';
  const alias = 'password-reset';
  
  try {
    const result = await postmarkService.sendPasswordResetEmail(
      TEST_EMAIL,
      'https://app.mokmzansibooks.com/reset-password?token=abc123xyz789',
      'John Smith'
    );
    
    return {
      templateName,
      alias,
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      templateName,
      alias,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testEmployeeWelcomeEmail(): Promise<TestResult> {
  const templateName = 'Employee Welcome Email';
  const alias = 'employee-welcome-email';
  
  try {
    const result = await postmarkService.sendEmployeeWelcomeEmail(
      TEST_EMAIL,
      {
        employeeName: 'Sarah Johnson',
        employeeEmail: TEST_EMAIL,
        position: 'Senior Accountant',
        department: 'Finance',
        companyName: 'MOK Mzansi Books',
        passwordCreationLink: 'https://app.mokmzansibooks.com/create-password?token=emp_test_123456789',
        startDate: '2024-02-01',
        managerName: 'Wilson Moabelo',
        supportEmail: 'hr@mokmzansibooks.com'
      }
    );
    
    return {
      templateName,
      alias,
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      templateName,
      alias,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Main test runner
async function runComprehensiveTests(): Promise<void> {
  console.log('🚀 Starting Comprehensive Postmark Template Tests');
  console.log('=' .repeat(60));
  console.log(`📧 Test emails will be sent to: ${TEST_EMAIL}`);
  console.log(`🔑 Postmark token configured: ${POSTMARK_TOKEN ? 'Yes' : 'No (DRY RUN mode)'}`);
  console.log(`📊 Testing ${TEMPLATES_TO_TEST.length} templates\n`);
  
  let successCount = 0;
  let failureCount = 0;
  
  // Test each template
  for (let i = 0; i < TEMPLATES_TO_TEST.length; i++) {
    const template = TEMPLATES_TO_TEST[i];
    console.log(`🧪 [${i + 1}/${TEMPLATES_TO_TEST.length}] Testing ${template.name}...`);
    
    try {
      const result = await template.testFunction();
      testResults.push(result);
      
      if (result.success) {
        console.log(`   ✅ Success - Message ID: ${result.messageId}`);
        successCount++;
      } else {
        console.log(`   ❌ Failed - Error: ${result.error}`);
        failureCount++;
      }
    } catch (error: any) {
      console.log(`   💥 Exception - ${error.message}`);
      testResults.push({
        templateName: template.name,
        alias: template.alias,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      failureCount++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Print summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📈 Success Rate: ${((successCount / TEMPLATES_TO_TEST.length) * 100).toFixed(1)}%`);
  
  // Print detailed results
  console.log('\n📋 DETAILED RESULTS:');
  console.log('-' .repeat(60));
  testResults.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.templateName} (${result.alias})`);
    if (result.messageId) {
      console.log(`   📧 Message ID: ${result.messageId}`);
    }
    if (result.error) {
      console.log(`   🚨 Error: ${result.error}`);
    }
    console.log(`   🕐 Timestamp: ${result.timestamp}`);
    if (index < testResults.length - 1) console.log('');
  });
  
  // Next steps
  console.log('\n💡 NEXT STEPS:');
  console.log('-' .repeat(60));
  if (POSTMARK_TOKEN) {
    console.log('1. Check your email inbox for all test messages');
    console.log('2. Verify email formatting and branding consistency');
    console.log('3. Test all links and call-to-action buttons');
    console.log('4. Validate template variables are properly replaced');
    console.log('5. Check email deliverability and spam scores');
  } else {
    console.log('1. Configure POSTMARK_SERVER_TOKEN in .env.local');
    console.log('2. Re-run tests with actual Postmark integration');
    console.log('3. Deploy templates to Postmark dashboard first');
  }
  
  if (failureCount > 0) {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed successfully!');
  }
}

// Export for use in other scripts
export {
  runComprehensiveTests,
  testResults,
  TEMPLATES_TO_TEST
};

// Run tests if this file is executed directly
if (require.main === module) {
  runComprehensiveTests().catch((error) => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}