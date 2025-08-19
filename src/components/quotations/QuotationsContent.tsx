
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText,
  Plus,
  SortAsc,
  SortDesc
} from 'lucide-react';
import QuotationsTable from './QuotationsTable';
import QuotationsGrid from './QuotationsGrid';
import { Quotation } from '@/services/quotationService';

interface Filters {
  status: string;
  dateRange: string;
  dateType: string;
  client: string;
  amountMin: string;
  amountMax: string;
  salesperson: string;
  tags: string[];
  customFields: Record<string, unknown>;
}

interface QuotationsContentProps {
  viewMode: 'table' | 'grid';
  paginatedQuotations: Quotation[];
  sortedQuotations: Quotation[];
  selectedQuotations: string[];
  handleSelectQuotation: (quotationId: string) => void;
  handleSelectAll: () => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  getDisplayStatus: (status?: string) => string;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  handleSort: (column: string) => void;
  searchTerm: string;
  filters: Filters;
  handleClearFilters: () => void;
  setIsCreateQuotationModalOpen: (open: boolean) => void;
  onDeleteQuotation: (quotationId: string) => void;
  onEditQuotation?: (quotationId: string) => void;
  onStatusFilter?: (status: string) => void;
  onRefresh?: () => void; // Add refresh handler
}

const QuotationsContent: React.FC<QuotationsContentProps> = ({
  viewMode,
  paginatedQuotations,
  sortedQuotations,
  selectedQuotations,
  handleSelectQuotation,
  handleSelectAll,
  getStatusIcon,
  getStatusColor,
  getDisplayStatus,
  sortColumn,
  sortDirection,
  handleSort,
  searchTerm,
  filters,
  handleClearFilters,
  setIsCreateQuotationModalOpen,
  onDeleteQuotation,
  onEditQuotation,
  onStatusFilter,
  onRefresh
}) => {
  return (
    <Card className="glass backdrop-blur-sm bg-background/50 border border-border shadow-business hover:shadow-business-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground font-sf-pro text-xl">
            {sortedQuotations.length} Quotation{sortedQuotations.length !== 1 ? 's' : ''}
            {selectedQuotations.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({selectedQuotations.length} selected)
              </span>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Sort by:</span>
              <button
                onClick={() => handleSort('date')}
                className={`flex items-center space-x-1 px-2 py-1 rounded hover:bg-muted ${
                  sortColumn === 'date' ? 'text-primary' : ''
                }`}
              >
                <span>Date</span>
                {sortColumn === 'date' && (
                  sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => handleSort('amount')}
                className={`flex items-center space-x-1 px-2 py-1 rounded hover:bg-muted ${
                  sortColumn === 'amount' ? 'text-primary' : ''
                }`}
              >
                <span>Amount</span>
                {sortColumn === 'amount' && (
                  sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => handleSort('client')}
                className={`flex items-center space-x-1 px-2 py-1 rounded hover:bg-muted ${
                  sortColumn === 'client' ? 'text-primary' : ''
                }`}
              >
                <span>Client</span>
                {sortColumn === 'client' && (
                  sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'table' ? (
          <QuotationsTable
            quotations={paginatedQuotations}
            selectedQuotations={selectedQuotations}
            onSelectQuotation={handleSelectQuotation}
            onSelectAll={handleSelectAll}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
            getDisplayStatus={getDisplayStatus}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            onDeleteQuotation={onDeleteQuotation}
            onEditQuotation={onEditQuotation}
            onStatusFilter={onStatusFilter}
            onRefresh={onRefresh}
          />
        ) : (
          <QuotationsGrid 
            quotations={paginatedQuotations}
            selectedQuotations={selectedQuotations}
            onSelectQuotation={handleSelectQuotation}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
          />
        )}
        
        {sortedQuotations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-foreground font-semibold font-sf-pro mb-2">No quotations found</h3>
            <p className="text-muted-foreground font-sf-pro text-sm mb-4">
              {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== '' && (Array.isArray(f) ? f.length > 0 : true))
                ? 'Try adjusting your search terms or filters'
                : 'Get started by creating your first quotation'
              }
            </p>
            <div className="flex items-center justify-center space-x-3">
              {(searchTerm || Object.values(filters).some(f => f !== 'all' && f !== '' && (Array.isArray(f) ? f.length > 0 : true))) && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="font-sf-pro rounded-xl"
                >
                  Clear Filters
                </Button>
              )}
              <Button
                onClick={() => setIsCreateQuotationModalOpen(true)}
                className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white font-sf-pro rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Quotation
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuotationsContent;
