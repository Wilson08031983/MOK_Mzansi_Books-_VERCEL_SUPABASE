// Force Remove Regular User - Complete Cleanup Script
// Run this in the browser console on the HR Management page

console.log('🔧 Starting force removal of Regular User...');

// Function to completely remove Regular User
function forceRemoveRegularUser() {
  try {
    // 1. Get current employees
    let employees = JSON.parse(localStorage.getItem('employees') || '[]');
    console.log('📋 Current employees:', employees.length);
    
    // 2. Find and remove Regular User
    const initialCount = employees.length;
    employees = employees.filter(emp => 
      emp.email !== 'user@mokmzansibooks.com' && 
      emp.name !== 'Regular User' &&
      emp.id !== 'RU001'
    );
    
    console.log(`🗑️ Removed ${initialCount - employees.length} Regular User entries`);
    
    // 3. Update employees in localStorage
    localStorage.setItem('employees', JSON.stringify(employees));
    
    // 4. Remove from userCredentials
    let userCredentials = JSON.parse(localStorage.getItem('userCredentials') || '[]');
    const initialCredCount = userCredentials.length;
    userCredentials = userCredentials.filter(cred => 
      cred.email !== 'user@mokmzansibooks.com' &&
      cred.username !== 'regularuser'
    );
    
    console.log(`🔑 Removed ${initialCredCount - userCredentials.length} credential entries`);
    localStorage.setItem('userCredentials', JSON.stringify(userCredentials));
    
    // 5. Clean up related data
    const keysToClean = [
      'payrollCalculations',
      'attendanceSummaries', 
      'salaryAdvances',
      'employeePayslips',
      'employeeLeaves',
      'employeePerformance'
    ];
    
    keysToClean.forEach(key => {
      try {
        let data = JSON.parse(localStorage.getItem(key) || '[]');
        if (Array.isArray(data)) {
          const originalLength = data.length;
          data = data.filter(item => 
            item.employeeId !== 'RU001' && 
            item.email !== 'user@mokmzansibooks.com'
          );
          if (originalLength !== data.length) {
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`🧹 Cleaned ${originalLength - data.length} entries from ${key}`);
          }
        }
      } catch (e) {
        console.log(`⚠️ Could not clean ${key}:`, e.message);
      }
    });
    
    // 6. Force page reload to reflect changes
    console.log('✅ Regular User completely removed from all data!');
    console.log('🔄 Reloading page to reflect changes...');
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error during force removal:', error);
    return false;
  }
}

// Function to verify removal
function verifyRegularUserRemoval() {
  const employees = JSON.parse(localStorage.getItem('employees') || '[]');
  const userCredentials = JSON.parse(localStorage.getItem('userCredentials') || '[]');
  
  const regularUserInEmployees = employees.some(emp => 
    emp.email === 'user@mokmzansibooks.com' || 
    emp.name === 'Regular User' ||
    emp.id === 'RU001'
  );
  
  const regularUserInCredentials = userCredentials.some(cred => 
    cred.email === 'user@mokmzansibooks.com' ||
    cred.username === 'regularuser'
  );
  
  console.log('🔍 Verification Results:');
  console.log('- Regular User in employees:', regularUserInEmployees ? '❌ STILL EXISTS' : '✅ REMOVED');
  console.log('- Regular User in credentials:', regularUserInCredentials ? '❌ STILL EXISTS' : '✅ REMOVED');
  console.log('- Total employees:', employees.length);
  console.log('- Total credentials:', userCredentials.length);
  
  return !regularUserInEmployees && !regularUserInCredentials;
}

// Auto-execute the removal
console.log('🚀 Auto-executing Regular User removal...');
forceRemoveRegularUser();

// Make functions available globally for manual use
window.forceRemoveRegularUser = forceRemoveRegularUser;
window.verifyRegularUserRemoval = verifyRegularUserRemoval;

console.log('💡 Functions available:');
console.log('- forceRemoveRegularUser() - Force remove Regular User');
console.log('- verifyRegularUserRemoval() - Check if removal was successful');