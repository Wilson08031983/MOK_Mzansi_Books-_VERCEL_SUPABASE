import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import emailConfig from '@/emails/config/emailConfig';
import { WelcomeEmail } from '@/emails/templates/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.RESEND_DOMAIN || (new URL(emailConfig.company.website).hostname);
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
    const html = renderToStaticMarkup(
      React.createElement(WelcomeEmail as any, {
        userName,
        loginLink: `${appUrl}/login`,
        supportEmail: emailConfig.company.email,
      })
    );

    const subject = 'Welcome to MOK Mzansi Books!';

    const { data, error } = await resend.emails.send({
      from: `MOK Mzansi Books <no-reply@${domain}>`,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return res.status(500).json({ message: 'Failed to send welcome email' });
    }

    return res.status(200).json({ message: 'Welcome email sent', id: data?.id });
  } catch (err) {
    console.error('Error sending welcome email:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}