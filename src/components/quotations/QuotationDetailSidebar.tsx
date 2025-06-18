
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Send,
  Download,
  Edit,
  FilePlus,
  Trash2
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface QuotationDetailSidebarProps {
  quotation: any;
  actionLoading: boolean;
  handleSendEmail: () => void;
  handleDownloadPDF: () => void;
  setShowDeleteModal: (show: boolean) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
}

const QuotationDetailSidebar: React.FC<QuotationDetailSidebarProps> = ({
  quotation,
  actionLoading,
  handleSendEmail,
  handleDownloadPDF,
  setShowDeleteModal,
  getStatusIcon,
  getStatusColor
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="text-slate-900 font-sf-pro">Quotation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-sf-pro">Status</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(quotation.status)} font-sf-pro`}>
                {getStatusIcon(quotation.status)}
                <span className="ml-1 capitalize">{quotation.status}</span>
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-600 font-sf-pro">Created</span>
              <span className="font-sf-pro">{formatDate(quotation.date)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-600 font-sf-pro">Expires</span>
              <span className="font-sf-pro">{formatDate(quotation.expiryDate)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-600 font-sf-pro">Total</span>
              <span className="font-medium font-sf-pro">{formatCurrency(quotation.totalAmount)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-600 font-sf-pro">Items</span>
              <span className="font-sf-pro">{quotation.items.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="text-slate-900 font-sf-pro">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              onClick={handleSendEmail}
              disabled={actionLoading}
              className="w-full bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white font-sf-pro rounded-xl"
            >
              <Send className="h-4 w-4 mr-2" />
              Send to Client
            </Button>
            
            <Button
              onClick={handleDownloadPDF}
              disabled={actionLoading}
              variant="outline"
              className="w-full border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            
            <Button
              onClick={() => navigate(`/quotations/${quotation.id}/edit`)}
              variant="outline"
              className="w-full border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Quotation
            </Button>
            
            {quotation.status === 'accepted' && (
              <Button
                onClick={() => navigate(`/invoices/create?quotation=${quotation.id}`)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-sf-pro rounded-xl"
              >
                <FilePlus className="h-4 w-4 mr-2" />
                Convert to Invoice
              </Button>
            )}
            
            <Button
              onClick={() => setShowDeleteModal(true)}
              disabled={actionLoading}
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-sf-pro rounded-xl"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Quotation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationDetailSidebar;
