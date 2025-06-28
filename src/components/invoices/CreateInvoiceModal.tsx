
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { X, Plus, Trash2, Loader2, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { Invoice } from '@/services/invoiceService';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface LineItem {
  id: string;
  itemNo: number;
  description: string;
  quantity: string | number; // Can be string for input, number for calculations
  rate: number;
  markupPercent: number;
  discount: number;
  amount: number;
}

interface Client {
  id: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  shippingAddress?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostal?: string;
  shippingCountry?: string;
  sameAsBilling?: boolean;
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editingInvoice?: Invoice | null;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ isOpen, onClose, onSave, editingInvoice }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    clientId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    reference: '',
    notes: '',
    terms: 'Payment due within 30 days of invoice date.',
    vatRate: 15
  });

  const [items, setItems] = useState<LineItem[]>([]);
  const [nextItemNo, setNextItemNo] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);

  // Define addItem with useCallback to avoid dependency issues
  const addItem = useCallback(() => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      itemNo: nextItemNo,
      description: '',
      quantity: 1,
      rate: 0,
      markupPercent: 0,
      discount: 0,
      amount: 0
    };
    setItems(prevItems => [...prevItems, newItem]);
    setNextItemNo(prev => prev + 1);
  }, [nextItemNo]);

  // Load clients and initialize form
  useEffect(() => {
    const loadClients = () => {
      try {
        const savedClients = localStorage.getItem('clients');
        if (savedClients) {
          setClients(JSON.parse(savedClients));
        }
      } catch (error) {
        console.error('Error loading clients:', error);
        toast.error('Failed to load clients');
      }
    };

    loadClients();

    // Initialize with one empty line item if no editing invoice
    if (!editingInvoice && items.length === 0) {
      addItem();
    }
  }, [addItem, editingInvoice, items.length]);

  // Initialize form with invoice data when editing
  useEffect(() => {
    if (isInitialized || !editingInvoice) return;
    
    setFormData({
      clientId: editingInvoice.clientId,
      invoiceDate: editingInvoice.date,
      dueDate: editingInvoice.dueDate || '',
      reference: editingInvoice.reference || '',
      notes: editingInvoice.notes || '',
      terms: editingInvoice.terms || 'Payment due within 30 days of invoice date.',
      vatRate: editingInvoice.vatRate || 15
    });

    if (editingInvoice.items && editingInvoice.items.length > 0) {
      const lineItems = editingInvoice.items.map((item, index) => ({
        ...item,
        itemNo: index + 1,
        quantity: Number(item.quantity) || 0,
        rate: Number(item.rate) || 0,
        markupPercent: Number(item.markupPercent) || 0,
        discount: Number(item.discount) || 0,
        amount: Number(item.amount) || 0
      }));
      setItems(lineItems);
      setNextItemNo(lineItems.length + 1);
    } else {
      addItem();
    }
    
    setIsInitialized(true);
  }, [editingInvoice, addItem, isInitialized]);

  // Helper function to calculate totals
  const calculateTotals = useCallback((items: LineItem[], vatRate: number) => {
    const subTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const vatAmt = (subTotal * (Number(vatRate) || 0)) / 100;
    const totalAmt = subTotal + vatAmt;
    
    return {
      subtotal: parseFloat(subTotal.toFixed(2)),
      vatAmount: parseFloat(vatAmt.toFixed(2)),
      total: parseFloat(totalAmt.toFixed(2))
    };
  }, []);

  // Calculate totals
  const { subtotal, vatAmount, total } = calculateTotals(items, formData.vatRate);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Please add at least one line item');
      return;
    }
    
    if (!formData.clientId) {
      toast.error('Please select a client');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const selectedClient = clients.find(c => c.id === formData.clientId);
      const clientName = selectedClient 
        ? selectedClient.companyName || `${selectedClient.firstName} ${selectedClient.lastName}`.trim()
        : 'Unknown Client';
      
      const newInvoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
        number: editingInvoice?.number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        clientId: formData.clientId,
        client: clientName,
        date: formData.invoiceDate,
        dueDate: formData.dueDate || new Date(new Date(formData.invoiceDate).setDate(new Date(formData.invoiceDate).getDate() + 30)).toISOString().split('T')[0],
        amount: total,
        paidAmount: 0,
        balance: total,
        status: 'draft',
        currency: 'ZAR',
        vatRate: Number(formData.vatRate) || 0,
        reference: formData.reference,
        items: items.map(item => ({
          id: item.id,
          itemNo: item.itemNo,
          description: item.description,
          quantity: Number(item.quantity) || 0,
          rate: Number(item.rate) || 0,
          markupPercent: Number(item.markupPercent) || 0,
          discount: Number(item.discount) || 0,
          amount: Number(item.amount) || 0
        })),
        notes: formData.notes,
        terms: formData.terms,
        companyDetails: {
          name: 'MOKMzansi Books',
          address: '123 Business St, Johannesburg, 2000',
          phone: '+27 11 123 4567',
          email: 'invoices@mokmzansibooks.co.za',
          taxNumber: '1234567890',
          registrationNumber: '2020/123456/07'
        }
      };
      
      await onSave(newInvoice);
      toast.success(editingInvoice ? 'Invoice updated successfully' : 'Invoice created successfully');
      onClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
    } finally {
      setIsLoading(false);
    }
  }, [formData, items, clients, onSave, onClose, editingInvoice, total]);

  if (!isOpen) return null;

  const removeItem = (id: string) => {
    if (items.length <= 1) {
      toast.error('At least one line item is required');
      return;
    }
    const newItems = items.filter(item => item.id !== id);
    // Renumber items
    const renumberedItems = newItems.map((item, index) => ({
      ...item,
      itemNo: index + 1
    }));
    setItems(renumberedItems);
    setNextItemNo(renumberedItems.length + 1);
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    // Convert string numbers to numbers for numeric fields
    let processedValue: string | number = value;
    if (['quantity', 'rate', 'markupPercent', 'discount', 'amount'].includes(field)) {
      // For quantity, keep as string for the input field but store as number in state
      if (field === 'quantity') {
        processedValue = value.toString();
      } else {
        // For other numeric fields, convert to number
        processedValue = Number(value) || 0;
      }
    }
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          // Create a new item with the updated field
          const updatedItem = { ...item, [field]: processedValue };
          
          // Calculate amount when quantity, rate, markup, or discount changes
          if (['quantity', 'rate', 'markupPercent', 'discount'].includes(field)) {
            // Convert quantity to number for calculations
            const qty = Number(updatedItem.quantity) || 0;
            const rate = Number(updatedItem.rate) || 0;
            const markup = Number(updatedItem.markupPercent) || 0;
            const discount = Number(updatedItem.discount) || 0;
            
            // Calculate amount: ((rate + rate * markup/100) * qty) - discount
            const grossAmount = (rate + (rate * markup / 100)) * qty;
            updatedItem.amount = parseFloat(Math.max(0, grossAmount - discount).toFixed(2));
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-slate-900 font-sf-pro">Create New Invoice</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                Client
              </label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg font-sf-pro focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select a client</option>
                <option value="acme">ACME Corporation</option>
                <option value="tech">Tech Solutions Ltd</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                Reference/PO Number
              </label>
              <Input
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Optional reference"
                className="font-sf-pro"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                Invoice Date
              </label>
              <Input
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                className="font-sf-pro"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                Due Date
              </label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="font-sf-pro"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900 font-sf-pro">Invoice Items</h3>
              <Button onClick={addItem} size="sm" className="font-sf-pro">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            <div className="overflow-x-auto w-full">
              <table className="min-w-[1000px] w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-16 font-sf-pro">
                      Item No.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[300px] font-sf-pro">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-32 font-sf-pro">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-40 font-sf-pro">
                      Rate (R)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-32 font-sf-pro">
                      Mark Up %
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-40 font-sf-pro">
                      Discount (R)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-40 font-sf-pro">
                      Amount (R)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-16 font-sf-pro">
                      
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 font-sf-pro">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="w-full min-w-[280px] font-sf-pro"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity.toString()}
                          onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                          className="w-full text-right font-sf-pro"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                          className="w-full text-right font-sf-pro"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={item.markupPercent}
                          onChange={(e) => updateItem(item.id, 'markupPercent', Number(e.target.value))}
                          className="w-full text-right font-sf-pro"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.discount}
                          onChange={(e) => updateItem(item.id, 'discount', Number(e.target.value))}
                          className="w-full text-right font-sf-pro"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 text-right font-medium font-sf-pro">
                        {item.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        {items.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 p-1 h-8 w-8"
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
            
            <div className="mt-4 p-4 bg-slate-50 rounded-lg max-w-2xl ml-auto">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-right text-slate-600 font-sf-pro">Subtotal:</div>
                <div className="text-right font-medium font-sf-pro">R {subtotal.toFixed(2)}</div>
                
                <div className="text-right text-slate-600 font-sf-pro">VAT ({formData.vatRate}%):</div>
                <div className="text-right font-medium font-sf-pro">
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.vatRate}
                    onChange={(e) => setFormData({...formData, vatRate: Number(e.target.value)})}
                    className="w-24 inline-block text-right font-sf-pro"
                  />
                  <span className="ml-2">R {vatAmount.toFixed(2)}</span>
                </div>
                
                <div className="text-right text-lg font-semibold text-slate-900 pt-2 border-t border-slate-200 font-sf-pro">Total (ZAR):</div>
                <div className="text-right text-lg font-semibold text-slate-900 pt-2 border-t border-slate-200 font-sf-pro">
                  R {total.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Internal notes"
                rows={3}
                className="font-sf-pro"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                Terms & Conditions
              </label>
              <Textarea
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                placeholder="Payment terms and conditions"
                rows={3}
                className="font-sf-pro"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="font-sf-pro">
            Cancel
          </Button>
          <Button onClick={onClose} className="font-sf-pro">
            Create Invoice
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;
