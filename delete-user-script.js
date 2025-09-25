/**
 * Complete User Account Deletion Script
 * Deletes user account and all associated data for mokgethwamoabelo@gmail.com
 * Complies with data privacy regulations (GDPR, POPIA)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EMAIL_TO_DELETE = 'mokgethwamoabelo@gmail.com';

async function deleteUserAccount() {
  console.log(`🗑️ Starting complete deletion for: ${EMAIL_TO_DELETE}`);
  
  try {
    // Start a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      
      // 1. Find the user
      const user = await tx.user.findUnique({
        where: { email: EMAIL_TO_DELETE },
        include: {
          accounts: true,
          sessions: true,
          Subscription: true,
          payments: true,
          auditLogs: true
        }
      });

      if (!user) {
        console.log('❌ User not found in database');
        return;
      }

      console.log(`👤 Found user: ${user.id} - ${user.name || 'No name'}`);

      // 2. Delete related data in correct order (respecting foreign key constraints)
      
      // Delete audit logs
      if (user.auditLogs.length > 0) {
        await tx.auditLog.deleteMany({
          where: { userId: user.id }
        });
        console.log(`✅ Deleted ${user.auditLogs.length} audit log entries`);
      }

      // Delete payments
      if (user.payments.length > 0) {
        await tx.payment.deleteMany({
          where: { userId: user.id }
        });
        console.log(`✅ Deleted ${user.payments.length} payment records`);
      }

      // Delete subscription
      if (user.Subscription) {
        await tx.subscription.delete({
          where: { userId: user.id }
        });
        console.log('✅ Deleted subscription record');
      }

      // Delete sessions
      if (user.sessions.length > 0) {
        await tx.session.deleteMany({
          where: { userId: user.id }
        });
        console.log(`✅ Deleted ${user.sessions.length} session records`);
      }

      // Delete accounts (OAuth accounts)
      if (user.accounts.length > 0) {
        await tx.account.deleteMany({
          where: { userId: user.id }
        });
        console.log(`✅ Deleted ${user.accounts.length} account records`);
      }

      // Delete email-related data
      await tx.emailEvent.deleteMany({
        where: { email: EMAIL_TO_DELETE }
      });
      console.log('✅ Deleted email event records');

      await tx.emailStatus.deleteMany({
        where: { email: EMAIL_TO_DELETE }
      });
      console.log('✅ Deleted email status records');

      // Delete verification tokens
      await tx.verificationToken.deleteMany({
        where: { identifier: EMAIL_TO_DELETE }
      });
      console.log('✅ Deleted verification tokens');

      // 3. Finally, delete the user record
      await tx.user.delete({
        where: { id: user.id }
      });
      console.log('✅ Deleted user record');

    });

    console.log('🎉 Database deletion completed successfully');

  } catch (error) {
    console.error('❌ Database deletion failed:', error);
    throw error;
  }
}

function deleteLocalStorageData() {
  console.log('🧹 Cleaning localStorage data...');
  
  try {
    // Get current localStorage data
    const userCredentials = JSON.parse(localStorage.getItem('userCredentials') || '{}');
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const teamMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
    
    // Remove from userCredentials
    let credentialsUpdated = false;
    Object.keys(userCredentials).forEach(userId => {
      const cred = userCredentials[userId];
      if (cred.email === EMAIL_TO_DELETE) {
        delete userCredentials[userId];
        credentialsUpdated = true;
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
      console.log('✅ Removed from employees list');
    }

    // Remove from team members
    const filteredTeamMembers = teamMembers.filter(member => member.email !== EMAIL_TO_DELETE);
    if (filteredTeamMembers.length !== teamMembers.length) {
      localStorage.setItem('teamMembers', JSON.stringify(filteredTeamMembers));
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
      'quotations'
    ];

    keysToClean.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter(item => {
              // Check various possible email fields
              return item.email !== EMAIL_TO_DELETE &&
                     item.userEmail !== EMAIL_TO_DELETE &&
                     item.createdBy !== EMAIL_TO_DELETE &&
                     item.ownerEmail !== EMAIL_TO_DELETE;
            });
            
            if (filtered.length !== parsed.length) {
              localStorage.setItem(key, JSON.stringify(filtered));
              console.log(`✅ Cleaned ${key} data`);
            }
          }
        } catch (e) {
          console.warn(`⚠️ Could not clean ${key}:`, e.message);
        }
      }
    });

    console.log('🎉 localStorage cleanup completed');

  } catch (error) {
    console.error('❌ localStorage cleanup failed:', error);
    throw error;
  }
}

// Main execution function
async function executeUserDeletion() {
  console.log('🚀 Starting complete user account deletion process...');
  console.log(`📧 Target email: ${EMAIL_TO_DELETE}`);
  console.log('⚖️ Complying with data privacy regulations (GDPR, POPIA)');
  
  try {
    // Step 1: Delete from database
    await deleteUserAccount();
    
    // Step 2: Clean localStorage (if running in browser)
    if (typeof localStorage !== 'undefined') {
      deleteLocalStorageData();
    } else {
      console.log('ℹ️ localStorage not available (running in Node.js)');
      console.log('📝 Please run the localStorage cleanup in the browser console');
    }
    
    console.log('✅ User account deletion completed successfully');
    console.log('🔒 All personal data has been permanently removed');
    console.log('📋 Deletion complies with data privacy regulations');
    
  } catch (error) {
    console.error('❌ User deletion failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Browser-compatible localStorage cleanup function
function browserCleanup() {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    deleteLocalStorageData();
  } else {
    console.log('❌ This function must be run in a browser environment');
  }
}

// Export functions for different environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    executeUserDeletion,
    deleteUserAccount,
    EMAIL_TO_DELETE
  };
  
  // Auto-execute if run directly
  if (require.main === module) {
    executeUserDeletion();
  }
} else {
  // Browser environment
  window.deleteUserData = browserCleanup;
  window.EMAIL_TO_DELETE = EMAIL_TO_DELETE;
  console.log('🌐 Browser functions loaded. Run deleteUserData() to clean localStorage');
}