import type { VercelRequest, VercelResponse } from '@vercel/node';
import { VerificationRequest, VerificationResponse } from '../src/types/auth';
import { validateToken, hashToken } from '../src/services/tokenService';
import { logAuditEvent } from '../src/services/loggingService';
import { findTokenByHash, markTokenUsed, invalidateOtherTokensForUser, markUserEmailVerified } from '../src/repositories/verificationRepo';

/**
 * Gets verification token by ID
 */
function getVerificationToken(tokenId: string): any {
  try {
    const tokens = JSON.parse(localStorage.getItem('verification_tokens') || '[]');
    return tokens.find((token: any) => token.id === tokenId);
  } catch (error) {
    console.error('Error getting verification token:', error);
    return null;
  }
}

/**
 * Gets user by ID
 */
function getUserById(userId: string): any {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find((user: any) => user.id === userId);
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Updates user verification status
 */
function updateUserVerification(userId: string, verified: boolean): { success: boolean; error?: string } {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((user: any) => user.id === userId);

    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    users[userIndex].verified = verified;
    users[userIndex].verifiedAt = verified ? new Date().toISOString() : undefined;
    users[userIndex].updatedAt = new Date().toISOString();

    localStorage.setItem('users', JSON.stringify(users));
    return { success: true };
  } catch (error) {
    console.error('Error updating user verification:', error);
    return { success: false, error: 'Failed to update user verification status' };
  }
}

/**
 * Updates verification token as used
 */
function updateTokenAsUsed(tokenId: string): { success: boolean; error?: string } {
  try {
    const tokens = JSON.parse(localStorage.getItem('verification_tokens') || '[]');
    const tokenIndex = tokens.findIndex((token: any) => token.id === tokenId);

    if (tokenIndex === -1) {
      return { success: false, error: 'Token not found' };
    }

    tokens[tokenIndex].usedAt = new Date().toISOString();
    localStorage.setItem('verification_tokens', JSON.stringify(tokens));
    return { success: true };
  } catch (error) {
    console.error('Error updating token as used:', error);
    return { success: false, error: 'Failed to update token status' };
  }
}

/**
 * Invalidates all other verification tokens for a user
 */
function invalidateOtherTokens(userId: string, currentTokenId: string): void {
  try {
    const tokens = JSON.parse(localStorage.getItem('verification_tokens') || '[]');
    const updatedTokens = tokens.map((token: any) => {
      if (token.userId === userId && token.id !== currentTokenId && !token.usedAt) {
        return { ...token, usedAt: new Date().toISOString() };
      }
      return token;
    });

    localStorage.setItem('verification_tokens', JSON.stringify(updatedTokens));
  } catch (error) {
    console.error('Error invalidating other tokens:', error);
  }
}

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
    const computedHash = hashToken(requestData.token);
    const { token, error: tokenLookupError } = await findTokenByHash(requestData.userId, computedHash);
    if (tokenLookupError) {
      logAuditEvent('verify_email.attempt', requestData.userId, undefined, req.url, req.socket.remoteAddress, req.headers['user-agent'], 0, {
        reason: 'token_lookup_failed',
        error: tokenLookupError
      });
      return res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
    }
    if (!token) {
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
    const validation = validateToken(
      requestData.token,
      token.token_hash,
      token.expires_at,
      token.used_at
    );

    if (!validation.valid) {
      logAuditEvent('verify_email.attempt', requestData.userId, user.companyId, req.url, req.socket.remoteAddress, req.headers['user-agent'], 0, {
        reason: validation.reason,
        tokenId: requestData.token,
        tokenPurpose: token.purpose
      });
      return res.status(400).json({
        success: false,
        message: 'Verification link is invalid or expired. Request a new verification email.'
      });
    }

    // Mark user as verified in Supabase profiles
    const updateResult = await markUserEmailVerified(requestData.userId);
    if (!updateResult.success) {
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
