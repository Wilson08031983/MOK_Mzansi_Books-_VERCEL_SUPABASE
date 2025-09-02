import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Printer, FileText, FileCheck, Truck, Search, X, Plus, Check, Trash, Download, ShoppingCart, CreditCard, UserRound, Phone, Map, Home, Minus, Camera, Trash2, Percent, ChevronsUpDown, UserIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getAllInventoryItems, updateInventoryItem, getInventoryItemByBarcode, saveInventoryItems } from '@/services/inventoryService';
import { getClients, Client as ClientType } from '@/services/clientService';
import companyService from '@/services/companyService';
import { generateQuotationNumber, saveQuotation } from '@/services/quotationService';
import { generateInvoiceNumber, applyClientDiscountToTotals, canProceedWithCredit } from '@/services/invoiceService';
import BarcodeScanner from '@/components/inventory/BarcodeScanner';
import { cn } from '@/lib/utils';
import { useLocalization } from '@/hooks/useLocalization';
import { generateDeliveryNotePdf } from '@/utils/deliveryNotePdfGenerator';
import { InventoryItem, StockHistoryEntry } from '@/types/inventory';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';

// Use the imported Client type as ClientType

// Sale record type for tracking sales history
interface SaleRecord {
  date: string;
  quantity: number;
  price: number;
  clientId?: string;
}

// Define the SaleRecord interface for sales history tracking
interface SaleRecord {
  date: string;
  quantity: number;
  price: number;
  clientId?: string;
  invoiceId?: string;
  quotationId?: string;
}

// Define the SalesItem interface
interface SalesItem {
  id: string;
  itemId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  total: number;
}

// Define the DeliveryNote interface
interface DeliveryNote {
  customerName: string;
  customerSurname: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  addressLine4: string;
  deliveryCost: number;
  location: string;
  signature: string;
  // Optional contact details for printing and PDF generation compatibility
  contactPerson?: string;
  phone?: string;
}

interface SalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SalesModal: React.FC<SalesModalProps> = ({ isOpen, onClose }) => {
  const { formatCurrency, settings, getCurrencySymbol } = useLocalization();
  const { logFinancial, logDocument, logAudit } = useAuditLogger();
  const [activeTab, setActiveTab] = useState('scan');
  const [salesItems, setSalesItems] = useState<SalesItem[]>([]);
  const [manualBarcode, setManualBarcode] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [subtotalAmount, setSubtotalAmount] = useState(0);
  const [vatPercentage, setVatPercentage] = useState(0); // Default VAT percentage is 0%
  const [vatAmount, setVatAmount] = useState(0);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [printingSlip, setPrintingSlip] = useState(false);
  const [showPrintSlip, setShowPrintSlip] = useState(false);
  const [showDeliveryNote, setShowDeliveryNote] = useState(false);
  const [printingDeliveryNote, setPrintingDeliveryNote] = useState(false);
  const [clients, setClients] = useState<ClientType[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientFinance, setClientFinance] = useState<{ discountRate: number; creditLimit: number }>({ discountRate: 0, creditLimit: 0 });
  const [companyInfo, setCompanyInfo] = useState<import('@/types/company').Company | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string>('');
  // A unique session id that groups slip income with any follow-up invoice
  const [saleSessionId, setSaleSessionId] = useState<string>('');
  const [deliveryNote, setDeliveryNote] = useState<DeliveryNote>({
    customerName: '',
    customerSurname: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressLine4: '',
    deliveryCost: 0,
    location: '',
    signature: '',
    contactPerson: '',
    phone: ''
  });
  const { toast } = useToast();
const { isTrial, getLimit } = useSubscriptionAccess();

  // Derived selected client from id for safer access in JSX and printing sections
  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  // Helper function to save income record
  const saveIncomeRecord = (description: string, amount: number, category: string, paymentMethod: string = 'Cash') => {
    try {
      const existingIncomes = JSON.parse(localStorage.getItem('incomes') || '[]');
      
      const newIncomeRecord = {
        id: `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        date: new Date().toISOString(),
        description: description,
        amount: amount,
        category: category,
        status: 'received' as const,
        paymentMethod: paymentMethod,
        client: selectedClientId ? (clients.find(c => c.id === selectedClientId)?.companyName || clients.find(c => c.id === selectedClientId)?.contactPerson) : undefined,
        clientId: selectedClientId || undefined,
        source: 'sales_slip' as const,
        hasInvoice: false,
        saleSessionId,
        notes: 'Auto-generated from sales transaction'
      };
      
      const updatedIncomes = [...existingIncomes, newIncomeRecord];
      localStorage.setItem('incomes', JSON.stringify(updatedIncomes));
      
      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent('income-updated'));
      
      return newIncomeRecord;
    } catch (error) {
      console.error('Error saving income record:', error);
      return null;
    }
  };

  // Load clients and company information on component mount
  useEffect(() => {
    if (isOpen) {
      try {
        // Create a new sale session id on open
        setSaleSessionId(`SALESESS-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);
        // Load clients
        const loadedClients = getClients();
        setClients(loadedClients);
        // Reset client finance when opening
        if (selectedClientId) {
          const sc = loadedClients.find(c => c.id === selectedClientId);
          setClientFinance({
            discountRate: Number((sc as any)?.discountRate) || 0,
            creditLimit: Number((sc as any)?.creditLimit) || 0
          });
        } else {
          setClientFinance({ discountRate: 0, creditLimit: 0 });
        }
        
        // Load company info
        const companyData = companyService.getCompany();
        setCompanyInfo(companyData);
        setCompanyLogo(companyData?.logo || '');
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error loading clients",
          description: "Could not load client data. Please try again.",
          variant: "destructive"
        });
      }
    }
  }, [isOpen, toast]);

  // Calculate subtotal, VAT, and total amount whenever salesItems or vatPercentage changes
  useEffect(() => {
    const baseSubtotal = salesItems.reduce((sum, item) => sum + item.total, 0);
    const discounted = applyClientDiscountToTotals(baseSubtotal, vatPercentage, clientFinance.discountRate);
    setSubtotalAmount(discounted.discountedSubtotal);
    setVatAmount(discounted.vatTotal);
    setTotalAmount(discounted.total);
  }, [salesItems, vatPercentage, clientFinance.discountRate]);

  // For UI display: compute base subtotal and discount meta
  const baseSubtotal = useMemo(() => salesItems.reduce((sum, item) => sum + item.total, 0), [salesItems]);
  const discountMeta = useMemo(() => applyClientDiscountToTotals(baseSubtotal, vatPercentage, clientFinance.discountRate), [baseSubtotal, vatPercentage, clientFinance.discountRate]);

  // Update client finance when selection changes
  useEffect(() => {
    if (!selectedClientId) {
      setClientFinance({ discountRate: 0, creditLimit: 0 });
      return;
    }
    const sc = clients.find(c => c.id === selectedClientId);
    setClientFinance({
      discountRate: Number((sc as any)?.discountRate) || 0,
      creditLimit: Number((sc as any)?.creditLimit) || 0
    });
  }, [selectedClientId, clients]);

  // Handle barcode scan result
  const handleScanResult = (result: string) => {
    addItemByBarcode(result);
  };

  // Handle manual barcode entry
  const handleManualBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode) {
      handleScanResult(manualBarcode);
      setManualBarcode('');
    }
  };

  // Simpler version to use with onKeyDown and button click events
  const handleManualSubmit = () => {
    if (manualBarcode) {
      handleScanResult(manualBarcode);
      setManualBarcode('');
    }
  };

  // Add item by barcode
  const addItemByBarcode = (barcode: string) => {
    const item = inventoryData.find(item => 
      item.barcode === barcode || 
      item.id === barcode
    );
    
    if (!item) {
      toast({ title: "Item not found", description: `No item found with barcode/ID: ${barcode}`, variant: "destructive" });
      return;
    }
    
    const existingItemIndex = salesItems.findIndex(salesItem => salesItem.itemId === item.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...salesItems];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price;
      setSalesItems(updatedItems);
    } else {
      // Make sure we have a valid price
      const itemPrice = item.price || 0;
      
      // Item doesn't exist, add new item
      const newSalesItem: SalesItem = {
        id: `sales-${Date.now()}`,
        itemId: item.id,
        name: item.name,
        image: item.image || '', // Use item.image instead of imageUrl
        quantity: 1,
        price: itemPrice,
        total: itemPrice
      };
      setSalesItems([...salesItems, newSalesItem]);
    }

    toast({
      title: "Item added",
      description: `${item.name} added to sales list`,
    });
    
    // Play beep sound
    const audio = new Audio('/beep.mp3');
    audio.play();
  };

  // Update item quantity
  const updateItemQuantity = (id: string, change: number) => {
    const updatedItems = salesItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change); // Ensure quantity is at least 1
        return {
          ...item,
          quantity: newQuantity,
          total: newQuantity * item.price
        };
      }
      return item;
    });
    setSalesItems(updatedItems);
  };

  // Remove item from sales list
  const removeItem = (id: string) => {
    setSalesItems(salesItems.filter(item => item.id !== id));
  };

  // Handle print slip action
  const handlePrintSlip = () => {
    if (salesItems.length === 0) {
      toast({
        title: "No items to print",
        description: "Please add items to the sales list before printing",
        variant: "destructive"
      });
      return;
    }
    setPrintingSlip(true);
    
    // Get company details for the slip
    const companyDetails = companyService.getCompany();
    
    // Allow time for the print view to fully render
    setTimeout(() => {
      try {
        // NEW PRINT APPROACH: Create a temporary iframe with only our print content
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '80mm';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
        
        // Get the print target content
        const printTarget = document.getElementById('print-target');
        if (!printTarget) {
          throw new Error('Print target not found');
        }
        
        const printSlip = printTarget.querySelector('.print-slip');
        if (!printSlip) {
          throw new Error('Print slip content not found');
        }
        
        // Write our print styles and content directly to the iframe
        const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDocument) {
          iframeDocument.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Print Slip</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; }
                .print-container { width: 80mm; margin: 0 auto; background: white; padding: 5mm; }
                .print-slip { width: 100%; }
                .print-slip h2 { font-size: 14px; text-align: center; margin-bottom: 4px; }
                .print-slip p { font-size: 10px; text-align: center; margin: 2px 0; }
                .print-slip .border-t { border-top: 1px solid black; margin-top: 4px; padding-top: 4px; }
                .print-slip .border-b { border-bottom: 1px solid black; margin-bottom: 4px; padding-bottom: 4px; }
                
                /* Item layout */
                .print-item-row { display: flex; width: 100%; margin-bottom: 4px; }
                .print-item-name { width: 40%; text-align: left; font-size: 10px; }
                .print-item-qty { width: 10%; text-align: center; font-size: 10px; }
                .print-item-price { width: 25%; text-align: right; font-size: 10px; }
                .print-item-total { width: 25%; text-align: right; font-size: 10px; }
                
                /* Flex layouts */
                .flex { display: flex; width: 100%; }
                .justify-between { justify-content: space-between; }
                .font-medium { font-weight: 500; }
                .text-xs, .text-[10px] { font-size: 10px !important; }
                .text-center { text-align: center; }
                .mt-3 { margin-top: 12px; }
                .pt-2 { padding-top: 8px; }
                .mt-4 { margin-top: 16px; }
                .mb-3 { margin-bottom: 12px; }
                .pt-3 { padding-top: 12px; }
                .font-bold { font-weight: 700; }
                
                /* Ensure totals have consistent font size */
                .font-bold, .font-medium { font-size: 10px !important; }
              </style>
            </head>
            <body>
              <div class="print-container">
                ${printSlip.outerHTML}
              </div>
            </body>
            </html>
          `);
          iframeDocument.close();
          
          // Wait for content to load then print
          setTimeout(() => {
            // Print the iframe content
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            
            // Remove the iframe after printing
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
            
            // Save income record for the sale
            const incomeRecord = saveIncomeRecord(
              `Sales Transaction - Print Slip`,
              totalAmount,
              'Sales',
              'Cash'
            );
            // Audit: record financial event for slip sale
            try {
              logFinancial('Recorded Sale', 'income', incomeRecord?.id || 'Sales Slip', incomeRecord?.id, totalAmount);
            } catch (e) {
              console.warn('Audit log (sales slip income) failed:', e);
            }
            
            // Show success message
            toast({
              title: "Print Initiated",
              description: "The print slip has been sent to your printer and income record saved.",
              variant: "default"
            });
          }, 500);
        }
      } catch (error) {
        console.error('Print error:', error);
        toast({
          title: "Print error",
          description: "There was an error printing the slip: " + (error as Error).message,
          variant: "destructive"
        });
      }
    }, 800);
  };

  // Function to send sales items to a new quotation
  const handleSendToQuotation = () => {
    if (salesItems.length === 0) {
      toast({
        title: "No items to send",
        description: "Please add items before sending to quotation",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate a proper quotation number using the sequence
      const quotationNumber = generateQuotationNumber();
      const now = new Date();
      const selectedClient = clients.find(client => client.id === selectedClientId);
      
      // Create new quotation with proper structure
      const newQuotation = {
        id: `quotation_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        number: quotationNumber,
        reference: `SALE-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`,
        clientId: selectedClientId,
        client: selectedClient?.companyName || selectedClient?.contactPerson || 'Unknown Client',
        clientName: selectedClient?.companyName || selectedClient?.contactPerson || 'Unknown Client',
        clientEmail: selectedClient?.email || '',
        clientContact: selectedClient?.contactPerson || '',
        date: now.toISOString(),
        expiryDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        status: 'draft' as 'draft' | 'saved' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'cancelled',
        currency: settings.currency,
        amount: totalAmount,
        items: salesItems.map((item, index) => ({
          id: `item-${Date.now()}-${index}`,
          description: item.name,
          quantity: item.quantity,
          unit: 'each',
          rate: item.price,
          taxRate: vatPercentage || 0,
          discount: 0,
          amount: item.total,
          markupPercent: 0
        })),
        subtotal: subtotalAmount,
        taxRate: vatPercentage,
        taxAmount: vatAmount,
        totalAmount: totalAmount,
        terms: 'Payment due within 30 days',
        notes: '',
        lastModified: now.toISOString(),
        revisionHistory: [{
          date: now.toISOString(),
          changes: ['Created from Sales'],
          userId: 'system',
          userName: 'System'
        }]
      };

      // Save the quotation using the service function
      saveQuotation(newQuotation);
      // Audit: log quotation creation
      try {
        logDocument('Created Quotation', 'quotation', newQuotation.number, newQuotation.id);
      } catch (e) {
        console.warn('Audit log (create quotation) failed:', e);
      }

      // Update inventory quantities
      updateInventoryQuantities();

      toast({
        title: "Quotation created",
        description: `Quotation ${quotationNumber} created successfully`,
      });

      onClose();
    } catch (error) {
      console.error('Error creating quotation:', error);
      toast({
        title: "Error creating quotation",
        description: "An error occurred while creating the quotation",
        variant: "destructive"
      });
    }
  };

  // Handle send to invoice action
  const handleSendToInvoice = () => {
    // Trial gating: enforce monthly invoice cap for trial/basic tiers
    try {
      if (isTrial) {
        const limit = getLimit('invoicesPerMonth');
        const allInvoicesRaw = localStorage.getItem('invoices') || '[]';
        const parsed = JSON.parse(allInvoicesRaw);
        const allInvoices: any[] = Array.isArray(parsed) ? parsed : [];
        const now = new Date();
        const thisMonthCount = allInvoices.filter((inv) => {
          if (!inv) return false;
          const dStr = inv.invoiceDate || inv.date || inv.createdAt;
          if (!dStr) return false;
          const d = new Date(dStr);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        }).length;

        if (thisMonthCount >= limit) {
          toast({
            title: "Trial limit reached",
            description: `You can create up to ${limit} invoices per month on the trial. Upgrade to unlock unlimited invoices.`,
            variant: "destructive"
          });
          try {
            logDocument('Create invoice blocked - trial limit', 'invoice', 'N/A', undefined);
          } catch (err) {
            console.warn('Failed to log blocked create due to trial limit:', err);
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Subscription gating check failed:', e);
      // Fail open to avoid blocking legitimate users
    }
    if (salesItems.length === 0) {
      toast({
        title: "No items to send",
        description: "Please add items before sending to invoice",
        variant: "destructive"
      });
      return;
    }

    if (!selectedClientId) {
      toast({
        title: "No client selected",
        description: "Please select a client before sending to invoice",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get existing invoices or initialize empty array
      const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      
      // Generate proper invoice number using the sequence
      const invoiceNumber = generateInvoiceNumber();
      const now = new Date();
      const selectedClient = clients.find(client => client.id === selectedClientId);
      // Enforce credit limit if configured using the discounted total
      const creditCheck = canProceedWithCredit(selectedClientId, totalAmount, clientFinance.creditLimit);
      if (!creditCheck.allowed) {
        toast({
          title: "Credit limit exceeded",
          description: `Outstanding: ${formatCurrency(creditCheck.outstanding)} | Remaining credit: ${formatCurrency(creditCheck.remaining)} | Invoice total: ${formatCurrency(totalAmount)}`,
          variant: "destructive"
        });
        return;
      }
      
      // Create new invoice with proper structure matching Invoice interface
      const newInvoice = {
        id: `invoice_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        number: invoiceNumber,
        client: selectedClientId,
        clientId: selectedClientId,
        clientName: selectedClient?.companyName || selectedClient?.contactPerson || 'Unknown Client',
        clientEmail: selectedClient?.email || '',
        date: now.toISOString(),
        invoiceDate: now.toISOString(),
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        amount: totalAmount,
        total: totalAmount,
        paidAmount: 0,
        balance: totalAmount,
        status: 'pending',
        currency: settings.currency,
        vatRate: vatPercentage || 0,
        reference: `SALE-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`,
        terms: 'Payment due within 30 days',
        items: salesItems.map((item, index) => ({
          id: `item-${Date.now()}-${index}`,
          itemNo: index + 1,
          description: item.name,
          quantity: item.quantity,
          rate: item.price,
          taxRate: vatPercentage || 0,
          discount: 0,
          amount: item.total
        })),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      // Save updated invoices to localStorage
      localStorage.setItem('invoices', JSON.stringify([...existingInvoices, newInvoice]));
      // Audit: log invoice creation (document + financial)
      try {
        logDocument('Created Invoice', 'invoice', newInvoice.number, newInvoice.id);
        logFinancial('Created Invoice', 'invoice', newInvoice.number, newInvoice.id, newInvoice.total);
      } catch (e) {
        console.warn('Audit log (create invoice) failed:', e);
      }

      // Mark any related slip incomes (same session + same client) as converted to invoice
      try {
        const incomes: any[] = JSON.parse(localStorage.getItem('incomes') || '[]');
        let changed = false;
        const updatedIncomes = incomes.map((inc) => {
          if (
            inc &&
            inc.source === 'sales_slip' &&
            inc.saleSessionId === saleSessionId &&
            inc.clientId === selectedClientId &&
            inc.hasInvoice !== true
          ) {
            changed = true;
            return {
              ...inc,
              hasInvoice: true,
              linkedInvoiceId: newInvoice.id,
            };
          }
          return inc;
        });
        if (changed) {
          localStorage.setItem('incomes', JSON.stringify(updatedIncomes));
          // Notify listeners so totals refresh in Clients page
          window.dispatchEvent(new CustomEvent('income-updated'));
        }
      } catch (e) {
        console.error('Failed to mark related slip incomes as invoiced:', e);
      }

      // Update inventory quantities
      updateInventoryQuantities();

      toast({
        title: "Invoice created",
        description: `Invoice ${invoiceNumber} created successfully`,
      });

      onClose();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error creating invoice",
        description: "An error occurred while creating the invoice",
        variant: "destructive"
      });
    }
  };

  // Handle delivery note action
  const handleDeliveryNote = () => {
    if (salesItems.length === 0) {
      toast({
        title: "No items for delivery",
        description: "Please add items before creating a delivery note",
        variant: "destructive"
      });
      return;
    }
    setShowDeliveryNote(true);
  };

  // Update inventory quantities after a sale
  const updateInventoryQuantities = () => {
    const inventoryItems = getAllInventoryItems();
    salesItems.forEach(salesItem => {
      const inventoryItemIndex = inventoryItems.findIndex(item => item.id === salesItem.itemId);
      
      if (inventoryItemIndex >= 0) {
        const inventoryItem = inventoryItems[inventoryItemIndex];
        const currentQuantity = inventoryItem.stockLevel || 0;
        const newQuantity = Math.max(0, currentQuantity - salesItem.quantity);
        
        // Update inventory item with new quantity
        inventoryItems[inventoryItemIndex] = {
          ...inventoryItem,
          stockLevel: newQuantity,
          lastUpdated: new Date().toISOString()
        };
        
        // Add a stock history entry for this sale
        const historyEntry: StockHistoryEntry = {
          id: `hist-${Date.now()}-${salesItem.itemId}`,
          inventoryItemId: salesItem.itemId,
          date: new Date().toISOString(),
          type: 'sold',
          quantity: salesItem.quantity,
          notes: `Sold in sales transaction`,
          performedBy: 'Sales Staff'
        };
        
        // We would add this to stock history if we had that function
        // addStockHistoryEntry(historyEntry);
      }
    });
    
    // Save updated inventory items
    saveInventoryItems(inventoryItems);
    // Audit: summarize inventory quantity changes for this sale
    try {
      const changed = salesItems.map(si => ({ itemId: si.itemId, name: si.name, qtySold: si.quantity }));
      logAudit({
        category: 'crud',
        action: 'Updated Inventory Quantities',
        changeType: 'update',
        entityType: 'inventory',
        description: `Stock reduced for ${changed.length} item(s) due to sale`,
        newValues: { changes: changed }
      });
    } catch (e) {
      console.warn('Audit log (inventory update after sale) failed:', e);
    }
  };

  // Handle delivery note form submission
  const handleDeliveryNoteSubmit = () => {
    try {
      // Find selected client
      const selectedClient = clients.find(client => client.id === selectedClientId);
      
      // Get existing delivery notes or initialize empty array
      const existingDeliveryNotes = JSON.parse(localStorage.getItem('deliveryNotes') || '[]');
      
      // Create new delivery note
      const newDeliveryNote = {
        id: `DN-${Date.now()}`,
        date: new Date().toISOString(),
        customer: {
          name: deliveryNote.customerName,
          surname: deliveryNote.customerSurname,
          addressLine1: deliveryNote.addressLine1,
          addressLine2: deliveryNote.addressLine2,
          addressLine3: deliveryNote.addressLine3,
          addressLine4: deliveryNote.addressLine4,
        },
        deliveryCost: deliveryNote.deliveryCost,
        location: deliveryNote.location,
        signature: deliveryNote.signature,
        items: salesItems,
        subtotal: subtotalAmount,
        vatAmount: vatAmount,
        vatPercentage: vatPercentage,
        total: totalAmount + deliveryNote.deliveryCost
      };

      // Save updated delivery notes to localStorage
      localStorage.setItem('deliveryNotes', JSON.stringify([...existingDeliveryNotes, newDeliveryNote]));
      // Audit: log delivery note creation
      try {
        logDocument('Created Delivery Note', 'delivery_note', newDeliveryNote.id, newDeliveryNote.id);
      } catch (e) {
        console.warn('Audit log (create delivery note) failed:', e);
      }

      // Update inventory quantities
      updateInventoryQuantities();
      
      // Save income record for delivery cost if there is one
      if (deliveryNote.deliveryCost > 0) {
        const incomeRecord = saveIncomeRecord(
          `Delivery Service - ${deliveryNote.customerName} ${deliveryNote.customerSurname}`,
          deliveryNote.deliveryCost,
          'Delivery Services',
          'Cash'
        );
      }
      
      // Generate and download PDF
      generateDeliveryNotePdf({
        customerName: deliveryNote.customerName,
        customerSurname: deliveryNote.customerSurname,
        contactPerson: selectedClient?.contactPerson,
        phone: selectedClient?.phone || '',
        location: deliveryNote.location,
        city: selectedClient?.billingCity || '',
        postalCode: selectedClient?.billingPostal || '',
        addressLine1: deliveryNote.addressLine1 || selectedClient?.billingStreet || '',
        addressLine2: deliveryNote.addressLine2 || '',
        deliveryCost: deliveryNote.deliveryCost,
        items: salesItems,
        subtotal: subtotalAmount,
        vatAmount: vatAmount,
        vatPercentage: vatPercentage,
        total: totalAmount
      }, selectedClientId);

      toast({
        title: "Delivery note created",
        description: "Delivery note created, PDF downloaded, and income record saved.",
        variant: "default"
      });

      onClose();
    } catch (error) {
      console.error('Error creating delivery note:', error);
      toast({
        title: "Error creating delivery note",
        description: "An error occurred while creating the delivery note",
        variant: "destructive"
      });
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    setSalesItems([]);
    setManualBarcode('');
    setSelectedClientId('');
    setShowPrintSlip(false);
    setShowDeliveryNote(false);
    onClose();
  };

  // Handle delivery note input changes
  const handleDeliveryNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeliveryNote(prev => ({
      ...prev,
      [name]: name === 'deliveryCost' ? parseFloat(value) || 0 : value
    }));
  };

  // Load inventory and clients data
  useEffect(() => {
    const inventoryItems = getAllInventoryItems();
    setInventoryData(inventoryItems);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Sales
          </DialogTitle>
        </DialogHeader>

        {/* Print Styles - Essential for printing */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Normal display styles for items */
          .print-item-row {
            display: flex;
            width: 100%;
            margin-bottom: 6px;
            align-items: center;
          }
          .print-item-name { width: 40%; text-align: left; }
          .print-item-qty { width: 10%; text-align: center; }
          .print-item-price { width: 25%; text-align: right; }
          .print-item-total { width: 25%; text-align: right; }
          
          /* Shared print styles for both Sales Slip and Delivery Note */
          @media print {
            /* Basic page setup for thermal printer (80mm) */
            @page { margin: 0mm !important; size: 80mm auto !important; }
            
            /* Hide everything by default */
            html, body * {
              display: none;
            }
            
            /* Show only our print container */
            #print-target, #delivery-note-print-target {
              display: block !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: auto !important;
              z-index: 9999 !important;
              overflow: visible !important;
            }
            
            /* Show all contents of the printable elements */
            .print-slip, .delivery-note-print {
              display: block !important;
              width: 72mm !important; /* Actual printable width for 80mm thermal printer */
              background: white !important;
              color: black !important;
              padding: 2mm !important;
              margin: 0 auto !important;
              font-family: monospace !important; /* Better for thermal printers */
              box-shadow: none !important;
              overflow: visible !important;
              height: auto !important;
              font-size: 10px !important; /* Consistent font size for thermal printing */
            }
            
            /* Force display of ALL elements inside printable areas */
            .print-slip *, .delivery-note-print * {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
            }
            
            /* Format tables for thermal printing */
            .delivery-note-print table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 2mm 0 !important;
            }
            
            .delivery-note-print th {
              font-size: 10px !important;
              text-align: left !important;
              border-bottom: 1px solid black !important;
              padding: 1mm 0 !important;
            }
            
            .delivery-note-print td {
              font-size: 10px !important;
              padding: 1mm 0 !important;
            }
            
            .delivery-note-print .item-name { width: 40% !important; text-align: left !important; }
            .delivery-note-print .item-qty { width: 15% !important; text-align: center !important; }
            .delivery-note-print .item-price { width: 20% !important; text-align: right !important; }
            .delivery-note-print .item-total { width: 25% !important; text-align: right !important; }
            
            /* Headers and footers */
            .delivery-note-print h2, .print-slip h2 { 
              font-size: 12px !important; 
              font-weight: bold !important;
              text-align: center !important;
              margin: 1mm 0 !important;
            }
            
            .delivery-note-print h3, .print-slip h3 { 
              font-size: 11px !important; 
              font-weight: bold !important;
              margin: 1mm 0 !important;
            }
            
            .delivery-note-print p, .print-slip p, .delivery-note-print .text-xs, .print-slip .text-xs { 
              font-size: 10px !important; 
              margin: 0.5mm 0 !important;
            }
            
            /* Customer details section */
            .delivery-note-print .customer-details {
              border: 1px solid black !important;
              padding: 2mm !important;
              margin: 2mm 0 !important;
            }
            
            .delivery-note-print .customer-label {
              font-weight: bold !important;
              display: inline-block !important;
              width: 35% !important;
            }
            
            /* Totals section */
            .delivery-note-print .totals-section {
              border-top: 1px solid black !important;
              margin-top: 2mm !important;
              padding-top: 2mm !important;
            }
            
            .delivery-note-print .totals-row {
              display: flex !important;
              justify-content: space-between !important;
              margin: 0.5mm 0 !important;
            }
            
            .delivery-note-print .grand-total {
              font-weight: bold !important;
              border-top: 1px solid black !important;
              padding-top: 1mm !important;
              margin-top: 1mm !important;
            }
            
            /* Signature area */
            .delivery-note-print .signature-area {
              border-top: 1px dashed black !important;
              margin-top: 4mm !important;
              padding-top: 2mm !important;
              text-align: center !important;
            }
            
            /* Hide all non-printable elements */
            button, .dialog-header, .dialog-footer, [class*="print:hidden"], .print-hidden {
              display: none !important;
            }
          }
        `}} />

        {/* Print Slip View */}
        {printingDeliveryNote ? (
          <div id="delivery-note-print-target" className="print-container">
            <div className="delivery-note-print print:w-80 w-[80mm]" style={{ margin: '0 auto', padding: '8px', backgroundColor: 'white' }}>
              {/* Company Logo */}
              <div className="text-center mb-3">
                {companyLogo && (
                  <div className="flex justify-center mb-2">
                    <img 
                      src={companyLogo} 
                      alt="Company Logo" 
                      className="h-14 object-contain"
                      style={{ maxWidth: '80%', margin: '0 auto' }}
                    />
                  </div>
                )}
                
                {/* Company Information */}
                <h2 className="font-bold text-base mb-0.5">DELIVERY NOTE</h2>
                <h3 className="text-sm mb-0.5">
                  {companyInfo?.name || 'MOK MZANSI BOOKS'}
                </h3>
                <p className="text-xs mb-0.5">
                  {companyInfo?.email || 'admin@mokmzansibooks.com'}
                </p>
                <p className="text-xs mb-0.5">
                  {companyInfo?.phone || '+27 64 550 4029'}
                </p>
                <p className="text-xs mb-0.5">
                  {companyInfo?.addressLine1 || '123 Business Street'}
                </p>
                {(companyInfo?.postalCode || companyInfo?.country) && (
                  <p className="text-xs mb-0.5">
                    {companyInfo?.city && `${companyInfo.city}, `}
                    {companyInfo?.postalCode && `${companyInfo.postalCode} `}
                    {companyInfo?.country || 'Johannesburg, 2000'}
                  </p>
                )}
                <p className="text-xs mt-1 mb-1">{new Date().toLocaleDateString()}</p>
              </div>
              
              {/* Customer Details */}
              <div className="border p-2 mb-3 text-xs">
                <h3 className="font-bold mb-1">Customer Details:</h3>
                <p><span className="font-medium">Name:</span> {selectedClient?.companyName || selectedClient?.contactPerson || deliveryNote.customerName || 'Walk-in Customer'}</p>
                {(selectedClient?.contactPerson || deliveryNote.contactPerson) && (
                  <p><span className="font-medium">Contact:</span> {selectedClient?.contactPerson || deliveryNote.contactPerson}</p>
                )}
                <p><span className="font-medium">Tel:</span> {selectedClient?.phone || deliveryNote.phone || 'N/A'}</p>
                
                <h3 className="font-bold mt-2 mb-1">Delivery Address:</h3>
                <p>{deliveryNote.location || (selectedClient ? 
                  [selectedClient.billingStreet, 
                  selectedClient.billingCity, 
                  selectedClient.billingState, 
                  selectedClient.billingPostal, 
                  selectedClient.billingCountry]
                  .filter(Boolean).join(', ') : 'N/A')}</p>
              </div>
              
              {/* Items Header */}
              <div className="border-t border-b py-1 mb-2">
                <div className="flex text-xs font-bold">
                  <div className="w-5/12 text-left">Item</div>
                  <div className="w-2/12 text-center">Qty</div>
                  <div className="w-2/12 text-right">Price</div>
                  <div className="w-3/12 text-right">Total</div>
                </div>
              </div>
              
              {/* Sales Items */}
              {salesItems.map((item) => (
                <div key={item.id} className="flex text-[10px] mb-1">
                  <div className="w-5/12 text-left">{item.name}</div>
                  <div className="w-2/12 text-center">{item.quantity}</div>
                  <div className="w-2/12 text-right">{formatCurrency(item.price)}</div>
                  <div className="w-3/12 text-right">{formatCurrency(item.total)}</div>
                </div>
              ))}
              
              {/* Totals */}
              <div className="mt-3 pt-2 border-t">
                <div className="flex justify-between text-[10px]"><div>Items Subtotal:</div><div>{formatCurrency(baseSubtotal)}</div></div>
                {clientFinance.discountRate > 0 && (
                  <div className="flex justify-between text-[10px]"><div>Client Discount ({clientFinance.discountRate}%):</div><div className="text-red-600">- {formatCurrency(discountMeta.discountAmount)}</div></div>
                )}
                
                {vatAmount > 0 && (<div className="flex justify-between text-[10px]"><div>VAT ({vatPercentage}%):</div><div>{formatCurrency(vatAmount)}</div></div>)}
                
                <div className="flex justify-between text-[10px]">
                  <div>Delivery Cost:</div>
                  <div>{formatCurrency(deliveryNote.deliveryCost)}</div>
                </div>
                
                <div className="flex justify-between font-bold text-[10px] border-t mt-2 pt-1">
                  <div>TOTAL:</div>
                  <div>{formatCurrency(totalAmount + deliveryNote.deliveryCost)}</div>
                </div>
              </div>
              
              {/* Signature Area */}
              <div className="mt-6 pt-2 border-t border-dashed text-center text-[10px]">
                <p>Received in good order and condition.</p>
                <div style={{ height: '30px' }}></div>
                <p>_______________________</p>
                <p>Customer Signature</p>
                <p className="text-[9px] mt-1">Date: {new Date().toLocaleDateString()}</p>
              </div>
              
              <div className="text-center text-[10px] mt-4 mb-2">
                <p>Thank you for your business!</p>
              </div>
            </div>
            
            <div className="flex justify-between mt-4 print:hidden">
              <Button variant="outline" onClick={() => setPrintingDeliveryNote(false)}>
                Back
              </Button>
              <Button onClick={() => {
                // Print the delivery note
                setTimeout(() => {
                  try {
                    console.log('Delivery note print layout ready');
                    window.print();
                    toast({
                      title: "Print Initiated",
                      description: "The delivery note has been sent to your printer.",
                      variant: "default"
                    });
                  } catch (error) {
                    console.error('Print error:', error);
                    toast({
                      title: "Print error",
                      description: "There was an error printing: " + (error as Error).message,
                      variant: "destructive"
                    });
                  }
                }, 800);
              }}>
                <Printer className="h-4 w-4 mr-2" /> Print
              </Button>
            </div>
          </div>
        ) : printingSlip ? (
          <div id="print-target" className="print-container">
            <div className="print-slip print:w-80 w-[80mm]" style={{ margin: '0 auto', padding: '8px', backgroundColor: 'white' }}>
              {/* Company Logo */}
              <div className="text-center mb-3">
                {companyLogo && (
                  <div className="flex justify-center mb-2">
                    <img 
                      src={companyLogo} 
                      alt="Company Logo" 
                      className="h-14 object-contain"
                      style={{ maxWidth: '80%', margin: '0 auto' }}
                    />
                  </div>
                )}
                
                {/* Company Information */}
                <h2 className="font-bold text-base mb-0.5">
                  {companyInfo?.name || 'Morwa Moabelo (PTY) Ltd'}
                </h2>
                <p className="text-xs mb-0.5">
                  {companyInfo?.email || 'admin@mokmzansibooks.com'}
                </p>
                <p className="text-xs mb-0.5">
                  {companyInfo?.phone || '+27 64 550 4029'}
                </p>
                <p className="text-xs mb-0.5">
                  {companyInfo?.addressLine1 || '123 Business Street'}
                </p>
                {(companyInfo?.postalCode || companyInfo?.country) && (
                  <p className="text-xs mb-0.5">
                    {companyInfo?.city && `${companyInfo.city}, `}
                    {companyInfo?.postalCode && `${companyInfo.postalCode} `}
                    {companyInfo?.country || 'Johannesburg, 2000'}
                  </p>
                )}
                <p className="text-xs mt-1 mb-1">{new Date().toLocaleString()}</p>
              </div>
              
              {/* Items Header */}
              <div className="border-t border-b py-1 mb-2">
                <div className="print-item-row text-xs font-bold">
                  <div className="print-item-name">Item</div>
                  <div className="print-item-qty">Qty</div>
                  <div className="print-item-price">Price</div>
                  <div className="print-item-total">Total</div>
                </div>
              </div>
              
              {/* Sales Items */}
              {salesItems.map((item) => (
                <div key={item.id} className="print-item-row text-[10px]">
                  <div className="print-item-name">{item.name}</div>
                  <div className="print-item-qty">{item.quantity}</div>
                  <div className="print-item-price">{formatCurrency(item.price)}</div>
                  <div className="print-item-total">{formatCurrency(item.total)}</div>
                </div>
              ))}
              
              <div className="border-t mt-3 pt-2">
                <div className="flex justify-between text-[10px] mb-1"><div className="text-[10px] font-medium">Items Subtotal:</div><div className="text-[10px] font-medium">{formatCurrency(baseSubtotal)}</div></div>
                {clientFinance.discountRate > 0 && (<div className="flex justify-between text-[10px] mb-1"><div className="text-[10px] font-medium">Client Discount ({clientFinance.discountRate}%):</div><div className="text-[10px] font-medium text-red-600">- {formatCurrency(discountMeta.discountAmount)}</div></div>)}
                {vatPercentage > 0 && (<div className="flex justify-between text-[10px] mb-1"><div className="text-[10px] font-medium">VAT ({vatPercentage}%):</div><div className="text-[10px] font-medium">{formatCurrency(vatAmount)}</div></div>)}
                <div className="flex justify-between font-bold text-[10px] border-t mt-2 pt-2"><div className="text-[10px]">Total:</div><div className="text-[10px]">{formatCurrency(totalAmount)}</div></div>
              </div>
              
              <div className="text-center text-[10px] mt-4 mb-3 border-t pt-3">
                <p className="font-medium">Thank you for your business!</p>
                {companyInfo?.invoiceNotes && (
                  <p className="mt-1">{companyInfo.invoiceNotes}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-4 print:hidden">
              <Button variant="outline" onClick={() => setPrintingSlip(false)}>
                Back
              </Button>
              <Button onClick={() => {
                // Use the same improved print method as handlePrintSlip
                setTimeout(() => {
                  try {
                    // Make sure the print target exists and is visible
                    const printTarget = document.getElementById('print-target');
                    if (!printTarget) {
                      throw new Error('Print target not found');
                    }
                    
                    // Force browser to recognize content before printing
                    const printSlip = printTarget.querySelector('.print-slip') as HTMLElement;
                    if (printSlip) {
                      // Force reflow
                      void printSlip.offsetHeight;
                    }
                    
                    // Log and print
                    console.log('Print layout ready, executing print from preview button');
                    window.print();
                    
                    // Success message
                    toast({
                      title: "Print Initiated",
                      description: "The print slip has been sent to your printer.",
                      variant: "default"
                    });
                  } catch (error) {
                    console.error('Print error:', error);
                    toast({
                      title: "Print error",
                      description: "There was an error printing the slip: " + (error as Error).message,
                      variant: "destructive"
                    });
                  }
                }, 800); // Use same longer delay for consistent behavior
              }}>
                <Printer className="h-4 w-4 mr-2" /> Print
              </Button>
            </div>
          </div>
        ) : showDeliveryNote ? (
          /* Delivery Note Form */
          <div className="delivery-note-form space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Truck className="h-5 w-5 text-mokm-purple-500" /> 
                Delivery Note
              </h2>
              <p className="text-sm text-gray-500">
                Date: {new Date().toLocaleDateString()}
              </p>
            </div>
            
            {/* Client Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-sm font-medium">Customer Name</Label>
                  <Input 
                    id="customerName" 
                    name="customerName" 
                    value={deliveryNote.customerName} 
                    onChange={handleDeliveryNoteChange} 
                    className="shadow-sm focus:ring-2 focus:ring-mokm-pink-500"
                    placeholder="Enter customer name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerSurname" className="text-sm font-medium">Customer Surname</Label>
                  <Input 
                    id="customerSurname" 
                    name="customerSurname" 
                    value={deliveryNote.customerSurname} 
                    onChange={handleDeliveryNoteChange} 
                    className="shadow-sm focus:ring-2 focus:ring-mokm-pink-500"
                    placeholder="Enter customer surname"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium">Delivery Location</Label>
                  <Input 
                    id="location" 
                    name="location" 
                    value={deliveryNote.location} 
                    onChange={handleDeliveryNoteChange} 
                    className="shadow-sm focus:ring-2 focus:ring-mokm-pink-500"
                    placeholder="Enter delivery location"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deliveryCost" className="text-sm font-medium flex items-center">
                    <Truck className="h-4 w-4 mr-1 text-mokm-pink-500" /> 
                    Delivery Cost ({getCurrencySymbol()})
                  </Label>
                  <Input 
                    id="deliveryCost" 
                    name="deliveryCost" 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={deliveryNote.deliveryCost} 
                    onChange={handleDeliveryNoteChange} 
                    className="shadow-sm focus:ring-2 focus:ring-mokm-pink-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1" className="text-sm font-medium">Address Line 1</Label>
                  <Input 
                    id="addressLine1" 
                    name="addressLine1" 
                    value={deliveryNote.addressLine1} 
                    onChange={handleDeliveryNoteChange} 
                    className="shadow-sm focus:ring-2 focus:ring-mokm-pink-500"
                    placeholder="Street address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="addressLine2" className="text-sm font-medium">Address Line 2</Label>
                  <Input 
                    id="addressLine2" 
                    name="addressLine2" 
                    value={deliveryNote.addressLine2} 
                    onChange={handleDeliveryNoteChange} 
                    className="shadow-sm focus:ring-2 focus:ring-mokm-pink-500"
                    placeholder="Apartment, suite, etc."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressLine3" className="text-sm font-medium">City</Label>
                    <Input 
                      id="addressLine3" 
                      name="addressLine3" 
                      value={deliveryNote.addressLine3} 
                      onChange={handleDeliveryNoteChange} 
                      className="shadow-sm focus:ring-2 focus:ring-mokm-pink-500"
                      placeholder="City"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="addressLine4" className="text-sm font-medium">Postal Code</Label>
                    <Input 
                      id="addressLine4" 
                      name="addressLine4" 
                      value={deliveryNote.addressLine4} 
                      onChange={handleDeliveryNoteChange} 
                      className="shadow-sm focus:ring-2 focus:ring-mokm-pink-500"
                      placeholder="Postal code"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sales Items Table */}
            <div className="space-y-3">
              <h3 className="text-md font-medium text-gray-700 border-b pb-2">Items for Delivery</h3>
              
              {salesItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
                  No items added yet. Add items to the sales list first.
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price ({getCurrencySymbol()})</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total ({getCurrencySymbol()})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {salesItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-800">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 text-right">{formatCurrency(item.price)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-800 text-right">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Customer Signature Section */}
            <div className="space-y-2">
              <Label htmlFor="signature" className="text-sm font-medium">Customer Signature</Label>
              <div className="border rounded-md p-4 h-32 flex items-center justify-center bg-gray-50">
                <p className="text-gray-400 text-center">
                  Customer Acknowledgement of Goods Received
                  <br />
                  <span className="text-xs mt-1 block">In a production app, a signature capture component would be implemented here</span>
                </p>
              </div>
            </div>
            
            {/* Total Section with enhanced styling */}
            <div className="rounded-lg border overflow-hidden">
              <div className="bg-gray-50 p-4">
                <h3 className="font-medium text-gray-700 mb-2">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotalAmount)}</span>
                  </div>
                  
                  {vatPercentage > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">VAT ({vatPercentage}%):</span>
                      <span>{formatCurrency(vatAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Cost:</span>
                    <span>{formatCurrency(deliveryNote.deliveryCost)}</span>
                  </div>
                  
                  <div className="pt-2 mt-2 border-t flex justify-between">
                    <span className="font-semibold">Grand Total:</span>
                    <span className="font-semibold text-mokm-purple-600">{formatCurrency(totalAmount + deliveryNote.deliveryCost)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowDeliveryNote(false)}
                className="px-4"
              >
                <X className="h-4 w-4 mr-2" /> Back
              </Button>
              
              <div className="space-x-3">
                <Button 
                  onClick={handleDeliveryNoteSubmit}
                  className="bg-gradient-to-r from-mokm-pink-500 to-mokm-purple-500 text-white hover:opacity-90"
                >
                  <Download className="h-4 w-4 mr-2" /> Create Delivery Note PDF
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Main Sales Interface */
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="scan">Scan Barcode</TabsTrigger>
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              </TabsList>
              
              <TabsContent value="scan" className="space-y-4">
                <div className="border rounded-lg p-4 h-64 flex items-center justify-center">
                  <Button 
                    onClick={() => {
                      // Create iframe overlay with pointer-events enabled ONLY for backdrop close
                      const scannerOverlay = document.createElement('div');
                      scannerOverlay.id = 'barcode-scanner-overlay';
                      scannerOverlay.style.position = 'fixed';
                      scannerOverlay.style.top = '0';
                      scannerOverlay.style.left = '0';
                      scannerOverlay.style.width = '100%';
                      scannerOverlay.style.height = '100%';
                      scannerOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Lighter overlay
                      scannerOverlay.style.zIndex = '9999';
                      scannerOverlay.style.display = 'flex';
                      scannerOverlay.style.justifyContent = 'center';
                      scannerOverlay.style.alignItems = 'center';
                      scannerOverlay.style.transition = 'opacity 0.3s ease';
                      // Critical: Add these properties to fix focus and event handling
                      scannerOverlay.style.pointerEvents = 'all'; // Only allow clicks on the overlay background
                      document.body.appendChild(scannerOverlay);
                      
                      // Create iframe wrapper with better styling and proper event handling
                      const frameWrapper = document.createElement('div');
                      frameWrapper.id = 'scanner-frame-wrapper';
                      frameWrapper.style.width = '90%';
                      frameWrapper.style.maxWidth = '500px';
                      frameWrapper.style.height = '80%';
                      frameWrapper.style.maxHeight = '600px';
                      frameWrapper.style.backgroundColor = 'white';
                      frameWrapper.style.borderRadius = '16px';
                      frameWrapper.style.overflow = 'hidden';
                      frameWrapper.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
                      frameWrapper.style.transition = 'transform 0.3s ease';
                      frameWrapper.style.transform = 'translateY(0)';
                      frameWrapper.style.pointerEvents = 'auto'; // Critical: Allow clicks through to iframe
                      frameWrapper.style.position = 'relative'; // Establish stacking context
                      frameWrapper.style.zIndex = '10000'; // Higher than overlay
                      scannerOverlay.appendChild(frameWrapper);
                      
                      // Create and append iframe with proper attributes
                      const scannerFrame = document.createElement('iframe');
                      scannerFrame.id = 'barcode-scanner-frame';
                      // Add a cache-busting parameter to prevent cached issues
                      scannerFrame.src = `/barcode-scanner.html?v=${Date.now()}`;
                      scannerFrame.style.width = '100%';
                      scannerFrame.style.height = '100%';
                      scannerFrame.style.border = 'none';
                      // Explicitly allow camera access with all needed permissions
                      scannerFrame.allow = 'camera; microphone; fullscreen; display-capture';
                      scannerFrame.setAttribute('allowfullscreen', 'true');
                      // Add direct interaction attributes with all needed permissions
                      scannerFrame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms allow-modals');
                      // Ensure iframe has focus for keyboard and click events
                      scannerFrame.setAttribute('tabindex', '0');
                      scannerFrame.style.pointerEvents = 'auto';
                      frameWrapper.appendChild(scannerFrame);
                      
                      // Focus the iframe immediately to ensure it captures events
                      setTimeout(() => {
                        try {
                          scannerFrame.focus();
                          console.log('Iframe focused');
                        } catch (e) {
                          console.error('Error focusing iframe:', e);
                        }
                      }, 100);
                      
                      // Play animation
                      requestAnimationFrame(() => {
                        frameWrapper.style.transform = 'translateY(0)';
                      });
                      
                      // Set up message event listener with proper cleanup
                      const messageListener = (event: MessageEvent) => {
                        // Validate message origin for security
                        if (event.origin !== window.location.origin) return;
                        
                        console.log('Message received from scanner:', event.data?.type);
                        
                        switch (event.data?.type) {
                          case 'SCANNER_READY':
                            // Scanner is ready, we can interact with it
                            console.log('Scanner is ready for use');
                            break;
                            
                          case 'BARCODE_DETECTED': {
                            // Handle successful scan
                            const barcode = event.data.value;
                            
                            // Play success sound (browser may block without user gesture)
                            try {
                              const audio = new Audio('/beep.mp3');
                              audio.play().catch(e => console.log('Audio play failed: ', e));
                            } catch (e) {
                              console.log('Audio creation failed: ', e);
                            }
                            
                            // Show toast notification
                            toast({
                              title: '✓ Barcode Scanned',
                              description: `${barcode}`,
                              duration: 3000
                            });
                            
                            // Process the barcode
                            handleScanResult(barcode);
                            
                            // Animate out and clean up with delay for smooth UX
                            closeScanner();
                            break;
                          }
                            
                          case 'SCANNER_CLOSED':
                            // Scanner was closed from inside the iframe
                            closeScanner();
                            break;
                            
                          case 'SCANNER_ACTIVE':
                            // Scanner is now actively scanning
                            console.log('Scanner is now active and scanning');
                            break;
                            
                          case 'SCANNER_STOPPED':
                            // Scanner was stopped from inside the iframe
                            console.log('Scanner was stopped');
                            break;
                        }
                      };
                      
                      // Function to close the scanner modal
                      const closeScanner = () => {
                        // Animate out
                        frameWrapper.style.transform = 'translateY(10px)';
                        scannerOverlay.style.opacity = '0';
                        
                        // First ensure scanner is stopped
                        try {
                          scannerFrame.contentWindow?.postMessage({ type: 'STOP_SCANNER' }, '*');
                        } catch (e) {
                          console.error('Error stopping scanner:', e);
                        }
                        
                        // Then remove from DOM after animation
                        setTimeout(() => {
                          if (scannerOverlay.parentNode) {
                            document.body.removeChild(scannerOverlay);
                          }
                          window.removeEventListener('message', messageListener);
                        }, 300);
                      };
                      
                      // Add event listener
                      window.addEventListener('message', messageListener);
                      
                      // Add click handler to close when clicking outside
                      scannerOverlay.addEventListener('click', (e) => {
                        if (e.target === scannerOverlay) {
                          closeScanner();
                        }
                      });
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-mokm-pink-500 to-mokm-purple-500 hover:opacity-90 transition-all"
                  >
                    <Camera className="h-5 w-5" />
                    Open Barcode Scanner
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-4">
                  <Label htmlFor="barcode">Barcode / Item ID</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="barcode"
                      placeholder="Enter barcode or item ID" 
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                      className="shadow-sm border-gray-300 focus:border-mokm-pink-500 focus:ring-mokm-pink-500"
                      autoFocus
                    />
                    <Button 
                      type="button" 
                      onClick={handleManualSubmit} 
                      disabled={!manualBarcode}
                      className="bg-gradient-to-r from-mokm-pink-500 to-mokm-purple-500"
                    >
                      Add Item
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Enter a barcode or item ID and press Enter or click Add Item.
                    <br/>
                    You can also use a USB barcode scanner that works as a keyboard input device.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Sales Items List */}
            <div className="mt-6">
              <h3 className="font-medium mb-2">Sales Items</h3>
              
              {salesItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No items added yet. Scan or enter a barcode to add items.
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Image</th>
                        <th className="px-4 py-2 text-left">Product</th>
                        <th className="px-4 py-2 text-center">Quantity</th>
                        <th className="px-4 py-2 text-right">Price</th>
                        <th className="px-4 py-2 text-right">Total</th>
                        <th className="px-4 py-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesItems.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="px-4 py-2">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="h-10 w-10 object-cover rounded"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2">
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => updateItemQuantity(item.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => updateItemQuantity(item.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right">{formatCurrency(item.price)}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(item.total)}</td>
                          <td className="px-4 py-2 text-center">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500" 
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-right font-medium">Subtotal:</td>
                        <td className="px-4 py-2 text-right font-medium">{formatCurrency(subtotalAmount)}</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right font-medium">VAT (%):</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-2">
                            <Input 
                              type="number" 
                              min="0" 
                              max="100" 
                              value={vatPercentage} 
                              onChange={(e) => setVatPercentage(parseFloat(e.target.value) || 0)}
                              className="w-20 text-right" 
                            />
                            <Percent className="h-4 w-4 text-gray-500" />
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right font-medium">{formatCurrency(vatAmount)}</td>
                        <td></td>
                      </tr>
                      <tr className="border-t">
                        <td colSpan={4} className="px-4 py-2 text-right font-medium">Total:</td>
                        <td className="px-4 py-2 text-right font-bold">{formatCurrency(totalAmount)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
              
              {/* Client Selection */}
              {salesItems.length > 0 && (
                <div className="mt-4">
                  <Label htmlFor="clientSelect">Select Client (for Quotation/Invoice)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        id="clientSelect"
                        className="w-full justify-between font-normal"
                      >
                        {selectedClientId
                          ? clients.find((client) => client.id === selectedClientId)?.companyName || 
                            clients.find((client) => client.id === selectedClientId)?.contactPerson ||
                            "Select Client for this Sale"
                          : "Select Client for this Sale"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search clients..." />
                        <CommandEmpty>
                          <div className="flex flex-col items-center justify-center py-6 text-center">
                            <UserIcon className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-1">No clients found.</p>
                            <p className="text-xs text-muted-foreground">⚠️ Please add clients from the Clients Page.</p>
                          </div>
                        </CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-auto">
                          {clients.map((client) => (
                            <CommandItem
                              key={client.id}
                              value={client.id}
                              onSelect={() => {
                                setSelectedClientId(client.id);
                              }}
                              className="flex items-center gap-2 py-3"
                            >
                              <div className="flex items-center gap-3 w-full">
                                <div className="w-8 h-8 bg-gradient-to-br from-mokm-purple-500 to-mokm-blue-500 rounded-xl flex items-center justify-center shadow-colored">
                                  <span className="text-white font-semibold text-sm">
                                    {client.contactPerson?.substring(0, 2) || client.companyName?.substring(0, 2) || "CL"}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {client.companyName || client.contactPerson}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {client.email || client.phone || "No contact info"}
                                  </span>
                                </div>
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedClientId === client.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-6 justify-between">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handlePrintSlip} disabled={salesItems.length === 0}>
                    <Printer className="h-4 w-4 mr-2" /> Print Slip
                  </Button>
                  
                  <Button variant="outline" onClick={handleSendToQuotation} disabled={salesItems.length === 0}>
                    <FileText className="h-4 w-4 mr-2" /> Send to Quotation
                  </Button>
                  
                  <Button variant="outline" onClick={handleSendToInvoice} disabled={salesItems.length === 0}>
                    <FileCheck className="h-4 w-4 mr-2" /> Send to Invoice
                  </Button>
                  
                  <Button variant="outline" onClick={handleDeliveryNote} disabled={salesItems.length === 0}>
                    <Truck className="h-4 w-4 mr-2" /> Delivery Note
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SalesModal;
