
import React, { useState } from 'react';
import ConvertToInvoiceModal from './ConvertToInvoiceModal';
import DuplicateQuotationModal from './DuplicateQuotationModal';
import QuotationCard from './QuotationCard';
import { Quotation as QuotationType } from '@/services/quotationService';

interface QuotationsGridProps {
  quotations: QuotationType[];
  selectedQuotations: string[];
  onSelectQuotation: (quotationId: string) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
}

const QuotationsGrid: React.FC<QuotationsGridProps> = ({
  quotations,
  selectedQuotations,
  onSelectQuotation,
  getStatusIcon,
  getStatusColor
}) => {
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [selectedQuotationForAction, setSelectedQuotationForAction] = useState<QuotationType | null>(null);

  const handleConvertToInvoice = (quotation: QuotationType) => {
    setSelectedQuotationForAction(quotation);
    setConvertModalOpen(true);
  };

  const handleDuplicate = (quotation: QuotationType) => {
    setSelectedQuotationForAction(quotation);
    setDuplicateModalOpen(true);
  };

  const handleQuotationAction = (action: string, quotation: QuotationType) => {
    console.log(`Action: ${action}`, quotation);
    
    switch (action) {
      case 'view':
        // Navigate to quotation view
        break;
      case 'edit':
        // Navigate to quotation edit
        break;
      case 'duplicate':
        handleDuplicate(quotation);
        break;
      case 'send':
        // Send quotation
        break;
      case 'convertToInvoice':
        handleConvertToInvoice(quotation);
        break;
      case 'download':
        // Download PDF
        break;
      case 'delete':
        // Delete quotation with confirmation
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {quotations.map((quotation) => (
          <QuotationCard
            key={quotation.id}
            quotation={quotation}
            isSelected={selectedQuotations.includes(quotation.id)}
            onSelect={onSelectQuotation}
            onAction={handleQuotationAction}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
          />
        ))}
      </div>

      <ConvertToInvoiceModal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        quotation={selectedQuotationForAction}
      />

      <DuplicateQuotationModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        quotation={selectedQuotationForAction}
      />
    </>
  );
};

export default QuotationsGrid;
