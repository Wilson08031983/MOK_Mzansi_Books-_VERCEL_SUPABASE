import type { NextApiRequest, NextApiResponse } from 'next';
import { postmarkService } from '@/services/postmarkService';
import emailConfig from '@/emails/config/emailConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, deviceName, browser, location, timestamp, userName = 'User' } = req.body || {};

  if (!to || !deviceName || !browser || !location || !timestamp) {
    return res.status(400).json({ message: 'Missing required parameters: to, deviceName, browser, location, timestamp' });
  }

  const formattedTime = new Date(timestamp).toISOString();
  const securityLink = `${(process.env.NEXT_PUBLIC_APP_URL || emailConfig.company.website).replace(/\/$/, '')}/security`;

  try {
    const result = await postmarkService.sendLoginNotificationEmail(to, {
      userName,
      loginTime: formattedTime,
      loginLocation: location,
      ipAddress: req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown',
      deviceInfo: deviceName,
      browserInfo: browser,
      securityLink,
      supportEmail: emailConfig.company.email,
      companyName: emailConfig.company.name
    });

    return res.status(200).json({ message: 'Login notification email sent', id: result.messageId });
  } catch (err) {
    console.error('Error sending login notification email:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}