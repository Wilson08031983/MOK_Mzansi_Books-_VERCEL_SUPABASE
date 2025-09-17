import React, { useState } from 'react';
import { WelcomeEmail } from '../emails/templates/WelcomeEmail';
import { BirthdayEmail } from '../emails/templates/BirthdayEmail';
import { TrialEndingEmail } from '../emails/templates/TrialEndingEmail';
import { InvoiceEmail } from '../emails/templates/InvoiceEmail';
import { QuotationEmail } from '../emails/templates/QuotationEmail';
import { InvitationEmail } from '../emails/templates/InvitationEmail';
import { LowStockEmail } from '../emails/templates/LowStockEmail';
import { OverdueInvoiceEmail } from '../emails/templates/OverdueInvoiceEmail';
import { PaymentReminderEmail } from '../emails/templates/PaymentReminderEmail';
import { GenericCustomEmail } from '../emails/templates/GenericCustomEmail';
import { InvoicePaymentReminderEmail } from '../emails/templates/InvoicePaymentReminderEmail';
import { LoginNotificationEmail } from '../emails/templates/LoginNotificationEmail';
import { PasswordResetEmail } from '../emails/templates/PasswordResetEmail';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Authentication' | 'Business' | 'HR' | 'Notifications' | 'Billing';
  component: React.ReactNode;
}

const EmailTemplatePreview: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('welcome');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Sample data for template previews
  const sampleData = {
    client: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      company: 'Smith Enterprises'
    },
    invoice: {
      number: 'INV-2024-001',
      date: '2024-01-15',
      dueDate: '2024-02-15',
      items: [
        { description: 'Web Development Services', quantity: 40, unitPrice: 'R150.00', amount: 'R6,000.00' },
        { description: 'Domain & Hosting Setup', quantity: 1, unitPrice: 'R500.00', amount: 'R500.00' }
      ],
      subtotal: 'R6,500.00',
      tax: 'R975.00',
      total: 'R7,475.00'
    },
    quotation: {
      number: 'QUO-2024-001',
      date: '2024-01-10',
      validUntil: '2024-02-10',
      items: [
        { description: 'Business Website Design', quantity: 1, unitPrice: 'R8,500.00', amount: 'R8,500.00' },
        { description: 'SEO Optimization', quantity: 1, unitPrice: 'R2,000.00', amount: 'R2,000.00' }
      ],
      subtotal: 'R10,500.00',
      tax: 'R1,575.00',
      total: 'R12,075.00'
    }
  };

  const emailTemplates: EmailTemplate[] = [
    {
      id: 'welcome',
      name: 'Welcome Email',
      description: 'Sent to new users after successful registration',
      category: 'Authentication',
      component: (
        <WelcomeEmail
          userName="John Smith"
          loginLink="https://app.mokmzansibooks.com/login"
          supportEmail="support@mokmzansibooks.com"
        />
      )
    },
    {
      id: 'invitation',
      name: 'Team Invitation Email',
      description: 'Professional invitation sent to new team members',
      category: 'Authentication',
      component: (
        <InvitationEmail
          recipientName="Jane Doe"
          recipientEmail="jane.doe@example.com"
          inviterName="Wilson Moabelo"
          role="Accountant"
          invitationLink="https://app.mokmzansibooks.com/accept-invitation/abc123"
          companyName="MOK Mzansi Books"
          companyEmail="admin@mokmzansibooks.com"
        />
      )
    },
    {
      id: 'trial-ending',
      name: 'Trial Ending Email',
      description: 'Reminder email sent when trial is about to expire',
      category: 'Billing',
      component: (
        <TrialEndingEmail
          userName="John Smith"
          daysLeft={5}
          upgradeLink="https://app.mokmzansibooks.com/pricing"
          supportEmail="support@mokmzansibooks.com"
        />
      )
    },
    {
      id: 'payment-reminder',
      name: 'Payment Reminder Email',
      description: 'Friendly reminder for upcoming invoice payments',
      category: 'Billing',
      component: (
        <PaymentReminderEmail
          clientName={sampleData.client.name}
          invoiceNumber={sampleData.invoice.number}
          dueDate={sampleData.invoice.dueDate}
          amountDue={sampleData.invoice.total}
          invoiceLink="https://app.mokmzansibooks.com/invoice/INV-2024-001"
          supportEmail="support@mokmzansibooks.com"
        />
      )
    },
    {
      id: 'overdue-invoice',
      name: 'Overdue Invoice Email',
      description: 'Urgent notice for overdue payments with immediate action required',
      category: 'Billing',
      component: (
        <OverdueInvoiceEmail
          clientName={sampleData.client.name}
          invoiceNumber={sampleData.invoice.number}
          dueDate={sampleData.invoice.dueDate}
          amountDue={sampleData.invoice.total}
          invoiceLink="https://app.mokmzansibooks.com/invoice/INV-2024-001"
          daysOverdue={15}
          supportEmail="support@mokmzansibooks.com"
        />
      )
    },
    {
      id: 'birthday',
      name: 'Birthday Email',
      description: 'Birthday wishes sent to employees',
      category: 'HR',
      component: (
        <BirthdayEmail
          employeeName="Sarah Johnson"
          age={28}
          companyName="MOK Mzansi Books"
          senderName="Wilson Mokgethwa Moabelo"
        />
      )
    },
    {
      id: 'low-stock',
      name: 'Low Stock Alert Email',
      description: 'Alert for inventory items running low in stock',
      category: 'Notifications',
      component: (
        <LowStockEmail
          items={[
            { name: 'Office Paper A4', currentStock: 5, minimumStock: 20, sku: 'OFF-001' },
            { name: 'Printer Ink Cartridge', currentStock: 2, minimumStock: 10, sku: 'INK-002' }
          ]}
          inventoryLink="https://app.mokmzansibooks.com/inventory"
          companyName="MOK Mzansi Books"
        />
      )
    },
    {
      id: 'invoice',
      name: 'Invoice Email',
      description: 'Professional invoice sent to clients',
      category: 'Business',
      component: (
        <InvoiceEmail
          clientName={sampleData.client.name}
          invoiceNumber={sampleData.invoice.number}
          invoiceDate={sampleData.invoice.date}
          dueDate={sampleData.invoice.dueDate}
          amountDue={sampleData.invoice.total}
          invoiceLink="https://app.mokmzansibooks.com/invoice/INV-2024-001"
          companyName="MOK Mzansi Books"
          items={sampleData.invoice.items}
          subtotal={sampleData.invoice.subtotal}
          tax={sampleData.invoice.tax}
          total={sampleData.invoice.total}
          notes="Payment terms: Net 30 days. Late payments may incur additional charges."
        />
      )
    },
    {
      id: 'quotation',
      name: 'Quotation Email',
      description: 'Professional quotation sent to potential clients',
      category: 'Business',
      component: (
        <QuotationEmail
          clientName={sampleData.client.name}
          quotationNumber={sampleData.quotation.number}
          quotationDate={sampleData.quotation.date}
          validUntil={sampleData.quotation.validUntil}
          amount={sampleData.quotation.total}
          quotationLink="https://app.mokmzansibooks.com/quotation/QUO-2024-001"
          companyName="MOK Mzansi Books"
          companyEmail="support@mokmzansibooks.com"
          items={sampleData.quotation.items}
          subtotal={sampleData.quotation.subtotal}
          tax={sampleData.quotation.tax}
          total={sampleData.quotation.total}
          notes="This quotation is valid for 30 days from the date of issue."
        />
      )
    },
    {
      id: 'generic-custom',
      name: 'Generic Custom Email',
      description: 'Customizable email template with dynamic subject and content',
      category: 'Business',
      component: (
        <GenericCustomEmail
          recipientName="John Smith"
          emailSubject="Important Update"
          emailContent="We wanted to inform you about some exciting updates to our services. Our team has been working hard to improve your experience with MOK Mzansi Books."
          callToActionText="Learn More"
          callToActionLink="https://app.mokmzansibooks.com/updates"
          additionalInfo="If you have any questions, please don't hesitate to contact us."
          senderName="Wilson Mokgethwa Moabelo"
          companyName="MOK Mzansi Books"
        />
      )
    },
    {
      id: 'invoice-payment-reminder',
      name: 'Invoice Payment Reminder',
      description: 'Payment reminder for specific invoices with due dates',
      category: 'Billing',
      component: (
        <InvoicePaymentReminderEmail
          clientName="John Smith"
          invoiceNumber="INV-2024-001"
          dueDate="2024-02-15"
          amountDue="R7,475.00"
          invoiceLink="https://app.mokmzansibooks.com/invoice/INV-2024-001"
          daysUntilDue={7}
          companyName="MOK Mzansi Books"
          supportEmail="support@mokmzansibooks.com"
        />
      )
    },
    {
      id: 'login-notification',
      name: 'Login Notification',
      description: 'Security alert for new account logins',
      category: 'Authentication',
      component: (
        <LoginNotificationEmail
          userName="John Smith"
          loginTime="2024-01-15 14:30:25 SAST"
          loginLocation="Cape Town, South Africa"
          deviceInfo="Chrome on Windows 11"
          ipAddress="196.25.1.100"
          companyName="MOK Mzansi Books"
          supportEmail="support@mokmzansibooks.com"
          securityLink="https://app.mokmzansibooks.com/account/security"
        />
      )
    },
    {
      id: 'password-reset',
      name: 'Password Reset',
      description: 'Secure password reset instructions for account recovery',
      category: 'Authentication',
      component: (
        <PasswordResetEmail
          userName="John Smith"
          resetLink="https://app.mokmzansibooks.com/reset-password?token=abc123xyz"
          expirationTime="1 hour"
          supportEmail="support@mokmzansibooks.com"
          companyName="MOK Mzansi Books"
        />
      )
    }
  ];

  const categories = ['all', 'Authentication', 'Business', 'HR', 'Notifications', 'Billing'];
  
  const filteredTemplates = selectedCategory === 'all' 
    ? emailTemplates 
    : emailTemplates.filter(template => template.category === selectedCategory);

  const selectedTemplateData = emailTemplates.find(template => template.id === selectedTemplate);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-xl font-bold text-gray-900 mb-0.5">
            Email Template Preview
          </h1>
          <p className="text-gray-600 text-xs">
            Review all available email templates with their design and layout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {category === 'all' ? 'All Templates' : category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template List */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Templates</h3>
                <div className="space-y-2">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`w-full text-left p-3 rounded-md border transition-colors ${
                        selectedTemplate === template.id
                          ? 'bg-blue-50 border-blue-200 text-blue-900'
                          : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{template.description}</div>
                      <div className="text-xs mt-1">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          template.category === 'Authentication' ? 'bg-green-100 text-green-800' :
                          template.category === 'Business' ? 'bg-blue-100 text-blue-800' :
                          template.category === 'HR' ? 'bg-purple-100 text-purple-800' :
                          template.category === 'Notifications' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {template.category}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Preview Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Preview Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedTemplateData?.name}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {selectedTemplateData?.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTemplateData?.category === 'Authentication' ? 'bg-green-100 text-green-800' :
                      selectedTemplateData?.category === 'Business' ? 'bg-blue-100 text-blue-800' :
                      selectedTemplateData?.category === 'HR' ? 'bg-purple-100 text-purple-800' :
                      selectedTemplateData?.category === 'Notifications' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedTemplateData?.category}
                    </span>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                      View Source Code
                    </button>
                  </div>
                </div>
              </div>

              {/* Email Preview */}
              <div className="p-6">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="bg-white rounded-md shadow-sm max-w-2xl mx-auto">
                    <div className="transform scale-90 origin-top">
                      {selectedTemplateData?.component}
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Template Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Template ID:</span>
                    <span className="ml-2 text-gray-600">{selectedTemplateData?.id}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="ml-2 text-gray-600">{selectedTemplateData?.category}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">File Location:</span>
                    <span className="ml-2 text-gray-600 font-mono text-xs">
                      /src/emails/templates/{selectedTemplateData?.name.replace(' ', '')}.tsx
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Base Template:</span>
                    <span className="ml-2 text-gray-600">BaseEmailTemplate.tsx</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-blue-600">{emailTemplates.length}</div>
            <div className="text-sm text-gray-600">Total Templates</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-green-600">
              {emailTemplates.filter(t => t.category === 'Business').length}
            </div>
            <div className="text-sm text-gray-600">Business Templates</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-purple-600">
              {emailTemplates.filter(t => t.category === 'HR').length}
            </div>
            <div className="text-sm text-gray-600">HR Templates</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-red-600">
              {emailTemplates.filter(t => t.category === 'Billing').length}
            </div>
            <div className="text-sm text-gray-600">Billing Templates</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplatePreview;