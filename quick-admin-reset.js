/**
 * Quick Admin Only Reset
 * Run this in the browser console to immediately remove all users except admin@mokmzansibooks.com
 */

console.log('🚀 Quick Admin Only Reset - Starting...');

// Clear everything
localStorage.clear();
sessionStorage.clear();

// Create only admin user
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

localStorage.setItem('userCredentials', JSON.stringify({ [adminUser.id]: adminUser }));

console.log('✅ Admin user created: admin@mokmzansibooks.com');
console.log('✅ All other users removed');
console.log('🔄 Reloading page...');

setTimeout(() => {
  window.location.reload();
}, 1000);
