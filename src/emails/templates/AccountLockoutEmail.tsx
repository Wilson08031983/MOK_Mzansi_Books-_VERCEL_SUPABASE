import * as React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';
import emailConfig from '../config/emailConfig';

interface AccountLockoutEmailProps {
  userName: string;
  companyName: string;
  lockoutDate: string;
  gracePeriodEndDate: string;
  amountDue: number;
  currency?: string;
  paymentLink: string;
  accountManagementLink: string;
  supportEmail?: string;
  supportPhone?: string;
  daysPastDue: number;
}

export const AccountLockoutEmail: React.FC<AccountLockoutEmailProps> = ({
  userName,
  companyName,
  lockoutDate,
  gracePeriodEndDate,
  amountDue,
  currency = 'ZAR',
  paymentLink,
  accountManagementLink,
  supportEmail,
  supportPhone,
  daysPastDue,
}) => {
  const appBase = (process.env.NEXT_PUBLIC_APP_URL || emailConfig.company.website).replace(/\/$/, '');
  const effectivePaymentLink = /^https?:\/\//i.test(paymentLink)
    ? paymentLink
    : `${appBase}${paymentLink.startsWith('/') ? paymentLink : '/' + paymentLink}`;
  const effectiveAccountLink = /^https?:\/\//i.test(accountManagementLink)
    ? accountManagementLink
    : `${appBase}${accountManagementLink.startsWith('/') ? accountManagementLink : '/' + accountManagementLink}`;

  const effectiveSupportEmail = supportEmail || emailConfig.company.email;
  const effectiveSupportPhone = supportPhone || emailConfig.company.phone;

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

  return (
    <BaseEmailTemplate
      title="Account Temporarily Locked - Payment Required"
      previewText={`Your account has been temporarily locked due to payment issues`}
      companyName={companyName}
    >
      <div style={styles.container}>
        <div style={styles.lockoutBanner}>
          <h2 style={styles.lockoutTitle}>
            🔒 Account Temporarily Locked
          </h2>
        </div>

        <div style={styles.content}>
          <h2 style={styles.heading}>Hi {userName},</h2>
          
          <p style={styles.paragraph}>
            Your account has been temporarily locked as of <strong>{formatDate(lockoutDate)}</strong> due to an outstanding payment that was not received during the grace period.
          </p>

          <div style={styles.lockoutDetails}>
            <h3 style={styles.subheading}>Account Status</h3>
            <div style={styles.statusGrid}>
              <div style={styles.statusItem}>
                <div style={styles.statusIcon}>🔒</div>
                <div style={styles.statusContent}>
                  <div style={styles.statusLabel}>Account Status</div>
                  <div style={styles.statusValue}>Temporarily Locked</div>
                </div>
              </div>
              <div style={styles.statusItem}>
                <div style={styles.statusIcon}>📅</div>
                <div style={styles.statusContent}>
                  <div style={styles.statusLabel}>Locked Since</div>
                  <div style={styles.statusValue}>{formatDate(lockoutDate)}</div>
                </div>
              </div>
              <div style={styles.statusItem}>
                <div style={styles.statusIcon}>💰</div>
                <div style={styles.statusContent}>
                  <div style={styles.statusLabel}>Amount Due</div>
                  <div style={styles.statusValue}>{formatCurrency(amountDue)}</div>
                </div>
              </div>
              <div style={styles.statusItem}>
                <div style={styles.statusIcon}>⏰</div>
                <div style={styles.statusContent}>
                  <div style={styles.statusLabel}>Days Past Due</div>
                  <div style={styles.statusValue}>{daysPastDue} days</div>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.impactSection}>
            <h3 style={styles.subheading}>What this means:</h3>
            <div style={styles.impactList}>
              <div style={styles.impactItem}>
                <span style={styles.impactIcon}>❌</span>
                <span style={styles.impactText}>You cannot access your account dashboard</span>
              </div>
              <div style={styles.impactItem}>
                <span style={styles.impactIcon}>❌</span>
                <span style={styles.impactText}>All premium features are temporarily disabled</span>
              </div>
              <div style={styles.impactItem}>
                <span style={styles.impactIcon}>❌</span>
                <span style={styles.impactText}>You cannot create new invoices, quotations, or manage clients</span>
              </div>
              <div style={styles.impactItem}>
                <span style={styles.impactIcon}>💾</span>
                <span style={styles.impactText}>Your data is safe and will be restored upon payment</span>
              </div>
            </div>
          </div>

          <div style={styles.recoverySection}>
            <h3 style={styles.subheading}>How to restore your account:</h3>
            <div style={styles.stepsList}>
              <div style={styles.step}>
                <div style={styles.stepNumber}>1</div>
                <div style={styles.stepContent}>
                  <div style={styles.stepTitle}>Complete Payment</div>
                  <div style={styles.stepDescription}>Click the button below to update your payment method and complete the outstanding payment.</div>
                </div>
              </div>
              <div style={styles.step}>
                <div style={styles.stepNumber}>2</div>
                <div style={styles.stepContent}>
                  <div style={styles.stepTitle}>Automatic Restoration</div>
                  <div style={styles.stepDescription}>Your account will be automatically restored within minutes of successful payment.</div>
                </div>
              </div>
              <div style={styles.step}>
                <div style={styles.stepNumber}>3</div>
                <div style={styles.stepContent}>
                  <div style={styles.stepTitle}>Resume Normal Use</div>
                  <div style={styles.stepDescription}>All your data and features will be immediately available again.</div>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.buttonContainer}>
            <a href={effectivePaymentLink} style={styles.primaryButton}>
              Restore Account - Pay {formatCurrency(amountDue)}
            </a>
          </div>

          <div style={styles.supportSection}>
            <h3 style={styles.subheading}>Need assistance?</h3>
            <p style={styles.paragraph}>
              Our support team is here to help you resolve any payment issues:
            </p>
            <div style={styles.contactInfo}>
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>📧</span>
                <a href={`mailto:${effectiveSupportEmail}`} style={styles.contactLink}>{effectiveSupportEmail}</a>
              </div>
              {effectiveSupportPhone && (
                <div style={styles.contactItem}>
                  <span style={styles.contactIcon}>📞</span>
                  <a href={`tel:${effectiveSupportPhone}`} style={styles.contactLink}>{effectiveSupportPhone}</a>
                </div>
              )}
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>🔗</span>
                <a href={effectiveAccountLink} style={styles.contactLink}>Account Management</a>
              </div>
            </div>
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              We value your business and want to get you back up and running as quickly as possible. Thank you for your understanding.
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
  lockoutBanner: {
    padding: '20px',
    textAlign: 'center' as const,
    backgroundColor: '#dc2626',
    color: '#fff',
  },
  lockoutTitle: {
    margin: '0',
    fontSize: '20px',
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
  lockoutDetails: {
    backgroundColor: '#fef2f2',
    padding: '20px',
    borderRadius: '8px',
    margin: '20px 0',
    border: '1px solid #fecaca',
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '15px',
    marginTop: '15px',
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statusIcon: {
    fontSize: '20px',
    flexShrink: 0,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    fontSize: '12px',
    color: '#718096',
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  statusValue: {
    fontSize: '14px',
    color: '#2d3748',
    fontWeight: 'bold' as const,
    marginTop: '2px',
  },
  impactSection: {
    margin: '25px 0',
  },
  impactList: {
    margin: '15px 0',
  },
  impactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '10px 0',
    padding: '8px 0',
  },
  impactIcon: {
    fontSize: '16px',
    flexShrink: 0,
  },
  impactText: {
    fontSize: '15px',
    color: '#4a5568',
    lineHeight: 1.4,
  },
  recoverySection: {
    margin: '25px 0',
  },
  stepsList: {
    margin: '20px 0',
  },
  step: {
    display: 'flex',
    gap: '15px',
    margin: '20px 0',
    padding: '15px 0',
    borderBottom: '1px solid #e2e8f0',
  },
  stepNumber: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#3182ce',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: '16px',
    fontWeight: 'bold' as const,
    color: '#2d3748',
    marginBottom: '5px',
  },
  stepDescription: {
    fontSize: '14px',
    color: '#718096',
    lineHeight: 1.5,
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
  supportSection: {
    backgroundColor: '#f8fafc',
    padding: '20px',
    borderRadius: '8px',
    margin: '25px 0',
    border: '1px solid #e2e8f0',
  },
  contactInfo: {
    margin: '15px 0',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '10px 0',
  },
  contactIcon: {
    fontSize: '16px',
    flexShrink: 0,
  },
  contactLink: {
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

export default AccountLockoutEmail;