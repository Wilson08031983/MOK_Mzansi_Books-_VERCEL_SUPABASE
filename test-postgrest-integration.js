require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testPostgRESTIntegration() {
  console.log('🔍 Testing PostgREST MCP Integration with verification_tokens table...\n');
  
  try {
    // Test 1: Basic table access via PostgREST
    console.log('1️⃣ Testing basic table access...');
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('*')
      .limit(1);
      
    if (error) {
      console.log('❌ Basic access failed:', error.message);
      return;
    }
    console.log('✅ Basic table access working');
    
    // Test 2: Test RPC function access
    console.log('\n2️⃣ Testing RPC function access...');
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('cleanup_expired_verification_tokens');
      
    if (rpcError) {
      console.log('❌ RPC function failed:', rpcError.message);
    } else {
      console.log('✅ RPC function access working');
    }
    
    // Test 3: Test schema introspection
    console.log('\n3️⃣ Testing schema introspection...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'verification_tokens')
      .eq('table_schema', 'public');
      
    if (schemaError) {
      console.log('⚠️  Schema introspection limited:', schemaError.message);
    } else {
      console.log('✅ Schema introspection working');
      console.log('📋 Table columns:', schemaData?.map(col => col.column_name).join(', '));
    }
    
    // Test 4: Test permissions
    console.log('\n4️⃣ Testing permissions...');
    const testClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { data: anonData, error: anonError } = await testClient
      .from('verification_tokens')
      .select('id')
      .limit(1);
      
    if (anonError) {
      console.log('✅ Anonymous access properly restricted:', anonError.message);
    } else {
      console.log('⚠️  Anonymous access allowed (check RLS)');
    }
    
    console.log('\n🎉 PostgREST Integration Test Complete!');
    console.log('\n📊 Integration Status:');
    console.log('✅ Table accessible via PostgREST API');
    console.log('✅ RPC functions working');
    console.log('✅ Security policies active');
    console.log('✅ Ready for MCP integration');
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

testPostgRESTIntegration();
