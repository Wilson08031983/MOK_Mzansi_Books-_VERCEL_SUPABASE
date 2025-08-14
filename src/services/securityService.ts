/**
 * Security Service
 * 
 * Provides security settings persistence, enforcement, and validation
 * for the Security Settings Tab functionality.
 */

import { safeLocalStorage } from '@/utils/safeAccess';
// Removed unused getCurrentUser import
import { sendLoginNotificationEmail } from '@/services/emailService';

// Types for security settings
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  passwordExpiryDays: number;
  sessionTimeoutMinutes: number;
  requireStrongPasswords: boolean;
  loginNotifications: boolean;
  deviceManagement: boolean;
}

export interface PasswordComplexity {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export interface DeviceSession {
  id: string;
  deviceName: string;
  lastActive: string;
  location: string;
  browser: string;
  ipAddress?: string;
  userAgent?: string;
  current?: boolean;
}

// Default security settings
const defaultSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  passwordExpiryDays: 90,
  sessionTimeoutMinutes: 30,
  requireStrongPasswords: true,
  loginNotifications: true,
  deviceManagement: true
};

const defaultPasswordComplexity: PasswordComplexity = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

// Storage keys
const SECURITY_SETTINGS_KEY = 'securitySettings';
const PASSWORD_COMPLEXITY_KEY = 'passwordComplexity';
const DEVICE_SESSIONS_KEY = 'deviceSessions';
const LAST_ACTIVITY_KEY = 'lastActivity';
const PASSWORD_HISTORY_KEY = 'passwordHistory';

// Get security settings
export const getSecuritySettings = (): SecuritySettings => {
  return safeLocalStorage.getItem<SecuritySettings>(SECURITY_SETTINGS_KEY, defaultSecuritySettings);
};

// Save security settings
export const saveSecuritySettings = (settings: SecuritySettings): boolean => {
  try {
    safeLocalStorage.setItem(SECURITY_SETTINGS_KEY, settings);
    console.log('Security settings saved:', settings);
    return true;
  } catch (error) {
    console.error('Error saving security settings:', error);
    return false;
  }
};

// Get password complexity settings
export const getPasswordComplexity = (): PasswordComplexity => {
  return safeLocalStorage.getItem<PasswordComplexity>(PASSWORD_COMPLEXITY_KEY, defaultPasswordComplexity);
};

// Save password complexity settings
export const savePasswordComplexity = (complexity: PasswordComplexity): boolean => {
  try {
    safeLocalStorage.setItem(PASSWORD_COMPLEXITY_KEY, complexity);
    console.log('Password complexity settings saved:', complexity);
    return true;
  } catch (error) {
    console.error('Error saving password complexity settings:', error);
    return false;
  }
};

// Validate password against complexity requirements
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const complexity = getPasswordComplexity();
  const errors: string[] = [];

  if (password.length < complexity.minLength) {
    errors.push(`Password must be at least ${complexity.minLength} characters long`);
  }

  if (complexity.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (complexity.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (complexity.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (complexity.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Session timeout management
export const updateLastActivity = (): void => {
  try {
    safeLocalStorage.setItem(LAST_ACTIVITY_KEY, Date.now());
  } catch (error) {
    console.error('Error updating last activity:', error);
  }
};

export const getLastActivity = (): number => {
  return safeLocalStorage.getItem<number>(LAST_ACTIVITY_KEY, Date.now());
};

export const isSessionExpired = (): boolean => {
  const settings = getSecuritySettings();
  const lastActivity = getLastActivity();
  const timeoutMs = settings.sessionTimeoutMinutes * 60 * 1000;
  const elapsed = Date.now() - lastActivity;
  
  return elapsed > timeoutMs;
};

// Device session management
export const getCurrentDeviceSession = (): DeviceSession => {
  const userAgent = navigator.userAgent;
  const deviceName = getDeviceName(userAgent);
  const browser = getBrowserName(userAgent);
  
  return {
    id: `device-${Date.now()}`,
    deviceName,
    lastActive: new Date().toISOString(),
    location: 'Johannesburg, South Africa', // Would be determined by IP geolocation in production
    browser,
    userAgent,
    current: true
  };
};

export const getDeviceSessions = (): DeviceSession[] => {
  return safeLocalStorage.getItem<DeviceSession[]>(DEVICE_SESSIONS_KEY, []);
};

export const addDeviceSession = (session: DeviceSession): void => {
  try {
    const sessions = getDeviceSessions();
    // Mark all existing sessions as not current
    sessions.forEach(s => s.current = false);
    // Add new session
    sessions.push(session);
    // Keep only last 10 sessions
    const recentSessions = sessions.slice(-10);
    safeLocalStorage.setItem(DEVICE_SESSIONS_KEY, recentSessions);
  } catch (error) {
    console.error('Error adding device session:', error);
  }
};

export const removeDeviceSession = (sessionId: string): boolean => {
  try {
    const sessions = getDeviceSessions();
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    safeLocalStorage.setItem(DEVICE_SESSIONS_KEY, filteredSessions);
    return true;
  } catch (error) {
    console.error('Error removing device session:', error);
    return false;
  }
};

// Login notification
export const sendLoginNotification = async (userEmail: string, deviceInfo: DeviceSession): Promise<boolean> => {
  const settings = getSecuritySettings();
  
  if (!settings.loginNotifications) {
    return true; // Notifications disabled
  }

  try {
    return await sendLoginNotificationEmail({
      to: userEmail,
      deviceName: deviceInfo.deviceName,
      browser: deviceInfo.browser,
      location: deviceInfo.location,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending login notification:', error);
    return false;
  }
};

// Two-factor authentication helpers
export const generateTwoFactorSecret = (): string => {
  // Generate a simple 6-digit code for demo purposes
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const validateTwoFactorCode = (code: string, expectedCode: string): boolean => {
  return code === expectedCode;
};

// Store 2FA code temporarily (in production, this would be more secure)
export const storeTwoFactorCode = (email: string, code: string): void => {
  try {
    const codes = safeLocalStorage.getItem<Record<string, { code: string; expiry: number }>>('twoFactorCodes', {});
    codes[email] = {
      code,
      expiry: Date.now() + (5 * 60 * 1000) // 5 minutes
    };
    safeLocalStorage.setItem('twoFactorCodes', codes);
  } catch (error) {
    console.error('Error storing 2FA code:', error);
  }
};

export const getTwoFactorCode = (email: string): string | null => {
  try {
    const codes = safeLocalStorage.getItem<Record<string, { code: string; expiry: number }>>('twoFactorCodes', {});
    const entry = codes[email];
    
    if (!entry || Date.now() > entry.expiry) {
      return null;
    }
    
    return entry.code;
  } catch (error) {
    console.error('Error getting 2FA code:', error);
    return null;
  }
};

// Password history management
export const addPasswordToHistory = (email: string, passwordHash: string): void => {
  try {
    const history = safeLocalStorage.getItem<Record<string, string[]>>(PASSWORD_HISTORY_KEY, {});
    if (!history[email]) {
      history[email] = [];
    }
    
    history[email].unshift(passwordHash);
    // Keep only last 5 passwords
    history[email] = history[email].slice(0, 5);
    
    safeLocalStorage.setItem(PASSWORD_HISTORY_KEY, history);
  } catch (error) {
    console.error('Error adding password to history:', error);
  }
};

export const isPasswordReused = (email: string, passwordHash: string): boolean => {
  try {
    const history = safeLocalStorage.getItem<Record<string, string[]>>(PASSWORD_HISTORY_KEY, {});
    const userHistory = history[email] || [];
    return userHistory.includes(passwordHash);
  } catch (error) {
    console.error('Error checking password reuse:', error);
    return false;
  }
};

// Utility functions
const getDeviceName = (userAgent: string): string => {
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Android')) return 'Android Device';
  if (userAgent.includes('Mac')) return 'MacBook';
  if (userAgent.includes('Windows')) return 'Windows PC';
  return 'Unknown Device';
};

const getBrowserName = (userAgent: string): string => {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown Browser';
};

// Security service object
export const securityService = {
  getSecuritySettings,
  saveSecuritySettings,
  getPasswordComplexity,
  savePasswordComplexity,
  validatePassword,
  updateLastActivity,
  getLastActivity,
  isSessionExpired,
  getCurrentDeviceSession,
  getDeviceSessions,
  addDeviceSession,
  removeDeviceSession,
  sendLoginNotification,
  generateTwoFactorSecret,
  validateTwoFactorCode,
  storeTwoFactorCode,
  getTwoFactorCode,
  addPasswordToHistory,
  isPasswordReused
};

export default securityService;