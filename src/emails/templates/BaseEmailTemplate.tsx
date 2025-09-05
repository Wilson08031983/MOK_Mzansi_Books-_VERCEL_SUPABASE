import React from 'react';
import emailConfig from '../config/emailConfig';

interface BaseEmailTemplateProps {
  title: string;
  previewText: string;
  children: React.ReactNode;
  // Optional company branding overrides
  companyName?: string;
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
  companyAddress?: string;
  senderName?: string;
  senderSignature?: string; // textual signature fallback
}

export const BaseEmailTemplate: React.FC<BaseEmailTemplateProps> = ({
  title,
  previewText,
  children,
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
  companyAddress,
  senderName,
  senderSignature,
}) => {
  // Use emailConfig as default, allow props to override
  const effectiveCompanyName = companyName || emailConfig.company.name;
  const effectiveLogo = logoUrl || emailConfig.company.logo;
  const effectiveWebsite = companyWebsite || emailConfig.company.website;
  const effectiveCompanyEmail = companyEmail || emailConfig.company.email;
  const effectiveCompanyPhone = companyPhone || emailConfig.company.phone;
  const effectiveCompanyAddress = companyAddress || emailConfig.company.address;
  const effectiveSenderName = senderName || emailConfig.sender.name;
  const effectiveSenderSignatureText = senderSignature || emailConfig.sender.signature;

  // Ensure absolute URLs for assets in email clients
  const baseUrl = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_URL) || effectiveWebsite;
  const absolutize = (url?: string) => {
    if (!url) return undefined as string | undefined;
    if (/^https?:\/\//i.test(url)) return url;
    const normalizedBase = (baseUrl || '').replace(/\/$/, '');
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${normalizedBase}${normalizedPath}`;
  };
  const absoluteLogo = absolutize(effectiveLogo);
  const absoluteSignature = absolutize(signatureUrl); // only use if a URL was provided
  const absoluteStamp = absolutize(stampUrl);

  return (
    <html>
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <style>
          {`
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, ${emailConfig.templates.colors.primary} 0%, ${emailConfig.templates.colors.secondary} 100%);
              padding: 30px 20px;
              text-align: center;
              color: white;
            }
            .logo {
              max-width: 180px;
              margin-bottom: 15px;
            }
            .content {
              padding: 30px;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666666;
              border-top: 1px solid #eeeeee;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: linear-gradient(135deg, ${emailConfig.templates.colors.primary} 0%, ${emailConfig.templates.colors.secondary} 100%);
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-weight: 600;
              margin: 20px 0;
            }
            .signature {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eeeeee;
            }
            .signature img {
              max-width: 150px;
              margin-bottom: 10px;
            }
            .brand-row {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 16px;
              flex-wrap: wrap;
            }
            .stamp {
              max-width: 120px;
              opacity: 0.9;
            }
          `}
        </style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <img 
              src={absoluteLogo}
              alt={effectiveCompanyName}
              className="logo"
            />
            <h1>{title}</h1>
          </div>
          
          <div className="content">
            <div style={{display: 'none'}}>{previewText}</div>
            {children}
            
            <div className="signature">
              <div className="brand-row">
                {absoluteSignature && (
                  <img 
                    src={absoluteSignature}
                    alt="Authorized Signature"
                  />
                )}
                {absoluteStamp && (
                  <img 
                    src={absoluteStamp}
                    alt="Company Stamp"
                    className="stamp"
                  />
                )}
              </div>
              {(effectiveSenderName || effectiveSenderSignatureText) && (
                <p style={{ textAlign: 'center', color: '#6b7280' }}>
                  {effectiveSenderName && (<><strong>{effectiveSenderName}</strong><br /></>)}
                  {effectiveSenderSignatureText}
                </p>
              )}
              <p>
                <strong>{effectiveCompanyName}</strong><br />
                {effectiveCompanyEmail && (<><a href={`mailto:${effectiveCompanyEmail}`} style={{color: '#4f46e5'}}>{effectiveCompanyEmail}</a><br /></>)}
                {effectiveCompanyPhone && (<><a href={`tel:${effectiveCompanyPhone}`} style={{color: '#4f46e5'}}>{effectiveCompanyPhone}</a><br /></>)}
                {effectiveCompanyAddress && (<>{effectiveCompanyAddress}<br /></>)}
                {addressLine1 && (<>{addressLine1}<br /></>)}
                {addressLine2 && (<>{addressLine2}<br /></>)}
                {addressLine3 && (<>{addressLine3}<br /></>)}
                {addressLine4 && (<>{addressLine4}</>)}
              </p>
            </div>
          </div>
          
          <div className="footer">
            <p>If you have any questions, please don't hesitate to contact us at <a href={`mailto:${effectiveCompanyEmail}`} style={{color: '#4f46e5'}}>{effectiveCompanyEmail}</a>.</p>
            <p>{effectiveCompanyAddress}</p>
            <p>© {new Date().getFullYear()} {effectiveCompanyName}. All rights reserved.</p>
            <p><a href={effectiveWebsite} style={{color: '#4f46e5', textDecoration: 'none'}}>Website</a></p>
          </div>
        </div>
      </body>
    </html>
  );
};

export default BaseEmailTemplate;
