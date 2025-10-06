import { Client, Message, TemplatedMessage } from 'postmark';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import emailConfig from '@/emails/config/emailConfig';
import { v4 as uuidv4 } from 'uuid';

// Enforce server-only usage: fail fast if imported on the client
if (typeof window !== 'undefined') {
  throw new Error('postmarkService is server-only and must not be imported in client code');
}

// Browser-safe UUID generator
const genId = (): string => {
  try {
    // Prefer Web Crypto API if available in browser
    // @ts-ignore - crypto may not exist in some environments
    if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
      // @ts-ignore
      return globalThis.crypto.randomUUID();
    }
  } catch {}
  try {
    return uuidv4();
  } catch {
    // Fallback: not cryptographically secure; only used for local/dev dry runs
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
};

// PostMark client configuration - lazy initialization
let postmarkClient: Client | null = null;

function getPostmarkClient(): Client {
  if (!postmarkClient) {
    // Get token strictly from server environment variables
    const token = (typeof process !== 'undefined' && process.env ? process.env.POSTMARK_SERVER_TOKEN : null);
    
    if (!token) {
      throw new Error('Postmark server token not found in environment variables');
    }
    
    console.log('Initializing Postmark client with token:', token.substring(0, 8) + '...');
    postmarkClient = new Client(token);
  }
  return postmarkClient;
}

// In local/dev, or when no token is configured, avoid sending real emails
const POSTMARK_DRY_RUN = false; // Ensure emails are sent in all environments

// Blob storage URLs for email assets
const BLOB_ASSETS = {
  logo: 'https://mok-mzansi-books-vercel-sup-blob.vercel-storage.com/logo-xyz123.png',
  signature: 'https://mok-mzansi-books-vercel-sup-blob.vercel-storage.com/signature-abc456.png',
  twitter: 'https://mok-mzansi-books-vercel-sup-blob.vercel-storage.com/twitter-def789.png',
  facebook: 'https://mok-mzansi-books-vercel-sup-blob.vercel-storage.com/facebook-ghi012.png',
  tiktok: 'https://mok-mzansi-books-vercel-sup-blob.vercel-storage.com/tiktok-jkl345.png'
};

interface EmailOptions {
  to: string | string[];
  subject: string;
  htmlBody?: string;
  textBody?: string;
  templateAlias?: string;
  templateModel?: Record<string, any>;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  tag?: string;
  metadata?: Record<string, string>;
  attachments?: Array<{
    name: string;
    content: string;
    contentType: string;
  }>;
  // add optional message stream support
  messageStream?: string;
}

interface PostMarkResponse {
  messageId: string;
  to: string;
  submittedAt: string;
  errorCode?: number;
  message?: string;
}

class PostMarkService {
  private client: Client | null;
  private defaultFrom: string;
  private defaultReplyTo: string;

  constructor() {
    // Avoid constructing the Postmark client when in DRY RUN to prevent token verification errors
    this.client = POSTMARK_DRY_RUN ? null : getPostmarkClient();
    
    // Use server environment variables only
    const senderEmail = (typeof process !== 'undefined' && process.env ? process.env.POSTMARK_SENDER_EMAIL : null) ||
                       'noreply@mokmzansibooks.com';
    const senderName = (typeof process !== 'undefined' && process.env ? process.env.POSTMARK_SENDER_NAME : null) ||
                      emailConfig.company.name;
    
    this.defaultFrom = `${senderName} <${senderEmail}>`;
    this.defaultReplyTo = emailConfig.company.email || 'support@mokmzansibooks.com';
  }

  // Minimal retry helper with exponential backoff + jitter
  private async withRetry<T>(
    fn: () => Promise<T>,
    context: { op: string; to?: string; alias?: string; tag?: string },
    maxAttempts = 3,
    baseDelayMs = 300
  ): Promise<T> {
    let lastErr: any;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await fn();
        console.log(
          JSON.stringify({
            level: 'info',
            msg: 'postmark_send_success',
            op: context.op,
            to: context.to,
            alias: context.alias,
            tag: context.tag,
            attempt,
          })
        );
        return res;
      } catch (err: any) {
        lastErr = err;
        console.error(
          JSON.stringify({
            level: 'error',
            msg: 'postmark_send_error',
            op: context.op,
            to: context.to,
            alias: context.alias,
            tag: context.tag,
            attempt,
            error: err?.message || String(err),
          })
        );
        if (attempt < maxAttempts) {
          const jitter = Math.floor(Math.random() * 100);
          const delay = baseDelayMs * Math.pow(2, attempt - 1) + jitter;
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    throw lastErr;
  }

  /**
   * Send a single email using PostMark
   */
  async sendEmail(options: EmailOptions): Promise<PostMarkResponse> {
    try {
      if (POSTMARK_DRY_RUN) {
        const to = Array.isArray(options.to) ? options.to.join(',') : options.to;
        console.warn('[postmarkService] DRY RUN: sendEmail suppressed (no token / dev). To:', to, 'Subject:', options.subject);
        return {
          messageId: genId(),
          to,
          submittedAt: new Date().toISOString(),
          errorCode: 0,
          message: 'dry_run'
        };
      }
      const emailData: Message = {
        From: options.from || this.defaultFrom,
        To: Array.isArray(options.to) ? options.to.join(',') : options.to,
        Subject: options.subject,
        HtmlBody: options.htmlBody,
        TextBody: options.textBody,
        ReplyTo: options.replyTo || this.defaultReplyTo,
        Cc: Array.isArray(options.cc) ? options.cc.join(',') : options.cc,
        Bcc: Array.isArray(options.bcc) ? options.bcc.join(',') : options.bcc,
        Tag: options.tag,
        Metadata: options.metadata,
        // enable tracking + message stream
        TrackOpens: true,
        MessageStream: options.messageStream || 'outbound',
        Attachments: options.attachments?.map(att => ({
          Name: att.name,
          Content: att.content,
          ContentType: att.contentType,
          ContentID: att.name
        }))
      };

      // Remove undefined fields
      Object.keys(emailData).forEach(key => {
        if (emailData[key as keyof typeof emailData] === undefined) {
          delete emailData[key as keyof typeof emailData];
        }
      });

      const result = await this.withRetry(
        () => {
          const client = this.client ?? getPostmarkClient();
          this.client = client;
          return client.sendEmail(emailData);
        },
        { op: 'sendEmail', to: emailData.To, tag: emailData.Tag }
      );
      return {
        messageId: result.MessageID,
        to: result.To,
        submittedAt: result.SubmittedAt,
        errorCode: result.ErrorCode,
        message: result.Message
      };
    } catch (error) {
      console.error('PostMark send error:', error);
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  /**
   * Send email using PostMark template
   */
  async sendEmailWithTemplate(options: EmailOptions & { templateAlias: string }): Promise<PostMarkResponse> {
    try {
      if (POSTMARK_DRY_RUN) {
        const to = Array.isArray(options.to) ? options.to.join(',') : options.to;
        console.warn('[postmarkService] DRY RUN: sendEmailWithTemplate suppressed (no token / dev). To:', to, 'Alias:', options.templateAlias);
        return {
          messageId: genId(),
          to,
          submittedAt: new Date().toISOString(),
          errorCode: 0,
          message: 'dry_run'
        };
      }
      const emailData: TemplatedMessage = {
        From: options.from || this.defaultFrom,
        To: Array.isArray(options.to) ? options.to.join(',') : options.to,
        TemplateAlias: options.templateAlias,
        TemplateModel: {
          ...options.templateModel,
          // Inject blob storage assets into template model
          company_logo: BLOB_ASSETS.logo,
          signature_image: BLOB_ASSETS.signature,
          twitter_icon: BLOB_ASSETS.twitter,
          facebook_icon: BLOB_ASSETS.facebook,
          tiktok_icon: BLOB_ASSETS.tiktok,
          company_name: emailConfig.company.name,
          company_website: emailConfig.company.website,
          company_email: emailConfig.company.email,
          company_phone: emailConfig.company.phone,
          company_address: emailConfig.company.address,
          // commonly used in Postmark HTML footers
          current_year: new Date().getFullYear()
        },
        ReplyTo: options.replyTo || this.defaultReplyTo,
        Cc: Array.isArray(options.cc) ? options.cc.join(',') : options.cc,
        Bcc: Array.isArray(options.bcc) ? options.bcc.join(',') : options.bcc,
        Tag: options.tag,
        Metadata: options.metadata,
        // enable tracking + message stream
        TrackOpens: true,
        MessageStream: options.messageStream || 'outbound',
        Attachments: options.attachments?.map(att => ({
          Name: att.name,
          Content: att.content,
          ContentType: att.contentType,
          ContentID: att.name
        }))
      };

      // Remove undefined fields
      Object.keys(emailData).forEach(key => {
        if (emailData[key as keyof typeof emailData] === undefined) {
          delete emailData[key as keyof typeof emailData];
        }
      });

      const result = await this.withRetry(
        () => {
          const client = this.client ?? getPostmarkClient();
          this.client = client;
          return client.sendEmailWithTemplate(emailData);
        },
        { op: 'sendEmailWithTemplate', to: emailData.To, alias: emailData.TemplateAlias, tag: emailData.Tag }
      );
      return {
        messageId: result.MessageID,
        to: result.To,
        submittedAt: result.SubmittedAt,
        errorCode: result.ErrorCode,
        message: result.Message
      };
    } catch (error) {
      console.error('PostMark template send error:', error);
      throw new Error(`Failed to send templated email: ${error}`);
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, userName: string, loginLink?: string): Promise<PostMarkResponse> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || emailConfig.company.website;
    const finalLoginLink = loginLink || `${appUrl.replace(/\/$/, '')}/login`;

    return this.sendEmailWithTemplate({
      to,
      subject: 'Welcome to Mok Mzansi Books',
      templateAlias: 'welcome-email',
      templateModel: {
        user_name: userName,
        login_link: finalLoginLink,
        support_email: emailConfig.company.email
      },
      tag: 'welcome',
      metadata: {
        type: 'welcome',
        user: userName
      }
    });
  }

  /**
   * Send invoice email
   */
  async sendInvoiceEmail(
    to: string,
    invoiceData: {
      invoiceNumber: string;
      clientName: string;
      dueDate: string;
      total: string;
      items: Array<{ description: string; quantity: number; unitPrice: string; amount: string }>;
      // optional fields expected by the Postmark HTML
      invoiceDate?: string;
      paymentTerms?: string;
      subtotal?: string;
      taxAmount?: string;
      taxRate?: string;
      discountAmount?: string;
      bankName?: string;
      accountNumber?: string;
    }
  ): Promise<PostMarkResponse> {
    return this.sendEmailWithTemplate({
      to,
      subject: `Invoice ${invoiceData.invoiceNumber}`,
      templateAlias: 'invoice-email',
      templateModel: {
        invoice_number: invoiceData.invoiceNumber,
        client_name: invoiceData.clientName,
        due_date: invoiceData.dueDate,
        invoice_items: invoiceData.items,
        total_amount: invoiceData.total,
        ...(invoiceData.invoiceDate && { invoice_date: invoiceData.invoiceDate }),
        ...(invoiceData.paymentTerms && { payment_terms: invoiceData.paymentTerms }),
        ...(invoiceData.subtotal && { subtotal: invoiceData.subtotal }),
        ...(invoiceData.taxAmount && { tax_amount: invoiceData.taxAmount }),
        ...(invoiceData.taxRate && { tax_rate: invoiceData.taxRate }),
        ...(invoiceData.discountAmount && { discount_amount: invoiceData.discountAmount }),
        ...(invoiceData.bankName && { bank_name: invoiceData.bankName }),
        ...(invoiceData.accountNumber && { account_number: invoiceData.accountNumber })
      },
      tag: 'invoice',
      metadata: {
        type: 'invoice',
        invoice_number: invoiceData.invoiceNumber
      }
    });
  }

  /**
   * Send quotation email
   */
  async sendQuotationEmail(
    to: string,
    quotationData: {
      quotationNumber: string;
      clientName: string;
      validUntil: string;
      total: string;
      items: Array<{ description: string; quantity: number; unitPrice: string; amount: string }>;
      // optional fields expected by the Postmark HTML
      quotationDate?: string;
      referenceNumber?: string;
      subtotal?: string;
      taxAmount?: string;
      taxRate?: string;
      discountAmount?: string;
      acceptQuoteLink?: string;
      contactLink?: string;
      validityPeriod?: string | number;
      paymentTerms?: string;
      deliveryTimeframe?: string;
    },
    attachments?: Array<{ name: string; content: string; contentType: string }>
  ): Promise<PostMarkResponse> {
    return this.sendEmailWithTemplate({
      to,
      subject: `Quotation ${quotationData.quotationNumber}`,
      templateAlias: 'quotation-email',
      templateModel: {
        quotation_number: quotationData.quotationNumber,
        client_name: quotationData.clientName,
        valid_until: quotationData.validUntil,
        quotation_items: quotationData.items,
        total_amount: quotationData.total,
        ...(quotationData.quotationDate && { quotation_date: quotationData.quotationDate }),
        ...(quotationData.referenceNumber && { reference_number: quotationData.referenceNumber }),
        ...(quotationData.subtotal && { subtotal: quotationData.subtotal }),
        ...(quotationData.taxAmount && { tax_amount: quotationData.taxAmount }),
        ...(quotationData.taxRate && { tax_rate: quotationData.taxRate }),
        ...(quotationData.discountAmount && { discount_amount: quotationData.discountAmount }),
        ...(quotationData.acceptQuoteLink && { accept_quote_link: quotationData.acceptQuoteLink }),
        ...(quotationData.contactLink && { contact_link: quotationData.contactLink }),
        ...(quotationData.validityPeriod && { validity_period: quotationData.validityPeriod }),
        ...(quotationData.paymentTerms && { payment_terms: quotationData.paymentTerms }),
        ...(quotationData.deliveryTimeframe && { delivery_timeframe: quotationData.deliveryTimeframe })
      },
      tag: 'quotation',
      metadata: {
        type: 'quotation',
        quotation_number: quotationData.quotationNumber
      },
      attachments
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, resetLink: string, userName?: string): Promise<PostMarkResponse> {
    return this.sendEmailWithTemplate({
      to,
      subject: 'Password Reset Request',
      templateAlias: 'password-reset',
      templateModel: {
        user_name: userName || 'User',
        reset_link: resetLink,
        support_email: emailConfig.company.email
      },
      tag: 'password-reset',
      metadata: {
        type: 'password-reset',
        user: userName || 'unknown'
      }
    });
  }

  /**
   * Send employee welcome email with password creation link
   */
  async sendEmployeeWelcomeEmail(
    to: string,
    data: {
      employeeName: string;
      employeeEmail: string;
      position: string;
      department: string;
      companyName: string;
      passwordCreationLink: string;
      startDate: string;
      managerName?: string;
      supportEmail?: string;
    }
  ): Promise<PostMarkResponse> {
    return this.sendEmailWithTemplate({
      to,
      subject: `Welcome to ${data.companyName} - Set Up Your Account`,
      templateAlias: 'employee-welcome-email',
      templateModel: {
        employee_name: data.employeeName,
        employee_email: data.employeeEmail,
        position: data.position,
        department: data.department,
        company_name: data.companyName,
        password_creation_link: data.passwordCreationLink,
        start_date: data.startDate,
        manager_name: data.managerName || 'Your Manager',
        support_email: data.supportEmail || emailConfig.company.email
      },
      tag: 'employee-welcome',
      metadata: {
        type: 'employee-welcome',
        employee: data.employeeName,
        department: data.department
      }
    });
  }

  /**
   * Send team invitation email
   */
  async sendTeamInvitationEmail(
    to: string,
    inviterName: string,
    companyName: string,
    invitationLink: string
  ): Promise<PostMarkResponse> {
    return this.sendEmailWithTemplate({
      to,
      subject: `Team Invitation from ${companyName}`,
      // fix alias to deployed alias
      templateAlias: 'team-invitation-email',
      templateModel: {
        inviter_name: inviterName,
        company_name: companyName,
        invitation_link: invitationLink,
        support_email: emailConfig.company.email
      },
      tag: 'team-invitation',
      metadata: {
        type: 'team-invitation',
        inviter: inviterName,
        company: companyName
      }
    });
  }

  /**
   * Send low stock alert email
   */
  async sendLowStockAlert(
    to: string,
    lowStockItems: Array<{
      name: string;
      currentStock: number;
      minimumStock: number;
      sku?: string;
    }>
  ): Promise<PostMarkResponse> {
    return this.sendEmailWithTemplate({
      to,
      subject: 'Low Stock Alert',
      templateAlias: 'low-stock-alert',
      templateModel: {
        low_stock_items: lowStockItems,
        inventory_link: `${process.env.NEXT_PUBLIC_APP_URL || emailConfig.company.website}/inventory`
      },
      tag: 'low-stock-alert',
      metadata: {
        type: 'low-stock-alert',
        items_count: lowStockItems.length.toString()
      }
    });
  }

  /**
   * Send grace period reminder email
   */
  async sendGracePeriodReminderEmail(
    to: string,
    data: {
      userName: string;
      companyName?: string;
      daysRemaining: number;
      gracePeriodEndDate: string;
      paymentLink?: string;
      accountManagementLink?: string;
      lastPaymentAttempt?: string;
      amountDue?: number | string;
      currency?: string;
      supportEmail?: string;
    }
  ): Promise<PostMarkResponse> {
    return this.sendEmailWithTemplate({
      to,
      subject: 'Account Grace Period - Action Required',
      templateAlias: 'grace-period-reminder',
      templateModel: {
        user_name: data.userName,
        company_name: data.companyName || emailConfig.company.name,
        days_remaining: data.daysRemaining,
        grace_period_end: data.gracePeriodEndDate,
        ...(data.paymentLink && { payment_link: data.paymentLink }),
        ...(data.accountManagementLink && { account_link: data.accountManagementLink }),
        ...(data.lastPaymentAttempt && { last_payment_attempt: data.lastPaymentAttempt }),
        ...(data.amountDue !== undefined && { amount_due: data.amountDue }),
        ...(data.currency && { currency: data.currency }),
        support_email: data.supportEmail || emailConfig.company.email
      },
      tag: 'grace-period-reminder',
      metadata: { type: 'grace-period-reminder' }
    });
  }

  /**
   * Send account lockout email
   */
  async sendAccountLockoutEmail(
    to: string,
    data: {
      userName: string;
      companyName?: string;
      lockoutDate: string;
      gracePeriodEndDate: string;
      amountDue?: number | string;
      currency?: string;
      paymentLink?: string;
      accountManagementLink?: string;
      supportEmail?: string;
      supportPhone?: string;
      daysPastDue: number;
    }
  ): Promise<PostMarkResponse> {
    return this.sendEmailWithTemplate({
      to,
      subject: `Account Suspended - ${data.companyName || emailConfig.company.name}`,
      templateAlias: 'account-lockout-email',
      templateModel: {
        user_name: data.userName,
        company_name: data.companyName || emailConfig.company.name,
        lockout_date: data.lockoutDate,
        grace_period_end: data.gracePeriodEndDate,
        ...(data.amountDue !== undefined && { amount_due: data.amountDue }),
        ...(data.currency && { currency: data.currency }),
        ...(data.paymentLink && { payment_link: data.paymentLink }),
        ...(data.accountManagementLink && { account_link: data.accountManagementLink }),
        contact_email: data.supportEmail || emailConfig.company.email,
        ...(data.supportPhone && { support_phone: data.supportPhone }),
        days_past_due: data.daysPastDue
      },
      tag: 'account-lockout',
      metadata: { type: 'account-lockout' }
    });
  }

  /**
   * Send overdue invoice email
   */
  async sendOverdueInvoiceEmail(
    to: string,
    data: {
      clientName: string;
      invoiceNumber: string;
      dueDate: string;
      daysOverdue: number;
      amountDue: string;
      invoiceLink: string;
      supportEmail?: string;
    }
  ): Promise<PostMarkResponse> {
    return this.sendEmailWithTemplate({
      to,
      subject: `Overdue Invoice ${data.invoiceNumber} - Payment Required`,
      templateAlias: 'overdue-invoice-email',
      templateModel: {
        client_name: data.clientName,
        invoice_number: data.invoiceNumber,
        due_date: data.dueDate,
        amount_due: data.amountDue,
        invoice_link: data.invoiceLink,
        support_email: data.supportEmail || emailConfig.company.email,
        days_overdue: data.daysOverdue
      },
      tag: 'overdue-invoice',
      metadata: { type: 'overdue-invoice', invoice_number: data.invoiceNumber }
    });
  }

  /**
   * Send invoice payment reminder email
   */
  async sendInvoicePaymentReminderEmail(
    to: string,
    data: {
      clientName: string;
      invoiceNumber: string;
      dueDate: string;
      amountDue: string;
      invoiceLink: string;
      companyName?: string;
      supportEmail?: string;
    }
  ): Promise<PostMarkResponse> {
    return this.sendEmailWithTemplate({
      to,
      subject: `Payment Reminder: Invoice ${data.invoiceNumber}`,
      templateAlias: 'invoice-payment-reminder',
      templateModel: {
        client_name: data.clientName,
        invoice_number: data.invoiceNumber,
        due_date: data.dueDate,
        amount_due: data.amountDue,
        invoice_link: data.invoiceLink,
        company_name: data.companyName || emailConfig.company.name,
        support_email: data.supportEmail || emailConfig.company.email
      },
      tag: 'invoice-payment-reminder',
      metadata: { type: 'invoice-payment-reminder', invoice_number: data.invoiceNumber }
    });
  }

  /**
   * Send login notification email
   */
  async sendLoginNotificationEmail(
    to: string,
    data: {
      userName: string;
      loginTime: string;
      loginLocation: string;
      ipAddress: string;
      deviceInfo: string;
      browserInfo: string;
      securityLink: string;
      supportEmail?: string;
      companyName?: string;
    }
  ): Promise<PostMarkResponse> {
    return this.sendEmailWithTemplate({
      to,
      subject: 'New login to your MOK Mzansi Books account',
      templateAlias: 'login-notification',
      templateModel: {
        user_name: data.userName,
        login_time: data.loginTime,
        login_location: data.loginLocation,
        ip_address: data.ipAddress,
        device_info: data.deviceInfo,
        browser_info: data.browserInfo,
        security_link: data.securityLink,
        support_email: data.supportEmail || emailConfig.company.email,
        company_name: data.companyName || emailConfig.company.name
      },
      tag: 'login-notification',
      metadata: { type: 'login-notification', user: data.userName }
    });
  }

  /**
   * Send generic custom email
   */
  async sendGenericCustomEmail(
    to: string,
    data: {
      recipientName: string;
      emailSubject: string;
      emailContent: string;
      ctaText?: string;
      ctaLink?: string;
      senderName?: string;
      companyName?: string;
      additionalInfo?: string;
    }
  ): Promise<PostMarkResponse> {
    return this.sendEmailWithTemplate({
      to,
      subject: data.emailSubject,
      templateAlias: 'generic-custom-email',
      templateModel: {
        recipient_name: data.recipientName,
        email_subject: data.emailSubject,
        email_content: data.emailContent,
        ...(data.ctaText && { cta_text: data.ctaText }),
        ...(data.ctaLink && { cta_link: data.ctaLink }),
        sender_name: data.senderName || emailConfig.company.name,
        company_name: data.companyName || emailConfig.company.name,
        ...(data.additionalInfo && { additional_info: data.additionalInfo })
      },
      tag: 'generic-custom-email',
      metadata: { type: 'generic-custom-email' }
    });
  }

  /**
   * Send trial reminder email
   */
  async sendTrialReminderEmail(
    to: string,
    data: {
      userName: string;
      loginUrl: string;
      daysLeft?: number;
      upgradeLink?: string;
      featuresUsed?: string[];
    }
  ): Promise<PostMarkResponse> {
    return this.sendEmailWithTemplate({
      to,
      subject: 'Your trial ends soon',
      templateAlias: 'trial-reminder-email',
      templateModel: {
        user_name: data.userName,
        login_url: data.loginUrl,
        ...(typeof data.daysLeft === 'number' && { days_left: data.daysLeft }),
        ...(data.upgradeLink && { upgrade_link: data.upgradeLink }),
        ...(data.featuresUsed && { features_used: data.featuresUsed })
      },
      tag: 'trial-reminder',
      metadata: { type: 'trial-reminder', user: data.userName }
    });
  }

  /**
   * Get email statistics
   */
  async getEmailStats(tag?: string, fromDate?: string, toDate?: string) {
    if (POSTMARK_DRY_RUN || !this.client) {
      // In dry-run mode or when client is unavailable, return a mock stats object
      return {
        Sent: 0,
        Bounced: 0,
        SpamComplaints: 0,
        Tracked: 0,
        WithClientRecorded: 0
      } as any;
    }
    try {
      const stats = await this.client.getOutboundOverview({
        tag,
        fromDate,
        toDate
      });
      return stats;
    } catch (error) {
      console.error('Error fetching email stats:', error);
      throw error;
    }
  }

  /**
   * Get bounced emails
   */
  async getBouncedEmails(count = 100, offset = 0) {
    if (POSTMARK_DRY_RUN || !this.client) {
      // In dry-run mode or when client is unavailable, return an empty result
      return { TotalCount: 0, Bounces: [] } as any;
    }
    try {
      const bounces = await this.client.getBounces({
        count,
        offset
      });
      return bounces;
    } catch (error) {
      console.error('Error fetching bounced emails:', error);
      throw error;
    }
  }
}

// Export lazy-loaded singleton instance
let postmarkServiceInstance: PostMarkService | null = null;

export const postmarkService = {
  getInstance(): PostMarkService {
    if (!postmarkServiceInstance) {
      postmarkServiceInstance = new PostMarkService();
    }
    return postmarkServiceInstance;
  },

  async sendEmail(options: EmailOptions) {
    return this.getInstance().sendEmail(options);
  },

  async sendEmailWithTemplate(options: EmailOptions & { templateAlias: string }) {
    return this.getInstance().sendEmailWithTemplate(options);
  },

  async sendWelcomeEmail(to: string, userName: string, loginLink: string) {
    return this.getInstance().sendWelcomeEmail(to, userName, loginLink);
  },

  async sendInvoiceEmail(to: string, invoiceData: any) {
    return this.getInstance().sendInvoiceEmail(to, invoiceData);
  },

  async sendQuotationEmail(to: string, quotationData: any, attachments?: Array<{ name: string; content: string; contentType: string }>) {
    return this.getInstance().sendQuotationEmail(to, quotationData, attachments);
  },

  async sendPasswordResetEmail(to: string, resetLink: string, userName?: string) {
    return this.getInstance().sendPasswordResetEmail(to, resetLink, userName);
  },

  async sendTeamInvitationEmail(to: string, inviterName: string, companyName: string, inviteLink: string) {
    return this.getInstance().sendTeamInvitationEmail(to, inviterName, companyName, inviteLink);
  },

  async sendLowStockAlert(to: string, lowStockItems: any[]) {
    return this.getInstance().sendLowStockAlert(to, lowStockItems);
  },

  async getEmailStats(tag?: string, fromDate?: string, toDate?: string) {
    return this.getInstance().getEmailStats(tag, fromDate, toDate);
  },

  async getBouncedEmails(count: number = 50, offset: number = 0) {
    return this.getInstance().getBouncedEmails(count, offset);
  },

  async sendGracePeriodReminderEmail(to: string, data: any) {
    return this.getInstance().sendGracePeriodReminderEmail(to, data);
  },

  async sendAccountLockoutEmail(to: string, data: any) {
    return this.getInstance().sendAccountLockoutEmail(to, data);
  },

  async sendOverdueInvoiceEmail(to: string, data: any) {
    return this.getInstance().sendOverdueInvoiceEmail(to, data);
  },

  async sendInvoicePaymentReminderEmail(to: string, data: any) {
    return this.getInstance().sendInvoicePaymentReminderEmail(to, data);
  },

  async sendLoginNotificationEmail(to: string, data: any) {
    return this.getInstance().sendLoginNotificationEmail(to, data);
  },

  async sendGenericCustomEmail(to: string, data: any) {
    return this.getInstance().sendGenericCustomEmail(to, data);
  },

  async sendTrialReminderEmail(to: string, data: any) {
    return this.getInstance().sendTrialReminderEmail(to, data);
  },
  async sendEmployeeWelcomeEmail(to: string, data: any) {
    return this.getInstance().sendEmployeeWelcomeEmail(to, data);
  }
};

export default postmarkService;