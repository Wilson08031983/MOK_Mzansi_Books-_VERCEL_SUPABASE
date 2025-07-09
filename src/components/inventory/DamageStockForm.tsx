import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { markItemAsDamaged, markItemAsExpired } from '@/services/inventoryService';

interface InventoryItem {
  id: string;
  name: string;
  barcode: string;
  stockLevel: number;
  price: number;
  category: string;
  expiryDate: string | null;
  supplier: string;
  lastUpdated: string;
  location: string;
  status: string;
}

interface DamageStockFormProps {
  item: InventoryItem | null;
  onClose: () => void;
  onSubmitSuccess?: () => void; // Optional callback to refresh parent component
}

const DamageStockForm: React.FC<DamageStockFormProps> = ({ item, onClose, onSubmitSuccess }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: 'damaged', // damaged or expired
    quantity: '1',
    reason: '',
    actionTaken: 'write-off', // write-off or return-to-supplier
    location: '',
    notes: ''
  });
  
  const [reportDate, setReportDate] = useState<Date | undefined>(new Date());
  
  const reasons = {
    damaged: [
      'Physical damage',
      'Water damage',
      'Manufacturing defect',
      'Transport damage',
      'Customer return - damaged',
      'Handling error',
      'Other'
    ],
    expired: [
      'Past expiration date',
      'Near expiration (unsellable)',
      'Improperly stored',
      'Package seal broken',
      'Quality deterioration',
      'Recall',
      'Other'
    ]
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const quantity = parseInt(formData.quantity, 10);
      
      // Validation
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than zero');
      }
      
      if (quantity > item.stockLevel) {
        throw new Error('Cannot mark more than available stock as damaged or expired');
      }
      
      if (formData.type === 'damaged') {
        // Mark as damaged
        markItemAsDamaged(
          item.id,
          quantity,
          formData.reason,
          formData.notes,
          formData.actionTaken,
          formData.location
        );
        
        toast({
          title: 'Stock Updated',
          description: `${quantity} unit(s) of ${item.name} marked as damaged.`,
          variant: 'default',
        });
      } else {
        // Mark as expired
        markItemAsExpired(
          item.id,
          quantity,
          formData.reason,
          formData.notes,
          formData.actionTaken,
          formData.location
        );
        
        toast({
          title: 'Stock Updated',
          description: `${quantity} unit(s) of ${item.name} marked as expired.`,
          variant: 'default',
        });
      }
      
      // Call the callback to refresh parent component if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      // Close the form
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update inventory',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!item) {
    return (
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No item selected</DialogTitle>
          </DialogHeader>
          <p>Please select an inventory item to report as damaged or expired.</p>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Submit Report'}
            </Button>
          </DialogFooter>
          <div className="mt-4">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <span className="font-medium">Important:</span> Reporting items as damaged or expired will impact your inventory valuation and financial reports. This action cannot be undone.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Report Damaged/Expired Stock
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-2 rounded-md flex items-start gap-2 mb-4">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Item ID</Label>
              <Input value={item.id} readOnly className="bg-slate-50" />
            </div>
            
            <div className="space-y-2">
              <Label>Barcode</Label>
              <Input value={item.barcode} readOnly className="bg-slate-50" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Item Description</Label>
            <Input value={item.name} readOnly className="bg-slate-50" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Stock Level</Label>
              <Input value={item.stockLevel} readOnly className="bg-slate-50" />
            </div>
            
            <div className="space-y-2">
              <Label>Report Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !reportDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reportDate ? format(reportDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={reportDate}
                    onSelect={setReportDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Report Type</Label>
            <RadioGroup 
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="damaged" id="damaged" />
                <Label htmlFor="damaged" className="cursor-pointer">Damaged Stock</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expired" id="expired" />
                <Label htmlFor="expired" className="cursor-pointer">Expired Stock</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Affected Quantity</Label>
              <Input
                type="number"
                id="quantity"
                name="quantity"
                placeholder="Number of items affected"
                min="1"
                max={item?.stockLevel || 1}
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Maximum: {item?.stockLevel || 0} available
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Select 
                value={formData.reason}
                onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {formData.type === 'damaged' 
                    ? reasons.damaged.map((reason) => (
                        <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                      ))
                    : reasons.expired.map((reason) => (
                        <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Action to Take</Label>
            <RadioGroup 
              value={formData.actionTaken}
              onValueChange={(value) => setFormData(prev => ({ ...prev, actionTaken: value }))}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="write-off" id="write-off" />
                <Label htmlFor="write-off" className="cursor-pointer">Write Off (Remove from Inventory)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="return-to-supplier" id="return-to-supplier" />
                <Label htmlFor="return-to-supplier" className="cursor-pointer">Return to Supplier</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location of Damage/Expiry</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Where was the damage/expiry discovered?"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add any additional details about the damage or expiry..."
              rows={3}
            />
          </div>
          
          <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-amber-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Important</h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>
                    Reporting items as damaged or expired will impact your inventory valuation and financial reports.
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Submit Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DamageStockForm;
