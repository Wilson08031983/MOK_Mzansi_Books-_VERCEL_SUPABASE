import React, { useState, useEffect } from 'react';
import { 
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileText
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

const Quotations = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
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

  // Load quotations from localStorage
  const loadQuotations = () => {
    const loadedQuotations = getQuotations();
    setQuotations(loadedQuotations);
  };

  // Load quotations on component mount
  useEffect(() => {
    loadQuotations();
  }, []);

  // Handle when a new quotation is saved
  const handleQuotationSaved = (newQuotation: Quotation, allQuotations: Quotation[]) => {
    // Update the local state with the latest quotations
    setQuotations(allQuotations);
    
    // Show a success toast with the quotation number
    toast.success(`Quotation ${newQuotation.number} saved successfully`, {
      action: {
        label: 'View',
        onClick: () => {
          // TODO: Implement view quotation functionality
          console.log('View quotation:', newQuotation.id);
        },
      },
    });
  };

  const handleDeleteQuotation = (quotationId: string): void => {
    const updatedQuotations = deleteQuotation(quotationId);
    setQuotations(updatedQuotations);
    toast.success('Quotation deleted successfully');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sent':
      case 'viewed':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sent':
      case 'viewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
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
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        handleSort={handleSort}
        searchTerm={searchTerm}
        filters={filters}
        handleClearFilters={handleClearFilters}
        setIsCreateQuotationModalOpen={setIsCreateQuotationModalOpen}
        onDeleteQuotation={handleDeleteQuotation}
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
        onClose={() => setIsCreateQuotationModalOpen(false)}
        onQuotationSaved={handleQuotationSaved}
      />
    </div>
  );
};

export default Quotations;
