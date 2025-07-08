import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, Loader2, PackageOpen, RefreshCw, QrCode, AlertCircle, ChevronsUpDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { InventoryItem } from '@/types/inventory';
import { updateInventoryItem, getInventoryItemById } from '@/services/inventoryService';
import { getAllSuppliers } from '@/services/supplierService';
import { Supplier } from '@/types/supplier';
import BarcodeScanner from './BarcodeScanner';

interface ReceiveStockFormProps {
  item: InventoryItem | null;
  onClose: () => void;
}

const ReceiveStockForm: React.FC<ReceiveStockFormProps> = ({ item, onClose }) => {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState<number>(1);
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [supplier, setSupplier] = useState<string>(item?.supplier || '');
  const [receiveDate, setReceiveDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [openSupplierDropdown, setOpenSupplierDropdown] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [barcodeValidation, setBarcodeValidation] = useState<{
    scanned: boolean;
    isValid: boolean;
    message: string;
  }>({ scanned: false, isValid: false, message: '' });

  // Handle barcode scanning
  const handleScanBarcode = () => {
    setIsScannerOpen(true);
  };
  
  const handleBarcodeDetected = (barcode: string) => {
    if (!item) return;
    
    if (item.barcode && barcode === item.barcode) {
      // Barcode matches
      setBarcodeValidation({
        scanned: true,
        isValid: true,
        message: 'Barcode verified! This is the correct item.'
      });
      toast({
        title: "Barcode Verified",
        description: `Confirmed item: ${item.name}`,
        variant: "default"
      });
    } else if (!item.barcode) {
      // Item doesn't have a barcode stored
      setBarcodeValidation({
        scanned: true,
        isValid: false,
        message: 'This item does not have a barcode recorded. Consider updating the item details.'
      });
      toast({
        title: "No Barcode Recorded",
        description: `This item doesn't have a barcode in the system. Consider updating the item details.`,
        variant: "default"
      });
    } else {
      // Barcode mismatch
      setBarcodeValidation({
        scanned: true,
        isValid: false,
        message: `Scanned barcode (${barcode}) does not match this item's barcode (${item.barcode}).`
      });
      toast({
        title: "Barcode Mismatch",
        description: `The scanned barcode does not match this item.`,
        variant: "destructive"
      });
    }
  };

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
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent">
            Receive Stock: {item.name}
          </DialogTitle>
        </DialogHeader>
        
        {isError && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Item Verification Section */}
          <div className="mb-4 p-3 bg-slate-50 rounded-lg shadow-business space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageOpen className="h-4 w-4 text-mokm-pink-500" />
                <span className="font-medium">Item Verification</span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleScanBarcode}
                className="flex gap-1 items-center h-8 px-2"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span className="text-xs">Verify</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-500">Item ID:</span>
                <div className="font-medium">{item.id}</div>
              </div>
              <div>
                <span className="text-slate-500">Current Stock:</span>
                <div className="font-medium">{item.stockLevel} units</div>
              </div>
            </div>
            
            {item.barcode && (
              <div className="mt-1">
                <span className="text-slate-500 text-sm">Barcode:</span>
                <div className="font-medium flex items-center gap-1">
                  {item.barcode}
                  {barcodeValidation.scanned && (
                    barcodeValidation.isValid ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )
                  )}
                </div>
              </div>
            )}
            
            {barcodeValidation.scanned && (
              <div className={`text-xs p-1.5 rounded ${barcodeValidation.isValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {barcodeValidation.message}
              </div>
            )}
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
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
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

          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto shadow-business"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full sm:w-auto bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 text-white shadow-colored hover:shadow-colored-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <PackageOpen className="mr-2 h-4 w-4" />
                  Receive Stock
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
        
        {/* Barcode Scanner Component */}
        <BarcodeScanner 
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onBarcodeDetected={handleBarcodeDetected}
          title="Verify Item Barcode"
        />
      </DialogContent>
    </Dialog>
  );
};

export default ReceiveStockForm;
