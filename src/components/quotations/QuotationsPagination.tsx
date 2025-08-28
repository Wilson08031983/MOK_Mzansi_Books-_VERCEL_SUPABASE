
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocalization } from '@/hooks/useLocalization';

interface QuotationsPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  startIndex: number;
  endIndex: number;
}

const QuotationsPagination: React.FC<QuotationsPaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  startIndex,
  endIndex
}) => {
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const { t } = useLocalization();
  
  const handlePageChange = async (page: number) => {
    if (page === currentPage) return;
    
    setIsLoading(page);
    try {
      await new Promise(resolve => setTimeout(resolve, 200)); // Simulate loading
      onPageChange(page);
    } finally {
      setIsLoading(null);
    }
  };
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisiblePages);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we're at the start or end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <PageButton 
          key={1} 
          page={1} 
          currentPage={currentPage} 
          onClick={handlePageChange}
          isLoading={isLoading === 1}
        />
      );
      
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="flex items-center justify-center w-10 h-10 text-slate-400">
            ...
          </span>
        );
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PageButton 
          key={i} 
          page={i} 
          currentPage={currentPage} 
          onClick={handlePageChange}
          isLoading={isLoading === i}
        />
      );
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="flex items-center justify-center w-10 h-10 text-slate-400">
            ...
          </span>
        );
      }
      
      pages.push(
        <PageButton 
          key={totalPages} 
          page={totalPages} 
          currentPage={currentPage} 
          onClick={handlePageChange}
          isLoading={isLoading === totalPages}
        />
      );
    }

    return pages;
  };
  
  // Reusable page button component with loading state and tooltip
  const PageButton = ({ 
    page, 
    currentPage, 
    onClick, 
    isLoading 
  }: { 
    page: number; 
    currentPage: number; 
    onClick: (page: number) => void; 
    isLoading: boolean;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onClick(page)}
            disabled={isLoading}
            className={`relative w-10 h-10 p-0 font-sf-pro transition-all duration-200 ${
              page === currentPage 
                ? "bg-mokm-purple-600 hover:bg-mokm-purple-700 text-white shadow-md scale-105" 
                : "glass backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/10 hover:bg-white/15 dark:hover:bg-white/10"
            }`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              page
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{t('quotations.pagination.goToPage', { page })}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <Card className="glass backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 shadow-business">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Items per page and current range */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 font-sf-pro">{t('quotations.pagination.show')}</span>
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="px-3 py-1 glass backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/40 focus:border-mokm-purple-500/40 transition-all duration-300 font-sf-pro text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-slate-600 font-sf-pro">{t('quotations.pagination.perPage')}</span>
            </div>
            
            <div className="text-sm text-slate-600 font-sf-pro">
              {t('quotations.pagination.showingRange', { start: startIndex + 1, end: endIndex, total: totalItems })}
            </div>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center space-x-2">
            {/* First page */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1 || isLoading !== null}
                    className={`glass backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/10 w-10 h-10 p-0 font-sf-pro transition-colors duration-200 ${
                      currentPage === 1 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-white/15 dark:hover:bg-white/10'
                    }`}
                    aria-label={t('quotations.pagination.firstPage')}
                  >
                    {isLoading === 1 ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronsLeft className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{t('quotations.pagination.firstPage')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Previous page */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading !== null}
                    className={`glass backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/10 w-10 h-10 p-0 font-sf-pro transition-colors duration-200 ${
                      currentPage === 1 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-white/15 dark:hover:bg-white/10'
                    }`}
                    aria-label={t('quotations.pagination.previousPage')}
                  >
                    {isLoading === currentPage - 1 ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{t('quotations.pagination.previousPage')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {renderPageNumbers()}
            </div>

            {/* Next page */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading !== null}
                    className={`glass backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/10 w-10 h-10 p-0 font-sf-pro transition-colors duration-200 ${
                      currentPage === totalPages 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-white/15 dark:hover:bg-white/10'
                    }`}
                    aria-label={t('quotations.pagination.nextPage')}
                  >
                    {isLoading === currentPage + 1 ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{t('quotations.pagination.nextPage')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Last page */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages || isLoading !== null}
                    className={`glass backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/10 w-10 h-10 p-0 font-sf-pro transition-colors duration-200 ${
                      currentPage === totalPages 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-white/15 dark:hover:bg-white/10'
                    }`}
                    aria-label={t('quotations.pagination.lastPage')}
                  >
                    {isLoading === totalPages ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronsRight className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{t('quotations.pagination.lastPage')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Page info */}
          <div className="text-sm text-slate-600 font-sf-pro">
            {t('quotations.pagination.pageXofY', { current: currentPage, total: totalPages })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotationsPagination;
