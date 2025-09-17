import React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';
import emailConfig from '../config/emailConfig';

interface InvoicePaymentReminderEmailProps {
  clientName: string;
  invoiceNumber: string;
  dueDate: string;
  amountDue: string;
  invoiceLink: string;
  daysUntilDue?: number;
  companyName?: string;
  supportEmail?: string;
}

export const InvoicePaymentReminderEmail: React.FC<InvoicePaymentReminderEmailProps> = ({
  clientName,
  invoiceNumber,
  dueDate,
  amountDue,
  invoiceLink,
  daysUntilDue = 7,
  companyName = emailConfig.company.name,
  supportEmail = emailConfig.company.email,
}) => {
  const getAppBase = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_URL) 
      ? process.env.NEXT_PUBLIC_APP_URL 
      : emailConfig.company.website;
  };
  
  const appBase = getAppBase().replace(/\/$/, '');
  const effectiveInvoiceLink = /^https?:\/\//i.test(invoiceLink)
    ? invoiceLink
    : `${appBase}${invoiceLink.startsWith('/') ? '' : '/'}${invoiceLink}`;

  const urgencyLevel = daysUntilDue <= 3 ? 'urgent' : daysUntilDue <= 7 ? 'moderate' : 'gentle';
  
  const getUrgencyColor = () => {
    switch (urgencyLevel) {
      case 'urgent': return '#EF4444';
      case 'moderate': return '#F59E0B';
      default: return '#3B82F6';
    }
  };

  const getUrgencyMessage = () => {
    switch (urgencyLevel) {
      case 'urgent': return 'This invoice is due very soon. Please prioritize payment.';
      case 'moderate': return 'This invoice is due within a week. Please arrange payment.';
      default: return 'This is a friendly reminder about your upcoming invoice payment.';
    }
  };

  return (
    <BaseEmailTemplate
      title={`Payment Reminder: Invoice ${invoiceNumber} - Due ${dueDate}`}
      previewText={`Payment reminder for invoice ${invoiceNumber} due on ${dueDate}`}
      companyName={companyName}
    >
      <div style={styles.container}>
        {/* Header */}
        <div style={{
          ...styles.header,
          backgroundColor: urgencyLevel === 'urgent' ? '#FEF2F2' : urgencyLevel === 'moderate' ? '#FFFBEB' : '#EFF6FF',
          borderColor: getUrgencyColor()
        }}>
          <h1 style={{
            ...styles.title,
            color: getUrgencyColor()
          }}>
            Payment Reminder
          </h1>
          <p style={styles.subtitle}>
            Invoice {invoiceNumber} - Due {dueDate}
          </p>
        </div>

        {/* Content */}
        <div style={styles.content}>
          <p style={styles.greeting}>Dear {clientName},</p>
          
          <p style={styles.paragraph}>
            {getUrgencyMessage()}
          </p>

          {/* Invoice Details */}
          <div style={styles.invoiceDetails}>
            <h3 style={styles.sectionTitle}>Invoice Details</h3>
            <div style={styles.detailsGrid}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Invoice Number:</span>
                <span style={styles.detailValue}>{invoiceNumber}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Due Date:</span>
                <span style={{
                  ...styles.detailValue,
                  color: urgencyLevel === 'urgent' ? '#EF4444' : '#333',
                  fontWeight: urgencyLevel === 'urgent' ? 'bold' : 'normal'
                }}>
                  {dueDate}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Amount Due:</span>
                <span style={{
                  ...styles.detailValue,
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: getUrgencyColor()
                }}>
                  {amountDue}
                </span>
              </div>
              {daysUntilDue > 0 && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Days Until Due:</span>
                  <span style={{
                    ...styles.detailValue,
                    color: urgencyLevel === 'urgent' ? '#EF4444' : urgencyLevel === 'moderate' ? '#F59E0B' : '#10B981',
                    fontWeight: 'bold'
                  }}>
                    {daysUntilDue} days
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Call to Action */}
          <div style={styles.ctaContainer}>
            <a href={effectiveInvoiceLink} style={{
              ...styles.ctaButton,
              backgroundColor: getUrgencyColor()
            }}>
              View & Pay Invoice
            </a>
          </div>

          {/* Payment Instructions */}
          <div style={styles.paymentInstructions}>
            <h3 style={styles.sectionTitle}>Payment Options</h3>
            <ul style={styles.paymentList}>
              <li style={styles.paymentItem}>Click the button above to view and pay online</li>
              <li style={styles.paymentItem}>Bank transfer to the account details on the invoice</li>
              <li style={styles.paymentItem}>Contact us for alternative payment arrangements</li>
            </ul>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <p style={styles.footerText}>
              If you have already made this payment, please disregard this reminder. 
              If you have any questions or need assistance, please contact us at{' '}
              <a href={`mailto:${supportEmail}`} style={styles.link}>
                {supportEmail}
              </a>{' '}
              or call us at{' '}
              <a href={`tel:${emailConfig.company.phone}`} style={styles.link}>
                {emailConfig.company.phone}
              </a>.
            </p>
            
            <p style={styles.regards}>Thank you for your business!</p>
            <p style={styles.companyName}>{companyName}</p>
          </div>
        </div>
      </div>
    </BaseEmailTemplate>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
    color: '#333',
  },
  header: {
    padding: '20px',
    textAlign: 'center' as const,
    borderRadius: '8px 8px 0 0',
    borderLeft: '4px solid',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '16px',
    margin: '0',
    color: '#6B7280',
  },
  content: {
    padding: '0 20px 20px',
  },
  greeting: {
    fontSize: '16px',
    margin: '0 0 20px 0',
  },
  paragraph: {
    fontSize: '16px',
    margin: '0 0 20px 0',
    lineHeight: '1.6',
  },
  invoiceDetails: {
    backgroundColor: '#F9FAFB',
    padding: '20px',
    borderRadius: '8px',
    margin: '20px 0',
    border: '1px solid #E5E7EB',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
    color: '#111827',
  },
  detailsGrid: {
    display: 'grid',
    gap: '10px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #E5E7EB',
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#4B5563',
  },
  detailValue: {
    color: '#111827',
  },
  ctaContainer: {
    textAlign: 'center' as const,
    margin: '30px 0',
  },
  ctaButton: {
    display: 'inline-block',
    padding: '14px 28px',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
  paymentInstructions: {
    backgroundColor: '#F0F9FF',
    padding: '20px',
    borderRadius: '8px',
    margin: '20px 0',
    border: '1px solid #BAE6FD',
  },
  paymentList: {
    margin: '0',
    paddingLeft: '20px',
  },
  paymentItem: {
    margin: '8px 0',
    color: '#374151',
  },
  footer: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #E5E7EB',
  },
  footerText: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 20px 0',
    lineHeight: '1.5',
  },
  regards: {
    fontSize: '16px',
    margin: '20px 0 5px 0',
    color: '#333',
  },
  companyName: {
    fontSize: '16px',
    fontWeight: 'bold' as const,
    color: '#3B82F6',
    margin: '0',
  },
  link: {
    color: '#3B82F6',
    textDecoration: 'none',
  },
};

export default InvoicePaymentReminderEmail;