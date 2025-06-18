
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

interface QuotationDetailHeaderProps {
  quotation: any;
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(quotation.status)} font-sf-pro`}>
              {getStatusIcon(quotation.status)}
              <span className="ml-1 capitalize">{quotation.status}</span>
            </span>
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

        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          
          {showActionsMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
              <button
                onClick={() => navigate(`/quotations/${quotation.id}/edit`)}
                className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-sf-pro"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-sf-pro"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-sf-pro"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
              <div className="border-t border-slate-200 my-1"></div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 font-sf-pro"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationDetailHeader;
