
import React from 'react';
import { Button } from '@/components/ui/button';

interface BulkActionsInfoProps {
  selectedCount: number;
  onClearSelection: () => void;
}

const BulkActionsInfo: React.FC<BulkActionsInfoProps> = ({
  selectedCount,
  onClearSelection
}) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="text-xs text-slate-500 font-sf-pro">
        Select individual quotations or use "Select All" to manage multiple items
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="font-sf-pro text-slate-600 hover:text-slate-800"
      >
        Clear Selection
      </Button>
    </div>
  );
};

export default BulkActionsInfo;
