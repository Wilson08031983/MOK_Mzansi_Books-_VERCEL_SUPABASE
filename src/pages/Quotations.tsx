import React, { useState } from 'react';
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
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    dateType: 'created',
    client: 'all',
    amountMin: '',
    amountMax: '',
    salesperson: 'all',
    tags: [],
    customFields: {}
  });

  // Enhanced mock data with more comprehensive fields
  const mockQuotations = [
    {
      id: '1',
      number: 'QUO-2024-001',
      reference: 'PROJECT-ALPHA',
      client: 'Tech Solutions Ltd',
      clientId: 'client-1',
      clientEmail: 'john@techsolutions.com',
      clientContact: 'John Smith',
      clientLogo: '',
      date: '2024-01-15',
      expiryDate: '2024-02-15',
      lastModified: '2024-01-16',
      amount: 25000,
      currency: 'ZAR',
      language: 'en',
      status: 'sent',
      salesperson: 'Sarah Johnson',
      salespersonId: 'user-1',
      project: 'Alpha Development',
      tags: ['urgent', 'development'],
      priority: 'high',
      customFields: {
        department: 'IT',
        region: 'Western Cape'
      },
      items: [
        {
          id: 'item-1',
          description: 'Web Development Services',
          quantity: 1,
          unit: 'project',
          rate: 20000,
          taxRate: 15,
          discount: 0,
          amount: 20000
        }
      ],
      subtotal: 20000,
      taxAmount: 3000,
      discount: 0,
      totalAmount: 25000,
      terms: 'Payment due within 30 days',
      notes: 'Initial development phase',
      attachments: [],
      revisionHistory: [],
      viewedAt: '2024-01-16T10:30:00Z',
      sentAt: '2024-01-15T14:20:00Z'
    },
    {
      id: '2',
      number: 'QUO-2024-002',
      reference: 'DESIGN-WORK',
      client: 'Creative Agency',
      clientId: 'client-2',
      clientEmail: 'sarah@creative.com',
      clientContact: 'Sarah Davis',
      clientLogo: '',
      date: '2024-01-14',
      expiryDate: '2024-02-14',
      lastModified: '2024-01-17',
      amount: 18500,
      currency: 'ZAR',
      language: 'en',
      status: 'accepted',
      salesperson: 'Michael Chen',
      salespersonId: 'user-2',
      project: 'Brand Redesign',
      tags: ['design', 'branding'],
      priority: 'medium',
      customFields: {
        department: 'Marketing',
        region: 'Gauteng'
      },
      items: [
        {
          id: 'item-2',
          description: 'Brand Design Package',
          quantity: 1,
          unit: 'package',
          rate: 15000,
          taxRate: 15,
          discount: 500,
          amount: 14500
        }
      ],
      subtotal: 14500,
      taxAmount: 2175,
      discount: 500,
      totalAmount: 18500,
      terms: 'Payment due within 15 days',
      notes: 'Brand guidelines included',
      attachments: [],
      revisionHistory: [],
      viewedAt: '2024-01-16T09:15:00Z',
      sentAt: '2024-01-14T11:30:00Z',
      acceptedAt: '2024-01-17T16:45:00Z'
    },
    {
      id: '3',
      number: 'QUO-2024-003',
      reference: 'GOV-CONTRACT',
      client: 'Government Dept',
      clientId: 'client-3',
      clientEmail: 'emily@gov.za',
      clientContact: 'Emily Johnson',
      clientLogo: '',
      date: '2024-01-12',
      expiryDate: '2024-01-20',
      lastModified: '2024-01-20',
      amount: 45000,
      currency: 'ZAR',
      language: 'en',
      status: 'expired',
      salesperson: 'David Wilson',
      salespersonId: 'user-3',
      project: 'Government Portal',
      tags: ['government', 'portal'],
      priority: 'high',
      customFields: {
        department: 'Public Sector',
        region: 'Western Cape'
      },
      items: [
        {
          id: 'item-3',
          description: 'Portal Development',
          quantity: 1,
          unit: 'project',
          rate: 40000,
          taxRate: 15,
          discount: 1000,
          amount: 39000
        }
      ],
      subtotal: 39000,
      taxAmount: 5850,
      discount: 1000,
      totalAmount: 45000,
      terms: 'Payment due within 45 days',
      notes: 'Government compliance required',
      attachments: [],
      revisionHistory: [],
      viewedAt: null,
      sentAt: '2024-01-12T08:00:00Z'
    },
    {
      id: '4',
      number: 'QUO-2024-004',
      reference: 'MVDEV-001',
      client: 'StartUp Inc',
      clientId: 'client-4',
      clientEmail: 'info@startup.com',
      clientContact: 'Alex Brown',
      clientLogo: '',
      date: '2024-01-16',
      expiryDate: '2024-02-16',
      lastModified: '2024-01-16',
      amount: 12000,
      currency: 'ZAR',
      language: 'en',
      status: 'draft',
      salesperson: 'Sarah Johnson',
      salespersonId: 'user-1',
      project: 'MVP Development',
      tags: ['startup', 'mvp'],
      priority: 'low',
      customFields: {
        department: 'Technology',
        region: 'Gauteng'
      },
      items: [
        {
          id: 'item-4',
          description: 'MVP Development',
          quantity: 1,
          unit: 'project',
          rate: 10000,
          taxRate: 15,
          discount: 0,
          amount: 10000
        }
      ],
      subtotal: 10000,
      taxAmount: 1500,
      discount: 0,
      totalAmount: 12000,
      terms: 'Payment due within 30 days',
      notes: 'Startup discount applied',
      attachments: [],
      revisionHistory: [],
      viewedAt: null,
      sentAt: null
    }
  ];

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

  const filteredQuotations = mockQuotations.filter(quotation => {
    const matchesSearch = quotation.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.project.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || quotation.status === filters.status;
    const matchesClient = filters.client === 'all' || quotation.clientId === filters.client;
    const matchesSalesperson = filters.salesperson === 'all' || quotation.salespersonId === filters.salesperson;
    
    const matchesAmountRange = 
      (!filters.amountMin || quotation.amount >= parseFloat(filters.amountMin)) &&
      (!filters.amountMax || quotation.amount <= parseFloat(filters.amountMax));
    
    const matchesTags = filters.tags.length === 0 || 
      filters.tags.some(tag => quotation.tags.includes(tag));
    
    return matchesSearch && matchesStatus && matchesClient && matchesSalesperson && 
           matchesAmountRange && matchesTags;
  });

  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    let aValue = a[sortColumn as keyof typeof a];
    let bValue = b[sortColumn as keyof typeof b];
    
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
      tags: [],
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

  const clients = Array.from(new Set(mockQuotations.map(q => ({ id: q.clientId, name: q.client }))));
  const salespersons = Array.from(new Set(mockQuotations.map(q => ({ id: q.salespersonId, name: q.salesperson }))));
  const allTags = Array.from(new Set(mockQuotations.flatMap(q => q.tags)));

  return (
    <div className="space-y-6">
      <QuotationsHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        setIsCreateQuotationModalOpen={setIsCreateQuotationModalOpen}
      />

      <QuotationsStats quotations={mockQuotations} />

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
      />
    </div>
  );
};

export default Quotations;
