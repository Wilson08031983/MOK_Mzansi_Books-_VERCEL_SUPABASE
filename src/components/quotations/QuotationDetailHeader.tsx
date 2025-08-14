
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
import { useLocalization } from '@/hooks/useLocalization';

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
  const { t } = useLocalization();

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
          {t('common.back')} {t('quotations.title')}
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
          <p className="text-slate-600 font-sf-pro">{t('common.createdOn')} {new Date(quotation.date).toLocaleDateString()}</p>
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
            {t('quotations.sendQuotation')}
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
              {t('quotations.markAsAccepted')}
            </Button>
            
            <Button
              onClick={() => handleStatusUpdate('rejected')}
              disabled={actionLoading}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-sf-pro rounded-xl"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t('quotations.markAsRejected')}
            </Button>
          </>
        )}

        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          {showActionsMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg p-1 z-10">
              <button
                onClick={handleDownloadPDF}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-md font-sf-pro"
              >
                <Download className="h-4 w-4 inline mr-2" />
                {t('quotations.downloadPDF')}
              </button>
              <button
                onClick={() => console.log('Create similar quotation')}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-md font-sf-pro"
              >
                <FilePlus className="h-4 w-4 inline mr-2" />
                {t('quotations.duplicate')}
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded-md font-sf-pro"
              >
                <Trash2 className="h-4 w-4 inline mr-2" />
                {t('common.delete')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationDetailHeader;
