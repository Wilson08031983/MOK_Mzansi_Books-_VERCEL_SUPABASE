// Script to manually verify email address in localStorage
// Run this in your browser console at localhost:8080

console.log('=== FIXING EMAIL VERIFICATION ===');

const email = 'mokgethwamoabelo@gmail.com'; // Your email address

// Get current userCredentials
const credentialsRaw = localStorage.getItem('userCredentials');
if (!credentialsRaw) {
  console.log('❌ No userCredentials found in localStorage');
} else {
  try {
    const credentials = JSON.parse(credentialsRaw);
    console.log('✅ Found userCredentials in localStorage');
    
    // Find user by email
    let userFound = false;
    Object.entries(credentials).forEach(([id, user]) => {
      if (user.email === email) {
        console.log(`📧 Found user: ${user.email}`);
        console.log(`Current verification status: ${user.emailVerified}`);
        
        // Set email as verified
        user.emailVerified = true;
        
        // Remove verification token since it's no longer needed
        if (user.verifyToken) {
          delete user.verifyToken;
          delete user.verifyTokenExpiresAt;
          console.log('🗑️ Removed verification token');
        }
        
        userFound = true;
        console.log('✅ Email verification status updated to: true');
      }
    });
    
    if (userFound) {
      // Save back to localStorage
      localStorage.setItem('userCredentials', JSON.stringify(credentials));
      console.log('💾 Updated credentials saved to localStorage');
      
      // Also update mokUser if it exists
      const mokUserRaw = localStorage.getItem('mokUser');
      if (mokUserRaw) {
        try {
          const mokUser = JSON.parse(mokUserRaw);
          if (mokUser.email === email) {
            mokUser.emailVerified = true;
            localStorage.setItem('mokUser', JSON.stringify(mokUser));
            console.log('💾 Updated mokUser verification status');
          }
        } catch (error) {
          console.log('⚠️ Could not update mokUser:', error);
        }
      }
      
      console.log('🎉 Email verification fix complete!');
      console.log('🔄 Please try logging in again now.');
    } else {
      console.log(`❌ User with email ${email} not found in credentials`);
    }
    
  } catch (error) {
    console.error('❌ Error parsing userCredentials:', error);
  }
}

console.log('=== END FIX ===');