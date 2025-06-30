import { safeLocalStorage } from '@/utils/safeAccess';
import { withCrashPrevention } from '@/utils/crashPrevention';
import { Invoice, InvoiceInput, InvoiceResponse, InvoiceItem } from '@/types/invoice';

// Define a type for the client object that can be either string or object
type ClientRef = string | { id: string; name: string; email?: string };

// Helper function to map invoice input to invoice
const mapToInvoice = (data: InvoiceInput, existingInvoice?: Invoice): InvoiceResponse => {
  const now = new Date().toISOString();
  
  // Handle client data with proper typing
  const clientId = typeof data.client === 'string' 
    ? data.client 
    : data.client?.id || '';
  
  const clientName = typeof data.client === 'string' 
    ? (data as { clientName?: string }).clientName || ''
    : data.client?.name || '';
  
  // Map items with proper typing
  const items: InvoiceItem[] = data.items.map((item, index) => {
    const unitPrice = (item as InvoiceItem & { unitPrice?: number }).unitPrice || item.rate || 0;
    const quantity = item.quantity || 0;
    const discount = item.discount || 0;
    const amount = quantity * unitPrice * (1 - discount / 100);
    
    return {
      ...item,
      id: item.id || `item-${Date.now()}-${index}`,
      itemNo: index + 1,
      rate: unitPrice,
      amount,
    };
  });
  
  // Calculate totals
  const amount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const paidAmount = existingInvoice?.paidAmount || 0;
  
  // Build the invoice response
  const invoice: InvoiceResponse = {
    ...data,
    id: existingInvoice?.id || generateInvoiceId(),
    client: clientId,
    clientId,
    clientName,
    clientEmail: data.clientEmail || '',
    date: data.date,
    invoiceDate: data.date,
    dueDate: data.dueDate,
    amount,
    total: amount,
    paidAmount,
    balance: amount - paidAmount,
    status: data.status || 'draft',
    currency: data.currency || 'ZAR',
    vatRate: data.vatRate || 0,
    reference: data.reference || '',
    terms: data.terms || '',
    items,
    createdAt: existingInvoice?.createdAt || now,
    updatedAt: now,
  };
  
  return invoice;
};

const STORAGE_KEY = 'invoices';

// Get all invoices from localStorage
export const getInvoices = withCrashPrevention((): InvoiceResponse[] => {
  try {
    const invoicesData = safeLocalStorage.getItem(STORAGE_KEY);
    if (!invoicesData) {
      return [];
    }
    
    return JSON.parse(invoicesData) as InvoiceResponse[];
  } catch (error) {
    console.error('Error loading invoices:', error);
    return [];
  }
}, []);

// Save invoices to localStorage
export const saveInvoices = withCrashPrevention((invoices: InvoiceResponse[]): boolean => {
  try {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
    return true;
  } catch (error) {
    console.error('Error saving invoices:', error);
    return false;
  }
}, false);

// Get a single invoice by ID
export const getInvoiceById = withCrashPrevention((id: string): InvoiceResponse | null => {
  const invoices = getInvoices();
  return invoices.find(invoice => invoice.id === id) || null;
}, null);

// Create a new invoice
export const createInvoice = withCrashPrevention(async (invoiceData: InvoiceInput): Promise<InvoiceResponse> => {
  const invoices = getInvoices();
  const newInvoice = mapToInvoice(invoiceData);
  
  const updatedInvoices = [...invoices, newInvoice];
  saveInvoices(updatedInvoices);
  return newInvoice;
}, () => ({
  id: '',
  number: '',
  client: '',
  clientId: '',
  clientName: '',
  clientEmail: '',
  date: new Date().toISOString(),
  invoiceDate: new Date().toISOString(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  amount: 0,
  total: 0,
  paidAmount: 0,
  balance: 0,
  status: 'draft',
  currency: 'ZAR',
  vatRate: 0,
  reference: '',
  terms: '',
  items: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
} as InvoiceResponse));

// Update an existing invoice
export const updateInvoice = withCrashPrevention(async (id: string, updates: Partial<InvoiceInput>): Promise<InvoiceResponse | null> => {
  const invoices = getInvoices();
  const existingInvoice = invoices.find(inv => inv.id === id);
  
  if (!existingInvoice) return null;
  
  const updatedInvoice = mapToInvoice(
    { ...existingInvoice, ...updates } as InvoiceInput, 
    existingInvoice
  );
  
  const updatedInvoices = invoices.map(inv => 
    inv.id === id ? updatedInvoice : inv
  );
  
  saveInvoices(updatedInvoices);
  return updatedInvoice;
}, () => null);

// Delete an invoice
export const deleteInvoice = withCrashPrevention(async (id: string): Promise<boolean> => {
  const invoices = getInvoices();
  const filtered = invoices.filter(invoice => invoice.id !== id);
  
  if (filtered.length === invoices.length) return false;
  
  saveInvoices(filtered);
  return true;
}, () => false);

// Generate a unique invoice ID
const generateInvoiceId = (): string => {
  return `invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate invoice number
export const generateInvoiceNumber = withCrashPrevention((): string => {
  const invoices = getInvoices();
  const currentYear = new Date().getFullYear();
  
  // Find the highest invoice number for the current year
  const currentYearInvoices = invoices.filter(invoice => {
    const invoiceYear = new Date(invoice.createdAt).getFullYear();
    return invoiceYear === currentYear;
  });
  
  const highestNumber = currentYearInvoices.reduce((max, invoice) => {
    const match = invoice.number.match(/INV-(\d{4})-(\d{3})/);
    if (match) {
      const number = parseInt(match[2], 10);
      return Math.max(max, number);
    }
    return max;
  }, 0);
  
  const nextNumber = (highestNumber + 1).toString().padStart(3, '0');
  return `INV-${currentYear}-${nextNumber}`;
}, 'INV-2025-001');

// Calculate invoice totals
export const calculateInvoiceTotals = withCrashPrevention((items: InvoiceItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalTax = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
  const total = subtotal + totalTax;
  
  return {
    subtotal,
    totalTax,
    total
  };
}, { subtotal: 0, totalTax: 0, total: 0 });

// Get invoice statistics
export const getInvoiceStats = withCrashPrevention(() => {
  const invoices = getInvoices();
  
  const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalPaid = invoices.reduce((sum, invoice) => sum + (invoice.paidAmount || 0), 0);
  const outstandingBalance = totalInvoiced - totalPaid;
  
  const overdueInvoices = invoices.filter(invoice => {
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    return dueDate < today && invoice.status !== 'paid' && invoice.status !== 'cancelled';
  });
  
  const overdueAmount = overdueInvoices.reduce((sum, invoice) => {
    const balance = invoice.balance || (invoice.amount - (invoice.paidAmount || 0));
    return sum + balance;
  }, 0);
  
  // Calculate paid this period (current month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const paidThisPeriod = invoices
    .filter(invoice => {
      const updatedDate = new Date(invoice.updatedAt);
      return updatedDate.getMonth() === currentMonth && 
             updatedDate.getFullYear() === currentYear &&
             invoice.status === 'paid';
    })
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  
  return {
    totalInvoiced,
    outstandingBalance,
    overdueAmount,
    paidThisPeriod,
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(i => i.status === 'paid').length,
    overdueInvoices: overdueInvoices.length
  };
}, {
  totalInvoiced: 0,
  outstandingBalance: 0,
  overdueAmount: 0,
  paidThisPeriod: 0,
  totalInvoices: 0,
  paidInvoices: 0,
  overdueInvoices: 0
});

// Create invoice template with company details
export const createInvoiceTemplate = withCrashPrevention((invoiceData: Partial<Invoice>): Invoice => {
  try {
    const companyDetailsData = safeLocalStorage.getItem('companyDetails');
    let companyDetails = null;
    
    if (companyDetailsData) {
      const parsed = JSON.parse(companyDetailsData);
      companyDetails = {
        name: safeString(safeGet(parsed, 'name', '')),
        address: safeString(safeGet(parsed, 'address', '')),
        phone: safeString(safeGet(parsed, 'phone', '')),
        email: safeString(safeGet(parsed, 'email', '')),
        website: safeString(safeGet(parsed, 'website', '')),
        logo: safeString(safeGet(parsed, 'logo', '')),
        taxNumber: safeString(safeGet(parsed, 'taxNumber', '')),
        registrationNumber: safeString(safeGet(parsed, 'registrationNumber', ''))
      };
    }
    
    const template: Invoice = {
      id: generateInvoiceId(),
      number: generateInvoiceNumber(),
      client: '',
      clientId: '',
      clientEmail: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      amount: 0,
      paidAmount: 0,
      balance: 0,
      status: 'draft' as InvoiceStatus,
      currency: 'ZAR',
      reference: '',
      project: '',
      salesperson: '',
      salespersonId: '',
      tags: [],
      items: [],
      notes: '',
      terms: 'Payment is due within 30 days of invoice date.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      companyDetails,
      ...invoiceData
    };
    
    return template;
  } catch (error) {
    console.error('Error creating invoice template:', error);
    throw error;
  }
}, {} as Invoice);

// Save invoice and return updated list
export const saveInvoice = withCrashPrevention((invoice: Invoice): Invoice[] => {
  const invoices = getInvoices();
  const existingIndex = invoices.findIndex(q => q.id === invoice.id);
  
  if (existingIndex >= 0) {
    // Update existing invoice
    invoices[existingIndex] = {
      ...invoice,
      updatedAt: new Date().toISOString()
    };
  } else {
    // Add new invoice
    invoices.push({
      ...invoice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  saveInvoices(invoices);
  return invoices;
}, []);

// Update invoice status
export const updateInvoiceStatus = withCrashPrevention((id: string, status: InvoiceStatus): Invoice | null => {
  return updateInvoice(id, { status });
}, null);

// Record payment for an invoice
export const recordPayment = withCrashPrevention((id: string, paymentAmount: number): Invoice | null => {
  const invoice = getInvoiceById(id);
  if (!invoice) return null;
  
  const newPaidAmount = (invoice.paidAmount || 0) + paymentAmount;
  const newBalance = invoice.amount - newPaidAmount;
  
  let newStatus: InvoiceStatus = invoice.status;
  if (newBalance <= 0) {
    newStatus = 'paid';
  } else if (newPaidAmount > 0) {
    newStatus = 'partial';
  }
  
  return updateInvoice(id, {
    paidAmount: newPaidAmount,
    balance: newBalance,
    status: newStatus
  });
}, null);

// Export invoice data for backup
export const exportInvoices = withCrashPrevention((): string => {
  const invoices = getInvoices();
  return JSON.stringify(invoices, null, 2);
}, '[]');

// Import invoice data from backup
export const importInvoices = withCrashPrevention((data: string): boolean => {
  try {
    const invoices = JSON.parse(data);
    if (Array.isArray(invoices)) {
      saveInvoices(invoices);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error importing invoices:', error);
    return false;
  }
}, false);