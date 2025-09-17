import React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';
import emailConfig from '../config/emailConfig';

interface WelcomeEmailProps {
  userName: string;
  loginLink: string;
  supportEmail: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  userName = 'Valued Customer',
  loginLink,
  supportEmail = emailConfig.company.email,
}) => {
  // Browser-safe environment variable access
  const getDefaultLoginLink = () => {
    if (typeof window !== 'undefined') {
      // In browser, use current origin
      return `${window.location.origin}/login`;
    }
    // In server/build time, try to access env vars safely
    const envUrl = typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_APP_URL : null;
    const baseUrl = envUrl || emailConfig.company.website;
    return `${baseUrl.replace(/\/$/, '')}/login`;
  };
  
  const effectiveLoginLink = loginLink || getDefaultLoginLink();
  return (
    <BaseEmailTemplate
      title="Welcome to MOK Mzansi Books"
      previewText="Get started with MOK Mzansi Books - Your all-in-one business management solution"
    >
      <p>Dear {userName},</p>
      
      <p>Welcome to <strong>MOK Mzansi Books</strong>! We're thrilled to have you on board and can't wait to help you streamline your business operations.</p>
      
      <p>With MOK Mzansi Books, you'll be able to:</p>
      <ul style={{marginLeft: '20px', paddingLeft: '0'}}>
        <li>• Manage your finances with our comprehensive accounting tools</li>
        <li>• Track inventory in real-time</li>
        <li>• Generate professional invoices and quotations</li>
        <li>• Monitor business performance with detailed reports</li>
        <li>• And much more!</li>
      </ul>

      <div style={{textAlign: 'center', margin: '30px 0'}}>
        <a href={effectiveLoginLink} className="button" style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: 600,
          margin: '20px 0'
        }}>
          Get Started
        </a>
      </div>

      <p>If you have any questions or need assistance, our support team is here to help. You can reach us at <a href={`mailto:${supportEmail}`} style={{color: '#4f46e5'}}>{supportEmail}</a> or call us at <a href={`tel:${emailConfig.company.phone}`} style={{color: '#4f46e5'}}>{emailConfig.company.phone}</a>.</p>
      
      <p>Once again, welcome to the MOK Mzansi Books family!</p>
      
      <p>Warm regards,</p>
    </BaseEmailTemplate>
  );
};

export default WelcomeEmail;
