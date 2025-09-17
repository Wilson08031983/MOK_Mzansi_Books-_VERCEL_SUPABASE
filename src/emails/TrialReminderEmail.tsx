import { 
  Body, 
  Button, 
  Container, 
  Head, 
  Hr, 
  Html, 
  Img, 
  Preview, 
  Section, 
  Text 
} from '@react-email/components';
import * as React from 'react';
import { BaseEmailTemplate } from './templates/BaseEmailTemplate';
import emailConfig from './config/emailConfig';

interface TrialReminderEmailProps {
  name: string;
  loginUrl?: string;
}

export const TrialReminderEmail = ({ name, loginUrl }: TrialReminderEmailProps) => {
  const getAppBase = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_URL) 
      ? process.env.NEXT_PUBLIC_APP_URL 
      : emailConfig.company.website;
  };
  
  const appBase = getAppBase().replace(/\/$/, '');
  const effectiveLoginUrl = loginUrl || `${appBase}/login`;
  const companyName = emailConfig.company.name;

  return (
    <BaseEmailTemplate
      title={`Your ${companyName} Trial is Ending Soon!`}
      previewText={`Your ${companyName} trial is ending soon. Upgrade to keep access.`}
    >
      <p>Hi {name},</p>
      <p>
        Your 30-day trial of {companyName} is ending soon. We hope you've enjoyed full access to our features.
      </p>
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <a
          href={effectiveLoginUrl}
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: 600,
            margin: '20px 0'
          }}
        >
          Upgrade to a Paid Plan
        </a>
      </div>
      <p>
        If you have any questions, please don't hesitate to contact our support team at
        {' '}<a href={`mailto:${emailConfig.company.email}`} style={{ color: '#4f46e5' }}>{emailConfig.company.email}</a>.
      </p>
    </BaseEmailTemplate>
  );
};

export default TrialReminderEmail;