import { Invoice, InvoiceItem } from '@/types/invoice';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { formatCurrency, formatDate } from '@/utils/formatters';

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
  name: string;
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
  
  // Additional client details
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string | Address;
}

interface CompanyDetails {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  vatNumber?: string;
  vatNumberNotApplicable?: boolean;
  regNumber?: string;
  taxNumber?: string;
  csdNumber?: string;
  csdNumberNotApplicable?: boolean;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  bankAccount?: string; // Added to match the form field name
  branchCode?: string;
  accountType?: string;
  // Address fields
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  // Contact person fields
  contactName?: string;
  contactSurname?: string;
  position?: string;
  website?: string;
  websiteNotApplicable?: boolean;
}

interface CompanyAssets {
  Logo?: { dataUrl: string };
  Stamp?: { dataUrl: string };
  Signature?: { dataUrl: string };
}

// Helper functions to get data from localStorage
const getCompanyDetails = (): CompanyDetails => {
  const defaultDetails: CompanyDetails = {
    name: 'Your Company Name',
    email: '',
    phone: '',
    address: '',
    vatNumber: '',
    regNumber: '',
    bankName: '',
    accountNumber: '',
    branchCode: '',
    accountType: ''
  };

  try {
    const stored = localStorage.getItem('companyDetails');
    if (!stored) return defaultDetails;
    
    const parsed = JSON.parse(stored);
    
    // Format the address from all address lines
    let formattedAddress = '';
    if (parsed.addressLine1) formattedAddress += parsed.addressLine1 + '\n';
    if (parsed.addressLine2) formattedAddress += parsed.addressLine2 + '\n';
    if (parsed.addressLine3) formattedAddress += parsed.addressLine3 + '\n';
    if (parsed.addressLine4) formattedAddress += parsed.addressLine4;
    
    // Remove trailing newline if present
    formattedAddress = formattedAddress.trim();
    
    // Create a complete company details object
    const completeDetails = { 
      ...defaultDetails, 
      ...parsed,
      address: formattedAddress || parsed.address || ''
    };
    
    return completeDetails;
  } catch (error) {
    console.error('Error getting company details:', error);
    return defaultDetails;
  }
};

const getCompanyAssets = (): CompanyAssets => {
  try {
    const stored = localStorage.getItem('companyAssets');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error getting company assets:', error);
    return {};
  }
};

const getClientData = (clientId: string): Client | null => {
  try {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    return clients.find((client: Client) => client.id === clientId) || null;
  } catch (error) {
    console.error('Error getting client data:', error);
    return null;
  }
};

// Format address from object, string, or client object
const formatAddress = (address: string | Address | Client | undefined): string[] => {
  if (!address) return [];
  
  if (typeof address === 'string') {
    return address.split('\n').filter(line => line.trim() !== '');
  }
  
  // Check if it's a client object (has client-specific fields)
  if ('billingStreet' in address || 'addressLine1' in address || 'billingAddress' in address || 'shippingAddress' in address) {
    const client = address as Client;
    const lines: string[] = [];
    
    // Priority 1: Use billing address from client service structure
    if (client.billingStreet || client.billingCity || client.billingState || client.billingPostal || client.billingCountry) {
      if (client.billingStreet) lines.push(client.billingStreet);
      
      const cityLine = [client.billingCity, client.billingState, client.billingPostal].filter(Boolean).join(', ');
      if (cityLine) lines.push(cityLine);
      if (client.billingCountry) lines.push(client.billingCountry);
      
      return lines.length > 0 ? lines : ['No address provided'];
    }
    
    // Priority 2: Try to get address from various client fields
    const primaryAddress = client.billingAddress || client.shippingAddress || client.address;
    if (primaryAddress && typeof primaryAddress !== 'string') {
      const formatted = formatAddress(primaryAddress);
      if (formatted.length > 0) return formatted;
    } else if (typeof primaryAddress === 'string' && primaryAddress.trim()) {
      return primaryAddress.split('\n').filter(line => line.trim() !== '');
    }
    
    // Priority 3: Fallback to individual address fields
    if (client.addressLine1) lines.push(client.addressLine1);
    if (client.addressLine2) lines.push(client.addressLine2);
    
    const cityLine = [client.city, client.province, client.postalCode].filter(Boolean).join(', ');
    if (cityLine) lines.push(cityLine);
    if (client.country) lines.push(client.country);
    
    return lines.length > 0 ? lines : ['No address provided'];
  }
  
  // Handle Address object
  const addr = address as Address;
  const lines: string[] = [];
  
  if (addr.line1) lines.push(addr.line1);
  if (addr.line2) lines.push(addr.line2);
  
  const cityLine = [
    addr.city,
    addr.province,
    addr.postalCode
  ].filter(Boolean).join(', ');
  
  if (cityLine) lines.push(cityLine);
  if (addr.country) lines.push(addr.country);
  
  return lines.length > 0 ? lines : ['No address provided'];
}

// Normalize client data to handle various formats
const normalizeClientData = (input: unknown): Client => {
  // Handle null/undefined input
  if (!input) {
    return {
      id: 'unknown',
      name: 'Unknown Client',
      email: '',
      phone: ''
    };
  }

  // Handle string input (assuming it's just the client name)
  if (typeof input === 'string') {
    return {
      id: 'unknown',
      name: input,
      email: '',
      phone: ''
    };
  }

  // Handle object input
  if (typeof input === 'object' && input !== null) {
    const client = input as Record<string, unknown>;
    
    // Helper function to safely get properties
    const getString = (key: string): string => 
      (client[key] && typeof client[key] === 'string' ? client[key] : '') as string;

    // Determine the best address to use (prefer billing address if available)
    const address = client.billingAddress || 
                   client.shippingAddress || 
                   client.address ||
                   client.clientAddress ||
                   '';

    // Determine the best name to use - prioritize company name, then contact person, then other fields
    const name = getString('companyName') || 
                getString('contactPerson') ||
                getString('name') || 
                getString('clientName') || 
                [getString('firstName'), getString('lastName')].filter(Boolean).join(' ').trim() ||
                'Unknown Client';

    // Create normalized client object
    return {
      id: getString('id') || 'unknown',
      name,
      email: getString('email') || getString('clientEmail') || '',
      phone: getString('phone') || getString('clientPhone') || '',
      address: address as string | Address | undefined,
      // Spread any additional properties
      ...(typeof input === 'object' ? input : {})
    } as Client;
  }

  // Fallback for any other input type
  return {
    id: 'unknown',
    name: 'Unknown Client',
    email: '',
    phone: ''
  };
};

// Calculate totals
const calculateSubtotal = (items: InvoiceItem[]): number => {
  return items.reduce((sum, item) => sum + (item.amount || 0), 0);
};

const calculateVAT = (subtotal: number, vatRate: number): number => {
  return (subtotal * vatRate) / 100;
};

const calculateTotal = (subtotal: number, vatAmount: number): number => {
  return subtotal + vatAmount;
};

export const generateInvoicePdf = async (invoice: Invoice): Promise<void> => {
  // Helper function to check if a field has valid content
  const hasValidContent = (value: string | undefined): boolean => {
    return !!value && typeof value === 'string' && value.trim() !== '';
  };

  // Initialize variables at function scope
  let toastId: string | number;
  
  try {
    // Show loading toast
    toastId = toast.loading('Generating PDF...');
    
    console.log('Starting PDF generation for invoice:', invoice.number);
    
    // Validate required fields
    if (!invoice.items || invoice.items.length === 0) {
      throw new Error('Invoice must have at least one item');
    }
    
    if (!invoice.number) {
      throw new Error('Invoice number is required');
    }
    
    // Get company details and assets
    const companyDetails = getCompanyDetails();
    const companyAssets = getCompanyAssets();
    
    console.log('Company details loaded:', companyDetails);
    console.log('Company assets loaded:', Object.keys(companyAssets));
    
    // Get client data
    let client = normalizeClientData(invoice.client);
    if (typeof invoice.client === 'string') {
      const clientData = getClientData(invoice.client);
      if (clientData) {
        client = normalizeClientData(clientData);
      }
    }
    
    console.log('Client data:', client);
    
    // Initialize PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Page dimensions and layout
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15; // Reduced margin from 20 to 15 to give more space for table
    const contentWidth = pageWidth - (margin * 2);
    const leftColumnX = margin;
    const rightColumnX = pageWidth - margin - 40; // Move banking details even further to the right
    let yPos = 5; // Reduced to 5mm to move everything higher
    
    // Set default font
    doc.setFont('helvetica');
    doc.setFontSize(10);
    
    // 1. HEADER SECTION - Company Logo (Centered)
    if (companyAssets.Logo?.dataUrl) {
      try {
        // Set logo dimensions to exactly 50x50mm as requested
        const logoWidth = 50;
        const logoHeight = 50;
        
        // Center the logo horizontally
        const logoX = (pageWidth - logoWidth) / 2;
        
        // Add the image with requested dimensions
        doc.addImage(companyAssets.Logo.dataUrl, 'PNG', logoX, yPos, logoWidth, logoHeight);
        yPos += logoHeight + 5; // Reduced spacing from 15 to 5
      } catch (error) {
        console.error('Error adding logo:', error);
        yPos += 5; // Reduced spacing
      }
    } else {
      yPos += 5; // Reduced spacing
    }
    
    // 2. COMPANY INFO (Left side) and BANKING DETAILS (Right column)
    const startY = yPos;
    
    // Company Information - Left side beneath logo
    doc.setFontSize(11); // Reduced from 14 to 11
    doc.setFont('helvetica', 'bold');
    doc.text('Company Details', leftColumnX, yPos);
    yPos += 4; // Reduced from 5 to 4
    
    // Company details
    doc.setFontSize(8); // Reduced from 9 to 8
    doc.setFont('helvetica', 'normal');
    doc.text(companyDetails.name || '', leftColumnX, yPos);
    yPos += 3.5; // Reduced from 4 to 3.5
    if (hasValidContent(companyDetails.email)) {
      doc.text(companyDetails.email, leftColumnX, yPos);
      yPos += 3.5; // Reduced from 4 to 3.5
    }
    if (hasValidContent(companyDetails.phone)) {
      doc.text(companyDetails.phone, leftColumnX, yPos);
      yPos += 3.5; // Reduced from 4 to 3.5
    }
    
    // Handle multi-line address
    if (hasValidContent(companyDetails.address)) {
      const addressLines = companyDetails.address.split('\n');
      addressLines.forEach(line => {
        if (line.trim()) {
          doc.text(line.trim(), leftColumnX, yPos);
          yPos += 3.5; // Reduced from 4 to 3.5
        }
      });
    }
    
    // Reduced space before invoice info
    yPos += 4; // Reduced from 5 to 4
    
    // Adjust yPos to continue with invoice information
    yPos += 3;
    
    // 3. INVOICE INFORMATION AND BILL TO SECTION
    const invoiceInfoY = yPos; // Store the starting Y position for invoice info
    
    // Invoice information on the left side
    doc.setFontSize(10); // Reduced from 11 to 10
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice Number: ${invoice.number}`, leftColumnX, yPos);
    
    // Bill To section in the middle of the page, inline with Invoice Number
    const middleColumnX = pageWidth / 2 - 15; // Position in the middle of the page
    doc.text('Bill To:', middleColumnX, yPos);
    
    // Continue with invoice information on the left
    yPos += 4; // Reduced from 5 to 4
    doc.setFontSize(8); // Reduced from 9 to 8
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice Date: ${formatDate(invoice.date)}`, leftColumnX, yPos);
    yPos += 3.5; // Reduced from 5 to 3.5
    
    if (invoice.dueDate) {
      doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, leftColumnX, yPos);
      yPos += 3.5; // Reduced from 5 to 3.5
    }
    
    // Banking details section
    
    // Check if any banking details are available
    const hasBankingDetails = (
      hasValidContent(companyDetails.bankName) ||
      hasValidContent(companyDetails.accountHolder) ||
      hasValidContent(companyDetails.accountNumber) ||
      hasValidContent(companyDetails.bankAccount) ||
      hasValidContent(companyDetails.branchCode) ||
      hasValidContent(companyDetails.accountType)
    );
    
    // Banking Details header - only if we have data
    if (hasBankingDetails) {
      doc.setFontSize(10); // Keep at 10 for the header
      doc.setFont('helvetica', 'bold'); // Make Banking Details bold
      doc.text('Banking Details:', rightColumnX, invoiceInfoY); // Align with Invoice Number and Bill To
      doc.setFont('helvetica', 'normal'); // Reset font back to normal
    }
    
    // Start client details in the middle column below 'Bill To:'
    let clientY = invoiceInfoY + 4; // Reduced from 5 to 4
    let bankingY = invoiceInfoY + 4; // Reduced from 5 to 4
    
    doc.setFontSize(8); // Reduced from 9 to 8
    doc.setFont('helvetica', 'normal');
    
    // Client name - prioritize company name, then contact person
    const displayName = client.companyName || client.contactPerson || client.name || 'Unknown Client';
    doc.text(displayName, middleColumnX, clientY); // Use middleColumnX for client details
    clientY += 3.5; // Reduced from 4 to 3.5
    
    // Contact person if different from company name
    if (client.companyName && client.contactPerson && client.companyName !== client.contactPerson) {
      doc.text(`Attn: ${client.contactPerson}`, middleColumnX, clientY);
      clientY += 3.5; // Reduced from 4 to 3.5
    }
    
    // Email if available
    if (client.email) {
      doc.text(client.email, middleColumnX, clientY);
      clientY += 3.5; // Reduced from 4 to 3.5
    }
    
    // Phone if available
    if (client.phone) {
      doc.text(client.phone, middleColumnX, clientY);
      clientY += 3.5; // Reduced from 4 to 3.5
    }
    
    // Format and display address
    const addressLines = formatAddress(client);
    addressLines.forEach(line => {
      if (line && line.trim() !== '') {
        doc.text(line.trim(), middleColumnX, clientY);
        clientY += 3.5; // Reduced from 4 to 3.5
      }
    });
    
    // Banking Details in right column - only display if we have banking details
    if (hasBankingDetails) {
      // Set smaller font size for banking details
      doc.setFontSize(7); // Reduced from 8 to 7
      
      // Bank Name
      if (hasValidContent(companyDetails.bankName)) {
        doc.text(`Bank Name: ${companyDetails.bankName}`, rightColumnX, bankingY);
        bankingY += 3; // Reduced from 3.5 to 3
      }
      
      // Account Holder
      if (hasValidContent(companyDetails.accountHolder)) {
        doc.text(`Account Holder: ${companyDetails.accountHolder}`, rightColumnX, bankingY);
        bankingY += 3; // Reduced from 3.5 to 3
      }
      
      // Account Number - check both accountNumber and bankAccount fields
      const accountNumber = companyDetails.accountNumber?.trim() || companyDetails.bankAccount?.trim();
      if (accountNumber) {
        doc.text(`Account Number: ${accountNumber}`, rightColumnX, bankingY);
        bankingY += 3; // Reduced from 3.5 to 3
      }
      
      // Branch Code
      if (hasValidContent(companyDetails.branchCode)) {
        doc.text(`Branch Code: ${companyDetails.branchCode}`, rightColumnX, bankingY);
        bankingY += 3; // Reduced from 3.5 to 3
      }
      
      // Account Type
      if (hasValidContent(companyDetails.accountType)) {
        doc.text(`Account Type: ${companyDetails.accountType}`, rightColumnX, bankingY);
        bankingY += 3; // Reduced from 3.5 to 3
      }
      
      // Reset font size back to normal
      doc.setFontSize(8);
    }
    
    // Adjust yPos to the maximum of both columns
    yPos = Math.max(clientY, bankingY) + 3; // Reduced from 5 to 3
    
    // 5. ITEMS TABLE
    doc.setFontSize(10); // Reduced from 12 to 10
    doc.setFont('helvetica', 'bold');
    doc.text('Items', leftColumnX, yPos);
    yPos += 6; // Reduced from 8 to 6
    
    // Table setup
    const tableHeaders = ['#', 'Description', 'Qty', 'Rate (R)', 'Discount (R)', 'Amount (R)'];
    // Adjusted column widths to ensure Amount column is visible
    const colWidths = [10, 65, 15, 25, 25, 55];
    const colPositions = [margin];
    
    // Calculate column positions
    for (let i = 1; i < colWidths.length; i++) {
      colPositions.push(colPositions[i - 1] + colWidths[i - 1]);
    }
    
    const tableStartY = yPos;
    
    // Draw table header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 2.5, contentWidth, 8, 'F'); // Reduced height from 10 to 8
    doc.setDrawColor(0, 0, 0);
    doc.rect(margin, yPos - 2.5, contentWidth, 8); // Reduced height from 10 to 8
    
    doc.setFontSize(9); // Reduced from 10 to 9
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    tableHeaders.forEach((header, index) => {
      const x = colPositions[index] + 2;
      const maxWidth = colWidths[index] - 4;
      
      if (index === 0) { // Item number column - center align
        doc.text(header, x + maxWidth/2, yPos + 2, { align: 'center' });
      } else if (index === 1) { // Description column - left align
        doc.text(header, x, yPos + 2);
      } else if (index === 5) { // Amount column - special handling for last column
        // Position the Amount header with more space from the right edge
        doc.text(header, x + maxWidth - 10, yPos + 2, { align: 'right' });
      } else { // Other number columns - right align
        doc.text(header, x + maxWidth, yPos + 2, { align: 'right' });
      }
    });
    
    yPos += 8; // Reduced from 10 to 8
    
    // Draw table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8); // Reduced font size for table content
    invoice.items.forEach((item, index) => {
      const rowData = [
        (index + 1).toString(),
        item.description || '',
        item.quantity?.toString() || '0',
        formatCurrency(item.rate || 0, 'ZAR').replace('ZAR ', ''),
        formatCurrency(item.discount || 0, 'ZAR').replace('ZAR ', ''),
        formatCurrency(item.amount || 0, 'ZAR').replace('ZAR ', '')
      ];
      
      // Draw row border
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, yPos - 2.5, contentWidth, 7); // Reduced height from 8 to 7
      
      // Draw row data
      rowData.forEach((data, colIndex) => {
        const x = colPositions[colIndex] + 2;
        const maxWidth = colWidths[colIndex] - 4;
        
        if (colIndex === 0) { // Item number - center align
          doc.text(data, x + maxWidth/2, yPos + 1.5, { align: 'center' });
        } else if (colIndex === 1) { // Description - left align
          doc.text(data, x, yPos + 1.5);
        } else if (colIndex === 5) { // Amount column - special handling for last column
          // Position the Amount values with more space from the right edge
          doc.text(data, x + maxWidth - 10, yPos + 1.5, { align: 'right' });
        } else { // Other numbers - right align
          doc.text(data, x + maxWidth, yPos + 1.5, { align: 'right' });
        }
      });
      
      yPos += 7; // Reduced from 8 to 7
    });
    
    // Draw final table border
    doc.setDrawColor(0, 0, 0);
    doc.rect(margin, tableStartY - 2.5, contentWidth, yPos - tableStartY + 2.5); // Adjusted to match new spacing
    
    // Draw column separators
    let xPos = margin;
    for (let i = 0; i < colWidths.length - 1; i++) {
      xPos += colWidths[i];
      doc.line(xPos, tableStartY - 2.5, xPos, yPos); // Adjusted to match new spacing
    }
    
    yPos += 10; // Reduced from 15 to 10
    
    // 6. TOTALS SECTION (Right aligned)
    const totalsX = pageWidth - margin - 80;
    const valuesX = pageWidth - margin - 5;
    
    const subtotal = calculateSubtotal(invoice.items);
    const vatRate = invoice.vatRate || 15;
    const vatAmount = calculateVAT(subtotal, vatRate);
    const total = calculateTotal(subtotal, vatAmount);
    
    doc.setFontSize(9); // Reduced from 10 to 9
    doc.setFont('helvetica', 'normal');
    
    doc.text('Subtotal:', totalsX, yPos);
    doc.text(formatCurrency(subtotal, 'ZAR'), valuesX, yPos, { align: 'right' });
    yPos += 6; // Reduced from 7 to 6
    
    doc.text(`VAT (${vatRate}%):`, totalsX, yPos);
    doc.text(formatCurrency(vatAmount, 'ZAR'), valuesX, yPos, { align: 'right' });
    yPos += 6; // Reduced from 7 to 6
    
    doc.setFontSize(10); // Reduced from 12 to 10
    doc.setFont('helvetica', 'bold');
    doc.text('Total (ZAR):', totalsX, yPos);
    doc.text(formatCurrency(total, 'ZAR'), valuesX, yPos, { align: 'right' });
    
    yPos += 15; // Reduced from 20 to 15
    
    // 7. FOOTER SECTION
    const footerStartY = Math.max(yPos, pageHeight - 70); // Reduced from 80 to 70
    
    // Notes section
    if (invoice.notes) {
      doc.setFontSize(10); // Reduced from 11 to 10
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', leftColumnX, footerStartY);
      
      doc.setFontSize(8); // Reduced from 9 to 8
      doc.setFont('helvetica', 'normal');
      const noteLines = invoice.notes.split('\n');
      let noteY = footerStartY + 5; // Reduced from 7 to 5
      noteLines.forEach(line => {
        doc.text(line.trim(), leftColumnX, noteY);
        noteY += 4; // Reduced from 5 to 4
      });
    }
    
    // Terms & Conditions
    const termsY = footerStartY + (invoice.notes ? 20 : 0); // Reduced from 25 to 20
    doc.setFontSize(9); // Reduced from 11 to 9
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', leftColumnX, termsY);
    
    doc.setFontSize(8); // Reduced from 10 to 8
    doc.setFont('helvetica', 'normal');
    const terms = invoice.terms || 'Payment due within 30 days of invoice date.';
    doc.text(terms, leftColumnX, termsY + 5); // Reduced from 7 to 5
    
    // Company Stamp (Bottom Left)
    const stampY = pageHeight - 40; // Moved up from -50 to -40
    if (companyAssets.Stamp?.dataUrl) {
      try {
        // Based on the image shared, the stamp appears to be a circular logo
        // Use equal width and height for a circular stamp
        const stampWidth = 30; // Increased from 25 to 30
        const stampHeight = 30; // Increased from 25 to 30
        
        // Add the stamp with proper dimensions
        doc.addImage(companyAssets.Stamp.dataUrl, 'PNG', leftColumnX, stampY, stampWidth, stampHeight);
      } catch (error) {
        console.error('Error adding stamp:', error);
      }
    }
    
    // Signature (Bottom Right)
    if (companyAssets.Signature?.dataUrl) {
      try {
        // Set dimensions with a proper aspect ratio for signatures (typically wider than tall)
        const sigWidth = 45; // Reduced from 50 to 45
        const sigHeight = 18; // Reduced from 20 to 18
        
        // Position signature on the right
        const sigX = pageWidth - margin - sigWidth;
        
        // Add the signature with proper dimensions
        doc.addImage(companyAssets.Signature.dataUrl, 'PNG', sigX, stampY, sigWidth, sigHeight);
        
        // Add signature text below
        doc.setFontSize(8); // Reduced from 9 to 8
        doc.setFont('helvetica', 'normal');
        doc.text('Authorized Signature', sigX + (sigWidth/2), stampY + sigHeight + 4, { align: 'center' }); // Reduced spacing from 5 to 4
        doc.text(companyDetails.name || '', sigX + (sigWidth/2), stampY + sigHeight + 8, { align: 'center' }); // Reduced spacing from 10 to 8
      } catch (error) {
        console.error('Error adding signature:', error);
      }
    }
    
    // Page number
    doc.setFontSize(7); // Reduced from 9 to 7
    doc.setFont('helvetica', 'normal');
    doc.text('Page 1 of 1', pageWidth - margin, pageHeight - 8, { align: 'right' }); // Moved up from -10 to -8
    
    // Save the PDF
    doc.save(`Invoice-${invoice.number}.pdf`);
    
    // Dismiss loading toast and show success
    toast.dismiss(toastId);
    toast.success('PDF generated successfully!');
    
    console.log('PDF generation completed successfully');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Invoice data that caused error:', JSON.stringify(invoice, null, 2));
    
    // Dismiss the loading toast and show error
    toast.dismiss(toastId);
    toast.error(`An error occurred while generating the PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // Re-throw the error so the calling function can handle it
    throw error;
  }
};
