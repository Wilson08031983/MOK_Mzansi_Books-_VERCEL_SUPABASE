import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import emailConfig from '@/emails/config/emailConfig';

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.RESEND_DOMAIN || new URL(emailConfig.company.website).hostname;
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || emailConfig.company.website).replace(/\/$/, '');
const logoUrl = `${new URL(emailConfig.company.website).origin}${emailConfig.company.logo.startsWith('/') ? emailConfig.company.logo : `/${emailConfig.company.logo}`}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, subject, resetToken, firstName = 'there' } = req.body || {};

  if (!to || !resetToken) {
    return res.status(400).json({ message: 'Missing required parameters: to, resetToken' });
  }

  const resetLink = `${appUrl}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(to)}`;

  try {
    const { data, error } = await resend.emails.send({
      from: `MOK Mzansi Books <no-reply@${domain}>`,
      to: [to],
      subject: subject || 'Reset Your Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${logoUrl}" alt="MOK Mzansi Books" style="width: 120px; height: auto;" />
          </div>
          <h1 style="color: #4c1d95; font-size: 24px; margin-bottom: 16px;">Password Reset Request</h1>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">Hello ${firstName},</p>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">We received a request to reset your password for your MOK Mzansi Books account. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background: linear-gradient(to right, #ec4899, #8b5cf6); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Reset My Password</a>
          </div>
          <p style="color: #374151; font-size: 16px; margin-bottom: 8px;">If you didn't request this password reset, you can safely ignore this email.</p>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">This link will expire in 1 hour for your security.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px; text-align: center;">&copy; ${new Date().getFullYear()} MOK Mzansi Books. All rights reserved.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      return res.status(500).json({ message: 'Failed to send password reset email' });
    }

    return res.status(200).json({ message: 'Password reset email sent', id: data?.id });
  } catch (err) {
    console.error('Error sending password reset email:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}