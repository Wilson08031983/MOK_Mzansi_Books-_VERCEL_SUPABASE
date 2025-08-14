/**
 * Debug Script for PAYE/EMP201 Data Mix-up Issue
 * 
 * This script helps identify and fix the issue where Admin User and Regular User
 * data appears to be mixed up in the PAYE/EMP201 Calculation Breakdown.
 */

console.log('🔍 PAYE/EMP201 Data Mix-up Debug Script');
console.log('=====================================');

// Function to inspect localStorage data
function inspectLocalStorageData() {
  console.log('\n📊 INSPECTING LOCALSTORAGE DATA:');
  console.log('================================');
  
  // Check employees data
  const employeesData = localStorage.getItem('employees');
  if (employeesData) {
    const employees = JSON.parse(employeesData);
    console.log('\n👥 EMPLOYEES DATA:');
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.firstName} ${emp.surname}`);
      console.log(`   ID: ${emp.id}`);
      console.log(`   Salary: R${emp.salary?.toFixed(2) || 'N/A'}`);
      console.log(`   Position: ${emp.position || 'N/A'}`);
    });
  } else {
    console.log('❌ No employees data found in localStorage');
  }
  
  // Check payroll calculations
  const payrollData = localStorage.getItem('payrollCalculations');
  if (payrollData) {
    const payroll = JSON.parse(payrollData);
    console.log('\n💰 PAYROLL CALCULATIONS DATA:');
    payroll.forEach((calc, index) => {
      console.log(`${index + 1}. ${calc.employeeName}`);
      console.log(`   Employee ID: ${calc.employeeId}`);
      console.log(`   Base Salary: R${calc.baseSalary?.toFixed(2) || 'N/A'}`);
      console.log(`   Attendance Pay: R${calc.attendancePay?.toFixed(2) || 'N/A'}`);
      console.log(`   Gross Salary: R${calc.grossSalary?.toFixed(2) || 'N/A'}`);
      console.log(`   Net Salary: R${calc.netSalary?.toFixed(2) || 'N/A'}`);
    });
  } else {
    console.log('❌ No payroll calculations data found in localStorage');
  }
  
  // Check attendance summaries
  const attendanceData = localStorage.getItem('attendanceSummaries');
  if (attendanceData) {
    const attendance = JSON.parse(attendanceData);
    console.log('\n📅 ATTENDANCE SUMMARIES DATA:');
    attendance.forEach((att, index) => {
      console.log(`${index + 1}. Employee ID: ${att.employeeId}`);
      console.log(`   Regular Hours: ${att.currentMonthRegularHours || 0}`);
      console.log(`   Overtime Hours: ${att.currentMonthOvertimeHours || 0}`);
      console.log(`   Night Shift Hours: ${att.currentMonthNightShiftHours || 0}`);
    });
  } else {
    console.log('❌ No attendance summaries data found in localStorage');
  }
  
  // Check employee allowances
  const allowancesData = localStorage.getItem('employeeAllowances');
  if (allowancesData) {
    const allowances = JSON.parse(allowancesData);
    console.log('\n💵 EMPLOYEE ALLOWANCES DATA:');
    Object.keys(allowances).forEach((empId, index) => {
      console.log(`${index + 1}. Employee ID: ${empId}`);
      console.log(`   Housing: R${allowances[empId].housingAllowance || 0}`);
      console.log(`   Medical: R${allowances[empId].medicalAidAllowance || 0}`);
      console.log(`   Motor Vehicle: R${allowances[empId].motorVehicleAllowance || 0}`);
      console.log(`   Retirement: R${allowances[empId].retirementPlan || 0}`);
    });
  } else {
    console.log('❌ No employee allowances data found in localStorage');
  }
}

// Function to verify employee ID mapping
function verifyEmployeeMapping() {
  console.log('\n🔍 VERIFYING EMPLOYEE ID MAPPING:');
  console.log('=================================');
  
  const employeesData = localStorage.getItem('employees');
  const payrollData = localStorage.getItem('payrollCalculations');
  
  if (!employeesData || !payrollData) {
    console.log('❌ Missing required data for mapping verification');
    return;
  }
  
  const employees = JSON.parse(employeesData);
  const payroll = JSON.parse(payrollData);
  
  console.log('\n📋 EMPLOYEE TO PAYROLL MAPPING:');
  employees.forEach(emp => {
    const matchingPayroll = payroll.find(p => p.employeeId === emp.id);
    
    console.log(`\n👤 ${emp.firstName} ${emp.surname}:`);
    console.log(`   Employee ID: ${emp.id}`);
    console.log(`   Employee Salary: R${emp.salary?.toFixed(2) || 'N/A'}`);
    
    if (matchingPayroll) {
      console.log(`   ✅ Payroll Found: ${matchingPayroll.employeeName}`);
      console.log(`   Payroll Employee ID: ${matchingPayroll.employeeId}`);
      console.log(`   Base Salary Match: ${emp.salary === matchingPayroll.baseSalary ? '✅' : '❌'}`);
      
      if (emp.salary !== matchingPayroll.baseSalary) {
        console.log(`   ⚠️  MISMATCH: Employee=${emp.salary}, Payroll=${matchingPayroll.baseSalary}`);
      }
    } else {
      console.log(`   ❌ No matching payroll found`);
    }
  });
}

// Function to simulate EMP201 calculation and identify issues
function simulateEMP201Calculation() {
  console.log('\n🧮 SIMULATING EMP201 CALCULATION:');
  console.log('=================================');
  
  const payrollData = localStorage.getItem('payrollCalculations');
  if (!payrollData) {
    console.log('❌ No payroll data available for EMP201 simulation');
    return;
  }
  
  const payroll = JSON.parse(payrollData);
  
  // Sort by employee name (same as EMP201 service)
  const sortedPayroll = payroll.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  
  console.log('\n📊 EMP201 EMPLOYEE BREAKDOWN (Sorted by Name):');
  sortedPayroll.forEach((emp, index) => {
    console.log(`\n${index + 1}. ${emp.employeeName}:`);
    console.log(`   Employee ID: ${emp.employeeId}`);
    console.log(`   Gross Salary (Base): R${emp.baseSalary?.toFixed(2) || 'N/A'}`);
    console.log(`   Taxable Income (Attendance): R${emp.attendancePay?.toFixed(2) || 'N/A'}`);
    console.log(`   Total Gross: R${emp.grossSalary?.toFixed(2) || 'N/A'}`);
    
    // Identify expected values
    if (emp.employeeName.includes('Admin')) {
      console.log(`   🎯 Expected: Base=R80,000, Attendance=~R44,108`);
      console.log(`   ✅ Correct Admin User? ${emp.baseSalary === 80000 ? 'YES' : 'NO'}`);
    } else if (emp.employeeName.includes('Regular')) {
      console.log(`   🎯 Expected: Base=R35,000, Attendance=~R15,000`);
      console.log(`   ✅ Correct Regular User? ${emp.baseSalary === 35000 ? 'YES' : 'NO'}`);
    }
  });
}

// Function to fix data mix-up by clearing and regenerating
function fixDataMixup() {
  console.log('\n🔧 FIXING DATA MIX-UP:');
  console.log('======================');
  
  // Clear potentially corrupted payroll cache
  localStorage.removeItem('payrollCalculations');
  console.log('✅ Cleared payrollCalculations cache');
  
  // Clear period-specific cache
  const currentPeriod = new Date().toISOString().slice(0, 7);
  localStorage.removeItem(`payroll_calculations_${currentPeriod}`);
  console.log(`✅ Cleared payroll_calculations_${currentPeriod} cache`);
  
  console.log('\n🔄 Data cache cleared. Please:');
  console.log('1. Go to HR Management > Payroll tab');
  console.log('2. Click "Calculate Payroll" to regenerate fresh data');
  console.log('3. Then check Accounting > PAYE/EMP201 Calculation Breakdown');
  console.log('4. Verify that Admin User and Regular User data is correct');
}

// Function to run comprehensive data validation
function runComprehensiveValidation() {
  console.log('\n🔍 RUNNING COMPREHENSIVE VALIDATION:');
  console.log('====================================');
  
  inspectLocalStorageData();
  verifyEmployeeMapping();
  simulateEMP201Calculation();
  
  console.log('\n📋 VALIDATION SUMMARY:');
  console.log('======================');
  
  const employeesData = localStorage.getItem('employees');
  const payrollData = localStorage.getItem('payrollCalculations');
  
  if (!employeesData) {
    console.log('❌ Missing employees data');
    return;
  }
  
  if (!payrollData) {
    console.log('❌ Missing payroll calculations data');
    return;
  }
  
  const employees = JSON.parse(employeesData);
  const payroll = JSON.parse(payrollData);
  
  // Check for Admin User
  const adminEmployee = employees.find(e => e.firstName.includes('Admin') || e.position === 'Admin');
  const adminPayroll = payroll.find(p => p.employeeName.includes('Admin'));
  
  if (adminEmployee && adminPayroll) {
    console.log(`\n👤 ADMIN USER VALIDATION:`);
    console.log(`   Employee: ${adminEmployee.firstName} ${adminEmployee.surname} (${adminEmployee.id})`);
    console.log(`   Payroll: ${adminPayroll.employeeName} (${adminPayroll.employeeId})`);
    console.log(`   ID Match: ${adminEmployee.id === adminPayroll.employeeId ? '✅' : '❌'}`);
    console.log(`   Salary Match: ${adminEmployee.salary === adminPayroll.baseSalary ? '✅' : '❌'}`);
  }
  
  // Check for Regular User
  const regularEmployee = employees.find(e => e.firstName.includes('Regular') || e.position === 'Employee');
  const regularPayroll = payroll.find(p => p.employeeName.includes('Regular'));
  
  if (regularEmployee && regularPayroll) {
    console.log(`\n👤 REGULAR USER VALIDATION:`);
    console.log(`   Employee: ${regularEmployee.firstName} ${regularEmployee.surname} (${regularEmployee.id})`);
    console.log(`   Payroll: ${regularPayroll.employeeName} (${regularPayroll.employeeId})`);
    console.log(`   ID Match: ${regularEmployee.id === regularPayroll.employeeId ? '✅' : '❌'}`);
    console.log(`   Salary Match: ${regularEmployee.salary === regularPayroll.baseSalary ? '✅' : '❌'}`);
  }
}

// Export functions for manual testing
window.debugPAYEMixup = {
  inspectLocalStorageData,
  verifyEmployeeMapping,
  simulateEMP201Calculation,
  fixDataMixup,
  runComprehensiveValidation
};

// Auto-run comprehensive validation
console.log('🚀 Starting automatic validation...');
runComprehensiveValidation();

console.log('\n🛠️  MANUAL TESTING COMMANDS:');
console.log('============================');
console.log('debugPAYEMixup.inspectLocalStorageData() - Inspect all localStorage data');
console.log('debugPAYEMixup.verifyEmployeeMapping() - Verify employee ID mapping');
console.log('debugPAYEMixup.simulateEMP201Calculation() - Simulate EMP201 calculation');
console.log('debugPAYEMixup.fixDataMixup() - Clear corrupted cache and fix mix-up');
console.log('debugPAYEMixup.runComprehensiveValidation() - Run full validation suite');
