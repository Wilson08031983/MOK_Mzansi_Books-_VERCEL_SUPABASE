
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  MoreVertical,
  Edit,
  Printer,
  Download,
  FilePlus,
  Trash2
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import StatusChangeDropdown from './StatusChangeDropdown';

interface Quotation {
  id: string;
  number: string;
  reference: string;
  client: string;
  clientId: string;
  clientEmail: string;
  date: string;
  expiryDate?: string;
  status: string;
  amount: number;
  currency: string;
  salesperson?: string;
  lastModified?: string;
}

interface QuotationDetailHeaderProps {
  quotation: Quotation;
  actionLoading: boolean;
  showActionsMenu: boolean;
  setShowActionsMenu: (show: boolean) => void;
  handleSendEmail: () => void;
  handleStatusUpdate: (status: string) => void;
  handleDownloadPDF: () => void;
  setShowDeleteModal: (show: boolean) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
}

const QuotationDetailHeader: React.FC<QuotationDetailHeaderProps> = ({
  quotation,
  actionLoading,
  showActionsMenu,
  setShowActionsMenu,
  handleSendEmail,
  handleStatusUpdate,
  handleDownloadPDF,
  setShowDeleteModal,
  getStatusIcon,
  getStatusColor
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/quotations')}
          className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quotations
        </Button>
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-slate-900 font-sf-pro">{quotation.number}</h1>
            <StatusChangeDropdown
              currentStatus={quotation.status}
              onStatusChange={handleStatusUpdate}
              disabled={actionLoading}
              size="sm"
            />
          </div>
          <p className="text-slate-600 font-sf-pro">Created on {formatDate(quotation.date)}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {quotation.status === 'draft' && (
          <Button
            onClick={handleSendEmail}
            disabled={actionLoading}
            className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white font-sf-pro rounded-xl"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Quotation
          </Button>
        )}

        {quotation.status === 'sent' && (
          <>
            <Button
              onClick={() => handleStatusUpdate('accepted')}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-sf-pro rounded-xl"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Accepted
            </Button>
            
            <Button
              onClick={() => handleStatusUpdate('rejected')}
              disabled={actionLoading}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-sf-pro rounded-xl"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Mark as Rejected
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default QuotationDetailHeader;
