import React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';
import emailConfig from '../config/emailConfig';

export interface EmployeeWelcomeEmailProps {
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

export const EmployeeWelcomeEmail: React.FC<EmployeeWelcomeEmailProps> = ({
  employeeName,
  employeeEmail,
  position,
  department,
  companyName,
  passwordCreationLink,
  startDate,
  managerName,
  supportEmail = emailConfig.company.email,
}) => {
  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6',
      color: '#333333',
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '30px',
      padding: '20px',
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      color: 'white',
      borderRadius: '8px',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      margin: '0 0 10px 0',
    },
    subtitle: {
      fontSize: '16px',
      margin: '0',
      opacity: 0.9,
    },
    content: {
      padding: '0 20px',
    },
    paragraph: {
      fontSize: '16px',
      marginBottom: '16px',
      lineHeight: '1.6',
    },
    infoBox: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '20px',
      margin: '20px 0',
    },
    infoTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '12px',
      color: '#4f46e5',
    },
    infoItem: {
      fontSize: '14px',
      marginBottom: '8px',
      color: '#64748b',
    },
    ctaButton: {
      display: 'inline-block',
      padding: '14px 28px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '6px',
      fontWeight: 'bold',
      fontSize: '16px',
      textAlign: 'center' as const,
      margin: '20px 0',
    },
    stepsList: {
      paddingLeft: '20px',
      marginBottom: '20px',
    },
    stepItem: {
      marginBottom: '8px',
      fontSize: '15px',
    },
    note: {
      background: '#fef3c7',
      border: '1px solid #f59e0b',
      borderRadius: '6px',
      padding: '12px',
      fontSize: '14px',
      color: '#92400e',
      margin: '20px 0',
    },
    divider: {
      height: '1px',
      background: '#e2e8f0',
      margin: '30px 0',
    },
    supportText: {
      fontSize: '14px',
      color: '#64748b',
      textAlign: 'center' as const,
    },
    link: {
      color: '#4f46e5',
      textDecoration: 'none',
    },
    linkNote: {
      fontSize: '12px',
      color: '#64748b',
      marginTop: '10px',
    },
    rawLink: {
      fontSize: '12px',
      color: '#4f46e5',
      wordBreak: 'break-all' as const,
      background: '#f1f5f9',
      padding: '8px',
      borderRadius: '4px',
      margin: '8px 0',
    },
  };

  return (
    <BaseEmailTemplate
      title={`Welcome to ${companyName}!`}
      previewText={`Welcome ${employeeName}! Set up your account to get started.`}
    >
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome to the Team! 🎉</h1>
          <p style={styles.subtitle}>We're excited to have you join {companyName}</p>
        </div>

        <div style={styles.content}>
          <p style={styles.paragraph}>Dear {employeeName},</p>

          <p style={styles.paragraph}>
            Welcome to <strong>{companyName}</strong>! We're thrilled to have you join our team as our new {position} in the {department} department.
          </p>

          <div style={styles.infoBox}>
            <h3 style={styles.infoTitle}>Your Employment Details</h3>
            <p style={styles.infoItem}><strong>Name:</strong> {employeeName}</p>
            <p style={styles.infoItem}><strong>Email:</strong> {employeeEmail}</p>
            <p style={styles.infoItem}><strong>Position:</strong> {position}</p>
            <p style={styles.infoItem}><strong>Department:</strong> {department}</p>
            <p style={styles.infoItem}><strong>Start Date:</strong> {startDate}</p>
            {managerName && (
              <p style={styles.infoItem}><strong>Manager:</strong> {managerName}</p>
            )}
          </div>

          <h3 style={styles.infoTitle}>Next Steps - Set Up Your Account</h3>
          <p style={styles.paragraph}>
            To access your employee portal and company systems, you'll need to create your secure password:
          </p>

          <div style={{ textAlign: 'center', margin: '28px 0' }}>
            <a href={passwordCreationLink} style={styles.ctaButton}>
              Create Your Password & Access Account
            </a>
            <p style={styles.linkNote}>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style={styles.rawLink}>{passwordCreationLink}</p>
          </div>

          <h3 style={styles.infoTitle}>What You'll Have Access To:</h3>
          <ol style={styles.stepsList}>
            <li style={styles.stepItem}>Employee portal with your personal information</li>
            <li style={styles.stepItem}>Company directory and team contacts</li>
            <li style={styles.stepItem}>HR documents and policies</li>
            <li style={styles.stepItem}>Time and attendance tracking</li>
            <li style={styles.stepItem}>Payroll and benefits information</li>
            <li style={styles.stepItem}>Company announcements and updates</li>
          </ol>

          <div style={styles.note}>
            <strong>Important:</strong> For security reasons, this password creation link will expire in 24 hours. Please set up your account as soon as possible.
          </div>

          <p style={styles.paragraph}>
            We're committed to making your onboarding experience smooth and welcoming. If you have any questions or need assistance, please don't hesitate to reach out.
          </p>

          <div style={styles.divider} />

          <p style={styles.supportText}>
            Need help? Contact our HR team at{' '}
            <a href={`mailto:${supportEmail}`} style={styles.link}>
              {supportEmail}
            </a>
            {emailConfig.company.phone && (
              <>
                {' '}or call us at{' '}
                <a href={`tel:${emailConfig.company.phone}`} style={styles.link}>
                  {emailConfig.company.phone}
                </a>
              </>
            )}
          </p>

          <p style={styles.paragraph}>
            Welcome aboard, and we look forward to working with you!
          </p>

          <p style={styles.paragraph}>
            Best regards,<br />
            The {companyName} Team
          </p>
        </div>
      </div>
    </BaseEmailTemplate>
  );
};

export default EmployeeWelcomeEmail;