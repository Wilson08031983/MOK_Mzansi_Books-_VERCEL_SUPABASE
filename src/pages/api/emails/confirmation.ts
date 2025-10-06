import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'postmark';
import emailConfig from '../../../emails/config/emailConfig';

// Postmark client will be initialized in the handler after validating the server token

// Get configuration from environment variables with fallbacks
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || emailConfig.company.website).replace(/\/$/, '');
const logoUrl = `${new URL(emailConfig.company.website).origin}${emailConfig.company.logo.startsWith('/') ? emailConfig.company.logo : `/${emailConfig.company.logo}`}`;
const fromEmail = process.env.POSTMARK_FROM_EMAIL || `no-reply@${process.env.POSTMARK_SENDER_DOMAIN || 'mokmzansibooks.com'}`;
const senderName = process.env.POSTMARK_SENDER_NAME || 'MOK Mzansi Books';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Ensure Postmark server token is configured
  const serverToken = process.env.POSTMARK_SERVER_TOKEN;
  if (!serverToken || serverToken.trim().length === 0) {
    return res.status(500).json({ message: 'Postmark server token not configured' });
  }
  const postmarkClient = new Client(serverToken);

  const { to, subject, firstName = 'there', lastName = '', verifyLink } = req.body || {};

  if (!to) {
    return res.status(400).json({ message: 'Missing required parameter: to' });
  }

  // Minimal, non-sensitive request logging
  try {
    console.log('[api/emails/confirmation] Incoming request', {
      to: typeof to === 'string' ? to : Array.isArray(to) ? to.join(',') : 'invalid',
      hasVerifyLink: !!verifyLink,
      subjectProvided: !!subject,
    });
  } catch {}

  const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName;
  const confirmationLink = verifyLink || `${appUrl}/login`;

  try {
    const response = await postmarkClient.sendEmail({
      From: `${senderName} <${fromEmail}>`,
      To: to,
      Subject: subject || 'Confirm Your Email Address',
      ReplyTo: process.env.POSTMARK_REPLY_TO || 'support@mokmzansibooks.com',
      HtmlBody: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${logoUrl}" alt="MOK Mzansi Books" style="width: 120px; height: auto;" />
          </div>
          <h1 style="color: #4c1d95; font-size: 24px; margin-bottom: 16px;">Welcome to MOK Mzansi Books!</h1>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">Hello ${fullName},</p>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
            Please confirm your email address by clicking the button below. This helps us keep your account secure and ensures you receive important updates.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${confirmationLink}" style="display: inline-block; background-color: #4c1d95; color: white; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">
              Confirm Email
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #6b7280; font-size: 14px; word-break: break-all;">${confirmationLink}</p>
          <hr style="margin: 24px 0; border-color: #e5e7eb;" />
          <p style="color: #6b7280; font-size: 12px;">If you did not create an account with MOK Mzansi Books, you can safely ignore this email.</p>
        </div>
      `,
      MessageStream: process.env.POSTMARK_MESSAGE_STREAM || 'outbound',
      TrackOpens: true
    });

    try {
      console.log('[api/emails/confirmation] Sent', {
        messageID: (response as any)?.MessageID,
        submittedAt: (response as any)?.SubmittedAt,
        to,
      });
    } catch {}

    return res.status(200).json({ 
      message: 'Confirmation email sent', 
      id: (response as any).MessageID || 'sent'
    });
  } catch (err) {
    console.error('Error sending confirmation email:', err);
    return res.status(500).json({ 
      message: 'Failed to send confirmation email',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}