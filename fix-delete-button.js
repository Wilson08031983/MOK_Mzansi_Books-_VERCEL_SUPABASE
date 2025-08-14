/**
 * Immediate Delete Button Fix Script
 * Copy and paste this into browser console on HR Management page
 */

console.log('🔧 Fixing Regular User delete button functionality...');

// Step 1: Check current state
const employees = JSON.parse(localStorage.getItem('employees') || '[]');
const regularUser = employees.find(emp => 
  emp.firstName === 'Regular' && emp.surname === 'User'
);

if (!regularUser) {
  console.log('❌ Regular User not found - already deleted');
} else {
  console.log('👤 Regular User found:', {
    id: regularUser.id,
    position: regularUser.position,
    email: regularUser.email
  });
  
  // Step 2: Check why delete button might not work
  const isAdminPosition = regularUser.position && ['CEO', 'Founder', 'Director', 'Manager'].includes(regularUser.position);
  const isAdminEmail = regularUser.email === 'admin@mokmzansibooks.com';
  const isProtected = isAdminEmail || isAdminPosition;
  
  console.log('🔍 Delete button analysis:');
  console.log('- Admin position:', isAdminPosition);
  console.log('- Admin email:', isAdminEmail);
  console.log('- Protected from deletion:', isProtected);
  
  if (isProtected) {
    console.log('\n🚨 ISSUE: Regular User is protected - fixing position...');
    
    // Fix the position to allow deletion
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
    console.log('✅ Position fixed to "Staff Member"');
    console.log('🔄 Refresh the page to see the working delete button');
  } else {
    console.log('\n✅ Position is correct - delete button should work');
  }
}

// Step 3: Provide manual delete function
console.log('\n🗑️ MANUAL DELETE OPTION:');
console.log('If delete button still doesn\'t work, run: deleteRegularUserNow()');

window.deleteRegularUserNow = function() {
  console.log('🗑️ Manually deleting Regular User...');
  
  const employees = JSON.parse(localStorage.getItem('employees') || '[]');
  const regularUser = employees.find(emp => 
    emp.firstName === 'Regular' && emp.surname === 'User'
  );
  
  if (!regularUser) {
    console.log('❌ Regular User not found');
    return;
  }
  
  if (confirm('Are you sure you want to delete Regular User? This action cannot be undone.')) {
    try {
      // Remove from employees
      const filteredEmployees = employees.filter(emp => emp.id !== regularUser.id);
      localStorage.setItem('employees', JSON.stringify(filteredEmployees));
      
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
        }
      });
      
      // Clear credentials
      const credentials = JSON.parse(localStorage.getItem('userCredentials') || '{}');
      Object.keys(credentials).forEach(key => {
        const user = credentials[key];
        if (user.fullName === 'Regular User' || user.email === 'user@mokmzansibooks.com') {
          delete credentials[key];
        }
      });
      localStorage.setItem('userCredentials', JSON.stringify(credentials));
      
      console.log('✅ Regular User deleted successfully!');
      console.log('🔄 Refresh the page to see changes');
      
      // Auto refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Delete failed:', error);
    }
  }
};

// Step 4: Test delete button click
console.log('\n🧪 TESTING DELETE BUTTON:');
console.log('Run: testDeleteButtonClick() to simulate button click');

window.testDeleteButtonClick = function() {
  console.log('🖱️ Testing delete button click...');
  
  // Find Regular User card and delete button
  const cards = document.querySelectorAll('[class*="card"], [class*="Card"]');
  let regularUserCard = null;
  
  cards.forEach(card => {
    if (card.textContent && card.textContent.includes('Regular User')) {
      regularUserCard = card;
    }
  });
  
  if (regularUserCard) {
    console.log('✅ Found Regular User card');
    
    // Find delete button (trash icon)
    const deleteButton = regularUserCard.querySelector('button[class*="red"], button:has(svg[class*="trash"])');
    
    if (deleteButton) {
      console.log('✅ Found delete button - clicking...');
      deleteButton.click();
    } else {
      console.log('❌ Delete button not found in card');
      console.log('🔍 Available buttons:', regularUserCard.querySelectorAll('button').length);
    }
  } else {
    console.log('❌ Regular User card not found');
  }
};

console.log('\n✅ Delete button fix script loaded!');
console.log('📋 Available commands:');
console.log('- deleteRegularUserNow() - Manual delete');
console.log('- testDeleteButtonClick() - Test button click');
console.log('\n🎯 If delete button still doesn\'t work after refresh, run deleteRegularUserNow()');