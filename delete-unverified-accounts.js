/**
 * Account Deletion Script
 * 
 * This script permanently deletes unverified accounts and all associated data
 * from local storage to allow re-registration with the same email addresses.
 * 
 * Target emails:
 * 1. mokgethwamoabelo@gmail.com
 * 2. mokgethwamoabelo@icloud.com
 */

// Target emails to delete
const TARGET_EMAILS = [
  'mokgethwamoabelo@gmail.com',
  'mokgethwamoabelo@icloud.com'
].map(email => email.toLowerCase());

// Storage keys to check for user data
const STORAGE_KEYS = [
  'userCredentials',
  'companyDetails',
  'mokMzansiBooks_company',
  'invitedUsers',
  'teamMembers',
  'employees',
  'clients',
  'invoices',
  'quotations',
  'projects',
  'inventory',
  'notifications',
  'auditLogs',
  'sessions',
  'verificationTokens',
  'passwordResets',
  'emailLogs',
  'subscriptions',
  'paymentHistory'
];

// Create backup of all relevant data
function createBackup() {
  console.log('📦 Creating backup of local storage data...');
  
  const backup = {};
  STORAGE_KEYS.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        backup[key] = data;
      }
    } catch (error) {
      console.error(`Error backing up ${key}:`, error);
    }
  });
  
  // Save backup to localStorage with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  localStorage.setItem(`backup_pre_delete_${timestamp}`, JSON.stringify(backup));
  
  console.log(`✅ Backup created with key: backup_pre_delete_${timestamp}`);
  return timestamp;
}

// Find user records and associated data
function discoverUserData() {
  console.log('🔍 Discovering user data for target emails...');
  
  const discovery = {};
  
  // Check userCredentials
  try {
    const credentials = JSON.parse(localStorage.getItem('userCredentials') || '{}');
    
    TARGET_EMAILS.forEach(email => {
      discovery[email] = { userId: null, companyId: null, verified: null, dependentData: {} };
      
      // Find user by email
      Object.entries(credentials).forEach(([userId, userData]) => {
        if (userData.email && userData.email.toLowerCase() === email) {
          discovery[email].userId = userId;
          discovery[email].verified = userData.emailVerified || false;
          discovery[email].companyId = userData.companyId;
          
          console.log(`Found user record for ${email}:`, {
            userId,
            verified: userData.emailVerified || false,
            companyId: userData.companyId
          });
        }
      });
    });
    
    // Check other storage for related data
    STORAGE_KEYS.forEach(key => {
      if (key === 'userCredentials') return; // Already processed
      
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        
        TARGET_EMAILS.forEach(email => {
          const userId = discovery[email].userId;
          const companyId = discovery[email].companyId;
          
          if (!userId && !companyId) return;
          
          // Count references to this user or company
          let count = 0;
          let ids = [];
          
          // Different handling based on data structure
          if (Array.isArray(data)) {
            // Handle array data
            data.forEach((item, index) => {
              if (
                (userId && item.userId === userId) ||
                (companyId && item.companyId === companyId) ||
                (item.email && item.email.toLowerCase() === email)
              ) {
                count++;
                ids.push(index);
              }
            });
          } else {
            // Handle object data
            Object.entries(data).forEach(([id, item]) => {
              if (
                (userId && item.userId === userId) ||
                (companyId && item.companyId === companyId) ||
                (item.email && item.email.toLowerCase() === email)
              ) {
                count++;
                ids.push(id);
              }
            });
          }
          
          if (count > 0) {
            discovery[email].dependentData[key] = { count, ids };
            console.log(`Found ${count} references in ${key} for ${email}`);
          }
        });
      } catch (error) {
        console.error(`Error checking ${key}:`, error);
      }
    });
  } catch (error) {
    console.error('Error discovering user data:', error);
  }
  
  return discovery;
}

// Delete user and all associated data
function deleteUserData(discovery) {
  console.log('🗑️ Deleting user data...');
  
  const deletionLog = {};
  
  TARGET_EMAILS.forEach(email => {
    console.log(`\n🔄 Processing deletion for ${email}...`);
    deletionLog[email] = { deletedData: {} };
    
    const userData = discovery[email];
    if (!userData.userId) {
      console.log(`⚠️ No user record found for ${email}`);
      deletionLog[email].status = 'no_user_found';
      return;
    }
    
    // 1. Delete sessions, tokens, invitations first
    const tokensToDelete = ['sessions', 'verificationTokens', 'passwordResets', 'invitedUsers'];
    tokensToDelete.forEach(key => {
      if (userData.dependentData[key]) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          const deletedIds = [];
          
          if (Array.isArray(data)) {
            // Filter out items related to this user
            const newData = data.filter((item, index) => {
              const shouldDelete = 
                (userData.userId && item.userId === userData.userId) ||
                (item.email && item.email.toLowerCase() === email);
              
              if (shouldDelete) deletedIds.push(index);
              return !shouldDelete;
            });
            
            localStorage.setItem(key, JSON.stringify(newData));
          } else {
            // Remove entries related to this user
            userData.dependentData[key].ids.forEach(id => {
              delete data[id];
              deletedIds.push(id);
            });
            
            localStorage.setItem(key, JSON.stringify(data));
          }
          
          deletionLog[email].deletedData[key] = deletedIds;
          console.log(`✅ Deleted ${deletedIds.length} items from ${key}`);
        } catch (error) {
          console.error(`Error deleting from ${key}:`, error);
        }
      }
    });
    
    // 2. Delete notifications, logs, etc.
    const logsToDelete = ['notifications', 'auditLogs', 'emailLogs'];
    logsToDelete.forEach(key => {
      if (userData.dependentData[key]) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          const deletedIds = [];
          
          if (Array.isArray(data)) {
            // Filter out items related to this user
            const newData = data.filter((item, index) => {
              const shouldDelete = 
                (userData.userId && item.userId === userData.userId) ||
                (userData.companyId && item.companyId === userData.companyId);
              
              if (shouldDelete) deletedIds.push(index);
              return !shouldDelete;
            });
            
            localStorage.setItem(key, JSON.stringify(newData));
          } else {
            // Remove entries related to this user
            userData.dependentData[key].ids.forEach(id => {
              delete data[id];
              deletedIds.push(id);
            });
            
            localStorage.setItem(key, JSON.stringify(data));
          }
          
          deletionLog[email].deletedData[key] = deletedIds;
          console.log(`✅ Deleted ${deletedIds.length} items from ${key}`);
        } catch (error) {
          console.error(`Error deleting from ${key}:`, error);
        }
      }
    });
    
    // 3. Delete company data if it belongs solely to this user
    if (userData.companyId) {
      // Check if company has other users
      let hasOtherUsers = false;
      try {
        const credentials = JSON.parse(localStorage.getItem('userCredentials') || '{}');
        
        Object.values(credentials).forEach(user => {
          if (user.companyId === userData.companyId && 
              user.email && 
              !TARGET_EMAILS.includes(user.email.toLowerCase())) {
            hasOtherUsers = true;
          }
        });
        
        if (hasOtherUsers) {
          console.log(`⚠️ Company ${userData.companyId} has other users - not deleting company data`);
        } else {
          console.log(`🏢 Company ${userData.companyId} belongs only to this user - deleting company data`);
          
          // Delete company-related data
          const companyData = ['companyDetails', 'mokMzansiBooks_company', 'clients', 'invoices', 'quotations', 'projects', 'inventory', 'employees'];
          companyData.forEach(key => {
            if (userData.dependentData[key]) {
              try {
                const data = JSON.parse(localStorage.getItem(key) || '{}');
                const deletedIds = [];
                
                if (Array.isArray(data)) {
                  // Filter out items related to this company
                  const newData = data.filter((item, index) => {
                    const shouldDelete = item.companyId === userData.companyId;
                    if (shouldDelete) deletedIds.push(index);
                    return !shouldDelete;
                  });
                  
                  localStorage.setItem(key, JSON.stringify(newData));
                } else if (key === 'companyDetails' || key === 'mokMzansiBooks_company') {
                  // Special handling for company details
                  if (data.id === userData.companyId || 
                      (data.email && data.email.toLowerCase() === email)) {
                    localStorage.removeItem(key);
                    deletedIds.push('company_record');
                  }
                } else {
                  // Remove entries related to this company
                  userData.dependentData[key].ids.forEach(id => {
                    delete data[id];
                    deletedIds.push(id);
                  });
                  
                  localStorage.setItem(key, JSON.stringify(data));
                }
                
                deletionLog[email].deletedData[key] = deletedIds;
                console.log(`✅ Deleted ${deletedIds.length} items from ${key}`);
              } catch (error) {
                console.error(`Error deleting from ${key}:`, error);
              }
            }
          });
        }
      } catch (error) {
        console.error('Error checking company users:', error);
      }
    }
    
    // 4. Finally delete the user record
    try {
      const credentials = JSON.parse(localStorage.getItem('userCredentials') || '{}');
      
      if (credentials[userData.userId]) {
        delete credentials[userData.userId];
        localStorage.setItem('userCredentials', JSON.stringify(credentials));
        
        deletionLog[email].deletedData.userCredentials = [userData.userId];
        console.log(`✅ Deleted user record for ${email}`);
      }
      
      deletionLog[email].status = 'deleted';
    } catch (error) {
      console.error('Error deleting user record:', error);
      deletionLog[email].status = 'error';
      deletionLog[email].error = error.message;
    }
  });
  
  return deletionLog;
}

// Verify deletion was successful
function verifyDeletion() {
  console.log('\n🔍 Verifying deletion...');
  
  const verification = {};
  
  TARGET_EMAILS.forEach(email => {
    verification[email] = { userExists: false, references: {} };
    
    // Check if user still exists
    try {
      const credentials = JSON.parse(localStorage.getItem('userCredentials') || '{}');
      
      Object.values(credentials).forEach(user => {
        if (user.email && user.email.toLowerCase() === email) {
          verification[email].userExists = true;
        }
      });
      
      if (verification[email].userExists) {
        console.log(`❌ User record for ${email} still exists!`);
      } else {
        console.log(`✅ User record for ${email} successfully deleted`);
      }
    } catch (error) {
      console.error('Error verifying user deletion:', error);
    }
    
    // Check for any remaining references
    STORAGE_KEYS.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        let references = 0;
        
        if (Array.isArray(data)) {
          data.forEach(item => {
            if (item.email && item.email.toLowerCase() === email) {
              references++;
            }
          });
        } else {
          Object.values(data).forEach(item => {
            if (item.email && item.email.toLowerCase() === email) {
              references++;
            }
          });
        }
        
        if (references > 0) {
          verification[email].references[key] = references;
          console.log(`❌ Found ${references} references to ${email} in ${key}`);
        }
      } catch (error) {
        // Ignore empty or invalid storage
      }
    });
    
    // Final verdict
    if (!verification[email].userExists && Object.keys(verification[email].references).length === 0) {
      verification[email].status = 'success';
      console.log(`✅ ${email} successfully deleted from all storage`);
    } else {
      verification[email].status = 'incomplete';
      console.log(`❌ Deletion of ${email} is incomplete`);
    }
  });
  
  return verification;
}

// Main execution function
function executeAccountDeletion() {
  console.log('🚀 Starting account deletion process...');
  
  // Step 1: Create backup
  const backupTimestamp = createBackup();
  
  // Step 2: Discover user data
  const discovery = discoverUserData();
  
  // Step 3: Delete user data
  const deletionLog = deleteUserData(discovery);
  
  // Step 4: Verify deletion
  const verification = verifyDeletion();
  
  // Create final report
  const report = {
    timestamp: new Date().toISOString(),
    backupKey: `backup_pre_delete_${backupTimestamp}`,
    targetEmails: TARGET_EMAILS,
    discovery,
    deletionLog,
    verification
  };
  
  // Save report to localStorage
  localStorage.setItem('deletion_report', JSON.stringify(report));
  
  console.log('\n📊 Deletion Report:');
  console.log(report);
  
  return report;
}

// Execute the deletion process
const deletionReport = executeAccountDeletion();

// Display final message
console.log('\n✨ Account deletion process completed!');
TARGET_EMAILS.forEach(email => {
  const status = deletionReport.verification[email].status;
  if (status === 'success') {
    console.log(`✅ ${email} was successfully deleted and can now be re-registered.`);
  } else {
    console.log(`❌ Deletion of ${email} was incomplete. Please check the deletion report.`);
  }
});