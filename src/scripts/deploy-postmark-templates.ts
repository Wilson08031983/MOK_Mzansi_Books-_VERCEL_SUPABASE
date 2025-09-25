#!/usr/bin/env tsx
/**
 * Postmark Template Deployment Script
 * 
 * This script extracts email templates from the local preview page and deploys them to Postmark.
 * It converts React components to HTML and creates/updates templates in Postmark.
 * 
 * Usage: npx tsx src/scripts/deploy-postmark-templates.ts
 */

import { Client, Models } from 'postmark';
import * as fs from 'fs';
import * as path from 'path';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

// Import email templates
import { WelcomeEmail } from '../emails/templates/WelcomeEmail';
import { BirthdayEmail } from '../emails/templates/BirthdayEmail';
import { TrialEndingEmail } from '../emails/templates/TrialEndingEmail';
import { InvoiceEmail } from '../emails/templates/InvoiceEmail';
import { QuotationEmail } from '../emails/templates/QuotationEmail';
import { InvitationEmail } from '../emails/templates/InvitationEmail';
import { LowStockEmail } from '../emails/templates/LowStockEmail';
import { OverdueInvoiceEmail } from '../emails/templates/OverdueInvoiceEmail';
import { PaymentReminderEmail } from '../emails/templates/PaymentReminderEmail';
import { InvoicePaymentReminderEmail } from '../emails/templates/InvoicePaymentReminderEmail';
import { GracePeriodDailyReminderEmail } from '../emails/templates/GracePeriodDailyReminderEmail';
import { AccountLockoutEmail } from '../emails/templates/AccountLockoutEmail';
import { TrialReminderEmail } from '../emails/TrialReminderEmail';
import { GenericCustomEmail } from '../emails/templates/GenericCustomEmail';
import { LoginNotificationEmail } from '../emails/templates/LoginNotificationEmail';
import { PasswordResetEmail } from '../emails/templates/PasswordResetEmail';
import { EmployeeWelcomeEmail } from '../emails/templates/EmployeeWelcomeEmail';
import { VerificationEmail } from '../emails/templates/VerificationEmail';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

interface PostmarkTemplate {
  Name: string;
  Alias: string;
  Subject: string;
  HtmlBody: string;
  TextBody?: string;
  TemplateType: Models.TemplateTypes;
  LayoutTemplate?: string;
}

interface TemplateDefinition {
  name: string;
  alias: string;
  subject: string;
  component: React.ReactElement;
  sampleData: any;
}

class PostmarkTemplateDeployer {
  private client: Client;
  private serverToken: string;
  
  constructor() {
    this.serverToken = process.env.POSTMARK_SERVER_TOKEN || '';
    if (!this.serverToken) {
      throw new Error('POSTMARK_SERVER_TOKEN is required in environment variables');
    }
    this.client = new Client(this.serverToken);
  }

  /**
   * Get all available email templates with their sample data
   */
  private getTemplateDefinitions(): TemplateDefinition[] {
    return [
      {
        name: 'Welcome Email',
        alias: 'welcome-email',
        subject: 'Welcome to {{company_name}}!',
        component: React.createElement(WelcomeEmail, {
          userName: '{{user_name}}',
          loginLink: '{{login_link}}',
          supportEmail: '{{support_email}}'
        }),
        sampleData: {
          user_name: 'John Smith',
          login_link: 'https://app.mokmzansibooks.com/login',
          support_email: 'support@mokmzansibooks.com',
          company_name: 'MOK Mzansi Books'
        }
      },
      {
        name: 'Trial Ending Email',
        alias: 'trial-ending-email',
        subject: 'Your trial expires in {{days_left}} days',
        component: React.createElement(TrialEndingEmail, {
          userName: '{{user_name}}',
          daysLeft: 5,
          upgradeLink: '{{upgrade_link}}',
          supportEmail: '{{support_email}}'
        }),
        sampleData: {
          user_name: 'John Smith',
          days_left: 5,
          upgrade_link: 'https://app.mokmzansibooks.com/pricing',
          support_email: 'support@mokmzansibooks.com'
        }
      },
      {
        name: 'Birthday Email',
        alias: 'birthday-email',
        subject: 'Happy Birthday {{employee_name}}! 🎉',
        component: React.createElement(BirthdayEmail, {
          employeeName: '{{employee_name}}',
          age: 28,
          companyName: '{{company_name}}',
          senderName: '{{sender_name}}'
        }),
        sampleData: {
          employee_name: 'Sarah Johnson',
          age: 28,
          company_name: 'MOK Mzansi Books',
          sender_name: 'Wilson Mokgethwa Moabelo'
        }
      },
      {
        name: 'Invoice Email',
        alias: 'invoice-email',
        subject: 'Invoice {{invoice_number}} from {{company_name}}',
        component: React.createElement(InvoiceEmail, {
          clientName: '{{client_name}}',
          invoiceNumber: '{{invoice_number}}',
          invoiceDate: '{{invoice_date}}',
          dueDate: '{{due_date}}',
          amountDue: '{{total}}',
          invoiceLink: '{{payment_link}}',
          companyName: '{{company_name}}',
          items: [
            { description: 'Web Development Services', quantity: 40, unitPrice: 'R150.00', amount: 'R6,000.00' }
          ],
          subtotal: '{{subtotal}}',
          tax: '{{tax}}',
          total: '{{total}}',
          notes: 'Payment terms: Net 30 days'
        }),
        sampleData: {
          client_name: 'John Smith',
          invoice_number: 'INV-2024-001',
          invoice_date: '2024-01-15',
          due_date: '2024-02-15',
          invoice_items: [
            { description: 'Web Development Services', quantity: 40, unitPrice: 'R150.00', amount: 'R6,000.00' }
          ],
          subtotal: 'R6,500.00',
          tax: 'R975.00',
          total: 'R7,475.00',
          payment_link: 'https://app.mokmzansibooks.com/pay/inv-001',
          company_name: 'MOK Mzansi Books'
        }
      },
      {
        name: 'Quotation Email',
        alias: 'quotation-email',
        subject: 'Quotation {{quotation_number}} from {{company_name}}',
        component: React.createElement(QuotationEmail, {
          clientName: '{{client_name}}',
          quotationNumber: '{{quotation_number}}',
          quotationDate: '{{quotation_date}}',
          validUntil: '{{valid_until}}',
          amount: '{{total}}',
          quotationLink: '{{accept_link}}',
          companyName: '{{company_name}}',
          companyEmail: '{{company_email}}',
          items: [
            { description: 'Business Website Design', quantity: 1, unitPrice: 'R8,500.00', amount: 'R8,500.00' }
          ],
          subtotal: '{{subtotal}}',
          tax: '{{tax}}',
          total: '{{total}}',
          notes: 'This quotation is valid for 30 days'
        }),
        sampleData: {
          client_name: 'ABC Company',
          quotation_number: 'QUO-2024-001',
          quotation_date: '2024-01-10',
          valid_until: '2024-02-10',
          quotation_items: [
            { description: 'Business Website Design', quantity: 1, unitPrice: 'R8,500.00', amount: 'R8,500.00' }
          ],
          subtotal: 'R10,500.00',
          tax: 'R1,575.00',
          total: 'R12,075.00',
          accept_link: 'https://app.mokmzansibooks.com/accept/quo-001',
          company_name: 'MOK Mzansi Books',
          company_email: 'support@mokmzansibooks.com'
        }
      },
      {
        name: 'Team Invitation Email',
        alias: 'team-invitation-email',
        subject: 'You\'re invited to join {{company_name}}',
        component: React.createElement(InvitationEmail, {
          recipientName: '{{invitee_name}}',
          recipientEmail: '{{invitee_email}}',
          inviterName: '{{inviter_name}}',
          companyName: '{{company_name}}',
          role: '{{role}}',
          invitationLink: '{{invite_link}}'
        }),
        sampleData: {
          invitee_name: 'Jane Doe',
          invitee_email: 'jane@example.com',
          inviter_name: 'Wilson Moabelo',
          company_name: 'MOK Mzansi Books',
          role: 'Editor',
          invite_link: 'https://app.mokmzansibooks.com/invite/abc123',
          expires_at: '2024-02-01'
        }
      },
      {
        name: 'Low Stock Alert',
        alias: 'low-stock-alert',
        subject: 'Low Stock Alert: {{product_name}}',
        component: React.createElement(LowStockEmail, {
          items: [
            {
              name: '{{product_name}}',
              currentStock: 5,
              minimumStock: 20,
              sku: 'ALC-001'
            }
          ],
          companyName: '{{company_name}}',
          inventoryLink: '{{reorder_link}}'
        }),
        sampleData: {
          product_name: 'African Literature Collection',
          current_stock: 5,
          minimum_stock: 20,
          reorder_link: 'https://app.mokmzansibooks.com/inventory/reorder',
          company_name: 'MOK Mzansi Books'
        }
      },
      {
        name: 'Overdue Invoice Email',
        alias: 'overdue-invoice-email',
        subject: 'Overdue Invoice {{invoice_number}} - Payment Required',
        component: React.createElement(OverdueInvoiceEmail, {
          clientName: '{{client_name}}',
          invoiceNumber: '{{invoice_number}}',
          dueDate: '{{due_date}}',
          daysOverdue: 15,
          amountDue: '{{amount_due}}',
          invoiceLink: '{{invoice_link}}',
          supportEmail: '{{support_email}}'
        }),
        sampleData: {
          client_name: 'John Smith',
          invoice_number: 'INV-2024-001',
          original_due_date: '2024-01-15',
          days_overdue: 15,
          total_amount: 'R7,475.00',
          payment_link: 'https://app.mokmzansibooks.com/pay/inv-001',
          support_email: 'support@mokmzansibooks.com'
        }
      },
      {
        name: 'Payment Reminder Email',
        alias: 'payment-reminder-email',
        subject: 'Payment Reminder: Invoice {{invoice_number}}',
        component: React.createElement(PaymentReminderEmail, {
          clientName: '{{client_name}}',
          invoiceNumber: '{{invoice_number}}',
          dueDate: '{{due_date}}',
          amountDue: '{{total_amount}}',
          invoiceLink: '{{payment_link}}',
          supportEmail: '{{support_email}}'
        }),
        sampleData: {
          client_name: 'John Smith',
          invoice_number: 'INV-2024-001',
          due_date: '2024-02-15',
          total_amount: 'R7,475.00',
          payment_link: 'https://app.mokmzansibooks.com/pay/inv-001',
          support_email: 'support@mokmzansibooks.com'
        }
      },
      {
        name: 'Invoice Payment Reminder',
        alias: 'invoice-payment-reminder',
        subject: 'Payment Reminder: Invoice {{invoice_number}}',
        component: React.createElement(InvoicePaymentReminderEmail, {
          clientName: '{{client_name}}',
          invoiceNumber: '{{invoice_number}}',
          dueDate: '{{due_date}}',
          amountDue: '{{amount_due}}',
          invoiceLink: '{{invoice_link}}',
          daysUntilDue: 3,
          companyName: '{{company_name}}',
          supportEmail: '{{support_email}}'
        }),
        sampleData: {
          client_name: 'John Smith',
          invoice_number: 'INV-2024-001',
          due_date: '2024-02-15',
          amount_due: 'R7,475.00',
          invoice_link: 'https://app.mokmzansibooks.com/invoices/INV-2024-001',
          company_name: 'MOK Mzansi Books',
          support_email: 'support@mokmzansibooks.com'
        }
      },
      {
        name: 'Grace Period Reminder',
        alias: 'grace-period-reminder',
        subject: 'Account Grace Period - Action Required',
        component: React.createElement(GracePeriodDailyReminderEmail, {
          userName: '{{user_name}}',
          companyName: '{{company_name}}',
          daysRemaining: 3,
          gracePeriodEndDate: '{{grace_period_end}}',
          paymentLink: '{{payment_link}}',
          accountManagementLink: '{{account_link}}',
          lastPaymentAttempt: '{{last_payment_attempt}}',
          amountDue: 750.00,
          currency: 'ZAR'
        }),
        sampleData: {
          user_name: 'John Smith',
          days_remaining: 3,
          upgrade_link: 'https://app.mokmzansibooks.com/pricing',
          support_email: 'support@mokmzansibooks.com',
          company_name: 'MOK Mzansi Books',
          grace_period_end: '2024-02-15',
          payment_link: 'https://app.mokmzansibooks.com/payment',
          account_link: 'https://app.mokmzansibooks.com/account',
          last_payment_attempt: '2024-01-10'
        }
      },
      {
        name: 'Account Lockout Email',
        alias: 'account-lockout-email',
        subject: 'Account Suspended - {{company_name}}',
        component: React.createElement(AccountLockoutEmail, {
          userName: '{{user_name}}',
          companyName: '{{company_name}}',
          lockoutDate: '{{lockout_date}}',
          gracePeriodEndDate: '{{grace_period_end}}',
          amountDue: 750.00,
          currency: 'ZAR',
          paymentLink: '{{payment_link}}',
          accountManagementLink: '{{account_link}}',
          supportEmail: '{{contact_email}}',
          supportPhone: '{{support_phone}}',
          daysPastDue: 30
        }),
        sampleData: {
          user_name: 'John Smith',
          lockout_reason: 'Multiple failed payment attempts',
          contact_email: 'support@mokmzansibooks.com',
          appeal_link: 'https://app.mokmzansibooks.com/appeal',
          company_name: 'MOK Mzansi Books',
          lockout_date: '2024-01-15',
          grace_period_end: '2024-02-15',
          payment_link: 'https://app.mokmzansibooks.com/payment',
          account_link: 'https://app.mokmzansibooks.com/account',
          support_phone: '+27 11 123 4567'
        }
      },
      {
        name: 'Trial Reminder Email',
        alias: 'trial-reminder-email',
        subject: 'Your trial ends soon - {{company_name}}',
        component: React.createElement(TrialReminderEmail, {
          name: '{{user_name}}',
          loginUrl: '{{login_url}}'
        }),
        sampleData: {
          user_name: 'John Smith',
          days_left: 7,
          upgrade_link: 'https://app.mokmzansibooks.com/pricing',
          features_used: ['Invoice Management', 'Client Portal', 'Reporting'],
          login_url: 'https://app.mokmzansibooks.com/login'
        }
      },
      {
        name: 'Generic Custom Email',
        alias: 'generic-custom-email',
        subject: '{{email_subject}}',
        component: React.createElement(GenericCustomEmail, {
          recipientName: '{{recipient_name}}',
          emailSubject: '{{email_subject}}',
          emailContent: '{{email_content}}',
          callToActionText: '{{cta_text}}',
          callToActionLink: '{{cta_link}}',
          senderName: '{{sender_name}}',
          companyName: '{{company_name}}',
          additionalInfo: '{{additional_info}}'
        }),
        sampleData: {
          recipient_name: 'John Smith',
          email_subject: 'Important Update from MOK Mzansi Books',
          email_content: 'We wanted to inform you about some exciting updates to our platform. Your feedback has been invaluable in helping us improve our services.',
          cta_text: 'Learn More',
          cta_link: 'https://app.mokmzansibooks.com/updates',
          sender_name: 'Wilson Moabelo',
          company_name: 'MOK Mzansi Books',
          additional_info: 'This update will be rolled out gradually over the next week.'
        }
      },
      {
        name: 'Login Notification',
        alias: 'login-notification',
        subject: 'New login to your MOK Mzansi Books account',
        component: React.createElement(LoginNotificationEmail, {
          userName: '{{user_name}}',
          loginTime: '{{login_time}}',
          loginLocation: '{{login_location}}',
          ipAddress: '{{ip_address}}',
          deviceInfo: '{{device_info}}',
          browserInfo: '{{browser_info}}',
          securityLink: '{{security_link}}',
          supportEmail: '{{support_email}}',
          companyName: '{{company_name}}'
        }),
        sampleData: {
          user_name: 'John Smith',
          login_time: '2024-01-15 14:30:25 SAST',
          login_location: 'Johannesburg, South Africa',
          ip_address: '196.25.1.100',
          device_info: 'MacBook Pro (macOS 14.2)',
          browser_info: 'Chrome 120.0.6099.109',
          security_link: 'https://app.mokmzansibooks.com/security',
          support_email: 'support@mokmzansibooks.com',
          company_name: 'MOK Mzansi Books'
        }
      },
      {
        name: 'Password Reset',
        alias: 'password-reset',
        subject: 'Reset your MOK Mzansi Books password',
        component: React.createElement(PasswordResetEmail, {
          userName: '{{user_name}}',
          resetLink: '{{reset_link}}',
          expirationTime: '{{expiration_time}}',
          requestTime: '{{request_time}}',
          requestLocation: '{{request_location}}',
          supportEmail: '{{support_email}}',
          companyName: '{{company_name}}'
        }),
        sampleData: {
          user_name: 'John Smith',
          reset_link: 'https://app.mokmzansibooks.com/reset-password?token=abc123xyz789',
          expiration_time: '24 hours',
          request_time: '2024-01-15 14:30:25 SAST',
          request_location: 'Johannesburg, South Africa',
          support_email: 'support@mokmzansibooks.com',
          company_name: 'MOK Mzansi Books'
        }
      },
      {
        name: 'Email Verification',
        alias: 'postmark-verification',
        subject: 'Verify your {{company_name}} account',
        component: React.createElement(VerificationEmail, {
          firstName: '{{first_name}}',
          companyName: '{{company_name}}',
          verifyUrl: '{{verify_url}}',
          signature: '{{signature}}'
        }),
        sampleData: {
          first_name: 'John',
          company_name: 'MOK Mzansi Books',
          verify_url: 'http://localhost:8081/auth/verify-email?token=example&uid=abc123',
          signature: 'The MOK Team'
        }
      },
      {
        name: 'Employee Welcome',
        alias: 'employee-welcome-email',
        subject: 'Welcome to {{company_name}} - Set Up Your Account',
        component: React.createElement(EmployeeWelcomeEmail, {
          employeeName: '{{employee_name}}',
          employeeEmail: '{{employee_email}}',
          position: '{{position}}',
          department: '{{department}}',
          companyName: '{{company_name}}',
          passwordCreationLink: '{{password_creation_link}}',
          startDate: '{{start_date}}',
          managerName: '{{manager_name}}',
          supportEmail: '{{support_email}}'
        }),
        sampleData: {
          employee_name: 'Sarah Johnson',
          employee_email: 'sarah.johnson@mokmzansibooks.com',
          position: 'Accountant',
          department: 'Finance',
          company_name: 'MOK Mzansi Books',
          password_creation_link: 'https://app.mokmzansibooks.com/create-password?token=emp123xyz789',
          start_date: '2024-02-01',
          manager_name: 'Wilson Moabelo',
          support_email: 'hr@mokmzansibooks.com'
        }
      }
    ];
  }

  /**
   * Convert React component to HTML string
   */
  private renderTemplateToHtml(component: React.ReactElement): string {
    try {
      const html = renderToStaticMarkup(component);
      // Check if the component already includes DOCTYPE and html tags
      if (html.includes('<!DOCTYPE html>') || html.startsWith('<html')) {
        return html; // Return as-is if it's already a complete HTML document
      }
      // Otherwise wrap with basic HTML structure
      return `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>\n<body>\n${html}\n</body>\n</html>`;
    } catch (error) {
      console.error('Error rendering component to HTML:', error);
      throw error;
    }
  }

  /**
   * Convert HTML to plain text for TextBody
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Check if template exists in Postmark
   */
  private async templateExists(alias: string): Promise<boolean> {
    try {
      await this.client.getTemplate(alias);
      return true;
    } catch (error: any) {
      if (error.code === 1101) { // Template not found
        return false;
      }
      throw error;
    }
  }

  /**
   * Create or update a template in Postmark
   */
  private async deployTemplate(template: TemplateDefinition): Promise<void> {
    console.log(`\n📧 Processing template: ${template.name}`);
    
    try {
      // Render the component to HTML
      const htmlBody = this.renderTemplateToHtml(template.component);
      const textBody = this.htmlToText(htmlBody);
      
      const postmarkTemplate: PostmarkTemplate = {
        Name: template.name,
        Alias: template.alias,
        Subject: template.subject,
        HtmlBody: htmlBody,
        TextBody: textBody,
        TemplateType: Models.TemplateTypes.Standard
      };

      // Check if template exists
      const exists = await this.templateExists(template.alias);
      
      if (exists) {
        console.log(`   ↻ Updating existing template: ${template.alias}`);
        await this.client.editTemplate(template.alias, postmarkTemplate);
        console.log(`   ✅ Updated successfully`);
      } else {
        console.log(`   + Creating new template: ${template.alias}`);
        await this.client.createTemplate(postmarkTemplate);
        console.log(`   ✅ Created successfully`);
      }
      
      // Save HTML to local file for debugging
      const outputDir = path.join(process.cwd(), 'temp', 'postmark-templates');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const htmlFile = path.join(outputDir, `${template.alias}.html`);
      fs.writeFileSync(htmlFile, htmlBody);
      console.log(`   💾 Saved HTML to: ${htmlFile}`);
      
    } catch (error: any) {
      console.error(`   ❌ Failed to deploy ${template.name}:`, error.message);
      throw error;
    }
  }

  /**
   * Deploy all templates to Postmark
   */
  public async deployAllTemplates(): Promise<void> {
    console.log('🚀 Starting Postmark template deployment...');
    console.log(`📡 Using server token: ${this.serverToken.substring(0, 8)}...`);
    
    const templates = this.getTemplateDefinitions();
    console.log(`📋 Found ${templates.length} templates to deploy`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const template of templates) {
      try {
        await this.deployTemplate(template);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Failed to deploy ${template.name}:`, error);
      }
    }
    
    console.log('\n📊 Deployment Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📧 Total: ${templates.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 All templates deployed successfully!');
      console.log('\n📋 Next steps:');
      console.log('   1. Check your Postmark dashboard to verify templates');
      console.log('   2. Test templates using the Postmark interface');
      console.log('   3. Update your application to use template aliases');
    } else {
      console.log('\n⚠️  Some templates failed to deploy. Check the errors above.');
    }
  }

  /**
   * Test template deployment by sending a test email
   */
  public async testTemplate(alias: string, testEmail: string): Promise<void> {
    console.log(`\n🧪 Testing template: ${alias}`);
    
    try {
      const template = this.getTemplateDefinitions().find(t => t.alias === alias);
      if (!template) {
        throw new Error(`Template with alias '${alias}' not found`);
      }
      
      const result = await this.client.sendEmailWithTemplate({
        From: process.env.POSTMARK_SENDER_EMAIL || 'noreply@mokmzansibooks.com',
        To: testEmail,
        TemplateAlias: alias,
        TemplateModel: template.sampleData
      });
      
      console.log(`   ✅ Test email sent successfully`);
      console.log(`   📧 Message ID: ${result.MessageID}`);
      console.log(`   📬 Sent to: ${testEmail}`);
      
    } catch (error: any) {
      console.error(`   ❌ Failed to send test email:`, error.message);
      throw error;
    }
  }
}

// Main execution
async function main() {
  try {
    const deployer = new PostmarkTemplateDeployer();
    
    // Deploy all templates
    await deployer.deployAllTemplates();
    
    // Optionally test a template
    const testEmail = process.env.TEST_EMAIL;
    if (testEmail) {
      console.log(`\n🧪 Testing with email: ${testEmail}`);
      const testAlias = process.env.TEST_TEMPLATE_ALIAS || 'welcome-email';
      await deployer.testTemplate(testAlias, testEmail);
    }
    
  } catch (error: any) {
    console.error('\n💥 Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { PostmarkTemplateDeployer };