import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Printer, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { format } from 'date-fns';

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

interface InvoicePreviewModalProps {
  open: boolean;
  onClose: () => void;
  invoice: InvoicePreview;
  company: Company;
}

// Helper function to safely format currency
const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined) return 'R 0.00';
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount);
};

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  open,
  onClose,
  invoice,
  company,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [companyAssets, setCompanyAssets] = useState<CompanyAssets | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load company details and assets from localStorage
  useEffect(() => {
    try {
      // Load company details
      const savedCompanyDetails = localStorage.getItem('companyDetails');
      if (savedCompanyDetails) {
        setCompanyDetails(JSON.parse(savedCompanyDetails));
      }

      // Load company assets
      const savedCompanyAssets = localStorage.getItem('companyAssets');
      if (savedCompanyAssets) {
        setCompanyAssets(JSON.parse(savedCompanyAssets));
      }
    } catch (error) {
      console.error('Error loading company data:', error);
      toast.error('Failed to load company information');
    }
  }, [open]);

  const handlePrint = () => {
    setIsPrinting(true);
    
    // Use a small timeout to ensure the DOM updates before printing
    setTimeout(() => {
      try {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          throw new Error('Could not open print window');
        }

        // Get the HTML content to print
        const content = document.getElementById('invoice-print-container');
        if (!content) {
          throw new Error('Could not find invoice content');
        }

        // Clone the content to avoid modifying the original
        const printContent = content.cloneNode(true) as HTMLElement;
        
        // Create a new document
        printWindow.document.open();
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice ${invoice.number || ''}</title>
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
              <style>
                @page {
                  size: A4;
                  margin: 0;
                }
                body {
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                  margin: 0;
                  padding: 0;
                  color: #1f2937;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .page {
                  width: 210mm;
                  min-height: 297mm;
                  padding: 20mm;
                  margin: 0 auto;
                  background: white;
                  box-sizing: border-box;
                  position: relative;
                }
                @media print {
                  .no-print {
                    display: none !important;
                  }
                  .page {
                    padding: 0;
                    margin: 0;
                    border: none;
                    box-shadow: none;
                  }
                }
                /* Add any additional print-specific styles here */
              </style>
            </head>
            <body>
              ${printContent.outerHTML}
              <script>
                // Auto-print and close after printing
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    window.onafterprint = function() {
                      window.close();
                    };
                  }, 200);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } catch (error) {
        console.error('Error printing invoice:', error);
        toast.error('Failed to open print dialog');
      } finally {
        setIsPrinting(false);
      }
    }, 100);
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    
    try {
      setIsGeneratingPdf(true);
      
      // Create a new PDF with A4 dimensions (210mm x 297mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        precision: 100 // Higher precision for better quality
      });
      
      // Set document properties
      pdf.setProperties({
        title: `Invoice ${invoice.number || ''}`,
        subject: 'Invoice',
        author: companyDetails?.name || 'MOKMzansi Books',
        creator: 'MOKMzansi Books',
        keywords: 'invoice, billing, payment',
      });
      
      // Get the preview element and clone it to avoid affecting the original
      const element = previewRef.current;
      const elementToPrint = element.cloneNode(true) as HTMLElement;
      
      // Remove elements that shouldn't be in the PDF
      const elementsToRemove = elementToPrint.querySelectorAll('.no-print, .print-hide');
      elementsToRemove.forEach(el => el.remove());
      
      // Ensure images are loaded before generating PDF
      const images = elementToPrint.getElementsByTagName('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => {
            img.style.display = 'none';
            resolve();
          };
        });
      }));
      
      // Hide markup percentage column if it exists
      const markupHeaders = elementToPrint.querySelectorAll('th');
      markupHeaders.forEach(header => {
        if (header.textContent?.includes('Mark Up %')) {
          const index = Array.from(header.parentElement!.children).indexOf(header) + 1;
          const cells = elementToPrint.querySelectorAll(`td:nth-child(${index})`);
          cells.forEach(cell => cell.remove());
          header.remove();
        }
      });
      
      // Set the cloned element's styles for printing
      elementToPrint.style.width = '210mm';
      elementToPrint.style.minHeight = '297mm';
      elementToPrint.style.padding = '20mm';
      elementToPrint.style.margin = '0';
      elementToPrint.style.boxSizing = 'border-box';
      elementToPrint.style.background = '#fff';
      elementToPrint.style.boxShadow = 'none';
      elementToPrint.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif";
      elementToPrint.style.color = '#1f2937';
      elementToPrint.style.lineHeight = '1.5';
      
      // Add the cloned element to the body
      elementToPrint.style.position = 'absolute';
      elementToPrint.style.left = '-9999px';
      elementToPrint.id = 'pdf-export';
      document.body.appendChild(elementToPrint);
      
      // Create a canvas and render the preview
      const canvas = await html2canvas(elementToPrint, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      
      // Clean up the cloned element
      document.body.removeChild(elementToPrint);
      
      // Calculate dimensions to fit A4 with margins
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const margin = 10; // 10mm margin on all sides
      const contentWidth = pdfWidth - (2 * margin);
      const contentHeight = pdfHeight - (2 * margin);
      
      // Calculate aspect ratio
      const imgWidth = contentWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add the first page
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight, undefined, 'FAST');
      
      // Calculate if we need additional pages
      let heightLeft = imgHeight - (contentHeight - (imgHeight % contentHeight));
      let position = 0;
      
      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        pdf.addPage();
        position = margin - (heightLeft + margin);
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= contentHeight;
      }
      
      // Save the PDF with proper filename
      const fileName = `invoice_${invoice.number || 'draft'}.pdf`.replace(/\s+/g, '_').toLowerCase();
      pdf.save(fileName);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Calculate totals with fallbacks to invoice values if available
  const subtotal = invoice.subtotal || invoice.items.reduce((sum, item) => sum + item.amount, 0);
  const vatRate = invoice.vatRate || 15; // Default to 15% if not specified
  const vatTotal = invoice.vatTotal || subtotal * (vatRate / 100);
  const grandTotal = invoice.grandTotal || subtotal + vatTotal;

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get company address as formatted string
  const getCompanyAddress = () => {
    const parts = [
      company.addressLine1,
      company.addressLine2,
      company.addressLine3,
      company.addressLine4,
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Get client shipping address
  const getClientShippingAddress = () => {
    if (invoice.clientInfo?.shippingAddress) {
      return invoice.clientInfo.shippingAddress;
    }
    
    const client = invoice.clientInfo as unknown as Client;
    if (client.shippingStreet || client.shippingCity) {
      const parts = [
        client.shippingStreet,
        client.shippingCity,
        client.shippingState,
        client.shippingPostal,
        client.shippingCountry,
      ].filter(Boolean);
      return parts.join(', ');
    }
    
    return invoice.clientInfo?.address || 'N/A';
  };

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Calculate page breaks for items
  const renderInvoiceItems = () => {
    return invoice.items.map((item, index) => (
      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-3 px-4 text-sm text-center">{item.itemNo}</td>
        <td className="py-3 px-4 text-sm">{item.description}</td>
        <td className="py-3 px-4 text-sm text-right">{item.quantity}</td>
        <td className="py-3 px-4 text-sm text-right">{formatCurrency(item.rate)}</td>
        <td className="py-3 px-4 text-sm text-right">{item.markupPercent}%</td>
        <td className="py-3 px-4 text-sm text-right">{item.discount ? formatCurrency(item.discount) : '-'}</td>
        <td className="py-3 px-4 text-sm font-medium text-right">{formatCurrency(item.amount)}</td>
      </tr>
    ));
  };


  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0">
        <div className="flex items-center justify-between p-6 border-b no-print">
          <DialogTitle className="text-2xl font-bold">Invoice Preview</DialogTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={isGeneratingPdf || isPrinting}
              className="font-sf-pro flex items-center gap-2"
            >
              {isPrinting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              {isPrinting ? 'Preparing...' : 'Print'}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf || isPrinting}
              className="font-sf-pro flex items-center gap-2"
            >
              {isGeneratingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
              disabled={isGeneratingPdf || isPrinting}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {/* Invoice Preview Content - Matches A4 paper size */}
          <div 
            ref={previewRef}
            id="invoice-print-container"
            className="bg-white mx-auto shadow-lg print:shadow-none"
            style={{
              width: '210mm',
              minHeight: '297mm',
              padding: '20mm',
              margin: '0 auto',
              boxSizing: 'border-box',
              position: 'relative',
              background: '#fff',
              transform: 'scale(0.95)',
              transformOrigin: 'top center',
              overflow: 'hidden',
              marginBottom: '20px'
            }}
          >
            <div className="page" style={{
              width: '100%',
              minHeight: '100%',
              position: 'relative',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
              color: '#1f2937',
              lineHeight: '1.5',
              overflow: 'visible'
            }}>
              {/* Header */}
              <div className="flex justify-between items-start mb-12">
                <div>
                  {companyAssets?.Logo?.dataUrl && (
                    <div className="mb-4">
                      <img 
                        src={companyAssets.Logo.dataUrl} 
                        alt="Company Logo" 
                        className="h-16 w-auto object-contain"
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
                  <h2 className="text-lg font-semibold text-gray-900">{companyDetails?.name || 'Your Company Name'}</h2>
                  {companyDetails?.addressLine1 && <p className="text-sm text-gray-600">{companyDetails.addressLine1}</p>}
                  {companyDetails?.addressLine2 && <p className="text-sm text-gray-600">{companyDetails.addressLine2}</p>}
                  {companyDetails?.addressLine3 && <p className="text-sm text-gray-600">{companyDetails.addressLine3}</p>}
                  {companyDetails?.addressLine4 && <p className="text-sm text-gray-600">{companyDetails.addressLine4}</p>}
                  {companyDetails?.email && <p className="text-sm text-gray-600">{companyDetails.email}</p>}
                  {companyDetails?.phone && <p className="text-sm text-gray-600">{companyDetails.phone}</p>}
                  {companyDetails?.website && <p className="text-sm text-gray-600">{companyDetails.website}</p>}
                  {companyDetails?.vatNumber && <p className="text-sm text-gray-600">VAT: {companyDetails.vatNumber}</p>}
                  {companyDetails?.regNumber && <p className="text-sm text-gray-600">Reg: {companyDetails.regNumber}</p>}
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
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Mark Up %</th>
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
                
                {/* Company Stamp & Signature */}
                <div className="mt-12 flex justify-between items-end">
                  <div>
                    {companyAssets?.Stamp?.dataUrl && (
                      <div className="mb-4">
                        <img 
                          src={companyAssets.Stamp.dataUrl} 
                          alt="Company Stamp" 
                          className="h-24 w-auto opacity-80"
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
                          className="h-16 w-auto object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-16 border-t border-gray-300 w-32 mb-2 mx-auto"></div>
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
        
        <DialogFooter className="px-6 py-4 border-t bg-gray-50 no-print">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewModal;
