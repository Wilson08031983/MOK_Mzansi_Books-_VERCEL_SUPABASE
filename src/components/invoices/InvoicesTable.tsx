import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Eye,
  Edit,
  MoreHorizontal,
  Download,
  Send,
  Trash2,
  FileText,
  Copy,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import type { Invoice, InvoiceStatus } from '@/services/invoiceService';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

type SortField = 'number' | 'client' | 'date' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc';

interface InvoicesTableProps {
  invoices: Invoice[];
  selectedInvoices: string[];
  onSelectInvoice: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onSend: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
  onDuplicate: (invoice: Invoice) => void;
  onSort: (field: SortField) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onRecordPayment: (invoice: Invoice) => void;
}

const getStatusConfig = (status: InvoiceStatus) => {
  switch (status) {
    case 'draft':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        icon: <FileText className="h-3.5 w-3.5 mr-1.5" />
      };
    case 'sent':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        icon: <Send className="h-3.5 w-3.5 mr-1.5" />
      };
    case 'paid':
      return {
        bg: 'bg-green-50',
        text: 'text-green-800',
        icon: <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
      };
    case 'overdue':
      return {
        bg: 'bg-red-50',
        text: 'text-red-800',
        icon: <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
      };
    case 'cancelled':
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: <XCircle className="h-3.5 w-3.5 mr-1.5" />
      };
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-800',
        icon: <Clock className="h-3.5 w-3.5 mr-1.5" />
      };
  }
};

export const InvoicesTable: React.FC<InvoicesTableProps> = ({
  invoices = [],
  selectedInvoices = [],
  onSelectInvoice,
  onSelectAll,
  onSort,
  sortField,
  sortDirection,
  onEdit,
  onView,
  onDelete,
  onSend,
  onDuplicate,
  onRecordPayment
}) => {
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setInvoiceToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      onDelete(invoiceToDelete);
      setShowDeleteDialog(false);
      setInvoiceToDelete(null);
      toast.success('Invoice deleted successfully');
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setInvoiceToDelete(null);
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const isAllSelected = invoices.length > 0 && selectedInvoices.length === invoices.length;
  const isIndeterminate = selectedInvoices.length > 0 && selectedInvoices.length < invoices.length;

  return (
    <>
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="text-left p-4">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={onSelectAll}
                      className="border-slate-300"
                      // @ts-ignore - indeterminate is a valid prop but not in the type definition
                      indeterminate={isIndeterminate}
                    />
                  </th>
                  <th 
                    className="text-left p-4 font-medium text-slate-700 cursor-pointer hover:text-slate-900 font-sf-pro whitespace-nowrap"
                    onClick={() => onSort('number')}
                  >
                    <div className="flex items-center gap-2">
                      Invoice #
                      <SortIcon field="number" />
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-medium text-slate-700 cursor-pointer hover:text-slate-900 font-sf-pro whitespace-nowrap"
                    onClick={() => onSort('client')}
                  >
                    <div className="flex items-center gap-2">
                      Client
                      <SortIcon field="client" />
                    </div>
                  </th>
                  <th 
                    className="text-right p-4 font-medium text-slate-700 cursor-pointer hover:text-slate-900 font-sf-pro whitespace-nowrap"
                    onClick={() => onSort('date')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Date
                      <SortIcon field="date" />
                    </div>
                  </th>
                  <th 
                    className="text-right p-4 font-medium text-slate-700 cursor-pointer hover:text-slate-900 font-sf-pro whitespace-nowrap"
                    onClick={() => onSort('amount')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Amount
                      <SortIcon field="amount" />
                    </div>
                  </th>
                  <th 
                    className="text-center p-4 font-medium text-slate-700 cursor-pointer hover:text-slate-900 font-sf-pro whitespace-nowrap"
                    onClick={() => onSort('status')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Status
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th className="w-10 p-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const statusConfig = getStatusConfig(invoice.status);
                  return (
                    <tr
                      key={invoice.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => onView(invoice)}
                    >
                      <td className="p-4">
                        <Checkbox
                          checked={selectedInvoices.includes(invoice.id)}
                          onCheckedChange={() => onSelectInvoice(invoice.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="border-slate-300"
                        />
                      </td>
                      <td className="p-4 font-medium text-slate-900 font-sf-pro whitespace-nowrap">
                        {invoice.number}
                      </td>
                      <td className="p-4 text-slate-700 font-sf-pro">
                        {invoice.client}
                      </td>
                      <td className="p-4 text-slate-700 text-right font-sf-pro whitespace-nowrap">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="p-4 text-slate-900 font-medium text-right font-sf-pro whitespace-nowrap">
                        {formatCurrency(invoice.amount, invoice.currency || 'ZAR')}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                          >
                            {statusConfig.icon}
                            {formatStatus(invoice.status)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onView(invoice);
                                }}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(invoice);
                                }}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSend(invoice);
                                }}
                                className="cursor-pointer"
                              >
                                <Send className="mr-2 h-4 w-4" />
                                Send
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDuplicate(invoice);
                                }}
                                className="cursor-pointer"
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRecordPayment(invoice);
                                }}
                                className="cursor-pointer"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Record Payment
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => handleDeleteClick(invoice.id, e)}
                                className="cursor-pointer text-red-600 hover:!bg-red-50 hover:!text-red-700"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No invoices found. Create your first invoice to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InvoicesTable;
