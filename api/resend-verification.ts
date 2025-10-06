import type { NextApiRequest, NextApiResponse } from 'next';
import { ResendVerificationRequest, ResendVerificationResponse } from '../src/types/auth';
import { createVerificationTokenWithRaw } from '../src/services/tokenService';
import { logAuditEvent, logEmailEvent } from '../src/services/loggingService';
import { sendVerificationEmail } from '../src/services/emailService';
import { insertVerificationToken, invalidateOtherTokensForUser } from '../src/repositories/verificationRepo';
import { supabaseServer } from '../src/integrations/supabase/serverClient';

// Rate limiting storage (in production, use Redis or similar)
const resendAttempts = new Map<string, { count: number; lastAttempt: number }>();
const RESEND_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Gets user by email from Supabase auth
 */
async function getUserByEmail(email: string): Promise<any> {
  try {
    // First try to get from auth.users
    const { data: authData, error: authError } = await supabaseServer.auth.admin.listUsers();
    
    if (!authError && authData?.users) {
      const authUser = authData.users.find(user => 
        user.email?.toLowerCase() === email.toLowerCase()
      );
      
      if (authUser) {
        // Try to get additional profile data
        const { data: profileData } = await supabaseServer
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        // Combine auth user with profile data
        return {
          id: authUser.id,
          email: authUser.email,
          firstName: profileData?.first_name || authUser.user_metadata?.first_name || '',
          surname: profileData?.last_name || authUser.user_metadata?.last_name || '',
          companyId: profileData?.company_id || authUser.user_metadata?.company_id,
          verified: authUser.email_confirmed_at ? true : false,
          ...profileData
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Gets company by ID from Supabase
 */
async function getCompanyById(companyId: string): Promise<any> {
  try {
    const { data, error } = await supabaseServer
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();
    
    if (error) {
      console.error('Error getting company by ID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting company by ID:', error);
    return null;
  }
}

// Supabase-backed: tokens are stored in DB; localStorage fallback removed

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
    const user = await getUserByEmail(normalizedEmail);
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

    // Get company information - skip if not available for now
    let company: { id: string; name: string } | null = null;
    if (user.companyId) {
      company = await getCompanyById(user.companyId);
    }
    
    // Use default company info if not found
    const companyInfo = company || {
      id: 'default-company',
      name: 'MOK Mzansi Books'
    };

    // Invalidate existing tokens in Supabase
    await invalidateOtherTokensForUser(user.id);

    // Create new verification token (raw for email, hash for DB)
    const { rawToken, tokenHash, expiresAt } = createVerificationTokenWithRaw(user.id, 'email_verification');
    const insertResult = await insertVerificationToken({ userId: user.id, tokenHash, purpose: 'email_verification', expiresAt });
    if (insertResult.error) {
      logAuditEvent('resend_verification.attempt', user.id, user.companyId, req.url, req.socket.remoteAddress, req.headers['user-agent'], 0, {
        reason: 'token_insert_failed',
        error: insertResult.error
      });
      return res.status(500).json({ success: false, message: 'Unable to create verification token. Please try again.' });
    }

    // Build verification URL
    const appHost = process.env.APP_HOST || 'http://localhost:3000';
    // Use the correct public route for verification page (client route)
    const verifyUrl = `${appHost}/auth/verify-email?token=${encodeURIComponent(rawToken)}&uid=${user.id}`;

    // Send verification email
    try {
      await sendVerificationEmail({
        to: normalizedEmail,
        firstName: user.firstName,
        lastName: user.surname,
        companyName: companyInfo.name,
        verifyUrl: verifyUrl,
        userId: user.id,
        companyId: companyInfo.id
      });

      logEmailEvent('send_attempt', user.id, companyInfo.id, 'verification_resend', undefined, 'success', {
        email: normalizedEmail,
        verifyUrl: verifyUrl.substring(0, 50) + '...',
        previousAttempts: resendAttempts.get(normalizedEmail)?.count || 1
      });

      logAuditEvent('verification_resent', user.id, companyInfo.id, req.url, req.socket.remoteAddress, req.headers['user-agent'], 1, {
        email: normalizedEmail,
        companyName: companyInfo.name,
        attemptCount: resendAttempts.get(normalizedEmail)?.count || 1
      });

    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);

      logEmailEvent('send_attempt', user.id, companyInfo.id, 'verification_resend', undefined, 'error', {
        email: normalizedEmail,
        error: emailError instanceof Error ? emailError.message : 'Unknown error'
      });

      logAuditEvent('verification_resent', user.id, companyInfo.id, req.url, req.socket.remoteAddress, req.headers['user-agent'], 1, {
        email: normalizedEmail,
        companyName: companyInfo.name,
        emailError: 'Verification email failed to send'
      });

      return res.status(200).json({
        success: false,
        message: 'If an account with this email exists, a new verification email has been sent.'
      });
    }

    // Success response (generic to avoid email enumeration)
    return res.status(200).json({
      success: true,
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
