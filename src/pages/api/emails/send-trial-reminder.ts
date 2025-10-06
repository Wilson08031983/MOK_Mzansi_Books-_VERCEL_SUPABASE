import type { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '@/services/email/emailService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!process.env.POSTMARK_SERVER_TOKEN) {
    return res.status(500).json({ message: 'Postmark server token not configured' });
  }

  const { to, name } = req.body;

  if (!to || !name) {
    return res.status(400).json({ message: 'Missing required parameters: to, name' });
  }

  try {
    await emailService.sendTrialReminder(to, name);
    res.status(200).json({ message: 'Trial reminder email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send trial reminder email' });
  }
}