import React, { useState } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { Client as BaseClient } from '@/services/clientService';
import { markQuotationAsSent } from '@/services/quotationService';
import { Quotation as ServiceQuotation, QuotationItem } from '@/services/quotationService';

// Extended Client interface with formatted addresses
interface ExtendedClient extends Client {
  billingAddress?: string;
  shippingAddress?: string;
}

// Extended ServiceQuotation interface to include additional fields
interface ExtendedQuotation extends Omit<ServiceQuotation, 'items'> {
  items: ExtendedQuotationItem[];
  dueDate?: string;
  poNumber?: string;
  validUntil?: string;
  vatTotal?: number;
  total?: number;
  clientInfo?: Record<string, unknown>;
}

// Extended QuotationItem interface with all required properties
interface ExtendedQuotationItem {
  id: string;
  description: string;
  quantity: number;
  unit?: string;
  rate: number;
  taxRate: number;
  discount: number;
  amount: number;
  vat?: number;
  markupPercent?: number;
}

// Define a complete Client interface that includes all possible fields
interface Client {
  id: string;
  // Basic info
  companyName: string;
  contactPerson?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  
  // Billing address fields
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingPostal?: string;
  billingCountry?: string;
  billingAddress?: string;
  
  // Shipping address fields
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostal?: string;
  shippingCountry?: string;
  shippingAddress?: string;
  sameAsBilling?: boolean;
}
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye, Edit, Send, FileDown, Trash2, Loader2, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { safeLocalStorage } from '@/utils/safeAccess';
import { generateInvoiceNumber, saveInvoice, createInvoice } from '@/services/invoiceService';
import { Invoice } from '@/types/invoice';

// Import the PDF generator and QuotationPreviewModal
import { generateQuotationPdf, Quotation } from '@/utils/quotationPdfGenerator';
import QuotationPreviewModal from '@/components/quotation/QuotationPreviewModal';

// Helper function to format address from client data
const formatAddress = (client: Partial<Client>, isShipping = false): string => {
  if (!client) return '';
  
  if (isShipping && client.sameAsBilling) {
    // Use billing address for shipping if sameAsBilling is true
    return formatAddress(client);
  }
  
  const addressParts = isShipping ? [
    client.shippingStreet,
    client.shippingCity,
    client.shippingState,
    client.shippingPostal,
    client.shippingCountry
  ] : [
    client.billingStreet,
    client.billingCity,
    client.billingState,
    client.billingPostal,
    client.billingCountry
  ];
  
  return addressParts.filter(Boolean).join('\n');
};

// Define the company interface to match the structure in localStorage
interface CompanyDetails {
  name?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  vatNumber?: string;
  regNumber?: string;
  bankName?: string;
  accountNumber?: string;
  branchCode?: string;
  accountType?: string;
  swiftCode?: string;
  logo?: string;
}

interface QuotationActionsMenuProps {
  quotation: Quotation;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  onRefresh?: () => void;
}

const QuotationActionsMenu: React.FC<QuotationActionsMenuProps> = ({ quotation: rawQuotation, onDelete, onEdit, onRefresh }) => {
  // Cast quotation to ExtendedQuotation to handle additional fields
  const quotation = rawQuotation as ExtendedQuotation;
  const { t } = useLocalization();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [clientData, setClientData] = useState<ExtendedClient | null>(null);
  const [companyData, setCompanyData] = useState<CompanyDetails | null>(null);

  const handleView = () => {
    // Using temporary variables to prepare data
    let tempClientData: ExtendedClient | null = null;
    let tempCompanyData: CompanyDetails = {};
    
    console.log('Starting handleView with quotation:', quotation);
    console.log('Quotation items before processing:', quotation.items);
    
    // Add debug logging for better troubleshooting
    if (!Array.isArray(quotation.items)) {
      console.warn('Quotation items is not an array:', quotation.items);
    } else if (quotation.items.length === 0) {
      console.warn('Quotation items array is empty');
    } else {
      console.log('First item in array:', quotation.items[0]);
    }
    
    // Deep log the quotation items for better debugging
    if (Array.isArray(quotation.items)) {
      quotation.items.forEach((item, index) => {
        console.log(`Item ${index} details:`, JSON.stringify(item));
      });
    } else {
      console.log('quotation.items is not an array:', typeof quotation.items);
    }
    
    try {
      // Get client data from localStorage
      const clientsString = localStorage.getItem('clients');
      if (clientsString) {
        const clients = JSON.parse(clientsString);
        console.log('Loaded clients from localStorage:', clients);
        
        // Find client by ID or name - using more direct approach
        let client = null;
        
        // First try by clientId
        if (quotation.clientId) {
          client = clients.find((c: Client) => c.id === quotation.clientId);
          console.log('Client search by ID result:', client);
        }
        
        // If not found by ID, try by client reference
        if (!client && quotation.client) {
          if (typeof quotation.client === 'string') {
            // Try by company name
            client = clients.find((c: Client) => c.companyName === quotation.client);
            console.log('Client search by company name result:', client);
            
            // If still not found, try by full name
            if (!client) {
              client = clients.find((c: Client) => 
                (c.firstName && c.lastName && `${c.firstName} ${c.lastName}`.trim() === quotation.client)
              );
              console.log('Client search by full name result:', client);
            }
          } else if (typeof quotation.client === 'object' && quotation.client !== null) {
            // Check if client object has an id property before accessing it
            const clientObj = quotation.client as Record<string, unknown>;
            if ('id' in clientObj && typeof clientObj.id === 'string') {
              client = clients.find((c: Client) => c.id === clientObj.id);
            }
            console.log('Client search by client object ID result:', client);
          }
        }
        
        console.log('Final client found:', client);
        
        if (client) {
          // Format the billing address ensuring individual fields are properly captured
          const cityState = [];
          if (client.billingCity) cityState.push(client.billingCity);
          if (client.billingState) cityState.push(client.billingState);
          
          const billingAddressParts = [
            client.billingStreet,
            cityState.join(', '),
            client.billingPostal,
            client.billingCountry
          ].filter(Boolean);
          
          const billingAddress = billingAddressParts.length > 0 
            ? billingAddressParts.join('\n') 
            : client.billingAddress || 'No billing address provided';
          
          // Format shipping address
          let shippingAddress;
          if (client.sameAsBilling) {
            shippingAddress = 'Same as billing address';
          } else {
            const shipCityState = [];
            if (client.shippingCity) shipCityState.push(client.shippingCity);
            if (client.shippingState) shipCityState.push(client.shippingState);
            
            const shippingAddressParts = [
              client.shippingStreet,
              shipCityState.join(', '),
              client.shippingPostal,
              client.shippingCountry
            ].filter(Boolean);
            
            shippingAddress = shippingAddressParts.length > 0 
              ? shippingAddressParts.join('\n') 
              : client.shippingAddress || 'No shipping address provided';
          }
          
          // Store enhanced client data in both temp variable and state
          tempClientData = {
            ...client,
            billingAddress,
            shippingAddress
          };
          
          setClientData(tempClientData);
        } else {
          console.warn('Client not found for quotation:', quotation.clientId);
          // Create minimal client data to avoid empty display
          tempClientData = {
            id: 'unknown',
            companyName: typeof quotation.client === 'string' ? quotation.client : 'Client Company',
            email: quotation.clientEmail || '',
            phone: '',
            billingStreet: '',
            billingCity: '',
            billingState: '',
            billingPostal: '',
            billingCountry: '',
            billingAddress: 'Client Billing Address',
            shippingStreet: '',
            shippingCity: '',
            shippingState: '',
            shippingPostal: '',
            shippingCountry: '',
            shippingAddress: 'Same as billing address',
            sameAsBilling: true
          } as ExtendedClient;
          
          setClientData(tempClientData);
        }
      }
      
      // Get company data from localStorage
      const companyString = localStorage.getItem('companyDetails');
      if (companyString) {
        const company = JSON.parse(companyString);
        console.log('Found company data:', company);
        tempCompanyData = company;
        setCompanyData(company);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Generic error not in translations; keep console and avoid noisy toast
    }
    setIsViewModalOpen(true);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(quotation.id);
    } else {
      // Fallback info toast left minimal to avoid hardcoded strings
      toast.info(quotation.number);
      console.log(`Edit quotation: ${quotation.id}`);
    }
  };

  const handleSend = () => {
    setIsSendDialogOpen(true);
  };

  const confirmSend = () => {
    try {
      // Mark as sent in storage
      markQuotationAsSent(quotation.id);
      
      toast.success(t('quotations.toasts.sent', { email: (quotation as ExtendedQuotation & { clientEmail?: string }).clientEmail || '' }));
      setIsSendDialogOpen(false);
      
      // Trigger parent refresh to update the UI state without full page reload
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error marking quotation as sent:', error);
      toast.error('Failed to update quotation status');
    }
  };

  /**
   * FINALIZED QUOTATION PDF DOWNLOAD FUNCTION
   * This function handles the generation and download of quotation PDFs.
   * It matches the invoice PDF download functionality in behavior and styling.
   * DO NOT MODIFY this function without creating a new version.
   */
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // Generate the PDF using the quotation data
      // Cast to Quotation type with required validUntil field
      const pdfQuotation = {
        ...quotation,
        validUntil: quotation.validUntil || quotation.dueDate || new Date().toISOString().split('T')[0]
      };
      await generateQuotationPdf(pdfQuotation as Quotation);
      
      // Success is handled by the PDF generator
    } catch (error) {
      console.error('Error generating quotation PDF:', error);
      toast.error(t('quotations.toasts.pdfFailed'));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    onDelete(quotation.id);
    toast.success(t('quotations.toasts.deleted'));
    setIsDeleteDialogOpen(false);
  };

  // Handle conversion to invoice
  const handleConvertToInvoice = async () => {
    setIsConverting(true);
    
    try {
      // Get client name from the quotation or use a fallback
      const displayClientName = typeof quotation.client === 'string' 
        ? quotation.client 
        : typeof quotation.client === 'object' && quotation.client 
          ? ((quotation.client as { name?: string }).name) || 'Unknown Client'
          : 'Unknown Client';
      
      // Calculate amounts
      const subtotal = Array.isArray(quotation.items) 
        ? quotation.items.reduce((sum, item) => sum + (item.amount || 0), 0) 
        : 0;
      
      const vatRate = 15; // Default VAT rate
      const vatAmount = subtotal * (vatRate / 100);
      const totalAmount = subtotal + vatAmount;
      
      const now = new Date().toISOString();
      const today = now.split('T')[0];

      // Create a new invoice from the quotation data
      const invoiceData = {
        // Map quotation fields to invoice fields
        client: quotation.client,
        clientId: quotation.clientId || '',
        clientName: displayClientName,
        clientEmail: (quotation as ExtendedQuotation & { clientEmail?: string }).clientEmail || '',
        date: today, // Today as invoice date
        invoiceDate: today, // Required by InvoiceInput type
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due in 30 days
        items: Array.isArray(quotation.items) ? quotation.items.map((item, index) => ({
          id: item.id || `item-${Date.now()}-${index}`,
          itemNo: index + 1,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          unitPrice: item.rate, // Map rate to unitPrice for invoice
          markupPercent: item.markupPercent || 0,
          discount: item.discount || 0,
          amount: item.amount,
          taxRate: item.taxRate || 0,
          taxAmount: 0, // Default
        })) : [],
        notes: (quotation as ExtendedQuotation & { notes?: string }).notes || '',
        terms: (quotation as ExtendedQuotation & { terms?: string }).terms || '',
        vatRate,
        amount: totalAmount,
        total: totalAmount,
        paidAmount: 0,
        balance: totalAmount,
        currency: 'ZAR',
        reference: `From quotation ${quotation.number}`,
        salesperson: (quotation as ExtendedQuotation & { salesperson?: string }).salesperson || '',
        status: 'draft' as const,
        createdAt: now,
        updatedAt: now
      };
      
      // Get a new invoice number
      const invoiceNumber = generateInvoiceNumber();
      
      // Get current invoices from localStorage to add our new invoice
      const currentInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      
      // Create the new invoice with all required fields
      const newInvoice = {
        ...invoiceData,
        id: `invoice_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        number: invoiceNumber,
      };
      
      // Ensure currentInvoices is an array
      const safeInvoices = Array.isArray(currentInvoices) ? currentInvoices : [];
      
      // Add the new invoice to the array
      safeInvoices.push(newInvoice);
      
      // Save back to localStorage
      localStorage.setItem('invoices', JSON.stringify(safeInvoices));
      
      // Show success message
      toast.success(t('quotations.toasts.convertedToInvoice'));
    } catch (error) {
      console.error('Error converting quotation to invoice:', error);
      toast.error(t('quotations.toasts.convertFailed'));
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="font-sf-pro">
          <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
            <Edit className="h-4 w-4 mr-2" />
            <span>{t('quotations.editQuotation')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSend} className="cursor-pointer">
            <Send className="h-4 w-4 mr-2" />
            <span>{t('quotations.sendQuotation')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleDownload} 
            className="cursor-pointer"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            <span>{isDownloading ? t('quotations.generatingPDF') : t('quotations.downloadQuotation')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleConvertToInvoice} 
            className="cursor-pointer"
            disabled={isConverting}
          >
            {isConverting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Receipt className="h-4 w-4 mr-2" />
            )}
            <span>{isConverting ? t('quotations.converting') : t('quotations.convertToInvoice')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 cursor-pointer"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            <span>{t('quotations.dialogs.deleteTitle')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="font-sf-pro">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('quotations.dialogs.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('quotations.dialogs.deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('quotations.dialogs.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white"
            >
              {t('quotations.dialogs.confirmDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Confirmation Dialog */}
      <AlertDialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <AlertDialogContent className="font-sf-pro">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('quotations.dialogs.sendTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('quotations.dialogs.sendDescription', { number: quotation.number, email: (quotation as ExtendedQuotation & { clientEmail?: string }).clientEmail || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('quotations.dialogs.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSend}
              className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white"
            >
              {t('quotations.dialogs.sendConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quotation Preview Modal */}
      {/* Passing quotation props to the modal with required structure */}
      <QuotationPreviewModal
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        quotation={{
          // Core properties from the quotation
          id: quotation.id,
          quotationNumber: quotation.number,
          date: quotation.date || new Date().toISOString().split('T')[0],
          clientId: quotation.clientId,
          
          // Add required properties
          reference: quotation.reference || '',
          poNumber: quotation.poNumber || '',
          subtotal: Number(quotation.subtotal) || 0,
          vatTotal: Number(quotation.vatTotal) || 0,
          grandTotal: Number(quotation.total) || 0,
          
          // Create a properly formatted client info object for the modal
          clientInfo: clientData ? {
            companyName: clientData.companyName || 'Client Company',
            contactPerson: clientData.firstName && clientData.lastName ? `${clientData.firstName} ${clientData.lastName}` : '',
            email: clientData.email || quotation.clientEmail || '',
            phone: clientData.phone || '',
            billingStreet: clientData.billingStreet || '',
            billingCity: clientData.billingCity || '',
            billingState: clientData.billingState || '',
            billingPostal: clientData.billingPostal || '',
            billingCountry: clientData.billingCountry || '',
            billingAddress: clientData.billingAddress || 'Client Billing Address',
            shippingStreet: clientData.shippingStreet || '',
            shippingCity: clientData.shippingCity || '',
            shippingState: clientData.shippingState || '',
            shippingPostal: clientData.shippingPostal || '',
            shippingCountry: clientData.shippingCountry || '',
            shippingAddress: clientData.shippingAddress || 'Same as billing address',
            sameAsBilling: clientData.sameAsBilling || false,
          } : {
            companyName: typeof quotation.client === 'string' ? quotation.client : 'Client Company',
            contactPerson: '',
            email: quotation.clientEmail || '',
            phone: '',
            billingStreet: '',
            billingCity: '',
            billingState: '',
            billingPostal: '',
            billingCountry: '',
            billingAddress: 'Client Billing Address',
            shippingStreet: '',
            shippingCity: '',
            shippingState: '',
            shippingPostal: '',
            shippingCountry: '',
            shippingAddress: 'Same as billing address',
            sameAsBilling: true,
          },
          
          // CRITICAL FIX: Process quotation items with proper structure for the modal
          // Process quotation items with proper structure for the modal
          items: Array.isArray(quotation.items) && quotation.items.length > 0 ? 
            quotation.items.map((item, index) => {
              console.log(`Processing item ${index} for modal:`, JSON.stringify(item));
              
              // Create properly formatted item objects with all required fields
              return {
                id: item.id || `item-${index}`,
                description: item.description || 'Item description',
                quantity: Number(item.quantity || 0),
                rate: Number(item.rate || 0),
                discount: Number(item.discount || 0),
                amount: Number(item.amount || 0),
                vat: Number(item.vat || 15),
                unit: item.unit || ''
              };
            }) : [],
          
          // Additional properties needed for the preview
          // Handling terms, notes, and using validUntil to satisfy interface requirements
          termsAndConditions: quotation.terms || '',
          notes: quotation.notes || '',
          validUntil: quotation.validUntil || quotation.date || new Date().toISOString().split('T')[0],
          client: quotation.client || clientData?.companyName || 'Client',
          number: quotation.number // Required by the interface
        } as unknown as Quotation}
        company={companyData || {
          name: 'MOK Mzansi Books',
          email: 'admin@mokmzansibooks.com',
          phone: '+27 11 123 4567',
          addressLine1: '123 Business Street',
          addressLine2: 'Atteridgeville',
          addressLine3: 'Pretoria',
          addressLine4: 'Gauteng, 2000',
          vatNumber: 'VAT123456789',
          regNumber: 'REG123456789',
          bankName: 'First National Bank',
          accountNumber: '12345678910',
          branchCode: '123456',
          accountType: 'Business Account',
          swiftCode: 'FIRNZAJJ'
        }}
      />
    </>
  );
};

export default QuotationActionsMenu;
