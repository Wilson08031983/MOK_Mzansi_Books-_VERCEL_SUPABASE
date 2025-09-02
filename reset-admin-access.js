// Reset Admin Access Script
// This script restores admin@mokmzansibooks.com password to admin123 and creates a trial account

// Admin permissions (full access)
const adminPermissions = {
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
};

// Trial user permissions (limited access)
const trialPermissions = {
  dashboard: { read: true, write: false, delete: false },
  clients: { read: true, write: false, delete: false },
  quotations: { read: true, write: false, delete: false },
  invoices: { read: true, write: false, delete: false },
  inventory: { read: true, write: false, delete: false },
  projects: { read: true, write: false, delete: false },
  hrManagement: { read: false, write: false, delete: false },
  accounting: { read: false, write: false, delete: false },
  reports: { read: true, write: false, delete: false },
  settings: { read: false, write: false, delete: false },
  company: { read: false, write: false, delete: false }
};

// User credentials structure to store in localStorage
const userCredentials = {
  'admin-user': {
    email: 'admin@mokmzansibooks.com',
    password: 'admin123',
    fullName: 'Admin User',
    role: 'Manager',
    permissions: adminPermissions
  },
  'trial-user': {
    email: 'trial@mokmzansibooks.com',
    password: 'trial123',
    fullName: 'Trial User',
    role: 'Staff',
    permissions: trialPermissions
  }
};

// Also create subscription data for trial user (matching mokSubscription format)
const subscriptionData = {
  tier: 'trial',
  status: 'trial',
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
};

console.log('=== MOK Mzansi Books - Admin Access Reset ===\n');

console.log('✅ Admin Account Restored:');
console.log('   Email: admin@mokmzansibooks.com');
console.log('   Password: admin123');
console.log('   Role: Manager (Full Access)\n');

console.log('✅ Trial Account Created:');
console.log('   Email: trial@mokmzansibooks.com');
console.log('   Password: trial123');
console.log('   Role: Staff (Limited Access)');
console.log('   Trial: 30 days active\n');

console.log('🔧 To apply these changes in the browser:');
console.log('1. Open your browser (http://localhost:8082)');
console.log('2. Open Developer Tools (F12)');
console.log('3. Go to Console tab');
console.log('4. Copy and paste the following commands:\n');

console.log('// Reset user credentials');
console.log(`localStorage.setItem('userCredentials', '${JSON.stringify(userCredentials)}');\n`);

console.log('// Set trial subscription data');
console.log(`localStorage.setItem('mokSubscription', '${JSON.stringify(subscriptionData)}');\n`);

console.log('// Clear current user session');
console.log(`localStorage.removeItem('mokUser');\n`);

console.log('5. Refresh the page');
console.log('6. Login with either account\n');

console.log('🎯 Ready to use! You can now:');
console.log('   • Login as admin for full access');
console.log('   • Login as trial user to test trial features');
console.log('   • Subscription status banners will show for trial user');