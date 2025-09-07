import type { NextApiRequest, NextApiResponse } from 'next';
import Mailjet from 'node-mailjet';
import emailConfig from '@/emails/config/emailConfig';

const mailjet = Mailjet.apiConnect(
  process.env.VITE_MAILJET_API_KEY!,
  process.env.VITE_MAILJET_SECRET_KEY!
);
const domain = process.env.VITE_MAILJET_DOMAIN || new URL(emailConfig.company.website).hostname;
const logoUrl = `${new URL(emailConfig.company.website).origin}${emailConfig.company.logo.startsWith('/') ? emailConfig.company.logo : `/${emailConfig.company.logo}`}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, deviceName, browser, location, timestamp } = req.body || {};

  if (!to || !deviceName || !browser || !location || !timestamp) {
    return res.status(400).json({ message: 'Missing required parameters: to, deviceName, browser, location, timestamp' });
  }

  const formattedTime = new Date(timestamp).toLocaleString();

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
              Email: to
            }
          ],
          Subject: 'New Login to Your Account',
          HTMLPart: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="${logoUrl}" alt="MOK Mzansi Books" style="width: 120px; height: auto;" />
              </div>
              <h1 style="color: #4c1d95; font-size: 24px; margin-bottom: 16px;">New Login Detected</h1>
              <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">We noticed a new login to your MOK Mzansi Books account with the following details:</p>
              <ul style="color: #374151; font-size: 16px; margin-bottom: 24px;">
                <li><strong>Device:</strong> ${deviceName}</li>
                <li><strong>Browser:</strong> ${browser}</li>
                <li><strong>Location:</strong> ${location}</li>
                <li><strong>Time:</strong> ${formattedTime}</li>
              </ul>
              <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">If this was you, no action is needed. If you don't recognize this activity, please change your password immediately.</p>
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="color: #6b7280; font-size: 14px; text-align: center;">&copy; ${new Date().getFullYear()} MOK Mzansi Books. All rights reserved.</p>
            </div>
          `
        }
      ]
    });

    return res.status(200).json({ 
      message: 'Login notification email sent', 
      id: (result.body as any)?.Messages?.[0]?.To?.[0]?.MessageID || 'sent'
    });
  } catch (err) {
    console.error('Error sending login notification email:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}