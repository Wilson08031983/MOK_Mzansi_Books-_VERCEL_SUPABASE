/**
 * Clear Regular User Cache Script
 * Run this in the browser console to completely remove Regular User data
 */

console.log('🧹 Starting Regular User cache clearing...');

// Step 1: Clear all localStorage data
console.log('📝 Clearing localStorage...');
localStorage.clear();

// Step 2: Clear sessionStorage as well
console.log('📝 Clearing sessionStorage...');
sessionStorage.clear();

// Step 3: Clear any specific keys that might persist
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
  'hrAccountingCache'
];

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
  console.log(`✅ Removed: ${key}`);
});

// Step 4: Verify clearing
console.log('🔍 Verifying cache clearing...');
const remainingKeys = Object.keys(localStorage);
if (remainingKeys.length === 0) {
  console.log('✅ All localStorage cleared successfully');
} else {
  console.log('⚠️ Some keys remain:', remainingKeys);
}

// Step 5: Show success message
console.log('🎯 Regular User cache clearing completed!');
console.log('🔄 Reloading page to initialize with Admin User only...');

// Step 6: Reload the page
setTimeout(() => {
  window.location.reload();
}, 1000);
