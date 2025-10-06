import type { NextApiRequest, NextApiResponse } from 'next';
import { postmarkService } from '@/services/postmarkService';
import emailConfig from '@/emails/config/emailConfig';

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

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || emailConfig.company.website).replace(/\/$/, '');
  const resetLink = `${appUrl}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(to)}`;

  try {
    console.log('Sending password reset email:', { to, resetLink, firstName });
    const result = await postmarkService.sendPasswordResetEmail(to, resetLink, firstName);
    console.log('Password reset email sent successfully:', result);
    return res.status(200).json({ message: 'Password reset email sent', id: result.messageId });
  } catch (err: any) {
    console.error('Error sending password reset email:', err);
    
    // Handle specific Postmark errors
    if (err.message && err.message.includes('InactiveRecipientsError')) {
      console.warn('Email address is inactive:', to);
      return res.status(400).json({ 
        message: 'Email address is not valid or has been marked as inactive. Please use a different email address.',
        error: 'inactive_recipient'
      });
    }
    
    // Handle other email service errors
    if (err.message && err.message.includes('Failed to send templated email')) {
      return res.status(400).json({ 
        message: 'Unable to send password reset email. Please try again later.',
        error: 'email_service_error'
      });
    }
    
    return res.status(500).json({ message: 'Internal server error' });
  }
}