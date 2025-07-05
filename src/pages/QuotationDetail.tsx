
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
import { toast } from 'sonner';
import { generateQuotationPdf, Quotation as PdfQuotation } from '@/utils/quotationPdfGenerator';
import { updateQuotationStatus, Quotation as ServiceQuotation } from '@/services/quotationService';
import QuotationDetailHeader from '@/components/quotations/QuotationDetailHeader';
import QuotationDetailInfo from '@/components/quotations/QuotationDetailInfo';
import QuotationDetailItems from '@/components/quotations/QuotationDetailItems';
import QuotationDetailTerms from '@/components/quotations/QuotationDetailTerms';
import QuotationDetailSidebar from '@/components/quotations/QuotationDetailSidebar';
import QuotationDetailModals from '@/components/quotations/QuotationDetailModals';

const QuotationDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Define proper interface for quotation
  interface QuotationItem {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    taxRate: number;
    discount: number;
    amount: number;
    markupPercent?: number;
  }

  interface Quotation {
    id: string;
    number: string;
    reference: string;
    client: string;
    clientId: string;
    clientEmail: string;
    clientContact: string;
    clientPhone: string;
    clientAddress: string;
    date: string;
    expiryDate: string;
    lastModified: string;
    amount: number;
    currency: string;
    status: string;
    salesperson: string;
    project: string;
    items: QuotationItem[];
    subtotal: number;
    taxAmount: number;
    discount: number;
    totalAmount: number;
    terms: string;
    notes: string;
  }
  
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // We'll define the correct quotation data inside the useEffect hook

  useEffect(() => {
    const fetchQuotation = async () => {
      setLoading(true);
      try {
        if (!id) {
          toast.error('No quotation ID provided');
          navigate('/quotations');
          return;
        }

        // Import the service function directly
        const { getQuotationById } = await import('@/services/quotationService');
        const foundQuotation = getQuotationById(id);
        
        if (foundQuotation) {
          console.log('Found quotation:', foundQuotation);
          setQuotation(foundQuotation as unknown as Quotation);
        } else {
          console.error('Quotation not found with ID:', id);
          toast.error(`Quotation with ID ${id} not found`);
          navigate('/quotations');
          return;
        }
      } catch (error) {
        console.error('Error fetching quotation:', error);
        toast.error('Error loading quotation details');
        navigate('/quotations');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [id, navigate]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!quotation) return;
    
    setActionLoading(true);
    try {
      // Update status in localStorage using the quotationService
      const updatedQuotations = updateQuotationStatus(quotation.id, newStatus);
      
      // Find the updated quotation in the returned array
      const serviceQuotation = updatedQuotations.find(q => q.id === quotation.id);
      
      if (serviceQuotation) {
        // Convert the service quotation to the local quotation interface
        const updatedQuotation: Quotation = {
          ...quotation,
          status: serviceQuotation.status,
          lastModified: serviceQuotation.lastModified || quotation.lastModified
        };
        
        // Update local state with the updated quotation
        setQuotation(updatedQuotation);
        
        // Show success message based on the status
        if (newStatus === 'accepted') {
          toast.success('Quotation marked as accepted');
        } else if (newStatus === 'rejected') {
          toast.success('Quotation marked as rejected');
        } else {
          toast.success(`Quotation status updated to ${newStatus}`);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(`Failed to update quotation status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Send quotation email function
   * Matches the functionality in the dropdown menu
   */
  const handleSendEmail = async () => {
    setActionLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (quotation?.status === 'draft') {
        setQuotation({ ...quotation, status: 'sent' });
      }
      toast.success(`Quotation sent to ${quotation?.clientEmail || 'client'}`);
    } catch (error) {
      console.error('Error sending quotation:', error);
      toast.error('Failed to send quotation');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Delete quotation function
   * Matches the functionality in the dropdown menu
   */
  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowDeleteModal(false);
      toast.success(`Quotation ${quotation?.number} deleted`);
      navigate('/quotations');
    } catch (error) {
      console.error('Error deleting quotation:', error);
      toast.error('Failed to delete quotation');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * FINALIZED QUOTATION PDF DOWNLOAD FUNCTION
   * This function handles the generation and download of quotation PDFs.
   * It matches the dropdown menu functionality in behavior and styling.
   */
  const handleDownloadPDF = async () => {
    setActionLoading(true);
    try {
      // Generate the PDF using the quotation data
      // Cast to PdfQuotation type with required validUntil field
      const pdfQuotation = {
        ...quotation,
        validUntil: quotation.expiryDate || new Date().toISOString().split('T')[0]
      };
      await generateQuotationPdf(pdfQuotation as PdfQuotation);
      
      // Success is handled by the PDF generator
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
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
  
  /**
   * Edit quotation function
   * Matches the functionality in the dropdown menu
   */
  const handleEdit = () => {
    // In a real implementation, this would open an edit modal or navigate to edit page
    toast.info(`Editing ${quotation?.number}`);
    console.log(`Edit quotation: ${quotation?.id}`);
    // For now, we'll just log the action as in the dropdown menu
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
          handleEdit={handleEdit}
          setShowDeleteModal={setShowDeleteModal}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
          handleStatusUpdate={handleStatusUpdate}
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
