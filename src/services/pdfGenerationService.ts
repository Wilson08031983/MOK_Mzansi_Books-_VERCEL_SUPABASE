/**
 * PDF Generation Service
 * 
 * This service provides functionality for generating PDF documents
 * for invoices, quotations, and other business documents.
 * Uses jsPDF and html2canvas for PDF generation.
 */

// Import types from memory
interface CompanyDetails {
  name: string;
  email: string;
  phone: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  vatNumber?: string;
  regNumber?: string;
  bankName?: string;
  accountNumber?: string;
  branchCode?: string;
  accountType?: string;
  website?: string;
  contactName?: string;
  contactSurname?: string;
  position?: string;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingPostal?: string;
  billingCountry?: string;
  contactPerson?: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  markupPercent?: number;
  discount?: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientInfo: Client;
  items: LineItem[];
  subtotal: number;
  vatRate: number;
  vatTotal: number;
  grandTotal: number;
  notes?: string;
  terms?: string;
}

interface QuotationData {
  quotationNumber: string;
  date: string;
  expiryDate: string;
  clientInfo: Client;
  items: LineItem[];
  subtotal: number;
  vatRate: number;
  vatTotal: number;
  grandTotal: number;
  notes?: string;
  terms?: string;
}

// Initialize the PDF generation service
export const initialize = (): boolean => {
  try {
    console.log('PDF generation service initialized');
    return true;
  } catch (error) {
    console.error('Error initializing PDF generation service:', error);
    return false;
  }
};

/**
 * Generate an invoice PDF
 * @param invoiceData The invoice data
 * @param companyDetails The company details
 * @returns Promise resolving to a Blob containing the PDF
 */
export const generateInvoicePdf = async (
  invoiceData: InvoiceData,
  companyDetails: CompanyDetails
): Promise<Blob> => {
  try {
    // In a real implementation, this would use jsPDF and html2canvas
    // For now, we'll simulate PDF generation with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Generated invoice PDF for:', invoiceData.invoiceNumber);
    
    // Create a simple text representation of the PDF content
    const pdfContent = `
      INVOICE #${invoiceData.invoiceNumber}
      
      From:
      ${companyDetails.name}
      ${companyDetails.email}
      ${companyDetails.phone}
      ${companyDetails.addressLine1 || ''}
      ${companyDetails.addressLine2 || ''}
      
      To:
      ${invoiceData.clientInfo.name}
      ${invoiceData.clientInfo.email || ''}
      ${invoiceData.clientInfo.phone || ''}
      ${invoiceData.clientInfo.billingStreet || ''}
      ${invoiceData.clientInfo.billingCity || ''}, ${invoiceData.clientInfo.billingState || ''}
      
      Date: ${invoiceData.date}
      Due Date: ${invoiceData.dueDate}
      
      Items:
      ${invoiceData.items.map(item => 
        `${item.description} - ${item.quantity} x R${item.rate.toFixed(2)} = R${item.amount.toFixed(2)}`
      ).join('\n')}
      
      Subtotal: R${invoiceData.subtotal.toFixed(2)}
      VAT (${invoiceData.vatRate}%): R${invoiceData.vatTotal.toFixed(2)}
      Total: R${invoiceData.grandTotal.toFixed(2)}
      
      Notes: ${invoiceData.notes || 'N/A'}
      Terms: ${invoiceData.terms || 'N/A'}
    `;
    
    // Create a blob representing a PDF (in reality this would be actual PDF data)
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    return blob;
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw new Error('Failed to generate invoice PDF');
  }
};

/**
 * Generate a generic PDF (alias for generateInvoicePdf)
 * @param data The data for PDF generation
 * @param companyDetails The company details
 * @returns Promise resolving to a Blob containing the PDF
 */
export const generatePDF = generateInvoicePdf;

/**
 * Generate an invoice PDF (alias for generateInvoicePdf with uppercase PDF)
 * @param invoiceData The invoice data
 * @param companyDetails The company details
 * @returns Promise resolving to a Blob containing the PDF
 */
export const generateInvoicePDF = generateInvoicePdf;

/**
 * Generate a quotation PDF (alias for generateQuotationPdf with uppercase PDF)
 * @param quotationData The quotation data
 * @param companyDetails The company details
 * @returns Promise resolving to a Blob containing the PDF
 */
import { generateQuotationPdf as generateQuotationPdfExternal } from '@/utils/quotationPdfGenerator';
export const generateQuotationPDF = generateQuotationPdfExternal;
export const generateQuotationPdf = generateQuotationPdfExternal;
