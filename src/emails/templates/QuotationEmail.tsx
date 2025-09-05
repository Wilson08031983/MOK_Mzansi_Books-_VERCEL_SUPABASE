import * as React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';
import emailConfig from '../config/emailConfig';

interface QuotationEmailProps {
  clientName: string;
  quotationNumber: string;
  quotationDate: string;
  validUntil: string;
  amount: string;
  quotationLink: string;
  companyName: string;
  companyEmail: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: string;
    amount: string;
  }>;
  subtotal: string;
  tax: string;
  total: string;
  notes?: string;
}

export const QuotationEmail: React.FC<Readonly<QuotationEmailProps>> = ({
  clientName,
  quotationNumber,
  quotationDate,
  validUntil,
  amount,
  quotationLink,
  companyName,
  companyEmail,
  items,
  subtotal,
  tax,
  total,
  notes,
}) => (
  <BaseEmailTemplate
    title={`Quotation #${quotationNumber} from ${companyName}`}
    previewText={`Your quotation #${quotationNumber} is ready. Amount: ${amount}`}
  >
    <div style={styles.container}>
      <h1 style={styles.heading}>Quotation #{quotationNumber}</h1>
      
      <div style={styles.section}>
        <div style={styles.row}>
          <div style={styles.column}>
            <h3 style={styles.sectionTitle}>From</h3>
            <p style={styles.text}>
              <strong>{companyName}</strong><br />
              {emailConfig.sender.name}<br />
              {emailConfig.company.address}<br />
              Email: {emailConfig.company.email}<br />
              Phone: {emailConfig.company.phone}
            </p>
          </div>
          <div style={styles.column}>
            <h3 style={styles.sectionTitle}>Quotation For</h3>
            <p style={styles.text}>
              <strong>{clientName}</strong>
            </p>
            
            <div style={styles.detailsGrid}>
              <div style={styles.detailLabel}>Quotation #:</div>
              <div style={styles.detailValue}>{quotationNumber}</div>
              
              <div style={styles.detailLabel}>Date Issued:</div>
              <div style={styles.detailValue}>{quotationDate}</div>
              
              <div style={styles.detailLabel}>Valid Until:</div>
              <div style={{...styles.detailValue, color: '#EF4444', fontWeight: 'bold'}}>
                {validUntil}
              </div>
              
              <div style={styles.detailLabel}>Total Amount:</div>
              <div style={{...styles.detailValue, fontSize: '18px', fontWeight: 'bold'}}>
                {amount}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Quotation Details</h3>
        <p style={styles.text}>
          Thank you for your interest in our services. Below you'll find the details of your quotation.
        </p>
        
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Description</th>
              <th style={styles.th} align="right">Qty</th>
              <th style={styles.th} align="right">Unit Price</th>
              <th style={styles.th} align="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td style={styles.td}>{item.description}</td>
                <td style={styles.td} align="right">{item.quantity}</td>
                <td style={styles.td} align="right">{item.unitPrice}</td>
                <td style={styles.td} align="right">{item.amount}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={styles.td} align="right">Subtotal:</td>
              <td style={styles.td} align="right">{subtotal}</td>
            </tr>
            <tr>
              <td colSpan={3} style={styles.td} align="right">Tax (VAT):</td>
              <td style={styles.td} align="right">{tax}</td>
            </tr>
            <tr>
              <td colSpan={3} style={{...styles.td, borderTop: '2px solid #e5e7eb'}} align="right">
                <strong>Total:</strong>
              </td>
              <td style={{...styles.td, borderTop: '2px solid #e5e7eb'}} align="right">
                <strong>{total}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {notes && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Additional Notes</h3>
          <p style={styles.text}>{notes}</p>
        </div>
      )}

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Next Steps</h3>
        <p style={styles.text}>
          To accept this quotation, please reply to this email or contact us at {companyEmail}.
          This quotation is valid until {validUntil}.
        </p>
        
        <a
          href={quotationLink}
          style={styles.button}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Quotation Online
        </a>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
        </p>
        <p style={styles.footerText}>
          This email was sent to {clientName}. If you believe you received this in error, 
          please contact us at <a href={`mailto:${emailConfig.company.email}`} style={styles.link}>{emailConfig.company.email}</a>
        </p>
      </div>
    </div>
  </BaseEmailTemplate>
);

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
    color: '#333',
  },
  heading: {
    color: '#3B82F6',
    fontSize: '24px',
    marginBottom: '20px',
    textAlign: 'center' as const,
  },
  section: {
    marginBottom: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    color: '#111827',
    fontSize: '16px',
    marginTop: '0',
    marginBottom: '12px',
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    margin: '0 -10px',
  },
  column: {
    flex: '1',
    minWidth: '250px',
    padding: '0 10px',
    marginBottom: '15px',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr',
    gap: '8px',
    marginTop: '15px',
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#4B5563',
  },
  detailValue: {
    color: '#111827',
  },
  text: {
    margin: '0 0 12px 0',
    color: '#4B5563',
    lineHeight: '1.6',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    margin: '15px 0',
  },
  th: {
    backgroundColor: '#F9FAFB',
    padding: '12px',
    textAlign: 'left' as const,
    borderBottom: '1px solid #E5E7EB',
    color: '#4B5563',
    fontWeight: 'bold',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #E5E7EB',
    verticalAlign: 'top' as const,
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#3B82F6',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontWeight: 'bold',
    margin: '10px 0',
    textAlign: 'center' as const,
  },
  link: {
    color: '#3B82F6',
    textDecoration: 'none',
    wordBreak: 'break-all' as const,
  },
  footer: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #E5E7EB',
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: '12px',
    color: '#9CA3AF',
    margin: '5px 0',
  },
};
