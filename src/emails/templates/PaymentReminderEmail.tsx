import React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';
import emailConfig from '../config/emailConfig';

interface PaymentReminderEmailProps {
  clientName: string;
  invoiceNumber: string;
  dueDate: string;
  amountDue: string;
  invoiceLink: string;
  supportEmail?: string;
}

export const PaymentReminderEmail: React.FC<PaymentReminderEmailProps> = ({
  clientName,
  invoiceNumber,
  dueDate,
  amountDue,
  invoiceLink,
  supportEmail = emailConfig.company.email,
}) => {
  const title = `Payment Reminder: Invoice #${invoiceNumber}`;
  const previewText = `Invoice #${invoiceNumber} for ${clientName} is due on ${dueDate}. Amount due: ${amountDue}.`;

  return (
    <BaseEmailTemplate title={title} previewText={previewText}>
      <p>Dear {clientName},</p>

      <p>This is a friendly reminder that <strong>Invoice #{invoiceNumber}</strong> is due on <strong>{dueDate}</strong>.</p>

      <p><strong>Amount Due:</strong> {amountDue}</p>

      <div style={{textAlign: 'center', margin: '30px 0'}}>
        <a href={invoiceLink} className="button" style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: 600,
          margin: '20px 0'
        }}>
          View Invoice
        </a>
      </div>

      <p>If you have already made payment, please disregard this message. If you have any questions, reply to this email or contact us at <a href={`mailto:${supportEmail}`} style={{color: '#4f46e5'}}>{supportEmail}</a>.</p>

      <p>Thank you for your prompt attention to this matter.</p>
    </BaseEmailTemplate>
  );
};

export default PaymentReminderEmail;