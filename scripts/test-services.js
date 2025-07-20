#!/usr/bin/env node

/**
 * Service Test Runner
 * 
 * This script runs the service tests to verify that all local services
 * are initializing and functioning correctly.
 */

// Import required modules
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

console.log('🧪 MOK Mzansi Books - Local Service Test Runner');
console.log('==============================================');

// Check if the project is using npm or yarn
let packageManager = 'npm';
if (fs.existsSync(path.join(process.cwd(), 'yarn.lock'))) {
  packageManager = 'yarn';
}

// Create a temporary test file
const tempFile = path.join(process.cwd(), 'temp-service-test.js');
const testCode = `
import { runServiceTest } from './src/utils/serviceTest';

// Run the service test
runServiceTest().then(() => {
  console.log('Test completed, exiting...');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
`;

try {
  // Write the temporary test file
  fs.writeFileSync(tempFile, testCode, 'utf8');
  console.log('✅ Created temporary test file');

  // Run the test using the appropriate package manager
  console.log(`🚀 Running service tests using ${packageManager}...`);
  console.log('==============================================');
  
  const command = packageManager === 'npm' 
    ? 'npx vite-node temp-service-test.js'
    : 'yarn vite-node temp-service-test.js';
  
  execSync(command, { stdio: 'inherit' });
  
  console.log('==============================================');
  console.log('✅ Service tests completed');
} catch (error) {
  console.error('❌ Error running service tests:', error.message);
  process.exit(1);
} finally {
  // Clean up the temporary file
  if (fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
    console.log('🧹 Cleaned up temporary test file');
  }
}
