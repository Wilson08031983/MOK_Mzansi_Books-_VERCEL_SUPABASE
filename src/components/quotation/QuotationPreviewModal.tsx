import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Printer } from 'lucide-react';

// Define interface types needed for the component
interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  markup?: number; // Will be hidden in the display
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
  // Include other fields that might exist
  [key: string]: unknown;
}

export interface QuotationData {
  id?: string;
  quotationNumber?: string;
  date: string;
  reference?: string;
  clientId?: string;
  clientInfo?: {
    companyName: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    billingAddress?: string;
    shippingAddress?: string;
  };
  items: QuotationItem[];
  subtotal?: number;
  vatTotal?: number;
  grandTotal?: number;
  termsAndConditions?: string;
  notes?: string;
}

export interface CompanyAssets {
  name?: string;
  logoUrl?: string;
  stampUrl?: string;
  signatureUrl?: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  vatNumber?: string;
  regNumber?: string;
}

interface QuotationPreviewModalProps {
  open: boolean;
  onClose: () => void;
  quotation: QuotationData;
  company: CompanyAssets;
}

// Interface for company data from localStorage
interface CompanyData {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  websiteNotApplicable?: boolean;
  regNumber?: string;
  vatNumber?: string;
  vatNumberNotApplicable?: boolean;
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
  const [companyData, setCompanyData] = useState<CompanyData>({});
  const [bankDetails, setBankDetails] = useState<Partial<CompanyData>>({});
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
  const calculateTotals = (): { subtotal: number; vatTotal: number; grandTotal: number } => {
    try {
      let subtotal = 0;
      let vatTotal = 0;
      
      // Safely calculate totals from items
      (quotation.items || []).forEach(item => {
        const itemAmount = Number(item.amount) || 0;
        subtotal += itemAmount;
        
        // Calculate VAT if present (default 0%)
        const vatRate = Number(item.vat) || 0;
        vatTotal += (itemAmount * vatRate) / 100;
      });
      
      const grandTotal = subtotal + vatTotal;
      
      return {
        subtotal: subtotal || 0,
        vatTotal: vatTotal || 0,
        grandTotal: grandTotal || 0
      };
    } catch (error) {
      console.error('Error calculating totals:', error);
      return { subtotal: 0, vatTotal: 0, grandTotal: 0 };
    }
  };
  
  const { subtotal, vatTotal, grandTotal } = calculateTotals();
  
  // Generate current year and quotation number if not provided
  const currentYear = new Date().getFullYear();
  const safeQuotationNumber = quotation.quotationNumber || `QUO-${currentYear}-001`;
  
  // Handle printing the quotation
  const handlePrint = () => {
    try {
      const printContent = document.getElementById('quotation-preview-content');
      if (!printContent) return;
      
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      
      // Re-add event listeners that were lost during printing
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Error printing quotation:', error);
    }
  };
  
  const handleDownload = () => {
    // This will be implemented later with jspdf or html2canvas
    console.log('Download functionality to be implemented');
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
                      {/* Check for different shipping address formats */}
                      {selectedClient.shippingAddress ? (
                        // If we have a pre-formatted shipping address string, use it
                        <p className="whitespace-pre-line">{selectedClient.shippingAddress}</p>
                      ) : selectedClient.shippingStreet ? (
                        // If we have individual shipping address fields, format them
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
                      ) : selectedClient.sameAsBilling && selectedClient.billingAddress ? (
                        // If shipping is same as billing, use billing address
                        <div>
                          <p className="whitespace-pre-line">{selectedClient.billingAddress}</p>
                          <p className="text-xs text-slate-500 italic">(Same as billing address)</p>
                        </div>
                      ) : (
                        <p className="text-slate-600">No shipping address available</p>
                      )}
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
                  <th className="py-2 px-4 text-right text-sm font-semibold text-slate-700 border-b border-slate-200">VAT</th>
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
                        {item.discount ? `${item.discount}%` : '0%'}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-700 text-right">{vatRate}%</td>
                      <td className="py-3 px-4 text-sm text-slate-700 text-right">{formatCurrency(item.amount)}</td>
                    </tr>
                  );
                })}
                {(!quotation.items || quotation.items.length === 0) && (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-slate-500">No items added to this quotation</td>
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
                <span className="text-sm text-slate-600">VAT (0%):</span>
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
