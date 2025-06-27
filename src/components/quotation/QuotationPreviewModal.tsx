import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

// Define interface types needed for the component
interface QuotationItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  markup?: number;
  markupPercent?: number;
  discount?: number;
  amount: number;
  vat?: number;
}

// Client interface matching the structure in clientService.ts
interface Client {
  id: string;
  clientType?: string;
  companyName?: string;
  contactPerson?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  shippingAddress?: string;
  // Shipping address fields from clientService
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostal?: string;
  shippingCountry?: string;
  sameAsBilling?: boolean;
}

// Client information interface
interface ClientInfo {
  companyName: string;
  contactPerson?: string;
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

// Export interfaces for use in other components
export interface QuotationItemPreview {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  markup?: number;
  markupPercent?: number;
  discount?: number;
  amount: number;
  vat?: number;
}

// Main Quotation interface
export interface Quotation {
  id?: string;
  quotationNumber?: string;
  date: string;
  reference?: string;
  clientId?: string;
  clientInfo?: ClientInfo;
  items: QuotationItem[];
  subtotal?: number;
  vatTotal?: number;
  grandTotal?: number;
  termsAndConditions?: string;
  notes?: string;
}

// Company interface
interface Company {
  id?: string;
  name?: string;
  logoUrl?: string;
  stampUrl?: string;
  signatureUrl?: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  websiteNotApplicable?: boolean;
  vatNumber?: string;
  vatNumberNotApplicable?: boolean;
  regNumber?: string;
  // Address fields
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  // Bank details
  bankName?: string;
  bankAccount?: string;
  accountType?: string;
  branchCode?: string;
  accountHolder?: string;
}

interface QuotationPreviewModalProps {
  open: boolean;
  onClose: () => void;
  quotation: Quotation;
  company: Company;
}

// Helper function to safely format currency
const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || isNaN(Number(amount))) return 'R 0.00';
  return `R ${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const QuotationPreviewModal: React.FC<QuotationPreviewModalProps> = ({
  open,
  onClose,
  quotation,
  company,
}) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();
  const safeQuotationNumber = quotation.quotationNumber || `QUO-${currentYear}-001`;

  // Load client data when the modal opens
  useEffect(() => {
    // If we have clientInfo directly in the quotation, use that
    if (quotation.clientInfo) {
      console.log('Client info from quotation:', quotation.clientInfo);
      console.log('Shipping address from quotation:', quotation.clientInfo.shippingAddress);
      
      // Convert clientInfo to Client format
      const clientData = {
        id: quotation.clientId || '',
        companyName: quotation.clientInfo.companyName,
        firstName: quotation.clientInfo.contactPerson?.split(' ')[0],
        lastName: quotation.clientInfo.contactPerson?.split(' ').slice(1).join(' '),
        email: quotation.clientInfo.email,
        phone: quotation.clientInfo.phone,
        billingAddress: quotation.clientInfo.billingAddress,
        shippingAddress: quotation.clientInfo.shippingAddress
      };
      
      console.log('Setting selected client to:', clientData);
      setSelectedClient(clientData);
      return;
    }
    
    // Otherwise try to load from localStorage using clientId
    if (open && quotation.clientId) {
      try {
        // Load from localStorage - use 'clients' key as that's what CreateQuotationModal uses
        const clientsString = localStorage.getItem('clients');
        
        if (!clientsString) {
          setSelectedClient(null);
          return;
        }
        
        const clients = JSON.parse(clientsString);
        const client = clients.find((c: Client) => c.id === quotation.clientId);
        
        if (client) {
          setSelectedClient(client);
        } else {
          setSelectedClient(null);
        }
      } catch (error) {
        console.error('Error loading client data:', error);
        setSelectedClient(null);
      }
    } else {
      setSelectedClient(null);
    }
  }, [open, quotation.clientId, quotation.clientInfo]);
  const [companyData, setCompanyData] = useState<Company>({});
  const [bankDetails, setBankDetails] = useState<Partial<Company>>({});
  const [companyAssets, setCompanyAssets] = useState<Record<string, { dataUrl: string }>>({});

  // Load company data, bank details, and assets from localStorage
  useEffect(() => {
    try {
      // Load company details
      const savedCompanyDetails = localStorage.getItem('companyDetails');
      if (savedCompanyDetails) {
        const parsedDetails = JSON.parse(savedCompanyDetails);
        setCompanyData(parsedDetails);
      }

      // Load bank details
      const savedBankDetails = localStorage.getItem('companyBankDetails');
      if (savedBankDetails) {
        const parsedBankDetails = JSON.parse(savedBankDetails);
        setBankDetails(parsedBankDetails);
      }

      // Load company assets
      const savedAssets = localStorage.getItem('companyAssets');
      if (savedAssets) {
        const parsedAssets = JSON.parse(savedAssets);
        setCompanyAssets(parsedAssets);
      }
    } catch (error) {
      console.error('Error loading company details, bank details, or assets:', error);
    }
  }, []);

  // Calculate subtotal, VAT total, and grand total safely
  const calculateTotals = (): { subtotal: number; vatTotal: number; grandTotal: number; vatRate: number } => {
    try {
      // Calculate subtotal from all items
      const subtotal = (quotation.items || []).reduce((sum, item) => {
        return sum + (Number(item.amount) || 0);
      }, 0);
      
      // Get VAT rate from the first item or default to 0
      const vatRate = Number(quotation.items?.[0]?.vat) || 0;
      
      // Calculate VAT on the subtotal
      const vatTotal = (subtotal * vatRate) / 100;
      
      // Calculate grand total
      const grandTotal = subtotal + vatTotal;
      
      return {
        subtotal: subtotal || 0,
        vatTotal: vatTotal || 0,
        grandTotal: grandTotal || 0,
        vatRate: vatRate || 0
      };
    } catch (error) {
      console.error('Error calculating totals:', error);
      return { subtotal: 0, vatTotal: 0, grandTotal: 0, vatRate: 0 };
    }
  };
  
  const { subtotal, vatTotal, grandTotal, vatRate } = calculateTotals();
  
  // Reference to the content we want to print/download
  // contentRef is already defined at the top of the component

  // Add a style element to hide markup column when printing
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'print-styles';
    style.innerHTML = `
      @media print {
        @page {
          size: A4;
          margin: 10mm;
        }
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .hide-for-print {
          display: none !important;
        }
        .print-break-inside-avoid {
          break-inside: avoid;
        }
        .print-container {
          width: 210mm;
          min-height: 297mm;
          padding: 10mm;
          margin: 0 auto;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const styleElement = document.getElementById('print-styles');
      if (styleElement) styleElement.remove();
    };
  }, []);

  // Handle printing the quotation
  const handlePrint = async () => {
    try {
      toast.info('Preparing document for printing...');
      if (!contentRef.current) {
        toast.error('Content not available for printing');
        return;
      }

      // Create a clone of the content without affecting the original
      const content = contentRef.current.cloneNode(true) as HTMLElement;

      // Hide markup column in the clone
      content.querySelectorAll('.markup-column').forEach(cell => {
        cell.classList.add('hide-for-print');
      });

      // Create a temporary container with appropriate A4 dimensions
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '210mm';
      tempDiv.appendChild(content);
      document.body.appendChild(tempDiv);

      // Use html2canvas with same settings as download to ensure consistency
      const canvas = await html2canvas(content, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: '#ffffff',
        windowWidth: content.scrollWidth,
        windowHeight: content.scrollHeight
      });

      // Clean up
      document.body.removeChild(tempDiv);

      // Create a print window with the canvas image embedded
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Could not open print window. Please allow popups and try again.');
        return;
      }

      // Create a document that will look exactly like the preview
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${safeQuotationNumber}</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background-color: white;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            img {
              width: 100%;
              height: auto;
              display: block;
              margin: 0 auto;
              page-break-inside: avoid;
            }
            .page-break {
              page-break-after: always;
              break-after: page;
            }
          </style>
        </head>
        <body>
          <img src="${canvas.toDataURL('image/png')}" />
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 300);
            }
          </script>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      toast.success('Print dialog opened');
    } catch (error) {
      console.error('Error preparing print:', error);
      toast.error('Failed to prepare document for printing. Please try again.');
    }
  };

  const handleDownload = async () => {
    try {
      if (!contentRef.current) {
        toast.error('Content not available for download');
        return;
      }

      toast.info('Preparing PDF for download...', { duration: 3000 });
      
      // Create a clone of the content to modify for PDF
      const content = contentRef.current.cloneNode(true) as HTMLElement;
      
      // Hide markup column in the cloned content
      const markupCells = content.querySelectorAll('.markup-column');
      markupCells.forEach(cell => {
        cell.classList.add('hide-for-print');
      });
      
      // Temporarily append the clone to the document with fixed dimensions for proper rendering
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.appendChild(content);
      document.body.appendChild(tempDiv);
      
      // Use html2canvas to capture the content
      const canvas = await html2canvas(content, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Allow loading cross-origin images
        allowTaint: true,
        logging: false,
        windowWidth: 210 * 3.78, // A4 width in pixels (210mm)
        windowHeight: 297 * 3.78, // A4 height in pixels (297mm)
      });
      
      // Remove the temporary div
      document.body.removeChild(tempDiv);
      
      // Calculate dimensions for A4 PDF
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF with A4 dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add the canvas image to the PDF
      const imgData = canvas.toDataURL('image/png');
      
      // If content is taller than A4, split it across multiple pages
      let heightLeft = imgHeight;
      let position = 0;
      const pageHeight = 297; // A4 height in mm
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save the PDF
      pdf.save(`${safeQuotationNumber}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-business">
        <DialogHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 pb-4 border-b">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent font-sf-pro">
            Quotation Preview
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="font-sf-pro rounded-xl"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="font-sf-pro rounded-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="p-2 rounded-full hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>
        
        {/* A4 Preview Content */}
        <div 
          id="quotation-preview-content" 
          ref={contentRef}
          className="p-8 bg-white font-sf-pro"
          style={{ width: '100%', maxWidth: '210mm', margin: '0 auto' }}
        >
          {/* Header Section with Company Logo and Quotation Number */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              {companyAssets['Logo']?.dataUrl ? (
                <img 
                  src={companyAssets['Logo'].dataUrl} 
                  alt="Company Logo" 
                  className="h-24 max-w-full object-contain mb-4"
                  style={{ maxHeight: '60px' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'h-24 w-48 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 mb-4';
                    fallback.textContent = 'Company Logo';
                    e.currentTarget.parentNode?.insertBefore(fallback, e.currentTarget.nextSibling);
                  }}
                />
              ) : (
                <div className="h-24 w-48 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 mb-4">
                  Company Logo
                </div>
              )}
              <h1 className="text-2xl font-bold">{companyData.name || 'Your Company Name'}</h1>
              
              {/* Company Address */}
              <div className="text-sm text-gray-600 space-y-1">
                {companyData.addressLine1 && <div>{companyData.addressLine1}</div>}
                {companyData.addressLine2 && <div>{companyData.addressLine2}</div>}
                {companyData.addressLine3 && <div>{companyData.addressLine3}</div>}
                {companyData.addressLine4 && <div>{companyData.addressLine4}</div>}
              </div>
              
              {/* Contact Information */}
              <div className="mt-2 space-y-1">
                {companyData.email && (
                  <div className="text-sm text-gray-600">{companyData.email}</div>
                )}
                {companyData.phone && (
                  <div className="text-sm text-gray-600">{companyData.phone}</div>
                )}
                {companyData.website && !companyData.websiteNotApplicable && (
                  <div className="text-sm text-blue-600">
                    <a 
                      href={companyData.website.startsWith('http') ? companyData.website : `https://${companyData.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {companyData.website}
                    </a>
                  </div>
                )}
                {companyData.regNumber && (
                  <div className="text-xs text-gray-500 mt-1">
                    Reg: {companyData.regNumber}
                  </div>
                )}
                {companyData.vatNumber && !companyData.vatNumberNotApplicable && (
                  <div className="text-xs text-gray-500">
                    VAT: {companyData.vatNumber}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <h1 className="text-2xl font-bold text-mokm-purple-600 mb-2">Quotation</h1>
              <p className="text-lg font-semibold">#{safeQuotationNumber}</p>
              <p className="text-sm text-slate-600">Date: {quotation.date || new Date().toLocaleDateString()}</p>
              {quotation.reference && (
                <p className="text-sm text-slate-600">Reference: {quotation.reference}</p>
              )}
              {company.vatNumber && (
                <p className="text-sm text-slate-600">VAT Number: {company.vatNumber}</p>
              )}
              {company.regNumber && (
                <p className="text-sm text-slate-600">Reg Number: {company.regNumber}</p>
              )}
            </div>
          </div>
          
          {/* Client Information Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-2 pb-1 border-b">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-sm text-slate-600 mb-1">Bill To:</h3>
                <p className="font-bold">{quotation.clientInfo?.companyName || 'Client Company'}</p>
                <p>{quotation.clientInfo?.contactPerson || ''}</p>
                <p>{quotation.clientInfo?.email || ''}</p>
                <p>{quotation.clientInfo?.phone || ''}</p>
                <p className="whitespace-pre-line">{quotation.clientInfo?.billingAddress || 'Client Billing Address'}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-slate-600 mb-1">Ship To:</h3>
                {selectedClient ? (
                  <div className="text-sm">
                    <p className="font-semibold">{selectedClient.companyName || 'Client Company'}</p>
                    
                    {/* Show contact person name */}
                    {[selectedClient.firstName, selectedClient.lastName]
                      .filter(Boolean)
                      .join(' ') && (
                      <p>
                        {[selectedClient.firstName, selectedClient.lastName]
                          .filter(Boolean)
                          .join(' ')}
                      </p>
                    )}
                    
                    {/* Display shipping address */}
                    <div>
                      {(() => {
                        // Try to parse the shipping address if it's a semicolon-separated string
                        const parseAddress = (address: string) => {
                          const parts = address.split(';').map(part => part.trim()).filter(Boolean);
                          return {
                            line1: parts[0] || '',
                            line2: parts.slice(1, -1).join(', '),
                            country: parts[parts.length - 1] || ''
                          };
                        };

                        const shippingAddress = selectedClient.shippingAddress || '';
                        
                        if (shippingAddress) {
                          const parsedAddress = parseAddress(shippingAddress);
                          return (
                            <div>
                              <p>{parsedAddress.line1}</p>
                              {parsedAddress.line2 && <p>{parsedAddress.line2}</p>}
                              {parsedAddress.country && <p>{parsedAddress.country}</p>}
                            </div>
                          );
                        } else if (selectedClient.shippingStreet) {
                          // If we have individual shipping address fields, format them
                          return (
                            <div>
                              <p>{selectedClient.shippingStreet}</p>
                              <p>
                                {[
                                  selectedClient.shippingCity,
                                  selectedClient.shippingState,
                                  selectedClient.shippingPostal
                                ]
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                              {selectedClient.shippingCountry && <p>{selectedClient.shippingCountry}</p>}
                            </div>
                          );
                        } else if (selectedClient.sameAsBilling && selectedClient.billingAddress) {
                          // If shipping is same as billing, use billing address
                          const parsedBilling = parseAddress(selectedClient.billingAddress);
                          return (
                            <div>
                              <p>{parsedBilling.line1}</p>
                              {parsedBilling.line2 && <p>{parsedBilling.line2}</p>}
                              {parsedBilling.country && <p>{parsedBilling.country}</p>}
                              <p className="text-xs text-slate-500 italic">(Same as billing address)</p>
                            </div>
                          );
                        } else {
                          return <p className="text-slate-600">No shipping address available</p>;
                        }
                      })()}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No shipping address found</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Items Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="py-2 px-4 text-left text-sm font-semibold text-slate-700 border-b border-slate-200">Item No.</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-slate-700 border-b border-slate-200">Description</th>
                  <th className="py-2 px-4 text-right text-sm font-semibold text-slate-700 border-b border-slate-200">Qty</th>
                  <th className="py-2 px-4 text-right text-sm font-semibold text-slate-700 border-b border-slate-200">Rate</th>
                  <th className="py-2 px-4 text-right text-sm font-semibold text-slate-700 border-b border-slate-200">Discount</th>
                  <th className="py-2 px-4 text-right text-sm font-semibold text-slate-700 border-b border-slate-200">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(quotation.items || []).map((item, index) => {
                  const vatRate = Number(item.vat) || 0;
                  return (
                    <tr key={item.id || index} className="border-b border-slate-100">
                      <td className="py-3 px-4 text-sm text-slate-700">{index + 1}</td>
                      <td className="py-3 px-4 text-sm text-slate-700">{item.description || ''}</td>
                      <td className="py-3 px-4 text-sm text-slate-700 text-right">{item.quantity || 0}</td>
                      <td className="py-3 px-4 text-sm text-slate-700 text-right">{formatCurrency(item.rate)}</td>
                      <td className="py-3 px-4 text-sm text-slate-700 text-right">
                        {formatCurrency(item.discount || 0)}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-700 text-right">{formatCurrency(item.amount)}</td>
                    </tr>
                  );
                })}
                {(!quotation.items || quotation.items.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-500">No items added to this quotation</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Totals Section */}
          <div className="flex justify-end mb-8">
            <div className="w-64 border-t border-slate-200 pt-4">
              <div className="flex justify-between py-1">
                <span className="text-sm text-slate-600">Subtotal:</span>
                <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-sm text-slate-600">
                  VAT ({vatRate.toFixed(2)}%):
                </span>
                <span className="text-sm font-medium">{formatCurrency(vatTotal)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-slate-200 mt-2">
                <span className="text-base font-bold text-mokm-purple-600">Total (ZAR):</span>
                <span className="text-base font-bold text-mokm-purple-600">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
          
          {/* Terms and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-bold text-slate-700 mb-2">Terms & Conditions</h3>
              <p className="text-sm text-slate-600 whitespace-pre-line">
                {quotation.termsAndConditions || 'Standard terms and conditions apply.'}
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-700 mb-2">Notes</h3>
              <p className="text-sm text-slate-600 whitespace-pre-line">
                {quotation.notes || 'Thank you for your business.'}
              </p>
            </div>
          </div>
          
          {(bankDetails.bankName || bankDetails.bankAccount) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Banking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Bank Name</p>
                  <p className="text-gray-600">{bankDetails.bankName || '—'}</p>
                </div>
                <div>
                  <p className="font-medium">Account Holder</p>
                  <p className="text-gray-600">{bankDetails.accountHolder || '—'}</p>
                </div>
                <div>
                  <p className="font-medium">Account Number</p>
                  <p className="text-gray-600">{bankDetails.bankAccount || '—'}</p>
                </div>
                <div>
                  <p className="font-medium">Account Type</p>
                  <p className="text-gray-600">{bankDetails.accountType || '—'}</p>
                </div>
                <div>
                  <p className="font-medium">Branch Code</p>
                  <p className="text-gray-600">{bankDetails.branchCode || '—'}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Stamp and Signature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <div className="flex flex-col items-center">
              <p className="text-sm font-semibold text-slate-700 mb-2">Company Stamp</p>
              {companyAssets['Stamp']?.dataUrl ? (
                <div className="h-20 w-20 flex items-center justify-center bg-white p-2 rounded-md border border-slate-200">
                  <img 
                    src={companyAssets['Stamp'].dataUrl} 
                    alt="Company Stamp" 
                    className="max-h-full max-w-full object-contain"
                    style={{ maxWidth: '80px', maxHeight: '80px' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'h-20 w-20 border border-dashed border-slate-300 rounded-md flex items-center justify-center text-slate-400 text-xs';
                      fallback.textContent = 'Stamp';
                      e.currentTarget.parentNode?.insertBefore(fallback, e.currentTarget.nextSibling);
                    }}
                  />
                </div>
              ) : (
                <div className="h-20 w-20 border border-dashed border-slate-300 rounded-md flex items-center justify-center text-slate-400 text-xs">
                  Stamp
                </div>
              )}
            </div>
            <div className="flex flex-col items-center">
              <p className="text-sm font-semibold text-slate-700 mb-2">Authorized Signature</p>
              {companyAssets['Signature']?.dataUrl ? (
                <div className="h-24 w-48 flex items-center justify-center bg-white p-2 rounded-md border border-slate-200">
                  <img 
                    src={companyAssets['Signature'].dataUrl} 
                    alt="Authorized Signature" 
                    className="max-h-full max-w-full object-contain"
                    style={{ maxWidth: '150px' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'h-24 w-48 border border-dashed border-slate-300 rounded-md flex items-center justify-center text-slate-400 text-xs';
                      fallback.textContent = 'Signature';
                      e.currentTarget.parentNode?.insertBefore(fallback, e.currentTarget.nextSibling);
                    }}
                  />
                </div>
              ) : (
                <div className="h-24 w-48 border border-dashed border-slate-300 rounded-md flex items-center justify-center text-slate-400 text-xs">
                  Signature
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationPreviewModal;
