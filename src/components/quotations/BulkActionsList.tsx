
import React from 'react';

interface BulkActionsListProps {
  onBulkAction: (action: string) => void;
}

const BulkActionsList: React.FC<BulkActionsListProps> = ({ onBulkAction }) => {
  return (
    <div className="flex items-center space-x-2">
    </div>
  );
};

export default BulkActionsList;
