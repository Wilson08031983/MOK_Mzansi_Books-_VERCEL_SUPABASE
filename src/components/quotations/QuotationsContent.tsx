
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

interface QuotationsContentProps {
  viewMode: 'table' | 'grid';
  paginatedQuotations: any[];
  sortedQuotations: any[];
  selectedQuotations: string[];
  handleSelectQuotation: (quotationId: string) => void;
  handleSelectAll: () => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  handleSort: (column: string) => void;
  searchTerm: string;
  filters: any;
  handleClearFilters: () => void;
  setIsCreateQuotationModalOpen: (open: boolean) => void;
  onDeleteQuotation: (quotationId: string) => void;
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
  sortColumn,
  sortDirection,
  handleSort,
  searchTerm,
  filters,
  handleClearFilters,
  setIsCreateQuotationModalOpen,
  onDeleteQuotation
}) => {
  return (
    <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-900 font-sf-pro text-xl">
            {sortedQuotations.length} Quotation{sortedQuotations.length !== 1 ? 's' : ''}
            {selectedQuotations.length > 0 && (
              <span className="text-sm font-normal text-slate-600 ml-2">
                ({selectedQuotations.length} selected)
              </span>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span>Sort by:</span>
              <button
                onClick={() => handleSort('date')}
                className={`flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 ${
                  sortColumn === 'date' ? 'text-mokm-purple-600' : ''
                }`}
              >
                <span>Date</span>
                {sortColumn === 'date' && (
                  sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => handleSort('amount')}
                className={`flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 ${
                  sortColumn === 'amount' ? 'text-mokm-purple-600' : ''
                }`}
              >
                <span>Amount</span>
                {sortColumn === 'amount' && (
                  sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => handleSort('client')}
                className={`flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 ${
                  sortColumn === 'client' ? 'text-mokm-purple-600' : ''
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
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            onDeleteQuotation={onDeleteQuotation}
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
            <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-semibold font-sf-pro mb-2">No quotations found</h3>
            <p className="text-slate-600 font-sf-pro text-sm mb-4">
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
