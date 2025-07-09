import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Barcode, 
  Camera, 
  Loader2, 
  Package, 
  RefreshCw, 
  Save, 
  Search,
  X,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { InventoryItem } from '@/types/inventory';
import { getInventoryItemByBarcode, updateInventoryItem, addStockHistoryEntry } from '@/services/inventoryService';
import BarcodeScanner from '@/components/inventory/BarcodeScanner';
import { formatCurrency } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';

interface UpdateStockWithBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedItem: InventoryItem) => void;
}

const UpdateStockWithBarcodeModal: React.FC<UpdateStockWithBarcodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  // State for different modal views
  const [view, setView] = useState<'barcode' | 'update'>('barcode');
  
  // Barcode scanner states
  const [showScanner, setShowScanner] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Item data states
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle barcode detection from scanner component
  const handleBarcodeDetected = (detectedBarcode: string) => {
    setBarcode(detectedBarcode);
    setShowScanner(false);
    handleSearch(detectedBarcode);
  };

  // Reset the form
  const resetForm = () => {
    setView('barcode');
    setBarcode('');
    setItem(null);
    setQuantity('');
    setError(null);
    setIsSearching(false);
    setIsUpdating(false);
  };

  // Handle manual search by barcode
  const handleSearch = async (searchBarcode: string = barcode) => {
    if (!searchBarcode.trim()) {
      setError('Please enter a barcode');
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      // Fetch item by barcode
      const foundItem = getInventoryItemByBarcode(searchBarcode);
      
      if (!foundItem) {
        setError(`No item found with barcode: ${searchBarcode}`);
        setIsSearching(false);
        return;
      }
      
      // If item found, set it and move to update view
      setItem(foundItem);
      setView('update');
    } catch (err) {
      setError('An error occurred while searching for the item');
      console.error('Error searching for item:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle the update submission
  const handleUpdateSubmit = () => {
    if (!item) return;
    
    // Validate quantity
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError('Please enter a valid quantity');
      return;
    }
    
    setIsUpdating(true);
    setError(null);
    
    try {
      // Calculate new stock level
      const newStockLevel = item.stockLevel + quantityNum;
      
      // Update the item
      const updatedItem = {
        ...item,
        stockLevel: newStockLevel,
        lastUpdated: new Date().toISOString()
      };
      
      // Status will be automatically recalculated in the service
      updateInventoryItem(item.id, updatedItem);
      
      // Add to stock history
      addStockHistoryEntry({
        inventoryItemId: item.id,
        date: new Date().toISOString(),
        type: 'received',
        quantity: quantityNum,
        notes: `Received ${quantityNum} units of ${item.name}`,
        performedBy: 'System'
      });
      
      // Show success message and close modal
      toast({
        title: 'Stock Updated',
        description: `Added ${quantityNum} units of ${item.name} to inventory`,
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(updatedItem);
      } else {
        resetForm();
        onClose();
      }
    } catch (err) {
      setError('An error occurred while updating inventory');
      console.error('Error updating inventory:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Get a display string for an item's status
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'In Stock':
        return <Badge className="bg-green-500">In Stock</Badge>;
      case 'Low Stock':
        return <Badge className="bg-amber-500">Low Stock</Badge>;
      case 'Out of Stock':
        return <Badge className="bg-red-500">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle modal close with cleanup
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Focus the barcode input when the modal opens
  React.useEffect(() => {
    if (isOpen && view === 'barcode' && !showScanner) {
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, view, showScanner]);
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent">
            {view === 'barcode' ? 'Update Stock with Barcode' : 'Update Stock Quantity'}
          </DialogTitle>
          {view === 'barcode' && (
            <DialogDescription>
              Scan or enter the barcode of the item you want to update.
            </DialogDescription>
          )}
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {view === 'barcode' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Enter Barcode</Label>
              <div className="flex space-x-2">
                <Input 
                  id="barcode" 
                  ref={barcodeInputRef}
                  value={barcode} 
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan or type barcode"
                  className="shadow-business"
                />
                <Button 
                  type="button" 
                  onClick={() => handleSearch()} 
                  disabled={isSearching || !barcode}
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setShowScanner(true)}
              >
                <Camera className="h-4 w-4" />
                Scan with Camera
              </Button>

              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  setBarcode('');
                  barcodeInputRef.current?.focus();
                }}
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        )}
        
        {view === 'update' && item && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {/* Product image display */}
              <div className="w-20 h-20 rounded-md border flex-shrink-0 overflow-hidden bg-slate-100">
                {item.images && item.images.length > 0 ? (
                  <img 
                    src={item.images[0]} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-10 w-10 text-slate-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <Barcode className="h-3 w-3 text-slate-500" />
                  <span className="text-slate-500">{item.barcode}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border rounded p-3">
                <div className="text-xs text-slate-500">Current Stock</div>
                <div className="text-lg font-semibold">{item.stockLevel}</div>
              </div>

              <div className="border rounded p-3">
                <div className="text-xs text-slate-500">Price</div>
                <div className="text-lg font-semibold">{formatCurrency(item.price)}</div>
              </div>

              <div className="border rounded p-3">
                <div className="text-xs text-slate-500">Category</div>
                <div className="font-medium">{item.category}</div>
              </div>

              <div className="border rounded p-3">
                <div className="text-xs text-slate-500">Status</div>
                <div>{getStatusBadge(item.status)}</div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Label htmlFor="quantity">Add Quantity</Label>
              <Input 
                id="quantity" 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                placeholder="Enter quantity to add"
                className="shadow-business"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 w-full"
              onClick={() => setView('barcode')}
            >
              <Barcode className="h-4 w-4" />
              Scan Different Item
            </Button>
          </div>
        )}

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          
          {view === 'update' && (
            <Button 
              onClick={handleUpdateSubmit} 
              disabled={isUpdating || !quantity}
              className="bg-gradient-to-r from-mokm-pink-500 to-mokm-purple-500 text-white shadow-colored hover:shadow-colored-lg hover-lift"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Stock
                </>
              )}
            </Button>
          )}
        </DialogFooter>

        {/* Barcode Scanner Dialog */}
        {showScanner && (
          <BarcodeScanner
            isOpen={showScanner}
            onClose={() => setShowScanner(false)}
            onBarcodeDetected={handleBarcodeDetected}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStockWithBarcodeModal;
