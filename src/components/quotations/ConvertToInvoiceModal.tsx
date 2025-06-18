
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Save, 
  Calendar,
  AlertCircle,
  Loader2,
  FileText,
  CreditCard
} from 'lucide-react';

interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  taxRate: number;
  discount: number;
  amount: number;
}

interface Quotation {
  id: string;
  number: string;
  client: string;
  clientId: string;
  date: string;
  expiryDate: string;
  amount: number;
  status: string;
  items: QuotationItem[];
  terms?: string;
  notes?: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
}

interface ConvertToInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
}

const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${randomNum}`;
};

const getCurrentDate = (): string => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

const getDueDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
};

const ConvertToInvoiceModal: React.FC<ConvertToInvoiceModalProps> = ({
  isOpen,
  onClose,
  quotation
}) => {
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [issueDate, setIssueDate] = useState(getCurrentDate());
  const [dueDate, setDueDate] = useState(getDueDate());
  const [terms, setTerms] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (quotation) {
      setTerms(quotation.terms || 'Payment due within 30 days. Bank details will be provided on the invoice.');
      setNotes(quotation.notes || '');
    }
  }, [quotation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quotation) return;

    if (!invoiceNumber || !issueDate || !dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (quotation.status !== 'accepted') {
      setError('Only accepted quotations can be converted to invoices');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call to create invoice
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Converting quotation to invoice:', {
        quotationId: quotation.id,
        invoiceNumber,
        issueDate,
        dueDate,
        paymentMethod,
        terms,
        notes,
        items: quotation.items,
        total: quotation.totalAmount
      });

      // Show success message
      alert(`Invoice ${invoiceNumber} created successfully!`);
      onClose();
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError('Failed to create invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!quotation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 font-sf-pro">
            Convert to Invoice
          </DialogTitle>
          <p className="text-slate-600 font-sf-pro">
            Create a new invoice from Quotation {quotation.number}
          </p>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start border border-red-200">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span className="font-sf-pro">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Details */}
          <div className="glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 font-sf-pro mb-4">Invoice Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber" className="font-sf-pro">Invoice Number *</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                  className="font-sf-pro"
                  placeholder="INV-2025-0001"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quotationNumber" className="font-sf-pro">From Quotation</Label>
                <Input
                  id="quotationNumber"
                  value={quotation.number}
                  readOnly
                  className="bg-slate-50 font-sf-pro"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientName" className="font-sf-pro">Client</Label>
                <Input
                  id="clientName"
                  value={quotation.client}
                  readOnly
                  className="bg-slate-50 font-sf-pro"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="issueDate" className="font-sf-pro">Issue Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="issueDate"
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    required
                    className="pl-10 font-sf-pro"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="font-sf-pro">Due Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="pl-10 font-sf-pro"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="font-sf-pro">Payment Method</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="paypal">PayPal</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Invoice Items */}
          <div className="glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900 font-sf-pro">Invoice Items</h3>
              <div className="text-sm text-slate-500 font-sf-pro">
                Items from Quotation {quotation.number}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                      Tax
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {quotation.items.map((item) => {
                    const itemSubtotal = item.quantity * item.rate;
                    const itemDiscount = item.discount;
                    const itemTax = ((itemSubtotal - itemDiscount) * item.taxRate) / 100;
                    const itemTotal = itemSubtotal - itemDiscount + itemTax;
                    
                    return (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 font-sf-pro">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-sf-pro">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right font-sf-pro">
                          R {item.rate.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right font-sf-pro">
                          R {item.discount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right font-sf-pro">
                          R {itemTax.toLocaleString()} ({item.taxRate}%)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 text-right font-sf-pro">
                          R {itemTotal.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 border-t border-slate-200 pt-4">
              <div className="flex justify-end">
                <div className="w-full md:w-64">
                  <div className="flex justify-between py-2 font-sf-pro">
                    <span className="text-slate-600">Subtotal:</span>
                    <span>R {quotation.subtotal.toLocaleString()}</span>
                  </div>
                  {quotation.discount > 0 && (
                    <div className="flex justify-between py-2 text-slate-600 font-sf-pro">
                      <span>Discount:</span>
                      <span>- R {quotation.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 text-slate-600 font-sf-pro">
                    <span>Tax:</span>
                    <span>R {quotation.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-lg border-t border-slate-200 mt-2 pt-2 font-sf-pro">
                    <span>Total:</span>
                    <span>R {quotation.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Terms and Notes */}
          <div className="glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 font-sf-pro mb-4">Additional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="terms" className="font-sf-pro">Terms and Conditions</Label>
                <Textarea
                  id="terms"
                  rows={4}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="font-sf-pro"
                  placeholder="Payment terms, delivery conditions, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="font-sf-pro">Notes</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="font-sf-pro"
                  placeholder="Additional notes for the client..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="font-sf-pro"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white font-sf-pro"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Invoice...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Invoice
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertToInvoiceModal;
