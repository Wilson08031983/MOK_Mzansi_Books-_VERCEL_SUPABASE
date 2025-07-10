import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Printer, FileText, FileCheck, Truck, Search, X, Minus, Plus, Camera, ShoppingCart, Trash2, Percent } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllInventoryItems, updateInventoryItem, getInventoryItemByBarcode, saveInventoryItems } from '@/services/inventoryService';
import { getClients, Client as ClientType } from '@/services/clientService';
import companyService from '@/services/companyService';
import BarcodeScanner from '@/components/inventory/BarcodeScanner';
import { formatCurrency } from '@/lib/utils';
import { InventoryItem, StockHistoryEntry } from '@/types/inventory';

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
}

interface SalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SalesModal: React.FC<SalesModalProps> = ({ isOpen, onClose }) => {
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
  const [clients, setClients] = useState<ClientType[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [companyInfo, setCompanyInfo] = useState<import('@/types/company').Company | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string>('');
  const [deliveryNote, setDeliveryNote] = useState<DeliveryNote>({
    customerName: '',
    customerSurname: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressLine4: '',
    deliveryCost: 0,
    location: '',
    signature: ''
  });
  const { toast } = useToast();

  // Load clients and company information on component mount
  useEffect(() => {
    if (isOpen) {
      try {
        // Load clients
        const loadedClients = getClients();
        setClients(loadedClients);
        
        // Direct localStorage access for company information as backup
        const directCompanyData = localStorage.getItem('mokMzansiBooks_company');
        const directCompanyAssets = localStorage.getItem('mokMzansiBooks_company_assets');
        
        // Parse data and set state
        if (directCompanyData) {
          const parsedCompany = JSON.parse(directCompanyData);
          setCompanyInfo(parsedCompany);
          console.log('Direct company data loaded:', parsedCompany);
        } else {
          // Fallback to service
          const company = companyService.getCompany();
          setCompanyInfo(company);
          console.log('Service company data loaded:', company);
        }
        
        // Parse assets and set logo
        if (directCompanyAssets) {
          const parsedAssets = JSON.parse(directCompanyAssets);
          if (parsedAssets && parsedAssets.logo) {
            setCompanyLogo(parsedAssets.logo);
            console.log('Direct company logo loaded:', parsedAssets.logo);
          }
        } else {
          // Fallback to service
          const assets = companyService.getCompanyAssets();
          if (assets && assets.logo) {
            setCompanyLogo(assets.logo);
            console.log('Service company logo loaded:', assets.logo);
          }
        }
      } catch (error) {
        console.error('Error loading company data:', error);
      }
    }
  }, [isOpen]);

  // Calculate subtotal, VAT, and total amount whenever salesItems or vatPercentage changes
  useEffect(() => {
    const subtotal = salesItems.reduce((sum, item) => sum + item.total, 0);
    const vat = subtotal * (vatPercentage / 100);
    const total = subtotal + vat;
    
    setSubtotalAmount(subtotal);
    setVatAmount(vat);
    setTotalAmount(total);
  }, [salesItems, vatPercentage]);

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
            
            // Show success message
            toast({
              title: "Print Initiated",
              description: "The print slip has been sent to your printer.",
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

    if (!selectedClientId) {
      toast({
        title: "No client selected",
        description: "Please select a client before sending to quotation",
        variant: "destructive"
      });
      return;
    }

    // Get existing quotations or initialize empty array
    const existingQuotations = JSON.parse(localStorage.getItem('quotations') || '[]');
    
    // Create new quotation
    const newQuotation = {
      id: `QUO-${Date.now()}`,
      clientId: selectedClientId,
      client: clients.find(client => client.id === selectedClientId)?.companyName || clients.find(client => client.id === selectedClientId)?.contactPerson || 'Unknown Client',
      date: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      status: 'draft',
      items: salesItems.map(item => ({
        itemNo: item.itemId,
        description: item.name,
        quantity: item.quantity,
        rate: item.price,
        markupPercent: 0,
        discount: 0,
        amount: item.total
      })),
      subtotal: subtotalAmount,
      tax: vatAmount,
      total: totalAmount,
      vatPercentage: vatPercentage
    };

    // Save updated quotations to localStorage
    localStorage.setItem('quotations', JSON.stringify([...existingQuotations, newQuotation]));

    // Update inventory quantities
    updateInventoryQuantities();

    toast({
      title: "Quotation created",
      description: `Quotation ${newQuotation.id} created successfully`,
    });

    onClose();
  };

  // Handle send to invoice action
  const handleSendToInvoice = () => {
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

    // Get existing invoices or initialize empty array
    const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    
    // Create new invoice
    const newInvoice = {
      id: `INV-${Date.now()}`,
      clientId: selectedClientId,
      client: clients.find(client => client.id === selectedClientId)?.companyName || clients.find(client => client.id === selectedClientId)?.contactPerson || 'Unknown Client',
      date: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      status: 'pending',
      items: salesItems.map(item => ({
        itemNo: item.itemId,
        description: item.name,
        quantity: item.quantity,
        rate: item.price,
        markupPercent: 0,
        discount: 0,
        amount: item.total
      })),
      subtotal: subtotalAmount,
      tax: vatAmount,
      total: totalAmount,
      vatPercentage: vatPercentage
    };

    // Save updated invoices to localStorage
    localStorage.setItem('invoices', JSON.stringify([...existingInvoices, newInvoice]));

    // Update inventory quantities
    updateInventoryQuantities();

    toast({
      title: "Invoice created",
      description: `Invoice ${newInvoice.id} created successfully`,
    });

    onClose();
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

  // Handle delivery note form submission
  const handleDeliveryNoteSubmit = () => {
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

    // Update inventory quantities
    updateInventoryQuantities();

    toast({
      title: "Delivery note created",
      description: `Delivery note created successfully`,
    });

    setShowDeliveryNote(false);
    onClose();
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
    
    // Reset sales items
    setSalesItems([]);
    setVatPercentage(0);
    setSelectedClientId('');
    
    // Close modal
    onClose();
    
    // Show success message
    toast({
      title: "Sale completed",
      description: "Sale has been completed successfully",
    });
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

        {/* Basic styling for print slip */}
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
          
          /* Critical Print Settings - LAST RESORT APPROACH */
          @media print {
            /* Basic page setup */
            @page { margin: 0mm !important; size: 80mm auto !important; }
            
            /* Hide everything by default */
            html, body * {
              display: none;
            }
            
            /* Show only our print container */
            #print-target {
              display: block !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: auto !important;
              z-index: 9999 !important;
              overflow: visible !important;
            }
            
            /* Show all contents of the print slip */
            .print-slip {
              display: block !important;
              width: 80mm !important;
              background: white !important;
              color: black !important;
              padding: 5mm !important;
              margin: 0 auto !important;
              font-family: Arial, sans-serif !important;
              box-shadow: none !important;
              overflow: visible !important;
              height: auto !important;
            }
            
            /* Force display of ALL elements inside slip */
            .print-slip * {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
            }
            
            /* Special handling for flex items */
            .print-item-row {
              display: flex !important;
              width: 100% !important;
              margin-bottom: 3px !important;
            }
            
            /* Format columns */
            .print-item-name { 
              width: 40% !important; 
              text-align: left !important; 
              display: inline-block !important;
            }
            .print-item-qty { 
              width: 10% !important; 
              text-align: center !important; 
              display: inline-block !important;
            }
            .print-item-price, .print-item-total { 
              width: 25% !important; 
              text-align: right !important; 
              display: inline-block !important;
            }
            
            /* Force proper text display */
            .print-slip h2 { 
              font-size: 14px !important; 
              font-weight: bold !important;
              text-align: center !important;
              margin-bottom: 4px !important;
            }
            
            .print-slip p, .print-slip .text-xs { 
              font-size: 10px !important; 
              margin-bottom: 2px !important;
              text-align: center !important;
            }
            
            /* Border styles */
            .print-slip .border-t {
              border-top: 1px solid black !important;
              padding-top: 2px !important;
              margin-top: 2px !important;
            }
            
            .print-slip .border-b {
              border-bottom: 1px solid black !important;
              padding-bottom: 2px !important;
              margin-bottom: 2px !important;
            }
            
            /* Fix flexbox layouts */
            .print-slip .flex {
              display: flex !important;
              width: 100% !important;
            }
            
            .print-slip .flex.justify-between {
              justify-content: space-between !important;
            }
            
            /* Center text where needed */
            .print-slip .text-center {
              text-align: center !important;
            }
            
            /* Hide buttons */
            button, [class*="print:hidden"], [class*="print-hidden"] {
              display: none !important;
            }
          }
        `}} />

        {/* Print Slip View */}
        {printingSlip ? (
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
                <div className="flex justify-between text-[10px] mb-1">
                  <div className="text-[10px] font-medium">Subtotal:</div>
                  <div className="text-[10px] font-medium">{formatCurrency(subtotalAmount)}</div>
                </div>
                
                {vatPercentage > 0 && (
                  <div className="flex justify-between text-[10px] mb-1">
                    <div className="text-[10px] font-medium">VAT ({vatPercentage}%):</div>
                    <div className="text-[10px] font-medium">{formatCurrency(vatAmount)}</div>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-[10px] border-t mt-2 pt-2">
                  <div className="text-[10px]">Total:</div>
                  <div className="text-[10px]">{formatCurrency(totalAmount)}</div>
                </div>
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
          <div className="delivery-note-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input 
                  id="customerName" 
                  name="customerName" 
                  value={deliveryNote.customerName} 
                  onChange={handleDeliveryNoteChange} 
                />
              </div>
              <div>
                <Label htmlFor="customerSurname">Customer Surname</Label>
                <Input 
                  id="customerSurname" 
                  name="customerSurname" 
                  value={deliveryNote.customerSurname} 
                  onChange={handleDeliveryNoteChange} 
                />
              </div>
              <div>
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input 
                  id="addressLine1" 
                  name="addressLine1" 
                  value={deliveryNote.addressLine1} 
                  onChange={handleDeliveryNoteChange} 
                />
              </div>
              <div>
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input 
                  id="addressLine2" 
                  name="addressLine2" 
                  value={deliveryNote.addressLine2} 
                  onChange={handleDeliveryNoteChange} 
                />
              </div>
              <div>
                <Label htmlFor="addressLine3">Address Line 3</Label>
                <Input 
                  id="addressLine3" 
                  name="addressLine3" 
                  value={deliveryNote.addressLine3} 
                  onChange={handleDeliveryNoteChange} 
                />
              </div>
              <div>
                <Label htmlFor="addressLine4">Address Line 4</Label>
                <Input 
                  id="addressLine4" 
                  name="addressLine4" 
                  value={deliveryNote.addressLine4} 
                  onChange={handleDeliveryNoteChange} 
                />
              </div>
              <div>
                <Label htmlFor="deliveryCost">Delivery Cost (ZAR)</Label>
                <Input 
                  id="deliveryCost" 
                  name="deliveryCost" 
                  type="number" 
                  value={deliveryNote.deliveryCost} 
                  onChange={handleDeliveryNoteChange} 
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  name="location" 
                  value={deliveryNote.location} 
                  onChange={handleDeliveryNoteChange} 
                />
              </div>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="signature">Customer Signature</Label>
              <div className="border rounded-md p-4 h-32 flex items-center justify-center bg-gray-50">
                <p className="text-gray-400">Customer Acknowledgement of Goods Received</p>
                {/* In a real app, you would implement a signature pad here */}
              </div>
            </div>
            
            <div className="mb-4 border rounded-md p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Order Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Subtotal:</div>
                <div className="text-right">{formatCurrency(subtotalAmount)}</div>
                
                {vatPercentage > 0 && (
                  <>
                    <div>VAT ({vatPercentage}%):</div>
                    <div className="text-right">{formatCurrency(vatAmount)}</div>
                  </>
                )}
                
                <div>Delivery Cost:</div>
                <div className="text-right">{formatCurrency(deliveryNote.deliveryCost)}</div>
                
                <div className="font-medium">Total:</div>
                <div className="text-right font-medium">{formatCurrency(totalAmount + deliveryNote.deliveryCost)}</div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowDeliveryNote(false)}>
                Back
              </Button>
              <Button onClick={handleDeliveryNoteSubmit}>
                Create Delivery Note
              </Button>
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
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger id="clientSelect">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.companyName || client.contactPerson}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
