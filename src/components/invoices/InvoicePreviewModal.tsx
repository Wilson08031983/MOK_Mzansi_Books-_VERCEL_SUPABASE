import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';

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
  if (!open || !data) return null;

  // Constants for pagination
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(data.items.length / ITEMS_PER_PAGE);

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

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Function to render a single page
  const renderPage = (pageNumber: number) => {
    const startIdx = (pageNumber - 1) * ITEMS_PER_PAGE;
    const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, data.items.length);
    const pageItems = data.items.slice(startIdx, endIdx);
    const isFirstPage = pageNumber === 1;
    
    return (
      <div key={`page-${pageNumber}`} className="w-[210mm] min-h-[297mm] bg-white px-10 py-8 shadow-lg print:shadow-none print:px-0 print:py-0 print:bg-white mx-auto relative">
        {/* Page number */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-500">
          Page {pageNumber} of {totalPages}
        </div>
        
        {/* Only show header on first page */}
        {isFirstPage && (
          <>
            {/* Company Logo */}
            {data.companyDetails.logoUrl && (
              <img 
                src={data.companyDetails.logoUrl} 
                alt="Company Logo" 
                className="w-40 h-auto mb-4 object-contain" 
              />
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
            
            {/* Banking Details */}
            <div className="text-sm mt-2">
              <p className="font-semibold">Banking Details:</p>
              <p><strong>Bank Name:</strong> {data.companyDetails.bankName || 'N/A'}</p>
              <p><strong>Account Number:</strong> {data.companyDetails.accountNumber || data.companyDetails.bankAccount || 'N/A'}</p>
              <p><strong>Branch Code:</strong> {data.companyDetails.branchCode || 'N/A'}</p>
              <p><strong>Account Type:</strong> {data.companyDetails.accountType || 'N/A'}</p>
            </div>

            <hr className="my-4" />

            {/* Invoice Details */}
            <div className="text-sm mb-4">
              <p><strong>Invoice Number:</strong> {data.number}</p>
              {data.reference && <p><strong>Reference:</strong> {data.reference}</p>}
              <p><strong>Invoice Date:</strong> {formatDisplayDate(data.date)}</p>
              <p><strong>Due Date:</strong> {formatDisplayDate(data.dueDate)}</p>
            </div>

            {/* Client Details */}
            <div className="text-sm mb-4">
              <p><strong>Bill To:</strong> {getClientName()}</p>
              {data.clientInfo?.email && <p>{data.clientInfo.email}</p>}
              {data.clientInfo?.phone && <p>{data.clientInfo.phone}</p>}
              <p>{getClientAddress()}</p>
            </div>
          </>
        )}
        
        {/* Always show the table header */}
        <table className="w-full text-xs border mt-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-2 text-left">#</th>
              <th className="px-2 py-2 text-left">Description</th>
              <th className="px-2 py-2 text-right">Qty</th>
              <th className="px-2 py-2 text-right">Rate (R)</th>
              <th className="px-2 py-2 text-right">Discount (R)</th>
              <th className="px-2 py-2 text-right">Amount (R)</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-2 py-2 text-left">{item.itemNo}</td>
                <td className="px-2 py-2 text-left">{item.description}</td>
                <td className="px-2 py-2 text-right">{item.quantity}</td>
                <td className="px-2 py-2 text-right">{formatCurrency(item.rate)}</td>
                <td className="px-2 py-2 text-right">{formatCurrency(item.discount)}</td>
                <td className="px-2 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Only show totals and footer on last page */}
        {pageNumber === totalPages && (
          <>
            {/* Totals */}
            <div className="mt-6 text-right text-sm">
              <p>Subtotal: R {calculateSubtotal()}</p>
              <p>VAT ({data.vatRate}%): R {calculateVat()}</p>
              <p className="text-lg font-bold">Total (ZAR): R {calculateTotal()}</p>
            </div>

            {/* Notes & Terms */}
            <div className="mt-6 text-xs">
              {data.notes && (
                <>
                  <p className="font-bold">Notes:</p>
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
        <DialogHeader className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
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

        <div className="p-4 overflow-auto">
          {/* Render each page */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
            renderPage(pageNumber)
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewModal;
