import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { generateInvoicePdf } from '@/utils/invoicePdfGenerator_v2';
import { Invoice } from '@/types/invoice';
import { invoiceStyles } from './invoiceStyles';

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

const InvoicePreviewModal = ({ open, onClose, data }: InvoicePreviewModalProps): JSX.Element | null => {
  // Create a ref for invoice content
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Track PDF download loading state
  const [isDownloading, setIsDownloading] = useState(false);
  
  /**
   * FINALIZED INVOICE PDF DOWNLOAD FUNCTIONALITY - DO NOT MODIFY
   * ========================================================
   * This function handles the download of invoice PDFs and has been finalized.
   * It properly manages loading states and error handling for PDF generation.
   * 
   * Any modifications to this function may break the PDF generation functionality.
   * Last updated: July 4, 2025
   */
  const handleDownloadPdf = async () => {
    if (isDownloading) return; // Prevent multiple clicks
    
    setIsDownloading(true); // Set loading state
    
    try {
      // Convert the preview data to Invoice format for the PDF generator
      const invoice = {
        // Required fields
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: data.number, // Using invoice number as ID
        number: data.number,
        clientId: data.clientId || '',
        clientName: data.clientInfo?.companyName || 
                   `${data.clientInfo?.firstName || ''} ${data.clientInfo?.lastName || ''}`.trim() || 
                   'Unknown Client',
        clientEmail: data.clientInfo?.email,
        // Use string client ID instead of object to avoid type conflicts
        client: data.clientId || '',
        date: data.date,
        invoiceDate: data.date, // Alias for date
        dueDate: data.dueDate,
        amount: data.grandTotal,
        total: data.grandTotal, // Alias for amount
        paidAmount: 0,
        balance: data.grandTotal,
        status: (data.status || 'draft') as Invoice['status'],
        currency: data.currency,
        vatRate: data.vatRate,
        reference: data.reference || '',
        items: data.items.map(item => ({
          id: item.id,
          itemNo: item.itemNo,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          unitPrice: item.rate,
          markupPercent: item.markupPercent,
          discount: item.discount,
          amount: item.amount
        })),
        notes: data.notes,
        terms: data.terms
      };
      
      // Generate and download the PDF
      await generateInvoicePdf(invoice as Invoice);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('An error occurred while generating the PDF.');
    } finally {
      setIsDownloading(false); // Clear loading state regardless of success or failure
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

  // No need for calculate functions as we use data properties directly

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
    const pageItems = getItemsForPage(pageNumber);
    const isLastPage = pageNumber === totalPages;
    const isFirstPage = pageNumber === 1;

    return (
      <div key={`page-${pageNumber}`} className="page bg-white border rounded p-6 my-4 mx-auto shadow-md w-[210mm]">
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
                  className="invoice-content-logo object-contain mx-auto" 
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
              <th className="border border-gray-200 p-2 w-[5%]">#</th>
              <th className="border border-gray-200 p-2 w-[45%]">Description</th>
              <th className="border border-gray-200 p-2 w-[10%]">Qty</th>
              <th className="border border-gray-200 p-2 w-[10%]">Rate (R)</th>
              <th className="border border-gray-200 p-2 w-[10%]">Discount</th>
              <th className="border border-gray-200 p-2 w-[20%]">Amount (R)</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-200 p-2 text-center">{item.itemNo}</td>
                <td className="border border-gray-200 p-2">{item.description}</td>
                <td className="border border-gray-200 p-2 text-center">{item.quantity}</td>
                <td className="border border-gray-200 p-2 text-right">{formatCurrency(item.rate)}</td>
                <td className="border border-gray-200 p-2 text-right">{formatCurrency(item.discount)}</td>
                <td className="border border-gray-200 p-2 text-right">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Only show totals and footer on last page */}
        {isLastPage && (
          <>
            {/* Totals */}
            <div className="mt-6 text-right text-sm invoice-section">
              <p><strong>Subtotal:</strong> R {formatCurrency(data.subtotal)}</p>
              <p><strong>VAT ({data.vatRate}%):</strong> R {formatCurrency(data.vatTotal)}</p>
              <p className="text-lg font-bold"><strong>Total:</strong> R {formatCurrency(data.grandTotal)}</p>
            </div>
            
            {/* Footer with terms and notes */}
            <div className="mt-8 text-xs border-t pt-4">
              {data.notes && (
                <div className="mb-4">
                  <p className="font-semibold">Notes:</p>
                  <p className="whitespace-pre-line">{data.notes}</p>
                </div>
              )}
              
              {data.terms && (
                <div className="mb-4">
                  <p className="font-semibold">Terms & Conditions:</p>
                  <p className="whitespace-pre-line">{data.terms}</p>
                </div>
              )}
              
              {/* Company Stamp and Signature */}
              <div className="flex justify-between mt-8">
                <div className="w-1/3">
                  {data.companyDetails.stampUrl && (
                    <div className="text-center">
                      <img 
                        src={data.companyDetails.stampUrl} 
                        alt="Company Stamp" 
                        className="max-h-24 mx-auto"
                      />
                      <p className="mt-2 text-center text-xs">Company Stamp</p>
                    </div>
                  )}
                </div>
                
                <div className="w-1/3">
                  {data.companyDetails.signatureUrl && (
                    <div className="text-center">
                      <img 
                        src={data.companyDetails.signatureUrl} 
                        alt="Authorized Signature" 
                        className="max-h-24 mx-auto"
                      />
                      <p className="mt-2 text-center text-xs">Authorized Signature</p>
                    </div>
                  )}
                </div>
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
        {/* Dialog header with title and actions */}
        <DialogHeader className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
          <DialogTitle className="text-xl font-semibold">Invoice Preview</DialogTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={isDownloading} 
              onClick={handleDownloadPdf} 
              className="flex gap-1 items-center"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose} 
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-0 overflow-auto">
          {/* Invoice content container */}
          <div ref={contentRef} className="invoice-content">
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
