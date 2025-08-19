import React, { useState, useEffect } from 'react';
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
import { getQuotations, deleteQuotation, Quotation } from '@/services/quotationService';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import { activityService } from '@/services/activityService';

const Quotations = () => {
  const { t, formatCurrency, settings } = useLocalization();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const location = useLocation();
  const navigate = useNavigate();

  // Open create modal when navigated with state from Quick Actions
  useEffect(() => {
    const state = location.state as any;
    if (state?.openCreateQuotationModal) {
      setIsCreateQuotationModalOpen(true);
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

  // Load quotations from localStorage using the quotationService
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  // Update page title when language changes
  useEffect(() => {
    document.title = `${t('quotations.title')} - MOK Mzansi Books`;
  }, [t]);

  // Load quotations from localStorage
  const loadQuotations = () => {
    try {
      const loadedQuotations = getQuotations();
      setQuotations(loadedQuotations);
      return loadedQuotations;
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
  };

  // Load quotations on component mount
  useEffect(() => {
    loadQuotations();
  }, []);

  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);

  // Handle edit quotation
  const handleEditQuotation = (quotationId: string) => {
    const quotationToEdit = quotations.find(q => q.id === quotationId);
    if (quotationToEdit) {
      setEditingQuotation(quotationToEdit);
      setIsCreateQuotationModalOpen(true);
    } else {
      toast.error('Quotation not found');
    }
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
    } catch (logErr) {
      console.warn('Activity logging failed (quotation delete):', logErr);
    }

    toast.success('Quotation deleted successfully');
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
  };

  const handleSelectAll = () => {
    if (selectedQuotations.length === paginatedQuotations.length) {
      setSelectedQuotations([]);
    } else {
      setSelectedQuotations(paginatedQuotations.map(quotation => quotation.id));
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
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
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: status
    }));
    toast.info(`Filtered by ${getDisplayStatus(status)} status`);
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

  return (
    <div className="space-y-6">
      <QuotationsHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        setIsCreateQuotationModalOpen={setIsCreateQuotationModalOpen}
        onRefresh={handleRefresh}
      />

      <QuotationsStats quotations={quotations} />

      <QuotationsSearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
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
        setIsCreateQuotationModalOpen={setIsCreateQuotationModalOpen}
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
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1);
          }}
          startIndex={startIndex}
          endIndex={Math.min(startIndex + itemsPerPage, sortedQuotations.length)}
        />
      )}

      <CreateQuotationModal 
        isOpen={isCreateQuotationModalOpen}
        onClose={() => {
          setEditingQuotation(null);
          setIsCreateQuotationModalOpen(false);
        }}
        onQuotationSaved={handleQuotationSaved}
        quotationToEdit={editingQuotation}
      />
    </div>
  );
};

export default Quotations;
