
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Invoice } from '@/types/invoice';

interface PaymentData {
  id?: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  clientId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
  notes: string;
  createdAt: string;
}

// Local form state type with amount that can be number or empty string
interface PaymentFormData extends Omit<PaymentData, 'id' | 'createdAt' | 'amount'> {
  amount: number | '';
}

interface FormErrors {
  amount?: string;
  paymentDate?: string;
  paymentMethod?: string;
}

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'eft', label: 'EFT' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'other', label: 'Other' }
];

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSuccess?: (paymentData: PaymentData) => void;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  invoice,
  onSuccess 
}) => {
    const [paymentData, setPaymentData] = useState<PaymentFormData>({  
    invoiceId: invoice?.id || '',
    invoiceNumber: invoice?.number || '',
    clientName: invoice?.clientName || '',
    clientId: invoice?.clientId || '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    reference: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Update payment data if invoice changes
  useEffect(() => {
    if (invoice) {
      setPaymentData(prev => ({
        ...prev,
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        clientName: invoice.clientName,
        clientId: invoice.clientId,
        // Don't set the amount automatically - let user enter it
      }));
    }
  }, [invoice]);

  if (!isOpen || !invoice) return null;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate payment amount
    if (!paymentData.amount || paymentData.amount <= 0) {
      newErrors.amount = 'Payment amount is required';
    } else if (paymentData.amount > invoice.balance) {
      newErrors.amount = 'Payment amount cannot exceed the outstanding balance';
    }
    
    // Validate payment date
    if (!paymentData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }
    
    // Validate payment method
    if (!paymentData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!invoice) return;
    
    if (validateForm()) {
      try {
        // Create new payment record with amount as number
        const paymentAmount = Number(paymentData.amount);
        const newPayment: PaymentData = {
          ...paymentData,
          amount: paymentAmount, // Ensure it's a number for the final payment record
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString()
        };
      
        // Get current invoices from localStorage
        const storedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        
        // Update the invoice payment status
        const updatedInvoices = storedInvoices.map((inv: Invoice) => {
          if (inv.id === invoice.id) {
            const newPaidAmount = (inv.paidAmount || 0) + paymentAmount;
            const newBalance = Math.max(0, inv.total - newPaidAmount); // Ensure balance doesn't go below 0
            
            // Update status to 'paid' if balance is 0, 'partial' otherwise
            const newStatus = newBalance <= 0 ? 'paid' : 'partial' as const;
            
            return { 
              ...inv, 
              paidAmount: newPaidAmount, 
              balance: newBalance,
              status: newStatus, 
              updatedAt: new Date().toISOString() 
            };
          }
          return inv;
        });
        
        // Save updated invoices back to localStorage
        localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
        
        // Store payment history in localStorage
        const paymentsHistory = JSON.parse(localStorage.getItem('payments') || '[]');
        paymentsHistory.push(newPayment);
        localStorage.setItem('payments', JSON.stringify(paymentsHistory));
        
        // Dispatch custom events to notify that payments and invoices have been updated
        // This will trigger updates in other components like the Clients page
        window.dispatchEvent(new Event('payments-updated'));
        window.dispatchEvent(new Event('invoices-updated'));
        
        // Show success toast
        toast.success('Payment recorded successfully');
        
        // Call onSuccess if provided
        if (onSuccess) {
          onSuccess(newPayment);
        }
        
        onClose();
      } catch (error) {
        console.error('Error processing payment:', error);
        toast.error('Failed to process payment');
      }
    }
  };

  // Don't render if modal is not open or invoice is null
  if (!isOpen || !invoice) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-slate-900 font-sf-pro">Receive Payment</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <CardContent className="p-6 space-y-4">
          {/* Invoice Details - Read-only */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-2">
            <div className="text-sm font-medium text-slate-900 font-sf-pro">
              <span className="text-slate-500">Invoice Number:</span> {invoice.number}
            </div>
            <div className="text-sm text-slate-600 font-sf-pro">
              <span className="text-slate-500">Client Name:</span> {invoice.clientName}
            </div>
            <div className="text-sm text-slate-600 font-sf-pro">
              <span className="text-slate-500">Amount Due:</span> {invoice.currency} {invoice.balance.toLocaleString()}
            </div>
          </div>
          
          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
              Payment Amount*
            </label>
            <Input
              type="text"
              value={paymentData.amount}
              onChange={(e) => {
                // Only allow numbers and decimal point
                const value = e.target.value.replace(/[^0-9.]/g, '');
                setPaymentData({ ...paymentData, amount: value ? Number(value) : '' });
              }}
              placeholder="Enter payment amount"
              inputMode="decimal"
              className={`font-sf-pro ${errors.amount ? 'border-red-300 focus:ring-red-500' : ''}`}
            />
            {errors.amount && (
              <div className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors.amount}
              </div>
            )}
          </div>
          
          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
              Payment Date*
            </label>
            <Input
              type="date"
              value={paymentData.paymentDate}
              onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
              className={`font-sf-pro ${errors.paymentDate ? 'border-red-300 focus:ring-red-500' : ''}`}
            />
            {errors.paymentDate && (
              <div className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors.paymentDate}
              </div>
            )}
          </div>
          
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
              Payment Method*
            </label>
            <select
              value={paymentData.paymentMethod}
              onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
              className={`w-full px-3 py-2 border border-slate-200 rounded-lg font-sf-pro focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.paymentMethod ? 'border-red-300 focus:ring-red-500' : ''}`}
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
            {errors.paymentMethod && (
              <div className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors.paymentMethod}
              </div>
            )}
          </div>
          
          {/* Reference */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
              Reference/Notes
            </label>
            <Input
              value={paymentData.reference}
              onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
              placeholder="Transaction reference or payment ID"
              className="font-sf-pro"
            />
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
              Additional Notes
            </label>
            <Textarea
              value={paymentData.notes}
              onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              placeholder="Additional payment notes"
              rows={3}
              className="font-sf-pro"
            />
          </div>
        </CardContent>
        
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="font-sf-pro">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="font-sf-pro"
            variant="gradient"
          >
            Record Payment
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RecordPaymentModal;
