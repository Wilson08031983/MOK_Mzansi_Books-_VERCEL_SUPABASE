import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { 
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Send,
  Eye,
  AlertTriangle,
  X
} from 'lucide-react';
import QuotationsHeader from '@/components/quotations/QuotationsHeader';
import QuotationsSearchFilters from '@/components/quotations/QuotationsSearchFilters';
import QuotationsContent from '@/components/quotations/QuotationsContent';
import CreateQuotationModal from '@/components/quotations/CreateQuotationModal';
import QuotationsStats from '@/components/quotations/QuotationsStats';
import QuotationsAdvancedFilters from '@/components/quotations/QuotationsAdvancedFilters';
import QuotationsBulkActions from '@/components/quotations/QuotationsBulkActions';
import QuotationsPagination from '@/components/quotations/QuotationsPagination';
import { getQuotations, deleteQuotation, Quotation, checkAndUpdateExpiredQuotations, getQuotationStatus } from '@/services/quotationService';
import { addNotification, getNotifications, NotificationItem } from '@/services/notificationService';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import { activityService } from '@/services/activityService';
import DashboardBackground from '@/components/dashboard/DashboardBackground';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import AuthVerificationModal from '@/components/company/AuthVerificationModal';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';

const Quotations = () => {
  const { t, formatCurrency, settings } = useLocalization();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const location = useLocation();
  const navigate = useNavigate();
  const { logCreate, logUpdate, logDelete, logAudit, logNavigation, logSystem } = useAuditLogger();
  const { isTrial, getLimit } = useSubscriptionAccess();

  // Open create modal when navigated with state from Quick Actions
  useEffect(() => {
    const state = location.state as any;
    if (state?.openCreateQuotationModal) {
      handleOpenCreateQuotation(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  // Update document title when language changes
  useEffect(() => {
    document.title = `${t('quotations.title')} - MOK Mzansi Books`;
  }, [t]);
  const [isCreateQuotationModalOpen, setIsCreateQuotationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuotations, setSelectedQuotations] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  // Refs for audit comparisons
  const prevFiltersRef = useRef<typeof filters | null>(null);
  const searchDebounceRef = useRef<number | null>(null);

  // Navigation audit on mount
  useEffect(() => {
    try {
      logNavigation('Main');
    } catch (e) {
      console.warn('Audit logging (navigate Quotations) failed:', e);
    }
  }, [logNavigation]);
  
  // Define a type for the saved filters
  interface SavedFilter {
    id: string;
    name: string;
    filters: {
      status?: string;
      dateRange?: string;
      client?: string;
      amountMin?: string;
      amountMax?: string;
      tags?: string[];
    };
  }
  
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    dateType: 'created',
    client: 'all',
    amountMin: '',
    amountMax: '',
    salesperson: 'all',
    tags: [] as string[],
    customFields: {}
  });

  // Debounced search audit logging
  useEffect(() => {
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = window.setTimeout(() => {
      try {
        if (searchTerm && searchTerm.trim().length > 0) {
          logSystem('Quotations', 'Search', { term: searchTerm });
        } else {
          logSystem('Quotations', 'Clear Search');
        }
      } catch (e) {
        console.warn('Audit logging (search quotations) failed:', e);
      }
    }, 600);

    return () => {
      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    };
  }, [searchTerm, logSystem]);

  // Filters change diff audit logging
  useEffect(() => {
    if (!prevFiltersRef.current) {
      prevFiltersRef.current = filters;
      return;
    }
    const prev = prevFiltersRef.current;
    const changed: Record<string, { old: unknown; next: unknown }> = {};
    (Object.keys(filters) as Array<keyof typeof filters>).forEach((key) => {
      const oldVal = prev[key];
      const newVal = filters[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changed[String(key)] = { old: oldVal, next: newVal };
      }
    });
    if (Object.keys(changed).length > 0) {
      try {
        logSystem('Quotations', 'Filters Changed', { changed, nextFilters: filters });
      } catch (e) {
        console.warn('Audit logging (filters change) failed:', e);
      }
    }
    prevFiltersRef.current = filters;
  }, [filters, logSystem]);

  // Load quotations from localStorage using the quotationService
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  // Update page title when language changes
  useEffect(() => {
    document.title = `${t('quotations.title')} - MOK Mzansi Books`;
  }, [t]);

  // Load quotations from localStorage with automatic expiry checking
  const loadQuotations = () => {
    try {
      // First check and update any expired quotations
      const updatedQuotations = checkAndUpdateExpiredQuotations();
      setQuotations(updatedQuotations);
      return updatedQuotations;
    } catch (error) {
      console.error('Error loading quotations:', error);
      toast.error('Failed to load quotations');
      return [];
    }
  };

  // Handle refresh action
  const handleRefresh = () => {
    // Reset relevant states
    setCurrentPage(1);
    setSelectedQuotations([]);
    
    // Reload quotations
    loadQuotations();
    
    // Show feedback to user
    toast.success(t('common.success'));

    // Audit
    try {
      logSystem('Quotations', 'Refresh');
    } catch (e) {
      console.warn('Audit logging (refresh quotations) failed:', e);
    }
  };

  // Load quotations on component mount and set up periodic expiry checking
  useEffect(() => {
    loadQuotations();
    
    // Set up periodic checking for expired quotations (every 5 minutes)
    const intervalId = setInterval(() => {
      const updatedQuotations = checkAndUpdateExpiredQuotations();
      setQuotations(updatedQuotations);
    }, 5 * 60 * 1000); // 5 minutes
    
    // Listen for quotations-updated to refresh + notify
    const handleQuotationsUpdated = (evt: Event) => {
      try {
        const e = evt as CustomEvent;
        const detail = (e && e.detail) || {};
        const action: string = detail.action || '';
        const quotation: Quotation | undefined = detail.quotation;
        const quotationId: string | undefined = detail.quotationId;
        const number = quotation?.number || quotationId || 'Quotation';

        // Refresh list quickly
        const latest = checkAndUpdateExpiredQuotations();
        setQuotations(latest);

        // Compose notification
        let title = '';
        let message = '';
        if (action === 'created') {
          title = `Quotation Created: ${number}`;
          message = `A new quotation was created for ${quotation?.client ?? 'a client'}.`;
          // Audit log: quotation created
          try {
            logCreate('Quotation', String(number), quotation?.id || quotationId, quotation);
          } catch (e) {
            console.warn('Audit logging (quotation create) failed:', e);
          }
        } else if (action === 'updated') {
          title = `Quotation Updated: ${number}`;
          message = `Quotation details were updated${quotation?.client ? ` (${quotation.client})` : ''}.`;
          // Audit log: quotation updated
          try {
            logUpdate('Quotation', String(number), quotation?.id || quotationId || 'unknown', undefined, quotation);
          } catch (e) {
            console.warn('Audit logging (quotation update) failed:', e);
          }
        } else if (action === 'deleted') {
          title = `Quotation Deleted: ${number}`;
          message = `A quotation was deleted${quotation?.client ? ` (${quotation.client})` : ''}.`;
          // Audit log: quotation deleted
          try {
            logDelete('Quotation', String(number), quotationId || quotation?.id || 'unknown');
          } catch (e) {
            console.warn('Audit logging (quotation delete) failed:', e);
          }
        } else if (action === 'status-changed') {
          const newStatus = detail.status || quotation?.status;
          title = `Quotation Status: ${number}`;
          message = `Status changed to ${String(newStatus).toUpperCase()}.`;
          // Audit log: status changed
          try {
            const prevStatus = detail.prevStatus;
            logAudit({
              category: 'financial',
              action: 'Quotation status changed',
              entityType: 'Quotation',
              entityId: quotation?.id || quotationId || 'unknown',
              entityName: String(number),
              changeType: 'update',
              oldValues: { status: prevStatus },
              newValues: { status: newStatus },
              description: `Status changed from ${String(prevStatus).toUpperCase()} to ${String(newStatus).toUpperCase()} for quotation ${number}`,
              metadata: { quotationId: quotation?.id || quotationId }
            });
          } catch (e) {
            console.warn('Audit logging (quotation status change) failed:', e);
          }
        } else if (action === 'status-batch-updated') {
          const count = detail.count || 0;
          if (!count) return;
          title = `Quotations Expired: ${count}`;
          message = `${count} quotation(s) moved to Expired.`;
          // Audit log: batch status changes (summary)
          try {
            logAudit({
              category: 'financial',
              action: 'Quotations batch status update',
              changeType: 'update',
              description: `${count} quotation(s) automatically moved to Expired`,
              metadata: { count }
            });
          } catch (e) {
            console.warn('Audit logging (quotation batch status) failed:', e);
          }
        } else {
          return;
        }

        // De-duplicate within 5 minutes by same title+message and type 'invoice' or 'system'
        const existing: NotificationItem[] = getNotifications();
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const dup = existing.some(n => {
          const ts = new Date(n.date).getTime();
          return n.title === title && n.message === message && (n.type === 'invoice' || n.type === 'system') && !isNaN(ts) && ts >= fiveMinutesAgo;
        });
        if (!dup) {
          addNotification({ title, message, type: 'invoice' });
        }
      } catch (err) {
        console.warn('Failed handling quotations-updated event:', err);
      }
    };
    window.addEventListener('quotations-updated', handleQuotationsUpdated as EventListener);
    
    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('quotations-updated', handleQuotationsUpdated as EventListener);
    };
  }, []);

  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  // New: modal state for admin verification on edit/delete
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'delete' | 'update'; quotationId: string | null }>({ type: 'delete', quotationId: null });

  // Helper to perform edit after verification
  const doEditQuotation = (quotationId: string) => {
    const quotationToEdit = quotations.find(q => q.id === quotationId);
    if (quotationToEdit) {
      setEditingQuotation(quotationToEdit);
      setIsCreateQuotationModalOpen(true);
      try {
        logSystem('Quotations', 'Open Edit Quotation Modal', { quotationId });
      } catch (e) {
        console.warn('Audit logging (open edit modal) failed:', e);
      }
    } else {
      toast.error('Quotation not found');
    }
  };

  // Helper to perform delete after verification
  const doDeleteQuotation = (quotationId: string): void => {
    // Find quotation before deletion for logging metadata
    const quot = quotations.find(q => q.id === quotationId);

    const updatedQuotations = deleteQuotation(quotationId);
    setQuotations(updatedQuotations);

    // Log activity for quotation deletion
    try {
      const number = quot?.number || 'Unknown';
      activityService.logFinancialAction(
        'Quotation deleted',
        `Quotation ${number} was deleted`,
        'quotation',
        quotationId,
        {
          number,
          amount: quot?.totalAmount ?? quot?.amount,
          status: quot?.status,
          clientId: quot?.clientId,
          client: quot?.client
        }
      );
      // Audit service logging as well
      try {
        logDelete('Quotation', String(number), quotationId);
      } catch (e) {
        console.warn('Audit logging (quotation delete via audit service) failed:', e);
      }
    } catch (logErr) {
      console.warn('Activity logging failed (quotation delete):', logErr);
    }

    toast.success('Quotation deleted successfully');
  };

  // Handle edit quotation (now requires verification)
  const handleEditQuotation = (quotationId: string) => {
    setPendingAction({ type: 'update', quotationId });
    setIsAuthModalOpen(true);
  };

  // Handle when a new or updated quotation is saved
  const handleQuotationSaved = (newQuotation: Quotation, allQuotations: Quotation[]) => {
    // Update the local state with the latest quotations
    setQuotations(allQuotations);
    
    // Show success message
    const action = editingQuotation ? 'updated' : 'saved';
    toast.success(`Quotation ${newQuotation.number} ${action} successfully`);
    
    // Reset editing state and close the modal
    setEditingQuotation(null);
    setIsCreateQuotationModalOpen(false);
  };

  const handleDeleteQuotation = (quotationId: string): void => {
    // Require verification before performing deletion
    setPendingAction({ type: 'delete', quotationId });
    setIsAuthModalOpen(true);
  };

  // Called when the admin verification modal succeeds
  const handleAuthVerified = () => {
    const id = pendingAction.quotationId;
    if (!id) {
      setIsAuthModalOpen(false);
      return;
    }
    if (pendingAction.type === 'delete') {
      doDeleteQuotation(id);
    } else {
      doEditQuotation(id);
    }
    setIsAuthModalOpen(false);
    setPendingAction({ type: 'delete', quotationId: null });
  };

  // Get status icon with proper typing
  const getStatusIcon = (status: string) => {
    if (!status) return <FileText className="h-4 w-4 text-muted-foreground" />;
    
    switch (status.toLowerCase()) {
      case 'draft':
      case 'saved':
        return <FileText className="h-4 w-4 text-muted-foreground" />;
      case 'sent':
        return <Send className="h-4 w-4 text-primary" />;
      case 'viewed':
        return <Eye className="h-4 w-4 text-primary/80" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-muted text-muted-foreground border-border';
    
    switch (status.toLowerCase()) {
      case 'draft':
      case 'saved':
        return 'bg-muted text-muted-foreground border-border';
      case 'sent':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'viewed':
        return 'bg-primary/5 text-primary/80 border-primary/10';
      case 'accepted':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'overdue':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'expired':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'rejected':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'cancelled':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };
  
  // Helper function to get display status text
  const getDisplayStatus = (status?: string) => {
    if (!status) return 'Draft';
    const statusLower = status.toLowerCase();
    if (statusLower === 'saved') return 'Draft';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (quotation.project?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = filters.status === 'all' || quotation.status === filters.status;
    const matchesClient = filters.client === 'all' || quotation.clientId === filters.client;
    const matchesSalesperson = filters.salesperson === 'all' || quotation.salespersonId === filters.salesperson;
    
    const matchesAmountRange = 
      (!filters.amountMin || quotation.amount >= parseFloat(filters.amountMin)) &&
      (!filters.amountMax || quotation.amount <= parseFloat(filters.amountMax));
    
    const matchesTags = filters.tags.length === 0 || 
      (quotation.tags && filters.tags.some(tag => quotation.tags?.includes(tag)));
    
    return matchesSearch && matchesStatus && matchesClient && matchesSalesperson && 
           matchesAmountRange && matchesTags;
  });

  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    let aValue = a[sortColumn as keyof Quotation];
    let bValue = b[sortColumn as keyof Quotation];
    
    if (sortColumn === 'amount') {
      aValue = a.amount;
      bValue = b.amount;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const totalPages = Math.ceil(sortedQuotations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuotations = sortedQuotations.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectQuotation = (quotationId: string) => {
    setSelectedQuotations(prev => 
      prev.includes(quotationId) 
        ? prev.filter(id => id !== quotationId)
        : [...prev, quotationId]
    );
    try {
      const willSelect = !selectedQuotations.includes(quotationId);
      logSystem('Quotations', willSelect ? 'Select Quotation' : 'Deselect Quotation', { quotationId });
    } catch (e) {
      console.warn('Audit logging (select quotation) failed:', e);
    }
  };

  const handleSelectAll = () => {
    if (selectedQuotations.length === paginatedQuotations.length) {
      setSelectedQuotations([]);
    } else {
      setSelectedQuotations(paginatedQuotations.map(quotation => quotation.id));
    }
    try {
      const selectingAll = !(selectedQuotations.length === paginatedQuotations.length);
      logSystem('Quotations', selectingAll ? 'Select All' : 'Clear Selection', { pageCount: paginatedQuotations.length });
    } catch (e) {
      console.warn('Audit logging (select all) failed:', e);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    try {
      const nextDir = sortColumn === column ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
      logSystem('Quotations', 'Sort Changed', { column, direction: nextDir });
    } catch (e) {
      console.warn('Audit logging (sort change) failed:', e);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term && !recentSearches.includes(term)) {
      setRecentSearches(prev => [term, ...prev.slice(0, 4)]);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: 'all',
      dateRange: 'all',
      dateType: 'created',
      client: 'all',
      amountMin: '',
      amountMax: '',
      salesperson: 'all',
      tags: [] as string[],
      customFields: {}
    });
    try {
      logSystem('Quotations', 'Clear Filters');
    } catch (e) {
      console.warn('Audit logging (clear filters) failed:', e);
    }
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: status
    }));
    toast.info(`Filtered by ${getDisplayStatus(status)} status`);
    try {
      logSystem('Quotations', 'Quick Status Filter', { status });
    } catch (e) {
      console.warn('Audit logging (status filter) failed:', e);
    }
  };

  const handleSaveFilter = () => {
    const filterName = prompt('Enter filter name:');
    if (filterName) {
      setSavedFilters(prev => [...prev, {
        id: Date.now().toString(),
        name: filterName,
        filters: { ...filters },
        searchTerm
      }]);
      try {
        logSystem('Quotations', 'Save Filter', { name: filterName, filters });
      } catch (e) {
        console.warn('Audit logging (save filter) failed:', e);
      }
    }
  };

  const clients = Array.from(
    new Set(
      quotations
        .filter(q => q.clientId && q.client) // Filter out items without clientId or client
        .map(q => JSON.stringify({ id: q.clientId, name: q.client }))
    )
  ).map(str => JSON.parse(str));
  
  const salespersons = Array.from(
    new Set(
      quotations
        .filter(q => q.salespersonId && q.salesperson) // Filter out items without salespersonId or salesperson
        .map(q => JSON.stringify({ id: q.salespersonId, name: q.salesperson }))
    )
  ).map(str => JSON.parse(str));
  
  const allTags = Array.from(new Set(quotations.flatMap(q => q.tags || [])));

  // Wrapper to log view mode change
  const handleViewModeChange = (mode: 'table' | 'grid') => {
    setViewMode(mode);
    try {
      logSystem('Quotations', 'Change View', { mode });
    } catch (e) {
      console.warn('Audit logging (view mode) failed:', e);
    }
  };

  const handleOpenCreateQuotation = (open: boolean) => {
    // Trial gating when attempting to open creation modal
    if (open) {
      try {
        if (isTrial) {
          const limit = getLimit('quotationsPerMonth');
          const all = Array.isArray(quotations) ? quotations : [];
          const now = new Date();
          const monthCount = all.filter((q) => {
            if (!q) return false;
            const dStr = (q as any).date || (q as any).createdAt || (q as any).issueDate;
            if (!dStr) return false;
            const d = new Date(dStr);
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
          }).length;
          if (monthCount >= limit) {
            toast.error(`Trial limit reached: You can create up to ${limit} quotations per month on the trial plan. Upgrade to unlock unlimited quotations.`);
            try {
              logSystem('Quotations', 'Create blocked - trial limit', { monthCount, limit });
            } catch {}
            return; // block opening modal
          }
        }
      } catch (e) {
        console.warn('Quotation gating check failed:', e);
      }
    }

    setIsCreateQuotationModalOpen(open);
    if (open) {
      try {
        logSystem('Quotations', 'Open Create Quotation Modal');
      } catch (e) {
        console.warn('Audit logging (open create modal) failed:', e);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    try {
      logSystem('Quotations', 'Page Change', { page });
    } catch (e) {
      console.warn('Audit logging (page change) failed:', e);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    try {
      logSystem('Quotations', 'Items Per Page Change', { itemsPerPage: newItemsPerPage });
    } catch (e) {
      console.warn('Audit logging (items per page) failed:', e);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <DashboardBackground />
      <div className="p-8 space-y-6 relative z-10">
      <QuotationsHeader
        viewMode={viewMode}
        setViewMode={handleViewModeChange}
        setIsCreateQuotationModalOpen={handleOpenCreateQuotation}
        onRefresh={handleRefresh}
      />

      <QuotationsStats quotations={quotations} />

      <QuotationsSearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={(show) => {
          setShowAdvancedFilters(show);
          try {
            logSystem('Quotations', show ? 'Open Advanced Filters' : 'Close Advanced Filters');
          } catch (e) {
            console.warn('Audit logging (toggle advanced filters) failed:', e);
          }
        }}
        recentSearches={recentSearches}
        clients={clients}
        handleSearch={handleSearch}
        handleClearFilters={handleClearFilters}
        handleSaveFilter={handleSaveFilter}
      />

      {showAdvancedFilters && (
        <QuotationsAdvancedFilters
          filters={filters}
          setFilters={setFilters}
          clients={clients}
          salespersons={salespersons}
          allTags={allTags}
        />
      )}

      {selectedQuotations.length > 0 && (
        <QuotationsBulkActions
          selectedCount={selectedQuotations.length}
          selectedQuotations={selectedQuotations}
          onClearSelection={() => setSelectedQuotations([])}
        />
      )}

      <QuotationsContent
        viewMode={viewMode}
        paginatedQuotations={paginatedQuotations}
        sortedQuotations={sortedQuotations}
        selectedQuotations={selectedQuotations}
        handleSelectQuotation={handleSelectQuotation}
        handleSelectAll={handleSelectAll}
        getStatusIcon={getStatusIcon}
        getStatusColor={getStatusColor}
        getDisplayStatus={getDisplayStatus}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        handleSort={handleSort}
        searchTerm={searchTerm}
        filters={filters}
        handleClearFilters={handleClearFilters}
        setIsCreateQuotationModalOpen={handleOpenCreateQuotation}
        onDeleteQuotation={handleDeleteQuotation}
        onEditQuotation={handleEditQuotation}
        onStatusFilter={handleStatusFilter}
        onRefresh={handleRefresh}
      />

      {sortedQuotations.length > 0 && (
        <QuotationsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={sortedQuotations.length}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          startIndex={startIndex}
          endIndex={Math.min(startIndex + itemsPerPage, sortedQuotations.length)}
        />
      )}

      <CreateQuotationModal 
        isOpen={isCreateQuotationModalOpen}
        onClose={() => {
          setEditingQuotation(null);
          setIsCreateQuotationModalOpen(false);
          try {
            logSystem('Quotations', 'Close Create/Edit Quotation Modal');
          } catch (e) {
            console.warn('Audit logging (close create/edit modal) failed:', e);
          }
        }}
        onQuotationSaved={handleQuotationSaved}
        quotationToEdit={editingQuotation}
      />

      {/* Admin verification modal for edit/delete actions */}
      <AuthVerificationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onVerified={handleAuthVerified}
        actionType={pendingAction.type}
        targetEntityName="Quotation"
        adminScope="extended"
      />
      </div>
    </div>
  );
};

export default Quotations;
