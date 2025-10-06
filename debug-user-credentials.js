// Debug script to check user credentials and email verification status
// Run this in the browser console

console.log('=== USER CREDENTIALS DEBUG ===');

// Check if userCredentials exists in localStorage
const credentialsRaw = localStorage.getItem('userCredentials');
if (!credentialsRaw) {
  console.log('❌ No userCredentials found in localStorage');
} else {
  try {
    const credentials = JSON.parse(credentialsRaw);
    console.log('✅ Found userCredentials in localStorage');
    console.log('Number of users:', Object.keys(credentials).length);
    
    Object.entries(credentials).forEach(([id, user]) => {
      console.log(`\n--- User ID: ${id} ---`);
      console.log(`Email: ${user.email}`);
      console.log(`Email Verified: ${user.emailVerified}`);
      console.log(`Full Name: ${user.fullName || 'Not set'}`);
      console.log(`Role: ${user.role}`);
      console.log(`Has Password: ${user.password ? 'Yes' : 'No'}`);
      console.log(`Has Verification Token: ${user.verifyToken ? 'Yes' : 'No'}`);
      if (user.verifyTokenExpiresAt) {
        const expiry = new Date(user.verifyTokenExpiresAt);
        const now = new Date();
        console.log(`Token Expires: ${expiry.toLocaleString()}`);
        console.log(`Token Expired: ${expiry < now ? 'Yes' : 'No'}`);
      }
    });
  } catch (error) {
    console.error('❌ Error parsing userCredentials:', error);
  }
}

// Check current logged in user
const currentUserRaw = localStorage.getItem('mokUser');
if (!currentUserRaw) {
  console.log('\n❌ No current user (mokUser) found in localStorage');
} else {
  try {
    const currentUser = JSON.parse(currentUserRaw);
    console.log('\n✅ Found current user (mokUser) in localStorage');
    console.log('Current user:', currentUser);
  } catch (error) {
    console.error('❌ Error parsing current user:', error);
  }
}

console.log('\n=== END DEBUG ===');