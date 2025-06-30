
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Invoice } from '@/services/invoiceService';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  invoice 
}) => {
  const [paymentData, setPaymentData] = useState({
    amount: invoice?.balance || 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    reference: '',
    notes: ''
  });

  if (!isOpen || !invoice) return null;

  const handleSubmit = () => {
    console.log('Recording payment:', paymentData);
    // Implement payment recording logic here
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-slate-900 font-sf-pro">Record Payment</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <CardContent className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-slate-900 font-sf-pro">Invoice: {invoice.number}</div>
            <div className="text-sm text-slate-600 font-sf-pro">Client: {invoice.clientName}</div>
            <div className="text-sm text-slate-600 font-sf-pro">
              Outstanding Balance: {invoice.currency} {invoice.balance.toLocaleString()}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
              Payment Amount
            </label>
            <Input
              type="number"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
              max={invoice.balance}
              className="font-sf-pro"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
              Payment Date
            </label>
            <Input
              type="date"
              value={paymentData.paymentDate}
              onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
              className="font-sf-pro"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
              Payment Method
            </label>
            <select
              value={paymentData.paymentMethod}
              onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-sf-pro focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="credit_card">Credit Card</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
              Reference
            </label>
            <Input
              value={paymentData.reference}
              onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
              placeholder="Transaction reference"
              className="font-sf-pro"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
              Notes
            </label>
            <Textarea
              value={paymentData.notes}
              onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              placeholder="Additional notes"
              rows={3}
              className="font-sf-pro"
            />
          </div>
        </CardContent>
        
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="font-sf-pro">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="font-sf-pro">
            Record Payment
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RecordPaymentModal;
