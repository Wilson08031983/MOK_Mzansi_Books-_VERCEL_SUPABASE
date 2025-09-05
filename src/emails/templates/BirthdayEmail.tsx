import * as React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';
import emailConfig from '../config/emailConfig';

export interface BirthdayEmailProps {
  employeeName: string;
  age?: number;
  companyName: string;
  senderName: string;
}

export const BirthdayEmail: React.FC<BirthdayEmailProps> = ({
  employeeName,
  age,
  companyName,
  senderName,
}) => {
  return (
    <BaseEmailTemplate
      title="Happy Birthday! 🎉"
      previewText={`Wishing ${employeeName} a wonderful birthday!`}
      companyName={companyName}
      companyEmail={emailConfig.company.email}
      companyPhone={emailConfig.company.phone}
      companyAddress={emailConfig.company.address}
    >
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Happy Birthday, {employeeName}! 🎂</h1>
          {age && <p style={styles.subtitle}>Wishing you an amazing {age}th birthday!</p>}
        </div>
        
        <div style={styles.content}>
          <p style={styles.paragraph}>
            On behalf of everyone at {companyName}, we want to wish you a fantastic birthday 
            filled with joy, laughter, and all the things that make you happy!
          </p>
          
          <div style={styles.quote}>
            <p style={styles.quoteText}>
              "May your special day be as wonderful as you are!"
            </p>
          </div>
          
          <p style={styles.paragraph}>
            Thank you for being an invaluable part of our team. We appreciate all that you do!
          </p>
          
          <div style={styles.signature}>
            <p style={styles.signatureName}>{senderName}</p>
            <p style={styles.signatureTitle}>CEO & Founder</p>
            <p style={styles.signatureCompany}>{companyName}</p>
          </div>
        </div>
        
        <div style={styles.footer}>
          <p style={styles.footerText}>
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </BaseEmailTemplate>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    lineHeight: 1.5,
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    textAlign: 'center' as const,
    padding: '20px 0',
    borderBottom: '1px solid #eaeaea',
    marginBottom: '20px',
  },
  title: {
    fontSize: '28px',
    color: '#2563eb',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '18px',
    color: '#64748b',
    margin: '10px 0 0 0',
  },
  content: {
    padding: '0 20px 20px',
  },
  paragraph: {
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 20px 0',
  },
  quote: {
    backgroundColor: '#f8fafc',
    borderLeft: '4px solid #2563eb',
    padding: '15px',
    margin: '20px 0',
    fontStyle: 'italic',
    color: '#334155',
  },
  quoteText: {
    margin: '0',
    fontSize: '16px',
  },
  signature: {
    margin: '30px 0 0 0',
    paddingTop: '20px',
    borderTop: '1px solid #eaeaea',
  },
  signatureName: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    margin: '0 0 5px 0',
  },
  signatureTitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 5px 0',
  },
  signatureCompany: {
    fontSize: '14px',
    color: '#2563eb',
    margin: '0',
  },
  footer: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '0 0 8px 8px',
    textAlign: 'center' as const,
    fontSize: '12px',
    color: '#64748b',
  },
  footerText: {
    margin: '0 0 10px 0',
  },
};
