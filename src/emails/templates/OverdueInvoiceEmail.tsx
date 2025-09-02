import React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';

interface OverdueInvoiceEmailProps {
  clientName: string;
  invoiceNumber: string;
  dueDate: string;
  amountDue: string;
  invoiceLink: string;
  daysOverdue: number;
  supportEmail?: string;
}

export const OverdueInvoiceEmail: React.FC<OverdueInvoiceEmailProps> = ({
  clientName,
  invoiceNumber,
  dueDate,
  amountDue,
  invoiceLink,
  daysOverdue,
  supportEmail = 'support@mokmzansibooks.com',
}) => {
  const title = `Overdue Notice: Invoice #${invoiceNumber}`;
  const previewText = `Invoice #${invoiceNumber} for ${clientName} is ${daysOverdue} day${Math.abs(daysOverdue) === 1 ? '' : 's'} overdue. Amount due: ${amountDue}.`;

  return (
    <BaseEmailTemplate title={title} previewText={previewText}>
      <p>Dear {clientName},</p>

      <p>We noticed that <strong>Invoice #{invoiceNumber}</strong>, due on <strong>{dueDate}</strong>, is now <strong>{daysOverdue} day{Math.abs(daysOverdue) === 1 ? '' : 's'} overdue</strong>.</p>

      <p><strong>Outstanding Amount:</strong> {amountDue}</p>

      <div style={{textAlign: 'center', margin: '30px 0'}}>
        <a href={invoiceLink} className="button" style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: 600,
          margin: '20px 0'
        }}>
          Pay Now
        </a>
      </div>

      <p>If you have already settled this invoice, please ignore this notice. Otherwise, we kindly request that you complete the payment at your earliest convenience.</p>

      <p>For any questions or disputes, reply to this email or contact us at <a href={`mailto:${supportEmail}`} style={{color: '#4f46e5'}}>{supportEmail}</a>.</p>
    </BaseEmailTemplate>
  );
};

export default OverdueInvoiceEmail;