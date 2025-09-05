import { Resend } from 'resend';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import TrialReminderEmail from '@/emails/TrialReminderEmail';
import emailConfig from '@/emails/config/emailConfig';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  sendTrialReminder: async (to: string, name: string) => {
    try {
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || emailConfig.company.website).replace(/\/$/, '');
      const loginUrl = `${appUrl}/settings/billing`;
      const html = renderToStaticMarkup(
        React.createElement(TrialReminderEmail, { name, loginUrl })
      );

      const domain = process.env.RESEND_DOMAIN || new URL(emailConfig.company.website).hostname;

      await resend.emails.send({
        from: `${emailConfig.company.name} <no-reply@${domain}>`,
        to,
        subject: 'Your Mok Mzansi Books Trial is Ending Soon!',
        html,
      });
    } catch (error) {
      console.error('Error sending trial reminder email:', error);
      throw new Error('Failed to send trial reminder email.');
    }
  },

  sendWelcomeEmail: async (to: string, name: string) => {
    try {
      const domain = process.env.RESEND_DOMAIN || new URL(emailConfig.company.website).hostname;
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || emailConfig.company.website).replace(/\/$/, '');

      await resend.emails.send({
        from: `${emailConfig.company.name} <no-reply@${domain}>`,
        to,
        subject: 'Welcome to Mok Mzansi Books!',
        html: `
          <h1>Welcome, ${name}!</h1>
          <p>Thank you for signing up for Mok Mzansi Books. We\'re excited to have you on board.</p>
          <p>You can now start managing your business finances with ease.</p>
          <a href="${appUrl}">Go to Dashboard</a>
        `,
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email.');
    }
  },
};