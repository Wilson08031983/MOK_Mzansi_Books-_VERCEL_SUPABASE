import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Quotation } from '@/types/quotation';
import EmailService from '@/emails/services/EmailService';

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
    to: quotation.client?.email || '',
    subject: `Quotation #${quotation.quotationNumber} from ${companyName}`,
    message: `Dear ${quotation.client?.name || 'Valued Customer'},\n\nPlease find attached your quotation #${quotation.quotationNumber} from ${companyName}.\n\nThis quotation is valid until: ${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('en-ZA') : '30 days from today'}\n\nTotal Amount: ${quotation.currency || 'R'} ${quotation.total?.toFixed(2) || '0.00'}\n\nShould you have any questions or require any clarification, please don't hesitate to contact us.\n\nWe look forward to your business!\n\nBest regards,\n${companyName}`,
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
      // Format quotation items for the email template
      const items = quotation.items?.map(item => ({
        description: item.description || 'No description',
        quantity: item.quantity || 1,
        unitPrice: `${quotation.currency || 'R'} ${(item.unitPrice || 0).toFixed(2)}`,
        amount: `${quotation.currency || 'R'} ${((item.quantity || 1) * (item.unitPrice || 0)).toFixed(2)}`,
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

      // For local development, we'll use a placeholder link
      const quotationLink = `${window.location.origin}/quotations/${quotation.id}`;

      // Send the email using our EmailService
      const success = await EmailService.sendQuotationEmail(
        emailData.to,
        quotation.client?.name || 'Valued Customer',
        quotation.quotationNumber || '',
        formatDate(quotation.quotationDate) || 'N/A',
        formatDate(quotation.validUntil) || '30 days from date of issue',
        `${quotation.currency || 'R'} ${quotation.total?.toFixed(2) || '0.00'}`,
        quotationLink,
        companyName,
        companyEmail,
        items,
        `${quotation.currency || 'R'} ${quotation.subtotal?.toFixed(2) || '0.00'}`,
        `${quotation.currency || 'R'} ${(quotation.taxAmount || 0).toFixed(2)}`,
        `${quotation.currency || 'R'} ${quotation.total?.toFixed(2) || '0.00'}`,
        emailData.message
      );

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
            Send this quotation to {quotation.client?.name || 'the client'} via email.
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
