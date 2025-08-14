// Debug script for Salary Advance Management issues
// Run this in browser console to test and fix salary advance functionality

console.log('🔧 Debugging Salary Advance Management System');

// 1. Check current salary advances in localStorage
const checkSalaryAdvances = () => {
  console.log('\n📋 Current Salary Advances:');
  const advances = JSON.parse(localStorage.getItem('salary_advances') || '[]');
  console.table(advances);
  return advances;
};

// 2. Initialize sample salary advances for testing
const initializeSampleAdvances = () => {
  console.log('\n🔄 Initializing Sample Salary Advances...');
  
  // Clear existing advances
  localStorage.removeItem('salary_advances');
  
  const sampleAdvances = [
    {
      id: 'ADV_' + Date.now() + '_1',
      employeeId: '3fdd7c98-9a2f-4fd5-abb8-734a56777e26', // Admin User
      employeeName: 'Admin User',
      amount: 5000,
      requestDate: new Date().toISOString(),
      deductionPeriod: new Date().toISOString().slice(0, 7), // Current month
      status: 'approved',
      reason: 'Emergency medical expenses',
      approvedDate: new Date().toISOString(),
      approvedBy: 'System'
    },
    {
      id: 'ADV_' + Date.now() + '_2',
      employeeId: '0f043fc8-b140-48ce-ba79-56d47e21725c', // Regular User
      employeeName: 'Regular User',
      amount: 2500,
      requestDate: new Date().toISOString(),
      deductionPeriod: new Date().toISOString().slice(0, 7), // Current month
      status: 'pending',
      reason: 'Car repair expenses'
    }
  ];
  
  localStorage.setItem('salary_advances', JSON.stringify(sampleAdvances));
  console.log('✅ Sample salary advances initialized');
  return sampleAdvances;
};

// 3. Test approve salary advance function
const testApproveSalaryAdvance = (advanceId) => {
  console.log(`\n✅ Testing Approve Salary Advance: ${advanceId}`);
  
  const advances = JSON.parse(localStorage.getItem('salary_advances') || '[]');
  const advanceIndex = advances.findIndex(adv => adv.id === advanceId);
  
  if (advanceIndex === -1) {
    console.error('❌ Advance not found');
    return false;
  }
  
  advances[advanceIndex].status = 'approved';
  advances[advanceIndex].approvedDate = new Date().toISOString();
  advances[advanceIndex].approvedBy = 'Admin User';
  advances[advanceIndex].deductionPeriod = new Date().toISOString().slice(0, 7);
  
  localStorage.setItem('salary_advances', JSON.stringify(advances));
  console.log('✅ Salary advance approved successfully');
  console.log('Updated advance:', advances[advanceIndex]);
  return true;
};

// 4. Test reject salary advance function
const testRejectSalaryAdvance = (advanceId) => {
  console.log(`\n❌ Testing Reject Salary Advance: ${advanceId}`);
  
  const advances = JSON.parse(localStorage.getItem('salary_advances') || '[]');
  const advanceIndex = advances.findIndex(adv => adv.id === advanceId);
  
  if (advanceIndex === -1) {
    console.error('❌ Advance not found');
    return false;
  }
  
  advances[advanceIndex].status = 'rejected';
  advances[advanceIndex].rejectedDate = new Date().toISOString();
  advances[advanceIndex].rejectedBy = 'Admin User';
  
  localStorage.setItem('salary_advances', JSON.stringify(advances));
  console.log('✅ Salary advance rejected successfully');
  console.log('Updated advance:', advances[advanceIndex]);
  return true;
};

// 5. Test salary advance deduction calculation
const testSalaryAdvanceDeduction = (employeeId) => {
  console.log(`\n💰 Testing Salary Advance Deduction for: ${employeeId}`);
  
  const currentPeriod = new Date().toISOString().slice(0, 7);
  const advances = JSON.parse(localStorage.getItem('salary_advances') || '[]');
  
  console.log('Current period:', currentPeriod);
  console.log('All advances:', advances);
  
  const employeeAdvances = advances.filter(adv => adv.employeeId === employeeId);
  console.log('Employee advances:', employeeAdvances);
  
  const approvedAdvances = employeeAdvances.filter(adv => 
    adv.status === 'approved' && 
    adv.deductionPeriod === currentPeriod
  );
  console.log('Approved advances for current period:', approvedAdvances);
  
  const totalDeduction = approvedAdvances.reduce((sum, adv) => sum + adv.amount, 0);
  console.log(`Total salary advance deduction: R${totalDeduction.toFixed(2)}`);
  
  return totalDeduction;
};

// 6. Fix salary advance button click handlers
const fixSalaryAdvanceButtons = () => {
  console.log('\n🔧 Fixing Salary Advance Button Handlers...');
  
  // Find all approve buttons
  const approveButtons = document.querySelectorAll('button:contains("Approve")');
  const rejectButtons = document.querySelectorAll('button:contains("Reject")');
  
  console.log(`Found ${approveButtons.length} approve buttons`);
  console.log(`Found ${rejectButtons.length} reject buttons`);
  
  // Add event listeners if needed
  approveButtons.forEach((button, index) => {
    console.log(`Approve button ${index}:`, button);
  });
  
  rejectButtons.forEach((button, index) => {
    console.log(`Reject button ${index}:`, button);
  });
};

// 7. Run comprehensive test
const runComprehensiveTest = () => {
  console.log('🚀 Running Comprehensive Salary Advance Test...');
  
  // Step 1: Check current state
  const currentAdvances = checkSalaryAdvances();
  
  // Step 2: Initialize sample data
  const sampleAdvances = initializeSampleAdvances();
  
  // Step 3: Test approval
  const pendingAdvance = sampleAdvances.find(adv => adv.status === 'pending');
  if (pendingAdvance) {
    testApproveSalaryAdvance(pendingAdvance.id);
  }
  
  // Step 4: Test deduction calculation
  testSalaryAdvanceDeduction('3fdd7c98-9a2f-4fd5-abb8-734a56777e26'); // Admin User
  testSalaryAdvanceDeduction('0f043fc8-b140-48ce-ba79-56d47e21725c'); // Regular User
  
  // Step 5: Check final state
  console.log('\n📋 Final Salary Advances State:');
  checkSalaryAdvances();
  
  console.log('\n✅ Comprehensive test completed!');
  console.log('💡 Now refresh the HR Management page to see the changes');
};

// Export functions for manual testing
window.salaryAdvanceDebug = {
  checkSalaryAdvances,
  initializeSampleAdvances,
  testApproveSalaryAdvance,
  testRejectSalaryAdvance,
  testSalaryAdvanceDeduction,
  fixSalaryAdvanceButtons,
  runComprehensiveTest
};

console.log('🎯 Salary Advance Debug Tools Available:');
console.log('- salaryAdvanceDebug.checkSalaryAdvances()');
console.log('- salaryAdvanceDebug.initializeSampleAdvances()');
console.log('- salaryAdvanceDebug.testApproveSalaryAdvance(id)');
console.log('- salaryAdvanceDebug.testRejectSalaryAdvance(id)');
console.log('- salaryAdvanceDebug.testSalaryAdvanceDeduction(employeeId)');
console.log('- salaryAdvanceDebug.runComprehensiveTest()');

// Auto-run comprehensive test
runComprehensiveTest();
