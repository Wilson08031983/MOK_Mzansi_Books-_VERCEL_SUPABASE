import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AccountLockoutEmail } from '@/emails/templates/AccountLockoutEmail';
import emailConfig from '@/emails/config/emailConfig';

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.RESEND_DOMAIN || new URL(emailConfig.company.website).hostname;
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
    subject
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

  // Format currency for subject
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const defaultSubject = `🔒 Account Temporarily Locked - Payment Required (${formatCurrency(amountDue)})`;

  try {
    // Render the email template
    const html = renderToStaticMarkup(
      React.createElement(AccountLockoutEmail, {
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
      })
    );

    // Send the email
    const { data, error } = await resend.emails.send({
      from: `${companyName} <no-reply@${domain}>`,
      to: [to],
      subject: subject || defaultSubject,
      html,
      tags: [
        { name: 'type', value: 'account-lockout' },
        { name: 'days-past-due', value: daysPastDue.toString() },
        { name: 'amount-due', value: amountDue.toString() },
        { name: 'currency', value: currency }
      ],
    });

    if (error) {
      console.error('Failed to send account lockout email:', error);
      return res.status(500).json({ 
        message: 'Failed to send account lockout email',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }

    // Log successful send for monitoring
    console.log(`Account lockout notification sent to ${to}, ${daysPastDue} days past due, email ID: ${data?.id}`);

    return res.status(200).json({ 
      message: 'Account lockout email sent successfully',
      id: data?.id,
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