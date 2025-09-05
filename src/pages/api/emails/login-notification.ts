import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import emailConfig from '@/emails/config/emailConfig';

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.RESEND_DOMAIN || new URL(emailConfig.company.website).hostname;
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
    const { data, error } = await resend.emails.send({
      from: `MOK Mzansi Books <no-reply@${domain}>`,
      to: [to],
      subject: 'New Login to Your Account',
      html: `
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
      `,
    });

    if (error) {
      console.error('Failed to send login notification email:', error);
      return res.status(500).json({ message: 'Failed to send login notification email' });
    }

    return res.status(200).json({ message: 'Login notification email sent', id: data?.id });
  } catch (err) {
    console.error('Error sending login notification email:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}