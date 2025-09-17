import React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';

interface GenericCustomEmailProps {
  recipientName?: string;
  emailSubject: string;
  emailContent: string;
  callToActionText?: string;
  callToActionLink?: string;
  senderName?: string;
  companyName?: string;
  additionalInfo?: string;
}

export const GenericCustomEmail: React.FC<GenericCustomEmailProps> = ({
  recipientName = 'Valued Customer',
  emailSubject,
  emailContent,
  callToActionText,
  callToActionLink,
  senderName = 'MOK Mzansi Books Team',
  companyName = 'MOK Mzansi Books',
  additionalInfo
}) => {
  return (
    <BaseEmailTemplate
      title={emailSubject}
      previewText={`${emailSubject} - ${companyName}`}
    >
      <div style={{
        padding: '40px 0',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.6',
        color: '#333333'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center' as const,
          marginBottom: '40px'
        }}>
          <h1 style={{
            color: '#2563eb',
            fontSize: '28px',
            fontWeight: 'bold',
            margin: '0 0 10px 0'
          }}>
            {emailSubject}
          </h1>
        </div>

        {/* Greeting */}
        <div style={{
          marginBottom: '30px'
        }}>
          <p style={{
            fontSize: '16px',
            margin: '0 0 20px 0',
            color: '#374151'
          }}>
            Dear {recipientName},
          </p>
        </div>

        {/* Main Content */}
        <div style={{
          marginBottom: '30px',
          backgroundColor: '#f8fafc',
          padding: '30px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div 
            style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#374151',
              whiteSpace: 'pre-line' as const
            }}
            dangerouslySetInnerHTML={{ __html: emailContent }}
          />
        </div>

        {/* Call to Action */}
        {callToActionText && callToActionLink && (
          <div style={{
            textAlign: 'center' as const,
            marginBottom: '30px'
          }}>
            <a
              href={callToActionLink}
              style={{
                display: 'inline-block',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '14px 28px',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                textAlign: 'center' as const
              }}
            >
              {callToActionText}
            </a>
          </div>
        )}

        {/* Additional Information */}
        {additionalInfo && (
          <div style={{
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#fef3c7',
            borderRadius: '6px',
            border: '1px solid #f59e0b'
          }}>
            <p style={{
              fontSize: '14px',
              margin: '0',
              color: '#92400e',
              fontWeight: '500'
            }}>
              <strong>📌 Important:</strong> {additionalInfo}
            </p>
          </div>
        )}

        {/* Closing */}
        <div style={{
          marginBottom: '30px'
        }}>
          <p style={{
            fontSize: '16px',
            margin: '0 0 10px 0',
            color: '#374151'
          }}>
            Best regards,
          </p>
          <p style={{
            fontSize: '16px',
            margin: '0',
            color: '#2563eb',
            fontWeight: 'bold'
          }}>
            {senderName}
          </p>
          <p style={{
            fontSize: '14px',
            margin: '5px 0 0 0',
            color: '#6b7280'
          }}>
            {companyName}
          </p>
        </div>

        {/* Support Information */}
        <div style={{
          textAlign: 'center' as const,
          padding: '20px',
          backgroundColor: '#f1f5f9',
          borderRadius: '6px',
          marginTop: '30px'
        }}>
          <p style={{
            fontSize: '14px',
            margin: '0 0 10px 0',
            color: '#64748b'
          }}>
            Need help? We're here to assist you.
          </p>
          <p style={{
            fontSize: '14px',
            margin: '0',
            color: '#64748b'
          }}>
            Contact us at{' '}
            <a 
              href="mailto:support@mokmzansibooks.com" 
              style={{
                color: '#2563eb',
                textDecoration: 'none'
              }}
            >
              support@mokmzansibooks.com
            </a>
          </p>
        </div>
      </div>
    </BaseEmailTemplate>
  );
};

export default GenericCustomEmail;