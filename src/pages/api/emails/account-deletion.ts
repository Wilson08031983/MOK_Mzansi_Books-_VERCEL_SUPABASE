import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import emailConfig from '@/emails/config/emailConfig';

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.RESEND_DOMAIN || new URL(emailConfig.company.website).hostname;
const logoUrl = `${new URL(emailConfig.company.website).origin}${emailConfig.company.logo.startsWith('/') ? emailConfig.company.logo : `/${emailConfig.company.logo}`}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, subject, firstName = 'there', companyName = emailConfig.company.name } = req.body || {};

  if (!to) {
    return res.status(400).json({ message: 'Missing required parameter: to' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${companyName} <no-reply@${domain}>`,
      to: [to],
      subject: subject || 'Your Account Has Been Removed',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${logoUrl}" alt="${companyName}" style="width: 120px; height: auto;" />
          </div>
          <h1 style="color: #4c1d95; font-size: 24px; margin-bottom: 16px;">Account Removed</h1>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">Hello ${firstName},</p>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
            Your user account has been removed from ${companyName}. If you believe this was a mistake, please contact your administrator.
          </p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px; text-align: center;">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send account deletion email:', error);
      return res.status(500).json({ message: 'Failed to send account deletion email' });
    }

    return res.status(200).json({ message: 'Account deletion email sent', id: data?.id });
  } catch (err) {
    console.error('Error sending account deletion email:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}