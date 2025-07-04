
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { X, Plus, Trash2, Loader2, Save, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { generateInvoiceNumber } from '@/services/invoiceService';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import InvoicePreviewModal from './InvoicePreviewModal';

// Define Invoice type locally instead of importing to avoid conflicts
type Invoice = {
  id: string;
  number: string;
  clientId: string;
  date: string;
  dueDate: string;
  reference: string;
  notes: string;
  terms: string;
  vatRate: number;
  items: Array<{
    id: string;
    itemNo: number;
    description: string;
    quantity: number;
    rate: number;
    markupPercent: number;
    discount: number;
    amount: number;
  }>;
  status?: string;
  subtotal?: number;
  total?: number;
  vatAmount?: number;
};

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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
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

  // Load clients from localStorage and initialize form
  const loadClients = useCallback((): boolean => {
    try {
      const savedClients = localStorage.getItem('clients');
      if (savedClients) {
        const parsedClients = JSON.parse(savedClients);
        if (Array.isArray(parsedClients) && parsedClients.length > 0) {
          setClients(parsedClients);
          return true;
        } else {
          toast.info('No clients found. Please add clients first.');
        }
      } else {
        toast.info('No clients found. Please add clients first.');
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Failed to load clients');
    }
    return false;
  }, []);

  // Load client details when client is selected
  const handleClientSelect = useCallback((clientId: string) => {
    setFormData(prev => ({
      ...prev,
      clientId
    }));
    
    // Load client details if a client is selected
    if (clientId) {
      const selectedClient = clients.find(c => c.id === clientId);
      if (selectedClient) {
        // Auto-populate client data if needed
        console.log('Selected client:', selectedClient);
      }
    }
  }, [clients]);

  // Memoize the client options to prevent unnecessary re-renders
  const clientOptions = useMemo(() => {
    return clients.map(client => ({
      value: client.id,
      label: client.companyName || `${client.firstName} ${client.lastName}`.trim()
    }));
  }, [clients]);

  // Initialize form with useCallback to prevent recreation on every render
  const initializeForm = useCallback(async () => {
    try {
      if (!editingInvoice) {
        const newInvoiceNumber = await generateInvoiceNumber();
        setFormData(prev => ({
          ...prev,
          invoiceNumber: newInvoiceNumber
        }));
        
        // Initialize with one empty line item
        if (items.length === 0) {
          addItem();
        }
      } else {
        // Initialize form with existing invoice data
        setFormData({
          invoiceNumber: editingInvoice.number,
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
            id: item.id || crypto.randomUUID(),
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
      }
    } catch (error) {
      console.error('Error initializing form:', error);
      toast.error('Failed to initialize form');
    }
  }, [editingInvoice, items.length, addItem]);

  // Load clients and initialize form on mount
  useEffect(() => {
    const init = async () => {
      await loadClients();
      await initializeForm();
    };
    
    init();
    
    // Add event listener for storage changes to update clients list
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'clients' && e.newValue) {
        try {
          const updatedClients = JSON.parse(e.newValue);
          if (Array.isArray(updatedClients)) {
            setClients(updatedClients);
          }
        } catch (error) {
          console.error('Error updating clients from storage:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadClients, initializeForm]);

  // Calculate totals function with proper typing
  const calculateTotals = useCallback((lineItems: LineItem[], vatRate: number) => {
    const subtotal = lineItems.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const markupPercent = Number(item.markupPercent) || 0;
      const discount = Number(item.discount) || 0;
      
      const grossAmount = (rate + (rate * markupPercent / 100)) * quantity;
      const amount = grossAmount - discount;
      
      return sum + amount;
    }, 0);
    
    const vatAmount = subtotal * (vatRate / 100);
    const total = subtotal + vatAmount;
    
    return { subtotal, vatAmount, total };
  }, []);

  // Calculate totals for display
  const { subtotal, vatAmount, total } = calculateTotals(items, formData.vatRate);

  // Handle preview invoice
  const handlePreviewInvoice = () => {
    // Get company details from localStorage
    const storedCompany = JSON.parse(localStorage.getItem('companyDetails') || '{}');
    const companyAssets = JSON.parse(localStorage.getItem('companyAssets') || '{}');
    
    // Get selected client details
    const selectedClientObj = clients.find((client) => client.id === formData.clientId);
    
    if (!selectedClientObj) {
      toast.error('Please select a client first');
      return;
    }
    
    // Prepare company details with all banking fields
    const companyDetails = {
      ...storedCompany,
      logoUrl: companyAssets?.Logo?.dataUrl || '',
      stampUrl: companyAssets?.Stamp?.dataUrl || '',
      signatureUrl: companyAssets?.Signature?.dataUrl || '',
      // Ensure all banking fields are included
      bankName: storedCompany.bankName,
      accountNumber: storedCompany.accountNumber,
      branchCode: storedCompany.branchCode,
      accountType: storedCompany.accountType,
    };
    
    // Prepare invoice data for preview
    const invoiceInfo = {
      number: formData.invoiceNumber,
      date: formData.invoiceDate,
      dueDate: formData.dueDate,
      reference: formData.reference,
      clientId: formData.clientId,
      clientInfo: selectedClientObj,
      items: items.map(item => ({
        ...item,
        quantity: Number(item.quantity) || 0
      })),
      subtotal: subtotal,
      vatRate: Number(formData.vatRate) || 15,
      vatTotal: vatAmount,
      grandTotal: total,
      notes: formData.notes,
      terms: formData.terms,
      currency: 'ZAR',
      status: 'draft',
      companyDetails: companyDetails
    };
    
    setPreviewData(invoiceInfo);
    setShowPreviewModal(true);
  };



  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    // Validate form
    if (!formData.clientId) {
      toast.error('Please select a client');
      return;
    }
    
    if (!formData.invoiceDate) {
      toast.error('Invoice date is required');
      return;
    }
    
    if (items.length === 0) {
      toast.error('Please add at least one line item');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get the selected client
      const selectedClient = clients.find(c => c.id === formData.clientId);
      if (!selectedClient) {
        toast.error('Selected client not found');
        return;
      }
      
      // Calculate totals for the current items
      const { subtotal, vatAmount, total } = calculateTotals(items, formData.vatRate);
      
      // Prepare invoice data according to the Invoice type
      const invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
        number: formData.invoiceNumber,
        clientId: formData.clientId,
        date: formData.invoiceDate,
        dueDate: formData.dueDate || '',
        reference: formData.reference || '',
        notes: formData.notes || '',
        terms: formData.terms || 'Payment due within 30 days of invoice date.',
        status: 'draft',
        vatRate: Number(formData.vatRate) || 15,
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
        subtotal,
        vatAmount,
        total
      };
      
      // Call the onSave callback
      await onSave(invoiceData);
      
      // Close the modal
      onClose();
      
      // Show success message
      toast.success(editingInvoice ? 'Invoice updated successfully' : 'Invoice created successfully');
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
    } finally {
      setIsLoading(false);
    }
  }, [onSave, formData, items, clients, onClose, calculateTotals, editingInvoice, isLoading]);

  const removeItem = useCallback((id: string) => {
    if (items.length <= 1) {
      toast.error('At least one line item is required');
      return;
    }
    
    setItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== id);
      // Renumber items
      const renumberedItems = newItems.map((item, index) => ({
        ...item,
        itemNo: index + 1
      }));
      setNextItemNo(renumberedItems.length + 1);
      return renumberedItems;
    });
  }, [items.length]);

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

  // Handle click outside to close modal
  const handleClickOutside = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClickOutside}
    >
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-slate-900 font-sf-pro">
            {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            aria-label="Close"
            className="text-slate-500 hover:bg-slate-100 rounded-full h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                Invoice Number
              </label>
              <Input
                value={formData.invoiceNumber}
                readOnly
                className="font-sf-pro bg-slate-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                Client
              </label>
              <div className="relative">
                <select 
                  value={formData.clientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-sf-pro focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  disabled={clients.length === 0}
                >
                  <option value="">
                    {clients.length === 0 ? 'No clients found' : 'Select a client'}
                  </option>
                  {clients.map((client) => {
                    const displayName = client.companyName || 
                      [client.firstName, client.lastName].filter(Boolean).join(' ').trim();
                    return (
                      <option key={client.id} value={client.id}>
                        {displayName || `Client ${client.id.substring(0, 6)}`}
                      </option>
                    );
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
                {clients.length === 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    <Link 
                      to="/clients" 
                      className="text-blue-600 hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                        // Using window.location instead of navigate to ensure full page reload
                        window.location.href = '/clients';
                      }}
                    >
                      Add a client
                    </Link> to get started.
                  </p>
                )}
              </div>
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
              <Button 
                onClick={addItem} 
                size="sm" 
                variant="gradient"
                className="font-sf-pro text-white"
              >
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
                          value={Number(item.quantity) || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Convert to number to remove leading zeros, then back to string
                            const numValue = value === '' ? '' : Number(value);
                            updateItem(item.id, 'quantity', numValue);
                          }}
                          className="w-full text-right font-sf-pro [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? 0 : parseFloat(value);
                            updateItem(item.id, 'rate', isNaN(numValue) ? 0 : numValue);
                          }}
                          className="w-full text-right font-sf-pro [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={item.markupPercent || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? 0 : parseFloat(value);
                            updateItem(item.id, 'markupPercent', isNaN(numValue) ? 0 : numValue);
                          }}
                          className="w-full text-right font-sf-pro [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.discount || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? 0 : parseFloat(value);
                            updateItem(item.id, 'discount', isNaN(numValue) ? 0 : numValue);
                          }}
                          className="w-full text-right font-sf-pro [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
        
        <div className="flex justify-end items-center p-6 border-t">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="font-sf-pro border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePreviewInvoice}
              className="bg-gradient-to-r from-mokm-pink-500 via-mokm-purple-500 to-mokm-blue-500 text-white px-4 py-2 rounded-xl shadow-md font-sf-pro flex items-center gap-2"
              disabled={!formData.clientId || items.length === 0}
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button 
              variant="gradient"
              onClick={handleSubmit} 
              className="font-sf-pro text-white hover:opacity-90"
              disabled={isLoading || !formData.clientId || items.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Invoice Preview Modal */}
      {showPreviewModal && previewData && (
        <InvoicePreviewModal
          open={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          data={previewData}
        />
      )}
    </div>
  );
};

export default CreateInvoiceModal;
