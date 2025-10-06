const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function executeSQLFile() {
  console.log('🔧 Executing verification-tokens-table.sql...');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('verification-tokens-table.sql', 'utf8');
    
    // Split into individual statements (basic approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== '');
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      
      console.log(`Executing statement ${i + 1}...`);
      
      try {
        // Use the REST API directly for DDL operations
        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
          },
          body: JSON.stringify({ sql: statement + ';' })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log(`Statement ${i + 1} result:`, response.status, errorText);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (error) {
        console.log(`Statement ${i + 1} error:`, error.message);
      }
    }
    
    // Test if table was created
    console.log('\n🧪 Testing table access...');
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Table test failed:', error);
      return false;
    }
    
    console.log('✅ verification_tokens table is accessible!');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

executeSQLFile().then(success => {
  console.log(success ? '\n🎉 SQL execution completed!' : '\n❌ SQL execution failed');
  process.exit(success ? 0 : 1);
});
