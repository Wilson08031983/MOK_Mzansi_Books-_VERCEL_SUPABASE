import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Printer, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDFDocument from '@/components/pdf/InvoicePDFDocument';
import styles from './InvoicePreviewModal.module.css';

// Define interface types needed for the component
export interface InvoiceItemPreview {
  id: string;
  itemNo: number;
  description: string;
  quantity: number;
  rate: number;
  markupPercent: number;
  discount: number;
  amount: number;
  vat?: number;
}

// Client information interface
export interface ClientInfo {
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

// Company details interface
export interface CompanyDetails {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  vatNumber?: string;
  regNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  bankName?: string;
  bankAccount?: string;
  accountType?: string;
  branchCode?: string;
  accountHolder?: string;
}

// Company assets interface
export interface CompanyAssets {
  Logo?: {
    name: string;
    dataUrl: string;
    lastModified: number;
  };
  Stamp?: {
    name: string;
    dataUrl: string;
    lastModified: number;
  };
  Signature?: {
    name: string;
    dataUrl: string;
    lastModified: number;
  };
}

// Main Invoice interface
export interface InvoicePreview {
  id?: string;
  number: string;
  date: string;
  dueDate: string;
  reference?: string;
  clientId?: string;
  clientInfo?: ClientInfo;
  items: InvoiceItemPreview[];
  subtotal: number;
  vatRate: number;
  vatTotal: number;
  grandTotal: number;
  terms: string;
  notes: string;
  status?: string;
  currency: string;
  companyDetails?: CompanyDetails;
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
  accountType?: string;
  branchCode?: string;
  accountHolder?: string;
}

interface InvoicePreviewModalProps {
  open: boolean;
  onClose: () => void;
  invoice: InvoicePreview;
  company: Company;
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  open,
  onClose,
  invoice: initialInvoice,
  company: initialCompany
}) => {
  // State management
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [companyAssets, setCompanyAssets] = useState<CompanyAssets | null>(null);
  const [invoice, setInvoice] = useState<InvoicePreview | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  // Initialize company details and invoice from props
  useEffect(() => {
    if (initialCompany) {
      setCompanyDetails({
        ...initialCompany,
        ...initialCompany
      });
    }
    
    if (initialInvoice) {
      setInvoice(initialInvoice);
    }
  }, [initialCompany, initialInvoice]);

  // Helper function to safely format currency
  const formatCurrency = (amount: number | undefined): string => {
    const value = amount || 0;
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Format date helper
  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return 'N/A';
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return format(d, 'dd MMM yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Handle print
  const handlePrint = useCallback(() => {
    setIsPrinting(true);
    if (typeof window !== 'undefined') {
      window.print();
    }
    // Small delay to ensure print dialog appears before setting isPrinting to false
    setTimeout(() => setIsPrinting(false), 1000);
  }, []);

  // Check if we have all required data for PDF generation
  const hasRequiredDataForPdf = !!(invoice && companyDetails && invoiceRef.current);

  // Get client shipping address
  const getClientShippingAddress = (): string => {
    if (!invoice?.clientInfo) return 'Same as billing address';
    if (invoice.clientInfo.shippingAddress) return invoice.clientInfo.shippingAddress;
    if (invoice.clientInfo.billingAddress) return invoice.clientInfo.billingAddress;
    return 'Same as billing address';
  };

  // Check if we have all required data to display the invoice
  const hasRequiredDataToDisplay = Boolean(
    invoice && 
    companyDetails && 
    invoice.clientInfo && 
    invoice.items?.length > 0
  );

  // Format date for display
  const formatDisplayDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Render invoice items
  const renderInvoiceItems = () => {
    if (!invoice?.items?.length) return null;
    
    return invoice.items.map((item, index) => (
      <tr key={item.id || index}>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.itemNo}</td>
        <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
          {item.quantity}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
          {formatCurrency(item.rate)}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
          {item.discount ? formatCurrency(item.discount) : '-'}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
          {formatCurrency(item.amount)}
        </td>
      </tr>
    ));
  };

  // Load company data when the modal opens
  useEffect(() => {
    if (!open) return;

    try {
      // Load company details from localStorage
      const savedCompanyDetails = localStorage.getItem('companyDetails');
      if (savedCompanyDetails) {
        setCompanyDetails(JSON.parse(savedCompanyDetails));
      }

      // Load company assets from localStorage
      const savedCompanyAssets = localStorage.getItem('companyAssets');
      if (savedCompanyAssets) {
        setCompanyAssets(JSON.parse(savedCompanyAssets));
      }
    } catch (error) {
      console.error('Error loading company data:', error);
      toast.error('Failed to load company information');
    }
  }, [open]);

  // Handle print click
  const handlePrintClick = useCallback(() => {
    setIsPrinting(true);
    if (typeof window !== 'undefined') {
      window.print();
    }
    setIsPrinting(false);
  }, []);

  // Check if we have all required data
  const hasRequiredData = !!(invoice && companyDetails && invoiceRef.current);

  // Calculate totals with fallbacks to invoice values if available
  const subtotal = invoice?.subtotal || (invoice?.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0);
  const vatRate = invoice?.vatRate || 15; // Default to 15% if not specified
  const vatTotal = invoice?.vatTotal || subtotal * (vatRate / 100);
  const grandTotal = invoice?.grandTotal || subtotal + vatTotal;

  // Prepare invoice data for PDF
  const invoiceData = {
    ...invoice,
    subtotal,
    vatRate,
    vatTotal,
    grandTotal,
    companyDetails: companyDetails || undefined,
  };

  if (!invoice) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className={styles.container}>
          <div className="p-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading invoice data...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={styles.container}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Invoice Preview</DialogTitle>
          <div className="flex space-x-2">
            {hasRequiredData ? (
              <PDFDownloadLink
                document={<InvoicePDFDocument invoice={invoiceData} companyAssets={companyAssets || undefined} />}
                fileName={`Invoice_${invoice.number || 'Draft'}.pdf`}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
              >
                {({ loading }) => (
                  <>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    {loading ? 'Generating...' : 'Download PDF'}
                  </>
                )}
              </PDFDownloadLink>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                title={!hasRequiredData ? 'Loading company data...' : ''}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            )}

            <Button
              variant="default"
              size="sm"
              onClick={handlePrint}
              disabled={isPrinting || !hasRequiredData}
              title={!hasRequiredData ? 'Loading company data...' : ''}
            >
              {isPrinting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Printer className="mr-2 h-4 w-4" />
              )}
              {isPrinting ? 'Preparing...' : 'Print'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        <div className={styles.content}>
          <div 
            ref={invoiceRef}
            id="invoice-print-content"
            className={styles.printContent}
          >
            <div className={styles.printContentInner}>
              {/* Header */}
              <div className="flex justify-between items-start mb-12">
                <div>
                  {companyAssets?.Logo?.dataUrl && (
                    <div className="mb-6 flex justify-start">
                      <img 
                        src={companyAssets.Logo.dataUrl} 
                        alt="Company Logo" 
                        className="h-32 w-auto max-w-full object-contain print:h-36"
                        style={{ maxWidth: '300px' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
                  <p className="text-sm text-gray-500">#{invoice.number}</p>
                </div>
                
                <div className="text-right">
                  <h2 className="text-lg font-semibold text-gray-900">{companyDetails?.name}</h2>
                  {companyDetails?.email && (
                    <p className="text-sm text-gray-600">{companyDetails.email}</p>
                  )}
                  {companyDetails?.phone && (
                    <p className="text-sm text-gray-600">{companyDetails.phone}</p>
                  )}
                  <div className="mt-2">
                    {companyDetails?.addressLine1 && (
                      <p className="text-sm text-gray-600">{companyDetails.addressLine1}</p>
                    )}
                    {companyDetails?.addressLine2 && (
                      <p className="text-sm text-gray-600">{companyDetails.addressLine2}</p>
                    )}
                    {companyDetails?.addressLine3 && (
                      <p className="text-sm text-gray-600">{companyDetails.addressLine3}</p>
                    )}
                    {companyDetails?.addressLine4 && (
                      <p className="text-sm text-gray-600">{companyDetails.addressLine4}</p>
                    )}
                  </div>
                  <div className="mt-2">
                    {companyDetails?.vatNumber && (
                      <p className="text-sm text-gray-600">VAT: {companyDetails.vatNumber}</p>
                    )}
                    {companyDetails?.regNumber && (
                      <p className="text-sm text-gray-600">Reg: {companyDetails.regNumber}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Invoice Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Bill To:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900">
                      {invoice.clientInfo?.companyName || `${invoice.clientInfo?.firstName || ''} ${invoice.clientInfo?.lastName || ''}`.trim()}
                    </p>
                    {invoice.clientInfo?.email && <p className="text-sm text-gray-600">{invoice.clientInfo.email}</p>}
                    {invoice.clientInfo?.phone && <p className="text-sm text-gray-600">{invoice.clientInfo.phone}</p>}
                    {invoice.clientInfo?.billingAddress && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Billing Address:</p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.clientInfo.billingAddress}</p>
                      </div>
                    )}
                    {invoice.clientInfo?.shippingAddress && !invoice.clientInfo?.sameAsBilling && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Shipping Address:</p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.clientInfo.shippingAddress}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Invoice #</p>
                      <p className="text-sm">{invoice.number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Date</p>
                      <p className="text-sm">{formatDisplayDate(invoice.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Due Date</p>
                      <p className="text-sm">{formatDisplayDate(invoice.dueDate)}</p>
                    </div>
                    {invoice.reference && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Reference</p>
                        <p className="text-sm">{invoice.reference}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Line Items */}
              <div className="mb-8">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {renderInvoiceItems()}
                    </tbody>
                  </table>
                </div>
                
                {/* Totals */}
                <div className="mt-8 flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-sm font-medium text-gray-700">Subtotal:</span>
                      <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-sm font-medium text-gray-700">VAT ({vatRate}%):</span>
                      <span className="text-sm font-medium">{formatCurrency(vatTotal)}</span>
                    </div>
                    <div className="flex justify-between py-3 font-bold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Terms & Notes */}
              <div className="mt-12 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Terms & Conditions</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line">
                      {invoice.terms || 'Payment is due within 30 days of invoice date. Thank you for your business!'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line">
                      {invoice.notes || 'All amounts are in South African Rand (ZAR).'}
                    </p>
                  </div>
                </div>
                
                {/* Bank Details */}
                {(companyDetails?.bankName || companyDetails?.bankAccount || companyDetails?.accountType || companyDetails?.branchCode) && (
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Banking Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        {companyDetails?.bankName && (
                          <p className="text-gray-700">
                            <span className="font-medium">Bank:</span> {companyDetails.bankName}
                          </p>
                        )}
                        {companyDetails?.bankAccount && (
                          <p className="text-gray-700">
                            <span className="font-medium">Account #:</span> {companyDetails.bankAccount}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        {companyDetails?.accountType && (
                          <p className="text-gray-700">
                            <span className="font-medium">Account Type:</span> {companyDetails.accountType}
                          </p>
                        )}
                        {companyDetails?.branchCode && (
                          <p className="text-gray-700">
                            <span className="font-medium">Branch Code:</span> {companyDetails.branchCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {/* Company Stamp & Signature */}
                <div className="mt-12 flex justify-between items-end">
                  <div>
                    {companyAssets?.Stamp?.dataUrl && (
                      <div className="mb-4 flex justify-center">
                        <img 
                          src={companyAssets.Stamp.dataUrl} 
                          alt="Company Stamp" 
                          className="h-40 w-auto max-w-full object-contain opacity-80 print:h-44"
                          style={{ maxWidth: '180px' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    {companyAssets?.Signature?.dataUrl ? (
                      <div className="mb-2">
                        <img 
                          src={companyAssets.Signature.dataUrl} 
                          alt="Authorized Signature" 
                          className="h-20 w-auto object-contain print:h-24"
                          style={{ maxWidth: '200px' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-20 border-t border-gray-300 w-40 mb-2 mx-auto print:h-24"></div>
                    )}
                    <p className="text-sm font-medium text-gray-700">Authorized Signature</p>
                    <p className="text-xs text-gray-500">{companyDetails?.name || 'Your Company Name'}</p>
                  </div>
                </div>
              </div>
              
              </div>
              
              {/* Thank You Footer - Only shows in print */}
              <div className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-500 print-only">
                <div className="mt-6 space-y-1">
                  <p>Thank you for your business!</p>
                  <p>
                    {companyDetails?.name || 'Your Company Name'}
                    {companyDetails?.phone && ` • ${companyDetails.phone}`}
                    {companyDetails?.email && ` • ${companyDetails.email}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose} disabled={isPrinting}>
                Close
              </Button>
              <Button 
                onClick={handlePrint} 
                disabled={isPrinting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isPrinting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Preparing...
                  </>
                ) : 'Print'}
              </Button>
            </div>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewModal;
