/**
 * Regular User Deletion Debug Script
 * Run this in browser console to diagnose why Regular User deletion is failing
 */

console.log('🔍 Starting Regular User deletion diagnosis...');

// Step 1: Check if Regular User exists in localStorage
console.log('\n1️⃣ Checking Regular User in localStorage...');
const employees = localStorage.getItem('employees');
if (employees) {
  const parsedEmployees = JSON.parse(employees);
  console.log('📋 All employees in localStorage:', parsedEmployees.map(e => ({
    id: e.id,
    name: `${e.firstName} ${e.surname}`,
    email: e.email,
    position: e.position
  })));
  
  const regularUser = parsedEmployees.find(e => 
    e.firstName === 'Regular' && e.surname === 'User'
  );
  
  if (regularUser) {
    console.log('👤 Regular User found:', {
      id: regularUser.id,
      name: `${regularUser.firstName} ${regularUser.surname}`,
      email: regularUser.email,
      position: regularUser.position,
      department: regularUser.department
    });
  } else {
    console.log('❌ Regular User not found in employees');
  }
} else {
  console.log('❌ No employees found in localStorage');
}

// Step 2: Check user credentials
console.log('\n2️⃣ Checking user credentials...');
const credentials = localStorage.getItem('userCredentials');
if (credentials) {
  const parsedCredentials = JSON.parse(credentials);
  console.log('🔐 All user credentials:', Object.values(parsedCredentials).map(u => ({
    email: u.email,
    fullName: u.fullName,
    role: u.role
  })));
  
  const regularUserCred = Object.values(parsedCredentials).find(u => 
    u.fullName === 'Regular User' || u.email === 'user@mokmzansibooks.com'
  );
  
  if (regularUserCred) {
    console.log('🔐 Regular User credentials found:', regularUserCred);
  } else {
    console.log('✅ No Regular User credentials found');
  }
}

// Step 3: Check related data
console.log('\n3️⃣ Checking related data...');

// Payroll data
const payroll = localStorage.getItem('payrollCalculations');
if (payroll) {
  const parsedPayroll = JSON.parse(payroll);
  const regularUserPayroll = parsedPayroll.filter(p => 
    p.employeeName === 'Regular User' || p.employeeId === '0f043fc8-b140-48ce-ba79-56d47e21725c'
  );
  console.log('💰 Regular User payroll records:', regularUserPayroll.length);
}

// Attendance data
const attendance = localStorage.getItem('attendanceSummaries');
if (attendance) {
  const parsedAttendance = JSON.parse(attendance);
  const regularUserAttendance = parsedAttendance.filter(a => 
    a.employeeId === '0f043fc8-b140-48ce-ba79-56d47e21725c'
  );
  console.log('📅 Regular User attendance records:', regularUserAttendance.length);
}

// Step 4: Test delete function manually
console.log('\n4️⃣ Testing delete function...');
if (employees) {
  const parsedEmployees = JSON.parse(employees);
  const regularUser = parsedEmployees.find(e => 
    e.firstName === 'Regular' && e.surname === 'User'
  );
  
  if (regularUser) {
    console.log('🧪 Attempting manual deletion test...');
    
    // Simulate the delete operation
    const beforeCount = parsedEmployees.length;
    const filteredEmployees = parsedEmployees.filter(emp => emp.id !== regularUser.id);
    const afterCount = filteredEmployees.length;
    
    console.log('📊 Delete simulation results:', {
      beforeCount,
      afterCount,
      removed: beforeCount - afterCount,
      regularUserId: regularUser.id,
      success: beforeCount > afterCount
    });
    
    if (beforeCount === afterCount) {
      console.error('❌ ISSUE FOUND: Employee ID mismatch - Regular User ID not matching filter');
      console.log('🔍 Regular User ID:', regularUser.id);
      console.log('🔍 All employee IDs:', parsedEmployees.map(e => e.id));
    }
  }
}

// Step 5: Check for any error boundaries or validation
console.log('\n5️⃣ Checking for validation issues...');
console.log('🔍 This script completed - check console for any errors during Regular User deletion');

// Step 6: Provide manual cleanup option
console.log('\n6️⃣ Manual cleanup function available:');
console.log('Run: manualDeleteRegularUser() to force delete Regular User');

window.manualDeleteRegularUser = function() {
  console.log('🗑️ Starting manual Regular User deletion...');
  
  try {
    // Remove from employees
    const employees = localStorage.getItem('employees');
    if (employees) {
      const parsedEmployees = JSON.parse(employees);
      const filteredEmployees = parsedEmployees.filter(e => 
        !(e.firstName === 'Regular' && e.surname === 'User') &&
        e.id !== '0f043fc8-b140-48ce-ba79-56d47e21725c'
      );
      localStorage.setItem('employees', JSON.stringify(filteredEmployees));
      console.log('✅ Removed Regular User from employees');
    }
    
    // Remove from credentials
    const credentials = localStorage.getItem('userCredentials');
    if (credentials) {
      const parsedCredentials = JSON.parse(credentials);
      Object.keys(parsedCredentials).forEach(key => {
        const user = parsedCredentials[key];
        if (user.fullName === 'Regular User' || user.email === 'user@mokmzansibooks.com') {
          delete parsedCredentials[key];
        }
      });
      localStorage.setItem('userCredentials', JSON.stringify(parsedCredentials));
      console.log('✅ Removed Regular User credentials');
    }
    
    // Clear all related data
    ['payrollCalculations', 'attendanceSummaries', 'employeeDeductions', 'salaryAdvances'].forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        const filtered = parsed.filter(item => 
          item.employeeId !== '0f043fc8-b140-48ce-ba79-56d47e21725c' &&
          item.employeeName !== 'Regular User'
        );
        localStorage.setItem(key, JSON.stringify(filtered));
        console.log(`✅ Cleaned ${key}`);
      }
    });
    
    console.log('🎉 Manual Regular User deletion completed!');
    console.log('🔄 Refresh the page to see changes');
    
  } catch (error) {
    console.error('❌ Error during manual deletion:', error);
  }
};
