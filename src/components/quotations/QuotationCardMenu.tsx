
import React from 'react';
import { 
  Eye,
  Edit,
  Copy,
  Mail,
  Download,
  Trash2,
  Receipt
} from 'lucide-react';

interface QuotationCardMenuProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: any;
  onAction: (action: string, quotation: any) => void;
}

const QuotationCardMenu: React.FC<QuotationCardMenuProps> = ({
  isOpen,
  onClose,
  quotation,
  onAction
}) => {
  if (!isOpen) return null;

  const handleAction = (action: string) => {
    onAction(action, quotation);
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
      <button
        onClick={() => handleAction('view')}
        className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-sf-pro"
      >
        <Eye className="h-4 w-4 mr-2" />
        View
      </button>
      <button
        onClick={() => handleAction('edit')}
        className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-sf-pro"
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </button>
      <button
        onClick={() => handleAction('duplicate')}
        className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-sf-pro"
      >
        <Copy className="h-4 w-4 mr-2" />
        Duplicate
      </button>
      <button
        onClick={() => handleAction('send')}
        className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-sf-pro"
      >
        <Mail className="h-4 w-4 mr-2" />
        Send
      </button>
      {quotation.status === 'accepted' && (
        <button
          onClick={() => handleAction('convertToInvoice')}
          className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 font-sf-pro"
        >
          <Receipt className="h-4 w-4 mr-2" />
          Convert to Invoice
        </button>
      )}
      <button
        onClick={() => handleAction('download')}
        className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-sf-pro"
      >
        <Download className="h-4 w-4 mr-2" />
        Download PDF
      </button>
      <div className="border-t border-slate-200 my-1"></div>
      <button
        onClick={() => handleAction('delete')}
        className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 font-sf-pro"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </button>
    </div>
  );
};

export default QuotationCardMenu;
