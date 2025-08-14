/**
 * Verify Regular User Removal Script
 * Run this in the browser console to verify Regular User has been completely removed
 */

console.log('🔍 Verifying Regular User removal from all systems...');

// Check 1: User Credentials
console.log('\n1️⃣ Checking User Credentials...');
const credentials = localStorage.getItem('userCredentials');
if (credentials) {
  const parsedCredentials = JSON.parse(credentials);
  const regularUserFound = Object.values(parsedCredentials).some(user => 
    user.fullName === 'Regular User' || user.email === 'user@mokmzansibooks.com'
  );
  
  if (regularUserFound) {
    console.error('❌ Regular User found in credentials');
  } else {
    console.log('✅ No Regular User in credentials');
  }
  
  console.log('Available users:', Object.values(parsedCredentials).map(u => u.fullName));
} else {
  console.log('ℹ️ No credentials found - will be initialized with Admin only');
}

// Check 2: Employee Data
console.log('\n2️⃣ Checking Employee Data...');
const employees = localStorage.getItem('employees');
if (employees) {
  const parsedEmployees = JSON.parse(employees);
  const regularEmployeeFound = parsedEmployees.some(emp => 
    emp.firstName === 'Regular' && emp.surname === 'User'
  );
  
  if (regularEmployeeFound) {
    console.error('❌ Regular User found in employees');
  } else {
    console.log('✅ No Regular User in employees');
  }
  
  console.log('Available employees:', parsedEmployees.map(e => `${e.firstName} ${e.surname}`));
} else {
  console.log('ℹ️ No employees found - will be initialized with Admin only');
}

// Check 3: Payroll Data
console.log('\n3️⃣ Checking Payroll Data...');
const payroll = localStorage.getItem('payrollCalculations');
if (payroll) {
  const parsedPayroll = JSON.parse(payroll);
  const regularPayrollFound = parsedPayroll.some(p => 
    p.employeeName === 'Regular User' || p.employeeId === '0f043fc8-b140-48ce-ba79-56d47e21725c'
  );
  
  if (regularPayrollFound) {
    console.error('❌ Regular User found in payroll');
  } else {
    console.log('✅ No Regular User in payroll');
  }
  
  console.log('Payroll employees:', parsedPayroll.map(p => p.employeeName));
} else {
  console.log('ℹ️ No payroll found - will be calculated for Admin only');
}

// Check 4: Attendance Data
console.log('\n4️⃣ Checking Attendance Data...');
const attendance = localStorage.getItem('attendanceSummaries');
if (attendance) {
  const parsedAttendance = JSON.parse(attendance);
  const regularAttendanceFound = parsedAttendance.some(a => 
    a.employeeId === '0f043fc8-b140-48ce-ba79-56d47e21725c'
  );
  
  if (regularAttendanceFound) {
    console.error('❌ Regular User found in attendance');
  } else {
    console.log('✅ No Regular User in attendance');
  }
} else {
  console.log('ℹ️ No attendance found');
}

// Check 5: EMP201 Cache
console.log('\n5️⃣ Checking EMP201 Cache...');
const emp201Cache = localStorage.getItem('emp201Cache');
if (emp201Cache) {
  const parsedCache = JSON.parse(emp201Cache);
  const regularEMP201Found = Object.keys(parsedCache).some(key => 
    key.includes('0f043fc8-b140-48ce-ba79-56d47e21725c')
  );
  
  if (regularEMP201Found) {
    console.error('❌ Regular User found in EMP201 cache');
  } else {
    console.log('✅ No Regular User in EMP201 cache');
  }
} else {
  console.log('ℹ️ No EMP201 cache found');
}

// Final Summary
console.log('\n🎯 VERIFICATION SUMMARY:');
console.log('Regular User should be completely removed from:');
console.log('✅ Authentication system');
console.log('✅ Employee management');
console.log('✅ Payroll calculations');
console.log('✅ HR components');
console.log('✅ EMP201/PAYE integration');

console.log('\n📋 NEXT STEPS:');
console.log('1. Navigate to HR Management > Employees');
console.log('2. Verify only Admin User appears');
console.log('3. Check Accounting > EMP201/PAYE dropdown');
console.log('4. Confirm only Admin User is available');

console.log('\n🔄 If Regular User still appears, run clear-regular-user-cache.js first');
