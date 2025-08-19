
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
import { useLocalization } from '@/hooks/useLocalization';

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
      return 'bg-muted text-muted-foreground';
    case 'sent':
      return 'bg-blue-100 text-blue-500 dark:bg-blue-950/50 dark:text-blue-400';
    case 'viewed':
      return 'bg-indigo-100 text-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-400';
    case 'paid':
      return 'bg-green-100 text-green-500 dark:bg-green-950/50 dark:text-green-400';
    case 'overdue':
      return 'bg-red-100 text-red-500 dark:bg-red-950/50 dark:text-red-400';
    case 'partial':
      return 'bg-yellow-100 text-yellow-500 dark:bg-yellow-950/50 dark:text-yellow-400';
    case 'cancelled':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
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
  const { formatDate, formatDateTime, getTimezoneDisplayName } = useLocalization();
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground font-sf-pro">Loading invoice...</p>
        </div>
      </div>
    );
  }
  
  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-xl font-semibold text-destructive font-sf-pro">Error Loading Invoice</h1>
          <p className="text-muted-foreground max-w-md font-sf-pro">{error || 'Invoice not found'}</p>
          <Link to="/invoices" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-sf-pro">
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
    <div className="min-h-screen bg-background">
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link to="/invoices" className="p-2 rounded-full hover:bg-accent transition-colors">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-sf-pro">Invoice #{invoice.invoiceNumber}</h1>
              <p className="text-muted-foreground font-sf-pro">Invoice for {invoice.clientName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="inline-flex items-center gap-2 px-4 py-2 glass border border-border rounded-lg hover:bg-accent transition-colors font-sf-pro"
              >
                <span>Actions</span>
                <MoreHorizontal className="h-4 w-4" />
              </button>
              
              {showActionsMenu && (
                <div className="absolute right-0 mt-2 w-56 glass-soft bg-background/95 backdrop-blur-md rounded-lg shadow-2xl z-10 border border-border/50">
                  <div className="py-1">
                    <button
                      onClick={handleSendInvoice}
                      disabled={actionLoading === 'send'}
                      className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors font-sf-pro"
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
                      className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors font-sf-pro"
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
                      className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors font-sf-pro"
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
                      className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors font-sf-pro"
                    >
                      {actionLoading === 'print' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Printer className="h-4 w-4 mr-2" />
                      )}
                      Print Invoice
                    </button>
                    
                    <hr className="my-1" />
                    
                    <button className="flex w-full items-center px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors font-sf-pro">
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-sf-pro"
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
            <div className="glass border border-border/50 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${getStatusColor(invoice.status)}`}>
                  {getStatusIcon(invoice.status)}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-foreground font-sf-pro">
                    Status: <span className="capitalize">{invoice.status}</span>
                  </h2>
                  {invoice.status === 'sent' && (
                    <p className="text-sm text-muted-foreground font-sf-pro">
                      Payment due by {formatDate(new Date(invoice.dueDate))}
                    </p>
                  )}
                  {invoice.status === 'paid' && (
                    <p className="text-sm text-muted-foreground font-sf-pro">
                      Payment received
                    </p>
                  )}
                  {invoice.status === 'overdue' && (
                    <p className="text-sm text-destructive font-sf-pro">
                      Payment was due on {formatDate(new Date(invoice.dueDate))}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Invoice Items */}
            <div className="glass border border-border/50 rounded-xl p-6">
              <h2 className="text-lg font-medium text-foreground mb-4 font-sf-pro">Invoice Items</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/20">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider font-sf-pro">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider font-sf-pro">
                        Qty
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider font-sf-pro">
                        Unit Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider font-sf-pro">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card/30 divide-y divide-border">
                    {invoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-pre-wrap text-foreground font-sf-pro">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 text-center text-foreground font-sf-pro">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-right text-foreground font-sf-pro">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-foreground font-sf-pro">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 border-t border-border pt-4">
                <div className="flex justify-end">
                  <div className="w-full md:w-64">
                    <div className="flex justify-between items-center py-2">
                      <div className="text-base text-muted-foreground font-sf-pro">Subtotal</div>
                      <div className="text-base font-medium text-foreground font-sf-pro">{formatCurrency(invoice.subtotal)}</div>
                    </div>
                    
                    <div className="flex justify-between py-2 text-muted-foreground">
                      <span className="font-sf-pro">Tax (15%):</span>
                      <span className="font-sf-pro">{formatCurrency(invoice.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold text-lg border-t border-border mt-2 pt-2 text-foreground">
                      <span className="font-sf-pro">Total:</span>
                      <span className="font-sf-pro">{formatCurrency(invoice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Terms and Notes */}
            {(invoice.terms || invoice.notes) && (
              <div className="glass border border-border/50 rounded-xl p-6">
                <h2 className="text-lg font-medium text-foreground mb-4 font-sf-pro">Additional Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {invoice.terms && (
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-2 font-sf-pro">Terms and Conditions</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap font-sf-pro">{invoice.terms}</p>
                    </div>
                  )}
                  
                  {invoice.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-2 font-sf-pro">Notes</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap font-sf-pro">{invoice.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Right column - Client and payment info */}
          <div className="space-y-6">
            {/* Client Information */}
            <div className="glass border border-border/50 rounded-xl p-6">
              <h2 className="text-lg font-medium text-foreground mb-4 font-sf-pro">Client Information</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground font-sf-pro">Name</h3>
                  {invoice.clientName && (
                    <p className="text-sm text-muted-foreground font-sf-pro mt-1">{invoice.clientName}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-foreground font-sf-pro">Client ID</h3>
                  <p className="text-sm text-muted-foreground font-sf-pro">{invoice.clientId}</p>
                </div>
              </div>
            </div>
            
            {/* Invoice Information */}
            <div className="glass border border-border/50 rounded-xl p-6">
              <h2 className="text-lg font-medium text-foreground mb-4 font-sf-pro">Invoice Information</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground font-sf-pro">Issue Date</h3>
                  <p className="text-sm text-muted-foreground font-sf-pro">{formatDate(new Date(invoice.issueDate))}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-foreground font-sf-pro">Due Date</h3>
                  <p className="text-sm text-muted-foreground font-sf-pro">{formatDate(new Date(invoice.dueDate))}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-foreground font-sf-pro">Amount</h3>
                  <p className="text-lg font-semibold text-foreground font-sf-pro">{formatCurrency(invoice.total)}</p>
                </div>
                
                {invoice.paymentDate && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground font-sf-pro">Payment Date</h3>
                    <p className="text-sm text-muted-foreground font-sf-pro">{formatDate(new Date(invoice.paymentDate))}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="glass border border-border/50 rounded-xl p-6">
              <h2 className="text-lg font-medium text-foreground font-sf-pro">Quick Actions</h2>
              
              <div className="mt-4 space-y-3">
                <button
                  onClick={handleSendInvoice}
                  disabled={actionLoading === 'send'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-sf-pro"
                >
                  {actionLoading === 'send' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <span>Send to Client</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleMarkAsPaid}
                  disabled={actionLoading === 'paid' || invoice.status === 'paid'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-sf-pro disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === 'paid' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Mark as Paid</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDownloadPDF}
                  disabled={actionLoading === 'download'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors font-sf-pro"
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors font-sf-pro"
                >
                  {actionLoading === 'print' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Printing...</span>
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4" />
                      <span>Print Invoice</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Attachments */}
            <div className="glass border border-border/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-foreground font-sf-pro">Attachments</h2>
                <div className="text-sm text-muted-foreground font-sf-pro">
                  {invoice.attachments?.length || 0} files
                </div>
              </div>
              
              {invoice.attachments && invoice.attachments.length > 0 ? (
                <div className="space-y-2">
                  {invoice.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center">
                        <Paperclip className="h-4 w-4 text-muted-foreground mr-2" />
                        <div>
                          <div className="text-sm font-medium text-foreground">{attachment.fileName}</div>
                          <div className="text-xs text-muted-foreground">
                            {(attachment.fileSize / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                      <button className="text-primary hover:text-primary/80 text-xs">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Paperclip className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-sf-pro">No attachments</p>
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
