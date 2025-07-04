
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { LocalQuotationItem } from './QuotationItemsList';

interface QuotationItemFormProps {
  item: LocalQuotationItem;
  index: number;
  onUpdateItem: (itemId: string, field: keyof LocalQuotationItem, value: string | number) => void;
  onRemoveItem: (itemId: string) => void;
  canRemove: boolean;
}

const QuotationItemForm: React.FC<QuotationItemFormProps> = ({
  item,
  index,
  onUpdateItem,
  onRemoveItem,
  canRemove
}) => {
  // Calculate item total based on quantity, unit price, tax, and discount
  const calculateItemTotal = (currentItem: LocalQuotationItem) => {
    const subtotal = currentItem.quantity * currentItem.unitPrice;
    const discount = currentItem.discount || 0;
    const taxRate = currentItem.taxRate || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    return subtotal - discount + taxAmount;
  };
  
  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Handle field updates and trigger parent callback
  const handleFieldUpdate = (field: keyof LocalQuotationItem, value: string | number) => {
    // Convert string numbers to actual numbers when needed
    if (typeof value === 'string' && !isNaN(Number(value))) {
      value = parseFloat(value);
    }
    
    // Update the item
    onUpdateItem(item.id, field, value);
    
    // If any of the price-affecting fields change, update the amount
    if (['quantity', 'unitPrice', 'taxRate', 'discount'].includes(field)) {
      const updatedItem = { ...item, [field]: value };
      const newAmount = calculateItemTotal(updatedItem);
      if (Math.abs(newAmount - (item.amount || 0)) > 0.01) { // Avoid floating point precision issues
        onUpdateItem(item.id, 'amount', parseFloat(newAmount.toFixed(2)));
      }
    }
  };

  return (
    <div className="p-4 border border-slate-200 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium text-slate-900 font-sf-pro">Item {index + 1}</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemoveItem(item.id)}
          disabled={!canRemove}
          className={!canRemove ? 'text-slate-400 cursor-not-allowed' : 'text-red-600 hover:text-red-700'}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
            Description *
          </label>
          <input
            type="text"
            value={item.description}
            onChange={(e) => handleFieldUpdate('description', e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
            placeholder="e.g. Website Design"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
            Quantity *
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={item.quantity}
            onChange={(e) => handleFieldUpdate('quantity', e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
            Unit Price (R) *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.unitPrice}
            onChange={(e) => handleFieldUpdate('unitPrice', e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
            Tax Rate (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={item.taxRate || ''}
            onChange={(e) => handleFieldUpdate('taxRate', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
            Discount (R)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.discount || ''}
            onChange={(e) => handleFieldUpdate('discount', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          />
        </div>
      </div>
      
      <div className="bg-slate-50 p-3 rounded-lg mt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 font-sf-pro">Item Total:</span>
          <span className="font-medium font-sf-pro">
            {formatCurrency(calculateItemTotal(item))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuotationItemForm;
