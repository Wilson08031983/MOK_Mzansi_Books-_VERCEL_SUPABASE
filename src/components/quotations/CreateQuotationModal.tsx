
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  X,
  Plus,
  Trash2,
  Save,
  Send,
  Eye
} from 'lucide-react';

// Define the line item interface
interface LineItem {
  id: string;
  description: string;
  quantity: string | number;
  rate: string | number;
  markupPercent: string | number;
  discount: string | number;
  amount: number;
}

interface CreateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateQuotationModal: React.FC<CreateQuotationModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    expiryDate: '',
    currency: 'ZAR',
    notes: '',
    terms: ''
  });

  // Using proper typed state for line items
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { 
      id: crypto.randomUUID(), 
      description: '', 
      quantity: '', 
      rate: '', 
      markupPercent: '', 
      discount: '', 
      amount: 0 
    }
  ]);

  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  // Add a new line item
  const addItem = () => {
    setLineItems(prev => [
      ...prev, 
      { 
        id: crypto.randomUUID(), 
        description: '', 
        quantity: '', 
        rate: '', 
        markupPercent: '', 
        discount: '', 
        amount: 0 
      }
    ]);
  };

  // Remove a line item by index
  const removeItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  // Update a specific field of a line item
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate the amount when relevant fields change
          if (['quantity', 'rate', 'markupPercent', 'discount'].includes(field)) {
            // Convert string values to numbers, defaulting to 0 for empty values
            const rateNum = parseFloat(String(updatedItem.rate || 0));
            const markupPercentNum = parseFloat(String(updatedItem.markupPercent || 0));
            const quantityNum = parseFloat(String(updatedItem.quantity || 0));
            const discountNum = parseFloat(String(updatedItem.discount || 0));
            
            const markupAmount = rateNum * (markupPercentNum / 100);
            const grossAmount = (rateNum + markupAmount) * quantityNum;
            updatedItem.amount = Math.max(0, grossAmount - discountNum);
          }
          
          return updatedItem;
        }
        return item;
      });
    });
  };

  // Calculate totals whenever line items change
  useEffect(() => {
    const newSubtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const newTotal = newSubtotal; // No VAT for now as specified
    
    setSubtotal(newSubtotal);
    setTotal(newTotal);
  }, [lineItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 font-sf-pro">Create New Quotation</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-sf-pro">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client" className="font-sf-pro">Client</Label>
                  <select
                    id="client"
                    value={formData.clientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-mokm-purple-500 focus:border-mokm-purple-500 font-sf-pro"
                  >
                    <option value="">Select a client</option>
                    <option value="1">Tech Solutions Ltd</option>
                    <option value="2">Creative Agency</option>
                    <option value="3">Government Dept</option>
                    <option value="4">StartUp Inc</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="reference" className="font-sf-pro">Reference</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="e.g., PROJECT-ALPHA"
                    className="font-sf-pro"
                  />
                </div>
                <div>
                  <Label htmlFor="date" className="font-sf-pro">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="font-sf-pro"
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate" className="font-sf-pro">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="font-sf-pro"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-sf-pro">Line Items</CardTitle>
                <Button
                  onClick={addItem}
                  size="sm"
                  className="bg-mokm-purple-600 hover:bg-mokm-purple-700 text-white font-sf-pro"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Line Items Table - Traditional HTML table for better spacing */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] border-separate border-spacing-x-6 border-spacing-y-2">
                  <thead>
                    <tr className="font-semibold text-sm text-slate-600 font-sf-pro">
                      <th className="w-16 text-left pb-3">Item No.</th>
                      <th className="w-[300px] text-left pb-3">Description</th>
                      <th className="w-24 text-center pb-3">Qty</th>
                      <th className="w-32 text-center pb-3">Rate</th>
                      <th className="w-32 text-center pb-3">Mark Up %</th>
                      <th className="w-32 text-center pb-3">Discount</th>
                      <th className="w-36 text-right pb-3">Amount</th>
                      <th className="w-16 pb-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, index) => (
                      <tr key={item.id} className="border-b last:border-0">
                        {/* Item Number */}
                        <td className="py-3 align-middle">
                          <div className="bg-slate-100 h-8 w-8 rounded-full flex items-center justify-center text-slate-600 font-semibold font-sf-pro shadow-sm">
                            {index + 1}
                          </div>
                        </td>
                        
                        {/* Description */}
                        <td className="py-3 align-middle">
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            placeholder="Item description"
                            className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mokm-purple-400 font-sf-pro"
                          />
                        </td>
                        
                        {/* Quantity */}
                        <td className="py-3 align-middle">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                            min="0"
                            step="1"
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-mokm-purple-400 font-sf-pro appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield]"
                          />
                        </td>
                        
                        {/* Rate */}
                        <td className="py-3 align-middle">
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-mokm-purple-400 font-sf-pro appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield]"
                          />
                        </td>
                        
                        {/* Mark Up % */}
                        <td className="py-3 align-middle">
                          <Input
                            type="number"
                            value={item.markupPercent}
                            onChange={(e) => updateItem(item.id, 'markupPercent', e.target.value)}
                            min="0"
                            step="1"
                            className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-mokm-purple-400 font-sf-pro appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield]"
                            placeholder="0"
                          />
                        </td>
                        
                        {/* Discount */}
                        <td className="py-3 align-middle">
                          <Input
                            type="number"
                            value={item.discount}
                            onChange={(e) => updateItem(item.id, 'discount', e.target.value)}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-mokm-purple-400 font-sf-pro appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield]"
                            placeholder="0.00"
                          />
                        </td>
                        
                        {/* Amount */}
                        <td className="py-3 align-middle">
                          <div className="font-semibold text-slate-900 py-2 px-4 bg-slate-50 rounded-xl border shadow-sm text-right font-sf-pro">
                            R {item.amount.toFixed(2)}
                          </div>
                        </td>
                        
                        {/* Delete Button */}
                        <td className="py-3 align-middle text-center">
                          {lineItems.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                              title="Delete Item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-8 border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between font-sf-pro">
                      <span>Subtotal:</span>
                      <span>R {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2 font-sf-pro">
                      <span>Total (ZAR):</span>
                      <span>R {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-sf-pro">Terms & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="terms" className="font-sf-pro">Terms & Conditions</Label>
                <textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-mokm-purple-500 focus:border-mokm-purple-500 font-sf-pro"
                  placeholder="Enter terms and conditions..."
                />
              </div>
              <div>
                <Label htmlFor="notes" className="font-sf-pro">Notes</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-mokm-purple-500 focus:border-mokm-purple-500 font-sf-pro"
                  placeholder="Enter internal notes..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="font-sf-pro"
          >
            Cancel
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              className="font-sf-pro"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              className="font-sf-pro"
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button
              className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white font-sf-pro"
            >
              <Send className="h-4 w-4 mr-2" />
              Save & Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuotationModal;
