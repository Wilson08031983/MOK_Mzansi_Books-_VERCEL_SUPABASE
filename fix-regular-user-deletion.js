/**
 * Complete Regular User Deletion Fix Script
 * Run this in browser console on HR Management page
 */

console.log('🔧 Starting Regular User deletion fix...');

// Step 1: Diagnose the current state
console.log('\n1️⃣ DIAGNOSIS PHASE');
const employees = JSON.parse(localStorage.getItem('employees') || '[]');
console.log('📋 Total employees:', employees.length);

// Find Regular User
const regularUser = employees.find(emp => 
  emp.firstName === 'Regular' && emp.surname === 'User'
);

if (!regularUser) {
  console.log('❌ Regular User not found in localStorage');
  console.log('✅ No action needed - Regular User already removed');
} else {
  console.log('👤 Regular User found:', {
    id: regularUser.id,
    name: `${regularUser.firstName} ${regularUser.surname}`,
    email: regularUser.email,
    position: regularUser.position,
    department: regularUser.department
  });
  
  // Check why delete button is not visible
  const isAdminEmail = regularUser.email === 'admin@mokmzansibooks.com';
  const isAdminPosition = regularUser.position && ['CEO', 'Founder', 'Director', 'Manager'].includes(regularUser.position);
  const isSyncedAdmin = isAdminEmail || isAdminPosition;
  
  console.log('\n🔍 Delete button visibility check:');
  console.log('- Email check (admin@mokmzansibooks.com):', isAdminEmail);
  console.log('- Position check (CEO/Founder/Director/Manager):', isAdminPosition);
  console.log('- Current position:', regularUser.position);
  console.log('- Is synced admin (blocks deletion):', isSyncedAdmin);
  console.log('- Delete button should be visible:', !isSyncedAdmin);
  
  if (isSyncedAdmin) {
    console.log('\n🚨 ISSUE IDENTIFIED:');
    console.log(`Regular User has position "${regularUser.position}" which blocks deletion`);
    console.log('This position makes the system think it\'s an admin user');
    
    // Step 2: Fix the position
    console.log('\n2️⃣ FIXING POSITION');
    const updatedEmployees = employees.map(emp => {
      if (emp.firstName === 'Regular' && emp.surname === 'User') {
        return {
          ...emp,
          position: 'Staff Member',
          department: 'General'
        };
      }
      return emp;
    });
    
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    console.log('✅ Updated Regular User position to "Staff Member"');
    console.log('✅ Updated Regular User department to "General"');
    
    // Verify the fix
    const fixedRegularUser = updatedEmployees.find(emp => 
      emp.firstName === 'Regular' && emp.surname === 'User'
    );
    
    const fixedIsAdminPosition = fixedRegularUser.position && ['CEO', 'Founder', 'Director', 'Manager'].includes(fixedRegularUser.position);
    const fixedIsSyncedAdmin = fixedRegularUser.email === 'admin@mokmzansibooks.com' || fixedIsAdminPosition;
    
    console.log('\n✅ VERIFICATION:');
    console.log('- New position:', fixedRegularUser.position);
    console.log('- New department:', fixedRegularUser.department);
    console.log('- Is admin position:', fixedIsAdminPosition);
    console.log('- Is synced admin:', fixedIsSyncedAdmin);
    console.log('- Delete button will be visible:', !fixedIsSyncedAdmin);
    
    if (!fixedIsSyncedAdmin) {
      console.log('\n🎉 SUCCESS: Regular User can now be deleted!');
      console.log('🔄 Refresh the page to see the delete button');
    }
    
  } else {
    console.log('\n✅ Regular User position is correct for deletion');
    console.log('The issue might be elsewhere. Let\'s test the delete function...');
    
    // Step 3: Test delete functionality
    console.log('\n3️⃣ TESTING DELETE FUNCTION');
    
    if (confirm('Do you want to test delete the Regular User now? (This will actually delete it)')) {
      try {
        // Simulate the delete process
        const updatedEmployees = employees.filter(emp => emp.id !== regularUser.id);
        localStorage.setItem('employees', JSON.stringify(updatedEmployees));
        
        // Clear related data
        const dataKeys = ['payrollCalculations', 'attendanceSummaries', 'employeeDeductions', 'salaryAdvances'];
        dataKeys.forEach(key => {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            const filtered = parsed.filter(item => 
              item.employeeId !== regularUser.id &&
              item.employeeName !== 'Regular User'
            );
            localStorage.setItem(key, JSON.stringify(filtered));
            console.log(`✅ Cleaned ${key}`);
          }
        });
        
        // Clear user credentials if they exist
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
        
        console.log('\n🎉 SUCCESS: Regular User deleted successfully!');
        console.log('🔄 Refresh the page to see the changes');
        
      } catch (error) {
        console.error('❌ Error during delete test:', error);
      }
    } else {
      console.log('❌ Delete test cancelled by user');
    }
  }
}

// Step 4: Provide manual delete option
console.log('\n4️⃣ MANUAL DELETE OPTION');
console.log('If you want to manually delete Regular User completely, run:');
console.log('manualDeleteRegularUser()');

// Define manual delete function
window.manualDeleteRegularUser = function() {
  console.log('🗑️ Starting manual Regular User deletion...');
  
  try {
    // Remove from employees
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const filteredEmployees = employees.filter(emp => 
      !(emp.firstName === 'Regular' && emp.surname === 'User') &&
      emp.id !== '0f043fc8-b140-48ce-ba79-56d47e21725c'
    );
    localStorage.setItem('employees', JSON.stringify(filteredEmployees));
    console.log('✅ Removed from employees');
    
    // Remove from credentials
    const credentials = JSON.parse(localStorage.getItem('userCredentials') || '{}');
    Object.keys(credentials).forEach(key => {
      const user = credentials[key];
      if (user.fullName === 'Regular User' || user.email === 'user@mokmzansibooks.com') {
        delete credentials[key];
      }
    });
    localStorage.setItem('userCredentials', JSON.stringify(credentials));
    console.log('✅ Removed credentials');
    
    // Clear all related data
    const dataKeys = ['payrollCalculations', 'attendanceSummaries', 'employeeDeductions', 'salaryAdvances', 'emp201Cache', 'hrAccountingCache'];
    dataKeys.forEach(key => {
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
    
    console.log('\n🎉 Manual deletion completed successfully!');
    console.log('🔄 Refresh the page to see changes');
    
  } catch (error) {
    console.error('❌ Error during manual deletion:', error);
  }
};

console.log('\n✅ Fix script loaded successfully!');
console.log('📋 Summary of available actions:');
console.log('- Position fix: Applied automatically if needed');
console.log('- Manual delete: Run manualDeleteRegularUser()');
console.log('- Refresh page to see changes');