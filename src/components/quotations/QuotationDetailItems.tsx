
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';

interface QuotationDetailItemsProps {
  quotation: any;
}

const QuotationDetailItems: React.FC<QuotationDetailItemsProps> = ({ quotation }) => {
  return (
    <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
      <CardHeader>
        <CardTitle className="text-slate-900 font-sf-pro">Quotation Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600 font-sf-pro">Description</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600 font-sf-pro">Qty</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600 font-sf-pro">Rate</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600 font-sf-pro">Discount</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600 font-sf-pro">Tax</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600 font-sf-pro">Total</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item: any) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-4 px-4 font-sf-pro">{item.description}</td>
                  <td className="py-4 px-4 text-right font-sf-pro">{item.quantity}</td>
                  <td className="py-4 px-4 text-right font-sf-pro">{formatCurrency(item.rate)}</td>
                  <td className="py-4 px-4 text-right font-sf-pro">
                    {item.discount > 0 ? formatCurrency(item.discount) : '-'}
                  </td>
                  <td className="py-4 px-4 text-right font-sf-pro">{item.taxRate}%</td>
                  <td className="py-4 px-4 text-right font-medium font-sf-pro">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <div className="flex justify-end">
            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between py-1 font-sf-pro">
                <span className="text-slate-600">Subtotal:</span>
                <span>{formatCurrency(quotation.subtotal)}</span>
              </div>
              {quotation.discount > 0 && (
                <div className="flex justify-between py-1 text-slate-600 font-sf-pro">
                  <span>Discount:</span>
                  <span>- {formatCurrency(quotation.discount)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 text-slate-600 font-sf-pro">
                <span>Tax (15%):</span>
                <span>{formatCurrency(quotation.taxAmount)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-lg border-t border-slate-200 mt-2 pt-2 font-sf-pro">
                <span>Total:</span>
                <span>{formatCurrency(quotation.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotationDetailItems;
