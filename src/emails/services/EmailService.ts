import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import type { FC } from 'react';
import { WelcomeEmail } from '../templates/WelcomeEmail';
import { InvoiceEmail } from '../templates/InvoiceEmail';
import { QuotationEmail } from '../templates/QuotationEmail';
import { InvitationEmail } from '../templates/InvitationEmail';

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
