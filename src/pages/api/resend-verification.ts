import type { NextApiRequest, NextApiResponse } from 'next';
import { ResendVerificationRequest, ResendVerificationResponse } from '@/types/auth';
import { createVerificationToken } from '@/services/tokenService';
import { logAuditEvent, logEmailEvent } from '@/services/loggingService';
import { sendVerificationEmail } from '@/services/emailService';

// Rate limiting storage (in production, use Redis or similar)
const resendAttempts = new Map<string, { count: number; lastAttempt: number }>();
const RESEND_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Gets user by email
 */
function getUserByEmail(email: string): any {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find((user: any) => user.email.toLowerCase() === email.toLowerCase());
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Gets company by ID
 */
function getCompanyById(companyId: string): any {
  try {
    const companies = JSON.parse(localStorage.getItem('companies') || '[]');
    return companies.find((company: any) => company.id === companyId);
  } catch (error) {
    console.error('Error getting company:', error);
    return null;
  }
}

/**
 * Stores a verification token
 */
function storeVerificationToken(token: any): void {
  try {
    const tokens = JSON.parse(localStorage.getItem('verification_tokens') || '[]');
    tokens.push(token);
    localStorage.setItem('verification_tokens', JSON.stringify(tokens));
  } catch (error) {
    console.error('Error storing verification token:', error);
  }
}

/**
 * Invalidates existing tokens for a user
 */
function invalidateExistingTokens(userId: string): void {
  try {
    const tokens = JSON.parse(localStorage.getItem('verification_tokens') || '[]');
    const updatedTokens = tokens.map((token: any) => {
      if (token.userId === userId && !token.usedAt) {
        return { ...token, usedAt: new Date().toISOString() };
      }
      return token;
    });

    localStorage.setItem('verification_tokens', JSON.stringify(updatedTokens));
  } catch (error) {
    console.error('Error invalidating existing tokens:', error);
  }
}

/**
 * Checks rate limiting for resend attempts
 */
function checkResendRateLimit(email: string): { allowed: boolean; waitTime?: number } {
  const now = Date.now();
  const attempt = resendAttempts.get(email.toLowerCase());

  if (!attempt) {
    resendAttempts.set(email.toLowerCase(), { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  // Reset count if more than 1 hour has passed
  if (now - attempt.lastAttempt > 60 * 60 * 1000) {
    resendAttempts.set(email.toLowerCase(), { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  // Allow max 3 resend attempts per hour
  if (attempt.count >= 3) {
    const waitTime = 60 * 60 * 1000 - (now - attempt.lastAttempt);
    return { allowed: false, waitTime };
  }

  attempt.count++;
  attempt.lastAttempt = now;
  return { allowed: true };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResendVerificationResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    logAuditEvent('resend_verification.attempt', undefined, undefined, req.url, req.socket.remoteAddress, req.headers['user-agent'], 0, {
      method: req.method,
      reason: 'method_not_allowed'
    });
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const requestData: ResendVerificationRequest = req.body;

    // Validate request data
    if (!requestData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestData.email)) {
      logAuditEvent('resend_verification.attempt', undefined, undefined, req.url, req.socket.remoteAddress, req.headers['user-agent'], 0, {
        reason: 'invalid_email',
        email: requestData.email
      });
      return res.status(400).json({
        success: false,
        message: 'Valid email address is required'
      });
    }

    const normalizedEmail = requestData.email.toLowerCase().trim();

    // Rate limiting check
    const rateLimitResult = checkResendRateLimit(normalizedEmail);
    if (!rateLimitResult.allowed) {
      logAuditEvent('resend_verification.attempt', undefined, undefined, req.url, req.socket.remoteAddress, req.headers['user-agent'], 0, {
        reason: 'rate_limited',
        email: normalizedEmail,
        waitTime: rateLimitResult.waitTime
      });
      return res.status(429).json({
        success: false,
        message: `Too many resend attempts. Please try again in ${Math.ceil((rateLimitResult.waitTime || 0) / 60000)} minutes.`
      });
    }

    // Get user by email
    const user = getUserByEmail(normalizedEmail);
    if (!user) {
      logAuditEvent('resend_verification.attempt', undefined, undefined, req.url, req.socket.remoteAddress, req.headers['user-agent'], 0, {
        reason: 'user_not_found',
        email: normalizedEmail
      });
      // Don't reveal whether email exists - return generic message
      return res.status(200).json({
        success: false,
        message: 'If an account with this email exists, a new verification email has been sent.'
      });
    }

    // Check if user is already verified
    if (user.verified) {
      logAuditEvent('resend_verification.attempt', user.id, user.companyId, req.url, req.socket.remoteAddress, req.headers['user-agent'], 0, {
        reason: 'already_verified',
        email: normalizedEmail
      });
      return res.status(400).json({
        success: false,
        message: 'This email is already verified. Please sign in.'
      });
    }

    // Get company information
    const company = getCompanyById(user.companyId);
    if (!company) {
      logAuditEvent('resend_verification.attempt', user.id, user.companyId, req.url, req.socket.remoteAddress, req.headers['user-agent'], 0, {
        reason: 'company_not_found',
        email: normalizedEmail
      });
      return res.status(500).json({
        success: false,
        message: 'Company information not found. Please contact support.'
      });
    }

    // Invalidate existing tokens
    invalidateExistingTokens(user.id);

    // Create new verification token
    const verificationToken = createVerificationToken(user.id, 'email_verification');
    storeVerificationToken(verificationToken);

    // Build verification URL
    const appHost = process.env.APP_HOST || 'http://localhost:8082';
    const verifyUrl = `${appHost}/auth/verify-email?token=${verificationToken.id}&uid=${user.id}`;

    // Send verification email
    try {
      await sendVerificationEmail({
        to: normalizedEmail,
        firstName: user.firstName,
        lastName: user.surname,
        companyName: company.name,
        verifyLink: verifyUrl,
        userId: user.id,
        companyId: company.id
      });

      logEmailEvent('send_attempt', user.id, company.id, 'verification_resend', undefined, 'success', {
        email: normalizedEmail,
        verifyUrl: verifyUrl.substring(0, 50) + '...',
        previousAttempts: resendAttempts.get(normalizedEmail)?.count || 1
      });

      logAuditEvent('verification_resent', user.id, company.id, req.url, req.socket.remoteAddress, req.headers['user-agent'], 1, {
        email: normalizedEmail,
        companyName: company.name,
        attemptCount: resendAttempts.get(normalizedEmail)?.count || 1
      });

    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);

      logEmailEvent('send_attempt', user.id, company.id, 'verification_resend', undefined, 'error', {
        email: normalizedEmail,
        error: emailError instanceof Error ? emailError.message : 'Unknown error'
      });

      logAuditEvent('verification_resent', user.id, company.id, req.url, req.socket.remoteAddress, req.headers['user-agent'], 1, {
        email: normalizedEmail,
        companyName: company.name,
        emailError: 'Verification email failed to send'
      });

      return res.status(200).json({
        success: false,
        message: 'If an account with this email exists, a new verification email has been sent.'
      });
    }

    // Success response (generic to avoid email enumeration)
    return res.status(200).json({
      success: false,
      message: 'If an account with this email exists, a new verification email has been sent.'
    });

  } catch (error) {
    console.error('Resend verification error:', error);

    logAuditEvent('resend_verification.attempt', undefined, undefined, req.url, req.socket.remoteAddress, req.headers['user-agent'], 0, {
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
