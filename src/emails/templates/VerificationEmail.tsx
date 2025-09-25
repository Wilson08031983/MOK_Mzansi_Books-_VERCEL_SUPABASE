import React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';
import emailConfig from '../config/emailConfig';

interface VerificationEmailProps {
  firstName: string;
  companyName?: string;
  verifyUrl: string;
  signature?: string;
}

export const VerificationEmail: React.FC<VerificationEmailProps> = ({
  firstName,
  companyName = emailConfig.company.name,
  verifyUrl,
  signature = emailConfig.sender.signature,
}) => {
  const title = `Verify your ${companyName} account`;
  const previewText = `Hi ${firstName}, please verify your email to secure your ${companyName} account.`;

  return (
    <BaseEmailTemplate title={title} previewText={previewText}>
      <div style={{ padding: '24px 0' }}>
        {/* Greeting */}
        <p style={{ fontSize: '16px', color: '#374151', marginBottom: '16px' }}>
          Hello {firstName},
        </p>
        <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
          Welcome to {companyName}! Please confirm your email address to activate your account and keep it secure.
        </p>

        {/* Verify Button */}
        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <a
            href={verifyUrl}
            style={{
              display: 'inline-block',
              backgroundColor: '#4c1d95',
              color: '#ffffff',
              padding: '12px 24px',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.08)',
            }}
          >
            Confirm Email
          </a>
        </div>

        {/* Fallback link */}
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}>
          <p style={{ fontSize: '14px', color: '#374151', fontWeight: 600, marginBottom: '8px' }}>
            Button not working? Copy and paste this link into your browser:
          </p>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            wordBreak: 'break-all',
            fontFamily: 'monospace',
            backgroundColor: '#ffffff',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
          }}>
            {verifyUrl}
          </p>
        </div>

        {/* Security notes */}
        <div style={{
          marginTop: '10px',
          backgroundColor: '#fef3c7',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #f59e0b',
        }}>
          <h3 style={{ color: '#92400e', fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>
            Important
          </h3>
          <ul style={{ color: '#92400e', paddingLeft: '18px' }}>
            <li style={{ marginBottom: '6px' }}>This verification link expires in 24 hours.</li>
            <li style={{ marginBottom: '6px' }}>The link can only be used once.</li>
            <li>If you didn’t create an account, you can safely ignore this email.</li>
          </ul>
        </div>

        {/* Signature */}
        <div style={{ marginTop: '20px', color: '#6b7280', fontSize: '14px' }}>
          <p style={{ whiteSpace: 'pre-line' }}>{signature}</p>
        </div>
      </div>
    </BaseEmailTemplate>
  );
};

export default VerificationEmail;