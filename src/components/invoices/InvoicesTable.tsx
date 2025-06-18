
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Eye,
  Edit,
  MoreHorizontal,
  CreditCard,
  Download,
  Copy,
  Trash2
} from 'lucide-react';
import { Invoice } from '@/pages/Invoices';
import { formatDate } from '@/utils/formatters';

interface InvoicesTableProps {
  invoices: Invoice[];
  selectedInvoices: string[];
  onSelectInvoice: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  onRecordPayment: (invoice: Invoice) => void;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({
  invoices,
  selectedInvoices,
  onSelectInvoice,
  onSelectAll,
  sortField,
  sortDirection,
  onSort,
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

  const SortIcon: React.FC<{ field: string }> = ({ field }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  const isAllSelected = invoices.length > 0 && selectedInvoices.length === invoices.length;
  const isIndeterminate = selectedInvoices.length > 0 && selectedInvoices.length < invoices.length;

  return (
    <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="text-left p-4">
                  <Checkbox
                    checked={isAllSelected}
                    // @ts-ignore - indeterminate is a valid prop
                    indeterminate={isIndeterminate}
                    onCheckedChange={onSelectAll}
                  />
                </th>
                <th 
                  className="text-left p-4 font-medium text-slate-700 cursor-pointer hover:text-slate-900 font-sf-pro"
                  onClick={() => onSort('number')}
                >
                  <div className="flex items-center gap-2">
                    Invoice #
                    <SortIcon field="number" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 font-medium text-slate-700 cursor-pointer hover:text-slate-900 font-sf-pro"
                  onClick={() => onSort('clientName')}
                >
                  <div className="flex items-center gap-2">
                    Client
                    <SortIcon field="clientName" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 font-medium text-slate-700 cursor-pointer hover:text-slate-900 font-sf-pro"
                  onClick={() => onSort('invoiceDate')}
                >
                  <div className="flex items-center gap-2">
                    Invoice Date
                    <SortIcon field="invoiceDate" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 font-medium text-slate-700 cursor-pointer hover:text-slate-900 font-sf-pro"
                  onClick={() => onSort('dueDate')}
                >
                  <div className="flex items-center gap-2">
                    Due Date
                    <SortIcon field="dueDate" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 font-medium text-slate-700 cursor-pointer hover:text-slate-900 font-sf-pro"
                  onClick={() => onSort('amount')}
                >
                  <div className="flex items-center gap-2">
                    Amount
                    <SortIcon field="amount" />
                  </div>
                </th>
                <th className="text-left p-4 font-medium text-slate-700 font-sf-pro">Paid</th>
                <th 
                  className="text-left p-4 font-medium text-slate-700 cursor-pointer hover:text-slate-900 font-sf-pro"
                  onClick={() => onSort('balance')}
                >
                  <div className="flex items-center gap-2">
                    Balance
                    <SortIcon field="balance" />
                  </div>
                </th>
                <th className="text-left p-4 font-medium text-slate-700 font-sf-pro">Status</th>
                <th className="text-left p-4 font-medium text-slate-700 font-sf-pro">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-4">
                    <Checkbox
                      checked={selectedInvoices.includes(invoice.id)}
                      onCheckedChange={() => onSelectInvoice(invoice.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900 font-sf-pro">{invoice.number}</div>
                    {invoice.reference && (
                      <div className="text-sm text-slate-500 font-sf-pro">Ref: {invoice.reference}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900 font-sf-pro">{invoice.clientName}</div>
                    <div className="text-sm text-slate-500 font-sf-pro">{invoice.clientEmail}</div>
                  </td>
                  <td className="p-4 text-slate-900 font-sf-pro">{formatDate(invoice.invoiceDate)}</td>
                  <td className="p-4">
                    <div className={`font-sf-pro ${
                      new Date(invoice.dueDate) < new Date() && invoice.balance > 0
                        ? 'text-red-600 font-medium'
                        : 'text-slate-900'
                    }`}>
                      {formatDate(invoice.dueDate)}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-slate-900 font-sf-pro">
                    {invoice.currency} {invoice.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-slate-900 font-sf-pro">
                    {invoice.currency} {invoice.paidAmount.toLocaleString()}
                  </td>
                  <td className="p-4 font-medium text-slate-900 font-sf-pro">
                    {invoice.currency} {invoice.balance.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sf-pro ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {invoices.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-500 font-sf-pro">No invoices found</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoicesTable;
