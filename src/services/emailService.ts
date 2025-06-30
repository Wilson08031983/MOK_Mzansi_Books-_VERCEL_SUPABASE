import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY || 're_AkPz7nFU_JCaJi8MwrTy2TUga9nqkMogU');

// Domain for sending emails
const domain = import.meta.env.VITE_RESEND_DOMAIN || 'mokmzansibooks.com';

// Function to safely convert data to Uint8Array
const toUint8Array = async (data: string | ArrayBuffer): Promise<Uint8Array> => {
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }
  
  if (typeof data === 'string') {
    // For strings, use TextEncoder which is available in all modern browsers
    return new TextEncoder().encode(data);
  }
  
  // Fallback for other types (shouldn't happen with our current usage)
  return new Uint8Array(0);
};

interface QuotationEmailOptions {
  to: string;
  subject?: string;
  quotationNumber: string;
  clientName: string;
  pdfAttachment: Blob;
  pdfFileName: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  firstName?: string;
  lastName?: string;
}

interface PasswordResetEmailOptions {
  to: string;
  subject: string;
  resetToken: string;
  firstName?: string;
}

interface InvitationEmailOptions {
  to: string;
  subject?: string;
  inviterName?: string;
  email: string;
  role: string;
  invitationLink: string;
  companyName?: string;
}

interface DeletionEmailOptions {
  to: string;
  subject?: string;
  firstName?: string;
  companyName?: string;
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
            <a href="http://localhost:8084/login" style="background: linear-gradient(to right, #8b5cf6, #6366f1); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Confirm My Email & Go to Login</a>
          </div>
          <p style="color: #374151; font-size: 16px; margin-bottom: 8px;">If you didn't create an account, you can safely ignore this email.</p>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">This link will expire in 24 hours.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px; text-align: center;">&copy; ${new Date().getFullYear()} MOK Mzansi Books. All rights reserved.</p>
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

/**
 * Send a password reset email to a user
 */
export const sendPasswordResetEmail = async (options: PasswordResetEmailOptions): Promise<boolean> => {
  try {
    const { to, subject, resetToken, firstName = 'there' } = options;
    
    // Create reset link with token and email
    const resetLink = `http://localhost:8084/reset-password?token=${resetToken}&email=${encodeURIComponent(to)}`;
    
    const { data, error } = await resend.emails.send({
      from: `MOK Mzansi Books <no-reply@${domain}>`,
      to: [to],
      subject: subject || 'Reset Your Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://mokmzansibooks.com/logo.png" alt="MOK Mzansi Books" style="width: 120px; height: auto;" />
          </div>
          <h1 style="color: #4c1d95; font-size: 24px; margin-bottom: 16px;">Password Reset Request</h1>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">Hello ${firstName},</p>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">We received a request to reset your password for your MOK Mzansi Books account. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background: linear-gradient(to right, #ec4899, #8b5cf6); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Reset My Password</a>
          </div>
          <p style="color: #374151; font-size: 16px; margin-bottom: 8px;">If you didn't request this password reset, you can safely ignore this email.</p>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">This link will expire in 1 hour for your security.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px; text-align: center;">&copy; ${new Date().getFullYear()} MOK Mzansi Books. All rights reserved.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
    
    console.log('Password reset email sent successfully with ID:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

/**
 * Send an invitation email to a new team member
 */
export const sendInvitationEmail = async (options: InvitationEmailOptions): Promise<boolean> => {
  try {
    const { 
      to, 
      subject, 
      inviterName = 'Admin', 
      email,
      role,
      invitationLink,
      companyName = 'MOK Mzansi Books'
    } = options;
    
    const { data, error } = await resend.emails.send({
      from: `${companyName} <no-reply@${domain}>`,
      to: [to],
      subject: subject || `You've been invited to join ${companyName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://mokmzansibooks.com/logo.png" alt="${companyName}" style="width: 120px; height: auto;" />
          </div>
          <h1 style="color: #4c1d95; font-size: 24px; margin-bottom: 16px;">You've Been Invited!</h1>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">Hello,</p>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">${inviterName} has invited you to join ${companyName} as a <strong>${role}</strong>.</p>
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 8px;"><strong>Your account details:</strong></p>
            <p style="color: #374151; font-size: 16px; margin-bottom: 0;"><strong>Email:</strong> ${email}</p>
          </div>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">To complete your registration and set up your password, click the button below:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${invitationLink}" style="background: linear-gradient(to right, #8b5cf6, #6366f1); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Complete Your Registration</a>
          </div>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;"><strong>Note:</strong> This invitation link will expire in 24 hours.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px; text-align: center;">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send invitation email:', error);
      return false;
    }
    
    console.log('Invitation email sent successfully with ID:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return false;
  }
};

/**
 * Send an account deletion notification email
 */
export const sendAccountDeletionEmail = async (options: DeletionEmailOptions): Promise<boolean> => {
  try {
    const { to, subject, firstName = 'there', companyName = 'MOK Mzansi Books' } = options;
    
    const { data, error } = await resend.emails.send({
      from: `${companyName} <no-reply@${domain}>`,
      to: [to],
      subject: subject || 'Your Account Has Been Removed',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://mokmzansibooks.com/logo.png" alt="${companyName}" style="width: 120px; height: auto;" />
          </div>
          <h1 style="color: #4c1d95; font-size: 24px; margin-bottom: 16px;">Account Removed</h1>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">Hello ${firstName},</p>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
            Your user account has been removed from ${companyName}. If you believe this was a mistake, please contact your administrator.
          </p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px; text-align: center;">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send account deletion email:', error);
      return false;
    }
    
    console.log('Account deletion email sent successfully with ID:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending account deletion email:', error);
    return false;
  }
};

/**
 * Send a quotation email with PDF attachment
 */
export const sendQuotationEmail = async (options: QuotationEmailOptions): Promise<boolean> => {
  try {
    const { 
      to, 
      subject = `Quotation ${options.quotationNumber} from MOK Mzansi Books`,
      clientName,
      pdfAttachment,
      pdfFileName
    } = options;

    // Convert File/Blob to base64 for email attachment
    const arrayBuffer = await pdfAttachment.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const buffer = Array.from(uint8Array).map(byte => String.fromCharCode(byte)).join('');
    const base64Pdf = btoa(buffer);
    
    if (!base64Pdf) {
      throw new Error('Failed to convert PDF to base64');
    }

    const { data, error } = await resend.emails.send({
      from: `MOK Mzansi Books <quotations@${domain}>`,
      to: [to],
      subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="https://mokmzansibooks.com/logo.png" alt="MOK Mzansi Books" style="width: 120px; height: auto;" />
          </div>
          <h1 style="color: #4c1d95; font-size: 20px; font-weight: 600; margin-bottom: 16px;">Dear ${clientName},</h1>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Thank you for your interest in our services. Please find your quotation attached for your reference.
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Quotation Number: <strong>${options.quotationNumber}</strong>
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            If you have any questions or need further clarification, please don't hesitate to contact us.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="mailto:support@mokmzansibooks.com" style="background: linear-gradient(to right, #8b5cf6, #6366f1); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Contact Us</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-bottom: 8px;">This is an automated message, please do not reply directly to this email.</p>
          <p style="color: #6b7280; font-size: 14px; text-align: center;">&copy; ${new Date().getFullYear()} MOK Mzansi Books. All rights reserved.</p>
        </div>
      `,
      attachments: [
        {
          filename: pdfFileName,
          content: base64Pdf,
        },
      ],
    });

    if (error) {
      console.error('Failed to send quotation email:', error);
      return false;
    }
    
    console.log('Quotation email sent successfully with ID:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending quotation email:', error);
    return false;
  }
};

export default {
  sendConfirmationEmail,
  sendPasswordResetEmail,
  sendInvitationEmail,
  sendQuotationEmail,
  sendAccountDeletionEmail
};
