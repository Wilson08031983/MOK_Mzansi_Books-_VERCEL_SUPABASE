import { NextApiRequest, NextApiResponse } from 'next';
import { Client as PostmarkClient } from 'postmark';

// Initialize Postmark client
const postmarkClient = new PostmarkClient(process.env.POSTMARK_SERVER_TOKEN!);

// Configuration
const fromEmail = process.env.POSTMARK_SENDER_EMAIL || 'noreply@mokmzansibooks.com';
const senderName = process.env.POSTMARK_SENDER_NAME || 'MOK Mzansi Books';
const appUrl = process.env.APP_HOST || 'http://localhost:8080';
const logoUrl = `${appUrl}/email-assets/logo.png`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { 
    to, 
    subject, 
    firstName = 'there', 
    lastName = '', 
    companyName = 'MOK Mzansi Books',
    verifyUrl,
    userId,
    companyId,
    metadata = {}
  } = req.body || {};

  if (!to) {
    return res.status(400).json({ message: 'Missing required parameter: to' });
  }

  if (!verifyUrl) {
    return res.status(400).json({ message: 'Missing required parameter: verifyUrl' });
  }

  // Minimal, non-sensitive request logging
  try {
    console.log('[api/emails/verification] Sending verification email', {
      to: typeof to === 'string' ? to : Array.isArray(to) ? to.join(',') : 'invalid',
      hasVerifyUrl: !!verifyUrl,
      subjectProvided: !!subject,
      userId: userId || 'unknown',
      companyId: companyId || 'unknown'
    });
  } catch {}

  const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName;

  try {
    const response = await postmarkClient.sendEmail({
      From: `${senderName} <${fromEmail}>`,
      To: to,
      Subject: subject || `Verify your ${companyName} account`,
      ReplyTo: process.env.POSTMARK_REPLY_TO || 'support@mokmzansibooks.com',
      HtmlBody: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${logoUrl}" alt="MOK Mzansi Books" style="width: 120px; height: auto;" />
          </div>
          
          <h1 style="color: #4c1d95; text-align: center; margin-bottom: 24px;">
            Verify Your Email Address
          </h1>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
            Hello ${fullName},
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Welcome to ${companyName}! Please confirm your email address to activate your account and keep it secure.
          </p>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background-color: #4c1d95; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);">
              Confirm Email Address
            </a>
          </div>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              If the button above doesn't work, copy and paste this link into your browser:
            </p>
            <p style="font-size: 14px; color: #4c1d95; word-break: break-all; margin: 8px 0 0 0;">
              ${verifyUrl}
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            This verification link will expire in 24 hours for security reasons.
          </p>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">
            If you didn't create an account with ${companyName}, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          
          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} ${companyName}. All rights reserved.
          </p>
        </div>
      `,
      TextBody: `
Hello ${fullName},

Welcome to ${companyName}! Please confirm your email address to activate your account.

Click here to verify your email: ${verifyUrl}

This verification link will expire in 24 hours for security reasons.

If you didn't create an account with ${companyName}, please ignore this email.

© ${new Date().getFullYear()} ${companyName}. All rights reserved.
      `,
      MessageStream: process.env.POSTMARK_MESSAGE_STREAM || 'outbound',
      Metadata: {
        userId: userId || '',
        companyId: companyId || '',
        emailType: 'verification',
        environment: process.env.POSTMARK_ENVIRONMENT || 'development',
        ...metadata
      }
    });

    console.log('[api/emails/verification] Email sent successfully:', {
      messageId: response.MessageID,
      to: response.To,
      submittedAt: response.SubmittedAt
    });

    return res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
      id: response.MessageID,
      submittedAt: response.SubmittedAt
    });

  } catch (error: any) {
    console.error('[api/emails/verification] Failed to send email:', {
      error: error.message,
      code: error.code,
      to: to
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to send verification email',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}