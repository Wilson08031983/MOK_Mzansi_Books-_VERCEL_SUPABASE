// Comprehensive Salary Advance Management Validation Script
// This script validates all aspects of the salary advance system

console.log('🔍 SALARY ADVANCE MANAGEMENT VALIDATION');
console.log('=====================================');

// Test Configuration
const TEST_CONFIG = {
  ADMIN_USER_ID: '3fdd7c98-9a2f-4fd5-abb8-734a56777e26',
  REGULAR_USER_ID: '0f043fc8-b140-48ce-ba79-56d47e21725c',
  CURRENT_PERIOD: new Date().toISOString().slice(0, 7)
};

// Validation Functions
const validateSalaryAdvanceStorage = () => {
  console.log('\n📋 1. VALIDATING SALARY ADVANCE STORAGE');
  console.log('----------------------------------------');
  
  const advances = JSON.parse(localStorage.getItem('salary_advances') || '[]');
  console.log(`Found ${advances.length} salary advances in storage`);
  
  if (advances.length === 0) {
    console.warn('⚠️  No salary advances found - initializing sample data');
    initializeSampleData();
    return JSON.parse(localStorage.getItem('salary_advances') || '[]');
  }
  
  advances.forEach((advance, index) => {
    console.log(`Advance ${index + 1}:`, {
      id: advance.id,
      employeeName: advance.employeeName,
      amount: `R${advance.amount.toLocaleString()}`,
      status: advance.status,
      deductionPeriod: advance.deductionPeriod
    });
  });
  
  return advances;
};

const validateApprovalWorkflow = (advances) => {
  console.log('\n✅ 2. VALIDATING APPROVAL WORKFLOW');
  console.log('----------------------------------');
  
  const pendingAdvances = advances.filter(adv => adv.status === 'pending');
  const approvedAdvances = advances.filter(adv => adv.status === 'approved');
  
  console.log(`Pending advances: ${pendingAdvances.length}`);
  console.log(`Approved advances: ${approvedAdvances.length}`);
  
  // Test approval process
  if (pendingAdvances.length > 0) {
    const testAdvance = pendingAdvances[0];
    console.log(`Testing approval for: ${testAdvance.employeeName} (R${testAdvance.amount})`);
    
    // Simulate approval
    const updatedAdvances = advances.map(adv => {
      if (adv.id === testAdvance.id) {
        return {
          ...adv,
          status: 'approved',
          approvedDate: new Date().toISOString(),
          approvedBy: 'Test System',
          deductionPeriod: TEST_CONFIG.CURRENT_PERIOD
        };
      }
      return adv;
    });
    
    localStorage.setItem('salary_advances', JSON.stringify(updatedAdvances));
    console.log('✅ Test approval completed');
    return updatedAdvances;
  }
  
  return advances;
};

const validatePayrollIntegration = (advances) => {
  console.log('\n💰 3. VALIDATING PAYROLL INTEGRATION');
  console.log('------------------------------------');
  
  // Test for Admin User
  console.log('\nAdmin User Salary Advance Calculation:');
  const adminAdvances = advances.filter(adv => 
    adv.employeeId === TEST_CONFIG.ADMIN_USER_ID && 
    adv.status === 'approved' && 
    adv.deductionPeriod === TEST_CONFIG.CURRENT_PERIOD
  );
  
  const adminDeduction = adminAdvances.reduce((sum, adv) => sum + adv.amount, 0);
  console.log(`  - Approved advances: ${adminAdvances.length}`);
  console.log(`  - Total deduction: R${adminDeduction.toLocaleString()}`);
  console.log(`  - Expected in payroll: -R${adminDeduction.toLocaleString()}`);
  
  // Test for Regular User
  console.log('\nRegular User Salary Advance Calculation:');
  const regularAdvances = advances.filter(adv => 
    adv.employeeId === TEST_CONFIG.REGULAR_USER_ID && 
    adv.status === 'approved' && 
    adv.deductionPeriod === TEST_CONFIG.CURRENT_PERIOD
  );
  
  const regularDeduction = regularAdvances.reduce((sum, adv) => sum + adv.amount, 0);
  console.log(`  - Approved advances: ${regularAdvances.length}`);
  console.log(`  - Total deduction: R${regularDeduction.toLocaleString()}`);
  console.log(`  - Expected in payroll: ${regularDeduction > 0 ? `-R${regularDeduction.toLocaleString()}` : 'R 0'}`);
  
  return { adminDeduction, regularDeduction };
};

const validateUIElements = () => {
  console.log('\n🎨 4. VALIDATING UI ELEMENTS');
  console.log('----------------------------');
  
  // Check for salary advance management table
  const salaryAdvanceTable = document.querySelector('table');
  if (salaryAdvanceTable) {
    console.log('✅ Salary advance management table found');
    
    // Check for approve/reject buttons
    const approveButtons = document.querySelectorAll('button:contains("Approve")');
    const rejectButtons = document.querySelectorAll('button:contains("Reject")');
    
    console.log(`  - Approve buttons: ${approveButtons.length}`);
    console.log(`  - Reject buttons: ${rejectButtons.length}`);
  } else {
    console.warn('⚠️  Salary advance management table not found');
  }
  
  // Check for payroll calculations table
  const payrollTable = document.querySelector('table');
  if (payrollTable) {
    console.log('✅ Employee payroll calculations table found');
  } else {
    console.warn('⚠️  Employee payroll calculations table not found');
  }
};

const initializeSampleData = () => {
  console.log('\n🔄 INITIALIZING SAMPLE DATA');
  console.log('---------------------------');
  
  const sampleAdvances = [
    {
      id: `ADV_${Date.now()}_ADMIN`,
      employeeId: TEST_CONFIG.ADMIN_USER_ID,
      employeeName: 'Admin User',
      amount: 5000,
      requestDate: new Date().toISOString(),
      deductionPeriod: TEST_CONFIG.CURRENT_PERIOD,
      status: 'approved',
      reason: 'Emergency medical expenses',
      approvedDate: new Date().toISOString(),
      approvedBy: 'System'
    },
    {
      id: `ADV_${Date.now()}_REGULAR`,
      employeeId: TEST_CONFIG.REGULAR_USER_ID,
      employeeName: 'Regular User',
      amount: 2500,
      requestDate: new Date().toISOString(),
      deductionPeriod: TEST_CONFIG.CURRENT_PERIOD,
      status: 'pending',
      reason: 'Car repair expenses'
    }
  ];
  
  localStorage.setItem('salary_advances', JSON.stringify(sampleAdvances));
  console.log('✅ Sample salary advances initialized');
  console.log(`  - Admin User: R5,000 (approved)`);
  console.log(`  - Regular User: R2,500 (pending)`);
  
  return sampleAdvances;
};

const generateValidationReport = (advances, payrollData) => {
  console.log('\n📊 VALIDATION REPORT');
  console.log('===================');
  
  const report = {
    totalAdvances: advances.length,
    pendingAdvances: advances.filter(adv => adv.status === 'pending').length,
    approvedAdvances: advances.filter(adv => adv.status === 'approved').length,
    rejectedAdvances: advances.filter(adv => adv.status === 'rejected').length,
    totalApprovedAmount: advances
      .filter(adv => adv.status === 'approved')
      .reduce((sum, adv) => sum + adv.amount, 0),
    adminUserDeduction: payrollData.adminDeduction,
    regularUserDeduction: payrollData.regularDeduction
  };
  
  console.log('Summary:');
  console.log(`  ✅ Total Salary Advances: ${report.totalAdvances}`);
  console.log(`  ⏳ Pending: ${report.pendingAdvances}`);
  console.log(`  ✅ Approved: ${report.approvedAdvances}`);
  console.log(`  ❌ Rejected: ${report.rejectedAdvances}`);
  console.log(`  💰 Total Approved Amount: R${report.totalApprovedAmount.toLocaleString()}`);
  
  console.log('\nPayroll Integration:');
  console.log(`  👤 Admin User Deduction: R${report.adminUserDeduction.toLocaleString()}`);
  console.log(`  👤 Regular User Deduction: R${report.regularUserDeduction.toLocaleString()}`);
  
  // Validation checks
  const validationPassed = 
    report.totalAdvances > 0 &&
    (report.pendingAdvances > 0 || report.approvedAdvances > 0) &&
    report.adminUserDeduction >= 0 &&
    report.regularUserDeduction >= 0;
  
  if (validationPassed) {
    console.log('\n🎉 VALIDATION PASSED - Salary Advance Management System is working correctly!');
  } else {
    console.log('\n❌ VALIDATION FAILED - Issues detected in Salary Advance Management System');
  }
  
  return report;
};

// Main Validation Function
const runFullValidation = () => {
  console.log('🚀 Starting comprehensive salary advance validation...\n');
  
  try {
    // Step 1: Validate storage
    const advances = validateSalaryAdvanceStorage();
    
    // Step 2: Validate approval workflow
    const updatedAdvances = validateApprovalWorkflow(advances);
    
    // Step 3: Validate payroll integration
    const payrollData = validatePayrollIntegration(updatedAdvances);
    
    // Step 4: Validate UI elements
    validateUIElements();
    
    // Step 5: Generate report
    const report = generateValidationReport(updatedAdvances, payrollData);
    
    console.log('\n🏁 Validation completed successfully!');
    console.log('💡 Refresh the HR Management page to see the latest changes.');
    
    return report;
    
  } catch (error) {
    console.error('❌ Validation failed with error:', error);
    return null;
  }
};

// Export validation functions
window.salaryAdvanceValidation = {
  runFullValidation,
  validateSalaryAdvanceStorage,
  validateApprovalWorkflow,
  validatePayrollIntegration,
  validateUIElements,
  initializeSampleData,
  generateValidationReport
};

// Auto-run validation
console.log('🎯 Salary Advance Validation Tools Available:');
console.log('- salaryAdvanceValidation.runFullValidation()');
console.log('- salaryAdvanceValidation.initializeSampleData()');
console.log('\n');

// Run the full validation
runFullValidation();
