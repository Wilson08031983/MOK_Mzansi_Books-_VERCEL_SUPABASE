import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, PackagePlus, Scan } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface NewStockFormProps {
  onClose: () => void;
  initialBarcode?: string;
}

const NewStockForm: React.FC<NewStockFormProps> = ({ onClose, initialBarcode = '' }) => {
  const [formData, setFormData] = useState({
    itemId: '',
    description: '',
    barcode: initialBarcode,
    purchaseAmount: '',
    sellingPrice: '',
    markup: '0',
    quantity: '1',
    category: '',
    batchNo: '',
    supplier: '',
    location: '',
    notes: '',
    minimumStockLevel: '5'
  });
  
  const [receiveDate, setReceiveDate] = useState<Date | undefined>(new Date());
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  
  const categories = [
    'Electronics',
    'Furniture',
    'Health',
    'Stationery',
    'Food & Beverages',
    'Office Supplies',
    'Clothing',
    'Hardware',
    'Tools',
    'Other'
  ];
  
  const locations = [
    'Warehouse A',
    'Warehouse B',
    'Store Room',
    'Office',
    'Display Area',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Calculate markup or selling price automatically when one changes
    if (name === 'purchaseAmount' && value) {
      const purchaseAmount = parseFloat(value);
      const markup = parseFloat(formData.markup) || 0;
      const sellingPrice = (purchaseAmount * (1 + markup / 100)).toFixed(2);
      setFormData(prev => ({
        ...prev,
        sellingPrice
      }));
    } else if (name === 'sellingPrice' && value && formData.purchaseAmount) {
      const sellingPrice = parseFloat(value);
      const purchaseAmount = parseFloat(formData.purchaseAmount);
      if (purchaseAmount > 0) {
        const calculatedMarkup = ((sellingPrice / purchaseAmount) - 1) * 100;
        setFormData(prev => ({
          ...prev,
          markup: calculatedMarkup.toFixed(2)
        }));
      }
    } else if (name === 'markup' && value && formData.purchaseAmount) {
      const markup = parseFloat(value);
      const purchaseAmount = parseFloat(formData.purchaseAmount);
      const sellingPrice = (purchaseAmount * (1 + markup / 100)).toFixed(2);
      setFormData(prev => ({
        ...prev,
        sellingPrice
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would normally save the data to your database
    console.log('New Stock Data:', {
      ...formData,
      receiveDate,
      expiryDate
    });
    
    // For demo purposes, just close the form
    onClose();
  };

  const handleScanBarcode = () => {
    // This would open a barcode scanner in a real implementation
    // For this demo, we'll just simulate getting a barcode
    const randomBarcode = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    setFormData(prev => ({
      ...prev,
      barcode: randomBarcode
    }));
  };

  // Generate a unique item ID based on current date and random number
  const generateItemId = () => {
    const prefix = 'INV';
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${datePart}-${randomPart}`;
  };

  // Generate item ID on initial render if not provided
  React.useEffect(() => {
    if (!formData.itemId) {
      setFormData(prev => ({
        ...prev,
        itemId: generateItemId()
      }));
    }
  }, []);

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5" /> Add New Stock
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item ID */}
            <div className="space-y-2">
              <Label htmlFor="itemId">Item ID</Label>
              <Input
                id="itemId"
                name="itemId"
                value={formData.itemId}
                onChange={handleInputChange}
                readOnly
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">Auto-generated unique identifier</p>
            </div>
            
            {/* Barcode */}
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  placeholder="Enter barcode number..."
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleScanBarcode} 
                  className="shrink-0"
                >
                  <Scan className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Item Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter detailed item description..."
                required
              />
            </div>
            
            {/* Purchase Amount */}
            <div className="space-y-2">
              <Label htmlFor="purchaseAmount">Purchase Amount (ZAR)</Label>
              <Input
                id="purchaseAmount"
                name="purchaseAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.purchaseAmount}
                onChange={handleInputChange}
                placeholder="0.00"
                required
              />
            </div>
            
            {/* Selling Price */}
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price (ZAR)</Label>
              <Input
                id="sellingPrice"
                name="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.sellingPrice}
                onChange={handleInputChange}
                placeholder="0.00"
                required
              />
            </div>
            
            {/* Markup Percentage */}
            <div className="space-y-2">
              <Label htmlFor="markup">Markup (%)</Label>
              <Input
                id="markup"
                name="markup"
                type="number"
                min="0"
                step="0.1"
                value={formData.markup}
                onChange={handleInputChange}
                placeholder="0.0"
              />
            </div>
            
            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Received</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Batch Number */}
            <div className="space-y-2">
              <Label htmlFor="batchNo">Batch No.</Label>
              <Input
                id="batchNo"
                name="batchNo"
                value={formData.batchNo}
                onChange={handleInputChange}
                placeholder="Enter batch number..."
              />
            </div>
            
            {/* Receive Date */}
            <div className="space-y-2">
              <Label>Date Received</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !receiveDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {receiveDate ? format(receiveDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={receiveDate}
                    onSelect={setReceiveDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Expiry Date */}
            <div className="space-y-2">
              <Label>Expiry Date (if applicable)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "PPP") : <span>No expiry date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Supplier */}
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                placeholder="Enter supplier name..."
              />
            </div>
            
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Storage Location</Label>
              <Select 
                value={formData.location}
                onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Minimum Stock Level */}
            <div className="space-y-2">
              <Label htmlFor="minimumStockLevel">Minimum Stock Level</Label>
              <Input
                id="minimumStockLevel"
                name="minimumStockLevel"
                type="number"
                min="0"
                value={formData.minimumStockLevel}
                onChange={handleInputChange}
                placeholder="5"
              />
              <p className="text-xs text-slate-500">Alert when stock falls below this level</p>
            </div>
            
            {/* Notes */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add any additional notes about this item..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 text-white"
            >
              Save Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewStockForm;
