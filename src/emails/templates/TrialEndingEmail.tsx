import React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';

interface TrialEndingEmailProps {
  userName: string;
  daysLeft: number; // can be 0 or negative when expired
  upgradeLink?: string;
  supportEmail?: string;
}

export const TrialEndingEmail: React.FC<TrialEndingEmailProps> = ({
  userName = 'Valued Customer',
  daysLeft,
  upgradeLink = 'https://app.mokmzansibooks.com/pricing',
  supportEmail = 'support@mokmzansibooks.com',
}) => {
  const expired = daysLeft <= 0;
  const title = expired ? 'Your MOK Mzansi Books trial has ended' : `Your trial ends in ${daysLeft} day${Math.abs(daysLeft) === 1 ? '' : 's'}`;
  const previewText = expired
    ? 'Your access is now limited. Upgrade to continue with full features.'
    : `Keep your momentum going—upgrade now to keep full access after your ${daysLeft}-day trial ends.`;

  return (
    <BaseEmailTemplate title={title} previewText={previewText}>
      <p>Dear {userName},</p>

      {expired ? (
        <>
          <p>Your free trial has ended. You can continue to use MOK Mzansi Books with limited access, but to unlock all features—including full invoicing, quotations, inventory, HR, and accounting—you'll need to upgrade.</p>
          <div style={{textAlign: 'center', margin: '30px 0'}}>
            <a href={upgradeLink} className="button" style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              margin: '20px 0'
            }}>
              Upgrade Now
            </a>
          </div>
        </>
      ) : (
        <>
          <p>A quick reminder that your free trial ends in <strong>{daysLeft} day{daysLeft === 1 ? '' : 's'}</strong>. To keep uninterrupted access to all premium features, please upgrade your plan.</p>
          <ul style={{marginLeft: '20px', paddingLeft: '0'}}>
            <li>• Unlimited invoices and quotations</li>
            <li>• Full inventory management</li>
            <li>• Advanced accounting and HR tools</li>
            <li>• Priority support</li>
          </ul>
          <div style={{textAlign: 'center', margin: '30px 0'}}>
            <a href={upgradeLink} className="button" style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              margin: '20px 0'
            }}>
              Upgrade to Pro
            </a>
          </div>
        </>
      )}

      <p>If you have any questions, reply to this email or contact us at <a href={`mailto:${supportEmail}`} style={{color: '#4f46e5'}}>{supportEmail}</a>.</p>

      <p>Thank you for choosing MOK Mzansi Books!</p>
    </BaseEmailTemplate>
  );
};

export default TrialEndingEmail;