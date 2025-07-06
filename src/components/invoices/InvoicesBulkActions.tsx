import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Invoice } from '@/types/invoice';

interface InvoicesBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  selectedInvoices: string[];
  invoices: Invoice[];
}

const InvoicesBulkActions: React.FC<InvoicesBulkActionsProps> = ({
  selectedCount,
  onClearSelection,
  selectedInvoices,
  invoices
}) => {
  return (
    <Card className="glass backdrop-blur-sm bg-blue-50/50 border border-blue-200/50 shadow-business">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-blue-900 font-sf-pro">
              {selectedCount} invoice{selectedCount !== 1 ? 's' : ''} selected
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-blue-700 hover:text-blue-900"
            >
              <X className="h-4 w-4 mr-1" />
              Clear selection
            </Button>
          </div>
          
          {/* Bulk action buttons removed as requested */}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoicesBulkActions;
