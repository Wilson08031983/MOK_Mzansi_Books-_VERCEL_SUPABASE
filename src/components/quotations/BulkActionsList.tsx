
import React from 'react';
import { 
  Mail,
  Receipt,
  Download,
  Trash2,
  Edit,
  Copy,
  Archive,
  Tag,
  FileText
} from 'lucide-react';
import BulkActionButton from './BulkActionButton';

interface BulkActionsListProps {
  onBulkAction: (action: string) => void;
}

const BulkActionsList: React.FC<BulkActionsListProps> = ({ onBulkAction }) => {
  return (
    <div className="flex items-center space-x-2">
      <BulkActionButton
        icon={Edit}
        label="Change Status"
        onClick={() => onBulkAction('changeStatus')}
        hoverColor="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
      />

      <BulkActionButton
        icon={Mail}
        label="Send Selected"
        onClick={() => onBulkAction('send')}
        hoverColor="hover:bg-green-50 hover:text-green-600 hover:border-green-300"
      />

      <BulkActionButton
        icon={Receipt}
        label="Convert to Invoice"
        onClick={() => onBulkAction('convertToInvoice')}
        hoverColor="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300"
      />

      <BulkActionButton
        icon={Copy}
        label="Duplicate"
        onClick={() => onBulkAction('duplicate')}
        hoverColor="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
      />

      <BulkActionButton
        icon={Tag}
        label="Add Tags"
        onClick={() => onBulkAction('addTags')}
        hoverColor="hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300"
      />

      <BulkActionButton
        icon={Download}
        label="Download PDF"
        onClick={() => onBulkAction('downloadPDF')}
        hoverColor="hover:bg-slate-50 hover:text-slate-600 hover:border-slate-300"
      />

      <BulkActionButton
        icon={FileText}
        label="Export"
        onClick={() => onBulkAction('export')}
        hoverColor="hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-300"
      />

      <BulkActionButton
        icon={Archive}
        label="Archive"
        onClick={() => onBulkAction('archive')}
        hoverColor="hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300"
      />

      <BulkActionButton
        icon={Trash2}
        label="Delete Selected"
        onClick={() => onBulkAction('delete')}
        variant="destructive"
      />
    </div>
  );
};

export default BulkActionsList;
