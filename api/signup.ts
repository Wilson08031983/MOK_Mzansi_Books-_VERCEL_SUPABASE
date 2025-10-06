import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'postmark';
import { createClient } from '@supabase/supabase-js';
import { SignupRequest, SignupResponse } from '../src/types/auth';
import { createVerificationToken, createVerificationTokenWithRaw } from '../src/services/tokenService';
import { randomUUID } from 'crypto';
import { logAuditEvent, logEmailEvent } from '../src/services/loggingService';
import { sendVerificationEmail } from '../src/services/emailService';
import { supabaseServer } from '../src/integrations/supabase/serverClient';

// Initialize Postmark client
const postmarkClient = new Client(process.env.POSTMARK_SERVER_TOKEN || '');

// Rate limiting storage (in production, use Redis or similar)
const signupAttempts = new Map<string, { count: number; lastAttempt: number }>();
const RESEND_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

// In-memory storage for companies (will be replaced with Supabase table later)
let companies: any[] = [];

/**
 * Validate signup request data
 */
function validateSignupRequest(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required');
  } else if (data.password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!data.confirmPassword || typeof data.confirmPassword !== 'string') {
    errors.push('Password confirmation is required');
  } else if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }

  if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!data.surname || typeof data.surname !== 'string' || data.surname.trim().length === 0) {
    errors.push('Surname is required');
  }

  if (!data.companyName || typeof data.companyName !== 'string' || data.companyName.trim().length === 0) {
    errors.push('Company name is required');
  }

  if (!data.position || typeof data.position !== 'string' || data.position.trim().length === 0) {
    errors.push('Position is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if email already exists in Supabase auth
 */
async function checkEmailExists(email: string): Promise<{ exists: boolean; verified: boolean; userId?: string }> {
  // Without admin APIs (legacy keys disabled), skip pre-check and let signup handle duplicates
  return { exists: false, verified: false };
}

/**
 * Create a new company
 */
function createCompany(companyData: {
  name: string;
  contactEmail: string;
  ownerUserId: string;
}): { success: boolean; companyId?: string; error?: string } {
  try {
    const companyId = `company_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newCompany = {
      id: companyId,
      name: companyData.name,
      contactEmail: companyData.contactEmail,
      ownerUserId: companyData.ownerUserId,
      createdAt: new Date().toISOString()
    };
    
    companies.push(newCompany);
    return { success: true, companyId };
  } catch (error) {
    console.error('Error creating company:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Create user using Supabase auth
 */
async function createUser(userData: {
  companyId: string;
  email: string;
  firstName: string;
  surname: string;
  position: string;
  password: string;
}): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    // Use publishable/anon key for public signup; legacy admin APIs may be disabled
    const SUPABASE_URL = process.env.SUPABASE_URL || '';
    const PUBLIC_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    const publicClient = createClient(SUPABASE_URL, PUBLIC_KEY);

    const { data, error } = await publicClient.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          firstName: userData.firstName,
          surname: userData.surname,
          position: userData.position,
          companyId: userData.companyId
        }
      }
    });

    if (error) {
      console.error('Error creating user in Supabase (signUp):', error);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Failed to create user' };
    }

    return { success: true, userId: data.user.id };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Store verification token in Supabase
 */
async function storeVerificationToken(token: any): Promise<void> {
  try {
    console.log('Token object received:', JSON.stringify(token, null, 2));
    console.log('Token hash value:', token.tokenHash);
    
    const { error } = await supabaseServer
      .from('verification_tokens')
      .insert({
        id: token.id,
        user_id: token.userId,
        token_hash: token.tokenHash,
        purpose: token.purpose,
        expires_at: token.expiresAt,
        created_at: token.createdAt
      });

    if (error) {
      console.error('Error storing verification token:', error);
      throw new Error(`Failed to store verification token: ${error.message}`);
    }
  } catch (error) {
    console.error('Error storing verification token:', error);
    throw error;
  }
}

/**
 * Check rate limiting for signup attempts
 */
function checkRateLimit(identifier: string): { allowed: boolean; waitTime?: number } {
  const now = Date.now();
  const attempts = signupAttempts.get(identifier);

  if (!attempts) {
    signupAttempts.set(identifier, { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  // Reset if enough time has passed
  if (now - attempts.lastAttempt > RESEND_COOLDOWN_MS) {
    signupAttempts.set(identifier, { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  // Check if too many attempts
  if (attempts.count >= 3) {
    const waitTime = RESEND_COOLDOWN_MS - (now - attempts.lastAttempt);
    return { allowed: false, waitTime };
  }

  // Increment attempts
  attempts.count++;
  attempts.lastAttempt = now;
  return { allowed: true };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const requestData: SignupRequest = req.body;
    const clientIP = req.headers['x-forwarded-for'] as string || req.connection?.remoteAddress || 'unknown';

    // Validate request data
    const validation = validateSignupRequest(requestData);
    if (!validation.valid) {
      logAuditEvent('signup.attempt', undefined, undefined, req.url, clientIP, req.headers['user-agent'], 0, {
        reason: 'validation_failed',
        errors: validation.errors
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Check rate limiting
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      logAuditEvent('signup.attempt', undefined, undefined, req.url, clientIP, req.headers['user-agent'], 0, {
        reason: 'rate_limited',
        waitTime: rateLimit.waitTime
      });
      return res.status(429).json({
        success: false,
        message: `Too many signup attempts. Please wait ${Math.ceil((rateLimit.waitTime || 0) / 1000)} seconds before trying again.`
      });
    }

    const normalizedEmail = requestData.email.toLowerCase().trim();

    // Check if email already exists
    const emailCheck = await checkEmailExists(normalizedEmail);
    if (emailCheck.exists) {
      if (emailCheck.verified) {
        logAuditEvent('signup.attempt', emailCheck.userId, undefined, req.url, clientIP, req.headers['user-agent'], 0, {
          reason: 'email_already_verified',
          email: normalizedEmail
        });
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists and is verified. Please sign in instead.'
        });
      } else {
        logAuditEvent('signup.attempt', emailCheck.userId, undefined, req.url, clientIP, req.headers['user-agent'], 0, {
          reason: 'email_exists_unverified',
          email: normalizedEmail
        });
        return res.status(409).json({
          success: false,
          message: 'An account with this email exists but is not verified. Please check your email for the verification link.'
        });
      }
    }

    // Create company first (temporary user ID for now)
    const tempUserId = `temp_${Date.now()}`;
    const companyResult = createCompany({
      name: requestData.companyName.trim(),
      contactEmail: normalizedEmail,
      ownerUserId: tempUserId
    });

    if (!companyResult.success) {
      logAuditEvent('signup.attempt', undefined, undefined, req.url, clientIP, req.headers['user-agent'], 0, {
        reason: 'company_creation_failed',
        error: companyResult.error
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to create company',
        error: companyResult.error
      });
    }

    // Create user
    const userResult = await createUser({
      companyId: companyResult.companyId!,
      email: normalizedEmail,
      firstName: requestData.firstName.trim(),
      surname: requestData.surname.trim(),
      position: requestData.position,
      password: requestData.password
    });

    if (!userResult.success) {
      logAuditEvent('signup.attempt', undefined, companyResult.companyId, req.url, clientIP, req.headers['user-agent'], 0, {
        reason: 'user_creation_failed',
        error: userResult.error
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account',
        error: userResult.error
      });
    }

    // Update company with actual owner user ID
    const companyIndex = companies.findIndex((c: any) => c.id === companyResult.companyId);
    if (companyIndex !== -1) {
      companies[companyIndex].ownerUserId = userResult.userId!;
    }

    // Create verification token with raw token for URL
    const tokenData = createVerificationTokenWithRaw(userResult.userId!, 'email_verification');
    console.log('Raw token for verification:', tokenData.rawToken); // DEBUG: Log raw token
    const verificationToken = {
      id: randomUUID(),
      userId: tokenData.userId,
      tokenHash: tokenData.tokenHash,
      purpose: tokenData.purpose,
      expiresAt: tokenData.expiresAt,
      createdAt: new Date().toISOString()
    };
    await storeVerificationToken(verificationToken);

    // Build verification URL using the raw token
const appHost = process.env.APP_HOST || 'http://localhost:8080';
    const verifyUrl = `${appHost}/auth/verify-email?token=${tokenData.rawToken}&uid=${userResult.userId}`;
    console.log('Verification URL:', verifyUrl); // DEBUG: Log verification URL

    // Send verification email
    try {
      await sendVerificationEmail({
        to: normalizedEmail,
        firstName: requestData.firstName,
        lastName: requestData.surname,
        companyName: requestData.companyName,
        verifyUrl,
        userId: userResult.userId!,
        companyId: companyResult.companyId!
      });

      logEmailEvent('send_attempt', userResult.userId!, companyResult.companyId!, 'verification', undefined, 'success', {
        email: normalizedEmail,
        verifyUrl: verifyUrl.substring(0, 50) + '...'
      });

      logAuditEvent('signup.complete', userResult.userId, companyResult.companyId, req.url, clientIP, req.headers['user-agent'], 1, {
        email: normalizedEmail,
        companyName: requestData.companyName,
        position: requestData.position
      });

    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);

      logEmailEvent('send_attempt', userResult.userId!, companyResult.companyId!, 'verification', undefined, 'error', {
        email: normalizedEmail,
        error: emailError instanceof Error ? emailError.message : 'Unknown error'
      });

      logAuditEvent('signup.complete', userResult.userId, companyResult.companyId, req.url, clientIP, req.headers['user-agent'], 1, {
        email: normalizedEmail,
        companyName: requestData.companyName,
        position: requestData.position,
        emailError: 'Verification email failed to send'
      });

      // Still return success but with warning
      return res.status(201).json({
        success: true,
        message: 'Account created successfully, but verification email failed to send. Please contact support.',
        userId: userResult.userId,
        companyId: companyResult.companyId
      });
    }

    // Success response
    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      userId: userResult.userId,
      companyId: companyResult.companyId
    });

  } catch (error) {
    console.error('Signup error:', error);

    const clientIP = req.headers['x-forwarded-for'] as string || req.connection?.remoteAddress || 'unknown';
    logAuditEvent('signup.attempt', undefined, undefined, req.url, clientIP, req.headers['user-agent'], 0, {
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
