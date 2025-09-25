/**
 * Remove All Users Except Admin Script
 * Run this in the browser console to completely remove all users except admin@mokmzansibooks.com
 */

console.log('🧹 Starting complete user cleanup - keeping only admin@mokmzansibooks.com...');

// Step 1: Clear all localStorage and sessionStorage data
console.log('📝 Clearing all storage...');
localStorage.clear();
sessionStorage.clear();

// Step 2: Clear any specific keys that might persist
const keysToRemove = [
  'userCredentials',
  'employees',
  'payrollCalculations',
  'attendanceSummaries',
  'employeeDeductions',
  'salaryAdvances',
  'emp201Calculations',
  'cachedEMP201',
  'emp201Cache',
  'hrAccountingCache',
  'userPermissions',
  'mokUser',
  'invites',
  'companyData',
  'subscriptionData',
  'paymentHistory'
];

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
  console.log(`✅ Removed: ${key}`);
});

// Step 3: Create only the admin user
console.log('👤 Creating admin@mokmzansibooks.com user...');
const adminUser = {
  id: 'admin-' + Date.now(),
  email: 'admin@mokmzansibooks.com',
  password: 'admin123',
  role: 'Manager',
  fullName: 'Admin User',
  permissions: {
    dashboard: { read: true, write: true, delete: true },
    clients: { read: true, write: true, delete: true },
    quotations: { read: true, write: true, delete: true },
    invoices: { read: true, write: true, delete: true },
    inventory: { read: true, write: true, delete: true },
    projects: { read: true, write: true, delete: true },
    hrManagement: { read: true, write: true, delete: true },
    accounting: { read: true, write: true, delete: true },
    reports: { read: true, write: true, delete: true },
    settings: { read: true, write: true, delete: true },
    company: { read: true, write: true, delete: true }
  }
};

// Store only the admin user
const userCredentials = {
  [adminUser.id]: adminUser
};

localStorage.setItem('userCredentials', JSON.stringify(userCredentials));
console.log('✅ Admin user created successfully');

// Step 4: Verify the cleanup
console.log('🔍 Verifying cleanup...');
const remainingCredentials = localStorage.getItem('userCredentials');
if (remainingCredentials) {
  const parsed = JSON.parse(remainingCredentials);
  const userCount = Object.keys(parsed).length;
  const users = Object.values(parsed);

  console.log(`📊 Remaining users: ${userCount}`);
  users.forEach(user => {
    console.log(`  - ${user.fullName} (${user.email}) - ${user.role}`);
  });

  if (userCount === 1 && users[0].email === 'admin@mokmzansibooks.com') {
    console.log('✅ SUCCESS: Only admin user remains');
  } else {
    console.error('❌ ERROR: Multiple users or wrong user remaining');
  }
} else {
  console.error('❌ ERROR: No user credentials found');
}

// Step 5: Show success message
console.log('🎯 User cleanup completed!');
console.log('✅ Only admin@mokmzansibooks.com remains');
console.log('🔄 Reloading page...');

// Step 6: Reload the page
setTimeout(() => {
  window.location.reload();
}, 2000);
