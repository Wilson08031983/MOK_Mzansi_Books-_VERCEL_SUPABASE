const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '../.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, 'backups');
  
  console.log('🔄 Creating database backup...');
  
  try {
    // Backup all relevant tables - using correct table names from schema
    const tables = ['User', 'Account', 'Session', 'Subscription', 'Payment', 'EmailEvent', 'EmailStatus', 'profiles', 'companies', 'invitations'];
    const backup = {};
    
    for (const table of tables) {
      console.log(`📊 Backing up ${table}...`);
      const { data, error } = await supabase
        .from(table)
        .select('*');
      
      if (error) {
        console.error(`❌ Error backing up ${table}:`, error);
        continue;
      }
      
      backup[table] = data;
      console.log(`✅ Backed up ${data?.length || 0} records from ${table}`);
    }
    
    // Save backup to file
    const backupFile = path.join(backupDir, `supabase-backup-${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    console.log(`✅ Backup completed: ${backupFile}`);
    
    // Log the backup creation
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: 'backup_created',
      file: backupFile,
      tables_backed_up: Object.keys(backup),
      total_records: Object.values(backup).reduce((sum, records) => sum + (records?.length || 0), 0)
    };
    
    // Append to logs
    const logsFile = path.join(__dirname, 'logs.json');
    const logs = JSON.parse(fs.readFileSync(logsFile, 'utf8'));
    logs.push(logEntry);
    fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2));
    
    return backupFile;
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

// Run backup if called directly
if (require.main === module) {
  createBackup()
    .then(file => {
      console.log(`🎉 Backup successful: ${file}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Backup failed:', error);
      process.exit(1);
    });
}

module.exports = { createBackup };