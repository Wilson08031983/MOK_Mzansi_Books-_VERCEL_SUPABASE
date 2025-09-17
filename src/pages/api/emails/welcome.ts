import type { NextApiRequest, NextApiResponse } from 'next';
import emailConfig from '@/emails/config/emailConfig';
import { postmarkService } from '@/services/postmarkService';

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || emailConfig.company.website).replace(/\/$/, '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, userName = 'Valued Customer' } = req.body || {};

  if (!to || typeof to !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid parameter: to' });
  }

  try {
    const result = await postmarkService.sendWelcomeEmail(to, userName, `${appUrl}/login`);
    return res.status(200).json({ message: 'Welcome email sent', id: result.messageId });
  } catch (err) {
    console.error('Error sending welcome email:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}