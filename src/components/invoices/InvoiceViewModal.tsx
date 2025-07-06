import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Invoice, InvoiceItem } from '@/types/invoice';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Download, Printer } from 'lucide-react';
// PDF imports removed for clean reimplementation
// InvoicePDFDocument import removed for clean reimplementation
import { toast } from 'sonner';
import { generateInvoicePdf } from '@/utils/invoicePdfGenerator_v2';

interface InvoiceViewModalProps {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
  getCompanyDetails: () => Record<string, string>;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'partial':
      return 'bg-blue-100 text-blue-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'sent':
      return 'bg-purple-100 text-purple-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper functions for calculations
const calculateSubtotal = (items: InvoiceItem[]): number => {
  return items.reduce((sum, item) => sum + item.amount, 0);
};

const calculateVat = (items: InvoiceItem[], vatRate: number): number => {
  const subtotal = calculateSubtotal(items);
  return subtotal * (vatRate / 100);
};

const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  invoice,
  open,
  onClose,
  getCompanyDetails,
}) => {
  if (!invoice) return null;

  const handleDownload = async () => {
    try {
      // Make sure invoice has items property
      if (!invoice.items || !Array.isArray(invoice.items)) {
        toast.error('Invoice items are missing or invalid');
        return;
      }
      
      // Generate and download the PDF
      await generateInvoicePdf(invoice);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('An error occurred while generating the PDF.');
    }
  };

  const handlePrint = () => {
    try {
      // Use the browser's built-in print functionality
      // This will print the current view of the invoice modal
      window.print();
    } catch (error) {
      console.error('Error printing invoice:', error);
      toast.error('An error occurred while preparing the invoice for printing.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>Invoice #{invoice.number}</span>
            <Badge className={getStatusColor(invoice.status)}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 py-4">
          <div>
            <h3 className="font-semibold mb-2">Client</h3>
            <p className="text-sm">{invoice.clientName}</p>
            {invoice.clientEmail && <p className="text-sm">{invoice.clientEmail}</p>}
          </div>
          
          <div className="text-right">
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Invoice Details</h3>
              <p className="text-sm">Date: {formatDate(invoice.date)}</p>
              <p className="text-sm">Due Date: {formatDate(invoice.dueDate)}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Amount</h3>
              <p className="text-xl font-bold">{formatCurrency(invoice.total)}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Rate</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">{item.description}</td>
                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.rate)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="font-medium">
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-right">Subtotal:</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(calculateSubtotal(invoice.items))}</td>
                </tr>
                {invoice.vatRate > 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right">VAT ({invoice.vatRate}%):</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(calculateVat(invoice.items, invoice.vatRate))}</td>
                  </tr>
                )}
                <tr className="font-bold">
                  <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(invoice.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        {invoice.notes && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceViewModal;
