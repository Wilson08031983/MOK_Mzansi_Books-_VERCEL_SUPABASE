// Check user verification status in localStorage
const fs = require('fs');

console.log('=== CHECKING USER VERIFICATION STATUS ===');

// Since we can't access localStorage from Node.js, let's create a browser-executable script
const browserScript = `
// Run this in your browser console at localhost:8080
console.log('=== USER CREDENTIALS DEBUG ===');

const credentialsRaw = localStorage.getItem('userCredentials');
if (!credentialsRaw) {
  console.log('❌ No userCredentials found in localStorage');
} else {
  try {
    const credentials = JSON.parse(credentialsRaw);
    console.log('✅ Found userCredentials in localStorage');
    console.log('Number of users:', Object.keys(credentials).length);
    
    Object.entries(credentials).forEach(([id, user]) => {
      console.log(\`\\n--- User ID: \${id} ---\`);
      console.log(\`Email: \${user.email}\`);
      console.log(\`Email Verified: \${user.emailVerified}\`);
      console.log(\`Full Name: \${user.fullName || 'Not set'}\`);
      console.log(\`Role: \${user.role}\`);
      console.log(\`Has Password: \${user.password ? 'Yes' : 'No'}\`);
      console.log(\`Has Verification Token: \${user.verifyToken ? 'Yes' : 'No'}\`);
      if (user.verifyTokenExpiresAt) {
        const expiry = new Date(user.verifyTokenExpiresAt);
        const now = new Date();
        console.log(\`Token Expires: \${expiry.toLocaleString()}\`);
        console.log(\`Token Expired: \${expiry < now ? 'Yes' : 'No'}\`);
      }
    });
  } catch (error) {
    console.error('❌ Error parsing userCredentials:', error);
  }
}

console.log('\\n=== END DEBUG ===');

// Also check for mokUser
const mokUserRaw = localStorage.getItem('mokUser');
if (mokUserRaw) {
  try {
    const mokUser = JSON.parse(mokUserRaw);
    console.log('\\n=== MOK USER DEBUG ===');
    console.log('Current logged in user:', mokUser.email);
    console.log('Email verified:', mokUser.emailVerified);
    console.log('=== END MOK USER DEBUG ===');
  } catch (error) {
    console.error('❌ Error parsing mokUser:', error);
  }
} else {
  console.log('\\n❌ No mokUser found in localStorage (not logged in)');
}
`;

console.log('Browser script created. Please run the following in your browser console:');
console.log('\n' + browserScript);