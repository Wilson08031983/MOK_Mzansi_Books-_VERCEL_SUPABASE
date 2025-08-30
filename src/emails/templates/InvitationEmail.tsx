import * as React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';

export interface InvitationEmailProps {
  recipientName?: string;
  recipientEmail: string;
  inviterName: string;
  role: string;
  invitationLink: string;
  // Company branding and details
  companyName: string;
  companyEmail?: string;
  companyPhone?: string;
  companyWebsite?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  logoUrl?: string;
  stampUrl?: string;
  signatureUrl?: string;
}

export const InvitationEmail: React.FC<InvitationEmailProps> = ({
  recipientName,
  recipientEmail,
  inviterName,
  role,
  invitationLink,
  companyName,
  companyEmail,
  companyPhone,
  companyWebsite,
  addressLine1,
  addressLine2,
  addressLine3,
  addressLine4,
  logoUrl,
  stampUrl,
  signatureUrl,
}) => {
  return (
    <BaseEmailTemplate
      title={`Invitation to join ${companyName}`}
      previewText={`${inviterName} invited you to join ${companyName} as ${role}`}
      companyName={companyName}
      companyEmail={companyEmail}
      companyPhone={companyPhone}
      companyWebsite={companyWebsite}
      addressLine1={addressLine1}
      addressLine2={addressLine2}
      addressLine3={addressLine3}
      addressLine4={addressLine4}
      logoUrl={logoUrl}
      stampUrl={stampUrl}
      signatureUrl={signatureUrl}
    >
      <div style={styles.container}>
        <h2 style={styles.heading}>You're invited to join {companyName}</h2>
        <p style={styles.paragraph}>
          {recipientName ? `Hello ${recipientName},` : 'Hello,'}
        </p>
        <p style={styles.paragraph}>
          {inviterName} has invited you to join <strong>{companyName}</strong> as a <strong>{role}</strong>.
          Use the secure button below to complete your registration and set your password.
        </p>

        <div style={styles.infoBox}>
          <p style={styles.infoTitle}>Your invitation details</p>
          <p style={styles.infoItem}><strong>Email:</strong> {recipientEmail}</p>
          <p style={styles.infoItem}><strong>Role:</strong> {role}</p>
        </div>

        <div style={{ textAlign: 'center', margin: '28px 0' }}>
          <a href={invitationLink} style={styles.ctaButton}>
            Accept Invitation & Create Password
          </a>
          <p style={styles.linkNote}>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style={styles.rawLink}>{invitationLink}</p>
        </div>

        <h3 style={styles.subHeading}>What happens next?</h3>
        <ol style={styles.stepsList}>
          <li>Click the "Accept Invitation" button</li>
          <li>Create your secure password</li>
          <li>Sign in with your email and password</li>
        </ol>

        <p style={styles.note}>For your security, this invitation link will automatically expire in 24 hours.</p>

        <div style={styles.divider} />

        <p style={styles.supportText}>
          Need help? Contact our team at {companyEmail ? (
            <a href={`mailto:${companyEmail}`} style={styles.link}>{companyEmail}</a>
          ) : 'your company support email'}.
        </p>
      </div>
    </BaseEmailTemplate>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { fontSize: 16, color: '#374151' },
  heading: { fontSize: 22, margin: '0 0 12px 0', color: '#111827' },
  subHeading: { fontSize: 18, margin: '16px 0 8px 0', color: '#111827' },
  paragraph: { margin: '0 0 12px 0' },
  infoBox: { background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: 16 },
  infoTitle: { margin: '0 0 8px 0', fontWeight: 600, color: '#111827' },
  infoItem: { margin: '2px 0' },
  ctaButton: { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: '#fff', padding: '12px 20px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, display: 'inline-block' },
  linkNote: { fontSize: 12, color: '#6B7280', marginTop: 8 },
  rawLink: { wordBreak: 'break-all', fontSize: 12, color: '#374151' },
  stepsList: { paddingLeft: 18, margin: '0 0 12px 0' },
  note: { fontSize: 13, color: '#6B7280' },
  divider: { borderTop: '1px solid #E5E7EB', margin: '18px 0' },
  supportText: { fontSize: 14, color: '#374151' },
  link: { color: '#4f46e5', textDecoration: 'none' },
};

export default InvitationEmail;