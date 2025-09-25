/**
 * Verify Admin Only Script (Updated)
 * Run this in the browser console to verify only admin@mokmzansibooks.com exists
 */

console.log('🔍 Verifying that only admin@mokmzansibooks.com exists...');

// Check 1: User Credentials
console.log('\n1️⃣ Checking User Credentials...');
const credentials = localStorage.getItem('userCredentials');
if (credentials) {
  const parsedCredentials = JSON.parse(credentials);
  const userCount = Object.keys(parsedCredentials).length;
  const users = Object.values(parsedCredentials);

  console.log(`📊 Total users found: ${userCount}`);
  users.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.fullName} (${user.email}) - ${user.role}`);
  });

  // Check if only admin user exists
  const adminUser = users.find(user => user.email === 'admin@mokmzansibooks.com');
  const nonAdminUsers = users.filter(user => user.email !== 'admin@mokmzansibooks.com');

  if (userCount === 1 && adminUser) {
    console.log('✅ SUCCESS: Only admin user exists');
  } else if (userCount === 0) {
    console.error('❌ ERROR: No users found');
  } else {
    console.error('❌ ERROR: Multiple users found:');
    nonAdminUsers.forEach(user => {
      console.log(`   - ${user.fullName} (${user.email})`);
    });
  }
} else {
  console.error('❌ ERROR: No user credentials found');
}

// Check 2: Current User Session
console.log('\n2️⃣ Checking Current User Session...');
const currentUser = localStorage.getItem('mokUser');
if (currentUser) {
  try {
    const user = JSON.parse(currentUser);
    console.log(`📋 Current session user: ${user.email}`);
    if (user.email === 'admin@mokmzansibooks.com') {
      console.log('✅ Current session is admin user');
    } else {
      console.log('⚠️ Current session is not admin user');
    }
  } catch (error) {
    console.error('❌ Error parsing current user session:', error);
  }
} else {
  console.log('ℹ️ No current user session');
}

// Final Summary
console.log('\n🎯 VERIFICATION SUMMARY:');
if (credentials) {
  const parsedCredentials = JSON.parse(credentials);
  const userCount = Object.keys(parsedCredentials).length;
  const adminUser = Object.values(parsedCredentials).find(user => user.email === 'admin@mokmzansibooks.com');

  if (userCount === 1 && adminUser) {
    console.log('✅ SUCCESS: System contains only admin@mokmzansibooks.com');
    console.log('\n📋 ADMIN LOGIN DETAILS:');
    console.log('   Email: admin@mokmzansibooks.com');
    console.log('   Password: admin123');
    console.log('   Role: Manager');
  } else {
    console.log('❌ FAILURE: System does not contain only admin user');
    console.log('   Run remove-all-users-except-admin.js to fix this');
  }
} else {
  console.log('❌ FAILURE: No user credentials found');
  console.log('   Run remove-all-users-except-admin.js to initialize the system');
}
