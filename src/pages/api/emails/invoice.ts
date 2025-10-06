import type { NextApiRequest, NextApiResponse } from 'next';
import emailConfig from '@/emails/config/emailConfig';
import { postmarkService } from '@/services/postmarkService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!process.env.POSTMARK_SERVER_TOKEN) {
    return res.status(500).json({ message: 'Postmark server token not configured' });
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
    bankName,
    accountNumber,
    paymentTerms
  } = req.body || {};

  if (!to || !clientName || !invoiceNumber || !invoiceDate || !dueDate || !subtotal || !tax || !total) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    const result = await postmarkService.sendInvoiceEmail(to, {
      invoiceNumber,
      clientName,
      dueDate,
      total,
      items: items.map((it: any) => ({
        description: it.description,
        quantity: Number(it.quantity) || 0,
        unitPrice: String(it.unitPrice ?? it.price ?? ''),
        amount: String(it.amount ?? '')
      })),
      invoiceDate,
      paymentTerms,
      subtotal,
      taxAmount: tax,
      bankName,
      accountNumber,
      discountAmount: notes // keep notes in metadata-equivalent field if needed
    });

    return res.status(200).json({ message: 'Invoice email sent', id: result.messageId });
  } catch (err) {
    console.error('Error sending invoice email:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}