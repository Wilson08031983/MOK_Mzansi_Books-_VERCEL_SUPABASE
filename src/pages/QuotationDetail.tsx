
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  FilePlus,
  FileText,
  AlertCircle,
  Loader2,
  Clock
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import QuotationDetailHeader from '@/components/quotations/QuotationDetailHeader';
import QuotationDetailInfo from '@/components/quotations/QuotationDetailInfo';
import QuotationDetailItems from '@/components/quotations/QuotationDetailItems';
import QuotationDetailTerms from '@/components/quotations/QuotationDetailTerms';
import QuotationDetailSidebar from '@/components/quotations/QuotationDetailSidebar';
import QuotationDetailModals from '@/components/quotations/QuotationDetailModals';

const QuotationDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Mock quotation data - in real app, fetch from Supabase
  const mockQuotation = {
    id: id,
    number: 'QUO-2024-001',
    reference: 'PROJECT-ALPHA',
    client: 'Tech Solutions Ltd',
    clientId: 'client-1',
    clientEmail: 'john@techsolutions.com',
    clientContact: 'John Smith',
    clientPhone: '+27 11 123 4567',
    clientAddress: '123 Business Avenue, Sandton, 2196',
    date: '2024-01-15',
    expiryDate: '2024-02-15',
    lastModified: '2024-01-16',
    amount: 25000,
    currency: 'ZAR',
    status: 'sent',
    salesperson: 'Sarah Johnson',
    project: 'Alpha Development',
    items: [
      {
        id: 'item-1',
        description: 'Web Development Services',
        quantity: 1,
        unit: 'project',
        rate: 20000,
        taxRate: 15,
        discount: 0,
        amount: 20000
      },
      {
        id: 'item-2',
        description: 'UI/UX Design',
        quantity: 1,
        unit: 'project',
        rate: 8000,
        taxRate: 15,
        discount: 1000,
        amount: 7000
      }
    ],
    subtotal: 27000,
    taxAmount: 4050,
    discount: 1000,
    totalAmount: 25000,
    terms: 'Payment due within 30 days of invoice date.',
    notes: 'Initial development phase for Alpha project.'
  };

  useEffect(() => {
    const fetchQuotation = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setQuotation(mockQuotation);
      } catch (error) {
        console.error('Error fetching quotation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!quotation) return;
    
    setActionLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setQuotation({ ...quotation, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setActionLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (quotation?.status === 'draft') {
        setQuotation({ ...quotation, status: 'sent' });
      }
      alert('Quotation sent successfully!');
    } catch (error) {
      console.error('Error sending quotation:', error);
      alert('Failed to send quotation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowDeleteModal(false);
      navigate('/quotations');
    } catch (error) {
      console.error('Error deleting quotation:', error);
      alert('Failed to delete quotation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setActionLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Simulate PDF download
      const element = document.createElement('a');
      element.setAttribute('href', 'data:application/pdf;charset=utf-8,' + encodeURIComponent('Simulated PDF'));
      element.setAttribute('download', `quotation-${quotation?.number}.pdf`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sent':
      case 'viewed':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sent':
      case 'viewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-mokm-purple-600" />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="space-y-6">
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
        </div>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-slate-900 font-semibold font-sf-pro mb-2">Quotation not found</h3>
          <p className="text-slate-600 font-sf-pro">The quotation you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <QuotationDetailHeader
        quotation={quotation}
        actionLoading={actionLoading}
        showActionsMenu={showActionsMenu}
        setShowActionsMenu={setShowActionsMenu}
        handleSendEmail={handleSendEmail}
        handleStatusUpdate={handleStatusUpdate}
        handleDownloadPDF={handleDownloadPDF}
        setShowDeleteModal={setShowDeleteModal}
        getStatusIcon={getStatusIcon}
        getStatusColor={getStatusColor}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <QuotationDetailInfo quotation={quotation} />
          <QuotationDetailItems quotation={quotation} />
          <QuotationDetailTerms quotation={quotation} />
        </div>

        <QuotationDetailSidebar
          quotation={quotation}
          actionLoading={actionLoading}
          handleSendEmail={handleSendEmail}
          handleDownloadPDF={handleDownloadPDF}
          setShowDeleteModal={setShowDeleteModal}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
        />
      </div>

      <QuotationDetailModals
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleDelete={handleDelete}
        actionLoading={actionLoading}
      />
    </div>
  );
};

export default QuotationDetail;
