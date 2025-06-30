
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import QuotationDetailsForm from './QuotationDetailsForm';
import QuotationItemsList from './QuotationItemsList';
import { Quotation, QuotationItem as ServiceQuotationItem } from '@/services/quotationService';

// Local interface that extends the service's QuotationItem to include unitPrice
interface LocalQuotationItem extends Omit<ServiceQuotationItem, 'rate'> {
  unitPrice: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
  type: string;
}

interface DuplicateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
}

// Sample clients for the demo
const sampleClients: Client[] = [
  { id: '1', name: 'ABC Corporation', email: 'info@abccorp.co.za', address: '123 Main St, Johannesburg', type: 'company' },
  { id: '2', name: 'Department of Education', email: 'contact@education.gov.za', address: 'Government Boulevard, Pretoria', type: 'government' },
  { id: '3', name: 'Maria Mokoena', email: 'maria@example.com', address: '45 Oak Avenue, Cape Town', type: 'individual' },
  { id: '4', name: 'Save the Wildlife Foundation', email: 'info@savewildlife.org.za', address: '78 Park Road, Durban', type: 'non-profit' },
  { id: '5', name: 'Tech Solutions Ltd', email: 'hello@techsolutions.co.za', address: '90 Innovation Drive, Stellenbosch', type: 'company' }
];

// Generate a new quotation number
const generateQuotationNumber = (): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `QUO-${year}-${randomNum}`;
};

// Generate the current date in YYYY-MM-DD format
const getCurrentDate = (): string => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

// Generate expiry date (30 days from now) in YYYY-MM-DD format
const getExpiryDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
};

const DuplicateQuotationModal: React.FC<DuplicateQuotationModalProps> = ({
  isOpen,
  onClose,
  quotation
}) => {
  // Form state
  const [quotationNumber, setQuotationNumber] = useState(generateQuotationNumber());
  const [items, setItems] = useState<LocalQuotationItem[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [terms, setTerms] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Convert service item to local item format (with unitPrice instead of rate)
  const toLocalItem = (item: ServiceQuotationItem): LocalQuotationItem => {
    return {
      ...item,
      unitPrice: item.rate, // Map rate to unitPrice for the UI
      amount: item.amount || 0, // Ensure amount is always defined
      taxRate: item.taxRate || 0, // Ensure taxRate is always defined
      discount: item.discount || 0, // Ensure discount is always defined
    };
  };

  // Convert local item back to service item format (with rate instead of unitPrice)
  const toServiceItem = (item: LocalQuotationItem): ServiceQuotationItem => {
    const { unitPrice, ...rest } = item;
    return {
      ...rest,
      rate: unitPrice, // Map unitPrice back to rate for the service
      amount: item.amount || 0, // Ensure amount is always defined
      taxRate: item.taxRate || 0, // Ensure taxRate is always defined
      discount: item.discount || 0, // Ensure discount is always defined
    };
  };

  // Calculate item amount based on quantity, unit price, tax, and discount
  const calculateItemAmount = (item: LocalQuotationItem): number => {
    const subtotal = item.quantity * item.unitPrice;
    const taxAmount = (subtotal * (item.taxRate || 0)) / 100;
    return subtotal + taxAmount - (item.discount || 0);
  };

  // Initialize form with quotation data
  useEffect(() => {
    if (isOpen && quotation) {
      setQuotationNumber(generateQuotationNumber());
      
      // Find the client in sampleClients if clientId is available
      const clientFromId = quotation.clientId 
        ? sampleClients.find(c => c.id === quotation.clientId) || null 
        : null;
      setClient(clientFromId);
      
      setSelectedClientId(quotation.clientId || '');
      setIssueDate(quotation.date || getCurrentDate());
      setExpiryDate(quotation.expiryDate || getExpiryDate());
      
      // Convert service items to local items
      const duplicatedItems = quotation.items && Array.isArray(quotation.items)
        ? quotation.items.map(item => toLocalItem(item))
        : [createNewItem()];
      
      setItems(duplicatedItems);
      setReference(quotation.reference || '');
      setNotes(quotation.notes || '');
      setTerms(quotation.terms || '');
    }
  }, [isOpen, quotation]);

  // Create a new empty item with default values
  const createNewItem = (): LocalQuotationItem => ({
    id: Math.random().toString(36).substring(7),
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 15,
    discount: 0,
    amount: 0,
    unit: 'pcs',
  });

  // Handle adding a new item
  const addItem = () => {
    setItems(prev => [...prev, createNewItem()]);
  };
  
  // Handle updating an item
  const updateItem = (itemId: string, field: keyof LocalQuotationItem, value: string | number) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, [field]: value, amount: calculateItemAmount({ ...item, [field]: value }) }
          : item
      )
    );
  };
  


  // Handle removing an item
  const removeItem = (itemId: string) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Handle client selection
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const selectedClient = sampleClients.find(c => c.id === clientId) || null;
    setClient(selectedClient);
  };

  // Form validation
  const validateForm = () => {
    if (!selectedClientId) {
      setError('Please select a client');
      return false;
    }
    
    if (!issueDate) {
      setError('Please set an issue date');
      return false;
    }
    
    if (!expiryDate) {
      setError('Please set an expiry date');
      return false;
    }
    
    const hasEmptyItems = items.some(item => !item.description || item.quantity <= 0);
    if (hasEmptyItems) {
      setError('Please fill in all item details and ensure quantities are greater than zero');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !quotation) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Convert local items back to service items
      const serviceItems = items.map(item => toServiceItem(item));
      
      // Calculate totals
      const subtotal = serviceItems.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
      const taxAmount = serviceItems.reduce((sum, item) => {
        const itemSubtotal = item.rate * item.quantity;
        const itemTax = itemSubtotal * (item.taxRate / 100);
        return sum + itemTax;
      }, 0);
      
      const totalAmount = subtotal + taxAmount - (quotation.discount || 0);
      
      // Create the new quotation object
      const newQuotation: Quotation = {
        ...quotation, // Copy all properties from the original
        id: Math.random().toString(36).substr(2, 9), // Generate new ID
        number: quotationNumber,
        client: client?.name || '',
        clientId: selectedClientId,
        clientEmail: client?.email || '',
        date: issueDate,
        expiryDate: expiryDate,
        reference: reference || `Copy of ${quotation.number}`,
        items: serviceItems,
        subtotal,
        taxAmount,
        totalAmount,
        status: 'draft',
        notes: notes || '',
        terms: terms || '',
        lastModified: new Date().toISOString(),
        // Reset revision history for the new quotation
        revisionHistory: [{
          date: new Date().toISOString(),
          changes: ['Created from quotation ' + quotation.number],
          userId: 'system',
          userName: 'System'
        }]
      };
      
      console.log('Duplicating quotation:', newQuotation);
      
      // Here you would typically save the new quotation
      // await saveQuotation(newQuotation);
      
      onClose();
    } catch (error) {
      console.error('Error duplicating quotation:', error);
      setError('Failed to duplicate quotation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-business max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 font-sf-pro">Duplicate Quotation</h2>
            <p className="text-sm text-slate-600 font-sf-pro">Create a new quotation based on {quotation?.number}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-start mb-6">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <QuotationDetailsForm
              quotationNumber={quotationNumber}
              onQuotationNumberChange={setQuotationNumber}
              selectedClientId={selectedClientId}
              onClientSelect={setSelectedClientId}
              issueDate={issueDate}
              onIssueDateChange={setIssueDate}
              expiryDate={expiryDate}
              onExpiryDateChange={setExpiryDate}
              clients={sampleClients}
            />

            <QuotationItemsList
              items={items}
              onAddItem={addItem}
              onUpdateItem={updateItem}
              onRemoveItem={removeItem}
            />

            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20">
              <CardHeader>
                <CardTitle className="text-lg font-sf-pro">Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="terms" className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
                      Terms and Conditions
                    </label>
                    <Textarea
                      id="terms"
                      rows={4}
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      className="font-sf-pro"
                      placeholder="Payment terms, delivery conditions, etc."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
                      Notes
                    </label>
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
              </CardContent>
            </Card>
          </form>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} className="font-sf-pro">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white font-sf-pro"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Quotation
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateQuotationModal;
