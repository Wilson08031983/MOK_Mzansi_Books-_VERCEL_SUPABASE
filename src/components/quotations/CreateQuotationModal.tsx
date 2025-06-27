
import React, { useState, useEffect, useRef } from 'react';
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
  Eye,
  Loader2,
  Mail
} from 'lucide-react';
import QuotationPreviewModal, { Quotation as QuotationPreviewType } from '@/components/quotation/QuotationPreviewModal';
import { generateNextQuotationNumber, generateQuotationPdf, QuotationPdfData } from '@/utils/quotationUtils';
import { saveQuotation, getQuotations, Quotation as QuotationType } from '@/services/quotationService';


// Email functionality removed as per requirements
// Mock company service since it's not available
const getCompany = () => {
  try {
    const company = localStorage.getItem('companyDetails');
    return company ? JSON.parse(company) : null;
  } catch (error) {
    console.error('Error getting company details:', error);
    return null;
  }
};
import { toast } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';

// Define interfaces
interface LineItem {
  id: string;
  description: string;
  quantity: string | number;
  rate: string | number;
  markupPercent: string | number;
  discount: string | number;
  amount: number;
  vat?: number; // Add VAT field for preview
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
  // Shipping address fields
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostal?: string;
  shippingCountry?: string;
  sameAsBilling?: boolean;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, string | number | boolean | undefined>;
}

interface CreateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuotationSaved?: (quotation: QuotationType, allQuotations: QuotationType[]) => void;
}

const CreateQuotationModal: React.FC<CreateQuotationModalProps> = ({ isOpen, onClose, onQuotationSaved }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    quotationNumber: '',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    expiryDate: '',
    currency: 'ZAR',
    notes: '',
    terms: '',
    project: ''
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
      amount: 0,
      vat: 0 // Default VAT to 0%
    }
  ]);

  const [subtotal, setSubtotal] = useState(0);
  const [vatRate, setVatRate] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);
  const [total, setTotal] = useState(0);
  
  // State for preview modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [companyAssets, setCompanyAssets] = useState<Record<string, string>>({});
  const [clientList, setClientList] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // State for loading and error handling
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure Buffer is available
  const ensureBuffer = async (): Promise<boolean> => {
    if (typeof window === 'undefined') {
      return true; // Not in browser, assume Buffer is available
    }

    try {
      if (!window.Buffer) {
        // Use dynamic import to avoid type issues
        const bufferModule = await import('buffer/');
        window.Buffer = bufferModule.Buffer;
      }
      return true;
    } catch (error) {
      console.error('Failed to load Buffer polyfill:', error);
      return false;
    }
  };



  // Generate the next quotation number in format QUO-YYYY-NNN
  const generateNextQuotationNumber = (existingQuotations: QuotationType[]): string => {
    const year = new Date().getFullYear();
    const prefix = `QUO-${year}-`;
    
    // Get all quotation numbers for the current year
    const currentYearQuotations = existingQuotations.filter(q => q.number.startsWith(prefix));
    
    // Find the highest number used so far
    let highestNumber = 0;
    currentYearQuotations.forEach(q => {
      const numberPart = q.number.replace(prefix, '');
      const num = parseInt(numberPart, 10);
      if (!isNaN(num) && num > highestNumber) {
        highestNumber = num;
      }
    });
    
    // Return the next number in sequence
    return `${prefix}${String(highestNumber + 1).padStart(3, '0')}`;
  };

  // Handle save quotation
  const saveQuotationHandler = async (isDraft: boolean = false) => {
    if (!selectedClient) {
      toast.error('Please select a client');
      return;
    }

    if (lineItems.length === 0 || lineItems.some(item => !item.description || !item.quantity || !item.rate)) {
      toast.error('Please add at least one valid line item');
      return;
    }
    
    // Validate line items
    for (const [index, item] of lineItems.entries()) {
      if (!item.description || !item.quantity || !item.rate) {
        setError(`Please fill in all required fields for item ${index + 1}`);
        return;
      }
    }
    
    setError('');
    setIsSaving(true);
    
    try {
      // Calculate total amount
      const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
      const total = subtotal; // Add tax and other calculations if needed
      const now = new Date().toISOString();
      
      // Create quotation data
      const quotationData: QuotationType = {
        id: formData.quotationNumber || Date.now().toString(),
        number: formData.quotationNumber || '',
        reference: formData.reference || '',
        client: selectedClient?.companyName || `${selectedClient?.firstName} ${selectedClient?.lastName}`.trim(),
        clientId: formData.clientId,
        clientEmail: selectedClient?.email || '',
        clientContact: selectedClient?.firstName ? `${selectedClient.firstName} ${selectedClient.lastName || ''}`.trim() : '',
        date: now.split('T')[0],
        expiryDate: formData.expiryDate || '',
        amount: total,
        currency: formData.currency,
        status: isDraft ? 'draft' : 'saved',
        salesperson: 'Salesperson Name',
        salespersonId: 'user_1',
        project: formData.project || '',
        priority: 'medium',
        items: lineItems.map(item => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity) || 0,
          unit: 'unit',
          rate: Number(item.rate) || 0,
          taxRate: vatRate, // Use the VAT rate from state
          discount: Number(item.discount) || 0,
          amount: item.amount
        })),
        subtotal,
        taxRate: vatRate, // Include VAT rate in the main quotation object
        taxAmount: vatAmount, // Include VAT amount in the main quotation object
        discount: 0,
        totalAmount: total,
        terms: formData.terms,
        notes: formData.notes,
        // Initialize with empty arrays for array fields to ensure they're defined
        attachments: [],
        revisionHistory: [{
          date: now,
          changes: ['Quotation created'],
          userId: 'user_1',
          userName: 'System'
        }]
      };

      // Save quotation to local storage
      const updatedQuotations = saveQuotation(quotationData);
      
      // Update the parent component's state if the callback is provided
      if (onQuotationSaved) {
        onQuotationSaved(quotationData, updatedQuotations);
      }
      
      toast.success(`Quotation ${isDraft ? 'saved as draft' : 'saved'} successfully!`);
      onClose();
    } catch (err) {
      console.error('Error saving quotation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save quotation';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save as draft
  const saveAsDraft = async () => {
    await saveQuotationHandler(true);
  };

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
        amount: 0,
        vat: 0 // Default VAT to 0%
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

  // Calculate totals whenever line items or VAT rate changes
  useEffect(() => {
    const calculatedSubtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const calculatedVat = (calculatedSubtotal * vatRate) / 100;
    const calculatedTotal = calculatedSubtotal + calculatedVat;
    
    setSubtotal(calculatedSubtotal);
    setVatAmount(calculatedVat);
    setTotal(calculatedTotal);
  }, [lineItems, vatRate]);
  
  // Update selected client when clientId or clientList changes
  useEffect(() => {
    if (formData.clientId && clientList.length > 0) {
      const client = clientList.find(c => c.id === formData.clientId);
      if (client) {
        // Format the shipping address from individual fields if needed
        const formattedClient = {
          ...client,
          // If shippingAddress is not set but we have shipping fields, create it
          shippingAddress: client.shippingAddress || (
            client.shippingStreet ? [
              client.shippingStreet,
              client.shippingCity,
              client.shippingState,
              client.shippingPostal,
              client.shippingCountry
            ].filter(Boolean).join('; ') : ''
          )
        };
        setSelectedClient(formattedClient);
      } else {
        setSelectedClient(null);
      }
    } else {
      setSelectedClient(null);
    }
  }, [formData.clientId, clientList]);

  // Load company assets and client list from localStorage
  useEffect(() => {
    try {
      // Load company assets
      const savedAssetsString = localStorage.getItem('companyAssets');
      if (savedAssetsString) {
        const savedAssets = JSON.parse(savedAssetsString);
        setCompanyAssets(savedAssets);
      }
      
      // Load company details to supplement assets info
      const companyDetailsString = localStorage.getItem('companyDetails');
      if (companyDetailsString) {
        const companyDetails = JSON.parse(companyDetailsString);
        setCompanyAssets(prev => ({
          ...prev,
          name: companyDetails.name,
          address: [
            companyDetails.addressLine1,
            companyDetails.addressLine2,
            companyDetails.addressLine3,
            companyDetails.addressLine4
          ].filter(Boolean).join('\n'),
          email: companyDetails.email,
          phone: companyDetails.phone,
          website: companyDetails.websiteNotApplicable ? '' : companyDetails.website,
          vatNumber: companyDetails.vatNumberNotApplicable ? '' : companyDetails.vatNumber,
          regNumber: companyDetails.regNumber
        }));
      }
      
      // Load clients
      const clientsString = localStorage.getItem('clients');
      if (clientsString) {
        const clients = JSON.parse(clientsString);
        setClientList(clients);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);
  
  // Update selected client when clientId changes
  useEffect(() => {
    if (formData.clientId && clientList.length > 0) {
      const client = clientList.find(c => c.id === formData.clientId);
      setSelectedClient(client || null);
    } else {
      setSelectedClient(null);
    }
  }, [formData.clientId, clientList]);

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
                    onChange={(e) => {
                      const clientId = e.target.value;
                      setFormData(prev => ({ ...prev, clientId }));
                      
                      // Find the selected client from clientList
                      const client = clientList.find(c => c.id === clientId) || null;
                      setSelectedClient(client);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-mokm-purple-500 focus:border-mokm-purple-500 font-sf-pro"
                  >
                    <option value="">Select a client</option>
                    {clientList.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.companyName || `${client.firstName} ${client.lastName}`.trim() || `Client ${client.id}`}
                      </option>
                    ))}
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
                    <div className="flex justify-between font-sf-pro">
                      <div className="flex items-center">
                        <span>VAT (</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={vatRate}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            setVatRate(Math.min(Math.max(0, value), 100));
                          }}
                          className="w-12 border-b border-gray-300 text-right focus:outline-none focus:border-mokm-purple-500"
                        />
                        <span>%):</span>
                      </div>
                      <span>R {vatAmount.toFixed(2)}</span>
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
              onClick={() => {
                try {
                  // Check if we have a valid client selected
                  const clientId = formData.clientId;
                  const client = clientList.find(c => c.id === clientId);
                  
                  if (!client) {
                    toast.error("Please select a valid client before previewing");
                    return;
                  }
                  
                  // Update selected client to ensure it's in sync
                  setSelectedClient(client);
                  
                  // Debug logging for client data
                  console.log('Selected client before preview:', selectedClient);
                  console.log('Client shipping address:', selectedClient?.shippingAddress);
                  
                  // Log all clients in localStorage
                  const clientsString = localStorage.getItem('clients');
                  if (clientsString) {
                    const clients = JSON.parse(clientsString);
                    console.log('All clients in localStorage:', clients);
                    console.log('Client with matching ID:', clients.find(c => c.id === formData.clientId));
                  }
                  
                  // Generate quotation number if not already created
                  const currentYear = new Date().getFullYear();
                  const quotationNumber = `QUO-${currentYear}-001`;
                  
                  // Open the preview modal
                  setIsPreviewModalOpen(true);
                } catch (error) {
                  console.error('Error opening preview:', error);
                  toast.error('Could not open preview. Please try again.');
                }
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                className="font-sf-pro border-gray-300 hover:bg-gray-100"
                onClick={saveAsDraft}
                disabled={isSaving || !selectedClient}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white font-sf-pro"
                onClick={() => saveQuotationHandler(false)}
                disabled={isSaving || !selectedClient || lineItems.length === 0}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Save & Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        {/* Quotation Preview Modal */}
        <ErrorBoundary fallback={<div>Something went wrong with the preview. Please try again.</div>}>
          {isPreviewModalOpen && (
            <QuotationPreviewModal
              open={isPreviewModalOpen}
              onClose={() => setIsPreviewModalOpen(false)}
              quotation={{
                quotationNumber: `QUO-${new Date().getFullYear()}-001`,
                date: formData.date,
                reference: formData.reference,
                clientInfo: selectedClient ? {
                  companyName: selectedClient.companyName || '',
                  contactPerson: [selectedClient.firstName, selectedClient.lastName].filter(Boolean).join(' '),
                  email: selectedClient.email || '',
                  phone: selectedClient.phone || '',
                  billingAddress: selectedClient.billingAddress || '',
                  shippingAddress: selectedClient.shippingAddress || (
                    // If shipping address is not set but we have shipping fields, create it
                    selectedClient.shippingStreet ? [
                      selectedClient.shippingStreet,
                      selectedClient.shippingCity,
                      selectedClient.shippingState,
                      selectedClient.shippingPostal,
                      selectedClient.shippingCountry
                    ].filter(Boolean).join('; ') : ''
                  ),
                  // Pass through individual shipping fields as well
                  shippingStreet: selectedClient.shippingStreet || '',
                  shippingCity: selectedClient.shippingCity || '',
                  shippingState: selectedClient.shippingState || '',
                  shippingPostal: selectedClient.shippingPostal || '',
                  shippingCountry: selectedClient.shippingCountry || '',
                  sameAsBilling: selectedClient.sameAsBilling || false
                } : undefined,
                items: lineItems.map((item) => ({
                  id: item.id,
                  description: String(item.description || ''),
                  quantity: Number(item.quantity || 0),
                  rate: Number(item.rate || 0),
                  discount: Number(item.discount || 0),
                  amount: Number(item.amount || 0),
                  vat: vatRate // Use the VAT rate from state
                })),
                subtotal: subtotal,
                vatTotal: vatAmount, // Use the calculated VAT amount
                grandTotal: total,
                termsAndConditions: formData.terms,
                notes: formData.notes
              }}
              company={companyAssets}
            />
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default CreateQuotationModal;
