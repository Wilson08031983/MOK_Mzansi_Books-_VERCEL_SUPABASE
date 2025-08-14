/**
 * Quick Regular User Check Script
 * Copy and paste this into browser console on HR Management page
 */

console.log('🔍 Checking Regular User status...');

// Get all employees from localStorage
const employees = JSON.parse(localStorage.getItem('employees') || '[]');
console.log('📋 Total employees:', employees.length);

// Find Regular User
const regularUser = employees.find(emp => 
  emp.firstName === 'Regular' && emp.surname === 'User'
);

if (regularUser) {
  console.log('👤 Regular User found:', {
    id: regularUser.id,
    name: `${regularUser.firstName} ${regularUser.surname}`,
    email: regularUser.email,
    position: regularUser.position,
    department: regularUser.department
  });
  
  // Check if it's considered a synced admin user
  const isSyncedAdmin = regularUser.email === 'admin@mokmzansibooks.com' || 
    ['CEO', 'Founder', 'Director', 'Manager'].includes(regularUser.position);
  
  console.log('🔒 Is synced admin user:', isSyncedAdmin);
  console.log('🗑️ Delete button should be visible:', !isSyncedAdmin);
  
  // Test delete function
  console.log('\n🧪 Testing delete function...');
  
  try {
    // Simulate the delete process
    const updatedEmployees = employees.filter(emp => emp.id !== regularUser.id);
    console.log('✅ Delete simulation successful');
    console.log('📊 Employees after delete:', updatedEmployees.length);
    
    // Don't actually save - just test
    console.log('ℹ️ This was just a simulation - no data was actually deleted');
    
  } catch (error) {
    console.error('❌ Delete simulation failed:', error);
  }
  
} else {
  console.log('❌ Regular User not found in localStorage');
}

// Check user credentials
const credentials = JSON.parse(localStorage.getItem('userCredentials') || '{}');
const regularUserCred = Object.values(credentials).find(user => 
  user.fullName === 'Regular User' || user.email === 'user@mokmzansibooks.com'
);

if (regularUserCred) {
  console.log('🔐 Regular User credentials found:', {
    email: regularUserCred.email,
    fullName: regularUserCred.fullName,
    role: regularUserCred.role
  });
} else {
  console.log('✅ No Regular User credentials found');
}

console.log('\n🎯 Summary:');
console.log('- Regular User exists:', !!regularUser);
console.log('- Regular User credentials exist:', !!regularUserCred);
if (regularUser) {
  console.log('- Position:', regularUser.position);
  console.log('- Should be deletable:', !(['CEO', 'Founder', 'Director', 'Manager'].includes(regularUser.position) || regularUser.email === 'admin@mokmzansibooks.com'));
}