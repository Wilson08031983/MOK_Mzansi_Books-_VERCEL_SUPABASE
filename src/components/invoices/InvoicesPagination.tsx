
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface InvoicesPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

const InvoicesPagination: React.FC<InvoicesPaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-row items-center justify-between gap-1 px-2 py-0.5 glass backdrop-blur-md bg-white/10 dark:bg-black/30 rounded-lg border border-white/10 text-xs" style={{position: 'absolute', zIndex: 10, bottom: '-30px', left: 0, right: 0, maxHeight: '30px'}}>
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-300 font-sf-pro">Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-2 py-0.5 text-xs glass backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/10 rounded font-sf-pro focus:ring-2 focus:ring-mokm-purple-500/40 focus:border-mokm-purple-500/40 text-slate-200"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-xs text-slate-300 font-sf-pro">per page</span>
      </div>
      
      <div className="text-xs text-slate-300 font-sf-pro">
        Showing {startItem} to {endItem} of {totalItems} invoices
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`glass backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/10 flex items-center gap-0.5 h-6 px-1.5 text-xs ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/15 dark:hover:bg-white/10'}`}
        >
          <ChevronLeft className="h-3 w-3" />
          <span className="hidden sm:inline">Prev</span>
        </Button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={`w-6 h-6 p-0 text-xs ${currentPage === page ? 'bg-mokm-purple-600 hover:bg-mokm-purple-700 text-white shadow' : 'glass backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/10 hover:bg-white/15 dark:hover:bg-white/10'}`}
          >
            {page}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`glass backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/10 flex items-center gap-0.5 h-6 px-1.5 text-xs ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/15 dark:hover:bg-white/10'}`}
        >
          <span>Next</span>
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default InvoicesPagination;
