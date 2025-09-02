import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import type { FC } from 'react';
import { WelcomeEmail } from '../templates/WelcomeEmail';
import { InvoiceEmail } from '../templates/InvoiceEmail';
import { QuotationEmail } from '../templates/QuotationEmail';
import { InvitationEmail } from '../templates/InvitationEmail';
import { TrialEndingEmail } from '../templates/TrialEndingEmail';
import { PaymentReminderEmail } from '../templates/PaymentReminderEmail';
import { OverdueInvoiceEmail } from '../templates/OverdueInvoiceEmail';

// Define the props type for WelcomeEmail
interface WelcomeEmailProps {
  userName: string;
  loginLink: string;
  supportEmail: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  metadata?: Record<string, any>;
}

interface SentEmail extends EmailOptions {
  id: string;
  sentAt: Date;
  status: 'sent' | 'failed' | 'pending';
  metadata?: Record<string, any>;
}

class EmailService {
  private static STORAGE_KEY = 'mokmzansibooks_emails';

  /**
   * Convert HTML to plain text
   */
  private static htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ')     // Collapse multiple spaces
      .trim();                  // Trim leading/trailing spaces
  }

  /**
   * Send a welcome email to a new user
   */
  /**
   * Send an invoice email to a client
   */
  static async sendInvoiceEmail(
    to: string,
    clientName: string,
    invoiceNumber: string,
    invoiceDate: string,
    dueDate: string,
    amountDue: string,
    invoiceLink: string,
    companyName: string,
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: string;
      amount: string;
    }>,
    subtotal: string,
    tax: string,
    total: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const subject = `Invoice #${invoiceNumber} from ${companyName}`;
      const InvoiceEmailComponent = InvoiceEmail as any; // Use 'any' to bypass type checking for dynamic props
      
      const html = renderToStaticMarkup(
        React.createElement(InvoiceEmailComponent, {
          clientName,
          invoiceNumber,
          invoiceDate,
          dueDate,
          amountDue,
          invoiceLink,
          companyName,
          items,
          subtotal,
          tax,
          total,
          notes
        })
      );

      // For local development, we'll log the email instead of sending it
      if (process.env.NODE_ENV === 'development') {
        console.log('=== INVOICE EMAIL ===');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('HTML Content:', html);
        console.log('=====================');
      }

      // Store the email in localStorage for development purposes
      await this.storeEmailLocally({
        to,
        subject,
        html,
        text: this.htmlToText(html),
        metadata: {
          type: 'invoice',
          invoiceNumber,
          clientName,
          amountDue
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to send invoice email:', error);
      return false;
    }
  }

  /**
   * Send a team invitation email to a user
   */
  static async sendTeamInvitationEmail(params: {
    to: string;
    recipientName?: string;
    recipientEmail: string;
    inviterName: string;
    role: string;
    invitationLink: string;
    companyName: string;
    companyEmail?: string;
    companyPhone?: string;
    companyWebsite?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    addressLine4?: string;
    logoUrl?: string;
    stampUrl?: string;
    signatureUrl?: string;
  }): Promise<boolean> {
    try {
      const subject = `Invitation to join ${params.companyName}`;
      const InvitationEmailComponent = InvitationEmail as any;

      const html = renderToStaticMarkup(
        React.createElement(InvitationEmailComponent, {
          ...params
        })
      );

      if (process.env.NODE_ENV === 'development') {
        console.log('=== TEAM INVITATION EMAIL ===');
        console.log(`To: ${params.to}`);
        console.log(`Subject: ${subject}`);
        console.log('HTML Content:', html);
        console.log('=============================');
      }

      await this.storeEmailLocally({
        to: params.to,
        subject,
        html,
        text: this.htmlToText(html),
        metadata: {
          type: 'team_invitation',
          recipientEmail: params.recipientEmail,
          inviterName: params.inviterName,
          role: params.role,
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to send team invitation email:', error);
      return false;
    }
  }

  /**
   * Send a welcome email to a new user
   */
  static async sendWelcomeEmail(
    to: string,
    userName: string,
    loginLink: string = 'https://app.mokmzansibooks.com/login'
  ): Promise<boolean> {
    try {
      const subject = 'Welcome to MOK Mzansi Books!';
      const WelcomeEmailComponent = WelcomeEmail as FC<WelcomeEmailProps>;
      
      const html = renderToStaticMarkup(
        React.createElement(WelcomeEmailComponent, {
          userName,
          loginLink,
          supportEmail: 'support@mokmzansibooks.com'
        })
      );

      const email: EmailOptions = {
        to,
        subject,
        html,
        metadata: {
          type: 'welcome',
          userName,
          sentToNewUser: true
        }
      };

      // In a real implementation, this would send the email via ReSend
      // For now, we'll just store it locally
      return await this.storeEmailLocally(email);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  /**
   * Send a trial ending reminder or expiration email
   */
  static async sendTrialEndingEmail(params: {
    to: string;
    userName: string;
    daysLeft: number; // <=0 means expired
    upgradeLink?: string;
  }): Promise<boolean> {
    try {
      const subject = params.daysLeft <= 0
        ? 'Your MOK Mzansi Books trial has ended'
        : `Your MOK Mzansi Books trial ends in ${params.daysLeft} day${Math.abs(params.daysLeft) === 1 ? '' : 's'}`;
      const TrialEndingEmailComponent = TrialEndingEmail as any;

      const html = renderToStaticMarkup(
        React.createElement(TrialEndingEmailComponent, {
          userName: params.userName,
          daysLeft: params.daysLeft,
          upgradeLink: params.upgradeLink ?? 'https://app.mokmzansibooks.com/pricing',
          supportEmail: 'support@mokmzansibooks.com'
        })
      );

      if (process.env.NODE_ENV === 'development') {
        console.log('=== TRIAL ENDING EMAIL ===');
        console.log(`To: ${params.to}`);
        console.log(`Subject: ${subject}`);
        console.log('HTML Content:', html);
        console.log('==========================');
      }

      return await this.storeEmailLocally({
        to: params.to,
        subject,
        html,
        text: this.htmlToText(html),
        metadata: {
          type: 'trial_ending',
          daysLeft: params.daysLeft,
          userName: params.userName,
        }
      });
    } catch (error) {
      console.error('Error sending trial ending email:', error);
      return false;
    }
  }

  /**
   * Send an invoice payment reminder email (before due date)
   */
  static async sendInvoicePaymentReminderEmail(params: {
    to: string;
    clientName: string;
    invoiceNumber: string;
    dueDate: string;
    amountDue: string;
    invoiceLink: string;
    daysUntilDue?: number;
  }): Promise<boolean> {
    try {
      const subject = params.daysUntilDue && params.daysUntilDue > 0
        ? `Reminder: Invoice #${params.invoiceNumber} due in ${params.daysUntilDue} day${params.daysUntilDue === 1 ? '' : 's'}`
        : `Payment Reminder: Invoice #${params.invoiceNumber} due ${params.dueDate}`;

      const PaymentReminderEmailComponent = PaymentReminderEmail as any;
      const html = renderToStaticMarkup(
        React.createElement(PaymentReminderEmailComponent, {
          clientName: params.clientName,
          invoiceNumber: params.invoiceNumber,
          dueDate: params.dueDate,
          amountDue: params.amountDue,
          invoiceLink: params.invoiceLink
        })
      );

      if (process.env.NODE_ENV === 'development') {
        console.log('=== INVOICE PAYMENT REMINDER EMAIL ===');
        console.log(`To: ${params.to}`);
        console.log(`Subject: ${subject}`);
        console.log('HTML Content:', html);
        console.log('=====================================');
      }

      return await this.storeEmailLocally({
        to: params.to,
        subject,
        html,
        text: this.htmlToText(html),
        metadata: {
          type: 'invoice_payment_reminder',
          invoiceNumber: params.invoiceNumber,
          clientName: params.clientName,
          amountDue: params.amountDue,
          dueDate: params.dueDate,
          daysUntilDue: params.daysUntilDue ?? null
        }
      });
    } catch (error) {
      console.error('Failed to send invoice payment reminder email:', error);
      return false;
    }
  }

  /**
   * Send an overdue invoice email (after due date)
   */
  static async sendOverdueInvoiceEmail(params: {
    to: string;
    clientName: string;
    invoiceNumber: string;
    dueDate: string;
    amountDue: string;
    invoiceLink: string;
    daysOverdue: number;
  }): Promise<boolean> {
    try {
      const subject = `Overdue: Invoice #${params.invoiceNumber} is ${params.daysOverdue} day${Math.abs(params.daysOverdue) === 1 ? '' : 's'} overdue`;

      const OverdueInvoiceEmailComponent = OverdueInvoiceEmail as any;
      const html = renderToStaticMarkup(
        React.createElement(OverdueInvoiceEmailComponent, {
          clientName: params.clientName,
          invoiceNumber: params.invoiceNumber,
          dueDate: params.dueDate,
          amountDue: params.amountDue,
          invoiceLink: params.invoiceLink,
          daysOverdue: params.daysOverdue
        })
      );

      if (process.env.NODE_ENV === 'development') {
        console.log('=== OVERDUE INVOICE EMAIL ===');
        console.log(`To: ${params.to}`);
        console.log(`Subject: ${subject}`);
        console.log('HTML Content:', html);
        console.log('============================');
      }

      return await this.storeEmailLocally({
        to: params.to,
        subject,
        html,
        text: this.htmlToText(html),
        metadata: {
          type: 'overdue_invoice',
          invoiceNumber: params.invoiceNumber,
          clientName: params.clientName,
          amountDue: params.amountDue,
          dueDate: params.dueDate,
          daysOverdue: params.daysOverdue
        }
      });
    } catch (error) {
      console.error('Failed to send overdue invoice email:', error);
      return false;
    }
  }

  /**
   * Store email in localStorage for development purposes
   */
  private static async storeEmailLocally(email: EmailOptions): Promise<boolean> {
    try {
      const emails = this.getStoredEmails();
      const sentEmail: SentEmail = {
        ...email,
        id: `email_${Date.now()}`,
        sentAt: new Date(),
        status: 'sent',
      };
      
      emails.push(sentEmail);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(emails));
      
      // Log to console for development
      console.log('Email stored locally:', {
        to: email.to,
        subject: email.subject,
        id: sentEmail.id,
        sentAt: sentEmail.sentAt
      });
      
      return true;
    } catch (error) {
      console.error('Error storing email locally:', error);
      return false;
    }
  }

  /**
   * Send a quotation email to a client
   */
  static async sendQuotationEmail(
    to: string,
    clientName: string,
    quotationNumber: string,
    quotationDate: string,
    expiryDate: string,
    amount: string,
    quotationLink: string,
    companyName: string,
    companyEmail: string,
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: string;
      amount: string;
    }>,
    subtotal: string,
    tax: string,
    total: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const subject = `Quotation #${quotationNumber} from ${companyName}`;
      const QuotationEmailComponent = QuotationEmail as any; // Use 'any' to bypass type checking for dynamic props
      
      const html = renderToStaticMarkup(
        React.createElement(QuotationEmailComponent, {
          clientName,
          quotationNumber,
          quotationDate,
          validUntil: expiryDate,
          amount,
          quotationLink,
          companyName,
          companyEmail,
          items,
          subtotal,
          tax,
          total,
          notes
        })
      );

      // For local development, log the email instead of sending it
      if (process.env.NODE_ENV === 'development') {
        console.log('=== QUOTATION EMAIL ===');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('HTML Content:', html);
        console.log('======================');
      }

      // Store the email in localStorage for development purposes
      await this.storeEmailLocally({
        to,
        subject,
        html,
        text: this.htmlToText(html),
        metadata: {
          type: 'quotation',
          quotationNumber,
          clientName,
          amount
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to send quotation email:', error);
      return false;
    }
  }

  /**
   * Get all sent emails from localStorage
   */
  static getStoredEmails(): SentEmail[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving stored emails:', error);
      return [];
    }
  }

  /**
   * Clear all stored emails (for testing/development)
   */
  static clearStoredEmails(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Export the EmailService class
export default EmailService;
