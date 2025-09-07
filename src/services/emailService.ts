// Client-side email service that delegates to secure server API routes
// No API keys are used on the client. All emails are sent by server handlers under /api/emails/*

import mockEmailService from './mockEmailService';

interface QuotationEmailOptions {
  to: string;
  subject?: string;
  quotationNumber: string;
  clientName: string;
  pdfAttachment: Blob;
  pdfFileName: string;
}

interface EmailOptions {
  to: string;
  subject?: string;
  firstName?: string;
  lastName?: string;
  verifyLink?: string;
}

interface PasswordResetEmailOptions {
  to: string;
  subject?: string;
  resetToken: string;
  firstName?: string;
}

interface InvitationEmailOptions {
  to: string;
  subject?: string;
  inviterName?: string;
  email: string;
  role: string;
  invitationLink: string;
  companyName?: string;
}

interface DeletionEmailOptions {
  to: string;
  subject?: string;
  firstName?: string;
  companyName?: string;
}

interface LoginNotificationOptions {
  to: string;
  deviceName: string;
  browser: string;
  location: string;
  timestamp: string;
}

interface GracePeriodReminderOptions {
  to: string;
  userName: string;
  companyName?: string;
  daysRemaining: number;
  gracePeriodEndDate: string;
  paymentLink?: string;
  accountManagementLink?: string;
  lastPaymentAttempt?: string;
  amountDue: number;
  currency?: string;
  subject?: string;
}

interface AccountLockoutOptions {
  to: string;
  userName: string;
  companyName?: string;
  lockoutDate: string;
  gracePeriodEndDate: string;
  amountDue: number;
  currency?: string;
  paymentLink?: string;
  accountManagementLink?: string;
  supportEmail?: string;
  supportPhone?: string;
  daysPastDue: number;
  subject?: string;
}

const API_BASE = '/api/emails';

async function postJson<T = any>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Email API error ${res.status}: ${text || res.statusText}`);
  }
  // Some routes may return no JSON body
  try {
    return (await res.json()) as T;
  } catch {
    return {} as T;
  }
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  // btoa expects binary string
  return btoa(binary);
}

export const sendConfirmationEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const { to, subject, firstName = 'there', lastName = '', verifyLink } = options;
    if (!to) throw new Error('Missing recipient email');

    await postJson('confirmation', { to, subject, firstName, lastName, verifyLink });
    return true;
  } catch (error: any) {
    console.error('Error sending confirmation email:', error);
    // Dev fallback: use mock email service if API route isn't available locally
    if (import.meta?.env?.DEV) {
      console.warn('Dev fallback: using mock email service for confirmation email');
      try {
        await mockEmailService.sendConfirmationEmail(options as any);
        return true;
      } catch (e) {
        console.error('Mock confirmation email failed:', e);
      }
    }
    return false;
  }
};

export const sendPasswordResetEmail = async (options: PasswordResetEmailOptions): Promise<boolean> => {
  try {
    const { to, subject, resetToken, firstName = 'there' } = options;
    if (!to || !resetToken) throw new Error('Missing required parameters');

    await postJson('password-reset', { to, subject, resetToken, firstName });
    return true;
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    if (import.meta?.env?.DEV) {
      console.warn('Dev fallback: using mock email service for password reset');
      try {
        await mockEmailService.sendPasswordResetEmail(options as any);
        return true;
      } catch (e) {
        console.error('Mock password reset email failed:', e);
      }
    }
    return false;
  }
};

export const sendInvitationEmail = async (options: InvitationEmailOptions): Promise<boolean> => {
  try {
    const { to, subject, inviterName = 'Admin', email, role, invitationLink, companyName = 'MOK Mzansi Books' } = options;
    if (!to || !email || !role || !invitationLink) throw new Error('Missing required parameters');

    await postJson('invitation', { to, subject, inviterName, email, role, invitationLink, companyName });
    return true;
  } catch (error: any) {
    console.error('Error sending invitation email:', error);
    if (import.meta?.env?.DEV) {
      console.warn('Dev fallback: using mock email service for invitation email');
      try {
        await mockEmailService.sendInvitationEmail(options as any);
        return true;
      } catch (e) {
        console.error('Mock invitation email failed:', e);
      }
    }
    return false;
  }
};

export const sendAccountDeletionEmail = async (options: DeletionEmailOptions): Promise<boolean> => {
  try {
    const { to, subject, firstName = 'there', companyName = 'MOK Mzansi Books' } = options;
    if (!to) throw new Error('Missing recipient email');

    await postJson('account-deletion', { to, subject, firstName, companyName });
    return true;
  } catch (error) {
    console.error('Error sending account deletion email:', error);
    return false;
  }
};

export const sendQuotationEmail = async (options: QuotationEmailOptions): Promise<boolean> => {
  try {
    const { to, subject, quotationNumber, clientName, pdfAttachment, pdfFileName } = options;
    if (!to || !quotationNumber || !clientName || !pdfAttachment || !pdfFileName) {
      throw new Error('Missing required parameters for quotation email');
    }

    const arrayBuffer = await pdfAttachment.arrayBuffer();
    const pdfBase64 = arrayBufferToBase64(arrayBuffer);

    await postJson('quotation', { to, subject, quotationNumber, clientName, pdfBase64, pdfFileName });
    return true;
  } catch (error: any) {
    console.error('Error sending quotation email:', error);
    if (import.meta?.env?.DEV) {
      console.warn('Dev fallback: using mock email service for quotation email');
      try {
        await mockEmailService.sendQuotationEmail(options as any);
        return true;
      } catch (e) {
        console.error('Mock quotation email failed:', e);
      }
    }
    return false;
  }
};

export const sendLoginNotificationEmail = async (options: LoginNotificationOptions): Promise<boolean> => {
  try {
    const { to, deviceName, browser, location, timestamp } = options;
    if (!to || !deviceName || !browser || !location || !timestamp) throw new Error('Missing required parameters');

    await postJson('login-notification', { to, deviceName, browser, location, timestamp });
    return true;
  } catch (error: any) {
    // In dev, this route may not exist under Vite; prefer a warning and fallback
    const log = import.meta?.env?.DEV ? console.warn : console.error;
    log('Error sending login notification email:', error);
    // Dev fallback: use the local mock service when API routes are not available in Vite dev
    if (import.meta?.env?.DEV) {
      console.warn('Dev fallback: using mock email service for login notification');
      try {
        await mockEmailService.sendLoginNotificationEmail(options as any);
        return true;
      } catch (e) {
        console.error('Mock login notification email failed:', e);
      }
    }
    return false;
  }
};

export const sendGracePeriodReminderEmail = async (options: GracePeriodReminderOptions): Promise<boolean> => {
  try {
    const { to, userName, daysRemaining, gracePeriodEndDate, amountDue } = options;
    if (!to || !userName || daysRemaining === undefined || !gracePeriodEndDate || amountDue === undefined) {
      throw new Error('Missing required parameters for grace period reminder email');
    }

    await postJson('grace-period-reminder', options);
    return true;
  } catch (error) {
    console.error('Error sending grace period reminder email:', error);
    return false;
  }
};

export const sendAccountLockoutEmail = async (options: AccountLockoutOptions): Promise<boolean> => {
  try {
    const { to, userName, lockoutDate, gracePeriodEndDate, amountDue, daysPastDue } = options;
    if (!to || !userName || !lockoutDate || !gracePeriodEndDate || amountDue === undefined || daysPastDue === undefined) {
      throw new Error('Missing required parameters for account lockout email');
    }

    await postJson('account-lockout', options);
    return true;
  } catch (error) {
    console.error('Error sending account lockout email:', error);
    return false;
  }
};

export default {
  sendConfirmationEmail,
  sendPasswordResetEmail,
  sendInvitationEmail,
  sendQuotationEmail,
  sendAccountDeletionEmail,
  sendLoginNotificationEmail,
  sendGracePeriodReminderEmail,
  sendAccountLockoutEmail,
};
