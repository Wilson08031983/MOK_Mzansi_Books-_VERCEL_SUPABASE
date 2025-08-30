import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal,
  Edit,
  Send,
  Copy,
  Download,
  Trash2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { generateInvoicePdf } from '@/utils/invoicePdfGenerator_v2';
import { Invoice, InvoiceStatus } from '@/types/invoice';
import SendInvoiceModal from './SendInvoiceModal';

// Define a specific type for company details
interface CompanyDetails {
  name?: string;
  email?: string;
  contact?: string;
  address?: string;
  regNo?: string;
  vat?: string;
  website?: string;
  logoUrl?: string;
  stampUrl?: string;
  signatureUrl?: string;
  [key: string]: string | undefined; // For any additional fields
}

interface InvoiceActionsMenuProps {
  invoice: Invoice;
  onDelete: (invoiceId: string) => void;
  onEdit?: (invoiceId: string) => void;
  onDuplicate?: (invoice: Invoice) => void;
  getCompanyDetails: () => CompanyDetails;
}

const InvoiceActionsMenu = ({
  invoice,
  onDelete,
  onEdit,
  onDuplicate,
  getCompanyDetails
}: InvoiceActionsMenuProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(invoice.id);
    }
  };

  const handleSend = () => {
    // Open the send modal instead of sending directly
    setIsSendModalOpen(true);
  };

  const handleDuplicate = () => {
    try {
      setLoading('duplicate');
      
      // Create a duplicate invoice with new ID and invoice number
      const duplicateInvoice: Invoice = {
        ...invoice,
        id: crypto.randomUUID(),
        number: `${invoice.number.split('-')[0]}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        status: 'draft' as InvoiceStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Get current invoices from localStorage
      const storedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      
      // Add duplicate invoice
      const updatedInvoices = [...storedInvoices, duplicateInvoice];
      
      // Save back to localStorage
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      
      // Notify user
      toast.success('Invoice duplicated as draft');
      
      // Call custom handler if provided
      if (onDuplicate) {
        onDuplicate(duplicateInvoice);
      }
      // No need to reload the page, the parent component will handle the UI update
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      toast.error('An error occurred while duplicating the invoice.');
    } finally {
      setLoading(null);
    }
  };

  /**
   * FINALIZED INVOICE PDF DOWNLOAD FUNCTIONALITY - DO NOT MODIFY
   * ========================================================
   * This function handles the download of invoice PDFs and has been finalized.
   * It properly manages loading states and error handling for PDF generation.
   * 
   * Any modifications to this function may break the PDF generation functionality.
   * Last updated: July 4, 2025
   */
  const handleDownload = async () => {
    try {
      setLoading('download');
      
      // Debug: Log the invoice structure
      console.log('Invoice structure in ActionsMenu:', JSON.stringify(invoice, null, 2));
      
      // Make sure invoice has items property
      if (!invoice.items || !Array.isArray(invoice.items)) {
        toast.error('Invoice items are missing or invalid');
        setLoading(null); // Clear loading state immediately on validation error
        return;
      }
      
      // Create a complete invoice object with all required fields
      const enhancedInvoice = {
        ...invoice,
        // Ensure required fields exist
        id: invoice.id || `invoice-${Date.now()}`,
        number: invoice.number || `INV-${Date.now()}`,
        date: invoice.date || new Date().toISOString().split('T')[0],
        createdAt: invoice.createdAt || new Date().toISOString(),
        updatedAt: invoice.updatedAt || new Date().toISOString(),
        // Make sure these aliases exist
        invoiceDate: invoice.invoiceDate || invoice.date || new Date().toISOString().split('T')[0],
        dueDate: invoice.dueDate || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        total: invoice.total || invoice.amount || 0,
        amount: invoice.amount || invoice.total || 0,
        // Ensure client is properly formatted
        client: typeof invoice.client === 'string' ? invoice.client : (invoice.clientId || ''),
        clientId: invoice.clientId || (typeof invoice.client === 'object' ? invoice.client.id : 'unknown'),
        clientName: invoice.clientName || (typeof invoice.client === 'object' ? invoice.client.name : 'Unknown Client'),
        // Ensure other required fields
        terms: invoice.terms || 'Standard payment terms',
        vatRate: invoice.vatRate || 15,
        status: invoice.status || 'draft',
        currency: invoice.currency || 'ZAR',
        paidAmount: invoice.paidAmount || 0,
        balance: invoice.balance || invoice.total || invoice.amount || 0,
        reference: invoice.reference || '',
        // Ensure items have all required fields
        items: invoice.items.map(item => ({
          ...item,
          id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          itemNo: item.itemNo || 1,
          description: item.description || 'Item description',
          quantity: item.quantity || 1,
          rate: item.rate || 0,
          unitPrice: item.unitPrice || item.rate || 0,
          markupPercent: item.markupPercent || 0,
          discount: item.discount || 0,
          amount: item.amount || ((item.rate || 0) * (item.quantity || 1))
        }))
      };
      
      console.log('Enhanced invoice for PDF generation:', JSON.stringify(enhancedInvoice, null, 2));
      
      // Generate and download the PDF with enhanced invoice
      await generateInvoicePdf(enhancedInvoice);
      
      // Clear loading state after successful PDF generation
      setLoading(null);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      // Don't show duplicate error message since generateInvoicePdf already shows one
      // toast.error('An error occurred while generating the PDF.');
      
      // Ensure loading state is cleared even if there's an error
      setLoading(null);
    }
  };

  const handleDelete = () => {
    onDelete(invoice.id);
  };

  const handleSendSuccess = () => {
    // Update invoice status to 'sent' if it was in draft
    if (invoice.status === 'draft') {
      // Get current invoices from localStorage
      const storedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      
      // Update the invoice status
      const updatedInvoices = storedInvoices.map((inv: Invoice) => {
        if (inv.id === invoice.id) {
          return { ...inv, status: 'sent' as InvoiceStatus };
        }
        return inv;
      });
      
      // Save back to localStorage
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      
      // Notify parent component of the status change
      if (onEdit) {
        onEdit(invoice.id);
      }
    }
    
    // Close the modal
    setIsSendModalOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {onEdit && (
            <DropdownMenuItem onClick={handleEdit} disabled={loading === 'edit'}>
              {loading === 'edit' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Edit className="mr-2 h-4 w-4" />
              )}
              Edit
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem 
            onClick={handleSend} 
            disabled={loading === 'send'}
            className="text-blue-600 dark:text-blue-400"
          >
            {loading === 'send' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send
          </DropdownMenuItem>
          
          {onDuplicate && (
            <DropdownMenuItem 
              onClick={() => onDuplicate(invoice)} 
              disabled={loading === 'duplicate'}
            >
              {loading === 'duplicate' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              Duplicate
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem 
            onClick={() => generateInvoicePdf(invoice, getCompanyDetails())}
            disabled={loading === 'download'}
          >
            {loading === 'download' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download PDF
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => onDelete(invoice.id)} 
            disabled={loading === 'delete'}
            className="text-red-600 dark:text-red-400"
          >
            {loading === 'delete' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Send Invoice Modal */}
      <SendInvoiceModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        invoice={invoice}
        companyName={getCompanyDetails().name || 'MOK Mzansi Books'}
        companyEmail={getCompanyDetails().email || 'support@mokmzansibooks.com'}
        onSuccess={handleSendSuccess}
      />
    </>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSend} disabled={loading !== null}>
          {loading === 'send' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Send
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDuplicate} disabled={loading !== null}>
          {loading === 'duplicate' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownload} disabled={loading !== null}>
          {loading === 'download' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} disabled={loading !== null} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


export default InvoiceActionsMenu;
