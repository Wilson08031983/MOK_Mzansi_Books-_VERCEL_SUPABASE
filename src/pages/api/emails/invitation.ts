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

  const { to, subject, inviterName = 'Admin', email, role, invitationLink, companyName = emailConfig.company.name } = req.body || {};

  if (!to || !email || !role || !invitationLink) {
    return res.status(400).json({ message: 'Missing required parameters: to, email, role, invitationLink' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${companyName} <no-reply@${domain}>`,
      to: [to],
      subject: subject || `You've been invited to join ${companyName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${logoUrl}" alt="${companyName}" style="width: 120px; height: auto;" />
          </div>
          <h1 style="color: #4c1d95; font-size: 24px; margin-bottom: 16px;">You've Been Invited!</h1>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">Hello,</p>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">${inviterName} has invited you to join ${companyName} as a <strong>${role}</strong>.</p>
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 8px;"><strong>Your account details:</strong></p>
            <p style="color: #374151; font-size: 16px; margin-bottom: 0;"><strong>Email:</strong> ${email}</p>
          </div>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">To complete your registration and set up your password, click the button below:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${invitationLink}" style="background: linear-gradient(to right, #8b5cf6, #6366f1); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Complete Your Registration</a>
          </div>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;"><strong>Note:</strong> This invitation link will expire in 24 hours.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px; text-align: center;">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send invitation email:', error);
      return res.status(500).json({ message: 'Failed to send invitation email' });
    }

    return res.status(200).json({ message: 'Invitation email sent', id: data?.id });
  } catch (err) {
    console.error('Error sending invitation email:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}