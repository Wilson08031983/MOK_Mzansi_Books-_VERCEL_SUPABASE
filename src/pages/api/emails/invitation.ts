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

  const { to, subject, inviterName = 'Admin', email, role, invitationLink, companyName = emailConfig.company.name } = req.body || {};

  if (!to || !email || !role || !invitationLink) {
    return res.status(400).json({ message: 'Missing required parameters: to, email, role, invitationLink' });
  }

  try {
    const result = await postmarkService.sendTeamInvitationEmail(
      to,
      inviterName,
      companyName,
      invitationLink
    );

    return res.status(200).json({ message: 'Invitation email sent', id: result.messageId });
  } catch (err) {
    console.error('Error sending invitation email:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}