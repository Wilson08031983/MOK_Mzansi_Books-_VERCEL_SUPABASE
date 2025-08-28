import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useLocalization } from '@/hooks/useLocalization';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import InvoicesHeader from '@/components/invoices/InvoicesHeader';
import { generateInvoiceNumber } from '@/services/invoiceService';
import InvoicesSummaryCards from '@/components/invoices/InvoicesSummaryCards';
import InvoicesSearchAndFilters from '@/components/invoices/InvoicesSearchAndFilters';
import InvoicesContent from '@/components/invoices/InvoicesContent';
import InvoicesBulkActions from '@/components/invoices/InvoicesBulkActions';
import CreateInvoiceModal from '@/components/invoices/CreateInvoiceModal';
import RecordPaymentModal from '@/components/invoices/RecordPaymentModal';
import InvoiceViewModal from '@/components/invoices/InvoiceViewModal';
import { Invoice, InvoiceItem, InvoiceStatus } from '@/types/invoice';
import { activityService } from '@/services/activityService';
import DashboardBackground from '@/components/dashboard/DashboardBackground';
import { addNotification, getNotifications, NotificationItem } from '@/services/notificationService';

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
  const { t, formatCurrency: localizeCurrency, formatDate: localizeDate, settings, getCurrencySymbol } = useLocalization();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = location.state as any;
    if (state?.openCreateInvoiceModal) {
      setShowCreateModal(true);
      // Clear state to prevent reopening on refresh/navigation
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  // Update document title when language changes
  useEffect(() => {
    document.title = `${t('invoices.title')} - MOK Mzansi Books`;
  }, [t]);

  // Update page title in UI
  const pageTitle = t('invoices.title');
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

  // Listen for invoices-updated: refresh list and create de-duplicated notifications
  useEffect(() => {
    const handleInvoicesUpdated = (evt: Event) => {
      try {
        const e = evt as CustomEvent;
        const detail = (e && e.detail) || {};
        const action: string = detail.action || '';
        const invoice: any = detail.invoice;
        const invoiceId: string | undefined = detail.invoiceId;
        const number = invoice?.number || invoiceId || 'Invoice';

        // Refresh from localStorage to keep UI in sync
        const updatedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        setInvoices(Array.isArray(updatedInvoices) ? updatedInvoices : []);

        // Build notification content
        let title = '';
        let message = '';
        if (action === 'created') {
          title = `Invoice Created: ${number}`;
          message = `Created for ${invoice?.clientName ?? 'a client'} (${localizeCurrency(invoice?.total || 0)}).`;
        } else if (action === 'updated') {
          title = `Invoice Updated: ${number}`;
          message = `Details updated${invoice?.clientName ? ` (${invoice.clientName})` : ''}.`;
        } else if (action === 'deleted') {
          title = `Invoice Deleted: ${number}`;
          message = `An invoice was deleted${invoice?.clientName ? ` (${invoice.clientName})` : ''}.`;
        } else if (action === 'status-changed') {
          const newStatus = detail.status || invoice?.status;
          title = `Invoice Status: ${number}`;
          message = `Status changed to ${String(newStatus).toUpperCase()}.`;
        } else if (action === 'payment-recorded') {
          const amt = detail.paymentAmount || 0;
          title = `Payment Recorded: ${number}`;
          message = `Payment of ${localizeCurrency(amt)} captured${invoice?.clientName ? ` for ${invoice.clientName}` : ''}.`;
        } else if (action === 'imported') {
          const count = detail.count || 0;
          if (!count) return;
          title = `Invoices Imported: ${count}`;
          message = `${count} invoice(s) imported.`;
        } else {
          return;
        }

        // De-duplicate within 5 minutes by same title+message and type 'invoice' or 'system'
        const existing: NotificationItem[] = getNotifications();
        const windowMs = 5 * 60 * 1000;
        const threshold = Date.now() - windowMs;
        const dup = existing.some(n => {
          const ts = new Date(n.date).getTime();
          return n.title === title && n.message === message && (n.type === 'invoice' || n.type === 'system') && !isNaN(ts) && ts >= threshold;
        });
        if (!dup) {
          addNotification({ title, message, type: 'invoice' });
        }
      } catch (err) {
        console.warn('Failed handling invoices-updated event:', err);
      }
    };
    window.addEventListener('invoices-updated', handleInvoicesUpdated as EventListener);
    return () => window.removeEventListener('invoices-updated', handleInvoicesUpdated as EventListener);
  }, [localizeCurrency]);
  
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
        date: '2025-07-15',
        invoiceDate: '2025-07-15',
        dueDate: '2025-08-15',
        amount: 5000,
        total: 5000,
        paidAmount: 2500,
        balance: 2500,
        status: 'partial',
        currency: settings.currency,
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
          date: '15 July 2025',
          invoiceDate: '15 July 2025',
          dueDate: '15 August 2025',
          amount: 5000,
          subtotal: 4347.83,
          vatTotal: 652.17,
          total: 5000,
          paidAmount: 2500,
          balance: 2500,
          status: 'partial',
          currency: settings.currency,
          vatRate: 15,
          reference: 'PO-12345',
          terms: 'Net 30 days',
          items: [
            {
              id: '1',
              itemNo: 1,
              description: 'Consulting Services',
              quantity: 10,
              rate: 434.78,
              unitPrice: 434.78,
              markupPercent: 0,
              discount: 0,
              amount: 4347.83,
            },
          ],
          createdAt: '2025-07-15T10:00:00Z',
          updatedAt: '2025-07-15T10:00:00Z',
        },
        {
          id: '2',
          number: 'INV-002',
          client: 'Tech Solutions Ltd',
          clientId: '2',
          clientName: 'Tech Solutions Ltd',
          clientEmail: 'finance@techsolutions.com',
          date: '6 August 2025',
          invoiceDate: '6 August 2025',
          dueDate: '6 September 2025',
          amount: 15000,
          subtotal: 13043.48,
          vatTotal: 1956.52,
          total: 15000,
          paidAmount: 0,
          balance: 15000,
          status: 'overdue',
          currency: settings.currency,
          vatRate: 15,
          reference: 'PO-67890',
          terms: 'Net 30 days',
          items: [
            {
              id: '1',
              itemNo: 1,
              description: 'Software Development',
              quantity: 20,
              rate: 652.17,
              unitPrice: 652.17,
              markupPercent: 0,
              discount: 0,
              amount: 13043.48,
            },
          ],
          createdAt: '2025-08-06T10:00:00Z',
          updatedAt: '2025-08-06T10:00:00Z',
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
      // Always generate a fresh invoice number if one isn't provided
      // This ensures we never reuse invoice numbers
      let invoiceNumber;
      
      if (invoice.number) {
        invoiceNumber = invoice.number;
      } else if ((invoice as any).invoiceNumber) {
        invoiceNumber = (invoice as any).invoiceNumber;
      } else {
        // Generate a fresh invoice number as a last resort
        invoiceNumber = generateInvoiceNumber();
      }
      
      console.log('Saving invoice with number:', invoiceNumber);
      
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
        currency: invoice.currency || settings.currency,
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

      // Dispatch event for create (so listeners notify + dashboard bell updates)
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('invoices-updated', { detail: { action: 'created', invoice: newInvoice } }));
        }
      } catch {}

      // Log activity: invoice created
      activityService.logFinancialAction(
        'Invoice created',
        `Invoice ${newInvoice.number} created for ${newInvoice.clientName}`,
        'invoice',
        newInvoice.id,
        {
          amount: newInvoice.total,
          status: newInvoice.status,
          clientId: newInvoice.clientId,
          clientEmail: newInvoice.clientEmail,
        }
      );

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
    // Log activity: record payment modal opened
    try {
      activityService.logFinancialAction(
        'Record payment opened',
        `Opened record payment for invoice ${invoice.number}`,
        'invoice',
        invoice.id,
        { status: invoice.status, balance: invoice.balance, amount: invoice.total }
      );
    } catch (err) {
      console.warn('Failed to log record payment open:', err);
    }
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
    
    // Find invoice being deleted for logging metadata
    const invoiceToDelete = (storedInvoices as any[]).find(inv => inv?.id === invoiceId);

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

    // Log activity: invoice deleted
    activityService.logFinancialAction(
      'Invoice deleted',
      `Invoice ${invoiceToDelete?.number || invoiceId} deleted`,
      'invoice',
      invoiceId,
      {
        clientName: invoiceToDelete?.clientName,
        amount: invoiceToDelete?.total,
      }
    );

    // Dispatch event for delete
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('invoices-updated', { detail: { action: 'deleted', invoiceId, invoice: invoiceToDelete } }));
      }
    } catch {}

    toast.success(t('invoices.toasts.deleted'));
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
    let updatedInvoiceForLog: any = null;
    setInvoices(prev => prev.map(invoice => {
      if (invoice.id === invoiceId) {
        updatedInvoiceForLog = { ...invoice, status: newStatus };
        return updatedInvoiceForLog;
      }
      return invoice;
    }));
    
    // Log activity: status updated
    activityService.logFinancialAction(
      'Invoice status updated',
      `Invoice ${updatedInvoiceForLog?.number || invoiceId} status changed to ${newStatus}`,
      'invoice',
      invoiceId,
      { previousStatus: updatedInvoiceForLog?.status, newStatus }
    );

    // Dispatch event for status change
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('invoices-updated', { detail: { action: 'status-changed', invoice: updatedInvoiceForLog, status: newStatus } }));
      }
    } catch {}

    toast.success(t('invoices.toasts.statusUpdated'));
  };

  const handleEditInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setSelectedInvoiceForEdit(invoice);
      setShowCreateModal(true);

      // Log activity: invoice opened for edit
      activityService.logFinancialAction(
        'Invoice opened for edit',
        `Invoice ${invoice.number} opened for editing`,
        'invoice',
        invoiceId
      );
    }
  };
  
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoiceForPreview(invoice);
    setShowPreviewModal(true);

    // Log activity: invoice viewed
    activityService.logFinancialAction(
      'Invoice viewed',
      `Viewed invoice ${invoice.number}`,
      'invoice',
      invoice.id
    );
  };
  
  // Function to get company details for PDFs and emails
  const getCompanyDetails = () => {
    return companyDetails;
  };
  
  // Handle duplicate invoice for UI update
  const handleDuplicateInvoice = (newInvoice: Invoice) => {
    setInvoices(prevInvoices => [...prevInvoices, newInvoice]);

    // Log activity: invoice duplicated
    activityService.logFinancialAction(
      'Invoice duplicated',
      `Duplicated invoice to ${newInvoice.number}`,
      'invoice',
      newInvoice.id,
      { amount: newInvoice.total, clientName: newInvoice.clientName }
    );
  };

  // UI interaction logging handlers
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    try {
      activityService.logFinancialAction(
        'Invoices searched',
        query ? `Searched invoices: "${query}"` : 'Cleared invoice search',
        'invoice',
        undefined,
        { query }
      );
    } catch (err) {
      console.warn('Failed to log invoice search:', err);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    try {
      activityService.logFinancialAction(
        'Invoice status filter changed',
        `Filtered invoices by status: ${status}`,
        'invoice',
        undefined,
        { status }
      );
    } catch (err) {
      console.warn('Failed to log status filter change:', err);
    }
  };

  const handleDateFilterChange = (date: string) => {
    setDateFilter(date);
    try {
      activityService.logFinancialAction(
        'Invoice date filter changed',
        `Filtered invoices by date range: ${date}`,
        'invoice',
        undefined,
        { dateRange: date }
      );
    } catch (err) {
      console.warn('Failed to log date filter change:', err);
    }
  };

  const handleClientFilterChange = (clientId: string) => {
    setClientFilter(clientId);
    try {
      activityService.logFinancialAction(
        'Invoice client filter changed',
        clientId === 'all' ? 'Cleared client filter' : `Filtered invoices by client: ${clientId}`,
        'invoice',
        undefined,
        { clientId }
      );
    } catch (err) {
      console.warn('Failed to log client filter change:', err);
    }
  };

  const handleViewModeChange = (mode: 'table' | 'grid') => {
    setViewMode(mode);
    try {
      activityService.logFinancialAction(
        'Invoices view mode changed',
        `Changed invoices view to ${mode}`,
        'invoice',
        undefined,
        { viewMode: mode }
      );
    } catch (err) {
      console.warn('Failed to log view mode change:', err);
    }
  };

  const handleSort = (field: string) => {
    let newSortField = field;
    let newSortDirection: 'asc' | 'desc' = 'desc';
    if (sortField === field) {
      newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newSortDirection);
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    try {
      activityService.logFinancialAction(
        'Invoices sorted',
        `Sorted invoices by ${newSortField} (${sortField === field ? newSortDirection : 'desc'})`,
        'invoice',
        undefined,
        { field, direction: sortField === field ? newSortDirection : 'desc' }
      );
    } catch (err) {
      console.warn('Failed to log sort change:', err);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    try {
      activityService.logFinancialAction(
        'Invoices page changed',
        `Changed invoices page to ${page}`,
        'invoice',
        undefined,
        { page, itemsPerPage }
      );
    } catch (err) {
      console.warn('Failed to log page change:', err);
    }
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // reset to first page when page size changes
    try {
      activityService.logFinancialAction(
        'Invoices page size changed',
        `Changed invoices per page to ${items}`,
        'invoice',
        undefined,
        { itemsPerPage: items }
      );
    } catch (err) {
      console.warn('Failed to log items-per-page change:', err);
    }
  };

  const handleOpenCreateInvoice = () => {
    setSelectedInvoiceForEdit(null);
    setShowCreateModal(true);
    try {
      activityService.logFinancialAction(
        'Create invoice opened',
        'Opened create invoice modal',
        'invoice'
      );
    } catch (err) {
      console.warn('Failed to log create invoice open:', err);
    }
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
  <div className="min-h-screen bg-background relative">
    <DashboardBackground />
    <div className="p-8 space-y-6 relative z-10">
      <InvoicesHeader
        onCreateInvoice={handleOpenCreateInvoice}
        onRecordPayment={() => {
          if (selectedInvoices.length === 1) {
            const invoice = invoices.find(inv => inv.id === selectedInvoices[0]);
            if (invoice) {
              handleRecordPayment(invoice);
            }
          } else if (selectedInvoices.length === 0) {
            toast.error(t('invoices.toasts.selectOneToRecord'));
          } else {
            toast.error(t('invoices.toasts.selectOnlyOneToRecord'));
          }
        }}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        hasSelectedInvoice={selectedInvoices.length === 1}
      />

      <InvoicesSummaryCards invoices={invoices} />

      <InvoicesSearchAndFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        dateFilter={dateFilter}
        onDateFilterChange={handleDateFilterChange}
        clientFilter={clientFilter}
        onClientFilterChange={handleClientFilterChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
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
        onSort={handleSort}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={sortedInvoices.length}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
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
          toast.success(t('invoices.toasts.paymentRecorded'));
        }}
      />
      
      {/* Invoice View Modal */}
      <InvoiceViewModal
        invoice={selectedInvoiceForPreview}
        open={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        getCompanyDetails={getCompanyDetails}
      />
      </div>
    </div>
  );
};

export default Invoices;
