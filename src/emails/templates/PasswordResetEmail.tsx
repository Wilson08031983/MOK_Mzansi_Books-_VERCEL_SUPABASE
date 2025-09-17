import React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';

interface PasswordResetEmailProps {
  userName: string;
  resetLink: string;
  expirationTime?: string;
  requestTime?: string;
  requestLocation?: string;
  supportEmail?: string;
  companyName?: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  userName,
  resetLink,
  expirationTime = '24 hours',
  requestTime,
  requestLocation,
  supportEmail = 'support@mokmzansibooks.com',
  companyName = 'MOK Mzansi Books'
}) => {
  return (
    <BaseEmailTemplate
      title="Reset your MOK Mzansi Books password"
      previewText={`Password reset requested for ${userName} - expires in ${expirationTime}`}
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
          <div style={{
            backgroundColor: '#eff6ff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #3b82f6',
            marginBottom: '20px'
          }}>
            <h1 style={{
              color: '#1d4ed8',
              fontSize: '24px',
              fontWeight: 'bold',
              margin: '0 0 10px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              🔑 Password Reset Request
            </h1>
            <p style={{
              fontSize: '16px',
              margin: '0',
              color: '#1e40af'
            }}>
              Reset your {companyName} password
            </p>
          </div>
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
            Hello {userName},
          </p>
          <p style={{
            fontSize: '16px',
            margin: '0 0 20px 0',
            color: '#374151'
          }}>
            We received a request to reset your password for your {companyName} account. If you made this request, click the button below to reset your password.
          </p>
        </div>

        {/* Reset Button */}
        <div style={{
          textAlign: 'center' as const,
          marginBottom: '30px'
        }}>
          <a
            href={resetLink}
            style={{
              display: 'inline-block',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '16px 32px',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              textAlign: 'center' as const,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            🔒 Reset My Password
          </a>
        </div>

        {/* Alternative Link */}
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{
            fontSize: '14px',
            margin: '0 0 10px 0',
            color: '#374151',
            fontWeight: 'bold'
          }}>
            Button not working? Copy and paste this link into your browser:
          </p>
          <p style={{
            fontSize: '12px',
            margin: '0',
            color: '#6b7280',
            wordBreak: 'break-all' as const,
            fontFamily: 'monospace',
            backgroundColor: '#ffffff',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #d1d5db'
          }}>
            {resetLink}
          </p>
        </div>

        {/* Security Information */}
        <div style={{
          marginBottom: '30px',
          backgroundColor: '#fef3c7',
          padding: '20px',
          borderRadius: '6px',
          border: '1px solid #f59e0b'
        }}>
          <h3 style={{
            color: '#92400e',
            fontSize: '16px',
            fontWeight: 'bold',
            margin: '0 0 15px 0'
          }}>
            ⚠️ Important Security Information
          </h3>
          
          <ul style={{
            margin: '0',
            paddingLeft: '20px',
            color: '#92400e'
          }}>
            <li style={{ marginBottom: '8px' }}>
              This password reset link will expire in <strong>{expirationTime}</strong>
            </li>
            <li style={{ marginBottom: '8px' }}>
              The link can only be used once
            </li>
            <li style={{ marginBottom: '8px' }}>
              If you didn't request this reset, you can safely ignore this email
            </li>
            <li>
              Your current password will remain unchanged until you create a new one
            </li>
          </ul>
        </div>

        {/* Request Details */}
        {(requestTime || requestLocation) && (
          <div style={{
            marginBottom: '30px',
            backgroundColor: '#f8fafc',
            padding: '20px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              color: '#374151',
              fontSize: '16px',
              fontWeight: 'bold',
              margin: '0 0 15px 0'
            }}>
              📋 Request Details
            </h3>
            
            {requestTime && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: requestLocation ? '1px solid #e5e7eb' : 'none'
              }}>
                <span style={{
                  fontWeight: 'bold',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  🕐 Requested at:
                </span>
                <span style={{
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  {requestTime}
                </span>
              </div>
            )}
            
            {requestLocation && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0'
              }}>
                <span style={{
                  fontWeight: 'bold',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  📍 Location:
                </span>
                <span style={{
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  {requestLocation}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Didn't Request Section */}
        <div style={{
          backgroundColor: '#fef2f2',
          padding: '20px',
          borderRadius: '6px',
          border: '1px solid #fecaca',
          marginBottom: '30px'
        }}>
          <h3 style={{
            color: '#dc2626',
            fontSize: '16px',
            fontWeight: 'bold',
            margin: '0 0 10px 0'
          }}>
            🚨 Didn't request a password reset?
          </h3>
          <p style={{
            fontSize: '14px',
            margin: '0 0 15px 0',
            color: '#7f1d1d'
          }}>
            If you didn't request this password reset, someone else might be trying to access your account. Please:
          </p>
          <ol style={{
            margin: '0',
            paddingLeft: '20px',
            color: '#7f1d1d'
          }}>
            <li style={{ marginBottom: '5px' }}>Do not click the reset link</li>
            <li style={{ marginBottom: '5px' }}>Contact our support team immediately</li>
            <li>Consider enabling two-factor authentication</li>
          </ol>
        </div>

        {/* Password Tips */}
        <div style={{
          backgroundColor: '#f0fdf4',
          padding: '20px',
          borderRadius: '6px',
          border: '1px solid #bbf7d0',
          marginBottom: '30px'
        }}>
          <h3 style={{
            color: '#166534',
            fontSize: '16px',
            fontWeight: 'bold',
            margin: '0 0 15px 0'
          }}>
            💡 Tips for a Strong Password
          </h3>
          <ul style={{
            margin: '0',
            paddingLeft: '20px',
            color: '#166534'
          }}>
            <li style={{ marginBottom: '5px' }}>Use at least 8 characters</li>
            <li style={{ marginBottom: '5px' }}>Include uppercase and lowercase letters</li>
            <li style={{ marginBottom: '5px' }}>Add numbers and special characters</li>
            <li>Avoid using personal information</li>
          </ul>
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
            Need help with your password reset?
          </p>
          <p style={{
            fontSize: '14px',
            margin: '0',
            color: '#64748b'
          }}>
            Contact our support team at{' '}
            <a 
              href={`mailto:${supportEmail}`} 
              style={{
                color: '#2563eb',
                textDecoration: 'none'
              }}
            >
              {supportEmail}
            </a>
          </p>
        </div>

        {/* Footer Note */}
        <div style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#fafafa',
          borderRadius: '4px',
          border: '1px solid #e5e5e5'
        }}>
          <p style={{
            fontSize: '12px',
            margin: '0',
            color: '#6b7280',
            textAlign: 'center' as const
          }}>
            This is an automated message. Please do not reply to this email. If you need assistance, contact our support team.
          </p>
        </div>
      </div>
    </BaseEmailTemplate>
  );
};

export default PasswordResetEmail;