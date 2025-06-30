
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import QuotationItemForm from './QuotationItemForm';
import { QuotationItem as ServiceQuotationItem } from '@/services/quotationService';

// Local interface that extends the service's QuotationItem to include unitPrice
export interface LocalQuotationItem extends Omit<ServiceQuotationItem, 'rate'> {
  unitPrice: number;
}

interface QuotationItemsListProps {
  items: LocalQuotationItem[];
  onAddItem: () => void;
  onUpdateItem: (itemId: string, field: keyof LocalQuotationItem, value: string | number) => void;
  onRemoveItem: (itemId: string) => void;
}

const QuotationItemsList: React.FC<QuotationItemsListProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem
}) => {
  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;
    
    items.forEach(item => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = item.discount || 0;
      const itemTax = item.taxRate ? (itemSubtotal * item.taxRate) / 100 : 0;
      
      subtotal += itemSubtotal;
      discountTotal += itemDiscount;
      taxTotal += itemTax;
    });
    
    const total = subtotal - discountTotal + taxTotal;
    
    return {
      subtotal,
      taxTotal,
      discountTotal,
      total
    };
  };

  const totals = calculateTotals();

  return (
    <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-sf-pro">Quotation Items</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddItem}
            className="font-sf-pro"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <QuotationItemForm
            key={item.id}
            item={item}
            index={index}
            onUpdateItem={onUpdateItem}
            onRemoveItem={onRemoveItem}
            canRemove={items.length > 1}
          />
        ))}
        
        <div className="border-t border-slate-200 pt-4">
          <div className="flex justify-end">
            <div className="w-full md:w-64">
              <div className="flex justify-between py-2">
                <span className="text-slate-600 font-sf-pro">Subtotal:</span>
                <span className="font-sf-pro">{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.discountTotal > 0 && (
                <div className="flex justify-between py-2 text-slate-600">
                  <span className="font-sf-pro">Discount:</span>
                  <span className="font-sf-pro">- {formatCurrency(totals.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 text-slate-600">
                <span className="font-sf-pro">Tax:</span>
                <span className="font-sf-pro">{formatCurrency(totals.taxTotal)}</span>
              </div>
              <div className="flex justify-between pt-2 mt-2 border-t border-slate-200 font-medium text-slate-900">
                <span className="font-sf-pro">Total:</span>
                <span className="font-sf-pro">{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotationItemsList;
