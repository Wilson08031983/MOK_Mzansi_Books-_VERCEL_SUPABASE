import type { NextApiRequest, NextApiResponse } from 'next';
import emailConfig from '@/emails/config/emailConfig';
import { postmarkService } from '@/services/postmarkService';

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || emailConfig.company.website).replace(/\/$/, '');

interface GracePeriodReminderRequest {
  to: string;
  userName: string;
  companyName?: string;
  daysRemaining: number;
  gracePeriodEndDate: string;
  paymentLink?: string;
  accountManagementLink?: string;
  lastPaymentAttempt?: string;
  amountDue: number;
  currency?: string;
  subject?: string; // kept for compatibility but not used; Postmark template has built-in subject
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    to,
    userName,
    companyName = emailConfig.company.name,
    daysRemaining,
    gracePeriodEndDate,
    paymentLink = '/settings/billing',
    accountManagementLink = '/settings/account',
    lastPaymentAttempt,
    amountDue,
    currency = 'ZAR',
  }: GracePeriodReminderRequest = req.body || {};

  // Validate required fields
  if (!to || !userName || daysRemaining === undefined || !gracePeriodEndDate || amountDue === undefined) {
    return res.status(400).json({ 
      message: 'Missing required parameters: to, userName, daysRemaining, gracePeriodEndDate, amountDue' 
    });
  }

  // Validate daysRemaining is a non-negative number
  if (typeof daysRemaining !== 'number' || daysRemaining < 0) {
    return res.status(400).json({ 
      message: 'daysRemaining must be a non-negative number' 
    });
  }

  // Validate amountDue is a positive number
  if (typeof amountDue !== 'number' || amountDue <= 0) {
    return res.status(400).json({ 
      message: 'amountDue must be a positive number' 
    });
  }

  // Validate gracePeriodEndDate is a valid date
  const endDate = new Date(gracePeriodEndDate);
  if (isNaN(endDate.getTime())) {
    return res.status(400).json({ 
      message: 'gracePeriodEndDate must be a valid date string' 
    });
  }

  // Generate absolute URLs for links
  const absolutePaymentLink = paymentLink.startsWith('http') 
    ? paymentLink 
    : `${appUrl}${paymentLink.startsWith('/') ? paymentLink : '/' + paymentLink}`;
  
  const absoluteAccountLink = accountManagementLink.startsWith('http') 
    ? accountManagementLink 
    : `${appUrl}${accountManagementLink.startsWith('/') ? accountManagementLink : '/' + accountManagementLink}`;

  try {
    const result = await postmarkService.sendGracePeriodReminderEmail(to, {
      userName,
      companyName,
      daysRemaining,
      gracePeriodEndDate,
      paymentLink: absolutePaymentLink,
      accountManagementLink: absoluteAccountLink,
      lastPaymentAttempt,
      amountDue,
      currency,
      supportEmail: emailConfig.company.email,
    });

    // Log successful send for monitoring
    console.log(`Grace period reminder sent to ${to}, ${daysRemaining} days remaining, email ID: ${result.messageId}`);

    return res.status(200).json({ 
      message: 'Grace period reminder email sent successfully',
      id: result.messageId,
      daysRemaining,
      urgencyLevel: daysRemaining <= 1 ? 'critical' : daysRemaining <= 3 ? 'high' : 'medium'
    });
  } catch (err) {
    console.error('Error sending grace period reminder email:', err);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? String(err) : undefined
    });
  }
}