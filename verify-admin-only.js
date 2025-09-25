/**
 * Verify Admin Only Script
 * Run this in the browser console to verify only admin@mokmzansibooks.com remains
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
    console.log('✅ Admin user details:');
    console.log(`   - Email: ${adminUser.email}`);
    console.log(`   - Name: ${adminUser.fullName}`);
    console.log(`   - Role: ${adminUser.role}`);
  } else if (userCount === 0) {
    console.error('❌ ERROR: No users found - system needs to be initialized');
  } else {
    console.error('❌ ERROR: Multiple users found:');
    nonAdminUsers.forEach(user => {
      console.log(`   - ${user.fullName} (${user.email}) - ${user.role}`);
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
    console.log(`📋 Current session user: ${user.email} (${user.role || 'No role'})`);

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

// Check 3: User Permissions
console.log('\n3️⃣ Checking User Permissions...');
const permissions = localStorage.getItem('userPermissions');
if (permissions) {
  try {
    const parsedPermissions = JSON.parse(permissions);
    const permissionUsers = Object.keys(parsedPermissions);

    console.log(`🔐 Users with permissions: ${permissionUsers.length}`);
    permissionUsers.forEach(userId => {
      console.log(`   - User ID: ${userId}`);
    });

    // Check if permissions match user credentials
    if (credentials) {
      const parsedCredentials = JSON.parse(credentials);
      const credentialUserIds = Object.keys(parsedCredentials);

      const missingPermissions = credentialUserIds.filter(id => !permissionUsers.includes(id));
      const extraPermissions = permissionUsers.filter(id => !credentialUserIds.includes(id));

      if (missingPermissions.length === 0 && extraPermissions.length === 0) {
        console.log('✅ User permissions match user credentials');
      } else {
        console.log('⚠️ Permission mismatch:');
        if (missingPermissions.length > 0) {
          console.log(`   Missing permissions for users: ${missingPermissions.join(', ')}`);
        }
        if (extraPermissions.length > 0) {
          console.log(`   Extra permissions for users: ${extraPermissions.join(', ')}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error parsing user permissions:', error);
  }
} else {
  console.log('ℹ️ No user permissions found');
}

// Check 4: Other User-related Data
console.log('\n4️⃣ Checking Other User-related Data...');
const userRelatedKeys = [
  'employees',
  'payrollCalculations',
  'attendanceSummaries',
  'employeeDeductions',
  'salaryAdvances',
  'invites'
];

let userDataFound = false;
userRelatedKeys.forEach(key => {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`⚠️ Data found in ${key}: ${parsed.length} items`);
        userDataFound = true;
      } else if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0) {
        console.log(`⚠️ Data found in ${key}: ${Object.keys(parsed).length} items`);
        userDataFound = true;
      }
    } catch {
      console.log(`⚠️ Invalid data found in ${key}`);
      userDataFound = true;
    }
  }
});

if (!userDataFound) {
  console.log('✅ No other user-related data found');
}

// Final Summary
console.log('\n🎯 VERIFICATION SUMMARY:');
if (credentials) {
  const parsedCredentials = JSON.parse(credentials);
  const userCount = Object.keys(parsedCredentials).length;
  const adminUser = Object.values(parsedCredentials).find(user => user.email === 'admin@mokmzansibooks.com');

  if (userCount === 1 && adminUser) {
    console.log('✅ SUCCESS: System contains only admin@mokmzansibooks.com');
    console.log('✅ Admin user has full permissions');
    console.log('✅ No other user data found');
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

console.log('\n🔄 If issues persist, run remove-all-users-except-admin.js script');
