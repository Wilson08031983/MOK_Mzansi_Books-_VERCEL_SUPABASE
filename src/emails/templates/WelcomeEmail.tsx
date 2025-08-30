import React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';

interface WelcomeEmailProps {
  userName: string;
  loginLink: string;
  supportEmail: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  userName = 'Valued Customer',
  loginLink = 'https://app.mokmzansibooks.com/login',
  supportEmail = 'support@mokmzansibooks.com',
}) => {
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
        <a href={loginLink} className="button" style={{
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

      <p>If you have any questions or need assistance, our support team is here to help. You can reach us at <a href={`mailto:${supportEmail}`} style={{color: '#4f46e5'}}>{supportEmail}</a> or call us at <a href="tel:+27645504029" style={{color: '#4f46e5'}}>+27 64 550 4029</a>.</p>
      
      <p>Once again, welcome to the MOK Mzansi Books family!</p>
      
      <p>Warm regards,</p>
    </BaseEmailTemplate>
  );
};

export default WelcomeEmail;
