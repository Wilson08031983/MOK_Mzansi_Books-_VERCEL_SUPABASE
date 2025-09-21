#!/usr/bin/env tsx

/**
 * Test script for Employee Welcome Email functionality
 * This script tests the new employee welcome email with password creation links
 */

import { postmarkService } from '../services/postmarkService';

interface TestEmployeeData {
  employeeName: string;
  employeeEmail: string;
  position: string;
  department: string;
  companyName: string;
  passwordCreationLink: string;
  startDate: string;
  managerName?: string;
  supportEmail?: string;
}

const testEmployeeWelcomeEmail = async () => {
  console.log('🧪 Testing Employee Welcome Email functionality...');
  console.log('=' .repeat(60));

  const testEmployeeData: TestEmployeeData = {
    employeeName: 'Sarah Johnson',
    employeeEmail: 'sarah.johnson@test.com',
    position: 'Senior Accountant',
    department: 'Finance',
    companyName: 'MOK Mzansi Books',
    passwordCreationLink: 'https://app.mokmzansibooks.com/create-password?token=emp_test_123456789',
    startDate: '2024-02-01',
    managerName: 'Wilson Moabelo',
    supportEmail: 'hr@mokmzansibooks.com'
  };

  try {
    console.log('📧 Sending employee welcome email...');
    console.log(`   → To: ${testEmployeeData.employeeEmail}`);
    console.log(`   → Employee: ${testEmployeeData.employeeName}`);
    console.log(`   → Position: ${testEmployeeData.position}`);
    console.log(`   → Department: ${testEmployeeData.department}`);
    console.log(`   → Start Date: ${testEmployeeData.startDate}`);
    console.log(`   → Password Link: ${testEmployeeData.passwordCreationLink}`);
    
    const result = await postmarkService.sendEmployeeWelcomeEmail(
      testEmployeeData.employeeEmail,
      testEmployeeData
    );

    console.log('\n✅ Employee welcome email sent successfully!');
    console.log(`   → Message ID: ${result.messageId}`);
    console.log(`   → Submitted at: ${result.submittedAt}`);
    console.log(`   → To: ${result.to}`);

    console.log('\n📋 Next steps for verification:');
    console.log('   1. Check the test email inbox for the welcome email');
    console.log('   2. Verify the email contains employee details and password creation link');
    console.log('   3. Ensure the email template renders correctly with company branding');
    console.log('   4. Test the password creation link functionality');
    console.log('   5. Verify email tracking and analytics in Postmark dashboard');

  } catch (error) {
    console.error('❌ Failed to send employee welcome email:');
    console.error('   Error:', error);
    
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
    
    process.exit(1);
  }
};

const testMultipleEmployeeWelcomeEmails = async () => {
  console.log('\n🧪 Testing multiple employee welcome emails...');
  console.log('=' .repeat(60));

  const testEmployees: TestEmployeeData[] = [
    {
      employeeName: 'John Smith',
      employeeEmail: 'john.smith@test.com',
      position: 'Software Developer',
      department: 'IT',
      companyName: 'MOK Mzansi Books',
      passwordCreationLink: 'https://app.mokmzansibooks.com/create-password?token=emp_test_john_123',
      startDate: '2024-02-05',
      managerName: 'Wilson Moabelo',
      supportEmail: 'hr@mokmzansibooks.com'
    },
    {
      employeeName: 'Maria Garcia',
      employeeEmail: 'maria.garcia@test.com',
      position: 'Marketing Specialist',
      department: 'Marketing',
      companyName: 'MOK Mzansi Books',
      passwordCreationLink: 'https://app.mokmzansibooks.com/create-password?token=emp_test_maria_456',
      startDate: '2024-02-10',
      managerName: 'Wilson Moabelo',
      supportEmail: 'hr@mokmzansibooks.com'
    },
    {
      employeeName: 'David Chen',
      employeeEmail: 'david.chen@test.com',
      position: 'Operations Manager',
      department: 'Operations',
      companyName: 'MOK Mzansi Books',
      passwordCreationLink: 'https://app.mokmzansibooks.com/create-password?token=emp_test_david_789',
      startDate: '2024-02-15',
      managerName: 'Wilson Moabelo',
      supportEmail: 'hr@mokmzansibooks.com'
    }
  ];

  let successCount = 0;
  let failureCount = 0;

  for (const employee of testEmployees) {
    try {
      console.log(`\n📧 Sending welcome email to ${employee.employeeName}...`);
      
      const result = await postmarkService.sendEmployeeWelcomeEmail(
        employee.employeeEmail,
        employee
      );

      console.log(`   ✅ Success - Message ID: ${result.messageId}`);
      successCount++;
      
      // Add small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`   ❌ Failed for ${employee.employeeName}:`, error);
      failureCount++;
    }
  }

  console.log('\n📊 Batch Test Results:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log(`   📧 Total: ${testEmployees.length}`);
};

const main = async () => {
  console.log('🚀 Employee Welcome Email Test Suite');
  console.log('=' .repeat(60));
  
  try {
    // Test single employee welcome email
    await testEmployeeWelcomeEmail();
    
    // Test multiple employee welcome emails
    await testMultipleEmployeeWelcomeEmails();
    
    console.log('\n🎉 All employee welcome email tests completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  main().catch(console.error);
}

export { testEmployeeWelcomeEmail, testMultipleEmployeeWelcomeEmails };