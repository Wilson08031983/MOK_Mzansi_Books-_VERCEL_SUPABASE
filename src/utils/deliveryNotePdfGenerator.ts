/**
 * DELIVERY NOTE PDF GENERATOR
 * ============================================
 * This file contains functionality for generating delivery note PDFs.
 * Features:
 * - Professional A4 layout with proper company and client information
 * - Driver and receiver signature fields
 * - Delivery cost included in totals
 * - Comprehensive item listing
 * 
 * Last updated: July 11, 2025
 */

import { SalesItem } from '../types/sales';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '@/lib/utils';

// Define a type for accessing jsPDF internal APIs that aren't properly typed
type InternalPDFType = jsPDF & {
  internal: {
    pages: number[];
    pageSize: { width: number; height: number };
    getCurrentPageInfo?: () => {
      pageNumber: number;
      pageContext: Record<string, unknown>;
    };
  };
};

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
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  bankAccount?: string;
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
  // Website
  website?: string;
  // Not applicable flags
  vatNotApplicable?: boolean;
  regNumberNotApplicable?: boolean;
  taxNumberNotApplicable?: boolean;
}

interface CompanyAssets {
  Logo?: { dataUrl: string };
  Stamp?: { dataUrl: string };
  Signature?: { dataUrl: string };
}

interface DeliveryNoteData {
  customerName: string;
  customerSurname?: string;
  contactPerson?: string;
  phone?: string;
  location?: string;
  city?: string;
  postalCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  deliveryLocation?: string;
  deliveryCost: number;
  items: SalesItem[];
  subtotal: number;
  vatAmount: number;
  vatPercentage: number;
  total: number;
}

// Helper functions to get data from localStorage
function getCompanyDetails(): CompanyDetails {
  try {
    const companyData = localStorage.getItem('companyDetails');
    if (companyData) {
      const details = JSON.parse(companyData);
      return {
        name: details.name || 'MOK MZANSI BOOKS',
        email: details.email || 'admin@mokmzansibooks.com',
        phone: details.phone || '+27 11 123 4567',
        addressLine1: details.addressLine1 || '',
        addressLine2: details.addressLine2 || '',
        addressLine3: details.addressLine3 || '',
        addressLine4: details.addressLine4 || '',
        vatNumber: details.vatNumber || '',
        vatNotApplicable: details.vatNotApplicable || false,
        regNumber: details.regNumber || '',
        regNumberNotApplicable: details.regNumberNotApplicable || false,
        taxNumber: details.taxNumber || '',
        taxNumberNotApplicable: details.taxNumberNotApplicable || false,
        csdNumber: details.csdNumber || '',
        bankName: details.bankName || '',
        accountHolder: details.accountHolder || '',
        accountNumber: details.accountNumber || details.bankAccount || '',
        branchCode: details.branchCode || '',
        accountType: details.accountType || '',
        contactName: details.contactName || '',
        contactSurname: details.contactSurname || '',
        position: details.position || '',
        website: details.website || ''
      };
    }
  } catch (error) {
    console.error('Error parsing company details:', error);
  }
  
  return {
    name: 'MOK MZANSI BOOKS',
    email: 'admin@mokmzansibooks.com',
    phone: '+27 11 123 4567',
    addressLine1: '123 Business Street',
    addressLine2: 'Atteridgeville',
    addressLine3: 'Pretoria',
    addressLine4: 'Gauteng, 2000'
  };
}

function getCompanyAssets(): CompanyAssets {
  try {
    const assets = localStorage.getItem('companyAssets');
    if (assets) {
      return JSON.parse(assets);
    }
  } catch (error) {
    console.error('Error parsing company assets:', error);
  }
  return {};
}

function getClientData(clientId: string): Client | null {
  try {
    const clientsData = localStorage.getItem('clients');
    if (clientsData) {
      const clients = JSON.parse(clientsData);
      return clients.find((client: Client) => client.id === clientId) || null;
    }
  } catch (error) {
    console.error('Error parsing client data:', error);
  }
  return null;
}

// Format address from object, string, or client object
function formatAddress(address: string | Address | Client | undefined): string[] {
  if (!address) return [''];
  
  // If address is a string, return it as single line
  if (typeof address === 'string') {
    return [address];
  }
  
  // Handle client object with priority on billing address fields
  if ((address as Client).id) {
    const client = address as Client;
    
    // Priority 1: Use billing address from client service
    if (client.billingStreet || client.billingCity || client.billingState || client.billingPostal || client.billingCountry) {
      const lines = [];
      if (client.billingStreet) lines.push(client.billingStreet);
      
      let cityLine = '';
      if (client.billingCity) cityLine += client.billingCity;
      if (client.billingState) {
        if (cityLine) cityLine += ', ';
        cityLine += client.billingState;
      }
      if (client.billingPostal) {
        if (cityLine) cityLine += ' ';
        cityLine += client.billingPostal;
      }
      if (cityLine) lines.push(cityLine);
      
      if (client.billingCountry) lines.push(client.billingCountry);
      return lines;
    }
    
    // Priority 2: Use existing address fields
    if (client.billingAddress) {
      return formatAddress(client.billingAddress);
    }
    if (client.shippingAddress) {
      return formatAddress(client.shippingAddress);
    }
    if (client.address) {
      return formatAddress(client.address);
    }
    
    // Priority 3: Use individual address fields
    const lines = [];
    if (client.addressLine1) lines.push(client.addressLine1);
    if (client.addressLine2) lines.push(client.addressLine2);
    
    let cityLine = '';
    if (client.city) cityLine += client.city;
    if (client.province) {
      if (cityLine) cityLine += ', ';
      cityLine += client.province;
    }
    if (client.postalCode) {
      if (cityLine) cityLine += ' ';
      cityLine += client.postalCode;
    }
    if (cityLine) lines.push(cityLine);
    
    if (client.country) lines.push(client.country);
    
    return lines.length ? lines : ['No address provided'];
  }
  
  // Handle Address object
  const addressObj = address as Address;
  
  if (addressObj.formatted) {
    return [addressObj.formatted];
  }
  
  const lines = [];
  if (addressObj.line1) lines.push(addressObj.line1);
  if (addressObj.line2) lines.push(addressObj.line2);
  
  let cityLine = '';
  if (addressObj.city) cityLine += addressObj.city;
  if (addressObj.province) {
    if (cityLine) cityLine += ', ';
    cityLine += addressObj.province;
  }
  if (addressObj.postalCode) {
    if (cityLine) cityLine += ' ';
    cityLine += addressObj.postalCode;
  }
  if (cityLine) lines.push(cityLine);
  
  if (addressObj.country) lines.push(addressObj.country);
  
  return lines.length ? lines : [''];
}

// Normalize client data to handle various formats
function normalizeClientData(input: unknown): Client {
  if (!input) {
    return {
      id: '',
      name: 'Walk-in Customer'
    };
  }
  
  const client = input as Client;
  
  // Handle company name vs individual name
  let displayName = 'Walk-in Customer';
  if (client.companyName) {
    displayName = client.companyName;
  } else if (client.name) {
    displayName = client.name;
  } else if (client.firstName && client.lastName) {
    displayName = `${client.firstName} ${client.lastName}`;
  } else if (client.contactPerson) {
    displayName = client.contactPerson;
  }
  
  // Normalize contact information
  const email = client.clientEmail || client.email || '';
  const phone = client.clientPhone || client.phone || '';
  
  return {
    ...client,
    name: displayName,
    email,
    phone
  };
}

// Calculate totals
function calculateSubtotal(items: SalesItem[]): number {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function calculateVAT(subtotal: number, vatRate: number): number {
  return subtotal * (vatRate / 100);
}

function calculateTotal(subtotal: number, vatAmount: number, deliveryCost: number): number {
  return subtotal + vatAmount + deliveryCost;
}

// Main function to generate and download delivery note PDF
export async function generateDeliveryNotePdf(
  data: DeliveryNoteData,
  clientId?: string
): Promise<void> {
  try {
    const now = new Date();
    // Format date as DD/MM/YYYY
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    // Format time with AM/PM
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
    // Generate a random reference number for this delivery note
    const randomRef = `DN-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Get company details
    const companyDetails = getCompanyDetails();
    const companyAssets = getCompanyAssets();
    
    // Get client data if clientId is provided
    const clientData = clientId ? getClientData(clientId) : null;
    const client = normalizeClientData(clientData || {
      name: data.customerName + (data.customerSurname ? ' ' + data.customerSurname : ''),
      contactPerson: data.contactPerson,
      phone: data.phone
    });
    
    // Create a new PDF document (A4 format)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add font
    pdf.setFont('helvetica', 'normal');
    
    // Set initial cursor position
    let y = 20;
    const margin = 15;
    const pageWidth = 210; // A4 width in mm
    const contentWidth = pageWidth - 2 * margin;
    
    // Add company logo if available
    if (companyAssets.Logo?.dataUrl) {
      try {
        pdf.addImage(
          companyAssets.Logo.dataUrl,
          'PNG',
          margin,
          y,
          40,
          20
        );
        y += 22; // Adjust y position after logo
      } catch (error) {
        console.error('Error adding logo:', error);
        // Continue without logo
        pdf.setFontSize(24);
        pdf.setTextColor(0, 0, 0);
        pdf.text(companyDetails.name, margin, y);
        y += 10;
      }
    } else {
      // No logo, just add company name as title
      pdf.setFontSize(24);
      pdf.setTextColor(0, 0, 0);
      pdf.text(companyDetails.name, margin, y);
      y += 10;
    }
    
    // Add DELIVERY NOTE title on the right
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DELIVERY NOTE', pageWidth - margin - pdf.getTextWidth('DELIVERY NOTE'), y - 15);
    pdf.setFont('helvetica', 'normal');
    
    // Add company details on the left
    pdf.setFontSize(10);
    if (companyDetails.email) {
      pdf.text(companyDetails.email, margin, y);
      y += 5;
    }
    
    if (companyDetails.phone) {
      pdf.text(companyDetails.phone, margin, y);
      y += 5;
    }
    
    // Add company address
    const addressLines = [];
    if (companyDetails.addressLine1) addressLines.push(companyDetails.addressLine1);
    if (companyDetails.addressLine2) addressLines.push(companyDetails.addressLine2);
    if (companyDetails.addressLine3) addressLines.push(companyDetails.addressLine3);
    if (companyDetails.addressLine4) addressLines.push(companyDetails.addressLine4);
    
    addressLines.forEach(line => {
      if (line) {
        pdf.text(line, margin, y);
        y += 5;
      }
    });
    
    if (companyDetails.website) {
      pdf.text(companyDetails.website, margin, y);
      y += 5;
    }
    
    // We've moved the date/time/reference variables to the top of the function
    // This section is intentionally left blank as we'll reposition the customer details 
    // after drawing the page header
    
    // Delivery address
    let deliveryAddress: string[];
    if (data.location) {
      deliveryAddress = [data.location];
      if (data.city) {
        if (data.postalCode) {
          deliveryAddress.push(`${data.city}, ${data.postalCode}`);
        } else {
          deliveryAddress.push(data.city);
        }
      }
    } else if (clientData) {
      // Use client's address if location not provided
      deliveryAddress = formatAddress(clientData);
    } else if (data.addressLine1) {
      deliveryAddress = [];
      if (data.addressLine1) deliveryAddress.push(data.addressLine1);
      if (data.addressLine2) deliveryAddress.push(data.addressLine2);
      
      let cityLine = '';
      if (data.city) cityLine += data.city;
      if (data.postalCode) {
        if (cityLine) cityLine += ', ';
        cityLine += data.postalCode;
      }
      if (cityLine) deliveryAddress.push(cityLine);
    } else {
      deliveryAddress = ['No delivery address provided'];
    }
    
    // We've already added the client name and delivery address in the DELIVER TO section above
    // This section has been intentionally removed to prevent duplication
    
    // Items table
    const tableHeaders = [
      { header: 'Item', dataKey: 'name' },
      { header: 'Qty', dataKey: 'quantity' },
      { header: 'Price', dataKey: 'price' },
      { header: 'Total', dataKey: 'total' }
    ];
    
    const tableBody = data.items.map(item => ({
      name: item.name || item.title,
      quantity: item.quantity,
      price: formatCurrency(item.price),
      total: formatCurrency(item.price * item.quantity)
    }));
    
    // Function to draw page header (company info)
    const drawPageHeader = (pageNumber: number, totalPages: number) => {
      // Reset cursor position for the header
      let headerY = 20;
      
      // Add company logo if available
      if (companyAssets.Logo?.dataUrl) {
        try {
          pdf.addImage(
            companyAssets.Logo.dataUrl,
            'PNG',
            margin,
            headerY,
            40,
            20
          );
          headerY += 22; // Adjust y position after logo
        } catch (error) {
          console.error('Error adding logo:', error);
          // Continue without logo
          pdf.setFontSize(24);
          pdf.setTextColor(0, 0, 0);
          pdf.text(companyDetails.name, margin, headerY);
          headerY += 10;
        }
      } else {
        // No logo, just add company name as title
        pdf.setFontSize(24);
        pdf.setTextColor(0, 0, 0);
        pdf.text(companyDetails.name, margin, headerY);
        headerY += 10;
      }
      
      // Add DELIVERY NOTE title on the right
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DELIVERY NOTE', pageWidth - margin - pdf.getTextWidth('DELIVERY NOTE'), headerY - 15);
      pdf.setFont('helvetica', 'normal');
      
      // Only show these elements on the first page
      if (pageNumber === 1) {
        // Add date, time and reference info with significantly more spacing
        pdf.setFontSize(10);
        // Added even more space between DELIVERY NOTE title and date information
        pdf.text(`Date: ${dateFormatted}`, pageWidth - margin - 50, headerY + 5); // Adjusted for more spacing
        pdf.text(`Time: ${timeFormatted}`, pageWidth - margin - 50, headerY + 10); // Increased spacing
        pdf.text(`Ref: ${randomRef}`, pageWidth - margin - 50, headerY + 15); // Increased spacing
      }
      
      // Return the new Y position after header
      return headerY + 15;
    };
    
    // Function to draw page footer
    const drawPageFooter = (pageNumber: number, totalPages: number) => {
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Page ${pageNumber} of ${totalPages}`, 
        pageWidth / 2, 
        pdf.internal.pageSize.height - 10, 
        { align: 'center' }
      );
      
      // Add company info at the bottom of each page except last
      if (pageNumber !== totalPages) {
        pdf.setFontSize(8);
        pdf.text(companyDetails.name, margin, pdf.internal.pageSize.height - 15);
        pdf.text(companyDetails.phone || '', margin, pdf.internal.pageSize.height - 10);
      }
    };
    
    // First draw the page header
    let currentY = drawPageHeader(1, 1) + 15; // Added extra spacing to prevent overlap with company address
    
    // Add spacing between company info and DELIVER TO section (no horizontal line)
    currentY += 5; // Add spacing to maintain layout
    
    // Add DELIVER TO section on the first page only, right after the header
    // Add customer information section - title with increased visibility
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DELIVER TO:', margin, currentY);
    pdf.setFont('helvetica', 'normal');
    currentY += 10; // Increased spacing after title
    
    // Customer details
    pdf.setFontSize(10);
    pdf.text(client.name, margin, currentY);
    currentY += 5;
    
    if (client.contactPerson && client.contactPerson !== client.name) {
      pdf.text(`Attn: ${client.contactPerson}`, margin, currentY);
      currentY += 5;
    }
    
    if (client.phone) {
      pdf.text(`Tel: ${client.phone}`, margin, currentY);
      currentY += 5;
    }
    
    if (client.email) {
      pdf.text(`Email: ${client.email}`, margin, currentY);
      currentY += 5;
    }
    
    // Delivery address
    if (deliveryAddress && deliveryAddress.length > 0) {
      // Ensure we display each line with proper spacing
      deliveryAddress.forEach(line => {
        if (line && line.trim()) {
          pdf.text(line.trim(), margin, currentY);
          currentY += 5;
        }
      });
    }
    
    // Display delivery location if provided and not already in address
    if (data.deliveryLocation && 
        !deliveryAddress.some(line => line && line.includes(data.deliveryLocation))) {
      pdf.text(`Delivery Location: ${data.deliveryLocation}`, margin, currentY);
      currentY += 5;
    }
    
    // Add some extra space before the table
    currentY += 15;
    
    // Set table start position after the customer details
    const tableStartY = currentY;
    
    // Track total pages for pagination
    let totalPagesEstimate = 1;
    
    // Generate the items table with multi-page support
    autoTable(pdf, {
      startY: tableStartY,
      head: [['Item', 'Qty', 'Price (ZAR)', 'Total (ZAR)']],
      body: data.items.map(item => [
        item.name || item.title,
        item.quantity,
        formatCurrency(item.price).replace('R ', ''),
        formatCurrency(item.price * item.quantity).replace('R ', '')
      ]),
      margin: { left: margin, right: margin },
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [100, 100, 100], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' }
      },
      didDrawPage: (data) => {
        // When a new page is created
        // Access internal pages array to get total number of pages
        // Use a type assertion for internal jsPDF APIs since they're not fully typed
        // This avoids ESLint 'any' warnings while maintaining type safety as much as possible
        type InternalPDFType = jsPDF & {
          internal: {
            pages: number[];
            pageSize: { width: number; height: number };
          };
        };
        
        totalPagesEstimate = (pdf as InternalPDFType).internal.pages.length - 1; // -1 because jsPDF counts from 1
        
        // Add header with company info
        if (data.pageNumber > 1) { // Only redraw header on pages after first
          drawPageHeader(data.pageNumber, totalPagesEstimate);
        }
        
        // Add footer with page number
        drawPageFooter(data.pageNumber, totalPagesEstimate);
      }
    });
    
    // Update y position after the table
    // @ts-expect-error - jspdf-autotable adds this property
    y = pdf.lastAutoTable.finalY + 10;
    
    // If we're not on the last page or y position is too close to bottom of page,
    // add a new page for totals and signature section
    const remainingSpace = pdf.internal.pageSize.height - y - margin;
    if (remainingSpace < 120) { // Need about 120mm for totals and signatures
      pdf.addPage();
      // Using our custom type for jsPDF internal APIs
      const newPageNumber = (pdf as InternalPDFType).internal.pages.length - 1;
      totalPagesEstimate = newPageNumber;
      
      // Draw header on the new page
      drawPageHeader(newPageNumber, totalPagesEstimate);
      
      // Draw footer on the new page
      drawPageFooter(newPageNumber, totalPagesEstimate);
      
      // Reset y position for totals section
      y = tableStartY;
    }
    
    // Add totals section
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    
    const totalsX = pageWidth - margin - 80;
    const totalsValueX = pageWidth - margin - 15;
    
    pdf.text('Subtotal:', totalsX, y);
    pdf.text(formatCurrency(data.subtotal), totalsValueX, y, { align: 'right' });
    y += 6;
    
    if (data.vatAmount > 0) {
      pdf.text(`VAT (${data.vatPercentage}%):`, totalsX, y);
      pdf.text(formatCurrency(data.vatAmount), totalsValueX, y, { align: 'right' });
      y += 6;
    }
    
    pdf.text('Delivery Cost:', totalsX, y);
    pdf.text(formatCurrency(data.deliveryCost), totalsValueX, y, { align: 'right' });
    y += 6;
    
    // Total
    pdf.setDrawColor(100, 100, 100);
    pdf.line(totalsX - 10, y - 2, totalsValueX + 5, y - 2);
    y += 3;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('GRAND TOTAL:', totalsX, y);
    pdf.text(formatCurrency(data.total + data.deliveryCost), totalsValueX, y, { align: 'right' });
    pdf.setFont('helvetica', 'normal');
    
    y += 15; // Space before signature section
    
    // Add signature section with proper alignment
    pdf.setDrawColor(100, 100, 100);
    
    // Store the starting Y position for the signature section
    const signatureSectionY = y;
    
    // Calculate column positions for better alignment
    const leftColX = margin;
    const rightColX = pageWidth / 2 + 5;
    const lineLength = 60;
    
    // Left side - Driver's details
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text("DRIVER'S DETAILS", leftColX, signatureSectionY);
    pdf.setFont('helvetica', 'normal');
    
    // Right side - Receiver's details header
    pdf.setFont('helvetica', 'bold');
    pdf.text("RECEIVER'S DETAILS", rightColX, signatureSectionY);
    pdf.setFont('helvetica', 'normal');
    
    // Driver details fields
    let fieldY = signatureSectionY + 8;
    
    // Name fields
    pdf.text("Name:", leftColX, fieldY);
    pdf.line(leftColX + 25, fieldY, leftColX + 25 + lineLength, fieldY);
    
    pdf.text("Name:", rightColX, fieldY);
    pdf.line(rightColX + 25, fieldY, rightColX + 25 + lineLength, fieldY);
    fieldY += 10;
    
    // Signature fields
    pdf.text("Signature:", leftColX, fieldY);
    pdf.line(leftColX + 25, fieldY, leftColX + 25 + lineLength, fieldY);
    
    pdf.text("Signature:", rightColX, fieldY);
    pdf.line(rightColX + 25, fieldY, rightColX + 25 + lineLength, fieldY);
    fieldY += 10;
    
    // Date & Time fields
    pdf.text("Date & Time:", leftColX, fieldY);
    pdf.line(leftColX + 25, fieldY, leftColX + 25 + lineLength, fieldY);
    
    pdf.text("Date & Time:", rightColX, fieldY);
    pdf.line(rightColX + 25, fieldY, rightColX + 25 + lineLength, fieldY);
    fieldY += 10;
    
    // Space for the footer section
    y = fieldY + 5;
    
    // Update the final page count and redraw all footers to ensure accurate page numbers
    // Using our custom type for jsPDF internal APIs
    totalPagesEstimate = (pdf as InternalPDFType).internal.pages.length - 1;
    
    // Draw footer on the last page
    drawPageFooter(totalPagesEstimate, totalPagesEstimate);
    
    y += 20; // Space before notes
    
    // Add notes section
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8);
    pdf.text('This delivery note confirms receipt of goods in good condition.', margin, y);
    
    // Footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Page ${i} of ${pageCount}`, 
        pageWidth / 2, 
        297 - 10, 
        { align: 'center' }
      );
      
      // Add company name to footer
      pdf.text(
        companyDetails.name,
        pageWidth - margin,
        297 - 10,
        { align: 'right' }
      );
    }
    
    // Generate a filename
    const fileName = `DeliveryNote_${dateFormatted.replace(/\//g, '-')}_${client.name.replace(/\s+/g, '_')}.pdf`;
    
    // Save the PDF and trigger download
    pdf.save(fileName);
    
    // Show success toast
    toast.success("Delivery Note Generated", {
      description: "The PDF has been downloaded successfully."
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating delivery note PDF:', error);
    
    toast.error("Error Generating PDF", {
      description: (error as Error).message || "An error occurred while generating the delivery note PDF."
    });
    
    return Promise.reject(error);
  }
}
