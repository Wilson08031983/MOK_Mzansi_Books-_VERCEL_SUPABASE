/**
 * Complete Unverified Account Deletion Script
 * 
 * This script permanently deletes unverified accounts and all associated data
 * for the specified email addresses from the database.
 * 
 * Target emails:
 * - mokgethwamoabelo@gmail.com
 * - mokgethwamoabelo@icloud.com
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Initialize Prisma client
const prisma = new PrismaClient();

// Target emails to delete
const TARGET_EMAILS = [
  'mokgethwamoabelo@gmail.com',
  'mokgethwamoabelo@icloud.com'
];

// Backup directory
const BACKUP_DIR = path.join(__dirname, '../backups');

/**
 * Create backup of user data before deletion
 */
async function createBackup() {
  console.log('📦 Creating backup of user data...');
  
  try {
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `user-backup-${timestamp}.json`);
    
    // Find users and all related data
    const backupData = {};
    
    for (const email of TARGET_EMAILS) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          accounts: true,
          sessions: true,
          Subscription: true,
          payments: true,
          auditLogs: true
        }
      });
      
      if (user) {
        backupData[email] = user;
        console.log(`✅ Found user data for ${email}`);
      } else {
        console.log(`⚠️ No user found for ${email}`);
      }
      
      // Check for verification tokens
      const verificationTokens = await prisma.verificationToken.findMany({
        where: { identifier: email }
      });
      
      if (verificationTokens.length > 0) {
        if (!backupData[email]) backupData[email] = {};
        backupData[email].verificationTokens = verificationTokens;
        console.log(`✅ Found ${verificationTokens.length} verification tokens for ${email}`);
      }
    }
    
    // Write backup to file
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`✅ Backup created: ${backupFile}`);
    
    return backupFile;
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    throw error;
  }
}

/**
 * Find all data associated with target emails
 */
async function findUserData() {
  console.log('\n🔍 Finding user data for target emails...');
  
  const results = {};
  
  for (const email of TARGET_EMAILS) {
    console.log(`\n📧 Checking email: ${email}`);
    results[email] = { user: null, accounts: [], sessions: [], verificationTokens: [] };
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        sessions: true,
        Subscription: true,
        payments: true,
        auditLogs: true
      }
    });
    
    if (user) {
      results[email].user = user;
      results[email].accounts = user.accounts;
      results[email].sessions = user.sessions;
      results[email].subscription = user.Subscription;
      results[email].payments = user.payments;
      results[email].auditLogs = user.auditLogs;
      
      console.log(`✅ Found user: ${user.id}`);
      console.log(`  - Name: ${user.name || 'Not set'}`);
      console.log(`  - Email verified: ${user.emailVerified ? 'Yes' : 'No'}`);
      console.log(`  - Created at: ${user.createdAt}`);
      console.log(`  - Accounts: ${user.accounts.length}`);
      console.log(`  - Sessions: ${user.sessions.length}`);
      console.log(`  - Subscription: ${user.Subscription ? 'Yes' : 'No'}`);
      console.log(`  - Payments: ${user.payments.length}`);
      console.log(`  - Audit logs: ${user.auditLogs.length}`);
    } else {
      console.log(`⚠️ No user found with email: ${email}`);
    }
    
    // Find verification tokens
    const verificationTokens = await prisma.verificationToken.findMany({
      where: { identifier: email }
    });
    
    if (verificationTokens.length > 0) {
      results[email].verificationTokens = verificationTokens;
      console.log(`✅ Found ${verificationTokens.length} verification tokens`);
    } else {
      console.log(`ℹ️ No verification tokens found`);
    }
    
    // Check for email status
    const emailStatus = await prisma.emailStatus.findUnique({
      where: { email }
    });
    
    if (emailStatus) {
      results[email].emailStatus = emailStatus;
      console.log(`✅ Found email status record`);
    }
    
    // Check for email events
    const emailEvents = await prisma.emailEvent.findMany({
      where: { email }
    });
    
    if (emailEvents.length > 0) {
      results[email].emailEvents = emailEvents;
      console.log(`✅ Found ${emailEvents.length} email events`);
    }
  }
  
  return results;
}

/**
 * Delete all data associated with target emails
 */
async function deleteUserData(userData) {
  console.log('\n🗑️ Deleting user data...');
  
  for (const email of TARGET_EMAILS) {
    console.log(`\n📧 Processing email: ${email}`);
    const data = userData[email];
    
    if (!data.user && data.verificationTokens.length === 0) {
      console.log(`ℹ️ No data to delete for ${email}`);
      continue;
    }
    
    try {
      // Use a transaction to ensure all related data is deleted or nothing is
      await prisma.$transaction(async (tx) => {
        // Delete verification tokens
        if (data.verificationTokens.length > 0) {
          await tx.verificationToken.deleteMany({
            where: { identifier: email }
          });
          console.log(`✅ Deleted ${data.verificationTokens.length} verification tokens`);
        }
        
        // Delete email events
        if (data.emailEvents && data.emailEvents.length > 0) {
          await tx.emailEvent.deleteMany({
            where: { email }
          });
          console.log(`✅ Deleted ${data.emailEvents.length} email events`);
        }
        
        // Delete email status
        if (data.emailStatus) {
          await tx.emailStatus.delete({
            where: { email }
          });
          console.log(`✅ Deleted email status record`);
        }
        
        // If user exists, delete all related data
        if (data.user) {
          const userId = data.user.id;
          
          // Delete audit logs
          if (data.auditLogs && data.auditLogs.length > 0) {
            await tx.auditLog.deleteMany({
              where: { userId }
            });
            console.log(`✅ Deleted ${data.auditLogs.length} audit logs`);
          }
          
          // Delete payments
          if (data.payments && data.payments.length > 0) {
            await tx.payment.deleteMany({
              where: { userId }
            });
            console.log(`✅ Deleted ${data.payments.length} payment records`);
          }
          
          // Delete subscription
          if (data.subscription) {
            await tx.subscription.delete({
              where: { userId }
            });
            console.log(`✅ Deleted subscription record`);
          }
          
          // Delete sessions (should cascade, but we'll be explicit)
          if (data.sessions && data.sessions.length > 0) {
            await tx.session.deleteMany({
              where: { userId }
            });
            console.log(`✅ Deleted ${data.sessions.length} sessions`);
          }
          
          // Delete accounts (should cascade, but we'll be explicit)
          if (data.accounts && data.accounts.length > 0) {
            await tx.account.deleteMany({
              where: { userId }
            });
            console.log(`✅ Deleted ${data.accounts.length} accounts`);
          }
          
          // Finally, delete the user
          await tx.user.delete({
            where: { id: userId }
          });
          console.log(`✅ Deleted user: ${userId}`);
        }
      });
      
      console.log(`✅ Successfully deleted all data for ${email}`);
    } catch (error) {
      console.error(`❌ Error deleting data for ${email}:`, error);
      throw error;
    }
  }
}

/**
 * Verify deletion was successful
 */
async function verifyDeletion() {
  console.log('\n✅ Verifying deletion...');
  
  for (const email of TARGET_EMAILS) {
    console.log(`\n📧 Verifying ${email}:`);
    
    // Check user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (user) {
      console.log(`❌ User still exists: ${user.id}`);
    } else {
      console.log(`✅ User successfully deleted`);
    }
    
    // Check verification tokens
    const verificationTokens = await prisma.verificationToken.findMany({
      where: { identifier: email }
    });
    
    if (verificationTokens.length > 0) {
      console.log(`❌ ${verificationTokens.length} verification tokens still exist`);
    } else {
      console.log(`✅ All verification tokens deleted`);
    }
    
    // Check email status
    const emailStatus = await prisma.emailStatus.findUnique({
      where: { email }
    });
    
    if (emailStatus) {
      console.log(`❌ Email status record still exists`);
    } else {
      console.log(`✅ Email status record deleted`);
    }
    
    // Check email events
    const emailEvents = await prisma.emailEvent.findMany({
      where: { email },
      take: 1
    });
    
    if (emailEvents.length > 0) {
      console.log(`❌ Email events still exist`);
    } else {
      console.log(`✅ All email events deleted`);
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting account deletion process...');
  console.log(`📧 Target emails: ${TARGET_EMAILS.join(', ')}`);
  
  try {
    // Step 1: Create backup
    const backupFile = await createBackup();
    
    // Step 2: Find user data
    const userData = await findUserData();
    
    // Step 3: Delete user data
    await deleteUserData(userData);
    
    // Step 4: Verify deletion
    await verifyDeletion();
    
    console.log('\n✅ Account deletion process completed successfully!');
    console.log(`📦 Backup saved to: ${backupFile}`);
    console.log('🔄 You can now re-register with these email addresses.');
  } catch (error) {
    console.error('\n❌ Error during account deletion process:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();