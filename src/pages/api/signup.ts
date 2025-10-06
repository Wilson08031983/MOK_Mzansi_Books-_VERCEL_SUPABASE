import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'postmark';
import { SignupRequest, SignupResponse } from '../../types/auth';
import { createVerificationToken, createVerificationTokenWithRaw } from '../../services/tokenService';
import { randomUUID } from 'crypto';
import { logAuditEvent, logEmailEvent } from '../../services/loggingService';
import { sendVerificationEmail } from '../../services/emailService';
import { supabaseServer } from '../../integrations/supabase/serverClient';

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
  console.log('Validating signup request data:', data);
  const errors: string[] = [];

  try {
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

    console.log('Validation errors:', errors);
    return {
      valid: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error('Error in validateSignupRequest:', error);
    throw error;
  }
}

/**
 * Check if email already exists in Supabase auth
 */
async function checkEmailExists(email: string): Promise<{ exists: boolean; verified: boolean; userId?: string }> {
  try {
    // Check if user exists in Supabase auth
    const { data: users, error } = await supabaseServer.auth.admin.listUsers();
    
    if (error) {
      console.error('Error checking email existence:', error);
      return { exists: false, verified: false };
    }

    const existingUser = users.users.find(user => user.email === email);
    
    if (existingUser) {
      return {
        exists: true,
        verified: existingUser.email_confirmed_at !== null,
        userId: existingUser.id
      };
    }

    return { exists: false, verified: false };
  } catch (error) {
    console.error('Error checking email existence:', error);
    return { exists: false, verified: false };
  }
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
    const companyId = randomUUID();
    const company = {
      id: companyId,
      name: companyData.name,
      contactEmail: companyData.contactEmail,
      ownerUserId: companyData.ownerUserId,
      createdAt: new Date().toISOString()
    };
    
    companies.push(company);
    return { success: true, companyId };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Create a new user in Supabase auth
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
    const { data, error } = await supabaseServer.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: false, // We'll handle email verification manually
      user_metadata: {
        firstName: userData.firstName,
        surname: userData.surname,
        position: userData.position,
        companyId: userData.companyId
      }
    });

    if (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }

    return { success: true, userId: data.user.id };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Store verification token (placeholder - in real app, store in database)
 */
async function storeVerificationToken(token: any): Promise<void> {
  // In a real application, this would store the token in a database
  // For now, we'll just log it for debugging
  console.log('Storing verification token:', {
    id: token.id,
    userId: token.userId,
    purpose: token.purpose,
    expiresAt: token.expiresAt
  });
  
  // TODO: Implement actual database storage
  // Example:
  // await db.verificationToken.create({ data: token });
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
  
  // Reset if cooldown period has passed
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
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Handler called - method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    console.log('Signup API called with body:', JSON.stringify(req.body, null, 2));
    const requestData: SignupRequest = req.body;
    const clientIP = req.headers['x-forwarded-for'] as string || req.connection?.remoteAddress || 'unknown';

    console.log('About to validate request data...');
    // Validate request data
    const validation = validateSignupRequest(requestData);
    console.log('Validation result:', validation);
    
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

    console.log('About to check rate limiting...');
    // Check rate limiting
    const rateLimit = checkRateLimit(clientIP);
    console.log('Rate limit result:', rateLimit);
    
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
    const appHost = process.env.APP_HOST || 'http://localhost:3000';
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
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    const clientIP = req.headers['x-forwarded-for'] as string || req.connection?.remoteAddress || 'unknown';
    logAuditEvent('signup.attempt', undefined, undefined, req.url, clientIP, req.headers['user-agent'], 0, {
      reason: 'server_error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred. Please try again later.',
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}