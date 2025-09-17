import emailConfig from '@/emails/config/emailConfig';
import { postmarkService } from '@/services/postmarkService';
import TrialReminderEmail from '@/emails/TrialReminderEmail';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export const emailService = {
  sendTrialReminder: async (to: string, name: string) => {
    try {
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || emailConfig.company.website).replace(/\/$/, '');
      const loginUrl = `${appUrl}/settings/billing`;
      const html = renderToStaticMarkup(
        React.createElement(TrialReminderEmail, { name, loginUrl })
      );

      await postmarkService.sendEmail({
        to,
        subject: 'Your Mok Mzansi Books Trial is Ending Soon!',
        htmlBody: html,
        tag: 'trial-reminder',
        metadata: { type: 'trial-reminder' },
      });
    } catch (error) {
      console.error('Error sending trial reminder email:', error);
      throw new Error('Failed to send trial reminder email.');
    }
  },

  sendWelcomeEmail: async (to: string, name: string) => {
    try {
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || emailConfig.company.website).replace(/\/$/, '');
      const loginLink = `${appUrl}`;
      await postmarkService.sendWelcomeEmail(to, name, loginLink);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email.');
    }
  },
};