// Debug script to test Wilson's authentication
// Run this in the browser console

console.log('=== Wilson Authentication Debug ===');

// Step 1: Check current localStorage state
console.log('\n1. Current localStorage state:');
console.log('mokUser:', localStorage.getItem('mokUser'));
console.log('currentUser:', localStorage.getItem('currentUser'));

const userCredentials = localStorage.getItem('userCredentials');
if (userCredentials) {
  try {
    const creds = JSON.parse(userCredentials);
    console.log('userCredentials keys:', Object.keys(creds));
    
    let wilsonFound = false;
    Object.entries(creds).forEach(([id, user]) => {
      console.log(`User ${id}:`, user.email, 'Role:', user.role);
      if (user.email === 'mokgethwamoabelo@gmail.com') {
        wilsonFound = true;
        console.log('✓ Wilson found in credentials:');
        console.log('  ID:', id);
        console.log('  Email:', user.email);
        console.log('  Role:', user.role);
        console.log('  Password:', user.password);
        console.log('  Permissions:', user.permissions);
      }
    });
    
    if (!wilsonFound) {
      console.log('❌ Wilson NOT found in userCredentials!');
    }
  } catch (e) {
    console.error('Error parsing userCredentials:', e);
  }
} else {
  console.log('❌ No userCredentials found in localStorage');
}

// Step 2: Manually ensure Wilson's account
window.setupWilsonAccount = function() {
  console.log('\n2. Setting up Wilson\'s account...');
  
  // Get or create credentials
  let credentials = {};
  try {
    const existing = localStorage.getItem('userCredentials');
    if (existing) {
      credentials = JSON.parse(existing);
    }
  } catch (e) {
    console.log('Creating new credentials object');
  }
  
  // Add Wilson's account
  const wilsonId = 'wilson-' + Date.now();
  credentials[wilsonId] = {
    email: 'mokgethwamoabelo@gmail.com',
    password: 'Ka!gi#so123J',
    fullName: 'Wilson Moabelo',
    role: 'CEO',
    permissions: {
      'Dashboard': { read: true, write: true },
      'My Company': { read: true, write: true },
      'Clients': { read: true, write: true },
      'Quotations': { read: true, write: true },
      'Invoices': { read: true, write: true },
      'Projects': { read: true, write: true },
      'HR Management': { read: true, write: true },
      'Accounting': { read: true, write: true },
      'Reports': { read: true, write: true },
      'Inventory': { read: true, write: true },
      'Settings': { read: true, write: true }
    }
  };
  
  localStorage.setItem('userCredentials', JSON.stringify(credentials));
  console.log('✓ Wilson\'s account created with ID:', wilsonId);
  
  return wilsonId;
};

// Step 3: Test login function
window.testWilsonLogin = function() {
  console.log('\n3. Testing Wilson Login...');
  
  const email = 'mokgethwamoabelo@gmail.com';
  const password = 'Ka!gi#so123J';
  
  console.log('Attempting login with:', email);
  
  // Simulate the getUserCredentialsByEmail function
  const userCredentials = localStorage.getItem('userCredentials');
  if (!userCredentials) {
    console.log('❌ No userCredentials found');
    return;
  }
  
  try {
    const creds = JSON.parse(userCredentials);
    const userEntry = Object.entries(creds).find(
      ([_, cred]) => cred?.email?.toLowerCase() === email.toLowerCase()
    );
    
    if (!userEntry) {
      console.log('❌ No user found with email:', email);
      return;
    }
    
    const [userId, userCreds] = userEntry;
    
    if (userCreds.password !== password) {
      console.log('❌ Invalid password');
      console.log('Expected:', userCreds.password);
      console.log('Provided:', password);
      return;
    }
    
    // Create authenticated user object
    const authenticatedUser = {
      id: userId,
      email: userCreds.email,
      user_metadata: {
        first_name: userCreds.fullName?.split(' ')[0] || 'Wilson',
        last_name: userCreds.fullName?.split(' ').slice(1).join(' ') || 'Moabelo',
        role: userCreds.role,
        full_name: userCreds.fullName
      },
      role: userCreds.role
    };
    
    console.log('✓ Authentication successful!');
    console.log('User object:', authenticatedUser);
    
    // Save to localStorage
    localStorage.setItem('mokUser', JSON.stringify(authenticatedUser));
    console.log('✓ User saved to mokUser in localStorage');
    
    // Test permissions
    console.log('\n4. Testing permissions...');
    console.log('User role:', authenticatedUser.role);
    console.log('User role (metadata):', authenticatedUser.user_metadata.role);
    
    // Check if CEO role is considered admin
    const adminRoles = ['CEO', 'Manager', 'Bookkeeper', 'Director', 'Founder'];
    const isAdmin = adminRoles.includes(authenticatedUser.role);
    console.log('Is admin role?', isAdmin);
    
    return authenticatedUser;
  } catch (e) {
    console.error('Error during login test:', e);
  }
};

// Step 4: Test page access
window.testPageAccess = function() {
  console.log('\n5. Testing page access...');
  
  const user = JSON.parse(localStorage.getItem('mokUser') || '{}');
  if (!user.email) {
    console.log('❌ No user logged in');
    return;
  }
  
  console.log('Current user:', user.email);
  console.log('User role:', user.role);
  
  // Test special override for Wilson
  if (user.email === 'mokgethwamoabelo@gmail.com') {
    console.log('✓ Wilson override: Should have access to all pages');
  }
  
  // Test admin role check
  const adminRoles = ['CEO', 'Manager', 'Bookkeeper', 'Director', 'Founder'];
  const isAdmin = adminRoles.includes(user.role);
  console.log('Is admin?', isAdmin);
  
  if (isAdmin) {
    console.log('✓ Admin user: Should have access to all pages');
  }
};

console.log('\n=== Available Commands ===');
console.log('setupWilsonAccount() - Create Wilson\'s account');
console.log('testWilsonLogin() - Test login process');
console.log('testPageAccess() - Test page access permissions');
console.log('\nRun these commands in order to debug the authentication issue.');
console.log('=== End Debug ===');