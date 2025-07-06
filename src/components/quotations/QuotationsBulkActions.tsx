
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import BulkActionsHeader from './BulkActionsHeader';
import BulkActionsInfo from './BulkActionsInfo';

interface QuotationsBulkActionsProps {
  selectedCount: number;
  selectedQuotations: string[];
  onClearSelection: () => void;
}

const QuotationsBulkActions: React.FC<QuotationsBulkActionsProps> = ({
  selectedCount,
  selectedQuotations,
  onClearSelection
}) => {
  // All bulk action buttons have been removed as requested

  return (
    <>
      <Card className="glass backdrop-blur-sm bg-mokm-purple-50/50 border border-mokm-purple-200 shadow-business">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BulkActionsHeader selectedCount={selectedCount} />
            </div>
            
            <BulkActionsInfo 
              selectedCount={selectedCount}
              onClearSelection={onClearSelection}
            />
          </div>
        </CardContent>
      </Card>

      {/* Modals removed as bulk actions buttons have been removed */}
    </>
  );
};

export default QuotationsBulkActions;
