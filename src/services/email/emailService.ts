import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  sendTrialReminder: async (to: string, name: string) => {
    try {
      await resend.emails.send({
        from: 'Mok Mzansi Books <noreply@mokmzansibooks.co.za>',
        to,
        subject: 'Your Mok Mzansi Books Trial is Ending Soon!',
        html: `
          <h1>Hi ${name},</h1>
          <p>Your 30-day trial of Mok Mzansi Books is ending in 5 days.</p>
          <p>Upgrade to a paid plan to continue enjoying unlimited access to all features.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/billing">Upgrade Now</a>
        `,
      });
    } catch (error) {
      console.error('Error sending trial reminder email:', error);
      throw new Error('Failed to send trial reminder email.');
    }
  },

  sendWelcomeEmail: async (to: string, name: string) => {
    try {
      await resend.emails.send({
        from: 'Mok Mzansi Books <noreply@mokmzansibooks.co.za>',
        to,
        subject: 'Welcome to Mok Mzansi Books!',
        html: `
          <h1>Welcome, ${name}!</h1>
          <p>Thank you for signing up for Mok Mzansi Books. We\'re excited to have you on board.</p>
          <p>You can now start managing your business finances with ease.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}">Go to Dashboard</a>
        `,
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email.');
    }
  },
};