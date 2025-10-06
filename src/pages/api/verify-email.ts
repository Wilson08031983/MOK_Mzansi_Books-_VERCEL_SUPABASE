import type { NextApiRequest, NextApiResponse } from 'next';
import { VerificationRequest, VerificationResponse } from '../../types/auth';
import { validateToken, hashToken } from '../../services/tokenService';
import { logAuditEvent } from '../../services/loggingService';
import { findTokenByHash, markTokenUsed, invalidateOtherTokensForUser, markUserEmailVerified } from '../../repositories/verificationRepo';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerificationResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    try {
      logAuditEvent('verify_email.attempt', undefined, undefined, req.url, (req.socket as any)?.remoteAddress, req.headers['user-agent'], 0, {
        method: req.method,
        reason: 'method_not_allowed'
      });
    } catch {}
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const requestData = req.body as VerificationRequest;

    // Validate request data
    if (!requestData?.token || !requestData?.userId) {
      try {
        logAuditEvent('verify_email.attempt', requestData?.userId, undefined, req.url, (req.socket as any)?.remoteAddress, req.headers['user-agent'], 0, {
          reason: 'missing_parameters',
          token: requestData?.token ? 'provided' : 'missing',
          userId: requestData?.userId ? 'provided' : 'missing'
        });
      } catch {}
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: token and userId'
      });
    }

    // Compute hash from raw token and look up
    const computedHash = hashToken(requestData.token);
    const { token, error: tokenLookupError } = await findTokenByHash(requestData.userId, computedHash);
    if (tokenLookupError) {
      try {
        logAuditEvent('verify_email.attempt', requestData.userId, undefined, req.url, (req.socket as any)?.remoteAddress, req.headers['user-agent'], 0, {
          reason: 'token_lookup_error',
          error: tokenLookupError
        });
      } catch {}
      return res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
    }

    if (!token) {
      try {
        logAuditEvent('verify_email.attempt', requestData.userId, undefined, req.url, (req.socket as any)?.remoteAddress, req.headers['user-agent'], 0, {
          reason: 'token_not_found'
        });
      } catch {}
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token.' });
    }

    // Validate token
    const validation = validateToken(requestData.token, token.token_hash, token.expires_at, token.used_at);
    if (!validation.valid) {
      try {
        logAuditEvent('verify_email.attempt', requestData.userId, undefined, req.url, (req.socket as any)?.remoteAddress, req.headers['user-agent'], 0, {
          reason: 'invalid_token',
          validationReason: validation.reason
        });
      } catch {}
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token.' });
    }

    // Mark user as verified
    const updateResult = await markUserEmailVerified(requestData.userId);
    if (!updateResult.success) {
      try {
        logAuditEvent('verify_email.attempt', requestData.userId, undefined, req.url, (req.socket as any)?.remoteAddress, req.headers['user-agent'], 0, {
          reason: 'user_update_failed',
          error: updateResult.error
        });
      } catch {}
      return res.status(500).json({ success: false, message: 'Failed to verify email. Please try again.' });
    }

    // Mark token as used and invalidate other tokens
    await markTokenUsed(token.id);
    await invalidateOtherTokensForUser(requestData.userId, token.id);

    try {
      logAuditEvent('email_verified', requestData.userId, undefined, req.url, (req.socket as any)?.remoteAddress, req.headers['user-agent'], 1, {
        tokenId: token.id,
        verificationMethod: 'email_link'
      });
    } catch {}

    return res.status(200).json({ success: true, message: 'Email verified successfully. You can now sign in.' });

  } catch (error) {
    console.error('Email verification error:', error);
    try {
      logAuditEvent('verify_email.attempt', undefined, undefined, req.url, (req.socket as any)?.remoteAddress, req.headers['user-agent'], 0, {
        reason: 'server_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } catch {}
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred. Please try again later.',
      error: 'Internal server error'
    });
  }
}