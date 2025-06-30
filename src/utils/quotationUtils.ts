import { Quotation } from '@/services/quotationService';

// Extended type for PDF generation
export interface QuotationPdfData extends Quotation {
  clientInfo: {
    companyName: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    shippingAddress: string;
  };
  company: {
    name: string;
    email: string;
    phone: string;
    address: string;
    logoUrl: string;
    vatNumber: string;
  };
}

/**
 * Generates the next quotation number in the format QUO-YYYY-NNN
 * @param existingQuotations Array of existing quotations to find the next number
 * @returns The next quotation number (e.g., 'QUO-2025-001')
 */
export const generateNextQuotationNumber = (existingQuotations: Quotation[] = []): string => {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `QUO-${currentYear}`;
  
  // Find the highest sequence number for the current year
  let maxSequence = 0;
  
  existingQuotations.forEach(quote => {
    if (quote.number && quote.number.startsWith(yearPrefix)) {
      const sequence = parseInt(quote.number.split('-')[2] || '0', 10);
      if (sequence > maxSequence) {
        maxSequence = sequence;
      }
    }
  });
  
  // Increment the sequence and format with leading zeros
  const nextSequence = maxSequence + 1;
  return `${yearPrefix}-${nextSequence.toString().padStart(3, '0')}`;
};

/**
 * Formats a date string to YYYY-MM-DD
 * @param date Date object or string
 * @returns Formatted date string (YYYY-MM-DD)
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Generates a PDF from the quotation data
 * @param quotation Quotation data with extended PDF properties
 * @returns Promise that resolves to the PDF Blob
 */
export const generateQuotationPdf = async (quotation: QuotationPdfData): Promise<Blob> => {
  // Create a simple HTML template for the quotation
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Quotation ${quotation.number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .company-logo { max-width: 150px; max-height: 80px; }
        .quotation-title { text-align: center; margin: 20px 0; }
        .client-info, .company-info { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .totals { margin-left: auto; width: 300px; }
        .totals table { width: 100%; }
        .footer { margin-top: 50px; font-size: 12px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <h2>${quotation.company.name}</h2>
          <div>${quotation.company.address}</div>
          <div>${quotation.company.phone}</div>
          <div>${quotation.company.email}</div>
          ${quotation.company.vatNumber ? `<div>VAT: ${quotation.company.vatNumber}</div>` : ''}
        </div>
        ${quotation.company.logoUrl ? 
          `<img src="${quotation.company.logoUrl}" alt="Company Logo" class="company-logo">` : ''}
      </div>

      <div class="quotation-title">
        <h1>QUOTATION</h1>
        <p>Quotation #${quotation.number}</p>
        <p>Date: ${new Date(quotation.date).toLocaleDateString()}</p>
      </div>

      <div class="client-info">
        <h3>Bill To:</h3>
        <div>${quotation.clientInfo.companyName || quotation.client}</div>
        <div>${quotation.clientInfo.name}</div>
        <div>${quotation.clientInfo.email}</div>
        <div>${quotation.clientInfo.phone}</div>
        <div>${quotation.clientInfo.address}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${quotation.items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.description}</td>
              <td>${item.quantity} ${item.unit || ''}</td>
              <td>${quotation.currency} ${item.rate.toFixed(2)}</td>
              <td>${quotation.currency} ${(item.quantity * item.rate).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <table>
          <tr>
            <td><strong>Subtotal:</strong></td>
            <td>${quotation.currency} ${quotation.subtotal.toFixed(2)}</td>
          </tr>
          ${quotation.taxAmount > 0 ? `
            <tr>
              <td><strong>Tax (${(quotation.taxAmount / quotation.subtotal * 100).toFixed(0)}%):</strong></td>
              <td>${quotation.currency} ${quotation.taxAmount.toFixed(2)}</td>
            </tr>
          ` : ''}
          ${quotation.discount > 0 ? `
            <tr>
              <td><strong>Discount:</strong></td>
              <td>-${quotation.currency} ${quotation.discount.toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr>
            <td><strong>Total:</strong></td>
            <td><strong>${quotation.currency} ${quotation.totalAmount.toFixed(2)}</strong></td>
          </tr>
        </table>
      </div>

      ${quotation.notes ? `
        <div class="notes">
          <h3>Notes:</h3>
          <p>${quotation.notes}</p>
        </div>
      ` : ''}

      ${quotation.terms ? `
        <div class="terms">
          <h3>Terms & Conditions:</h3>
          <p>${quotation.terms}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>${quotation.company.name} | ${quotation.company.address}</p>
      </div>
    </body>
    </html>
  `;

  // For now, we'll return a simple HTML file as a Blob
  // In a real implementation, you would use a PDF generation library here
  return new Blob([htmlContent], { type: 'text/html' });
};
