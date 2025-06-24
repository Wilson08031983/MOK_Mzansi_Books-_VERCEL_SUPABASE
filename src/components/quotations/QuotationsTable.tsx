
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
import { formatCurrency, formatDate } from '@/utils/formatters';
import QuotationActionsMenu from './QuotationActionsMenu';

interface QuotationsTableProps {
  quotations: any[];
  selectedQuotations: string[];
  onSelectQuotation: (quotationId: string) => void;
  onSelectAll: () => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
  onDeleteQuotation: (quotationId: string) => void;
}

const QuotationsTable: React.FC<QuotationsTableProps> = ({
  quotations,
  selectedQuotations,
  onSelectQuotation,
  onSelectAll,
  getStatusIcon,
  getStatusColor,
  sortColumn,
  sortDirection,
  onSort,
  onDeleteQuotation
}) => {
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  return (
    <div className="rounded-xl overflow-hidden border border-white/20">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
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
                <span>Quotation</span>
                {getSortIcon('number')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => onSort('client')}
                className="flex items-center space-x-1 font-sf-pro font-medium text-slate-600 hover:text-slate-900"
              >
                <span>Client</span>
                {getSortIcon('client')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => onSort('date')}
                className="flex items-center space-x-1 font-sf-pro font-medium text-slate-600 hover:text-slate-900"
              >
                <span>Date</span>
                {getSortIcon('date')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => onSort('amount')}
                className="flex items-center space-x-1 font-sf-pro font-medium text-slate-600 hover:text-slate-900"
              >
                <span>Amount</span>
                {getSortIcon('amount')}
              </button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Salesperson</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.map((quotation) => (
            <TableRow key={quotation.id} className="hover:bg-slate-50/50">
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
                  <span className="font-sf-pro">{formatDate(quotation.date)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-slate-400 mr-2" />
                  <span className="font-medium font-sf-pro">{formatCurrency(quotation.amount)}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(quotation.status)} font-sf-pro`}>
                  {getStatusIcon(quotation.status)}
                  <span className="ml-1 capitalize">{quotation.status}</span>
                </span>
              </TableCell>
              <TableCell>
                <span className="font-sf-pro">{quotation.salesperson}</span>
              </TableCell>
              <TableCell>
                <QuotationActionsMenu 
                  quotation={{
                    id: quotation.id,
                    number: quotation.number,
                    clientEmail: quotation.clientEmail
                  }}
                  onDelete={onDeleteQuotation}
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
