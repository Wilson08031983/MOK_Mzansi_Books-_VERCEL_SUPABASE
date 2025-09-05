import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import emailConfig from '@/emails/config/emailConfig';
import { InvoiceEmail } from '@/emails/templates/InvoiceEmail';

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.RESEND_DOMAIN || new URL(emailConfig.company.website).hostname;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    to,
    clientName,
    invoiceNumber,
    invoiceDate,
    dueDate,
    amountDue,
    invoiceLink,
    companyName = emailConfig.company.name,
    items = [],
    subtotal,
    tax,
    total,
    notes,
  } = req.body || {};

  if (!to || !clientName || !invoiceNumber || !invoiceDate || !dueDate || !amountDue || !invoiceLink || !subtotal || !tax || !total) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    const html = renderToStaticMarkup(
      React.createElement(InvoiceEmail as any, {
        clientName,
        invoiceNumber,
        invoiceDate,
        dueDate,
        amountDue,
        invoiceLink,
        companyName,
        items,
        subtotal,
        tax,
        total,
        notes,
      })
    );

    const subject = `Invoice #${invoiceNumber} from ${companyName}`;

    const { data, error } = await resend.emails.send({
      from: `${companyName} <no-reply@${domain}>`,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Failed to send invoice email:', error);
      return res.status(500).json({ message: 'Failed to send invoice email' });
    }

    return res.status(200).json({ message: 'Invoice email sent', id: data?.id });
  } catch (err) {
    console.error('Error sending invoice email:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}