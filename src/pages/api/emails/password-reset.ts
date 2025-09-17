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
    const result = await postmarkService.sendPasswordResetEmail(to, resetLink, firstName);
    return res.status(200).json({ message: 'Password reset email sent', id: result.messageId });
  } catch (err) {
    console.error('Error sending password reset email:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}