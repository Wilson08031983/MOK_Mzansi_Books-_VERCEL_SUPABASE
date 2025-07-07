import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, PackagePlus, Scan } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addInventoryItem } from '@/services/inventoryService';
import { toast } from '@/components/ui/use-toast';

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
  
  const [validationErrors, setValidationErrors] = useState({
    purchaseAmount: '',
    sellingPrice: '',
    markup: '',
    quantity: ''
  });
  
  const [isEditingSellingPrice, setIsEditingSellingPrice] = useState(false);
  
  // Set the auto-generated item ID when the component mounts
  useEffect(() => {
    // Initial auto-generation only if itemId is empty
    if (!formData.itemId) {
      setFormData(prevData => ({
        ...prevData,
        itemId: generateItemId()
      }));
    }
  }, [formData.itemId]);
  
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

  const validatePositiveNumber = (value: string, field: 'purchaseAmount' | 'sellingPrice' | 'markup' | 'quantity'): boolean => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: `${field === 'markup' ? 'Markup' : field === 'purchaseAmount' ? 'Purchase Amount' : field === 'sellingPrice' ? 'Selling Price' : 'Quantity'} must be a number`
      }));
      return false;
    } else if (numValue < 0) {
      setValidationErrors(prev => ({ ...prev, [field]: 'Value cannot be negative' }));
      return false;
    }
    setValidationErrors(prev => ({ ...prev, [field]: '' }));
    return true;
  };
  
  // Markup (%) = ((Selling Price - Purchase Amount) / Purchase Amount) * 100
  const calculateMarkup = (purchaseAmount: number, sellingPrice: number): string => {
    if (purchaseAmount <= 0) {
      return 'N/A'; // Handle divide-by-zero case
    }
    return (((sellingPrice - purchaseAmount) / purchaseAmount) * 100).toFixed(2);
  };
  
  // Calculate selling price from purchase amount and markup percentage
  const calculateSellingPrice = (purchaseAmount: number, markup: number): string => {
    return (purchaseAmount * (1 + markup / 100)).toFixed(2);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Calculate based on which field was changed
    if (name === 'purchaseAmount' || name === 'sellingPrice') {
      const purchaseAmount = name === 'purchaseAmount' 
        ? parseFloat(value) || 0 
        : parseFloat(formData.purchaseAmount) || 0;
        
      const sellingPrice = name === 'sellingPrice' 
        ? parseFloat(value) || 0 
        : parseFloat(formData.sellingPrice) || 0;
      
      // Validate purchase amount to prevent divide-by-zero
      if (purchaseAmount <= 0) {
        setValidationErrors(prev => ({
          ...prev,
          purchaseAmount: purchaseAmount === 0 ? 'Purchase Amount cannot be zero' : 'Purchase Amount must be positive'
        }));
        // Don't update markup if purchase amount is invalid
        return;
      } else {
        setValidationErrors(prev => ({
          ...prev,
          purchaseAmount: ''
        }));
      }
      
      // Validate selling price
      if (sellingPrice < 0) {
        setValidationErrors(prev => ({
          ...prev,
          sellingPrice: 'Selling Price cannot be negative'
        }));
        return;
      } else {
        setValidationErrors(prev => ({
          ...prev,
          sellingPrice: ''
        }));
      }
      
      // Calculate markup based on purchase amount and selling price
      const calculatedMarkup = calculateMarkup(purchaseAmount, sellingPrice);
      setFormData(prev => ({
        ...prev,
        markup: calculatedMarkup
      }));
    } else if (name === 'markup') {
      const markup = parseFloat(value) || 0;
      const purchaseAmount = parseFloat(formData.purchaseAmount) || 0;
      
      if (purchaseAmount <= 0) {
        setValidationErrors(prev => ({
          ...prev,
          purchaseAmount: purchaseAmount === 0 ? 'Purchase Amount cannot be zero' : 'Purchase Amount must be positive'
        }));
        return;
      }
      
      // Calculate selling price based on purchase amount and markup
      const calculatedSellingPrice = calculateSellingPrice(purchaseAmount, markup);
      setFormData(prev => ({
        ...prev,
        sellingPrice: calculatedSellingPrice
      }));
    } else if (name === 'quantity') {
      validatePositiveNumber(value, 'quantity');
    }
  };

  const validateForm = (): boolean => {
    const errors = {
      purchaseAmount: '',
      sellingPrice: '',
      markup: '',
      quantity: ''
    };
    
    // Validate Purchase Amount
    if (!formData.purchaseAmount) {
      errors.purchaseAmount = 'Purchase Amount is required';
    } else if (parseFloat(formData.purchaseAmount) <= 0) {
      errors.purchaseAmount = 'Purchase Amount must be positive';
    }
    
    // Validate Selling Price
    if (!formData.sellingPrice) {
      errors.sellingPrice = 'Selling Price is required';
    } else if (parseFloat(formData.sellingPrice) < 0) {
      errors.sellingPrice = 'Selling Price cannot be negative';
    }
    
    // Validate Quantity
    if (!formData.quantity) {
      errors.quantity = 'Quantity is required';
    } else if (parseFloat(formData.quantity) <= 0) {
      errors.quantity = 'Quantity must be positive';
    } else if (!Number.isInteger(parseFloat(formData.quantity))) {
      errors.quantity = 'Quantity must be a whole number';
    }
    
    // Check if any errors were found
    const hasErrors = Object.values(errors).some(error => error !== '');
    
    if (hasErrors) {
      setValidationErrors(errors);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the validation errors",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create item object matching the InventoryItem interface structure
      // Map form fields to the expected structure in the inventory service
      const newItem = {
        name: formData.description, // Map description to name field
        barcode: formData.barcode,
        stockLevel: parseInt(formData.quantity) || 0, // Map quantity to stockLevel
        minimumStockLevel: parseInt(formData.minimumStockLevel) || 0,
        price: parseFloat(formData.sellingPrice) || 0, // Map sellingPrice to price
        costPrice: parseFloat(formData.purchaseAmount) || 0, // Map purchaseAmount to costPrice
        markup: parseFloat(formData.markup) || 0,
        category: formData.category,
        receiveDate: receiveDate?.toISOString() || new Date().toISOString(),
        expiryDate: expiryDate?.toISOString() || null,
        supplier: formData.supplier,
        batchNo: formData.batchNo,
        location: formData.location,
        notes: formData.notes
      };
      
      // Use the existing inventory service to add the stock item
      await addInventoryItem(newItem);
      
      toast({
        title: "Success",
        description: "Stock item added successfully",
        variant: "default"
      });
      onClose();
    } catch (error) {
      console.error('Error adding stock item:', error);
      toast({
        title: "Error",
        description: "Failed to add stock item",
        variant: "destructive"
      });
    }
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
    
    // Format: INV-YYMMDD-XXX (Year, Month, Day, Random 3-digit number)
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().slice(2); // Last 2 digits of year
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const datePart = `${year}${month}${day}`;
    
    // Generate a random 3-digit number for uniqueness
    const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `${prefix}-${datePart}-${randomPart}`;
  };


  


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
              <div className="relative">
                <Input
                  id="itemId"
                  name="itemId"
                  value={formData.itemId}
                  onChange={handleInputChange}
                  readOnly
                  className="bg-slate-50 pr-8"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-xs text-mokm-orange-500 font-medium bg-mokm-orange-50 px-1 py-0.5 rounded">Auto</span>
                </div>
              </div>
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
                value={formData.purchaseAmount}
                onChange={handleInputChange}
                placeholder=""
                type="text"
                inputMode="decimal"
                pattern="[0-9]+(\.[0-9]+)?"
                className={`${validationErrors.purchaseAmount ? 'border-red-500 focus-visible:ring-red-300' : ''}`}
              />
              {validationErrors.purchaseAmount && (
                <p className="text-xs text-red-500">{validationErrors.purchaseAmount}</p>
              )}
            </div>
            
            {/* Selling Price */}
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price (ZAR)</Label>
              <Input
                id="sellingPrice"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleInputChange}
                placeholder=""
                type="text"
                inputMode="decimal"
                pattern="[0-9]+(\.[0-9]+)?"
                className={`${validationErrors.sellingPrice ? 'border-red-500 focus-visible:ring-red-300' : ''}`}
                onFocus={() => setIsEditingSellingPrice(true)}
              />
              {validationErrors.sellingPrice ? (
                <p className="text-xs text-red-500">{validationErrors.sellingPrice}</p>
              ) : (
                <p className="text-xs text-slate-500">Calculated as: Purchase Amount + Markup</p>
              )}
            </div>
            
            {/* Markup (%) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="markup">Markup (%)</Label>
                <div className="relative group">
                  <span className="cursor-help text-xs text-mokm-orange-500 hover:text-mokm-orange-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-help-circle">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <path d="M12 17h.01"></path>
                    </svg>
                  </span>
                  <div className="absolute bottom-full mb-2 right-0 w-64 p-2 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <p className="text-xs text-slate-600 font-medium">Markup (%) = ((Selling Price - Purchase Amount) ÷ Purchase Amount) × 100</p>
                  </div>
                </div>
              </div>
              <Input
                id="markup"
                name="markup"
                value={formData.markup}
                onChange={handleInputChange}
                placeholder=""
                type="text"
                inputMode="decimal"
                pattern="[0-9]+(\.[0-9]+)?"
                className={`${validationErrors.markup ? 'border-red-500 focus-visible:ring-red-300' : ''}`}
              />
              {validationErrors.markup ? (
                <p className="text-xs text-red-500">{validationErrors.markup}</p>
              ) : (
                <p className="text-xs text-slate-500">
                  Auto-calculated from Purchase Amount and Selling Price
                </p>
              )}
            </div>
            
            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Received</Label>
              <Input
                id="quantity"
                name="quantity"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder=""
                className={validationErrors.quantity ? 'border-red-500 focus-visible:ring-red-300' : ''}
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
