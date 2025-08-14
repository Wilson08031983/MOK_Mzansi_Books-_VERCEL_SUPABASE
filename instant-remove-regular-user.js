// Instant Regular User Removal Script
// Copy and paste this entire script into the browser console on the HR Management page

(function() {
  console.log('🔥 INSTANT REGULAR USER REMOVAL STARTING...');
  
  // Step 1: Remove from employees array
  let employees = JSON.parse(localStorage.getItem('employees') || '[]');
  const beforeCount = employees.length;
  
  employees = employees.filter(emp => {
    const isRegularUser = 
      emp.email === 'user@mokmzansibooks.com' ||
      emp.name === 'Regular User' ||
      emp.id === 'RU001' ||
      (emp.firstName === 'Regular' && emp.lastName === 'User');
    
    if (isRegularUser) {
      console.log('🗑️ Removing employee:', emp);
    }
    
    return !isRegularUser;
  });
  
  localStorage.setItem('employees', JSON.stringify(employees));
  console.log(`📊 Employees: ${beforeCount} → ${employees.length}`);
  
  // Step 2: Remove from userCredentials
  let userCredentials = JSON.parse(localStorage.getItem('userCredentials') || '[]');
  const beforeCredCount = userCredentials.length;
  
  userCredentials = userCredentials.filter(cred => {
    const isRegularUser = 
      cred.email === 'user@mokmzansibooks.com' ||
      cred.username === 'regularuser' ||
      cred.username === 'user';
    
    if (isRegularUser) {
      console.log('🔑 Removing credential:', cred);
    }
    
    return !isRegularUser;
  });
  
  localStorage.setItem('userCredentials', JSON.stringify(userCredentials));
  console.log(`🔐 Credentials: ${beforeCredCount} → ${userCredentials.length}`);
  
  // Step 3: Clean related data
  const dataKeys = [
    'payrollCalculations',
    'attendanceSummaries',
    'salaryAdvances',
    'employeePayslips',
    'employeeLeaves',
    'employeePerformance',
    'employeeDocuments'
  ];
  
  dataKeys.forEach(key => {
    try {
      let data = JSON.parse(localStorage.getItem(key) || '[]');
      if (Array.isArray(data)) {
        const originalLength = data.length;
        data = data.filter(item => {
          const isRegularUserData = 
            item.employeeId === 'RU001' ||
            item.email === 'user@mokmzansibooks.com' ||
            (item.employee && item.employee.email === 'user@mokmzansibooks.com');
          
          return !isRegularUserData;
        });
        
        if (originalLength !== data.length) {
          localStorage.setItem(key, JSON.stringify(data));
          console.log(`🧹 ${key}: ${originalLength} → ${data.length}`);
        }
      }
    } catch (e) {
      console.log(`⚠️ Could not process ${key}`);
    }
  });
  
  // Step 4: Force UI update by dispatching storage event
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'employees',
    newValue: JSON.stringify(employees),
    storageArea: localStorage
  }));
  
  // Step 5: Try to trigger React state update if possible
  try {
    // Look for React components and force re-render
    const reactRoot = document.querySelector('#root');
    if (reactRoot && reactRoot._reactInternalFiber) {
      // Force React to re-render
      const event = new CustomEvent('employeeDataChanged', {
        detail: { employees: employees }
      });
      window.dispatchEvent(event);
    }
  } catch (e) {
    console.log('⚠️ Could not trigger React update');
  }
  
  // Step 6: Final verification
  setTimeout(() => {
    const finalEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
    const finalCredentials = JSON.parse(localStorage.getItem('userCredentials') || '[]');
    
    const stillExists = finalEmployees.some(emp => 
      emp.email === 'user@mokmzansibooks.com' ||
      emp.name === 'Regular User' ||
      emp.id === 'RU001'
    );
    
    console.log('\n🔍 FINAL VERIFICATION:');
    console.log('✅ Total employees:', finalEmployees.length);
    console.log('✅ Total credentials:', finalCredentials.length);
    console.log('✅ Regular User exists:', stillExists ? '❌ YES (FAILED)' : '✅ NO (SUCCESS)');
    
    if (!stillExists) {
      console.log('\n🎉 SUCCESS! Regular User has been completely removed!');
      console.log('🔄 If the UI hasn\'t updated, try refreshing the page.');
    } else {
      console.log('\n❌ FAILED! Regular User still exists. Try running the script again.');
    }
  }, 500);
  
})();

// Also provide manual functions
window.removeRegularUserNow = function() {
  const employees = JSON.parse(localStorage.getItem('employees') || '[]');
  const filtered = employees.filter(emp => 
    emp.email !== 'user@mokmzansibooks.com' &&
    emp.name !== 'Regular User' &&
    emp.id !== 'RU001'
  );
  localStorage.setItem('employees', JSON.stringify(filtered));
  location.reload();
};

console.log('\n💡 Manual function available: removeRegularUserNow()');