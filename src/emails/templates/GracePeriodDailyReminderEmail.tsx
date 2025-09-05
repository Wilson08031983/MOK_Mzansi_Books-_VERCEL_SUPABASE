import * as React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';
import emailConfig from '../config/emailConfig';

interface GracePeriodDailyReminderEmailProps {
  userName: string;
  companyName: string;
  daysRemaining: number;
  gracePeriodEndDate: string;
  paymentLink: string;
  accountManagementLink: string;
  lastPaymentAttempt?: string;
  amountDue: number;
  currency?: string;
}

export const GracePeriodDailyReminderEmail: React.FC<GracePeriodDailyReminderEmailProps> = ({
  userName,
  companyName,
  daysRemaining,
  gracePeriodEndDate,
  paymentLink,
  accountManagementLink,
  lastPaymentAttempt,
  amountDue,
  currency = 'ZAR',
}) => {
  const appBase = (process.env.NEXT_PUBLIC_APP_URL || emailConfig.company.website).replace(/\/$/, '');
  const effectivePaymentLink = /^https?:\/\//i.test(paymentLink)
    ? paymentLink
    : `${appBase}${paymentLink.startsWith('/') ? paymentLink : '/' + paymentLink}`;
  const effectiveAccountLink = /^https?:\/\//i.test(accountManagementLink)
    ? accountManagementLink
    : `${appBase}${accountManagementLink.startsWith('/') ? accountManagementLink : '/' + accountManagementLink}`;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getUrgencyLevel = () => {
    if (daysRemaining <= 1) return 'critical';
    if (daysRemaining <= 3) return 'high';
    return 'medium';
  };

  const urgencyLevel = getUrgencyLevel();

  return (
    <BaseEmailTemplate
      title="Payment Grace Period Reminder"
      previewText={`${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining in your grace period`}
      companyName={companyName}
    >
      <div style={styles.container}>
        <div style={{
          ...styles.urgencyBanner,
          backgroundColor: urgencyLevel === 'critical' ? '#dc2626' : urgencyLevel === 'high' ? '#ea580c' : '#d97706'
        }}>
          <h2 style={styles.urgencyTitle}>
            {urgencyLevel === 'critical' ? '⚠️ URGENT: ' : '⏰ '}
            {daysRemaining} Day{daysRemaining === 1 ? '' : 's'} Remaining
          </h2>
        </div>

        <div style={styles.content}>
          <h2 style={styles.heading}>Hi {userName},</h2>
          
          <p style={styles.paragraph}>
            This is a friendly reminder that your payment grace period will end in <strong>{daysRemaining} day{daysRemaining === 1 ? '' : 's'}</strong> on <strong>{formatDate(gracePeriodEndDate)}</strong>.
          </p>

          <div style={styles.paymentDetails}>
            <h3 style={styles.subheading}>Payment Details</h3>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Amount Due:</span>
              <span style={styles.detailValue}>{formatCurrency(amountDue)}</span>
            </div>
            {lastPaymentAttempt && (
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Last Payment Attempt:</span>
                <span style={styles.detailValue}>{formatDate(lastPaymentAttempt)}</span>
              </div>
            )}
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Grace Period Ends:</span>
              <span style={styles.detailValue}>{formatDate(gracePeriodEndDate)}</span>
            </div>
          </div>

          <div style={styles.actionSection}>
            <h3 style={styles.subheading}>What happens next?</h3>
            <ul style={styles.list}>
              <li style={styles.listItem}>
                <strong>Make payment now:</strong> Update your payment method and complete payment to continue using all features.
              </li>
              <li style={styles.listItem}>
                <strong>If payment is not received:</strong> Your account will be temporarily locked after the grace period ends.
              </li>
              <li style={styles.listItem}>
                <strong>Account recovery:</strong> You can reactivate your account anytime by completing payment.
              </li>
            </ul>
          </div>

          <div style={styles.buttonContainer}>
            <a href={effectivePaymentLink} style={styles.primaryButton}>
              Complete Payment Now
            </a>
          </div>

          <div style={styles.secondaryActions}>
            <p style={styles.paragraph}>
              Need help? <a href={effectiveAccountLink} style={styles.link}>Manage your account</a> or contact our support team.
            </p>
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              This is an automated reminder. We appreciate your business and want to ensure uninterrupted service.
            </p>
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
    color: '#333',
    lineHeight: 1.5,
  },
  urgencyBanner: {
    padding: '15px 20px',
    textAlign: 'center' as const,
    color: '#fff',
    marginBottom: '0',
  },
  urgencyTitle: {
    margin: '0',
    fontSize: '18px',
    fontWeight: 'bold' as const,
  },
  content: {
    padding: '30px 20px',
  },
  heading: {
    color: '#1a365d',
    fontSize: '24px',
    marginBottom: '20px',
    margin: '0 0 20px 0',
  },
  subheading: {
    color: '#2d3748',
    fontSize: '18px',
    marginBottom: '15px',
    margin: '25px 0 15px 0',
  },
  paragraph: {
    margin: '15px 0',
    fontSize: '16px',
    lineHeight: 1.6,
    color: '#4a5568',
  },
  paymentDetails: {
    backgroundColor: '#f8fafc',
    padding: '20px',
    borderRadius: '8px',
    margin: '20px 0',
    border: '1px solid #e2e8f0',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #e2e8f0',
  },
  detailLabel: {
    fontSize: '14px',
    color: '#718096',
    fontWeight: '500' as const,
  },
  detailValue: {
    fontSize: '14px',
    color: '#2d3748',
    fontWeight: 'bold' as const,
  },
  actionSection: {
    margin: '25px 0',
  },
  list: {
    paddingLeft: '20px',
    margin: '15px 0',
  },
  listItem: {
    margin: '10px 0',
    fontSize: '15px',
    lineHeight: 1.5,
    color: '#4a5568',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '30px 0',
  },
  primaryButton: {
    display: 'inline-block',
    padding: '15px 30px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 'bold' as const,
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
  },
  secondaryActions: {
    textAlign: 'center' as const,
    margin: '20px 0',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500' as const,
  },
  footer: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: '14px',
    color: '#718096',
    margin: '0',
    fontStyle: 'italic' as const,
  },
};

export default GracePeriodDailyReminderEmail;