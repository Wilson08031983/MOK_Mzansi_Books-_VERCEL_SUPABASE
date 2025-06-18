
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MoreHorizontal, 
  Edit, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  CircleDollarSign, 
  AlertTriangle, 
  XCircle, 
  Printer,
  FilePlus,
  FileText,
  Send,
  Check,
  CreditCard,
  Loader2,
  Mail,
  Trash2,
  Copy,
  Paperclip,
  User
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount?: number;
  total: number;
}

export interface InvoiceAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  url: string;
  uploadedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
  paymentDate?: string;
  isPaid: boolean;
  attachments?: InvoiceAttachment[];
}

// Get status badge color based on status
const getStatusColor = (status: InvoiceStatus | undefined): string => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-500';
    case 'sent':
      return 'bg-blue-100 text-blue-500';
    case 'viewed':
      return 'bg-indigo-100 text-indigo-500';
    case 'paid':
      return 'bg-green-100 text-green-500';
    case 'overdue':
      return 'bg-red-100 text-red-500';
    case 'partial':
      return 'bg-yellow-100 text-yellow-500';
    case 'cancelled':
      return 'bg-gray-100 text-gray-500';
    default:
      return 'bg-gray-100 text-gray-500';
  }
};

// Get status icon based on status
const getStatusIcon = (status: InvoiceStatus | undefined) => {
  switch (status) {
    case 'draft':
      return <FileText className="h-4 w-4" />;
    case 'sent':
      return <Send className="h-4 w-4" />;
    case 'viewed':
      return <FileText className="h-4 w-4" />;
    case 'paid':
      return <Check className="h-4 w-4" />;
    case 'overdue':
      return <AlertTriangle className="h-4 w-4" />;
    case 'partial':
      return <Clock className="h-4 w-4" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

// Sample function to get invoice data
const getSampleInvoice = (id: string): Invoice => {
  return {
    id,
    invoiceNumber: 'INV-2023-001',
    clientId: '1',
    clientName: 'Acme Corporation',
    issueDate: '2023-06-01',
    dueDate: '2023-06-15',
    status: 'sent' as InvoiceStatus,
    items: [
      {
        id: '1',
        description: 'Web Development',
        quantity: 40,
        unitPrice: 120,
        taxRate: 15,
        discount: 0,
        total: 40 * 120
      },
      {
        id: '2',
        description: 'UI/UX Design',
        quantity: 20,
        unitPrice: 100,
        taxRate: 15,
        discount: 0,
        total: 20 * 100
      },
      {
        id: '3',
        description: 'Project Management',
        quantity: 10,
        unitPrice: 150,
        taxRate: 15,
        discount: 0,
        total: 10 * 150
      }
    ],
    subtotal: 7500,
    taxAmount: 1125,
    discount: 0,
    total: 8625,
    notes: 'Thank you for your business.',
    terms: 'Payment due within 15 days.',
    createdAt: '2023-06-01',
    updatedAt: '2023-06-01',
    paymentDate: '',
    isPaid: false,
    attachments: []
  };
};

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoiceId = id || '';
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get sample invoice data
        const foundInvoice = getSampleInvoice(invoiceId);
        setInvoice(foundInvoice);
      } catch (err) {
        setError('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoice();
  }, [invoiceId]);

  // Handle sending invoice
  const handleSendInvoice = async () => {
    setActionLoading('send');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update invoice status
      const updatedInvoice = { ...invoice!, status: 'sent' as InvoiceStatus };
      setInvoice(updatedInvoice);
      
      console.log(`Invoice ${invoice?.invoiceNumber} sent successfully`);
    } catch (err) {
      console.error('Error sending invoice:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle marking invoice as paid
  const handleMarkAsPaid = async () => {
    setActionLoading('paid');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update invoice status
      const updatedInvoice = { 
        ...invoice!, 
        status: 'paid' as InvoiceStatus, 
        paymentDate: new Date().toISOString(),
        isPaid: true
      };
      setInvoice(updatedInvoice);
      
      console.log(`Invoice ${invoice?.invoiceNumber} marked as paid`);
    } catch (error) {
      console.error('Error updating invoice:', error);
    } finally {
      setActionLoading(null);
      setShowActionsMenu(false);
    }
  };
  
  // Handle downloading PDF
  const handleDownloadPDF = async () => {
    setActionLoading('download');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`Invoice ${invoice?.invoiceNumber} downloaded`);
    } catch (err) {
      console.error('Error downloading invoice:', err);
    } finally {
      setActionLoading(null);
    }
  };
  
  // Handle printing
  const handlePrint = async () => {
    setActionLoading('print');
    
    try {
      // Simulate preparing print layout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      window.print();
      
      console.log(`Invoice ${invoice?.invoiceNumber} sent to printer`);
    } catch (err) {
      console.error('Error printing invoice:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 font-sf-pro">Loading invoice...</p>
        </div>
      </div>
    );
  }
  
  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h1 className="text-xl font-semibold text-red-500 font-sf-pro">Error Loading Invoice</h1>
          <p className="text-slate-600 max-w-md font-sf-pro">{error || 'Invoice not found'}</p>
          <Link to="/invoices" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-sf-pro">
            Return to Invoices
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * 0.15; // 15% tax
  const total = subtotal + taxAmount;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link to="/invoices" className="p-2 rounded-full hover:bg-white/80 transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-sf-pro">Invoice #{invoice.invoiceNumber}</h1>
              <p className="text-slate-600 font-sf-pro">Invoice for {invoice.clientName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 border border-white/20 rounded-lg hover:bg-white/90 transition-colors font-sf-pro"
              >
                <span>Actions</span>
                <MoreHorizontal className="h-4 w-4" />
              </button>
              
              {showActionsMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-10 border border-white/20">
                  <div className="py-1">
                    <button
                      onClick={handleSendInvoice}
                      disabled={actionLoading === 'send'}
                      className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-sf-pro"
                    >
                      {actionLoading === 'send' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4 mr-2" />
                      )}
                      Send to Client
                    </button>
                    
                    <button
                      onClick={handleMarkAsPaid}
                      disabled={actionLoading === 'paid' || invoice.status === 'paid'}
                      className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-sf-pro"
                    >
                      {actionLoading === 'paid' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      Mark as Paid
                    </button>
                    
                    <button
                      onClick={handleDownloadPDF}
                      disabled={actionLoading === 'download'}
                      className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-sf-pro"
                    >
                      {actionLoading === 'download' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Download PDF
                    </button>
                    
                    <button
                      onClick={handlePrint}
                      disabled={actionLoading === 'print'}
                      className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-sf-pro"
                    >
                      {actionLoading === 'print' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Printer className="h-4 w-4 mr-2" />
                      )}
                      Print Invoice
                    </button>
                    
                    <hr className="my-1" />
                    
                    <button className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-sf-pro">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Invoice
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleSendInvoice}
              disabled={actionLoading === 'send'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-sf-pro"
            >
              {actionLoading === 'send' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Invoice details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Status */}
            <div className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${getStatusColor(invoice.status)}`}>
                  {getStatusIcon(invoice.status)}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-slate-900 font-sf-pro">
                    Status: <span className="capitalize">{invoice.status}</span>
                  </h2>
                  {invoice.status === 'sent' && (
                    <p className="text-sm text-slate-600 font-sf-pro">
                      Payment due by {new Date(invoice.dueDate).toLocaleDateString('en-ZA')}
                    </p>
                  )}
                  {invoice.status === 'paid' && (
                    <p className="text-sm text-slate-600 font-sf-pro">
                      Payment received
                    </p>
                  )}
                  {invoice.status === 'overdue' && (
                    <p className="text-sm text-red-600 font-sf-pro">
                      Payment was due on {new Date(invoice.dueDate).toLocaleDateString('en-ZA')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Invoice Items */}
            <div className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business rounded-lg p-6">
              <h2 className="text-lg font-medium text-slate-900 mb-4 font-sf-pro">Invoice Items</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                        Qty
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                        Unit Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/30 divide-y divide-slate-200">
                    {invoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-pre-wrap text-slate-900 font-sf-pro">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-900 font-sf-pro">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-900 font-sf-pro">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-900 font-sf-pro">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="flex justify-end">
                  <div className="w-full md:w-64">
                    <div className="flex justify-between items-center py-2">
                      <div className="text-base text-slate-600 font-sf-pro">Subtotal</div>
                      <div className="text-base font-medium text-slate-900 font-sf-pro">{formatCurrency(invoice.subtotal)}</div>
                    </div>
                    
                    <div className="flex justify-between py-2 text-slate-600">
                      <span className="font-sf-pro">Tax (15%):</span>
                      <span className="font-sf-pro">{formatCurrency(invoice.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold text-lg border-t border-slate-200 mt-2 pt-2 text-slate-900">
                      <span className="font-sf-pro">Total:</span>
                      <span className="font-sf-pro">{formatCurrency(invoice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Terms and Notes */}
            {(invoice.terms || invoice.notes) && (
              <div className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business rounded-lg p-6">
                <h2 className="text-lg font-medium text-slate-900 mb-4 font-sf-pro">Additional Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {invoice.terms && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-700 mb-2 font-sf-pro">Terms and Conditions</h3>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap font-sf-pro">{invoice.terms}</p>
                    </div>
                  )}
                  
                  {invoice.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-700 mb-2 font-sf-pro">Notes</h3>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap font-sf-pro">{invoice.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Right column - Client and payment info */}
          <div className="space-y-6">
            {/* Client Information */}
            <div className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business rounded-lg p-6">
              <h2 className="text-lg font-medium text-slate-900 mb-4 font-sf-pro">Client Information</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 font-sf-pro">Name</h3>
                  <Link to={`/clients/${invoice.clientId}`} className="text-blue-600 hover:underline font-sf-pro">
                    {invoice.clientName}
                  </Link>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-700 font-sf-pro">Client ID</h3>
                  <p className="text-sm text-slate-600 font-sf-pro">{invoice.clientId}</p>
                </div>
              </div>
            </div>
            
            {/* Invoice Information */}
            <div className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business rounded-lg p-6">
              <h2 className="text-lg font-medium text-slate-900 mb-4 font-sf-pro">Invoice Information</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 font-sf-pro">Issue Date</h3>
                  <p className="text-sm text-slate-600 font-sf-pro">{new Date(invoice.issueDate).toLocaleDateString('en-ZA')}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-700 font-sf-pro">Due Date</h3>
                  <p className="text-sm text-slate-600 font-sf-pro">{new Date(invoice.dueDate).toLocaleDateString('en-ZA')}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-700 font-sf-pro">Amount</h3>
                  <p className="text-lg font-semibold text-slate-900 font-sf-pro">{formatCurrency(invoice.total)}</p>
                </div>
                
                {invoice.paymentDate && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 font-sf-pro">Payment Date</h3>
                    <p className="text-sm text-slate-600 font-sf-pro">{new Date(invoice.paymentDate).toLocaleDateString('en-ZA')}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions Card */}
            <div className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business rounded-lg p-6">
              <h2 className="text-lg font-medium text-slate-900 mb-4 font-sf-pro">Quick Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={actionLoading === 'download'}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/80 border border-white/20 rounded-lg hover:bg-white/90 transition-colors font-sf-pro"
                >
                  {actionLoading === 'download' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handlePrint}
                  disabled={actionLoading === 'print'}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/80 border border-white/20 rounded-lg hover:bg-white/90 transition-colors font-sf-pro"
                >
                  {actionLoading === 'print' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Preparing...</span>
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4" />
                      <span>Print Invoice</span>
                    </>
                  )}
                </button>
                
                {invoice.status !== 'paid' && (
                  <button
                    onClick={handleMarkAsPaid}
                    disabled={actionLoading === 'paid'}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-sf-pro"
                  >
                    {actionLoading === 'paid' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Mark as Paid</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {/* Attachments Card - Simple placeholder without Supabase */}
            <div className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-slate-900 font-sf-pro">Attachments</h2>
                <div className="text-sm text-slate-500 font-sf-pro">
                  {invoice.attachments?.length || 0} file(s)
                </div>
              </div>
              
              {(!invoice.attachments || invoice.attachments.length === 0) ? (
                <div className="text-center py-4">
                  <Paperclip className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 font-sf-pro">No attachments</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {invoice.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-white/50 rounded">
                      <span className="text-sm font-sf-pro">{attachment.fileName}</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-sf-pro">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
