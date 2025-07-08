import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, Loader2, PackageOpen, RefreshCw, Scan, Barcode } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { InventoryItem } from '@/types/inventory';
import { updateInventoryItem, getInventoryItemById, getAllInventoryItems, getInventoryItemByBarcode } from '@/services/inventoryService';
import { getAllSuppliers } from '@/services/supplierService';
import { Supplier } from '@/types/supplier';

interface ReceiveStockFormProps {
  item: InventoryItem | null;
  onClose: () => void;
  initialBarcode?: string;
}

const ReceiveStockForm: React.FC<ReceiveStockFormProps> = ({ item: initialItem, onClose, initialBarcode }) => {
  const { toast } = useToast();
  const [item, setItem] = useState<InventoryItem | null>(initialItem);
  const [quantity, setQuantity] = useState<number>(1);
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [supplier, setSupplier] = useState<string>(initialItem?.supplier || '');
  const [receiveDate, setReceiveDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [openSupplierDropdown, setOpenSupplierDropdown] = useState<boolean>(false);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [barcode, setBarcode] = useState<string>(initialBarcode || initialItem?.barcode || '');
  const [barcodeScanned, setBarcodeScanned] = useState<boolean>(!!initialBarcode);

  // Load suppliers for dropdown
  useEffect(() => {
    const loadSuppliers = () => {
      try {
        const allSuppliers = getAllSuppliers();
        setSuppliers(allSuppliers);
      } catch (error) {
        console.error('Error loading suppliers:', error);
      }
    };
    
    loadSuppliers();
  }, []);
  
  // Handle initial barcode if provided
  useEffect(() => {
    if (initialBarcode && !item) {
      // Try to find an item with this barcode
      const items = getAllInventoryItems();
      const matchingItem = items.find(i => i.barcode === initialBarcode);
      
      if (matchingItem) {
        setItem(matchingItem);
        setSupplier(matchingItem.supplier || '');
        setBarcodeScanned(true);
        
        toast({
          title: "Item found",
          description: `${matchingItem.description} has been loaded for updating`,
          variant: "default",
        });
      } else {
        toast({
          title: "Item not found",
          description: `No inventory item found with barcode ${initialBarcode}`,
          variant: "destructive",
        });
      }
    }
  }, [initialBarcode, toast, item]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item) {
      setIsError(true);
      setErrorMessage('Item not found');
      return;
    }
    
    // Validation
    if (!quantity || quantity <= 0) {
      setIsError(true);
      setErrorMessage('Please enter a valid quantity');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get the latest item data to ensure we have the most current stock level
      const freshItem = getInventoryItemById(item.id);
      
      if (!freshItem) {
        throw new Error('Item not found in inventory');
      }
      
      // Calculate new stock level by adding the received quantity
      const newStockLevel = freshItem.stockLevel + quantity;
      
      // Update the item with new stock level and other details
      const updates = {
        stockLevel: newStockLevel,
        supplier: supplier,
        lastUpdated: new Date().toISOString(),
        notes: `Received ${quantity} units. Reference: ${referenceNumber || 'N/A'}`
      };
      
      // Update the item in localStorage
      const result = updateInventoryItem(item.id, updates);
      
      if (result) {
        // Show success toast
        toast({
          title: 'Stock Updated',
          description: `Successfully added ${quantity} units to ${item.name}`,
          variant: 'default',
        });
        
        // Close the form
        onClose();
      } else {
        throw new Error('Failed to update stock');
      }
    } catch (error) {
      setIsError(true);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      
      toast({
        title: 'Error',
        description: `Failed to update stock: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!item) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Item Not Found</DialogTitle>
          </DialogHeader>
          <div className="my-4">
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                The requested inventory item could not be found. It may have been deleted.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <PackageOpen className="h-5 w-5 text-mokm-orange-600" />
            Receive Stock for {item ? item.description : 'Unknown Item'}
          </DialogTitle>
        </DialogHeader>
        
        {/* Error Message */}
        {isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage || 'An error occurred. Please try again.'}</AlertDescription>
          </Alert>
        )}
        
        {/* No Item Selected Message */}
        {!item && (
          <Alert variant="warning" className="mb-4 border-amber-300 text-amber-800 bg-amber-50">
            <AlertTitle>No Item Selected</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>Please scan a barcode or select an inventory item.</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowScanner(true)}
                className="ml-2 shadow-business hover:shadow-business-lg"
              >
                <Scan className="h-4 w-4 mr-2" /> Scan
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="current-stock">Current Stock</Label>
              <span className="text-sm font-medium">{item.stockLevel} units</span>
            </div>
            <Input 
              id="current-stock"
              value={item.stockLevel}
              disabled
              className="bg-slate-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="required">Quantity to Add</Label>
            <Input 
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
              required
              className="shadow-business"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number (Optional)</Label>
            <Input 
              id="reference"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="PO-12345"
              className="shadow-business"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Popover open={openSupplierDropdown} onOpenChange={setOpenSupplierDropdown}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openSupplierDropdown}
                  className="w-full justify-between shadow-business"
                >
                  {supplier
                    ? supplier
                    : "Select supplier..."}
                  <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search suppliers..." />
                  <CommandEmpty>No supplier found.</CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-auto">
                    {suppliers.map((sup) => (
                      <CommandItem
                        key={sup.id}
                        value={sup.name}
                        onSelect={() => {
                          setSupplier(sup.name);
                          setOpenSupplierDropdown(false);
                        }}
                      >
                        {sup.name}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            supplier === sup.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receive-date">Date Received</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal shadow-business"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {receiveDate ? format(receiveDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={receiveDate}
                  onSelect={(date) => date && setReceiveDate(date)}
                  initialFocus
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col space-y-2 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">New Stock Level:</span>
              <span className="font-bold text-lg text-mokm-purple-600">{item.stockLevel + quantity} units</span>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleReceiveStock} 
              disabled={!item || isLoading || quantity < 1}
              className="bg-gradient-to-r from-mokm-pink-500 to-mokm-purple-500 text-white shadow-colored hover:shadow-colored-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Receive Stock
                </>
              )}
            </Button>
          </DialogFooter>
          
          
          {/* Lazy load the barcode scanner component */}
          {showScanner && (
            <EnhancedBarcodeScannerWrapper 
              onScanSuccess={(scannedBarcode) => {
                setBarcode(scannedBarcode);
                setBarcodeScanned(true);
                setShowScanner(false);
                
                // Look up item by barcode
                const foundItem = getInventoryItemByBarcode(scannedBarcode);
                if (foundItem) {
                  setItem(foundItem);
                  setSupplier(foundItem.supplier || '');
                  
                  toast({
                    title: "Item found",
                    description: `${foundItem.description} has been loaded`,
                    variant: "default",
                  });
                } else {
                  toast({
                    title: "Item not found",
                    description: `No inventory item found with barcode ${scannedBarcode}`,
                    variant: "destructive",
                  });
                }
              }}
              onClose={() => setShowScanner(false)}
              scannerTitle="Scan Inventory Item"
              scannerDescription="Scan a barcode to find and update an inventory item"
            />
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Wrap the dynamically imported scanner component to handle Suspense properly
const EnhancedBarcodeScanner = lazy(() => import('./EnhancedBarcodeScanner'));

interface EnhancedBarcodeScannerWrapperProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
  scannerTitle: string;
  scannerDescription: string;
}

const EnhancedBarcodeScannerWrapper: React.FC<EnhancedBarcodeScannerWrapperProps> = (props) => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-mokm-pink-500" /></div>}>
      <EnhancedBarcodeScanner {...props} />
    </Suspense>
  );
};

export default ReceiveStockForm;
