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
import { Calendar as CalendarIcon, PackagePlus, Scan, Check, ChevronsUpDown, QrCode, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addInventoryItem } from '@/services/inventoryService';
import { getAllSuppliers, Supplier } from '@/services/supplierService';
import { toast } from '@/components/ui/use-toast';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import BarcodeScanner from './BarcodeScanner';
import { playBeepSound } from '@/utils/audioUtils';
import ImageUpload from './ImageUpload';

interface NewStockFormProps {
  onClose: () => void;
  initialBarcode?: string;
}

const NewStockForm: React.FC<NewStockFormProps> = ({ onClose, initialBarcode = '' }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
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
  
  // State for product images
  const [productImages, setProductImages] = useState<string[]>([]);
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [openSupplierCombobox, setOpenSupplierCombobox] = useState(false);
  
  const [validationErrors, setValidationErrors] = useState({
    purchaseAmount: '',
    sellingPrice: '',
    markup: '',
    quantity: ''
  });
  
  const [isEditingSellingPrice, setIsEditingSellingPrice] = useState(false);
  
  // Fetch suppliers and set the auto-generated item ID when the component mounts
  useEffect(() => {
    // Load suppliers from localStorage
    const savedSuppliers = getAllSuppliers();
    setSuppliers(savedSuppliers);
    
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

  // Generate a random ID for the item
  const generateItemId = () => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `ITEM-${timestamp}-${random}`;
  };

  const handleBarcodeDetected = (barcode: string) => {
    playBeepSound();
    setFormData(prev => ({ ...prev, barcode }));
    setIsScannerOpen(false);
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Create new inventory item with product images
      // Generate ID if empty, otherwise use user's input
      const itemIdToUse = formData.itemId || generateItemId();
      
      const newItem = {
        name: formData.description,
        id: itemIdToUse, // Use this as the primary ID
        itemId: itemIdToUse, // Keep for backward compatibility
        description: formData.description,
        barcode: formData.barcode,
        purchaseAmount: parseFloat(formData.purchaseAmount),
        sellingPrice: parseFloat(formData.sellingPrice),
        markup: parseFloat(formData.markup),
        quantity: parseInt(formData.quantity),
        category: formData.category,
        batchNo: formData.batchNo,
        supplier: formData.supplier,
        location: formData.location,
        notes: formData.notes,
        minimumStockLevel: parseInt(formData.minimumStockLevel),
        receiveDate: receiveDate ? format(receiveDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        expiryDate: expiryDate ? format(expiryDate, 'yyyy-MM-dd') : undefined,
        // Required fields for the inventory service
        stockLevel: parseInt(formData.quantity),
        price: parseFloat(formData.sellingPrice),
        costPrice: parseFloat(formData.purchaseAmount),
        // Add the product images to the inventory item
        images: productImages.length > 0 ? productImages : undefined
      };
      
      addInventoryItem(newItem);
      
      toast({
        title: "Success",
        description: "New inventory item added successfully",
      });
      
      // Close dialog
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };


  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-mokm-orange-500" />
            Add New Stock Item
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
                value={formData.itemId || ''}
                onChange={handleInputChange}
                placeholder="Auto-generated if left empty"
              />
            </div>
            
            {/* Barcode with Scanner Button */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsScannerOpen(true)}
                  className="px-2 h-6"
                >
                  <Scan className="h-3.5 w-3.5 text-mokm-orange-500" />
                  <span className="text-xs ml-1">Scan</span>
                </Button>
              </div>
              <Input
                id="barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                placeholder="Barcode or SKU"
              />
            </div>
            
            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Item description"
                required
              />
            </div>
            
            {/* Purchase Amount */}
            <div className="space-y-2">
              <Label htmlFor="purchaseAmount">Purchase Amount (R)</Label>
              <Input
                id="purchaseAmount"
                name="purchaseAmount"
                type="number"
                step="0.01"
                value={formData.purchaseAmount}
                onChange={handleInputChange}
                placeholder="0.00"
                required
                className={validationErrors.purchaseAmount ? 'border-red-500' : ''}
              />
              {validationErrors.purchaseAmount && (
                <p className="text-red-500 text-xs">{validationErrors.purchaseAmount}</p>
              )}
            </div>
            
            {/* Selling Price */}
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price (R)</Label>
              <Input
                id="sellingPrice"
                name="sellingPrice"
                type="number"
                step="0.01"
                value={formData.sellingPrice}
                onChange={handleInputChange}
                placeholder="0.00"
                required
                className={validationErrors.sellingPrice ? 'border-red-500' : ''}
              />
              {validationErrors.sellingPrice && (
                <p className="text-red-500 text-xs">{validationErrors.sellingPrice}</p>
              )}
            </div>
            
            {/* Markup */}
            <div className="space-y-2">
              <Label htmlFor="markup">Markup (%)</Label>
              <Input
                id="markup"
                name="markup"
                type="number"
                step="0.01"
                value={formData.markup}
                onChange={handleInputChange}
                placeholder="0.00"
                className={validationErrors.markup ? 'border-red-500' : ''}
              />
              {validationErrors.markup && (
                <p className="text-red-500 text-xs">{validationErrors.markup}</p>
              )}
            </div>
            
            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="1"
                required
                className={validationErrors.quantity ? 'border-red-500' : ''}
              />
              {validationErrors.quantity && (
                <p className="text-red-500 text-xs">{validationErrors.quantity}</p>
              )}
            </div>
            
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
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
            
            {/* Minimum Stock Level */}
            <div className="space-y-2">
              <Label htmlFor="minimumStockLevel">Minimum Stock Level</Label>
              <Input
                id="minimumStockLevel"
                name="minimumStockLevel"
                type="number"
                value={formData.minimumStockLevel}
                onChange={handleInputChange}
                placeholder="5"
              />
            </div>
            
            {/* Supplier - Combobox */}
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Popover open={openSupplierCombobox} onOpenChange={setOpenSupplierCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openSupplierCombobox}
                    className="w-full justify-between"
                  >
                    {formData.supplier
                      ? suppliers.find((supplier) => supplier.name === formData.supplier)?.name
                      : "Select supplier"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search supplier..." />
                    <CommandEmpty>No supplier found.</CommandEmpty>
                    <CommandGroup>
                      {suppliers.map((supplier) => (
                        <CommandItem
                          key={supplier.id}
                          value={supplier.name}
                          onSelect={(currentValue) => {
                            setFormData(prev => ({ 
                              ...prev, 
                              supplier: currentValue === formData.supplier ? "" : currentValue
                            }));
                            setOpenSupplierCombobox(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.supplier === supplier.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {supplier.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select name="location" value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
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
            
            {/* Batch No */}
            <div className="space-y-2">
              <Label htmlFor="batchNo">Batch No</Label>
              <Input
                id="batchNo"
                name="batchNo"
                value={formData.batchNo}
                onChange={handleInputChange}
                placeholder="Batch number if applicable"
              />
            </div>
            
            {/* Receive Date */}
            <div className="space-y-2">
              <Label>Receive Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
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
              <Label>Expiry Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "PPP") : <span>Pick a date</span>}
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
            
            {/* Notes */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes about this item..."
                className="resize-none h-24"
              />
            </div>
            
            {/* Product Images */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-mokm-orange-600" />
                <Label>Product Images</Label>
              </div>
              <ImageUpload 
                onImageChange={(images) => setProductImages(images)}
                existingImages={productImages}
                maxImages={5}
              />
              <p className="text-xs text-slate-500">Upload up to 5 product images or take photos with your camera</p>
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
        
        {/* Barcode Scanner Component */}
        <BarcodeScanner 
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onBarcodeDetected={handleBarcodeDetected}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewStockForm;
