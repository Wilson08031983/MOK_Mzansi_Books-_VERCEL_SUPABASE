import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalization } from '@/hooks/useLocalization';
import { 
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  RefreshCw,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Mail,
  FileText,
  Receipt,
  Trash2,
  ArrowLeft,
  ChevronLeft,
  HelpCircle
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ClientsTable from '@/components/clients/ClientsTable';
import ClientsGrid from '@/components/clients/ClientsGrid';
import AddClientModal from '@/components/clients/AddClientModal';
import BulkActionsBar from '@/components/clients/BulkActionsBar';
import ClientsStats from '@/components/clients/ClientsStats';
import { getClientOutstandingBalance } from '@/services/invoiceService';
import HelpCentre from '@/components/HelpCentre';
import { Client, getClients, initializeClients } from '@/services/clientService';
import DashboardBackground from '@/components/dashboard/DashboardBackground';

// Define interfaces for invoice and payment data from localStorage
interface InvoiceData {
  id: string;
  clientId: string;
  total: number;
  balance?: number;
  paidAmount?: number;
  status?: string;
}

interface PaymentData {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
}

// Interface for incomes saved by Sales Slip
interface IncomeData {
  id: string;
  date: string;
  description: string;
  amount: number;
  category?: string;
  status?: string;
  paymentMethod?: string;
  client?: string;
  clientId?: string;
  source?: string;
  // When a sales slip is later converted to an invoice, we set this to true
  hasInvoice?: boolean;
  // Optional reference fields for linkage
  linkedInvoiceId?: string;
  saleSessionId?: string;
}

// Interface for displaying clients in the UI
interface ClientDisplay {
  id: string;
  name: string; // maps to contactPerson in Client
  company: string; // maps to companyName in Client
  email: string;
  phone: string;
  totalValue: number;
  lastActivity: string;
  status: string;
  statusReason?: string;
  type: string;
  avatar: string;
  creditLimit: number;
  outstanding: number;
  overCredit: boolean;
}

const Clients = () => {
  const { t, formatDateTime, getTimezoneDisplayName, formatCurrency, settings } = useLocalization();
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  // Open add client modal when navigated with state from Quick Actions
  useEffect(() => {
    const state = location.state as any;
    if (state?.openAddClientModal) {
      setIsAddClientModalOpen(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  // Update document title when language changes
  useEffect(() => {
    document.title = `${t('clients.title')} - MOK Mzansi Books`;
  }, [t]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<ClientDisplay[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  
  // Ref for container to save scroll position
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const [filters, setFilters] = useState({
    status: 'all',
    clientType: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    // Load clients from localStorage on component mount
    const loadClients = async () => {
      try {
        await loadClientsFromStorage();
      } catch (error) {
        console.error('Failed to load clients:', error);
      }
    };

  // Determine status and last activity based on invoices, payments and incomes
  const calculateClientStatusAndActivity = (clientId: string): { status: string; lastActivity: string; statusReason?: string } => {
    try {
      const invoices: any[] = JSON.parse(localStorage.getItem('invoices') || '[]');
      const payments: any[] = JSON.parse(localStorage.getItem('payments') || '[]');
      const incomes: any[] = JSON.parse(localStorage.getItem('incomes') || '[]');

      const clientInvoices = invoices.filter(inv => inv.clientId === clientId || inv.client === clientId);
      const clientPayments = payments.filter(pay => pay && pay.invoiceId && clientInvoices.some(inv => inv.id === pay.invoiceId));
      const clientIncomes = incomes.filter(inc => inc && inc.clientId === clientId);

      // Last activity = latest among invoiceDate/date, paymentDate, income date, fallback to now
      const dateCandidates: number[] = [];
      clientInvoices.forEach(inv => {
        const d = new Date(inv.updatedAt || inv.invoiceDate || inv.date).getTime();
        if (!isNaN(d)) dateCandidates.push(d);
      });
      clientPayments.forEach(pay => {
        const d = new Date(pay.paymentDate).getTime();
        if (!isNaN(d)) dateCandidates.push(d);
      });
      clientIncomes.forEach(inc => {
        const d = new Date(inc.date).getTime();
        if (!isNaN(d)) dateCandidates.push(d);
      });

      const latestTs = dateCandidates.length > 0 ? Math.max(...dateCandidates) : Date.now();
      const lastActivity = new Date(latestTs).toISOString();

      // Improved overdue detection with better credit agreement checks
      const nowTs = Date.now();
      const hasOverdue = clientInvoices.some(inv => {
        const dueTs = new Date(inv.dueDate || inv.date).getTime();
        const balance = Number(inv.balance ?? (Number(inv.total || inv.amount || 0) - Number(inv.paidAmount || 0)));
        // Invoice is overdue if it has a positive balance and is past due date
        return balance > 0 && !isNaN(dueTs) && dueTs < nowTs && (nowTs - dueTs) > (7 * 24 * 60 * 60 * 1000); // At least 7 days overdue
      });
      
      // Check for at-risk clients (multiple late payments in history but not severely overdue)
      const hasLatePayments = clientPayments.filter(pay => {
        const paymentDate = new Date(pay.paymentDate).getTime();
        const invoice = clientInvoices.find(inv => inv.id === pay.invoiceId);
        if (invoice && invoice.dueDate) {
          const dueDate = new Date(invoice.dueDate).getTime();
          // Payment was made after due date
          return paymentDate > dueDate;
        }
        return false;
      }).length >= 2; // At least 2 late payments
      
      // Check for warning status (approaching credit limit)
      const clientData = JSON.parse(localStorage.getItem('clients') || '[]').find(c => c.id === clientId);
      const clientCredit = parseFloat(clientData?.creditLimit || '0');
      const clientOutstanding = getClientOutstandingBalance(clientId);
      const isApproachingCreditLimit = clientCredit > 0 && clientOutstanding > (clientCredit * 0.8) && clientOutstanding <= clientCredit;

      // Active logic: recent activity (<= 90 days) or outstanding not overdue
      const days90 = 90 * 24 * 60 * 60 * 1000;
      const hasRecentActivity = nowTs - latestTs <= days90;
      const hasVeryOldActivity = (nowTs - latestTs) > (180 * 24 * 60 * 60 * 1000); // No activity for 6 months

      const outstandingNotOverdue = clientInvoices.some(inv => {
        const dueTs = new Date(inv.dueDate || inv.date).getTime();
        const balance = Number(inv.balance ?? (Number(inv.total || inv.amount || 0) - Number(inv.paidAmount || 0)));
        return balance > 0 && (!dueTs || isNaN(dueTs) || dueTs >= nowTs);
      });

      let status = 'inactive';
      let statusReason: string | undefined;
      
      if (hasOverdue) status = 'overdue';
      else if (hasLatePayments) {
        status = 'at-risk';
        statusReason = 'Multiple late payments';
      }
      else if (isApproachingCreditLimit) {
        status = 'warning';
        statusReason = 'Approaching credit limit';
      }
      else if (hasRecentActivity || outstandingNotOverdue) status = 'active';
      
      // Extra check for long-term inactivity
      if (hasVeryOldActivity && status === 'inactive') {
        statusReason = 'No activity for over 6 months';
      }

      return { status, lastActivity, statusReason };
    } catch (e) {
      console.error('Error determining client status:', e);
      return { status: 'inactive', lastActivity: new Date().toISOString(), statusReason: 'Error calculating status' };
    }
  };
    
    // Define the custom event handler for invoice, payment and income updates
    const handleDataUpdate = () => {
      loadClientsFromStorage();
    };

    // Execute initial load
    loadClients();
    
    // Add event listeners for custom events that will be dispatched when invoices, payments or incomes change
    window.addEventListener('invoices-updated', handleDataUpdate);
    window.addEventListener('payments-updated', handleDataUpdate);
    window.addEventListener('income-updated', handleDataUpdate);
    
    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('invoices-updated', handleDataUpdate);
      window.removeEventListener('payments-updated', handleDataUpdate);
      window.removeEventListener('income-updated', handleDataUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to save current scroll position
  const saveScrollPosition = (): void => {
    if (contentContainerRef.current) {
      scrollPositionRef.current = contentContainerRef.current.scrollTop;
    }
  };

  // Function to restore scroll position
  const restoreScrollPosition = (): void => {
    if (contentContainerRef.current) {
      setTimeout(() => {
        if (contentContainerRef.current) {
          contentContainerRef.current.scrollTop = scrollPositionRef.current;
        }
      }, 10);
    }
  };
  
  // Determine status and last activity based on invoices, payments and incomes
  const calculateClientStatusAndActivity = (clientId: string): { status: string; lastActivity: string; statusReason?: string } => {
    try {
      const invoices: any[] = JSON.parse(localStorage.getItem('invoices') || '[]');
      const payments: any[] = JSON.parse(localStorage.getItem('payments') || '[]');
      const incomes: any[] = JSON.parse(localStorage.getItem('incomes') || '[]');

      const clientInvoices = invoices.filter(inv => inv.clientId === clientId || inv.client === clientId);
      const clientPayments = payments.filter(pay => pay && pay.invoiceId && clientInvoices.some(inv => inv.id === pay.invoiceId));
      const clientIncomes = incomes.filter(inc => inc && inc.clientId === clientId);

      // Last activity = latest among invoiceDate/date, paymentDate, income date, fallback to now
      const dateCandidates: number[] = [];
      clientInvoices.forEach(inv => {
        const d = new Date(inv.updatedAt || inv.invoiceDate || inv.date).getTime();
        if (!isNaN(d)) dateCandidates.push(d);
      });
      clientPayments.forEach(pay => {
        const d = new Date(pay.paymentDate).getTime();
        if (!isNaN(d)) dateCandidates.push(d);
      });
      clientIncomes.forEach(inc => {
        const d = new Date(inc.date).getTime();
        if (!isNaN(d)) dateCandidates.push(d);
      });

      const latestTs = dateCandidates.length > 0 ? Math.max(...dateCandidates) : Date.now();
      const lastActivity = new Date(latestTs).toISOString();

      // Improved overdue detection with better credit agreement checks
      const nowTs = Date.now();
      const hasOverdue = clientInvoices.some(inv => {
        const dueTs = new Date(inv.dueDate || inv.date).getTime();
        const balance = Number(inv.balance ?? (Number(inv.total || inv.amount || 0) - Number(inv.paidAmount || 0)));
        // Invoice is overdue if it has a positive balance and is past due date
        return balance > 0 && !isNaN(dueTs) && dueTs < nowTs && (nowTs - dueTs) > (7 * 24 * 60 * 60 * 1000); // At least 7 days overdue
      });
      
      // Check for at-risk clients (multiple late payments in history but not severely overdue)
      const hasLatePayments = clientPayments.filter(pay => {
        const paymentDate = new Date(pay.paymentDate).getTime();
        const invoice = clientInvoices.find(inv => inv.id === pay.invoiceId);
        if (invoice && invoice.dueDate) {
          const dueDate = new Date(invoice.dueDate).getTime();
          // Payment was made after due date
          return paymentDate > dueDate;
        }
        return false;
      }).length >= 2; // At least 2 late payments
      
      // Check for warning status (approaching credit limit)
      const clientData = JSON.parse(localStorage.getItem('clients') || '[]').find(c => c.id === clientId);
      const clientCredit = parseFloat(clientData?.creditLimit || '0');
      const clientOutstanding = getClientOutstandingBalance(clientId);
      const isApproachingCreditLimit = clientCredit > 0 && clientOutstanding > (clientCredit * 0.8) && clientOutstanding <= clientCredit;

      // Active logic: recent activity (<= 90 days) or outstanding not overdue
      const days90 = 90 * 24 * 60 * 60 * 1000;
      const hasRecentActivity = nowTs - latestTs <= days90;
      const hasVeryOldActivity = (nowTs - latestTs) > (180 * 24 * 60 * 60 * 1000); // No activity for 6 months

      const outstandingNotOverdue = clientInvoices.some(inv => {
        const dueTs = new Date(inv.dueDate || inv.date).getTime();
        const balance = Number(inv.balance ?? (Number(inv.total || inv.amount || 0) - Number(inv.paidAmount || 0)));
        return balance > 0 && (!dueTs || isNaN(dueTs) || dueTs >= nowTs);
      });

      let status = 'inactive';
      let statusReason: string | undefined;
      
      if (hasOverdue) status = 'overdue';
      else if (hasLatePayments) {
        status = 'at-risk';
        statusReason = 'Multiple late payments';
      }
      else if (isApproachingCreditLimit) {
        status = 'warning';
        statusReason = 'Approaching credit limit';
      }
      else if (hasRecentActivity || outstandingNotOverdue) status = 'active';
      
      // Extra check for long-term inactivity
      if (hasVeryOldActivity && status === 'inactive') {
        statusReason = 'No activity for over 6 months';
      }

      return { status, lastActivity, statusReason };
    } catch (e) {
      console.error('Error determining client status:', e);
      return { status: 'inactive', lastActivity: new Date().toISOString(), statusReason: 'Error calculating status' };
    }
  };

  // Function to calculate total value for each client based on invoices, payments, and sales slip incomes
  const calculateClientTotalValues = (clientId: string): number => {
    try {
      // Get all invoices from localStorage
      const invoicesData = localStorage.getItem('invoices');
      const invoices: InvoiceData[] = invoicesData ? JSON.parse(invoicesData) : [];
      
      // Get all payments from localStorage
      const paymentsData = localStorage.getItem('payments');
      const payments: PaymentData[] = paymentsData ? JSON.parse(paymentsData) : [];
      
      // Get incomes (for sales slips) from localStorage
      const incomesData = localStorage.getItem('incomes');
      const incomes: IncomeData[] = incomesData ? JSON.parse(incomesData) : [];
      
      // Filter invoices for this client
      const clientInvoices = invoices.filter((invoice) => invoice.clientId === clientId);
      
      // Calculate total invoiced amount
      let totalInvoiced = 0;
      let totalPaid = 0;
      
      // Loop through client invoices
      clientInvoices.forEach((invoice) => {
        // Add invoice total to the totalInvoiced
        totalInvoiced += Number(invoice.total || 0);
        
        // Find payments for this invoice
        const invoicePayments = payments.filter((payment) => payment.invoiceId === invoice.id);
        
        // Sum up the payments
        invoicePayments.forEach((payment) => {
          totalPaid += Number(payment.amount || 0);
        });
      });
      
      // Sum confirmed sales slip incomes for this client
      const salesSlipIncomeTotal = incomes
        .filter((inc) =>
          inc.clientId === clientId &&
          // Only count raw sales slip incomes that have NOT been converted to invoice
          inc.hasInvoice !== true &&
          (inc.source === 'sales_slip' || inc.description?.includes('Sales Transaction - Print Slip'))
        )
        .reduce((sum, inc) => sum + Number(inc.amount || 0), 0);

      // Combined: outstanding invoices plus sales slip totals
      return Math.max(0, totalInvoiced - totalPaid) + salesSlipIncomeTotal;
    } catch (error) {
      console.error('Error calculating client total value:', error);
      return 0;
    }
  };
  
  // Function to load clients from localStorage
  const loadClientsFromStorage = async (): Promise<void> => {
    try {
      // Import clientService using dynamic import
      const clientService = await import('@/services/clientService');
      let clientsToProcess: Client[] = [];
      
      // Try to get existing clients
      const existingClients = clientService.getClients();
      
      if (existingClients && existingClients.length > 0) {
        clientsToProcess = existingClients;
      } else {
        // Initialize with mock clients if no clients exist
        clientService.initializeClients();
        clientsToProcess = clientService.getClients() || [];
      }
      
      // Process and set clients with proper types
      const processedClients = clientsToProcess
        .filter((client: Client | null | undefined): client is Client => Boolean(client))
        .map((client: Client) => {
          // Calculate the true total value based on invoices and payments
          const calculatedTotalValue = calculateClientTotalValues(client.id || '');
          const { status, lastActivity, statusReason } = calculateClientStatusAndActivity(client.id || '');
          const creditLimitNum = Number(client.creditLimit) || 0;
          const outstanding = getClientOutstandingBalance(client.id || '');
          const overCredit = creditLimitNum > 0 && outstanding > creditLimitNum;
          
          return {
            id: client.id || '',
            name: client.contactPerson || t('clients.noName'),
            company: client.companyName || t('clients.noCompany'),
            email: client.email || '',
            phone: client.phone || '',
            totalValue: calculatedTotalValue, // Use the calculated value
            lastActivity: lastActivity || client.lastActivity || new Date().toISOString(),
            status: status || client.status || 'inactive',
            statusReason,
            type: client.clientType || 'individual',
            avatar: client.avatar || '',
            creditLimit: creditLimitNum,
            outstanding,
            overCredit
          };
        });
      
      setClients(processedClients);
    } catch (error) {
      console.error(t('clients.errorLoadingClients'), error);
      setClients([]);
    }
  };

  // Handle client added/updated
  const handleClientAdded = (newClient?: Client): void => {
    loadClientsFromStorage(); // Reload all clients from localStorage
  };

  // Handle refresh button click
  const handleRefresh = (): void => {
    saveScrollPosition();
    loadClientsFromStorage();
    // Restore scroll position after data is loaded and rendered
    setTimeout(restoreScrollPosition, 50);
  };

  // Get status icon and color for a client
  const getStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Clock className="h-4 w-4 text-slate-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'at-risk':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <XCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-slate-100 text-slate-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-amber-100 text-amber-800';
      case 'at-risk':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Filter clients based on search query
  const filteredClients = clients.filter((client: ClientDisplay) => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || client.status === filters.status;
    const matchesType = filters.clientType === 'all' || client.type === filters.clientType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectClient = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(client => client.id));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: 'all',
      clientType: 'all',
      dateRange: 'all'
    });
  };

  return (
    <div className="min-h-screen bg-background relative">
      <DashboardBackground />
      <div className="p-8 space-y-8 relative z-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 glass backdrop-blur-md bg-white/10 dark:bg-white/5 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-white/15 dark:hover:bg-white/10 rounded-xl border border-white/10 shadow-business hover:shadow-business-lg transition-all duration-300 animate-fade-in"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> {t('common.backToDashboard')}
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-sf-pro">{t('clients.title')}</h1>
            <p className="text-slate-600 dark:text-slate-400 font-sf-pro">{t('clients.manageClients')}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl transition-all duration-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('common.refresh')}
          </Button>
          {/* Deep link to Settings Help tab with context (hidden) */}
          <Link
            to={{ pathname: '/settings', search: '?tab=help&context=clients' }}
            className="hidden"
            title="Open Help tab in Settings"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            {t('common.help') ?? 'Help'}
          </Link>
          
          <div className="flex items-center border border-slate-300 rounded-xl p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-lg"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-lg"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
          {/* Inline HelpCentre trigger (hidden) */}
          <div className="hidden">
            <HelpCentre />
          </div>
          
          <Button
            onClick={() => setIsAddClientModalOpen(true)}
            className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white font-sf-pro rounded-xl shadow-colored hover:shadow-colored-lg transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('clients.addClient')}
          </Button>
        </div>
      </div>

      {/* Client Stats */}
      <ClientsStats clients={clients} />

      {/* Search and Filters */}
      <Card className="glass backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 shadow-business">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('clients.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/40 focus:border-mokm-purple-500/40 hover:bg-white/15 dark:hover:bg-white/10 transition-all duration-300 font-sf-pro"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              )}
            </div>
            
            {/* Filter Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/40 focus:border-mokm-purple-500/40 hover:bg-white/15 dark:hover:bg-white/10 transition-all duration-300 font-sf-pro"
                >
                  <option value="all">{t('clients.allStatus')}</option>
                  <option value="active">{t('clients.active')}</option>
                  <option value="inactive">{t('clients.inactive')}</option>
                  <option value="overdue">{t('clients.overdue')}</option>
                  <option value="warning">{t('clients.warning')}</option>
                  <option value="at-risk">{t('clients.at-risk')}</option>
                  <option value="pending">{t('clients.pending')}</option>
                </select>
              </div>
              
              <select
                value={filters.clientType}
                onChange={(e) => setFilters(prev => ({ ...prev, clientType: e.target.value }))}
                className="px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/40 focus:border-mokm-purple-500/40 hover:bg-white/15 dark:hover:bg-white/10 transition-all duration-300 font-sf-pro"
              >
                <option value="all">{t('clients.allTypes')}</option>
                <option value="individual">{t('clients.individual')}</option>
                <option value="business">{t('clients.business')}</option>
                <option value="government">{t('clients.government')}</option>
              </select>
              
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="glass backdrop-blur-md bg-white/10 dark:bg-white/5 hover:bg-white/15 dark:hover:bg-white/10 border border-white/10 shadow-business font-sf-pro rounded-xl transition-all duration-300"
              >
                {t('clients.clearFilters')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedClients.length > 0 && (
        <Card className="glass backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 shadow-business">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-700 font-sf-pro">
                  {selectedClients.length} {selectedClients.length !== 1 ? t('clients.clients') : t('clients.client')} {t('clients.selected')}
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-sf-pro rounded-lg"
                  >
                    {t('clients.changeStatus')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-sf-pro rounded-lg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t('common.downloadPDF')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-sf-pro rounded-lg text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('clients.deleteSelected')}
                  </Button>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedClients([])}
                className="font-sf-pro"
              >
                {t('clients.clearSelection')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clients List */}
      <Card className="glass backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 shadow-business hover:shadow-business-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100 font-sf-pro text-xl">
            {filteredClients.length} {filteredClients.length !== 1 ? t('clients.clients') : t('clients.client')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'table' ? (
            <div 
              ref={contentContainerRef}
              className="rounded-xl border border-white/10 glass-soft supports-backdrop:backdrop-blur-sm" 
              style={{ flex: 1, overflow: 'auto' }}
            >
              <ClientsTable 
                clients={filteredClients}
                selectedClients={selectedClients}
                onSelectClient={(id) => {
                  if (selectedClients.includes(id)) {
                    setSelectedClients(selectedClients.filter(clientId => clientId !== id));
                  } else {
                    setSelectedClients([...selectedClients, id]);
                  }
                }}
                onSelectAll={() => {
                  if (selectedClients.length === filteredClients.length) {
                    setSelectedClients([]);
                  } else {
                    setSelectedClients(filteredClients.map(client => client.id));
                  }
                }}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
              />
            </div>
          ) : (
            <div 
              ref={contentContainerRef}
              className="rounded-xl border border-white/10 glass-soft supports-backdrop:backdrop-blur-sm" 
              style={{ flex: 1, overflow: 'auto' }}
            >
              <ClientsGrid 
                clients={filteredClients}
                selectedClients={selectedClients}
                onSelectClient={(id) => {
                  if (selectedClients.includes(id)) {
                    setSelectedClients(selectedClients.filter(clientId => clientId !== id));
                  } else {
                    setSelectedClients([...selectedClients, id]);
                  }
                }}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
              />
            </div>
          )}
          
          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-slate-900 dark:text-slate-100 font-semibold font-sf-pro mb-2">{t('clients.noClientsFound')}</h3>
              <p className="text-slate-600 dark:text-slate-400 font-sf-pro text-sm mb-4">{t('clients.adjustSearchFilters')}</p>
              <Button
                onClick={() => setIsAddClientModalOpen(true)}
                className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white font-sf-pro rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('clients.addFirstClient')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Client Modal */}
      {isAddClientModalOpen && <AddClientModal isOpen={isAddClientModalOpen} onClose={() => setIsAddClientModalOpen(false)} onClientAdded={handleClientAdded} />}
      </div>
    </div>
  );
};

export default Clients;
