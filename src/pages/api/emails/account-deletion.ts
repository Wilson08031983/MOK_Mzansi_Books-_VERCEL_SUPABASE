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

  const { to, subject, firstName = 'there', companyName = emailConfig.company.name } = req.body || {};

  if (!to) {
    return res.status(400).json({ message: 'Missing required parameter: to' });
  }

  try {
    const result = await postmarkService.sendGenericCustomEmail(to, {
      recipientName: firstName,
      emailSubject: subject || 'Your Account Has Been Removed',
      emailContent: `Your user account has been removed from ${companyName}. If you believe this was a mistake, please contact your administrator.`,
      senderName: companyName,
      companyName
    });

    return res.status(200).json({ message: 'Account deletion email sent', id: result.messageId });
  } catch (err) {
    console.error('Error sending account deletion email:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}