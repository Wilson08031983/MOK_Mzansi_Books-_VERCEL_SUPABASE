
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
}

interface QuotationItemFormProps {
  item: QuotationItem;
  index: number;
  onUpdateItem: (itemId: string, field: keyof QuotationItem, value: string | number) => void;
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
  const calculateItemTotal = () => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemDiscount = item.discount;
    const itemTax = ((itemSubtotal - itemDiscount) * item.taxRate) / 100;
    return itemSubtotal - itemDiscount + itemTax;
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
            onChange={(e) => onUpdateItem(item.id, 'description', e.target.value)}
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
            onChange={(e) => onUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
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
            onChange={(e) => onUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
            Tax Rate (%)
          </label>
          <select
            value={item.taxRate}
            onChange={(e) => onUpdateItem(item.id, 'taxRate', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          >
            <option value="0">0% - No Tax</option>
            <option value="15">15% - Standard Rate</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
            Discount Amount (R)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.discount}
            onChange={(e) => onUpdateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          />
        </div>
      </div>
      
      <div className="bg-slate-50 p-3 rounded-lg mt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 font-sf-pro">Item Total:</span>
          <span className="font-medium font-sf-pro">
            R {calculateItemTotal().toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuotationItemForm;
