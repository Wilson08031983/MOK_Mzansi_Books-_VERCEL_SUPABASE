import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { Client } from 'postmark';
import { SignupRequest, SignupResponse } from '../src/types/auth';
import { createVerificationToken } from '../src/services/tokenService';
import { logAuditEvent, logEmailEvent } from '../src/services/loggingService';
import { sendVerificationEmail } from '../src/services/emailService';

// Initialize Postmark client
const postmarkClient = new Client(process.env.POSTMARK_SERVER_TOKEN || '');

// Rate limiting storage (in production, use Redis or similar)
const signupAttempts = new Map<string, { count: number; lastAttempt: number }>();
const RESEND_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

// In-memory storage for development (replace with database in production)
let users: any[] = [];
let companies: any[] = [];
let verificationTokens: any[] = [];

/**
 * Validates signup request data
 */
function validateSignupRequest(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim().length < 1) {
    errors.push('First name is required');
  }

  if (!data.surname || typeof data.surname !== 'string' || data.surname.trim().length < 1) {
    errors.push('Surname is required');
  }

  if (!data.companyName || typeof data.companyName !== 'string' || data.companyName.trim().length < 1) {
    errors.push('Company name is required');
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.position || typeof data.position !== 'string') {
    errors.push('Position is required');
  }

  if (!data.password || typeof data.password !== 'string' || data.password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Checks if email already exists and is verified
 */
function checkEmailExists(email: string): { exists: boolean; verified: boolean; userId?: string } {
  try {
    const existingUser = users.find((user: any) => user.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      return { exists: true, verified: !!existingUser.verified, userId: existingUser.id };
    }

    return { exists: false, verified: false };
  } catch (error) {
    console.error('Error checking email existence:', error);
    return { exists: false, verified: false };
  }
}

/**
 * Creates a new company
 */
function createCompany(companyData: {
  name: string;
  contactEmail: string;
  ownerUserId: string;
}): { success: boolean; companyId?: string; error?: string } {
  try {
    // Check if company name already exists
    const existingCompany = companies.find((c: any) => c.name.toLowerCase() === companyData.name.toLowerCase());
    if (existingCompany) {
      return { success: false, error: 'Company name already exists' };
    }

    const companyId = `company_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const company = {
      id: companyId,
      name: companyData.name,
      ownerUserId: companyData.ownerUserId,
      contactEmail: companyData.contactEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    companies.push(company);
    return { success: true, companyId };
  } catch (error) {
    console.error('Error creating company:', error);
    return { success: false, error: 'Failed to create company' };
  }
}

/**
 * Creates a new user
 */
function createUser(userData: {
  companyId: string;
  email: string;
  firstName: string;
  surname: string;
  position: string;
  passwordHash: string;
}): { success: boolean; userId?: string; error?: string } {
  try {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const user = {
      id: userId,
      companyId: userData.companyId,
      email: userData.email.toLowerCase(),
      firstName: userData.firstName,
      surname: userData.surname,
      position: userData.position,
      passwordHash: userData.passwordHash,
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(user);
    return { success: true, userId };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

/**
 * Stores a verification token
 */
function storeVerificationToken(token: any): void {
  try {
    verificationTokens.push(token);
  } catch (error) {
    console.error('Error storing verification token:', error);
  }
}

/**
 * Checks rate limiting for signup attempts
 */
function checkRateLimit(identifier: string): { allowed: boolean; waitTime?: number } {
  const now = Date.now();
  const attempt = signupAttempts.get(identifier);

  if (!attempt) {
    signupAttempts.set(identifier, { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  // Reset count if more than 1 hour has passed
  if (now - attempt.lastAttempt > 60 * 60 * 1000) {
    signupAttempts.set(identifier, { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  // Allow max 5 attempts per hour
  if (attempt.count >= 5) {
    const waitTime = 60 * 60 * 1000 - (now - attempt.lastAttempt);
    return { allowed: false, waitTime };
  }

  attempt.count++;
  attempt.lastAttempt = now;
  return { allowed: true };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  // Only allow POST requests
  if (req.method !== 'POST') {
    logAuditEvent('signup.attempt', undefined, undefined, req.url, req.socket.remoteAddress, req.headers['user-agent'], 0, {
      method: req.method,
      reason: 'method_not_allowed'
    });
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Get client IP for rate limiting
  const clientIP = req.socket.remoteAddress || req.headers['x-forwarded-for'] as string || 'unknown';

  // Rate limiting check
  const rateLimitResult = checkRateLimit(clientIP);
  if (!rateLimitResult.allowed) {
    logAuditEvent('signup.attempt', undefined, undefined, req.url, clientIP, req.headers['user-agent'], 0, {
      reason: 'rate_limited',
      waitTime: rateLimitResult.waitTime
    });
    return res.status(429).json({
      success: false,
      message: `Too many signup attempts. Please try again in ${Math.ceil((rateLimitResult.waitTime || 0) / 60000)} minutes.`
    });
  }

  try {
    const requestData: SignupRequest = req.body;

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
        error: validation.errors.join(', ')
      });
    }

    // Normalize email
    const normalizedEmail = requestData.email.toLowerCase().trim();

    // Check if email already exists
    const emailCheck = checkEmailExists(normalizedEmail);
    if (emailCheck.exists) {
      if (emailCheck.verified) {
        logAuditEvent('signup.attempt', emailCheck.userId, undefined, req.url, clientIP, req.headers['user-agent'], 0, {
          reason: 'email_already_verified',
          email: normalizedEmail
        });
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please sign in instead.'
        });
      } else {
        // Email exists but not verified - allow resend
        logAuditEvent('signup.attempt', emailCheck.userId, undefined, req.url, clientIP, req.headers['user-agent'], 0, {
          reason: 'email_exists_unverified',
          email: normalizedEmail
        });
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists but is not verified. Please check your email or request a new verification link.'
        });
      }
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(requestData.password, saltRounds);

    // Create company first
    const companyResult = createCompany({
      name: requestData.companyName.trim(),
      contactEmail: normalizedEmail,
      ownerUserId: '' // Will be set after user creation
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
    const userResult = createUser({
      companyId: companyResult.companyId!,
      email: normalizedEmail,
      firstName: requestData.firstName.trim(),
      surname: requestData.surname.trim(),
      position: requestData.position,
      passwordHash
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

    // Update company with owner user ID
    const companyIndex = companies.findIndex((c: any) => c.id === companyResult.companyId);
    if (companyIndex !== -1) {
      companies[companyIndex].ownerUserId = userResult.userId!;
    }

    // Create verification token
    const verificationToken = createVerificationToken(userResult.userId!, 'email_verification');
    storeVerificationToken(verificationToken);

    // Build verification URL
    const appHost = process.env.APP_HOST || 'http://localhost:8082';
    const verifyUrl = `${appHost}/auth/verify-email?token=${verificationToken.id}&uid=${userResult.userId}`;

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
