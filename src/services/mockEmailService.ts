/**
 * Mock Email Service
 * 
 * This service provides a local mock implementation of email functionality
 * for development and testing without requiring actual email sending.
 */

// Types for email options
interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  firstName?: string;
  lastName?: string;
}

interface PasswordResetEmailOptions {
  to: string;
  subject: string;
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

interface QuotationEmailOptions {
  to: string;
  subject?: string;
  quotationNumber: string;
  clientName: string;
  pdfAttachment: Blob;
  pdfFileName: string;
}

// Store for sent emails
interface SentEmail {
  to: string;
  subject: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'failed' | 'pending';
  type: 'confirmation' | 'reset' | 'invitation' | 'quotation' | 'invoice' | 'deletion';
}

// In-memory store for sent emails
const sentEmails: SentEmail[] = [];

// Helper to simulate network delay
const simulateNetworkDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Mock email service implementation
const mockEmailService = {
  // Initialize the mock email service
  initialize: () => {
    console.log('Mock email service initialized');
    return true;
  },
  
  // Send a confirmation email
  async sendConfirmationEmail(options: EmailOptions): Promise<boolean> {
    await simulateNetworkDelay();
    
    const email: SentEmail = {
      to: options.to,
      subject: options.subject,
      content: options.html || `Welcome ${options.firstName || 'User'}! Your account has been created.`,
      timestamp: new Date(),
      status: 'sent',
      type: 'confirmation'
    };
    
    sentEmails.push(email);
    console.log('Mock confirmation email sent:', email);
    return true;
  },
  
  // Send a password reset email
  async sendPasswordResetEmail(options: PasswordResetEmailOptions): Promise<boolean> {
    await simulateNetworkDelay();
    
    const email: SentEmail = {
      to: options.to,
      subject: options.subject,
      content: `Password reset token: ${options.resetToken}`,
      timestamp: new Date(),
      status: 'sent',
      type: 'reset'
    };
    
    sentEmails.push(email);
    console.log('Mock password reset email sent:', email);
    return true;
  },
  
  // Send an invitation email
  async sendInvitationEmail(options: InvitationEmailOptions): Promise<boolean> {
    await simulateNetworkDelay();
    
    const email: SentEmail = {
      to: options.to,
      subject: options.subject || 'You have been invited to join MOK Mzansi Books',
      content: `Invitation from ${options.inviterName || 'Admin'} for role: ${options.role}. Link: ${options.invitationLink}`,
      timestamp: new Date(),
      status: 'sent',
      type: 'invitation'
    };
    
    sentEmails.push(email);
    console.log('Mock invitation email sent:', email);
    return true;
  },
  
  // Send a quotation email with PDF attachment
  async sendQuotationEmail(options: QuotationEmailOptions): Promise<boolean> {
    await simulateNetworkDelay();
    
    const email: SentEmail = {
      to: options.to,
      subject: options.subject || `Quotation ${options.quotationNumber}`,
      content: `Quotation ${options.quotationNumber} for ${options.clientName} with PDF attachment`,
      timestamp: new Date(),
      status: 'sent',
      type: 'quotation'
    };
    
    sentEmails.push(email);
    console.log('Mock quotation email sent:', email);
    return true;
  },
  
  // Get all sent emails
  getSentEmails(): SentEmail[] {
    return [...sentEmails];
  },
  
  // Clear sent emails (for testing)
  clearSentEmails(): void {
    sentEmails.length = 0;
    console.log('Cleared all sent emails');
  }
};

export default mockEmailService;
