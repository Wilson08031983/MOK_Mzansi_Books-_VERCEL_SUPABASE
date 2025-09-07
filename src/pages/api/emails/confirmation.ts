import type { NextApiRequest, NextApiResponse } from 'next';
import Mailjet from 'node-mailjet';
import emailConfig from '@/emails/config/emailConfig';

const mailjet = Mailjet.apiConnect(
  process.env.VITE_MAILJET_API_KEY!,
  process.env.VITE_MAILJET_SECRET_KEY!
);
const domain = process.env.VITE_MAILJET_DOMAIN || new URL(emailConfig.company.website).hostname;
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || emailConfig.company.website).replace(/\/$/, '');
const logoUrl = `${new URL(emailConfig.company.website).origin}${emailConfig.company.logo.startsWith('/') ? emailConfig.company.logo : `/${emailConfig.company.logo}`}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, subject, firstName = 'there', lastName = '', verifyLink } = req.body || {};

  if (!to) {
    return res.status(400).json({ message: 'Missing required parameter: to' });
  }

  const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName;
  const confirmationLink = verifyLink || `${appUrl}/login`;

  try {
    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: `no-reply@${domain}`,
            Name: 'MOK Mzansi Books'
          },
          To: [
            {
              Email: to,
              Name: fullName
            }
          ],
          Subject: subject || 'Confirm Your Email Address',
          HTMLPart: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="${logoUrl}" alt="MOK Mzansi Books" style="width: 120px; height: auto;" />
              </div>
              <h1 style="color: #4c1d95; font-size: 24px; margin-bottom: 16px;">Welcome to MOK Mzansi Books!</h1>
              <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">Hello ${fullName},</p>
              <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">Thanks for signing up! Please confirm your email address to start using your MOK Mzansi Books account and access your free trial.</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${confirmationLink}" style="background: linear-gradient(to right, #8b5cf6, #6366f1); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Confirm My Email</a>
              </div>
              <p style="color: #374151; font-size: 16px; margin-bottom: 8px;">If you didn't create an account, you can safely ignore this email.</p>
              <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">This link will expire in 24 hours.</p>
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="color: #6b7280; font-size: 14px; text-align: center;">&copy; ${new Date().getFullYear()} MOK Mzansi Books. All rights reserved.</p>
            </div>
          `
        }
      ]
    });

    return res.status(200).json({ 
      message: 'Confirmation email sent', 
      id: (result.body as any)?.Messages?.[0]?.To?.[0]?.MessageID || 'sent'
    });
  } catch (err) {
    console.error('Error sending confirmation email:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}