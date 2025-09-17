import React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';

interface LoginNotificationEmailProps {
  userName: string;
  loginTime: string;
  loginLocation?: string;
  ipAddress?: string;
  deviceInfo?: string;
  browserInfo?: string;
  securityLink?: string;
  supportEmail?: string;
  companyName?: string;
}

export const LoginNotificationEmail: React.FC<LoginNotificationEmailProps> = ({
  userName,
  loginTime,
  loginLocation = 'Unknown Location',
  ipAddress,
  deviceInfo,
  browserInfo,
  securityLink = 'https://app.mokmzansibooks.com/security',
  supportEmail = 'support@mokmzansibooks.com',
  companyName = 'MOK Mzansi Books'
}) => {
  return (
    <BaseEmailTemplate
      title="New login to your MOK Mzansi Books account"
      previewText={`New login detected at ${loginTime} from ${loginLocation}`}
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
            backgroundColor: '#fef3c7',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #f59e0b',
            marginBottom: '20px'
          }}>
            <h1 style={{
              color: '#92400e',
              fontSize: '24px',
              fontWeight: 'bold',
              margin: '0 0 10px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              🔐 Security Alert
            </h1>
            <p style={{
              fontSize: '16px',
              margin: '0',
              color: '#92400e'
            }}>
              New login to your {companyName} account
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
            We detected a new login to your {companyName} account. If this was you, you can safely ignore this email. If you don't recognize this activity, please secure your account immediately.
          </p>
        </div>

        {/* Login Details */}
        <div style={{
          marginBottom: '30px',
          backgroundColor: '#f8fafc',
          padding: '30px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{
            color: '#1f2937',
            fontSize: '18px',
            fontWeight: 'bold',
            margin: '0 0 20px 0'
          }}>
            📋 Login Details
          </h2>
          
          <div style={{
            display: 'grid',
            gap: '15px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{
                fontWeight: 'bold',
                color: '#374151',
                fontSize: '14px'
              }}>
                🕐 Time:
              </span>
              <span style={{
                color: '#6b7280',
                fontSize: '14px'
              }}>
                {loginTime}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid #e5e7eb'
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
                {loginLocation}
              </span>
            </div>
            
            {ipAddress && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{
                  fontWeight: 'bold',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  🌐 IP Address:
                </span>
                <span style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}>
                  {ipAddress}
                </span>
              </div>
            )}
            
            {deviceInfo && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{
                  fontWeight: 'bold',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  📱 Device:
                </span>
                <span style={{
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  {deviceInfo}
                </span>
              </div>
            )}
            
            {browserInfo && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0'
              }}>
                <span style={{
                  fontWeight: 'bold',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  🌍 Browser:
                </span>
                <span style={{
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  {browserInfo}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Security Actions */}
        <div style={{
          marginBottom: '30px'
        }}>
          <h3 style={{
            color: '#dc2626',
            fontSize: '16px',
            fontWeight: 'bold',
            margin: '0 0 15px 0'
          }}>
            🚨 Wasn't you? Take action immediately:
          </h3>
          
          <div style={{
            backgroundColor: '#fef2f2',
            padding: '20px',
            borderRadius: '6px',
            border: '1px solid #fecaca',
            marginBottom: '20px'
          }}>
            <ol style={{
              margin: '0',
              paddingLeft: '20px',
              color: '#7f1d1d'
            }}>
              <li style={{ marginBottom: '8px' }}>Change your password immediately</li>
              <li style={{ marginBottom: '8px' }}>Review your account security settings</li>
              <li style={{ marginBottom: '8px' }}>Enable two-factor authentication if not already active</li>
              <li>Contact our support team if you need assistance</li>
            </ol>
          </div>
          
          <div style={{
            textAlign: 'center' as const
          }}>
            <a
              href={securityLink}
              style={{
                display: 'inline-block',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '14px 28px',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                textAlign: 'center' as const
              }}
            >
              🔒 Secure My Account
            </a>
          </div>
        </div>

        {/* Was You Section */}
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
            margin: '0 0 10px 0'
          }}>
            ✅ Was this you?
          </h3>
          <p style={{
            fontSize: '14px',
            margin: '0',
            color: '#166534'
          }}>
            If you recognize this login, no further action is needed. We send these notifications to help keep your account secure.
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
            Need help securing your account?
          </p>
          <p style={{
            fontSize: '14px',
            margin: '0',
            color: '#64748b'
          }}>
            Contact our security team at{' '}
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
            This is an automated security notification. Please do not reply to this email.
          </p>
        </div>
      </div>
    </BaseEmailTemplate>
  );
};

export default LoginNotificationEmail;