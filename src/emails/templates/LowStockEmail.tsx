import * as React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';
import emailConfig from '../config/emailConfig';

export interface LowStockItem {
  name: string;
  currentStock: number;
  minimumStock: number;
  sku?: string;
  category?: string;
  lastRestocked?: string;
}

interface LowStockEmailProps {
  items: LowStockItem[];
  companyName: string;
  inventoryLink: string;
}

export const LowStockEmail: React.FC<LowStockEmailProps> = ({
  items,
  companyName,
  inventoryLink,
}) => {
  const appBase = (process.env.NEXT_PUBLIC_APP_URL || emailConfig.company.website).replace(/\/$/, '');
  const effectiveInventoryLink = /^https?:\/\//i.test(inventoryLink)
    ? inventoryLink
    : `${appBase}${inventoryLink.startsWith('/') ? inventoryLink : '/' + inventoryLink}`;

  return (
    <BaseEmailTemplate
      title="Low Stock Alert"
      previewText="Action required: Some inventory items are running low"
      companyName={companyName}
    >
      <div style={styles.container}>
        <h2 style={styles.heading}>Low Stock Alert</h2>
        
        <p style={styles.paragraph}>
          The following items in your inventory are below their minimum stock levels and need to be reordered soon:
        </p>

        <div style={styles.tableContainer}>
          <table style={styles.table} cellSpacing="0" cellPadding="0">
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeaderCell}>Item Name</th>
                <th style={styles.tableHeaderCell}>SKU</th>
                <th style={styles.tableHeaderCell}>Current Stock</th>
                <th style={styles.tableHeaderCell}>Minimum Required</th>
                <th style={styles.tableHeaderCell}>Category</th>
                <th style={styles.tableHeaderCell}>Last Restocked</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} style={styles.tableRow}>
                  <td style={styles.tableCell}>{item.name}</td>
                  <td style={styles.tableCell}>{item.sku || 'N/A'}</td>
                  <td style={{ ...styles.tableCell, color: '#ef4444', fontWeight: 'bold' }}>
                    {item.currentStock}
                  </td>
                  <td style={styles.tableCell}>{item.minimumStock}</td>
                  <td style={styles.tableCell}>{item.category || 'N/A'}</td>
                  <td style={styles.tableCell}>
                    {item.lastRestocked ? new Date(item.lastRestocked).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.buttonContainer}>
          <a
            href={effectiveInventoryLink}
            style={styles.button}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Inventory
          </a>
        </div>

        <p style={styles.paragraph}>
          Please take the necessary action to restock these items to avoid any potential stockouts.
        </p>

        <p style={styles.paragraph}>
          Need help? Contact our support team at{' '}
          <a href={`mailto:${emailConfig.company.email}`} style={{ color: '#4f46e5' }}>
            {emailConfig.company.email}
          </a>.
        </p>
      </div>
    </BaseEmailTemplate>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    lineHeight: 1.5,
  },
  heading: {
    color: '#1a365d',
    fontSize: '24px',
    marginBottom: '20px',
    textAlign: 'center' as const,
  },
  paragraph: {
    margin: '15px 0',
    fontSize: '16px',
    lineHeight: 1.6,
  },
  tableContainer: {
    margin: '20px 0',
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  tableHeaderRow: {
    backgroundColor: '#f8fafc',
  },
  tableHeaderCell: {
    padding: '12px 15px',
    textAlign: 'left' as const,
    borderBottom: '1px solid #e2e8f0',
    fontWeight: 'bold' as const,
    color: '#4a5568',
    fontSize: '14px',
  },
  tableRow: {
    borderBottom: '1px solid #e2e8f0',
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:hover': {
      backgroundColor: '#f8fafc',
    },
  },
  tableCell: {
    padding: '12px 15px',
    fontSize: '14px',
    color: '#4a5568',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '25px 0',
  },
  button: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: 'bold' as const,
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#1d4ed8',
    },
  },
  footer: {
    marginTop: '30px',
    fontSize: '14px',
    color: '#718096',
    textAlign: 'center' as const,
    borderTop: '1px solid #e2e8f0',
    paddingTop: '20px',
  },
};
