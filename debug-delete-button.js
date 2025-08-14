/**
 * Debug Delete Button Visibility Script
 * Run this in browser console on HR Management page
 */

console.log('🔍 Debugging delete button visibility...');

// Get all employees from localStorage
const employees = JSON.parse(localStorage.getItem('employees') || '[]');
console.log('📋 Total employees:', employees.length);

// Find Regular User
const regularUser = employees.find(emp => 
  emp.firstName === 'Regular' && emp.surname === 'User'
);

if (regularUser) {
  console.log('\n👤 Regular User found:', {
    id: regularUser.id,
    name: `${regularUser.firstName} ${regularUser.surname}`,
    email: regularUser.email,
    position: regularUser.position,
    department: regularUser.department
  });
  
  // Replicate the exact isSyncedAdminUser logic from the component
  const isAdminEmail = regularUser.email === 'admin@mokmzansibooks.com';
  const isAdminPosition = regularUser.position && ['CEO', 'Founder', 'Director', 'Manager'].includes(regularUser.position);
  const isSyncedAdmin = isAdminEmail || isAdminPosition;
  
  console.log('\n🔍 isSyncedAdminUser check:');
  console.log('- Email check (admin@mokmzansibooks.com):', isAdminEmail);
  console.log('- Position check (CEO/Founder/Director/Manager):', isAdminPosition);
  console.log('- Position value:', regularUser.position);
  console.log('- Is synced admin:', isSyncedAdmin);
  console.log('- Delete button should be visible:', !isSyncedAdmin);
  
  // Check if Regular User card is visible in DOM
  const employeeCards = document.querySelectorAll('[data-testid="employee-card"], .employee-card, [class*="employee"]');
  console.log('\n🎯 DOM Analysis:');
  console.log('- Employee cards found:', employeeCards.length);
  
  // Look for Regular User in DOM
  let regularUserCardFound = false;
  let deleteButtonFound = false;
  
  employeeCards.forEach((card, index) => {
    const cardText = card.textContent || '';
    if (cardText.includes('Regular User')) {
      regularUserCardFound = true;
      console.log(`- Regular User card found at index ${index}`);
      
      // Look for delete button (trash icon)
      const deleteButtons = card.querySelectorAll('button[class*="red"], button:has(svg), [class*="trash"]');
      const trashIcons = card.querySelectorAll('svg[class*="trash"], [data-lucide="trash"]');
      
      console.log(`  - Delete buttons in card: ${deleteButtons.length}`);
      console.log(`  - Trash icons in card: ${trashIcons.length}`);
      
      if (deleteButtons.length > 0 || trashIcons.length > 0) {
        deleteButtonFound = true;
        console.log('  ✅ Delete button found in Regular User card');
      } else {
        console.log('  ❌ No delete button found in Regular User card');
      }
    }
  });
  
  if (!regularUserCardFound) {
    console.log('❌ Regular User card not found in DOM');
  }
  
  // Summary
  console.log('\n📊 Summary:');
  console.log('- Regular User exists in localStorage:', true);
  console.log('- Regular User position:', regularUser.position);
  console.log('- Should be deletable (logic):', !isSyncedAdmin);
  console.log('- Card visible in DOM:', regularUserCardFound);
  console.log('- Delete button visible in DOM:', deleteButtonFound);
  
  if (!deleteButtonFound && !isSyncedAdmin) {
    console.log('\n🚨 ISSUE IDENTIFIED:');
    console.log('Regular User should be deletable but delete button is not visible!');
    console.log('This suggests a rendering issue or the position might be incorrectly set.');
  }
  
} else {
  console.log('❌ Regular User not found in localStorage');
  
  // Check if it might be under a different name
  const possibleRegularUsers = employees.filter(emp => 
    emp.email === 'user@mokmzansibooks.com' || 
    emp.firstName?.toLowerCase().includes('regular') ||
    emp.surname?.toLowerCase().includes('user')
  );
  
  if (possibleRegularUsers.length > 0) {
    console.log('🔍 Possible Regular User candidates:');
    possibleRegularUsers.forEach(emp => {
      console.log(`- ${emp.firstName} ${emp.surname} (${emp.email}) - Position: ${emp.position}`);
    });
  }
}

// Check all employees and their delete button eligibility
console.log('\n📋 All employees delete eligibility:');
employees.forEach(emp => {
  const isAdminEmail = emp.email === 'admin@mokmzansibooks.com';
  const isAdminPosition = emp.position && ['CEO', 'Founder', 'Director', 'Manager'].includes(emp.position);
  const isSyncedAdmin = isAdminEmail || isAdminPosition;
  
  console.log(`- ${emp.firstName} ${emp.surname}: ${isSyncedAdmin ? '🔒 Protected' : '🗑️ Deletable'} (Position: ${emp.position})`);
});

console.log('\n✅ Debug complete!');