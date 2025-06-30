
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Eye,
  Edit,
  MoreHorizontal,
  CreditCard,
  Download,
  Copy,
  Trash2,
  Calendar,
  User
} from 'lucide-react';
import { Invoice } from '@/services/invoiceService';
import { formatDate } from '@/utils/formatters';

interface InvoicesGridProps {
  invoices: Invoice[];
  selectedInvoices: string[];
  onSelectInvoice: (id: string) => void;
  onRecordPayment: (invoice: Invoice) => void;
}

const InvoicesGrid: React.FC<InvoicesGridProps> = ({
  invoices,
  selectedInvoices,
  onSelectInvoice,
  onRecordPayment
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'viewed':
        return 'bg-cyan-100 text-cyan-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (invoices.length === 0) {
    return (
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardContent className="p-12 text-center">
          <div className="text-slate-500 font-sf-pro">No invoices found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {invoices.map((invoice) => {
        const daysUntilDue = getDaysUntilDue(invoice.dueDate);
        const isOverdue = daysUntilDue < 0;
        
        return (
          <Card key={invoice.id} className="glass backdrop-blur-sm bg-white/50 shadow-business hover:shadow-business-lg transition-all duration-300 hover-lift group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedInvoices.includes(invoice.id)}
                    onCheckedChange={() => onSelectInvoice(invoice.id)}
                  />
                  <div>
                    <div className="font-semibold text-slate-900 font-sf-pro">{invoice.number}</div>
                    {invoice.reference && (
                      <div className="text-sm text-slate-500 font-sf-pro">Ref: {invoice.reference}</div>
                    )}
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sf-pro ${getStatusColor(invoice.status)}`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900 font-sf-pro">{invoice.clientName}</div>
                    <div className="text-sm text-slate-500 font-sf-pro">{invoice.clientEmail}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div className="text-sm text-slate-600 font-sf-pro">
                    Due {formatDate(invoice.dueDate)}
                    {isOverdue && (
                      <span className="text-red-600 font-medium ml-1">
                        (Overdue by {Math.abs(daysUntilDue)} days)
                      </span>
                    )}
                    {!isOverdue && daysUntilDue <= 7 && daysUntilDue > 0 && (
                      <span className="text-yellow-600 font-medium ml-1">
                        (Due in {daysUntilDue} days)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide font-sf-pro">Total</div>
                    <div className="font-semibold text-slate-900 font-sf-pro">
                      {invoice.currency} {invoice.amount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide font-sf-pro">Paid</div>
                    <div className="font-semibold text-green-600 font-sf-pro">
                      {invoice.currency} {invoice.paidAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide font-sf-pro">Balance</div>
                    <div className={`font-semibold font-sf-pro ${
                      invoice.balance > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {invoice.currency} {invoice.balance.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  {invoice.balance > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onRecordPayment(invoice)}
                    >
                      <CreditCard className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="relative group">
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 hidden group-hover:block">
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download PDF
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default InvoicesGrid;
