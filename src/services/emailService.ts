import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

// Domain for sending emails
const domain = import.meta.env.VITE_RESEND_DOMAIN;

interface EmailOptions {
  to: string;
  subject: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Send an email confirmation to a newly registered user
 */
export const sendConfirmationEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const { to, subject, firstName = 'there', lastName = '' } = options;
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName;
    
    const { data, error } = await resend.emails.send({
      from: `MOK Mzansi Books <no-reply@${domain}>`,
      to: [to],
      subject: subject || 'Confirm Your Email Address',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://mokmzansibooks.com/logo.png" alt="MOK Mzansi Books" style="width: 120px; height: auto;" />
          </div>
          <h1 style="color: #4c1d95; font-size: 24px; margin-bottom: 16px;">Welcome to MOK Mzansi Books!</h1>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">Hello ${fullName},</p>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">Thanks for signing up! Please confirm your email address to start using your MOK Mzansi Books account and access your free trial.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="http://localhost:8083/login" style="background: linear-gradient(to right, #8b5cf6, #6366f1); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Confirm My Email & Go to Login</a>
          </div>
          <p style="color: #374151; font-size: 16px; margin-bottom: 8px;">If you didn't create an account, you can safely ignore this email.</p>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">This link will expire in 24 hours.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px; text-align: center;">© ${new Date().getFullYear()} MOK Mzansi Books. All rights reserved.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return false;
    }
    
    console.log('Email sent successfully with ID:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
