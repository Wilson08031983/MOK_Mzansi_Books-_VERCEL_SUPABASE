const bcrypt = require('bcryptjs');
const { Client } = require('postmark');

// Initialize Postmark client
const postmarkClient = new Client(process.env.POSTMARK_SERVER_TOKEN || '');

// Rate limiting storage (in production, use Redis or similar)
const signupAttempts = new Map();
const RESEND_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

// In-memory storage for development (replace with database in production)
let users = [];
let companies = [];
let verificationTokens = [];

/**
 * Validates signup request data
 */
function validateSignupRequest(data) {
  const errors = [];

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

  return { valid: errors.length === 0, errors };
}

/**
 * Check if email already exists
 */
function checkEmailExists(email) {
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  return {
    exists: !!user,
    verified: user ? user.verified : false,
    userId: user ? user.id : undefined
  };
}

/**
 * Create a new company
 */
function createCompany(companyData) {
  try {
    const companyId = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
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
    return { success: false, error: error.message };
  }
}

/**
 * Create a new user
 */
function createUser(userData) {
  try {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const user = {
      id: userId,
      companyId: userData.companyId,
      email: userData.email,
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
    return { success: false, error: error.message };
  }
}

/**
 * Store verification token
 */
function storeVerificationToken(token) {
  verificationTokens.push(token);
}

/**
 * Check rate limit for signup attempts
 */
function checkRateLimit(identifier) {
  const now = Date.now();
  const attempts = signupAttempts.get(identifier);

  if (!attempts) {
    signupAttempts.set(identifier, { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  // Reset if more than cooldown period has passed
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
  signupAttempts.set(identifier, attempts);
  
  return { allowed: true };
}

module.exports = async function handler(req, res) {
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
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Get client IP for rate limiting
  const clientIP = req.socket?.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';

  // Rate limiting check
  const rateLimitResult = checkRateLimit(clientIP);
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      success: false,
      message: `Too many signup attempts. Please wait ${Math.ceil(rateLimitResult.waitTime / 1000)} seconds before trying again.`
    });
  }

  try {
    const requestData = req.body;

    // Validate request data
    const validation = validateSignupRequest(requestData);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Normalize email
    const normalizedEmail = requestData.email.toLowerCase().trim();

    // Check if email already exists
    const emailCheck = checkEmailExists(normalizedEmail);
    if (emailCheck.exists) {
      if (emailCheck.verified) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please sign in instead.'
        });
      } else {
        return res.status(409).json({
          success: false,
          message: 'An account with this email exists but is not verified. Please check your email for the verification link.'
        });
      }
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(requestData.password, saltRounds);

    // Create company first (since user needs companyId)
    const tempUserId = `temp_${Date.now()}`;
    const companyResult = createCompany({
      name: requestData.companyName,
      contactEmail: normalizedEmail,
      ownerUserId: tempUserId
    });

    if (!companyResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create company. Please try again.'
      });
    }

    // Create user
    const userResult = createUser({
      companyId: companyResult.companyId,
      email: normalizedEmail,
      firstName: requestData.firstName,
      surname: requestData.surname,
      position: requestData.position,
      passwordHash
    });

    if (!userResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account. Please try again.'
      });
    }

    // Generate verification token
    const tokenData = {
      id: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userResult.userId,
      tokenHash: Math.random().toString(36).substr(2, 32),
      purpose: 'email_verification',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      createdAt: new Date().toISOString()
    };

    storeVerificationToken(tokenData);

    // Create verification URL
    const baseUrl = process.env.APP_HOST || 'https://www.mokmzansibooks.com';
    const verifyUrl = `${baseUrl}/auth/verify-email?token=${tokenData.tokenHash}&uid=${userResult.userId}`;

    // For now, just return success without sending email
    console.log('Verification URL would be:', verifyUrl);

    // Success response
    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      data: {
        userId: userResult.userId,
        companyId: companyResult.companyId,
        email: normalizedEmail,
        firstName: requestData.firstName,
        companyName: requestData.companyName
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
};