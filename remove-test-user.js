/**
 * Browser Console Script: Remove User for Testing
 *
 * Run this in your browser's Developer Console (F12) while on the MOK Mzansi Books app
 */

// Remove specific user from localStorage
(function deleteUser(email) {
  const key = 'userCredentials';
  const data = JSON.parse(localStorage.getItem(key) ?? '{}');
  const updated = Object.fromEntries(
    Object.entries(data).filter(([, cred]) => cred.email?.toLowerCase() !== email.toLowerCase())
  );
  localStorage.setItem(key, JSON.stringify(updated));

  // Also clear current user if it's the one being deleted
  if (localStorage.getItem('currentUser')) {
    const current = JSON.parse(localStorage.getItem('currentUser'));
    if (current?.email?.toLowerCase() === email.toLowerCase()) {
      localStorage.removeItem('currentUser');
    }
  }

  console.log(`✅ Removed ${email} from userCredentials.`);
  console.log('🔄 Please refresh the page to clear any cached session.');
})('mokgethwamoabelo@gmail.com');
