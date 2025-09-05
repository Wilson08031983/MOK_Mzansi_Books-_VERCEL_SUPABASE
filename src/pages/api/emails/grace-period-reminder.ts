import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GracePeriodDailyReminderEmail } from '@/emails/templates/GracePeriodDailyReminderEmail';
import emailConfig from '@/emails/config/emailConfig';

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.RESEND_DOMAIN || new URL(emailConfig.company.website).hostname;
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
    daysRemaining,
    gracePeriodEndDate,
    paymentLink = '/settings/billing',
    accountManagementLink = '/settings/account',
    lastPaymentAttempt,
    amountDue,
    currency = 'ZAR',
    subject
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

  // Generate dynamic subject based on urgency
  const defaultSubject = daysRemaining <= 1 
    ? `🚨 URGENT: Payment Grace Period Ends ${daysRemaining === 0 ? 'Today' : 'Tomorrow'}` 
    : daysRemaining <= 3 
      ? `⚠️ Payment Grace Period Ends in ${daysRemaining} Days` 
      : `Payment Reminder: ${daysRemaining} Days Remaining in Grace Period`;

  try {
    // Render the email template
    const html = renderToStaticMarkup(
      React.createElement(GracePeriodDailyReminderEmail, {
        userName,
        companyName,
        daysRemaining,
        gracePeriodEndDate,
        paymentLink: absolutePaymentLink,
        accountManagementLink: absoluteAccountLink,
        lastPaymentAttempt,
        amountDue,
        currency,
      })
    );

    // Send the email
    const { data, error } = await resend.emails.send({
      from: `${companyName} <no-reply@${domain}>`,
      to: [to],
      subject: subject || defaultSubject,
      html,
      tags: [
        { name: 'type', value: 'grace-period-reminder' },
        { name: 'days-remaining', value: daysRemaining.toString() },
        { name: 'urgency', value: daysRemaining <= 1 ? 'critical' : daysRemaining <= 3 ? 'high' : 'medium' }
      ],
    });

    if (error) {
      console.error('Failed to send grace period reminder email:', error);
      return res.status(500).json({ 
        message: 'Failed to send grace period reminder email',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }

    // Log successful send for monitoring
    console.log(`Grace period reminder sent to ${to}, ${daysRemaining} days remaining, email ID: ${data?.id}`);

    return res.status(200).json({ 
      message: 'Grace period reminder email sent successfully',
      id: data?.id,
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