import crypto from 'crypto';
import { VerificationToken } from '@/types/auth';

// Configuration
const VERIFICATION_TOKEN_EXPIRY_HOURS = parseInt(process.env.VERIFICATION_TOKEN_EXPIRY_HOURS || '24');
const TOKEN_LENGTH_BYTES = 32; // 32 bytes = 256 bits of entropy

/**
 * Generates a cryptographically secure, URL-safe random token
 * @returns Base64URL-encoded token string (≥32 bytes)
 */
export function generateSecureToken(): string {
  try {
    // Generate 32 random bytes (256 bits of entropy)
    const bytes = crypto.randomBytes(TOKEN_LENGTH_BYTES);
    // Convert to base64url format (URL-safe)
    return bytes.toString('base64url');
  } catch (error) {
    console.error('Failed to generate secure token:', error);
    // Fallback to less secure method
    return crypto.randomBytes(TOKEN_LENGTH_BYTES).toString('base64').replace(/[+/=]/g, (m) => {
      return m === '+' ? '-' : m === '/' ? '_' : '';
    });
  }
}

/**
 * Hashes a token using SHA256 for secure storage
 * @param token Raw token string
 * @returns SHA256 hash as hex string
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Constant-time string comparison to prevent timing attacks
 * @param a First string
 * @param b Second string
 * @returns True if strings are equal
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Creates a verification token for a user
 * @param userId User ID
 * @param purpose Token purpose (email_verification, password_reset)
 * @returns Verification token object
 */
export function createVerificationToken(userId: string, purpose: 'email_verification' | 'password_reset' = 'email_verification'): VerificationToken {
  const rawToken = generateSecureToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  return {
    id: `vt_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
    userId,
    tokenHash,
    purpose,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString()
  };
}

/**
 * Validates a verification token
 * @param rawToken Raw token from user
 * @param tokenHash Stored token hash
 * @param expiresAt Token expiry date
 * @param usedAt Token used date
 * @returns Validation result
 */
export function validateToken(
  rawToken: string,
  tokenHash: string,
  expiresAt: string,
  usedAt?: string
): { valid: boolean; reason?: string } {
  // Check if token has been used
  if (usedAt) {
    return { valid: false, reason: 'Token has already been used' };
  }

  // Check if token has expired
  const expiryDate = new Date(expiresAt);
  if (expiryDate < new Date()) {
    return { valid: false, reason: 'Token has expired' };
  }

  // Compute hash of provided token and compare with stored hash
  const computedHash = hashToken(rawToken);
  const isValid = secureCompare(computedHash, tokenHash);

  if (!isValid) {
    return { valid: false, reason: 'Invalid token' };
  }

  return { valid: true };
}

/**
 * Marks a token as used
 * @param tokenId Token ID
 * @param usedAt Used timestamp (defaults to now)
 * @returns Updated token object
 */
export function markTokenAsUsed(token: VerificationToken, usedAt?: string): VerificationToken {
  return {
    ...token,
    usedAt: usedAt || new Date().toISOString()
  };
}

/**
 * Checks if a token is expired
 * @param expiresAt Token expiry date
 * @returns True if expired
 */
export function isTokenExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

/**
 * Gets the remaining time until token expires
 * @param expiresAt Token expiry date
 * @returns Remaining time in milliseconds, or 0 if expired
 */
export function getTokenTimeRemaining(expiresAt: string): number {
  const expiryTime = new Date(expiresAt).getTime();
  const currentTime = Date.now();
  return Math.max(0, expiryTime - currentTime);
}

/**
 * Formats remaining time as human-readable string
 * @param milliseconds Time in milliseconds
 * @returns Formatted string (e.g., "2h 30m 45s")
 */
export function formatTimeRemaining(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.join(' ') || '0s';
}
