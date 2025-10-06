require('dotenv').config({ path: '.env.local' });
const { createVerificationTokenWithRaw, hashToken } = require('./src/services/tokenService');

// Test token generation
console.log('Testing token generation...');

const userId = 'b73eb6db-0c23-40c8-a9e3-ea6a17e87f24';
const tokenData = createVerificationTokenWithRaw(userId, 'email_verification');

console.log('\n--- Token Generation Result ---');
console.log('Raw Token:', tokenData.rawToken);
console.log('Token Hash:', tokenData.tokenHash);
console.log('User ID:', tokenData.userId);
console.log('Purpose:', tokenData.purpose);
console.log('Expires At:', tokenData.expiresAt);

// Test if our stored hash matches what we expect
const storedHash = 'd0c643af613072e794168ed5d939605f750ff4caf0816e147ac3523c5b6216c4';
console.log('\n--- Hash Comparison ---');
console.log('Stored Hash:', storedHash);
console.log('Generated Hash:', tokenData.tokenHash);
console.log('Hashes Match:', storedHash === tokenData.tokenHash);

// Try to reverse engineer what the raw token might be
console.log('\n--- Reverse Engineering ---');
console.log('If we hash the stored hash itself:', hashToken(storedHash));

// Test various possible raw token formats
const possibleRawTokens = [
  storedHash,
  storedHash.substring(0, 32),
  Buffer.from(storedHash, 'hex').toString('base64url'),
  Buffer.from(storedHash, 'hex').toString('base64'),
];

console.log('\n--- Testing Possible Raw Tokens ---');
possibleRawTokens.forEach((rawToken, index) => {
  const hash = hashToken(rawToken);
  console.log(`Option ${index + 1}: "${rawToken}" -> Hash: ${hash} (Match: ${hash === storedHash})`);
});