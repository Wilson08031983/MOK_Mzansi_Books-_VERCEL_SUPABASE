import { AuditLog, EmailLog } from '@/types/auth';

// Storage keys
const AUDIT_LOG_KEY = 'audit_logs';
const EMAIL_LOG_KEY = 'email_logs';

/**
 * Logs an audit event with structured JSON
 * @param event Event name
 * @param userId User ID (optional)
 * @param companyId Company ID (optional)
 * @param endpoint API endpoint (optional)
 * @param ipAddress IP address (optional)
 * @param userAgent User agent (optional)
 * @param resultCount Number of results (optional)
 * @param meta Additional metadata
 */
export function logAuditEvent(
  event: string,
  userId?: string,
  companyId?: string,
  endpoint?: string,
  ipAddress?: string,
  userAgent?: string,
  resultCount?: number,
  meta: Record<string, any> = {}
): void {
  try {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event,
      userId,
      companyId,
      endpoint,
      ipAddress,
      userAgent,
      resultCount,
      meta: sanitizeMetaForLogging(meta),
      timestamp: new Date().toISOString()
    };

    // Only store to localStorage if we're in a browser environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // Get existing audit logs
      const existingLogs = getStoredAuditLogs();

      // Add new log to beginning of array
      existingLogs.unshift(auditLog);

      // Keep only last 1000 logs to prevent storage bloat
      const trimmedLogs = existingLogs.slice(0, 1000);

      // Store back to localStorage
      localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(trimmedLogs));
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUDIT] ${event}:`, {
        userId: userId ? maskString(userId) : undefined,
        companyId: companyId ? maskString(companyId) : undefined,
        endpoint,
        meta: sanitizeMetaForLogging(meta)
      });
    }
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Logs an email event
 * @param event Email event type
 * @param userId User ID
 * @param companyId Company ID
 * @param templateId Email template ID
 * @param postmarkMessageId Postmark message ID (optional)
 * @param status Email status
 * @param meta Additional metadata
 */
export function logEmailEvent(
  event: 'send_attempt' | 'delivered' | 'bounced' | 'opened' | 'clicked',
  userId: string,
  companyId: string,
  templateId: string,
  postmarkMessageId?: string,
  status: 'success' | 'error' | 'pending' = 'pending',
  meta: Record<string, any> = {}
): void {
  try {
    const emailLog: EmailLog = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event,
      userId,
      companyId,
      templateId,
      postmarkMessageId,
      status,
      meta: {
        ...meta,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    // Only store to localStorage if we're in a browser environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // Get existing email logs
      const existingLogs = getStoredEmailLogs();

      // Add new log to beginning of array
      existingLogs.unshift(emailLog);

      // Keep only last 1000 logs to prevent storage bloat
      const trimmedLogs = existingLogs.slice(0, 1000);

      // Store back to localStorage
      localStorage.setItem(EMAIL_LOG_KEY, JSON.stringify(trimmedLogs));
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[EMAIL] ${event}:`, {
        userId: maskString(userId),
        companyId: maskString(companyId),
        templateId,
        status,
        postmarkMessageId: postmarkMessageId ? maskString(postmarkMessageId, 8) : undefined
      });
    }
  } catch (error) {
    console.error('Failed to log email event:', error);
  }
}

/**
 * Gets all audit logs
 * @returns Array of audit logs
 */
export function getStoredAuditLogs(): AuditLog[] {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return [];
    }
    const logs = localStorage.getItem(AUDIT_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    return [];
  }
}

/**
 * Gets all email logs
 * @returns Array of email logs
 */
export function getStoredEmailLogs(): EmailLog[] {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return [];
    }
    const logs = localStorage.getItem(EMAIL_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Failed to get email logs:', error);
    return [];
  }
}

/**
 * Gets audit logs for a specific user
 * @param userId User ID
 * @returns Array of audit logs for the user
 */
export function getUserAuditLogs(userId: string): AuditLog[] {
  const allLogs = getStoredAuditLogs();
  return allLogs.filter(log => log.userId === userId);
}

/**
 * Gets email logs for a specific user
 * @param userId User ID
 * @returns Array of email logs for the user
 */
export function getUserEmailLogs(userId: string): EmailLog[] {
  const allLogs = getStoredEmailLogs();
  return allLogs.filter(log => log.userId === userId);
}

/**
 * Gets audit logs for a specific company
 * @param companyId Company ID
 * @returns Array of audit logs for the company
 */
export function getCompanyAuditLogs(companyId: string): AuditLog[] {
  const allLogs = getStoredAuditLogs();
  return allLogs.filter(log => log.companyId === companyId);
}

/**
 * Gets recent audit logs (last N logs)
 * @param limit Number of logs to return
 * @returns Array of recent audit logs
 */
export function getRecentAuditLogs(limit: number = 50): AuditLog[] {
  const allLogs = getStoredAuditLogs();
  return allLogs.slice(0, limit);
}

/**
 * Clears all audit logs (use with caution)
 */
export function clearAuditLogs(): void {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(AUDIT_LOG_KEY);
    }
    logAuditEvent('audit_logs_cleared', undefined, undefined, 'system', undefined, undefined, undefined, {
      reason: 'manual_clear'
    });
  } catch (error) {
    console.error('Failed to clear audit logs:', error);
  }
}

/**
 * Clears all email logs (use with caution)
 */
export function clearEmailLogs(): void {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(EMAIL_LOG_KEY);
    }
    logAuditEvent('email_logs_cleared', undefined, undefined, 'system', undefined, undefined, undefined, {
      reason: 'manual_clear'
    });
  } catch (error) {
    console.error('Failed to clear email logs:', error);
  }
}

/**
 * Masks sensitive strings for logging
 * @param str String to mask
 * @param visibleChars Number of characters to leave visible (default: 3)
 * @returns Masked string
 */
export function maskString(str: string, visibleChars: number = 3): string {
  if (!str || str.length <= visibleChars) {
    return str;
  }

  const visible = str.substring(0, visibleChars);
  const masked = '*'.repeat(str.length - visibleChars);
  return `${visible}${masked}`;
}

/**
 * Sanitizes metadata for safe logging (removes sensitive data)
 * @param meta Metadata object
 * @returns Sanitized metadata
 */
export function sanitizeMetaForLogging(meta: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'hash'];
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(meta)) {
    if (sensitiveKeys.some(sensitiveKey => key.toLowerCase().includes(sensitiveKey))) {
      sanitized[key] = typeof value === 'string' ? maskString(value) : '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Exports logs for analysis (returns JSON string)
 * @param includeEmailLogs Whether to include email logs
 * @returns JSON string of logs
 */
export function exportLogs(includeEmailLogs: boolean = false): string {
  const auditLogs = getStoredAuditLogs();
  const logs: any = { auditLogs };

  if (includeEmailLogs) {
    logs.emailLogs = getStoredEmailLogs();
  }

  return JSON.stringify(logs, null, 2);
}
