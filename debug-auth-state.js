// Debug script to check authentication state
console.log('=== Authentication State Debug ===');

// Check if we're in a browser environment
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  console.log('\n1. LocalStorage Contents:');
  
  // Check mokUser
  const mokUser = localStorage.getItem('mokUser');
  if (mokUser) {
    try {
      const user = JSON.parse(mokUser);
      console.log('mokUser:', JSON.stringify(user, null, 2));
      console.log('mokUser role (root):', user.role);
      console.log('mokUser role (metadata):', user.user_metadata?.role);
    } catch (e) {
      console.log('mokUser (invalid JSON):', mokUser);
    }
  } else {
    console.log('mokUser: null');
  }
  
  // Check currentUser
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    try {
      const user = JSON.parse(currentUser);
      console.log('currentUser:', JSON.stringify(user, null, 2));
    } catch (e) {
      console.log('currentUser (invalid JSON):', currentUser);
    }
  } else {
    console.log('currentUser: null');
  }
  
  // Check userCredentials
  const userCredentials = localStorage.getItem('userCredentials');
  if (userCredentials) {
    try {
      const creds = JSON.parse(userCredentials);
      console.log('userCredentials keys:', Object.keys(creds));
      
      // Find Wilson's credentials
      Object.entries(creds).forEach(([id, user]) => {
        if (user.email === 'mokgethwamoabelo@gmail.com') {
          console.log('Wilson found in credentials:', JSON.stringify(user, null, 2));
        }
      });
    } catch (e) {
      console.log('userCredentials (invalid JSON):', userCredentials);
    }
  } else {
    console.log('userCredentials: null');
  }
  
  // Check all localStorage keys
  console.log('\n2. All localStorage keys:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`- ${key}`);
  }
  
} else {
  console.log('Not in browser environment or localStorage not available');
}

console.log('\n=== End Debug ===');