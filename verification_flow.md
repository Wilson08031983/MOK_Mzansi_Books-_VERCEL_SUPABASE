# Verification Email Flow Implementation

## Overview

This document describes the complete verification email flow implementation for MOK Mzansi Books. The system creates a secure, tenant-aware verification process where each signup creates a new company/tenant, and users receive single-use verification emails.

## Architecture

### Data Model

The verification system uses the following data structures:

```typescript
interface User {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  surname: string;
  position: string;
  passwordHash: string;
  verified: boolean;
  verifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Company {
  id: string;
  name: string;
  ownerUserId: string;
  contactEmail: string;
  createdAt: string;
  updatedAt?: string;
}

interface VerificationToken {
  id: string;
  userId: string;
  tokenHash: string;
  purpose: 'email_verification' | 'password_reset';
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  event: string;
  userId?: string;
  companyId?: string;
  endpoint?: string;
  ipAddress?: string;
  userAgent?: string;
  resultCount?: number;
  meta: Record<string, any>;
  timestamp: string;
}
```

### Security Features

- **Cryptographically Secure Tokens**: 32-byte random tokens (256 bits of entropy)
- **Token Hashing**: SHA256 hashing for secure storage
- **Single-Use Tokens**: Tokens are marked as used after verification
- **Token Expiry**: 24-hour default expiry (configurable)
- **Rate Limiting**: 5 signup attempts per hour, 3 resend attempts per hour
- **Constant-Time Comparison**: Prevents timing attacks
- **Email Masking**: Prevents user enumeration in logs and UI

## API Endpoints

### POST /api/signup

Creates a new company and user account, sends verification email.

**Request Body:**
```json
{
  "firstName": "John",
  "surname": "Doe",
  "companyName": "Acme Corporation",
  "email": "john.doe@acme.com",
  "position": "CEO",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email to verify your account.",
  "userId": "user_1234567890_abc123",
  "companyId": "company_1234567890_def456"
}
```

### POST /api/verify-email

Verifies a user's email using the token from the verification email.

**Request Body:**
```json
{
  "token": "verification_token_id",
  "userId": "user_1234567890_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now sign in."
}
```

### POST /api/resend-verification

Resends a verification email to an existing user.

**Request Body:**
```json
{
  "email": "john.doe@acme.com"
}
```

**Response:**
```json
{
  "success": false,
  "message": "If an account with this email exists, a new verification email has been sent."
}
```

## Flow Implementation

### 1. User Signup

1. User submits signup form with company and personal details
2. Server validates input and checks for existing verified accounts
3. Server creates new company record with owner relationship
4. Server creates new user record with company association
5. Server generates secure verification token and stores hash
6. Server sends verification email via Postmark
7. Server logs all actions with structured JSON
8. User receives success message and is redirected to login

### 2. Email Verification

1. User clicks verification link in email
2. Frontend extracts token and user ID from URL parameters
3. Frontend calls verification API with token and user ID
4. Server validates token (not expired, not used, correct hash)
5. Server marks user as verified and token as used
6. Server invalidates other outstanding tokens for the user
7. Server logs successful verification
8. User receives success message and can now sign in

### 3. Resend Verification

1. User requests verification email resend
2. Server checks rate limiting (3 attempts per hour)
3. Server invalidates existing tokens for the user
4. Server generates new verification token
5. Server sends new verification email
6. Server logs resend attempt
7. User receives generic success message (prevents email enumeration)

## Security Implementation

### Token Generation
- Uses `crypto.randomBytes(32)` for 256 bits of entropy
- Base64URL encoding for URL safety
- SHA256 hashing for secure storage
- Constant-time comparison for validation

### Rate Limiting
- IP-based rate limiting for signup attempts (5/hour)
- Email-based rate limiting for resend attempts (3/hour)
- Automatic cleanup of old rate limit data

### Logging and Audit
- All major events logged with structured JSON
- Email events tracked (send attempts, delivery, bounces)
- User enumeration protection through generic messages
- Comprehensive audit trail for compliance

## Configuration

### Environment Variables

```env
# Postmark Configuration
POSTMARK_SERVER_TOKEN=your_postmark_server_token
POSTMARK_SENDER_EMAIL=noreply@mokmzansibooks.com
POSTMARK_SENDER_NAME="MOK Mzansi Books"

# Application Configuration
APP_HOST=http://localhost:8082
VERIFICATION_TOKEN_EXPIRY_HOURS=24
```

### Token Configuration

```typescript
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24; // Configurable
const TOKEN_LENGTH_BYTES = 32; // 256 bits of entropy
```

## Testing

### Local Development Setup

1. **Environment Setup:**
   ```bash
   # Install dependencies
   npm install bcryptjs @types/bcryptjs

   # Set up environment variables
   cp .env.example .env.local
   # Edit .env.local with Postmark test server token
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

3. **Test Signup Flow:**
   - Navigate to `/signup`
   - Fill out signup form
   - Check Postmark test inbox for verification email
   - Click verification link
   - Verify user can now sign in

### Postmark Test Server

- Use Postmark test server tokens for development
- Emails sent to test server appear in Postmark dashboard
- No actual emails are delivered to real addresses
- Perfect for testing the complete flow

## Deployment Considerations

### Production Environment

1. **Use Live Postmark Server:**
   - Replace test server token with live server token
   - Configure proper sender signature
   - Set up proper DKIM/SPF records

2. **Security Headers:**
   - Ensure HTTPS is enforced
   - Set up proper CSP headers
   - Configure HSTS

3. **Monitoring:**
   - Monitor verification email delivery rates
   - Track verification completion rates
   - Alert on unusual activity patterns

### Database Migration

For production deployment, migrate from localStorage to a proper database:

```sql
-- Users table
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  company_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  surname VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE companies (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_user_id VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Verification tokens table
CREATE TABLE verification_tokens (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  purpose ENUM('email_verification', 'password_reset') NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  event VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  company_id VARCHAR(255),
  endpoint VARCHAR(500),
  ip_address VARCHAR(45),
  user_agent TEXT,
  result_count INT,
  meta JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Common Issues

1. **Emails Not Being Sent:**
   - Check Postmark server token configuration
   - Verify Postmark account has sufficient credits
   - Check Postmark activity logs for errors

2. **Verification Links Not Working:**
   - Ensure APP_HOST is correctly configured
   - Check token expiry (default 24 hours)
   - Verify token hasn't been used already

3. **Rate Limiting Errors:**
   - Wait for rate limit cooldown period
   - Check server logs for rate limit hits
   - Consider adjusting rate limits for testing

### Debug Mode

Enable debug logging by setting environment variable:

```env
NODE_ENV=development
```

This will log detailed information about:
- Token generation and validation
- Email sending attempts
- Rate limiting decisions
- Audit events

## Performance Considerations

- **Token Cleanup:** Implement periodic cleanup of expired tokens
- **Rate Limit Storage:** Consider Redis for production rate limiting
- **Email Queue:** Use job queue for email sending in high-volume scenarios
- **Database Indexing:** Index commonly queried fields (email, company_id, etc.)

## Compliance

This implementation follows security best practices:

- **GDPR Compliance:** Users can request account deletion
- **Data Minimization:** Only necessary data is collected and stored
- **Audit Trail:** All actions are logged for compliance purposes
- **Security Headers:** Proper security headers prevent common attacks
- **Email Security:** Verification emails include security notices

## Future Enhancements

1. **Multi-Factor Authentication:** Add TOTP support
2. **Email Templates:** Customizable email templates per company
3. **Bulk Operations:** Admin tools for managing multiple users
4. **Analytics:** Track verification success rates and patterns
5. **Mobile App Support:** API for mobile verification flows
