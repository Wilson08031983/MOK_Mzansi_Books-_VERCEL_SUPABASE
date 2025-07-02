import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';

// Add global print styles to the component
const PrintStyles = () => (
  <style>{`
    @media print {
      @page {
        size: 210mm 297mm;
        margin: 15mm;
      }
      html, body {
        width: 210mm;
        height: 297mm;
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
        font-size: 11px;
        line-height: 1.2;
        background-color: white !important;
      }
      .no-print {
        display: none !important;
      }
      .print-content {
        width: 210mm;
      }
      .page {
        page-break-after: always;
        margin: 0 !important;
        box-shadow: none !important;
        width: 210mm;
        min-height: 297mm;
        padding: 20mm !important;
        box-sizing: border-box !important;
      }
      .page:last-child {
        page-break-after: auto;
      }
      img {
        max-width: 100%;
        height: auto;
      }
      .invoice-preview-logo {
        max-width: 150px !important;
        height: auto !important;
        display: block !important;
        margin: 0 auto 1rem auto !important;
        text-align: center !important;
      }
      .flex.justify-center {
        display: flex !important;
        justify-content: center !important;
        width: 100% !important;
        text-align: center !important;
      }
      .invoice-section {
        padding: 6px 10px !important;
      }
      .invoice-table {
        font-size: 10px !important;
        width: 100% !important;
        table-layout: fixed !important;
      }
      .invoice-table th, .invoice-table td {
        padding: 2px 4px !important;
        line-height: 1.1 !important;
      }
      .invoice-details {
        margin-bottom: 0.5rem !important;
      }
      .invoice-header {
        margin-bottom: 0.75rem !important;
      }
      p {
        margin-top: 0.25rem !important;
        margin-bottom: 0.25rem !important;
      }
    }
  `}</style>
);

interface LineItem {
  id: string;
  itemNo: number;
  description: string;
  quantity: number;
  rate: number;
  markupPercent: number;
  discount: number;
  amount: number;
}

interface Client {
  id: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  shippingAddress?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostal?: string;
  shippingCountry?: string;
  sameAsBilling?: boolean;
}

interface Company {
  name: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  vatNumber?: string;
  regNumber?: string;
  website?: string;
  bankName?: string;
  bankAccount?: string;
  accountNumber?: string; // Added to match Company.tsx field
  accountType?: string;
  branchCode?: string;
  accountHolder?: string;
  logoUrl?: string;
  stampUrl?: string;
  signatureUrl?: string;
}

interface InvoicePreviewData {
  number: string;
  date: string;
  dueDate: string;
  reference?: string;
  clientId?: string;
  clientInfo?: Client;
  items: LineItem[];
  subtotal: number;
  vatRate: number;
  vatTotal: number;
  grandTotal: number;
  terms: string;
  notes: string;
  currency: string;
  status: string;
  companyDetails: Company;
}

interface InvoicePreviewModalProps {
  open: boolean;
  onClose: () => void;
  data: InvoicePreviewData;
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({ open, onClose, data }) => {
  // Create a ref for the printable content
  const printContentRef = useRef<HTMLDivElement>(null);
  
  // Track if we're in print mode
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Function to handle print button click - simple direct approach
  const handlePrint = () => {
    // Get the printable content
    const printContent = printContentRef.current;
    if (!printContent) {
      alert('Print content not ready. Please try again.');
      return;
    }
    
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow pop-ups to print the invoice');
        return;
      }
      
      // Set print mode
      setIsPrinting(true);
      
      // Write the print content to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice-${data?.number || 'Preview'}</title>
            <style>
              @page {
                size: A4;
                margin: 0;
              }
              body {
                font-family: Arial, sans-serif;
                width: 210mm;
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
                font-size: 11px;
                line-height: 1.2;
              }
              .no-print {
                display: none !important;
              }
              .print-content {
                width: 210mm;
                padding: 10mm;
              }
              .page {
                page-break-after: always;
                margin: 0 !important;
                box-shadow: none !important;
                width: 210mm;
                min-height: 297mm;
              }
              .page:last-child {
                page-break-after: auto;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              .invoice-preview-logo {
                max-width: 150px !important;
                height: auto !important;
                display: block !important;
                margin-bottom: 1rem !important;
              }
              .invoice-section {
                padding: 8px 12px !important;
              }
              .invoice-table th, .invoice-table td {
                padding: 4px 6px !important;
              }
              .invoice-details {
                margin-bottom: 0.5rem !important;
              }
              .invoice-header {
                margin-bottom: 0.75rem !important;
              }
              p {
                margin-top: 0.25rem !important;
                margin-bottom: 0.25rem !important;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              .flex {
                display: flex;
              }
              .justify-between {
                justify-content: space-between;
              }
              .items-center {
                align-items: center;
              }
              .font-bold {
                font-weight: bold;
              }
              .text-right {
                text-align: right;
              }
              .mt-4 {
                margin-top: 1rem;
              }
              .mt-6 {
                margin-top: 1.5rem;
              }
              .mt-8 {
                margin-top: 2rem;
              }
              .text-xs {
                font-size: 0.75rem;
              }
              .text-sm {
                font-size: 0.875rem;
              }
              .text-lg {
                font-size: 1.125rem;
              }
              .text-xl {
                font-size: 1.25rem;
              }
              .text-2xl {
                font-size: 1.5rem;
              }
              .mb-2 {
                margin-bottom: 0.5rem;
              }
              .mb-4 {
                margin-bottom: 1rem;
              }
              .p-4 {
                padding: 1rem;
              }
              .p-6 {
                padding: 1.5rem;
              }
              .bg-gray-50 {
                background-color: #f9fafb;
              }
              .border-t {
                border-top: 1px solid #e5e7eb;
              }
              .border-b {
                border-bottom: 1px solid #e5e7eb;
              }
              .w-36 {
                width: 9rem;
              }
              .h-36 {
                height: 9rem;
              }
              .w-28 {
                width: 7rem;
              }
              .h-20 {
                height: 5rem;
              }
              .mx-auto {
                margin-left: auto;
                margin-right: auto;
              }
              .object-contain {
                object-fit: contain;
              }
              .opacity-80 {
                opacity: 0.8;
              }
              .opacity-90 {
                opacity: 0.9;
              }
              .text-center {
                text-align: center;
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      
      // Wait for content to load and then print
      printWindow.document.close();
      printWindow.focus();
      
      // Use a timeout to ensure content is loaded before printing
      setTimeout(() => {
        try {
          printWindow.print();
          printWindow.onafterprint = () => {
            printWindow.close();
            setIsPrinting(false);
          };
        } catch (err) {
          console.error('Error during print:', err);
          printWindow.close();
          setIsPrinting(false);
        }
      }, 1000);
    } catch (error) {
      console.error('Print setup error:', error);
      setIsPrinting(false);
      alert('There was an error setting up the print. Please try again.');
    }
  };
  
  // Early return if modal is not open or data is missing
  if (!open || !data) return null;

  // Constants for pagination with different items per page
  const ITEMS_PAGE_1 = 17; // First page can have 17 items
  const ITEMS_PAGE_2 = 30; // Second page can have 30 items
  const ITEMS_PAGE_3 = 20; // Third page can have 20 items (last page)
  
  // Calculate total pages based on item count and our page capacity rules
  const calculateTotalPages = () => {
    const totalItems = data.items.length;
    
    if (totalItems <= ITEMS_PAGE_1) {
      return 1; // All items fit on first page
    } else if (totalItems <= ITEMS_PAGE_1 + ITEMS_PAGE_2) {
      return 2; // Items fit on first and second page
    } else {
      // Need all three pages
      return Math.min(3, Math.ceil((totalItems - ITEMS_PAGE_1 - ITEMS_PAGE_2) / ITEMS_PAGE_3) + 2);
    }
  };
  
  const totalPages = calculateTotalPages();
  
  // Function to get items for a specific page
  const getItemsForPage = (pageNumber: number) => {
    const totalItems = data.items.length;
    
    if (pageNumber === 1) {
      // First page: up to ITEMS_PAGE_1 items
      return data.items.slice(0, Math.min(ITEMS_PAGE_1, totalItems));
    } else if (pageNumber === 2) {
      // Second page: up to ITEMS_PAGE_2 items after first page
      return data.items.slice(ITEMS_PAGE_1, Math.min(ITEMS_PAGE_1 + ITEMS_PAGE_2, totalItems));
    } else {
      // Third page and beyond (though we cap at 3 pages): remaining items
      const startIndex = ITEMS_PAGE_1 + ITEMS_PAGE_2;
      const endIndex = startIndex + ITEMS_PAGE_3;
      return data.items.slice(startIndex, Math.min(endIndex, totalItems));
    }
  };

  // Format date function
  const formatDisplayDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Calculate functions
  const calculateSubtotal = () => {
    return data.subtotal.toFixed(2);
  };

  const calculateVat = () => {
    return data.vatTotal.toFixed(2);
  };

  const calculateTotal = () => {
    return data.grandTotal.toFixed(2);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Get client name
  const getClientName = () => {
    if (!data.clientInfo) return 'N/A';
    
    if (data.clientInfo.companyName) {
      return data.clientInfo.companyName;
    }
    
    const firstName = data.clientInfo.firstName || '';
    const lastName = data.clientInfo.lastName || '';
    return [firstName, lastName].filter(Boolean).join(' ') || 'N/A';
  };

  // Get client address
  const getClientAddress = () => {
    if (!data.clientInfo) return 'N/A';
    
    const parts = [
      data.clientInfo.billingAddress,
      data.clientInfo.shippingStreet,
      data.clientInfo.shippingCity,
      data.clientInfo.shippingState,
      data.clientInfo.shippingPostal,
      data.clientInfo.shippingCountry
    ].filter(Boolean);
    
    return parts.join(', ') || 'N/A';
  };

  // Helper functions for calculations

  // Function to render a single page
  const renderPage = (pageNumber: number) => {
    const isFirstPage = pageNumber === 1;
    const isLastPage = pageNumber === totalPages;
    
    // Get items for this specific page using our custom pagination logic
    const pageItems = getItemsForPage(pageNumber);
    
    return (
      <div key={pageNumber} className="page" style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm',
        boxSizing: 'border-box',
        pageBreakAfter: 'always',
        backgroundColor: 'white',
        position: 'relative',
        margin: '0 auto 2rem auto',
        boxShadow: isPrinting ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}>
        {/* Page number */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-500">
          Page {pageNumber} of {totalPages}
        </div>
        
        {/* Only show header on first page */}
        {isFirstPage && (
          <>
            {/* Company Logo */}
            {data.companyDetails.logoUrl && (
              <div className="flex justify-center w-full mb-4">
                <img 
                  src={data.companyDetails.logoUrl} 
                  alt="Company Logo" 
                  className="invoice-preview-logo object-contain mx-auto" 
                  style={{
                    maxWidth: '150px',
                    height: 'auto',
                    display: 'block',
                    margin: '0 auto'
                  }}
                />
              </div>
            )}

            {/* Company Details */}
            <div className="text-sm">
              <p className="font-bold">{data.companyDetails.name}</p>
              {data.companyDetails.email && <p>{data.companyDetails.email}</p>}
              {data.companyDetails.phone && <p>{data.companyDetails.phone}</p>}
              <p>
                {[
                  data.companyDetails.addressLine1,
                  data.companyDetails.addressLine2,
                  data.companyDetails.addressLine3,
                  data.companyDetails.addressLine4
                ].filter(Boolean).join(', ')}
              </p>
            </div>
            
            {/* Invoice and Banking Details Side by Side */}
            <div className="flex justify-between mt-6 gap-8">
              {/* Left Side: Invoice and Client Details */}
              <div className="flex-1 text-sm invoice-section">
                {/* Invoice Details */}
                <div className="mb-4">
                  <p><strong>Invoice Number:</strong> {data.number}</p>
                  {data.reference && <p><strong>Reference:</strong> {data.reference}</p>}
                  <p><strong>Invoice Date:</strong> {formatDisplayDate(data.date)}</p>
                  <p><strong>Due Date:</strong> {formatDisplayDate(data.dueDate)}</p>
                </div>

                {/* Client Details */}
                <div className="mt-4">
                  <p className="text-xs"><strong>Bill To:</strong> {getClientName()}</p>
                  {data.clientInfo?.email && <p className="text-xs">{data.clientInfo.email}</p>}
                  {data.clientInfo?.phone && <p className="text-xs">{data.clientInfo.phone}</p>}
                  <p className="text-xs">{getClientAddress()}</p>
                </div>
              </div>

              {/* Right Side: Banking Details */}
              <div className="flex-1 text-sm invoice-section">
                <p className="font-bold mb-1">Banking Details:</p>
                <p><strong>Bank Name:</strong> {data.companyDetails.bankName || 'N/A'}</p>
                <p><strong>Account Number:</strong> {data.companyDetails.accountNumber || data.companyDetails.bankAccount || 'N/A'}</p>
                <p><strong>Branch Code:</strong> {data.companyDetails.branchCode || 'N/A'}</p>
                <p><strong>Account Type:</strong> {data.companyDetails.accountType || 'N/A'}</p>
              </div>
            </div>

            <hr className="my-4" />
          </>
        )}
        
        {/* Always show the table header */}
        <table className="w-full border-collapse invoice-table text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-1 text-left">#</th>
              <th className="px-2 py-1 text-left">Description</th>
              <th className="px-2 py-1 text-right">Qty</th>
              <th className="px-2 py-1 text-right">Rate (R)</th>
              <th className="px-2 py-1 text-right">Discount (R)</th>
              <th className="px-2 py-1 text-right">Amount (R)</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-2 py-1 text-left">{item.itemNo}</td>
                <td className="px-2 py-1 text-left">{item.description}</td>
                <td className="px-2 py-1 text-right">{item.quantity}</td>
                <td className="px-2 py-1 text-right">{formatCurrency(item.rate)}</td>
                <td className="px-2 py-1 text-right">{formatCurrency(item.discount)}</td>
                <td className="px-2 py-1 text-right font-medium">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Only show totals and footer on last page */}
        {pageNumber === totalPages && (
          <>
            {/* Totals */}
            <div className="mt-6 text-right text-sm invoice-section">
              <p>Subtotal: R {calculateSubtotal()}</p>
              <p>VAT ({data.vatRate}%): R {calculateVat()}</p>
              <p className="text-lg font-bold">Total (ZAR): R {calculateTotal()}</p>
            </div>

            {/* Notes & Terms */}
            <div className="mt-6 text-xs invoice-section">
              {data.notes && (
                <>
                  <p className="font-bold mb-1">Notes:</p>
                  <p>{data.notes}</p>
                </>
              )}
              {data.terms && (
                <>
                  <p className="mt-2 font-bold">Terms & Conditions:</p>
                  <p>{data.terms}</p>
                </>
              )}
            </div>

            {/* Stamp & Signature */}
            <div className="flex justify-between mt-8">
              {data.companyDetails.stampUrl && (
                <img 
                  src={data.companyDetails.stampUrl} 
                  alt="Company Stamp" 
                  className="w-36 h-36 object-contain opacity-80" 
                />
              )}
              <div className="text-center">
                {data.companyDetails.signatureUrl ? (
                  <img 
                    src={data.companyDetails.signatureUrl} 
                    alt="Authorized Signature" 
                    className="w-28 h-20 object-contain opacity-90 mx-auto" 
                  />
                ) : (
                  <div className="h-16 border-t border-gray-300 w-32 mb-1 mx-auto"></div>
                )}
                <p className="text-xs font-medium">Authorized Signature</p>
                <p className="text-xs">{data.companyDetails.name}</p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[210mm] w-full max-h-[90vh] p-0 overflow-auto">
        {/* Move PrintStyles component before it's used */}
        <PrintStyles />
        <DialogHeader className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center no-print">
          <DialogTitle className="text-xl font-semibold">Invoice Preview</DialogTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint}
              className="flex items-center gap-1"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-slate-500 hover:bg-slate-100 rounded-full h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-0 overflow-auto">
          {/* Printable content wrapped in a ref */}
          <div ref={printContentRef} className="print-content">
            {/* Render each page */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
              renderPage(pageNumber)
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};



export default InvoicePreviewModal;
