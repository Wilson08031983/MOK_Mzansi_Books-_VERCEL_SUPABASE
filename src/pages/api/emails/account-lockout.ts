import type { NextApiRequest, NextApiResponse } from 'next';
import emailConfig from '@/emails/config/emailConfig';
import { postmarkService } from '@/services/postmarkService';

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || emailConfig.company.website).replace(/\/$/, '');

interface AccountLockoutRequest {
  to: string;
  userName: string;
  companyName?: string;
  lockoutDate: string;
  gracePeriodEndDate: string;
  amountDue: number;
  currency?: string;
  paymentLink?: string;
  accountManagementLink?: string;
  supportEmail?: string;
  supportPhone?: string;
  daysPastDue: number;
  subject?: string;
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
    lockoutDate,
    gracePeriodEndDate,
    amountDue,
    currency = 'ZAR',
    paymentLink = '/settings/billing',
    accountManagementLink = '/settings/account',
    supportEmail = emailConfig.company.email,
    supportPhone = emailConfig.company.phone,
    daysPastDue,
  }: AccountLockoutRequest = req.body || {};

  // Validate required fields
  if (!to || !userName || !lockoutDate || !gracePeriodEndDate || amountDue === undefined || daysPastDue === undefined) {
    return res.status(400).json({ 
      message: 'Missing required parameters: to, userName, lockoutDate, gracePeriodEndDate, amountDue, daysPastDue' 
    });
  }

  // Validate amountDue is a positive number
  if (typeof amountDue !== 'number' || amountDue <= 0) {
    return res.status(400).json({ 
      message: 'amountDue must be a positive number' 
    });
  }

  // Validate daysPastDue is a non-negative number
  if (typeof daysPastDue !== 'number' || daysPastDue < 0) {
    return res.status(400).json({ 
      message: 'daysPastDue must be a non-negative number' 
    });
  }

  // Validate dates are valid
  const lockout = new Date(lockoutDate);
  const graceEnd = new Date(gracePeriodEndDate);
  if (isNaN(lockout.getTime()) || isNaN(graceEnd.getTime())) {
    return res.status(400).json({ 
      message: 'lockoutDate and gracePeriodEndDate must be valid date strings' 
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
    const result = await postmarkService.sendAccountLockoutEmail(to, {
      userName,
      companyName,
      lockoutDate,
      gracePeriodEndDate,
      amountDue,
      currency,
      paymentLink: absolutePaymentLink,
      accountManagementLink: absoluteAccountLink,
      supportEmail,
      supportPhone,
      daysPastDue,
    });

    console.log(`Account lockout notification sent to ${to}, ${daysPastDue} days past due, email ID: ${result.messageId}`);

    return res.status(200).json({ 
      message: 'Account lockout email sent successfully',
      id: result.messageId,
      daysPastDue,
      amountDue,
      lockoutDate
    });
  } catch (err) {
    console.error('Error sending account lockout email:', err);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? String(err) : undefined
    });
  }
}