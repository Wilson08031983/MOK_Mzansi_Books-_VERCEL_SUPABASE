
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import InvoicesHeader from '@/components/invoices/InvoicesHeader';
import InvoicesSummaryCards from '@/components/invoices/InvoicesSummaryCards';
import InvoicesSearchAndFilters from '@/components/invoices/InvoicesSearchAndFilters';
import InvoicesContent from '@/components/invoices/InvoicesContent';
import InvoicesBulkActions from '@/components/invoices/InvoicesBulkActions';
import CreateInvoiceModal from '@/components/invoices/CreateInvoiceModal';
import RecordPaymentModal from '@/components/invoices/RecordPaymentModal';

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: InvoiceStatus;
  currency: string;
  reference?: string;
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxRate?: number;
}

const Invoices: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortField, setSortField] = useState<string>('invoiceDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  // Sample data - replace with actual API calls
  useEffect(() => {
    // Fetch invoices from API
    const sampleInvoices: Invoice[] = [
      {
        id: '1',
        number: 'INV-001',
        clientId: '1',
        clientName: 'ACME Corporation',
        clientEmail: 'billing@acme.com',
        invoiceDate: '2024-01-15',
        dueDate: '2024-02-15',
        amount: 5000,
        paidAmount: 2500,
        balance: 2500,
        status: 'partial',
        currency: 'ZAR',
        reference: 'PO-12345',
        items: [
          {
            id: '1',
            description: 'Consulting Services',
            quantity: 10,
            rate: 500,
            amount: 5000
          }
        ],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        number: 'INV-002',
        clientId: '2',
        clientName: 'Tech Solutions Ltd',
        clientEmail: 'finance@techsolutions.com',
        invoiceDate: '2024-01-20',
        dueDate: '2024-01-10',
        amount: 7500,
        paidAmount: 0,
        balance: 7500,
        status: 'overdue',
        currency: 'ZAR',
        items: [
          {
            id: '2',
            description: 'Software Development',
            quantity: 15,
            rate: 500,
            amount: 7500
          }
        ],
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z'
      }
    ];
    setInvoices(sampleInvoices);
  }, []);

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedInvoices(selected ? invoices.map(invoice => invoice.id) : []);
  };

  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setShowPaymentModal(true);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.reference && invoice.reference.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesClient = clientFilter === 'all' || invoice.clientId === clientFilter;
    
    let matchesDate = true;
    const today = new Date();
    const invoiceDate = new Date(invoice.invoiceDate);
    const dueDate = new Date(invoice.dueDate);
    
    switch (dateFilter) {
      case 'thisMonth': {
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        matchesDate = invoiceDate >= thisMonth;
        break;
      }
      case 'lastMonth': {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        matchesDate = invoiceDate >= lastMonth && invoiceDate <= endLastMonth;
        break;
      }
      case 'overdue':
        matchesDate = dueDate < today && invoice.balance > 0;
        break;
      default:
        matchesDate = true;
    }
    
    return matchesSearch && matchesStatus && matchesClient && matchesDate;
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'number':
        comparison = a.number.localeCompare(b.number);
        break;
      case 'clientName':
        comparison = a.clientName.localeCompare(b.clientName);
        break;
      case 'invoiceDate':
        comparison = new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime();
        break;
      case 'dueDate':
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'balance':
        comparison = a.balance - b.balance;
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const paginatedInvoices = sortedInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div>

        <div className="p-4 lg:p-6 space-y-6">
          <InvoicesHeader 
            onCreateInvoice={() => setShowCreateModal(true)}
            onRecordPayment={() => setShowPaymentModal(true)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <InvoicesSummaryCards invoices={invoices} />

          <InvoicesSearchAndFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            clientFilter={clientFilter}
            onClientFilterChange={setClientFilter}
          />

          {selectedInvoices.length > 0 && (
            <InvoicesBulkActions
              selectedCount={selectedInvoices.length}
              onClearSelection={() => setSelectedInvoices([])}
              selectedInvoices={selectedInvoices}
              invoices={invoices}
            />
          )}

          <InvoicesContent
            invoices={paginatedInvoices}
            viewMode={viewMode}
            selectedInvoices={selectedInvoices}
            onSelectInvoice={handleSelectInvoice}
            onSelectAll={handleSelectAll}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={(field) => {
              if (sortField === field) {
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
              } else {
                setSortField(field);
                setSortDirection('asc');
              }
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={sortedInvoices.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            onRecordPayment={handleRecordPayment}
          />
        </div>
      </div>

      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <RecordPaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedInvoiceForPayment(null);
        }}
        invoice={selectedInvoiceForPayment}
      />
    </div>
  );
};

export default Invoices;
