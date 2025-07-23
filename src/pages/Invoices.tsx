import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import InvoicesHeader from '@/components/invoices/InvoicesHeader';
import InvoicesSummaryCards from '@/components/invoices/InvoicesSummaryCards';
import InvoicesSearchAndFilters from '@/components/invoices/InvoicesSearchAndFilters';
import InvoicesContent from '@/components/invoices/InvoicesContent';
import InvoicesBulkActions from '@/components/invoices/InvoicesBulkActions';
import CreateInvoiceModal from '@/components/invoices/CreateInvoiceModal';
import RecordPaymentModal from '@/components/invoices/RecordPaymentModal';
import InvoiceViewModal from '@/components/invoices/InvoiceViewModal';
import { Invoice, InvoiceItem, InvoiceStatus } from '@/types/invoice';

// Define types for the invoice modal data
interface ModalLineItem {
  id: string;
  itemNo: number;
  description: string;
  quantity: string | number;
  rate: number;
  markupPercent: number;
  discount: number;
  amount: number;
}

interface ModalInvoiceData {
  invoiceNumber?: string;
  number?: string;
  clientId: string;
  invoiceDate?: string;
  dueDate: string;
  reference: string;
  terms: string;
  notes?: string;
  vatRate: number;
  total?: number;
  items: ModalLineItem[];
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [selectedInvoiceForPreview, setSelectedInvoiceForPreview] = useState<Invoice | null>(null);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize clients data
  const [clients, setClients] = useState<{
    id: string;
    companyName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }[]>([]);

  // Company details for PDFs and emails
  const [companyDetails, setCompanyDetails] = useState({
    name: 'MOK Mzansi Books',
    email: 'info@mokmzansibooks.com',
    phone: '+27 12 345 6789',
    addressLine1: '123 Main Street',
    addressLine2: 'Suite 200',
    addressLine3: 'Pretoria',
    addressLine4: 'Gauteng 0001',
    vatNumber: 'VAT123456789',
    regNumber: 'REG2023/123456/07',
    website: 'www.mokmzansibooks.com',
    bankName: 'First National Bank',
    accountNumber: '62123456789',
    accountType: 'Business Account',
    branchCode: '250655',
    accountHolder: 'MOK Mzansi Books (Pty) Ltd',
    logoUrl: 'https://mokmzansibooks.com/logo.png'
  });

  // Fetch clients from localStorage
  useEffect(() => {
    const storedClients = JSON.parse(localStorage.getItem('clients') || '[]');
    setClients(storedClients);
    
    // Also load company details from localStorage if available
    const storedCompanyDetails = localStorage.getItem('companyDetails');
    if (storedCompanyDetails) {
      setCompanyDetails(JSON.parse(storedCompanyDetails));
    }
  }, []);
  
  // Function to generate sample invoices
  const generateSampleInvoices = () => {
    const sampleInvoices: Invoice[] = [
      {
        id: '1',
        number: 'INV-001',
        client: 'ACME Corporation',
        clientId: '1',
        clientName: 'ACME Corporation',
        clientEmail: 'billing@acme.com',
        date: '2024-01-15',
        invoiceDate: '2024-01-15',
        dueDate: '2024-02-15',
        amount: 5000,
        total: 5000,
        paidAmount: 2500,
        balance: 2500,
        status: 'partial',
        currency: 'ZAR',
        vatRate: 15,
        reference: 'PO-12345',
        terms: 'Net 30 days',
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [
          {
            id: '1',
            itemNo: 1,
            description: 'Consulting Services',
            quantity: 10,
            rate: 500,
            unitPrice: 500,
            markupPercent: 0,
            discount: 0,
            amount: 5000,
            taxRate: 15,
            taxAmount: 750,
          },
        ],
      },
    ];
    
    setInvoices(sampleInvoices);
    localStorage.setItem('invoices', JSON.stringify(sampleInvoices));
  };

  // Fetch invoices from localStorage
  useEffect(() => {
    setLoading(true);
    try {
      const storedInvoices = localStorage.getItem('invoices');
      if (storedInvoices) {
        try {
          const parsedInvoices = JSON.parse(storedInvoices);
          // Ensure parsedInvoices is an array
          if (Array.isArray(parsedInvoices)) {
            setInvoices(parsedInvoices);
          } else {
            console.error('Stored invoices is not an array:', parsedInvoices);
            // Initialize with empty array instead of using potentially undefined data
            setInvoices([]);
            localStorage.setItem('invoices', JSON.stringify([]));
          }
        } catch (parseError) {
          console.error('Error parsing invoices JSON:', parseError);
          // Initialize with empty array on parse error
          setInvoices([]);
          localStorage.setItem('invoices', JSON.stringify([]));
        }
      } else {
        // No invoices found, create sample data
        const sampleInvoices: Invoice[] = [
        {
          id: '1',
          number: 'INV-001',
          client: 'ACME Corporation',
          clientId: '1',
          clientName: 'ACME Corporation',
          clientEmail: 'billing@acme.com',
          date: '2024-01-15',
          invoiceDate: '2024-01-15',
          dueDate: '2024-02-15',
          amount: 5000,
          total: 5000,
          paidAmount: 2500,
          balance: 2500,
          status: 'partial',
          currency: 'ZAR',
          vatRate: 15,
          reference: 'PO-12345',
          terms: 'Net 30 days',
          items: [
            {
              id: '1',
              itemNo: 1,
              description: 'Consulting Services',
              quantity: 10,
              rate: 500,
              unitPrice: 500,
              markupPercent: 0,
              discount: 0,
              amount: 5000,
            },
          ],
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          number: 'INV-002',
          client: 'Tech Solutions Ltd',
          clientId: '2',
          clientName: 'Tech Solutions Ltd',
          clientEmail: 'finance@techsolutions.com',
          date: '2024-01-20',
          invoiceDate: '2024-01-20',
          dueDate: '2024-01-10',
          amount: 15000,
          total: 15000,
          paidAmount: 0,
          balance: 15000,
          status: 'overdue',
          currency: 'ZAR',
          vatRate: 15,
          reference: 'PO-67890',
          terms: 'Net 30 days',
          items: [
            {
              id: '1',
              itemNo: 1,
              description: 'Software Development',
              quantity: 20,
              rate: 750,
              unitPrice: 750,
              markupPercent: 0,
              discount: 0,
              amount: 15000,
            },
          ],
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
        },
      ];
        setInvoices(sampleInvoices);
        localStorage.setItem('invoices', JSON.stringify(sampleInvoices));
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);


  // Function to save invoice to localStorage
  const handleSaveInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Find the client
      const client = clients.find(c => c.id === invoice.clientId);
      
      // Ensure invoice number is properly set
      // The modal uses invoiceNumber but we need to use number for storage
      const invoiceNumber = invoice.number || 'INV-' + Date.now();
      
      // Generate new invoice with required fields
      const newInvoice: Invoice = {
        ...invoice,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: invoice.status || 'draft',
        paidAmount: 0,
        balance: invoice.total || 0,
        clientName: client?.companyName || client?.firstName + ' ' + client?.lastName || 'Unknown',
        clientEmail: client?.email || '',
        // Ensure number is set correctly
        number: invoiceNumber,
        // Ensure required fields are present
        date: invoice.invoiceDate || invoice.date || new Date().toISOString().split('T')[0],
        invoiceDate: invoice.invoiceDate || invoice.date || new Date().toISOString().split('T')[0],
        amount: invoice.total || invoice.amount || 0,
        total: invoice.total || invoice.amount || 0,
        client: invoice.clientId,
        currency: invoice.currency || 'ZAR',
        terms: invoice.terms || 'Net 30 days',
        reference: invoice.reference || '',
        vatRate: invoice.vatRate || 0,
        items: invoice.items || [],
      };
      
      console.log('Saving invoice with number:', newInvoice.number);
      
      // Get existing invoices from localStorage
      const storedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]') as Invoice[];
      
      // Add new invoice to the array
      const updatedInvoices = [...storedInvoices, newInvoice];
      
      // Save updated array back to localStorage
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      
      // Update state
      setInvoices(prev => [...prev, newInvoice]);
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving invoice:', error);
      return Promise.reject(error);
    }
  };

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map(invoice => invoice.id));
    }
  };

  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setShowPaymentModal(true);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    // Get current invoices from localStorage
    const storedInvoicesStr = localStorage.getItem('invoices') || '[]';
    let storedInvoices = [];
    
    try {
      // Safely parse and ensure it's an array
      const parsedInvoices = JSON.parse(storedInvoicesStr);
      storedInvoices = Array.isArray(parsedInvoices) ? parsedInvoices : [];
    } catch (error) {
      console.error('Error parsing invoices from localStorage:', error);
      storedInvoices = [];
    }
    
    // Filter out the invoice to delete
    const filteredInvoices = storedInvoices.filter(invoice => invoice?.id !== invoiceId);
    
    // Save back to localStorage
    localStorage.setItem('invoices', JSON.stringify(filteredInvoices));
    
    // Update state - ensure prev is treated as an array
    setInvoices(prev => {
      const safeArray = Array.isArray(prev) ? prev : [];
      return safeArray.filter(invoice => invoice?.id !== invoiceId);
    });
    
    // Update selectedInvoices state
    setSelectedInvoices(prev => {
      const safeArray = Array.isArray(prev) ? prev : [];
      return safeArray.filter(id => id !== invoiceId);
    });
    toast.success('Invoice deleted successfully');
  };

  // Function to update invoice status
  const handleUpdateInvoiceStatus = (invoiceId: string, newStatus: InvoiceStatus) => {
    // Get current invoices from localStorage
    const storedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    
    // Update the invoice status
    const updatedInvoices = storedInvoices.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, status: newStatus };
      }
      return inv;
    });
    
    // Save back to localStorage
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    
    // Update state
    setInvoices(prev => prev.map(invoice => {
      if (invoice.id === invoiceId) {
        return { ...invoice, status: newStatus };
      }
      return invoice;
    }));
    
    toast.success(`Invoice status updated to ${newStatus}`);
  };

  const handleEditInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setSelectedInvoiceForEdit(invoice);
      setShowCreateModal(true);
    }
  };
  
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoiceForPreview(invoice);
    setShowPreviewModal(true);
  };
  
  // Function to get company details for PDFs and emails
  const getCompanyDetails = () => {
    return companyDetails;
  };
  
  // Handle duplicate invoice for UI update
  const handleDuplicateInvoice = (newInvoice: Invoice) => {
    setInvoices(prevInvoices => [...prevInvoices, newInvoice]);
  };

  // Ensure invoices is always an array before filtering
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const filteredInvoices = safeInvoices.filter(invoice => {
    // Additional null/undefined check
    if (!invoice) return false;
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
        matchesDate = new Date(invoice.dueDate) < today && invoice.balance > 0;
        break;
      default:
        matchesDate = true;
    }
    
    return matchesSearch && matchesStatus && matchesClient && matchesDate;
  });

  // Use a defensive copy to ensure we're working with an array
  // Ensure we have a valid array before sorting
  const safeFilteredInvoices = Array.isArray(filteredInvoices) ? filteredInvoices : [];
  const sortedInvoices = [...safeFilteredInvoices].sort((a, b) => {
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
    <>
      <InvoicesHeader
        onCreateInvoice={() => {
          setSelectedInvoiceForEdit(null); // Clear any previous edit data
          setShowCreateModal(true);
        }}
        onRecordPayment={() => {
          if (selectedInvoices.length === 1) {
            const invoice = invoices.find(inv => inv.id === selectedInvoices[0]);
            if (invoice) {
              handleRecordPayment(invoice);
            }
          } else if (selectedInvoices.length === 0) {
            toast.error('Please select an invoice to record payment');
          } else {
            toast.error('Please select only one invoice to record payment');
          }
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hasSelectedInvoice={selectedInvoices.length === 1}
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
        viewMode={viewMode}
        onViewModeChange={setViewMode}
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
        sortColumn={sortField}
        sortDirection={sortDirection}
        onSort={(field) => {
          if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
          } else {
            setSortField(field);
            setSortDirection('desc');
          }
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={sortedInvoices.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        onRecordPayment={handleRecordPayment}
        onDeleteInvoice={handleDeleteInvoice}
        onEditInvoice={handleEditInvoice}
        onUpdateStatus={handleUpdateInvoiceStatus}
        onView={handleViewInvoice}
      />

      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedInvoiceForEdit(null);
        }}
        onSave={handleSaveInvoice}
        editingInvoice={selectedInvoiceForEdit}
      />

      <RecordPaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedInvoiceForPayment(null);
        }}
        invoice={selectedInvoiceForPayment || null}
        onSuccess={(paymentData) => {
          console.log('Payment recorded', paymentData);
          
          // Refresh invoices from localStorage to reflect the payment
          const updatedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
          setInvoices(updatedInvoices);
          
          // Close modal and clear selected invoice
          setShowPaymentModal(false);
          setSelectedInvoiceForPayment(null);
          
          // Show success message
          toast.success(`Payment of ${paymentData.amount.toLocaleString()} recorded successfully`);
        }}
      />
      
      {/* Invoice View Modal */}
      <InvoiceViewModal
        invoice={selectedInvoiceForPreview}
        open={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        getCompanyDetails={getCompanyDetails}
      />
    </>
  );
};

export default Invoices;
