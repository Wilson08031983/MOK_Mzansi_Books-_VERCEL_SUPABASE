
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Eye,
  Edit,
  Copy,
  Receipt
} from 'lucide-react';

interface QuotationCardActionsProps {
  quotation: any;
  onAction: (action: string, quotation: any) => void;
}

const QuotationCardActions: React.FC<QuotationCardActionsProps> = ({
  quotation,
  onAction
}) => {
  return (
    <div className="flex items-center space-x-2 pt-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAction('view', quotation)}
        className="flex-1 font-sf-pro"
      >
        <Eye className="h-4 w-4 mr-1" />
        View
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAction('edit', quotation)}
        className="flex-1 font-sf-pro"
      >
        <Edit className="h-4 w-4 mr-1" />
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAction('duplicate', quotation)}
        className="flex-1 text-blue-600 hover:text-blue-700 hover:border-blue-300 font-sf-pro"
      >
        <Copy className="h-4 w-4 mr-1" />
        Copy
      </Button>
      {quotation.status === 'accepted' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('convertToInvoice', quotation)}
          className="flex-1 text-green-600 hover:text-green-700 hover:border-green-300 font-sf-pro"
        >
          <Receipt className="h-4 w-4 mr-1" />
          Invoice
        </Button>
      )}
    </div>
  );
};

export default QuotationCardActions;
