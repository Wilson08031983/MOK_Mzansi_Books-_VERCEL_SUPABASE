
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
    <div className="flex flex-row items-center justify-between gap-1 px-2 py-0.5 bg-white/50 rounded-lg border border-white/20 text-xs" style={{position: 'absolute', zIndex: 10, bottom: '-30px', left: 0, right: 0, maxHeight: '30px'}}>
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-600 font-sf-pro">Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-2 py-0.5 text-xs border border-slate-200 rounded font-sf-pro focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-xs text-slate-600 font-sf-pro">per page</span>
      </div>
      
      <div className="text-xs text-slate-600 font-sf-pro">
        Showing {startItem} to {endItem} of {totalItems} invoices
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-0.5 h-6 px-1.5 text-xs"
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
            className={`w-6 h-6 p-0 text-xs ${currentPage === page ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
          >
            {page}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-0.5 h-6 px-1.5 text-xs"
        >
          <span>Next</span>
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default InvoicesPagination;
