
import React from 'react';

interface BulkActionsHeaderProps {
  selectedCount: number;
}

const BulkActionsHeader: React.FC<BulkActionsHeaderProps> = ({ selectedCount }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-mokm-purple-500 rounded-full animate-pulse"></div>
      <span className="text-sm font-medium text-slate-700 font-sf-pro">
        {selectedCount} quotation{selectedCount !== 1 ? 's' : ''} selected
      </span>
    </div>
  );
};

export default BulkActionsHeader;
