#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

async function createVerificationTokensTable() {
  console.log('🚀 Starting PostgREST MCP client to create verification_tokens table...');
  
  try {
    // Spawn the MCP server process
    const serverProcess = spawn('npx', [
      '-y',
      '@supabase/mcp-server-postgrest@latest',
      '--apiUrl',
      'https://ulduqjddmhnwvdeeldsb.supabase.co/rest/v1',
      '--schema',
      'public',
      '--apiKey',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZHVxamRkbWhud3ZkZWVsZHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTg1NzEsImV4cCI6MjA3MjU3NDU3MX0.CRjFvK8kNrLD7m1n2qJsXwK0TnYuzYxxHl_YxIK1M6c'
    ], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Create transport using the spawned process
    const transport = new StdioClientTransport({
      reader: serverProcess.stdout,
      writer: serverProcess.stdin
    });

    // Create MCP client
    const client = new Client(
      {
        name: 'verification-tokens-creator',
        version: '1.0.0'
      },
      {
        capabilities: {}
      }
    );

    // Connect to the server
    await client.connect(transport);
    console.log('✅ Connected to PostgREST MCP server');

    // List available tools
    const tools = await client.listTools();
    console.log('📋 Available tools:', tools.tools.map(t => t.name));

    // Try to check if verification_tokens table exists
    console.log('🔍 Checking if verification_tokens table exists...');
    
    try {
      const checkResult = await client.callTool({
        name: 'postgrestRequest',
        arguments: {
          method: 'GET',
          path: '/verification_tokens?limit=1'
        }
      });
      
      console.log('✅ verification_tokens table already exists!');
      console.log('Table check result:', checkResult.content);
      
    } catch (error) {
      console.log('❌ verification_tokens table does not exist or is not accessible');
      console.log('Error:', error.message);
      
      // Try to create the table using SQL conversion
      console.log('🛠️ Attempting to create verification_tokens table...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS verification_tokens (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          used_at TIMESTAMP WITH TIME ZONE NULL
        );
        
        CREATE INDEX IF NOT EXISTS idx_verification_tokens_email ON verification_tokens(email);
        CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
        CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at ON verification_tokens(expires_at);
      `;
      
      try {
        const sqlToRestResult = await client.callTool({
          name: 'sqlToRest',
          arguments: {
            sql: createTableSQL
          }
        });
        
        console.log('📝 SQL to REST conversion result:', sqlToRestResult.content);
        
      } catch (sqlError) {
        console.log('❌ SQL to REST conversion failed:', sqlError.message);
        console.log('💡 Note: PostgREST MCP cannot create tables directly. You need to create the table manually in Supabase Dashboard.');
      }
    }

    // Clean up
    await client.close();
    serverProcess.kill();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 PostgREST MCP is primarily for querying existing tables, not creating them.');
    console.log('   You still need to create the verification_tokens table manually in Supabase Dashboard.');
  }
}

// Run the script
createVerificationTokensTable().catch(console.error);