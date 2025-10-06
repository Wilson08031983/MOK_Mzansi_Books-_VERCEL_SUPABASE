import type { VercelRequest, VercelResponse } from '@vercel/node';
import { VerificationRequest, VerificationResponse } from '../src/types/auth.ts';
import { validateToken, hashToken } from '../src/services/tokenService.ts';
import { logAuditEvent } from '../src/services/loggingService.ts';
import { findTokenByHash, markTokenUsed, invalidateOtherTokensForUser, markUserEmailVerified } from '../src/repositories/verificationRepo.ts';

// All localStorage-based functions have been removed as they are not compatible with server-side execution
// The API now uses Supabase-backed functions from verificationRepo instead

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    logAuditEvent('verify_email.attempt', undefined, undefined, req.url, req.socket.remoteAddress, req.headers['user-agent'], 0, {
      method: req.method,
      reason: 'method_not_allowed'
    });
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const requestData: VerificationRequest = req.body;

    // Validate request data
    if (!requestData.token || !requestData.userId) {
      logAuditEvent('verify_email.attempt', requestData.userId, undefined, req.url, req.socket.remoteAddress, req.headers['user-agent'], 0, {
        reason: 'missing_parameters',
        token: requestData.token ? 'provided' : 'missing',
        userId: requestData.userId ? 'provided' : 'missing'
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: token and userId'
      });
    }

    // Supabase-backed: compute hash from raw token and look up
    console.log('Verification attempt - Raw token:', requestData.token);
    console.log('Verification attempt - User ID:', requestData.userId);
    
    const computedHash = hashToken(requestData.token);
    console.log('Computed hash from raw token:', computedHash);
    
    const { token, error: tokenLookupError } = await findTokenByHash(requestData.userId, computedHash);
    console.log('Token lookup result:', { token, error: tokenLookupError });
    
    if (tokenLookupError) {
      console.log('Token lookup failed:', tokenLookupError);
      logAuditEvent('verify_email.attempt', requestData.userId, undefined, req.url, req.socket.remoteAddress, req.headers['user-agent'], 0, {
        reason: 'token_lookup_failed',
        error: tokenLookupError
      });
      return res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
    }
    if (!token) {
      console.log('No token found for computed hash:', computedHash);
      logAuditEvent('verify_email.attempt', requestData.userId, undefined, req.url, req.socket.remoteAddress, req.headers['user-agent'], 0, {
        reason: 'token_not_found'
      });
      return res.status(400).json({
        success: false,
        message: 'Verification link is invalid or expired. Request a new verification email.'
      });
    }

    // Supabase-backed: profiles table is updated directly; skip local user lookup

    // Validate token
    console.log('About to validate token with:');
    console.log('- rawToken:', requestData.token);
    console.log('- stored token_hash:', token.token_hash);
    console.log('- expires_at:', token.expires_at);
    console.log('- used_at:', token.used_at);
    
    const validation = validateToken(
      requestData.token,
      token.token_hash,
      token.expires_at,
      token.used_at
    );
    console.log('Token validation result:', validation);

    if (!validation.valid) {
      console.log('Token validation failed with reason:', validation.reason);
      logAuditEvent('verify_email.attempt', requestData.userId, undefined, req.url, req.socket.remoteAddress, req.headers['user-agent'], 0, {
        reason: 'invalid_token',
        validationReason: validation.reason
      });
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token.' });
    }
    
    console.log('Token validation passed, proceeding to mark user email as verified');

    // Mark user as verified in Supabase profiles
    console.log('Marking user email as verified...');
    const updateResult = await markUserEmailVerified(requestData.userId);
    console.log('User email verification result:', updateResult);
    
    if (!updateResult.success) {
      console.log('Failed to mark user email as verified:', updateResult.error);
      logAuditEvent('verify_email.attempt', requestData.userId, undefined, req.url, req.socket.remoteAddress, req.headers['user-agent'], 0, {
        reason: 'user_update_failed',
        error: updateResult.error
      });
      return res.status(500).json({ success: false, message: 'Failed to verify email. Please try again.' });
    }

    // Mark token as used
    const tokenUpdateResult = await markTokenUsed(token.id);
    if (!tokenUpdateResult.success) {
      console.warn('Failed to mark token as used:', tokenUpdateResult.error);
    }

    // Invalidate other tokens for this user
    await invalidateOtherTokensForUser(requestData.userId, token.id);

    // Log successful verification
    logAuditEvent('email_verified', requestData.userId, undefined, req.url, req.socket.remoteAddress, req.headers['user-agent'], 1, {
      tokenId: token.id,
      verificationMethod: 'email_link'
    });

    // Success response
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now sign in.'
    });

  } catch (error) {
    console.error('Email verification error:', error);

    logAuditEvent('verify_email.attempt', undefined, undefined, req.url, req.socket.remoteAddress, req.headers['user-agent'], 0, {
      reason: 'server_error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred. Please try again later.',
      error: 'Internal server error'
    });
  }
}
