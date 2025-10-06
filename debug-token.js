import { createVerificationToken } from './src/services/tokenService.ts';

const token = createVerificationToken('test-user-id', 'email_verification');
console.log('Token object:', JSON.stringify(token, null, 2));