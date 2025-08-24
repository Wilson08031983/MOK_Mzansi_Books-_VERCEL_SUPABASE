
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  SortAsc,
  SortDesc,
  Calendar,
  User,
  DollarSign,
} from 'lucide-react';
import { useLocalization } from '@/hooks/useLocalization';
import QuotationActionsMenu from './QuotationActionsMenu';
import { Quotation, updateQuotationStatus } from '@/services/quotationService';
import StatusChangeDropdown from './StatusChangeDropdown';
import { toast } from 'sonner';

interface QuotationsTableProps {
  quotations: Quotation[];
  selectedQuotations: string[];
  onSelectQuotation: (quotationId: string) => void;
  onSelectAll: () => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  getDisplayStatus: (status?: string) => string;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
  onDeleteQuotation: (quotationId: string) => void;
  onEditQuotation?: (quotationId: string) => void;
  onStatusFilter?: (status: string) => void;
  onRefresh?: () => void; // Add refresh handler to update parent state
}

const QuotationsTable: React.FC<QuotationsTableProps> = ({
  quotations,
  selectedQuotations,
  onSelectQuotation,
  onSelectAll,
  getStatusIcon,
  getStatusColor,
  getDisplayStatus,
  sortColumn,
  sortDirection,
  onSort,
  onDeleteQuotation,
  onEditQuotation,
  onStatusFilter,
  onRefresh
}) => {
  const { t, formatCurrency, formatDate } = useLocalization();
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  return (
    <div className="glass backdrop-blur-md bg-white/10 dark:bg-black/30 rounded-xl overflow-hidden border border-white/10 shadow-business">
      <Table>
        <TableHeader>
          <TableRow className="bg-white/5 dark:bg-white/5 hover:bg-white/10 transition-colors">
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={quotations.length > 0 && selectedQuotations.length === quotations.length}
                onChange={onSelectAll}
                className="rounded border-slate-300 text-mokm-purple-600 focus:ring-mokm-purple-500"
              />
            </TableHead>
            <TableHead>
              <button
                onClick={() => onSort('number')}
                className="flex items-center space-x-1 font-sf-pro font-medium text-slate-600 hover:text-slate-900"
              >
                <span>{t('quotations.table.quotation')}</span>
                {getSortIcon('number')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => onSort('client')}
                className="flex items-center space-x-1 font-sf-pro font-medium text-slate-600 hover:text-slate-900"
              >
                <span>{t('quotations.table.client')}</span>
                {getSortIcon('client')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => onSort('date')}
                className="flex items-center space-x-1 font-sf-pro font-medium text-slate-600 hover:text-slate-900"
              >
                <span>{t('quotations.table.date')}</span>
                {getSortIcon('date')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => onSort('amount')}
                className="flex items-center space-x-1 font-sf-pro font-medium text-slate-600 hover:text-slate-900"
              >
                <span>{t('quotations.table.amount')}</span>
                {getSortIcon('amount')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => onSort('status')}
                className="flex items-center space-x-1 font-sf-pro font-medium text-slate-600 hover:text-slate-900"
              >
                <span>{t('quotations.table.status')}</span>
                {getSortIcon('status')}
              </button>
            </TableHead>
            <TableHead>{t('quotations.table.salesperson')}</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.map((quotation) => (
            <TableRow key={quotation.id} className="hover:bg-white/5 dark:hover:bg-white/10 transition-colors">
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedQuotations.includes(quotation.id)}
                  onChange={() => onSelectQuotation(quotation.id)}
                  className="rounded border-slate-300 text-mokm-purple-600 focus:ring-mokm-purple-500"
                />
              </TableCell>
              <TableCell>
                <div>
                  <Link
                    to={`/quotations/${quotation.id}`}
                    className="font-medium text-mokm-purple-600 hover:text-mokm-purple-700 hover:underline font-sf-pro"
                  >
                    {quotation.number}
                  </Link>
                  <p className="text-sm text-slate-500 font-sf-pro">{quotation.reference}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <User className="h-4 w-4 text-slate-400 mr-2" />
                  <span className="font-sf-pro">{quotation.client}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                  <span className="font-sf-pro">{quotation.date ? formatDate(new Date(quotation.date)) : '-'}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-slate-400 mr-2" />
                  <span className="font-medium font-sf-pro">{formatCurrency(quotation.amount)}</span>
                </div>
              </TableCell>
              <TableCell>
                <StatusChangeDropdown 
                  currentStatus={quotation.status}
                  onStatusChange={(newStatus) => {
                    // Call update quotation status service
                    try {
                      // Use the already imported updateQuotationStatus function
                      const updatedQuotations = updateQuotationStatus(quotation.id, newStatus);
                      
                      // Notify that a change was made
                      toast.success(t('quotations.toasts.statusUpdated'));
                      
                      // Call refresh to update the UI with the latest data
                      if (onRefresh) {
                        onRefresh();
                      }
                    } catch (error) {
                      console.error('Error updating status:', error);
                      toast.error(t('quotations.toasts.statusUpdateFailed'));
                    }
                  }}
                  size="sm"
                />
              </TableCell>
              <TableCell>
                <span className="font-sf-pro">{quotation.salesperson}</span>
              </TableCell>
              <TableCell>
                <QuotationActionsMenu 
                  quotation={{
                    ...quotation,
                    validUntil: quotation.expiryDate || '',
                    client: quotation.client || { id: quotation.clientId, name: quotation.client }
                  }}
                  onDelete={onDeleteQuotation}
                  onEdit={onEditQuotation}
                  onRefresh={onRefresh}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuotationsTable;
