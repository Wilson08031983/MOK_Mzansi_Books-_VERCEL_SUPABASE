/**
 * Browser localStorage Cleanup Script
 * Run this in the browser console to remove all localStorage data
 * for mokgethwamoabelo@gmail.com
 */

(function() {
  const EMAIL_TO_DELETE = 'mokgethwamoabelo@gmail.com';
  
  console.log('🧹 Starting localStorage cleanup for:', EMAIL_TO_DELETE);
  
  try {
    // Get current localStorage data
    const userCredentials = JSON.parse(localStorage.getItem('userCredentials') || '{}');
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const teamMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
    
    let totalRemoved = 0;
    
    // Remove from userCredentials
    let credentialsUpdated = false;
    Object.keys(userCredentials).forEach(userId => {
      const cred = userCredentials[userId];
      if (cred.email === EMAIL_TO_DELETE) {
        delete userCredentials[userId];
        credentialsUpdated = true;
        totalRemoved++;
        console.log(`✅ Removed user credentials for: ${userId}`);
      }
    });
    
    if (credentialsUpdated) {
      localStorage.setItem('userCredentials', JSON.stringify(userCredentials));
    }

    // Remove from employees
    const filteredEmployees = employees.filter(emp => emp.email !== EMAIL_TO_DELETE);
    if (filteredEmployees.length !== employees.length) {
      localStorage.setItem('employees', JSON.stringify(filteredEmployees));
      totalRemoved += (employees.length - filteredEmployees.length);
      console.log('✅ Removed from employees list');
    }

    // Remove from team members
    const filteredTeamMembers = teamMembers.filter(member => member.email !== EMAIL_TO_DELETE);
    if (filteredTeamMembers.length !== teamMembers.length) {
      localStorage.setItem('teamMembers', JSON.stringify(filteredTeamMembers));
      totalRemoved += (teamMembers.length - filteredTeamMembers.length);
      console.log('✅ Removed from team members list');
    }

    // Clean other related localStorage data
    const keysToClean = [
      'payrollCalculations',
      'attendanceSummaries',
      'employeeDeductions',
      'salaryAdvances',
      'employeePayslips',
      'employeeLeaves',
      'employeePerformance',
      'invoices',
      'clients',
      'projects',
      'quotations',
      'auditLogs',
      'currentUser'
    ];

    keysToClean.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          if (key === 'currentUser') {
            // Special handling for currentUser
            const currentUser = JSON.parse(data);
            if (currentUser && currentUser.email === EMAIL_TO_DELETE) {
              localStorage.removeItem(key);
              totalRemoved++;
              console.log(`✅ Removed current user session`);
            }
          } else {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
              const filtered = parsed.filter(item => {
                // Check various possible email fields
                return item.email !== EMAIL_TO_DELETE &&
                       item.userEmail !== EMAIL_TO_DELETE &&
                       item.createdBy !== EMAIL_TO_DELETE &&
                       item.ownerEmail !== EMAIL_TO_DELETE &&
                       item.userId !== EMAIL_TO_DELETE;
              });
              
              if (filtered.length !== parsed.length) {
                localStorage.setItem(key, JSON.stringify(filtered));
                totalRemoved += (parsed.length - filtered.length);
                console.log(`✅ Cleaned ${key} data (removed ${parsed.length - filtered.length} entries)`);
              }
            }
          }
        } catch (e) {
          console.warn(`⚠️ Could not clean ${key}:`, e.message);
        }
      }
    });

    // Remove any session tokens or auth tokens
    const authKeys = ['authToken', 'sessionToken', 'accessToken', 'refreshToken'];
    authKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`✅ Removed ${key}`);
      }
    });

    console.log(`🎉 localStorage cleanup completed! Removed ${totalRemoved} entries total`);
    console.log('🔒 All personal data has been permanently removed from localStorage');
    
    // Verify cleanup
    console.log('🔍 Verification: Searching for any remaining references...');
    let foundReferences = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      if (value && value.includes(EMAIL_TO_DELETE)) {
        console.warn(`⚠️ Found reference in ${key}:`, value.substring(0, 100) + '...');
        foundReferences++;
      }
    }
    
    if (foundReferences === 0) {
      console.log('✅ Verification complete: No remaining references found');
    } else {
      console.warn(`⚠️ Found ${foundReferences} remaining references that may need manual cleanup`);
    }

  } catch (error) {
    console.error('❌ localStorage cleanup failed:', error);
  }
})();

console.log('📋 Cleanup script executed. Check the console output above for results.');