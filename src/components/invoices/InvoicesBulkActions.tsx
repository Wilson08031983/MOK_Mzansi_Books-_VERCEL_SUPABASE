
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  X,
  Send,
  Download,
  CreditCard,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { Invoice } from '@/pages/Invoices';

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
  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for:`, selectedInvoices);
    // Implement bulk actions here
  };

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
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('send')}
              className="bg-white/80"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('download')}
              className="bg-white/80"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDFs
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('payment')}
              className="bg-white/80"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
            <div className="relative group">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 hidden group-hover:block">
                <button 
                  onClick={() => handleBulkAction('markSent')}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Mark as Sent
                </button>
                <button 
                  onClick={() => handleBulkAction('markPaid')}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Mark as Paid
                </button>
                <button 
                  onClick={() => handleBulkAction('export')}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Export to CSV
                </button>
                <hr className="my-1" />
                <button 
                  onClick={() => handleBulkAction('delete')}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoicesBulkActions;
