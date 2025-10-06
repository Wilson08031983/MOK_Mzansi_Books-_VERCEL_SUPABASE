import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'postmark';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ensure Postmark is configured with a server-only token
    const serverToken = process.env.POSTMARK_SERVER_TOKEN;
    if (!serverToken) {
      return res.status(500).json({ error: 'Postmark server token not configured' });
    }

    const postmarkClient = new Client(serverToken);

    const {
      to,
      subject = 'Verify your MOK Mzansi Books account',
      firstName = 'there',
      lastName = '',
      companyName,
      verifyUrl,
      userId,
      companyId,
      metadata = {}
    } = req.body;

    // Validate required fields
    if (!to) {
      return res.status(400).json({ error: 'Missing recipient email' });
    }
    if (!verifyUrl) {
      return res.status(400).json({ error: 'Missing verification URL' });
    }
    if (!companyName) {
      return res.status(400).json({ error: 'Missing company name' });
    }

    // Get APP_HOST for logo URL
    const appHost = process.env.APP_HOST || 'http://localhost:3000';
    const logoUrl = `${appHost}/logo.png`;

    // Send email using Postmark
    const result = await postmarkClient.sendEmail({
      From: process.env.POSTMARK_FROM_EMAIL || 'noreply@mokmzansibooks.com',
      To: to,
      Subject: subject,
      HtmlBody: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${logoUrl}" alt="MOK Mzansi Books" style="max-width: 200px; height: auto;">
          </div>
          
          <h1 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">Welcome to MOK Mzansi Books!</h1>
          
          <p>Hi ${firstName}${lastName ? ' ' + lastName : ''},</p>
          
          <p>Thank you for signing up for MOK Mzansi Books! We're excited to have ${companyName} join our platform.</p>
          
          <p>To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email Address</a>
          </div>
          
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #3498db;">${verifyUrl}</p>
          
          <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #666;">
            If you didn't create an account with MOK Mzansi Books, please ignore this email.
          </p>
          
          <p style="font-size: 14px; color: #666;">
            Best regards,<br>
            The MOK Mzansi Books Team
          </p>
        </body>
        </html>
      `,
      TextBody: `
        Welcome to MOK Mzansi Books!
        
        Hi ${firstName}${lastName ? ' ' + lastName : ''},
        
        Thank you for signing up for MOK Mzansi Books! We're excited to have ${companyName} join our platform.
        
        To complete your registration and start using your account, please verify your email address by visiting this link:
        
        ${verifyUrl}
        
        Important: This verification link will expire in 24 hours for security reasons.
        
        If you didn't create an account with MOK Mzansi Books, please ignore this email.
        
        Best regards,
        The MOK Mzansi Books Team
      `,
      MessageStream: 'outbound',
      Metadata: {
        userId: userId || '',
        companyId: companyId || '',
        purpose: 'email_verification',
        ...metadata
      }
    });

    console.log('Verification email sent successfully:', {
      to,
      messageId: result.MessageID,
      submittedAt: result.SubmittedAt
    });

    return res.status(200).json({
      success: true,
      id: result.MessageID,
      submittedAt: result.SubmittedAt
    });

  } catch (error) {
    console.error('Error sending verification email:', error);
    
    return res.status(500).json({
      error: 'Failed to send verification email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}