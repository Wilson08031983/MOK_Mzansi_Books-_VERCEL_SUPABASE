/**
 * QUOTATION PDF GENERATOR
 * ======================
 * This file contains the quotation PDF generation functionality.
 * It has been designed to match the invoice PDF generator's layout and functionality.
 * 
 * Features:
 * - Professional A4 layout with proper company and client information
 * - Multi-page support with pagination and repeated headers
 * - Proper error handling and user feedback
 * - Consistent data handling from localStorage
 * 
 * Last updated: July 5, 2025
 */

import { toast } from 'sonner';
import jsPDF from 'jspdf';

// Define interfaces
interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  formatted?: string;
}

interface Client {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string | Address;
  companyName?: string;
  contactPerson?: string;
  firstName?: string;
  lastName?: string;
  billingAddress?: string | Address;
  shippingAddress?: string | Address;
  
  // Address fields for backward compatibility
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  
  // Actual client service fields
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingPostal?: string;
  billingCountry?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostal?: string;
  shippingCountry?: string;
}

interface QuotationItem {
  id?: string;
  itemNo?: number;
  description: string;
  quantity: number;
  rate: number;
  unitPrice?: number;
  markupPercent?: number;
  discount?: number;
  amount: number;
}

interface CompanyDetails {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  vatNumber?: string;
  regNumber?: string;
  website?: string;
  bankName?: string;
  bankAccount?: string;
  accountNumber?: string;
  accountType?: string;
  branchCode?: string;
  accountHolder?: string;
  contactName?: string;
  contactSurname?: string;
  position?: string;
  vatApplicable?: boolean;
  vatNotApplicable?: boolean;
  websiteNotApplicable?: boolean;
}

interface CompanyAssets {
  Logo?: { dataUrl: string };
  Stamp?: { dataUrl: string };
  Signature?: { dataUrl: string };
}

export interface Quotation {
  id: string;
  number: string;
  date: string;
  validUntil: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  client: string | Client;
  items: QuotationItem[];
  subtotal?: number;
  vatRate?: number;
  vatTotal?: number;
  total?: number;
  amount?: number;
  notes?: string;
  terms?: string;
  reference?: string;
  status?: string;
  currency?: string;
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return `R ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Main PDF generation function
export const generateQuotationPdf = async (quotation: Quotation): Promise<void> => {
  // Constants for page layout and pagination
  const PAGE_HEIGHT = 297; // A4 height in mm
  const FOOTER_RESERVED_HEIGHT = 70; // Space reserved for footer elements
  const HEADER_HEIGHT = 80; // Approximate height of the header section
  const MAX_CONTENT_HEIGHT = PAGE_HEIGHT - FOOTER_RESERVED_HEIGHT - HEADER_HEIGHT;
  // totalPages will be updated after we determine how many pages we need
  let totalPages = 1;
  
  // Helper function to check if a field has valid content
  const hasValidContent = (value: string | undefined): boolean => {
    return !!value && typeof value === 'string' && value.trim() !== '';
  };
  
  // Helper function to check if we need to add a new page based on current position
  const needsNewPage = (currentY: number, requiredSpace: number = 10): boolean => {
    return currentY + requiredSpace > PAGE_HEIGHT - FOOTER_RESERVED_HEIGHT;
  };
  
  // Forward declaration of drawHeader function
  let drawHeader: (doc: jsPDF, pageNum: number) => number;
  
  // Helper function to add a new page and draw the header
  const addNewPage = (doc: jsPDF, pageNum: number): number => {
    doc.addPage();
    return drawHeader(doc, pageNum + 1);
  };
  
  // Helper function to draw page number
  const drawPageNumber = (doc: jsPDF, pageNum: number, totalPages: number): void => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };
  
  // Helper function to draw the table header
  const drawTableHeader = (doc: jsPDF, yPos: number, margin: number, contentWidth: number, 
                          tableHeaders: string[], colWidths: number[], colPositions: number[]): number => {
    // Draw table header background and border
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 2.5, contentWidth, 8, 'F'); // Reduced height from 10 to 8
    doc.setDrawColor(0, 0, 0);
    doc.rect(margin, yPos - 2.5, contentWidth, 8); // Reduced height from 10 to 8
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    tableHeaders.forEach((header, index) => {
      // Adjust alignment and position based on column
      let x;
      const align = index >= 2 ? 'right' : 'left';
      
      if (align === 'right') {
        x = colPositions[index] + colWidths[index] - 2;
      } else {
        x = colPositions[index] + 2;
      }
      
      doc.text(header, x, yPos + 1, { align });
    });
    
    // Draw vertical lines for columns
    doc.setDrawColor(200, 200, 200);
    colPositions.forEach((x, i) => {
      if (i > 0) {
        doc.line(x, yPos - 2.5, x, yPos + 5.5);
      }
    });
    
    // Draw the final vertical line at the end of the table
    const lastX = colPositions[colPositions.length - 1] + colWidths[colWidths.length - 1];
    doc.line(lastX, yPos - 2.5, lastX, yPos + 5.5);
    
    return yPos + 8; // Return the Y position after the header
  };

  try {
    // Load company details from localStorage
    let companyDetails: CompanyDetails = { name: 'Company Name' };
    let companyAssets: CompanyAssets = {};
    
    try {
      const companyDetailsString = localStorage.getItem('companyDetails');
      if (companyDetailsString) {
        companyDetails = JSON.parse(companyDetailsString);
      }
      
      const companyAssetsString = localStorage.getItem('companyAssets');
      if (companyAssetsString) {
        companyAssets = JSON.parse(companyAssetsString);
      }
    } catch (error) {
      console.error('Error loading company details or assets:', error);
    }
    
    // Load client data from localStorage
    let clientData: Client | null = null;
    
    try {
      if (typeof quotation.client === 'string') {
        const clientsString = localStorage.getItem('clients');
        if (clientsString) {
          const clients = JSON.parse(clientsString);
          clientData = clients.find((c: Client) => c.id === quotation.client || c.id === quotation.clientId);
        }
      } else {
        clientData = quotation.client as Client;
      }
    } catch (error) {
      console.error('Error loading client data:', error);
    }
    
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set document properties
    doc.setProperties({
      title: `Quotation-${quotation.number}`,
      subject: `Quotation for ${clientData?.companyName || clientData?.name || 'Client'}`,
      author: companyDetails.name,
      creator: 'MOK Mzansi Books'
    });
    
    // Add custom font if needed
    // doc.addFont('path/to/font.ttf', 'custom-font', 'normal');
    
    // Define page dimensions and margins
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Helper function to normalize client data
    const normalizeClientData = (client: Client | null): Client => {
      if (!client) {
        return {
          id: 'unknown',
          name: 'Unknown Client',
          email: '',
          phone: ''
        };
      }
      
      // Prioritize company name, then contact person, then first/last name
      const name = client.companyName || 
                  (client.contactPerson ? client.contactPerson : 
                  ((client.firstName || '') + ' ' + (client.lastName || '')).trim());
      
      return {
        ...client,
        name: name || 'Unknown Client'
      };
    };
    
    // Helper function to format address
    const formatAddress = (client: Client | null): string => {
      if (!client) return '';
      
      // Priority 1: Use billing address from client service structure
      if (client.billingStreet) {
        const parts = [
          client.billingStreet,
          client.billingCity,
          client.billingState,
          client.billingPostal,
          client.billingCountry
        ].filter(part => !!part && part.trim() !== '');
        
        return parts.join(', ');
      }
      
      // Priority 2: Use existing address fields
      if (typeof client.billingAddress === 'string' && client.billingAddress.trim()) {
        return client.billingAddress;
      }
      
      if (typeof client.address === 'string' && client.address.trim()) {
        return client.address;
      }
      
      // Priority 3: Use individual address fields
      const addressParts = [
        client.addressLine1,
        client.addressLine2,
        client.city,
        client.province,
        client.postalCode,
        client.country
      ].filter(part => !!part && part.trim() !== '');
      
      return addressParts.join(', ');
    };
    
    // Helper function to draw the header section
    drawHeader = (doc: jsPDF, pageNum: number): number => {
      let yPos = margin;
      
      // Center the logo at the top
      if (companyAssets.Logo?.dataUrl) {
        try {
          // Create an image element to get the original dimensions
          const img = new Image();
          img.src = companyAssets.Logo.dataUrl;
          
          // Set maximum dimensions while preserving aspect ratio
          const maxWidth = 50;
          const maxHeight = 30;
          
          // Calculate dimensions that preserve aspect ratio
          let logoWidth, logoHeight;
          
          if (img.width > 0 && img.height > 0) {
            // Use actual image dimensions if available
            const aspectRatio = img.width / img.height;
            
            if (aspectRatio > 1) {
              // Wider than tall
              logoWidth = Math.min(maxWidth, img.width);
              logoHeight = logoWidth / aspectRatio;
            } else {
              // Taller than wide or square
              logoHeight = Math.min(maxHeight, img.height);
              logoWidth = logoHeight * aspectRatio;
            }
          } else {
            // Fallback if dimensions aren't available
            logoWidth = maxWidth;
            logoHeight = maxHeight / 2;
          }
          
          const logoX = (pageWidth - logoWidth) / 2;
          
          doc.addImage(companyAssets.Logo.dataUrl, 'PNG', logoX, yPos, logoWidth, logoHeight);
          yPos += logoHeight + 5;
        } catch (error) {
          console.error('Error adding logo:', error);
          yPos += 10; // Add some space even if logo fails
        }
      } else {
        yPos += 10; // Add some space if no logo
      }
      
      // Format the company address
      const companyAddressParts = [
        companyDetails.addressLine1,
        companyDetails.addressLine2,
        companyDetails.addressLine3,
        companyDetails.addressLine4
      ].filter(part => hasValidContent(part));
      
      const formattedCompanyAddress = companyAddressParts.join(', ');
      
      // Company details on the left
      const leftColumnX = margin;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(companyDetails.name || 'Company Name', leftColumnX, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      if (companyDetails.email) {
        doc.text(companyDetails.email, leftColumnX, yPos);
        yPos += 4;
      }
      
      if (companyDetails.phone) {
        doc.text(companyDetails.phone, leftColumnX, yPos);
        yPos += 4;
      }
      
      if (formattedCompanyAddress) {
        doc.text(formattedCompanyAddress, leftColumnX, yPos);
        yPos += 4;
      }
      
      // Banking details on the right
      const rightColumnX = pageWidth - margin - 60;
      let rightYPos = margin + 25; // Align with company details
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7); // Reduced from 9 to 7 to make banking details smaller
      doc.text('Banking Details:', rightColumnX, rightYPos);
      rightYPos += 4; // Reduced spacing
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6); // Reduced from 8 to 6 to make banking details smaller
      
      if (companyDetails.bankName) {
        doc.text(`Bank: ${companyDetails.bankName}`, rightColumnX, rightYPos);
        rightYPos += 3; // Reduced from 4 to 3
      }
      
      if (companyDetails.accountHolder) {
        doc.text(`Account Holder: ${companyDetails.accountHolder}`, rightColumnX, rightYPos);
        rightYPos += 3; // Reduced from 4 to 3
      }
      
      if (companyDetails.accountNumber || companyDetails.bankAccount) {
        doc.text(`Account Number: ${companyDetails.accountNumber || companyDetails.bankAccount}`, rightColumnX, rightYPos);
        rightYPos += 3; // Reduced from 4 to 3
      }
      
      if (companyDetails.accountType) {
        doc.text(`Account Type: ${companyDetails.accountType}`, rightColumnX, rightYPos);
        rightYPos += 3; // Reduced from 4 to 3
      }
      
      if (companyDetails.branchCode) {
        doc.text(`Branch Code: ${companyDetails.branchCode}`, rightColumnX, rightYPos);
        rightYPos += 3; // Reduced from 4 to 3
      }
      
      // Add spacing between banking details and Quote To
      rightYPos += 5;
      
      // Quote To section moved to right side under Banking Details
      const normalizedClient = normalizeClientData(clientData);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7); // Same size as Banking Details header
      doc.text('Quote To:', rightColumnX, rightYPos);
      rightYPos += 4;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6); // Same size as Banking Details content
      
      // Company name or client name
      const displayName = normalizedClient.companyName || normalizedClient.name || 'Unknown Client';
      doc.text(displayName, rightColumnX, rightYPos);
      rightYPos += 3;
      
      // Contact person (if different from company name)
      if (normalizedClient.contactPerson && normalizedClient.companyName && 
          normalizedClient.contactPerson !== normalizedClient.companyName) {
        doc.text(`Attn: ${normalizedClient.contactPerson}`, rightColumnX, rightYPos);
        rightYPos += 3;
      }
      
      // Email
      if (normalizedClient.email) {
        doc.text(normalizedClient.email, rightColumnX, rightYPos);
        rightYPos += 3;
      }
      
      // Phone
      if (normalizedClient.phone) {
        doc.text(normalizedClient.phone, rightColumnX, rightYPos);
        rightYPos += 3;
      }
      
      // Add a horizontal line to separate header from content
      yPos = Math.max(yPos, rightYPos) + 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;
      
      // Quotation title and number
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('QUOTATION', margin, yPos);
      yPos += 8;
      
      // Quotation details
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8); // Reduced font size for quotation details
      
      // Left column: Quotation details
      const detailsX = margin;
      let detailsY = yPos;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Quotation Number:', detailsX, detailsY);
      doc.setFont('helvetica', 'normal');
      doc.text(quotation.number, detailsX + 35, detailsY);
      detailsY += 5;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Quotation Date:', detailsX, detailsY);
      doc.setFont('helvetica', 'normal');
      doc.text(formatDate(quotation.date), detailsX + 35, detailsY);
      detailsY += 5;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Valid Until:', detailsX, detailsY);
      doc.setFont('helvetica', 'normal');
      doc.text(formatDate(quotation.validUntil), detailsX + 35, detailsY);
      detailsY += 5;
      
      if (quotation.reference) {
        doc.setFont('helvetica', 'bold');
        doc.text('Reference:', detailsX, detailsY);
        doc.setFont('helvetica', 'normal');
        doc.text(quotation.reference, detailsX + 35, detailsY);
        detailsY += 5;
      }
      
      // Address handling for the client in the right column
      const formattedAddress = formatAddress(normalizedClient);
      if (formattedAddress) {
        // Split address into multiple lines if needed
        const addressLines = doc.splitTextToSize(formattedAddress, 60); // Limit width for right column
        addressLines.forEach((line: string) => {
          doc.text(line, rightColumnX, rightYPos);
          rightYPos += 3;
        });
      }
      
      // Return the maximum Y position between details and right column sections
      yPos = Math.max(detailsY, rightYPos) + 10;
      
      // Only add page number if not the first page
      if (pageNum > 1) {
        drawPageNumber(doc, pageNum, totalPages);
      }
      
      return yPos;
    };
    
    // Start drawing the document
    let yPos = drawHeader(doc, 1);
    
    // Define table columns
    const tableHeaders = ['#', 'Description', 'Qty', 'Rate (R)', 'Discount (R)', 'Amount (R)'];
    const colWidths = [20, contentWidth - 130, 20, 30, 30, 30]; // Adjusted widths for better spacing
    
    // Calculate column positions
    const colPositions = [margin];
    for (let i = 1; i < colWidths.length; i++) {
      colPositions[i] = colPositions[i - 1] + colWidths[i - 1];
    }
    
    // Draw table header
    yPos = drawTableHeader(doc, yPos, margin, contentWidth, tableHeaders, colWidths, colPositions);
    
    // Draw table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    const items = quotation.items || [];
    const rowHeight = 8;
    let currentPage = 1;
    
    // Calculate subtotal, VAT, and total
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const vatRate = quotation.vatRate || 15; // Default to 15% if not specified
    const vatTotal = (subtotal * vatRate) / 100;
    const grandTotal = subtotal + vatTotal;
    
    // Draw each item row
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Check if we need to add a new page
      if (needsNewPage(yPos, rowHeight)) {
        currentPage++;
        yPos = addNewPage(doc, currentPage);
        yPos = drawTableHeader(doc, yPos, margin, contentWidth, tableHeaders, colWidths, colPositions);
      }
      
      // Item number
      doc.text((i + 1).toString(), colPositions[0] + 2, yPos + 4, { align: 'left' });
      
      // Description (with word wrap if needed)
      const descLines = doc.splitTextToSize(item.description || '', colWidths[1] - 4);
      const descHeight = descLines.length * 4;
      doc.text(descLines, colPositions[1] + 2, yPos + 4, { align: 'left' });
      
      // Quantity
      doc.text(item.quantity.toString(), colPositions[2] + colWidths[2] - 2, yPos + 4, { align: 'right' });
      
      // Rate
      doc.text(formatCurrency(item.rate || 0), colPositions[3] + colWidths[3] - 2, yPos + 4, { align: 'right' });
      
      // Discount
      doc.text(formatCurrency(item.discount || 0), colPositions[4] + colWidths[4] - 2, yPos + 4, { align: 'right' });
      
      // Amount
      doc.text(formatCurrency(item.amount || 0), colPositions[5] + colWidths[5] - 2, yPos + 4, { align: 'right' });
      
      // Draw horizontal line for row separation
      doc.setDrawColor(220, 220, 220);
      yPos += Math.max(descHeight, rowHeight);
      doc.line(margin, yPos, margin + contentWidth, yPos);
    }
    
    // Add totals section
    yPos += 5;
    
    // Check if we need to add a new page for totals
    if (needsNewPage(yPos, 30)) {
      currentPage++;
      yPos = addNewPage(doc, currentPage);
    }
    
    // Draw totals
    const totalsWidth = 70;
    const totalsX = pageWidth - margin - totalsWidth;
    
    // Subtotal
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Subtotal:', totalsX, yPos + 4);
    doc.text(formatCurrency(subtotal), pageWidth - margin - 2, yPos + 4, { align: 'right' });
    yPos += 6;
    
    // VAT
    doc.text(`VAT (${vatRate}%):`, totalsX, yPos + 4);
    doc.text(formatCurrency(vatTotal), pageWidth - margin - 2, yPos + 4, { align: 'right' });
    yPos += 6;
    
    // Draw line before total
    doc.setDrawColor(0, 0, 0);
    doc.line(totalsX, yPos, pageWidth - margin, yPos);
    yPos += 2;
    
    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Total (ZAR):', totalsX, yPos + 4);
    doc.text(formatCurrency(grandTotal), pageWidth - margin - 2, yPos + 4, { align: 'right' });
    yPos += 10;
    
    // Add notes and terms
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    
    // Check if we need a new page for notes and terms
    if (needsNewPage(yPos, 40)) {
      currentPage++;
      yPos = addNewPage(doc, currentPage);
    }
    
    // Notes
    if (quotation.notes) {
      doc.text('Notes:', margin, yPos + 4);
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      
      const notesLines = doc.splitTextToSize(quotation.notes, contentWidth);
      doc.text(notesLines, margin, yPos + 4);
      yPos += notesLines.length * 4 + 6;
    }
    
    // Terms and conditions
    if (quotation.terms) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Terms & Conditions:', margin, yPos + 4);
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      
      const termsLines = doc.splitTextToSize(quotation.terms, contentWidth);
      doc.text(termsLines, margin, yPos + 4);
      yPos += termsLines.length * 4 + 10;
    }
    
    // Company Stamp (Bottom Left)
    const stampY = pageHeight - 80; // Further adjusted position for even larger stamp
    if (companyAssets.Stamp?.dataUrl) {
      try {
        const stampWidth = 70;
        const stampHeight = 70;
        
        doc.addImage(companyAssets.Stamp.dataUrl, 'PNG', margin, stampY, stampWidth, stampHeight);
      } catch (error) {
        console.error('Error adding stamp:', error);
      }
    }
    
    // Signature (Bottom Right)
    if (companyAssets.Signature?.dataUrl) {
      try {
        const sigWidth = 45;
        const sigHeight = 18;
        
        const sigX = pageWidth - margin - sigWidth;
        
        doc.addImage(companyAssets.Signature.dataUrl, 'PNG', sigX, stampY + 25, sigWidth, sigHeight);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Authorized Signature', sigX + (sigWidth/2), stampY + sigHeight + 29, { align: 'center' });
        doc.text(companyDetails.name || '', sigX + (sigWidth/2), stampY + sigHeight + 33, { align: 'center' });
      } catch (error) {
        console.error('Error adding signature:', error);
      }
    }
    
    // Update total pages
    totalPages = currentPage;
    
    // Add page number to the last page
    drawPageNumber(doc, totalPages, totalPages);
    
    // Go back and update all page numbers with the correct total
    
    // Save the PDF
    doc.save(`Quotation-${quotation.number}.pdf`);
    
    // Show success toast
    toast.success('PDF generated successfully!');
    
    console.log('PDF generation completed successfully');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Quotation data that caused error:', JSON.stringify(quotation, null, 2));
    
    // Show error toast
    toast.error(`An error occurred while generating the PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // Re-throw the error so the calling function can handle it
    throw error;
  }
};
