import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Quotation } from '@/types/quotation';
import { sendQuotationEmail } from '@/services/emailService';
import { generateQuotationPdf } from '@/utils/quotationPdfGenerator';

interface SendQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation;
  companyName: string;
  companyEmail: string;
  onSuccess?: () => void;
}

const SendQuotationModal: React.FC<SendQuotationModalProps> = ({
  isOpen,
  onClose,
  quotation,
  companyName,
  companyEmail,
  onSuccess,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [emailData, setEmailData] = useState({
    to: (typeof quotation.client === 'object' && quotation.client?.email) ? (quotation.client as any).email : quotation.clientEmail || '',
    subject: `Quotation #${quotation.quotationNumber} from ${companyName}`,
    message: `Dear ${(typeof quotation.client === 'object' && (quotation.client as any)?.name) || quotation.clientName || 'Valued Customer'},\n\nPlease find attached your quotation #${quotation.quotationNumber} from ${companyName}.\n\nThis quotation is valid until: ${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('en-ZA') : '30 days from today'}\n\nTotal Amount: ${quotation.currency || 'R'} ${quotation.total?.toFixed(2) || '0.00'}\n\nShould you have any questions or require any clarification, please don't hesitate to contact us.\n\nWe look forward to your business!\n\nBest regards,\n${companyName}`,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendQuotation = async () => {
    if (!emailData.to) {
      toast.error('Recipient email is required');
      return;
    }

    setIsSending(true);

    try {
      // Build a PDF-friendly quotation shape for the generator util
      const pdfQuotation = {
        id: quotation.id,
        number: quotation.quotationNumber,
        date: quotation.quotationDate || (quotation as any).date,
        validUntil: quotation.validUntil || quotation.quotationDate || new Date().toISOString().split('T')[0],
        clientId: quotation.clientId,
        clientName: quotation.clientName,
        clientEmail: quotation.clientEmail,
        client: quotation.client as any,
        items: (quotation.items || []).map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          rate: item.unitPrice,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })),
        subtotal: quotation.subtotal,
        vatRate: quotation.taxRate,
        vatTotal: quotation.taxAmount,
        total: quotation.total,
        amount: quotation.total,
        notes: quotation.notes,
        terms: quotation.terms,
        reference: (quotation as any).reference,
        status: quotation.status,
        currency: quotation.currency,
      } as any;

      // Generate PDF as Blob (without downloading)
      const result = await generateQuotationPdf(pdfQuotation, { output: 'blob' });
      const pdfBlob = result as Blob;
      if (!(pdfBlob instanceof Blob)) throw new Error('Failed to generate PDF blob');

      // Send via secure server API
      const success = await sendQuotationEmail({
        to: emailData.to,
        subject: emailData.subject,
        quotationNumber: quotation.quotationNumber,
        clientName: (typeof quotation.client === 'object' && (quotation.client as any)?.name) || quotation.clientName || 'Valued Customer',
        pdfAttachment: pdfBlob,
        pdfFileName: `Quotation-${quotation.quotationNumber}.pdf`,
      });

      if (success) {
        toast.success('Quotation sent successfully!');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error('Failed to send quotation. Please try again.');
      }
    } catch (error) {
      console.error('Error sending quotation:', error);
      toast.error('An error occurred while sending the quotation.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Quotation #{quotation.quotationNumber}</DialogTitle>
          <DialogDescription>
            Send this quotation to {(typeof quotation.client === 'object' && (quotation.client as any)?.name) || 'the client'} via email.
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
              The quotation will be attached as a PDF.
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-md">
            <h4 className="font-medium mb-2">Quotation Preview</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="text-muted-foreground">Quotation #:</div>
              <div>{quotation.quotationNumber}</div>
              
              <div className="text-muted-foreground">Date:</div>
              <div>{new Date(quotation.quotationDate || '').toLocaleDateString('en-ZA')}</div>
              
              <div className="text-muted-foreground">Valid Until:</div>
              <div>{quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('en-ZA') : '30 days from date of issue'}</div>
              
              <div className="text-muted-foreground">Total Amount:</div>
              <div className="font-medium">
                {quotation.currency || 'R'} {quotation.total?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendQuotation} 
            disabled={isSending}
            className="gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Quotation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendQuotationModal;
