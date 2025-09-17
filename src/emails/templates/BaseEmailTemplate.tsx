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
  // Prioritize Vercel URL for development/staging, then environment variable, then fallback to website
  const baseUrl = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_URL) || 
                  emailConfig.company.vercelUrl || 
                  effectiveWebsite;
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
    <div style={{
      margin: 0,
      padding: 0,
      width: '100%',
      backgroundColor: '#F9FAFB',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      lineHeight: 1.6,
      color: '#111827'
    }}>
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05);
          }
          
          .header {
               background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%);
               padding: 4px 20px;
               text-align: center;
               color: white;
               position: relative;
             }
          
          .logo {
                max-width: 188px;
                height: auto;
                margin-bottom: 3px;
                display: inline-block;
                position: relative;
                z-index: 1;
              }
          
          .company-name {
            font-size: 16px;
            font-weight: bold;
            margin-top: 3px;
            letter-spacing: 1px;
          }
          
          .content {
            padding: 18px 30px;
          }
          
          .footer {
            background: #F9FAFB;
            padding: 15px 20px;
            text-align: center;
            border-top: 1px solid #E5E7EB;
          }
          
          .social-links {
            margin-bottom: 20px;
          }
          
          .social-link {
            display: inline-block;
            margin: 0 10px;
            text-decoration: none;
            }
            
            .social-icon {
              width: 32px;
              height: 32px;
              border-radius: 50%;
            }
            
            .copyright {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 20px;
            }
            
            .signature {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid #E5E7EB;
              background: #ffffff;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            }
            
            .signature img {
              max-width: 200px;
              height: auto;
              margin-bottom: 15px;
              display: inline-block;
            }
            
            .signature-name {
              font-weight: bold;
              font-size: 16px;
              color: #111827;
              margin-bottom: 5px;
            }
            
            .signature-company {
              font-weight: 600;
              color: #374151;
              margin-bottom: 10px;
            }
            
            .signature-contact {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 5px;
            }
            
            .signature-contact a {
              color: #3b82f6;
              text-decoration: none;
            }
            
            .signature-contact a:hover {
              text-decoration: underline;
            }
            
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: #3B82F6;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
            }
            
            @media only screen and (max-width: 600px) {
              .email-container {
                margin: 10px;
                border-radius: 0;
              }
              
              .content {
                padding: 20px 15px;
              }
              
              .header {
                padding: 20px 15px;
              }
              
              .footer {
                padding: 20px 15px;
              }
            }
          `}
      </style>
      
      <div style={{display: 'none', fontSize: '1px', color: '#FEFEFE', lineHeight: '1px', fontFamily: 'sans-serif', maxHeight: '0px', maxWidth: '0px', opacity: 0, overflow: 'hidden'}}>
        {previewText}
      </div>
      
      <table role="presentation" cellSpacing={0} cellPadding={0} border={0} width="100%">
        <tbody>
          <tr>
            <td style={{padding: '20px 0'}}>
              <div className="email-container">
                
                {/* Header */}
                  <div className="header">
            <a href="https://www.mokmzansibooks.com" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none', display: 'inline-block'}}>
              <img 
                src="https://gtoq3pkyemsoq0xi.public.blob.vercel-storage.com/logo.png" 
                alt="MOK MZANSI BOOKS" 
                className="logo" 
              />
            </a>
                  </div>
                
                {/* Content */}
                <div className="content">
                  {children}
                </div>
                
                {/* Footer */}
                <div className="footer">
                  <div className="social-links">
                   <a href="https://tiktok.com/@morwa.moabelo" className="social-link">
                     <img src="https://gtoq3pkyemsoq0xi.public.blob.vercel-storage.com/tiktok.png" alt="TikTok" className="social-icon" />
                   </a>
                   <a href="https://twitter.com/stmok" className="social-link">
                     <img src="https://gtoq3pkyemsoq0xi.public.blob.vercel-storage.com/twitter.png" alt="Twitter X" className="social-icon" />
                   </a>
                   <a href="https://www.facebook.com/share/p/1BPLxEhpRh/" className="social-link">
                     <img src="https://gtoq3pkyemsoq0xi.public.blob.vercel-storage.com/Facebook.png" alt="Facebook" className="social-icon" />
                   </a>
                 </div>
                  <div className="copyright">© 2025 MOKMzansiBooks. All rights reserved.</div>
                  
                  <div className="signature" style={{marginTop: '20px'}}>
                     <img src="https://gtoq3pkyemsoq0xi.public.blob.vercel-storage.com/signature.png" alt="Wilson Moabelo Signature" style={{maxWidth: '200px', height: 'auto', marginBottom: '15px', display: 'inline-block'}} />
                    <div className="signature-name">Wilson Moabelo</div>
                    <div className="signature-company">MOK MZANSI BOOKS</div>
                    <div className="signature-contact">
                      <a href="mailto:admin@mokmzansibooks.com">admin@mokmzansibooks.com</a>
                    </div>
                    <div className="signature-contact">
                      <a href="tel:+27645504029">+27 64 550 4029</a>
                    </div>
                  </div>
                </div>
                
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BaseEmailTemplate;
