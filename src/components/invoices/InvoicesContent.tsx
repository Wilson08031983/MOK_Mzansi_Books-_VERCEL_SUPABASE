
import React from 'react';
import { 
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Send,
  Eye,
  AlertTriangle,
  X
} from 'lucide-react';
import InvoicesTable from './InvoicesTable';
import InvoicesGrid from './InvoicesGrid';
import InvoicesPagination from './InvoicesPagination';
import { Invoice } from '@/types/invoice';

interface InvoicesContentProps {
  invoices: Invoice[];
  viewMode: 'table' | 'grid';
  selectedInvoices: string[];
  onSelectInvoice: (id: string) => void;
  onSelectAll: () => void;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onRecordPayment: (invoice: Invoice) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onEditInvoice?: (invoiceId: string) => void;
  onUpdateStatus: (invoiceId: string, newStatus: string) => void;
}

const InvoicesContent: React.FC<InvoicesContentProps> = ({
  invoices = [],
  viewMode = 'table',
  selectedInvoices = [],
  onSelectInvoice = () => {},
  onSelectAll = () => {},
  sortColumn = 'date',
  sortDirection = 'desc',
  onSort = () => {},
  currentPage = 1,
  totalPages = 1,
  itemsPerPage = 10,
  totalItems = 0,
  onPageChange = () => {},
  onItemsPerPageChange = () => {},
  onRecordPayment = () => {},
  onDeleteInvoice = () => {},
  onEditInvoice,
  onUpdateStatus = () => {}
}) => {
  // Get status icon with proper typing
  const getStatusIcon = (status: string) => {
    if (!status) return <FileText className="h-4 w-4 text-gray-500" />;
    
    switch (status.toLowerCase()) {
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-500" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'viewed':
        return <Eye className="h-4 w-4 text-blue-400" />;
      case 'paid':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewed':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partial':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-500 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Helper function to get display status text
  const getDisplayStatus = (status?: string) => {
    if (!status) return 'Draft';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };
  return (
    <div className="space-y-4 relative pb-10">
      {viewMode === 'table' ? (
        <InvoicesTable
          invoices={invoices}
          selectedInvoices={selectedInvoices}
          onSelectInvoice={onSelectInvoice}
          onSelectAll={onSelectAll}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
          getDisplayStatus={getDisplayStatus}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={onSort}
          onDeleteInvoice={onDeleteInvoice}
          onEditInvoice={onEditInvoice}
          onUpdateStatus={onUpdateStatus}
        />
      ) : (
        <InvoicesGrid
          invoices={invoices}
          selectedInvoices={selectedInvoices}
          onSelectInvoice={onSelectInvoice}
          onRecordPayment={onRecordPayment}
        />
      )}
      
      <div className="mt-2">
        <InvoicesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </div>
    </div>
  );
};

export default InvoicesContent;
