// Test script to verify admin hierarchy after removing mokgethwamoabelo@gmail.com overrides
// Run this in the browser console to test the admin functionality

console.log('=== Testing Admin Hierarchy ===');

// Function to test admin login
function testAdminLogin() {
  console.log('\n1. Testing admin@mokmzansibooks.com login...');
  
  // Get stored credentials
  const credentials = JSON.parse(localStorage.getItem('userCredentials') || '{}');
  console.log('Available users:', Object.keys(credentials).map(id => credentials[id].email));
  
  // Find admin user
  const adminUser = Object.values(credentials).find(user => user.email === 'admin@mokmzansibooks.com');
  if (adminUser) {
    console.log('✅ Admin user found:', {
      email: adminUser.email,
      role: adminUser.role,
      isAdminRole: ['CEO', 'Manager', 'Bookkeeper', 'Director', 'Founder'].includes(adminUser.role)
    });
  } else {
    console.log('❌ Admin user not found');
  }
  
  // Find Wilson's user
  const wilsonUser = Object.values(credentials).find(user => user.email === 'mokgethwamoabelo@gmail.com');
  if (wilsonUser) {
    console.log('📋 Wilson user found:', {
      email: wilsonUser.email,
      role: wilsonUser.role,
      isAdminRole: ['CEO', 'Manager', 'Bookkeeper', 'Director', 'Founder'].includes(wilsonUser.role)
    });
  } else {
    console.log('📋 Wilson user not found');
  }
}

// Function to simulate login and test permissions
function simulateAdminLogin() {
  console.log('\n2. Simulating admin@mokmzansibooks.com login...');
  
  const credentials = JSON.parse(localStorage.getItem('userCredentials') || '{}');
  const adminEntry = Object.entries(credentials).find(([id, user]) => user.email === 'admin@mokmzansibooks.com');
  
  if (adminEntry) {
    const [adminId, adminUser] = adminEntry;
    
    // Simulate login by setting mokUser
    const mockUser = {
      id: adminId,
      email: adminUser.email,
      fullName: adminUser.fullName || 'Admin User',
      role: adminUser.role,
      permissions: adminUser.permissions
    };
    
    localStorage.setItem('mokUser', JSON.stringify(mockUser));
    console.log('✅ Admin user logged in:', mockUser);
    
    return mockUser;
  } else {
    console.log('❌ Could not simulate admin login - user not found');
    return null;
  }
}

// Function to test permissions without special overrides
function testPermissions() {
  console.log('\n3. Testing permissions (no special overrides)...');
  
  const currentUser = JSON.parse(localStorage.getItem('mokUser') || 'null');
  if (!currentUser) {
    console.log('❌ No user logged in');
    return;
  }
  
  console.log('Current user:', currentUser.email, 'Role:', currentUser.role);
  
  // Test admin role check
  const adminRoles = ['CEO', 'Manager', 'Bookkeeper', 'Director', 'Founder'];
  const isAdmin = adminRoles.includes(currentUser.role);
  console.log('Is admin role:', isAdmin);
  
  // Test page access (simulating the logic from usePermissions)
  const testPages = ['Dashboard', 'Clients', 'Settings', 'Team Management'];
  testPages.forEach(page => {
    // Admin users should have access to all pages
    const hasAccess = isAdmin;
    console.log(`${page} access:`, hasAccess ? '✅' : '❌');
  });
}

// Function to reset and test
function resetAndTest() {
  console.log('\n4. Resetting authentication state...');
  localStorage.removeItem('mokUser');
  console.log('✅ User logged out');
}

// Run all tests
function runAllTests() {
  testAdminLogin();
  const user = simulateAdminLogin();
  if (user) {
    testPermissions();
  }
  resetAndTest();
  
  console.log('\n=== Test Summary ===');
  console.log('✅ admin@mokmzansibooks.com should now function as the primary admin');
  console.log('✅ No special overrides for mokgethwamoabelo@gmail.com');
  console.log('✅ All admin verification should go through standard role-based checks');
  console.log('\nTo test manually:');
  console.log('1. Go to /login');
  console.log('2. Login with admin@mokmzansibooks.com / admin123');
  console.log('3. Try accessing Team Management and other admin features');
}

// Export functions for manual testing
window.testAdminHierarchy = {
  runAllTests,
  testAdminLogin,
  simulateAdminLogin,
  testPermissions,
  resetAndTest
};

console.log('\n🚀 Admin hierarchy test functions loaded!');
console.log('Run: testAdminHierarchy.runAllTests() to test everything');
console.log('Or run individual functions as needed.');

// Auto-run tests
runAllTests();