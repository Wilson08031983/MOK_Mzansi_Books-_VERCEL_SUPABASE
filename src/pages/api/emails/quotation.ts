import type { NextApiRequest, NextApiResponse } from 'next';
import Mailjet from 'node-mailjet';
import emailConfig from '@/emails/config/emailConfig';

const mailjet = Mailjet.apiConnect(
  process.env.VITE_MAILJET_API_KEY!,
  process.env.VITE_MAILJET_SECRET_KEY!
);
const domain = process.env.VITE_MAILJET_DOMAIN || new URL(emailConfig.company.website).hostname;
const logoUrl = `${new URL(emailConfig.company.website).origin}${emailConfig.company.logo.startsWith('/') ? emailConfig.company.logo : `/${emailConfig.company.logo}`}`;
const supportEmail = emailConfig.company.email || emailConfig.sender.email;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, subject, quotationNumber, clientName, pdfBase64, pdfFileName } = req.body || {};

  if (!to || !quotationNumber || !clientName || !pdfBase64 || !pdfFileName) {
    return res.status(400).json({ message: 'Missing required parameters: to, quotationNumber, clientName, pdfBase64, pdfFileName' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${emailConfig.company.name} <quotations@${domain}>`,
      to: [to],
      subject: subject || `Quotation ${quotationNumber} from ${emailConfig.company.name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="${logoUrl}" alt="${emailConfig.company.name}" style="width: 120px; height: auto;" />
          </div>
          <h1 style="color: #4c1d95; font-size: 20px; font-weight: 600; margin-bottom: 16px;">Dear ${clientName},</h1>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Thank you for your interest in our services. Please find your quotation attached for your reference.
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Quotation Number: <strong>${quotationNumber}</strong>
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            If you have any questions or need further clarification, please don't hesitate to contact us.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="mailto:${supportEmail}" style="background: linear-gradient(to right, #8b5cf6, #6366f1); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Contact Us</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-bottom: 8px;">This is an automated message, please do not reply directly to this email.</p>
          <p style="color: #6b7280; font-size: 14px; text-align: center;">&copy; ${new Date().getFullYear()} ${emailConfig.company.name}. All rights reserved.</p>
        </div>
      `,
      attachments: [
        {
          filename: pdfFileName,
          content: pdfBase64,
        },
      ],
    });

    if (error) {
      console.error('Failed to send quotation email:', error);
      return res.status(500).json({ message: 'Failed to send quotation email' });
    }

    return res.status(200).json({ message: 'Quotation email sent', id: data?.id });
  } catch (err) {
    console.error('Error sending quotation email:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}