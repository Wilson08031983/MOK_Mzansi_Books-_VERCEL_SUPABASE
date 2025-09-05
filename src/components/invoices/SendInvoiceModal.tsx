import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Invoice, Client } from '@/types/invoice';

interface SendInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  companyName: string;
  companyEmail: string;
  onSuccess?: () => void;
}

const SendInvoiceModal: React.FC<SendInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  companyName,
  companyEmail,
  onSuccess,
}) => {
  const [isSending, setIsSending] = useState(false);
  // Helper function to get client email, handling both string and Client object cases
  const getClientEmail = () => {
    if (!invoice.client) return '';
    if (typeof invoice.client === 'string') return invoice.clientEmail || '';
    return invoice.client.email || '';
  };

  // Helper function to get client name, handling both string and Client object cases
  const getClientName = () => {
    if (!invoice.client) return 'Valued Customer';
    if (typeof invoice.client === 'string') return invoice.clientName || 'Valued Customer';
    return invoice.client.name || 'Valued Customer';
  };

  const [emailData, setEmailData] = useState({
    to: getClientEmail(),
    subject: `Invoice #${invoice.number} from ${companyName}`,
    message: `Dear ${getClientName()},\n\nPlease find attached your invoice #${invoice.number} for ${companyName}.\n\nDue date: ${invoice.dueDate || 'Upon receipt'}\nAmount due: ${invoice.currency || 'R'} ${invoice.total?.toFixed(2) || '0.00'}\n\nThank you for your business!\n\nBest regards,\n${companyName}`,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendInvoice = async () => {
    if (!emailData.to) {
      toast.error('Recipient email is required');
      return;
    }
    
    setIsSending(true);

    try {
      // Format invoice items for the email template
      const items = invoice.items?.map(item => ({
        description: item.description || 'No description',
        quantity: item.quantity || 1,
        unitPrice: `${invoice.currency || 'R'} ${(item.unitPrice || 0).toFixed(2)}`,
        amount: `${invoice.currency || 'R'} ${((item.quantity || 1) * (item.unitPrice || 0)).toFixed(2)}`,
      })) || [];

      // Format dates
      const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-ZA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      };
      
      // Generate invoice link
      const invoiceLink = `${window.location.origin}/invoices/view/${invoice.id}`;

      // Call secure server route to send invoice email
      const response = await fetch('/api/emails/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailData.to,
          clientName: getClientName(),
          invoiceNumber: invoice.number,
          invoiceDate: formatDate(invoice.date),
          dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : 'Upon receipt',
          amountDue: `${invoice.currency || 'R'} ${invoice.total?.toFixed(2) || '0.00'}`,
          invoiceLink,
          companyName,
          items,
          subtotal: `${invoice.currency || 'R'} ${invoice.subtotal?.toFixed(2) || '0.00'}`,
          tax: `${invoice.currency || 'R'} ${(invoice.vatTotal || 0).toFixed(2)}`,
          total: `${invoice.currency || 'R'} ${invoice.total?.toFixed(2) || '0.00'}`,
          notes: emailData.message,
        }),
      });

      if (response.ok) {
        toast.success('Invoice sent successfully!');
        onSuccess?.();
        onClose();
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data.message || 'Failed to send invoice. Please try again.');
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('An error occurred while sending the invoice.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Invoice #{invoice.number}</DialogTitle>
          <DialogDescription>
            Send this invoice to {getClientName()} via email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              name="to"
              type="email"
              value={emailData.to}
              onChange={handleInputChange}
              placeholder="client@example.com"
              disabled={isSending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              name="subject"
              value={emailData.subject}
              onChange={handleInputChange}
              disabled={isSending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              value={emailData.message}
              onChange={handleInputChange}
              rows={8}
              disabled={isSending}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              The invoice will be attached as a PDF.
            </p>
          </div>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Sending to: <span className="font-medium">{getClientName()}</span> (
                <a href={`mailto:${emailData.to}`} className="text-primary hover:underline">
                  {emailData.to}
                </a>
              )
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Invoice: <span className="font-medium">#{invoice.number}</span>
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-md">
            <h4 className="font-medium mb-2">Invoice Preview</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="text-muted-foreground">Invoice #:</div>
              <div>{invoice.number}</div>
              
              <div className="text-muted-foreground">Date:</div>
              <div>{new Date(invoice.date || '').toLocaleDateString('en-ZA')}</div>
              
              <div className="text-muted-foreground">Due Date:</div>
              <div>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-ZA') : 'Upon Receipt'}</div>
              
              <div className="text-muted-foreground">Amount Due:</div>
              <div className="font-medium">
                {invoice.currency || 'R'} {invoice.total?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleSendInvoice} disabled={isSending || !emailData.to}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Invoice
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendInvoiceModal;
