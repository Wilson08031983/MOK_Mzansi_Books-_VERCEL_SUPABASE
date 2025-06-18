
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ConvertToInvoiceModal from './ConvertToInvoiceModal';
import DuplicateQuotationModal from './DuplicateQuotationModal';
import BulkActionsHeader from './BulkActionsHeader';
import BulkActionsList from './BulkActionsList';
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
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action}`, selectedQuotations);
    
    switch (action) {
      case 'convertToInvoice':
        // For bulk conversion, we'll show a different modal or process
        // For now, let's show an alert
        alert(`Converting ${selectedCount} accepted quotations to invoices...`);
        break;
      case 'duplicate':
        // For bulk duplication
        alert(`Duplicating ${selectedCount} quotations...`);
        break;
      case 'send':
        alert(`Sending ${selectedCount} quotations...`);
        break;
      case 'download':
        alert(`Downloading ${selectedCount} quotations as PDF...`);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedCount} quotations? This action cannot be undone.`)) {
          alert(`Deleting ${selectedCount} quotations...`);
        }
        break;
      default:
        // Implement other bulk actions here
        break;
    }
  };

  return (
    <>
      <Card className="glass backdrop-blur-sm bg-mokm-purple-50/50 border border-mokm-purple-200 shadow-business">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BulkActionsHeader selectedCount={selectedCount} />
              <BulkActionsList onBulkAction={handleBulkAction} />
            </div>
            
            <BulkActionsInfo 
              selectedCount={selectedCount}
              onClearSelection={onClearSelection}
            />
          </div>
        </CardContent>
      </Card>

      <ConvertToInvoiceModal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        quotation={null}
      />

      <DuplicateQuotationModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        quotation={null}
      />
    </>
  );
};

export default QuotationsBulkActions;
