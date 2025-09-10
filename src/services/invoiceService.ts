import { safeLocalStorage, safeString, safeGet } from '@/utils/safeAccess';
import { withCrashPrevention } from '@/utils/crashPrevention';
import { Invoice, InvoiceInput, InvoiceResponse, InvoiceItem, InvoiceStatus, isValidInvoiceStatus } from '@/types/invoice';
import { getCompanyId, getCompany as getScopedCompany, getCompanyAssets as getScopedCompanyAssets } from '@/services/companyService';

// Define a type for the client object that can be either string or object
type ClientRef = string | { id: string; name: string; email?: string };

// Helper function to map invoice input to invoice
const mapToInvoice = (data: InvoiceInput, existingInvoice?: Invoice): InvoiceResponse => {
  const now = new Date().toISOString();
  
  // Handle client data with proper typing
  const clientId = typeof data.client === 'string' 
    ? data.client 
    : (data.client as any)?.id || '';
  
  const clientName = typeof data.client === 'string' 
    ? (data as any).clientName || 'Unknown Client'
    : (data.client as any)?.name || 'Unknown Client';
  
  // Map items with proper typing
  const items: InvoiceItem[] = data.items.map((item, index) => {
    const baseItem = item as any;
    const unitPrice = baseItem.unitPrice || baseItem.rate || 0;
    const quantity = baseItem.quantity || 0;
    const discount = baseItem.discount || 0;
    const markupPercent = baseItem.markupPercent || 0;
    const taxRate = baseItem.taxRate || 0;
    const amount = quantity * unitPrice * (1 - discount / 100);
    const taxAmount = amount * (taxRate / 100);
    
    return {
      id: baseItem.id || `item-${Date.now()}-${index}`,
      itemNo: index + 1,
      description: baseItem.description || '',
      quantity,
      rate: unitPrice,
      unitPrice,
      markupPercent,
      discount,
      amount,
      taxRate,
      taxAmount,
    };
  });
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const vatRate = data.vatRate || 0;
  const vatTotal = subtotal * (vatRate / 100);
  const amount = subtotal + vatTotal;
  const paidAmount = existingInvoice?.paidAmount || 0;
  
  // Validate and normalize status
  const normalizedStatus: InvoiceStatus = isValidInvoiceStatus((data as any).status) ? (data as any).status : 'draft';

  // Build the invoice response with all required properties
  const invoice: InvoiceResponse = {
    id: existingInvoice?.id || generateInvoiceId(),
    number: data.number || generateInvoiceNumber(),
    client: clientName,
    clientId,
    clientName,
    clientEmail: data.clientEmail || '',
    date: data.date,
    invoiceDate: data.date,
    dueDate: data.dueDate,
    amount,
    subtotal,
    vatTotal,
    total: amount,
    paidAmount,
    balance: amount - paidAmount,
    status: normalizedStatus,
    currency: data.currency || 'ZAR',
    vatRate: data.vatRate || 0,
    reference: data.reference || '',
    project: data.project,
    salesperson: data.salesperson,
    salespersonId: data.salespersonId,
    tags: data.tags,
    items,
    notes: data.notes,
    terms: data.terms || '',
    createdAt: existingInvoice?.createdAt || now,
    updatedAt: now,
    companyDetails: data.companyDetails,
  };
  
  return invoice;
};

const STORAGE_KEY = 'invoices';
const getInvoiceStorageKey = (): string => `${STORAGE_KEY}_${getCompanyId()}`;

// Get all invoices from localStorage
export const getInvoices = withCrashPrevention((): InvoiceResponse[] => {
  try {
    const key = getInvoiceStorageKey();
    const invoicesData = safeLocalStorage.getItem(key, null);
    if (!invoicesData) {
      return [];
    }
    
    // Check if data is corrupted (contains '[object Object]')
    if (typeof invoicesData === 'string' && invoicesData.includes('[object Object]')) {
      console.warn('Corrupted invoice data detected, clearing localStorage');
      safeLocalStorage.removeItem(key);
      return [];
    }
    
    // If data is already parsed by safeLocalStorage, return it
    if (Array.isArray(invoicesData)) {
      return invoicesData as InvoiceResponse[];
    }
    
    // Otherwise try to parse it
    return JSON.parse(invoicesData as string) as InvoiceResponse[];
  } catch (error) {
    console.error('Error loading invoices:', error);
    // Clear corrupted data
    safeLocalStorage.removeItem(getInvoiceStorageKey());
    return [];
  }
}, []);

// Save invoices to localStorage
export const saveInvoices = withCrashPrevention((invoices: InvoiceResponse[]): boolean => {
  try {
    const key = getInvoiceStorageKey();
    safeLocalStorage.setItem(key, JSON.stringify(invoices));
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
  // Dispatch event for create
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('invoices-updated', {
        detail: { action: 'created', invoice: newInvoice }
      }));
    }
  } catch (e) {
    console.warn('invoices-updated dispatch failed (create):', e);
  }
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
  
  // Prepare items for InvoiceInput (omit id, amount, taxAmount)
  type InputItem = Omit<InvoiceItem, 'id' | 'amount' | 'taxAmount'>;
  const inputItems: InputItem[] = (updates.items
    ? (updates.items as any[]).map((it: any, idx) => ({
        itemNo: it.itemNo ?? idx + 1,
        description: it.description ?? '',
        quantity: Number(it.quantity) || 0,
        unitPrice: Number(it.unitPrice ?? it.rate) || 0,
        rate: Number(it.rate ?? it.unitPrice) || 0,
        markupPercent: Number(it.markupPercent) || 0,
        discount: Number(it.discount) || 0,
        taxRate: Number(it.taxRate) || 0,
      }))
    : (existingInvoice.items as any[]).map((it: any, idx) => ({
        itemNo: it.itemNo ?? idx + 1,
        description: it.description ?? '',
        quantity: Number(it.quantity) || 0,
        unitPrice: Number(it.unitPrice ?? it.rate) || 0,
        rate: Number(it.rate ?? it.unitPrice) || 0,
        markupPercent: Number(it.markupPercent) || 0,
        discount: Number(it.discount) || 0,
        taxRate: Number(it.taxRate) || 0,
      }))
  ) as InputItem[];

  const invoiceInput: InvoiceInput = {
    ...existingInvoice,
    ...updates,
    client: (updates.client as any) || existingInvoice.clientId,
    items: inputItems,
  } as unknown as InvoiceInput;
  
  const updatedInvoice = mapToInvoice(invoiceInput, existingInvoice);
  
  const updatedInvoices = invoices.map(inv => 
    inv.id === id ? updatedInvoice : inv
  );
  
  saveInvoices(updatedInvoices);
  // Dispatch event for update
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('invoices-updated', {
        detail: { action: 'updated', invoice: updatedInvoice }
      }));
    }
  } catch (e) {
    console.warn('invoices-updated dispatch failed (update):', e);
  }
  return updatedInvoice;
}, () => null);

// Delete an invoice
export const deleteInvoice = withCrashPrevention(async (id: string): Promise<boolean> => {
  const invoices = getInvoices();
  const toDelete = invoices.find(inv => inv.id === id);
  const filtered = invoices.filter(invoice => invoice.id !== id);
  
  if (filtered.length === invoices.length) return false;
  
  saveInvoices(filtered);
  // Dispatch event for delete
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('invoices-updated', {
        detail: { action: 'deleted', invoiceId: id, invoice: toDelete }
      }));
    }
  } catch (e) {
    console.warn('invoices-updated dispatch failed (delete):', e);
  }
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
    // Check if the invoice number contains the current year
    return invoice.number && invoice.number.includes(`-${currentYear}-`);
  });
  
  // Default to 0 if no invoices found for current year
  if (currentYearInvoices.length === 0) {
    return `INV-${currentYear}-001`;
  }
  
  // Find the highest invoice number
  let highestNumber = 0;
  
  currentYearInvoices.forEach(invoice => {
    // Extract the numeric part from the invoice number
    const match = invoice.number.match(/INV-\d{4}-(\d{3,})/);
    if (match && match[1]) {
      const number = parseInt(match[1], 10);
      if (!isNaN(number) && number > highestNumber) {
        highestNumber = number;
      }
    }
  });
  
  // Increment the highest number and pad with zeros
  const nextNumber = (highestNumber + 1).toString().padStart(3, '0');
  return `INV-${currentYear}-${nextNumber}`;
}, () => {
  // Dynamic fallback that includes current year instead of hardcoded year
  const currentYear = new Date().getFullYear();
  return `INV-${currentYear}-001`;
});

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

// Apply client-level discount to a subtotal and compute VAT and total
export const applyClientDiscountToTotals = withCrashPrevention((
  subtotal: number,
  vatRate: number,
  discountRate?: string | number
) => {
  const sub = Number(subtotal) || 0;
  const vat = Number(vatRate) || 0;
  const disc = typeof discountRate === 'string' ? parseFloat(discountRate) : Number(discountRate || 0);
  const discountAmount = sub * ((isFinite(disc) ? disc : 0) / 100);
  const discountedSubtotal = Math.max(0, sub - discountAmount);
  const vatTotal = discountedSubtotal * (vat / 100);
  const total = discountedSubtotal + vatTotal;
  return { discountedSubtotal, vatTotal, total, discountAmount };
}, { discountedSubtotal: 0, vatTotal: 0, total: 0, discountAmount: 0 });

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

// Calculate total outstanding balance for a specific client across all invoices
export const getClientOutstandingBalance = withCrashPrevention((clientId: string): number => {
  try {
    const invoices = getInvoices();

    return invoices
      .filter(inv => inv && (inv.clientId === clientId || (inv as any).client === clientId))
      .reduce((sum, inv) => {
        const total = Number((inv as any).total ?? (inv as any).amount ?? 0);
        const paid = Number((inv as any).paidAmount ?? 0);
        const computedBalance = typeof (inv as any).balance === 'number'
          ? Number((inv as any).balance)
          : total - paid;
        const status = (inv as any).status || 'draft';
        // Exclude cancelled invoices entirely
        if (status === 'cancelled') return sum;
        // Only add positive outstanding amounts
        return sum + Math.max(0, computedBalance);
      }, 0);
  } catch (e) {
    return 0;
  }
}, 0);

// Credit limit enforcement helper
export const canProceedWithCredit = withCrashPrevention((
  clientId: string,
  invoiceTotal: number,
  creditLimit?: string | number
) => {
  const limit = typeof creditLimit === 'string' ? parseFloat(creditLimit) : Number(creditLimit);
  const outstanding = getClientOutstandingBalance(clientId);

  // If no valid credit limit configured, allow by default
  if (!isFinite(limit) || limit <= 0) {
    return { allowed: true, outstanding, remaining: Number.MAX_SAFE_INTEGER };
  }

  const remaining = Math.max(0, limit - outstanding);
  const allowed = (Number(invoiceTotal) || 0) <= remaining;
  return { allowed, outstanding, remaining };
}, { allowed: true, outstanding: 0, remaining: Number.MAX_SAFE_INTEGER });

// Create invoice template with company details
export const createInvoiceTemplate = withCrashPrevention((invoiceData: Partial<Invoice> = {} as Partial<Invoice>): Invoice => {
  // Use scoped company details and assets (legacy fallback handled in service)
  const company = getScopedCompany();
  const assets = getScopedCompanyAssets();

  // Build a single-line address string from available parts
  const addressParts = [
    company?.addressLine1,
    company?.addressLine2,
    company?.city,
    company?.state,
    company?.postalCode,
    company?.country,
  ].filter(Boolean).join(', ');

  // Map to the Invoice.companyDetails shape if company exists
  const companyDetails = company ? {
    name: company.name || '',
    address: addressParts || '',
    city: company.city,
    state: company.state,
    zip: company.postalCode,
    country: company.country,
    phone: company.phone || '',
    email: company.email || '',
    website: company.website || '',
    taxNumber: company.vatNumber || company.registrationNumber || '',
    logo: (assets?.logo || company.logo) || ''
  } : undefined;

  // Items and totals
  const items: InvoiceItem[] = Array.isArray(invoiceData.items) ? (invoiceData.items as InvoiceItem[]) : [];
  const { subtotal, totalTax, total } = calculateInvoiceTotals(items);

  const now = new Date().toISOString();
  const status: InvoiceStatus = isValidInvoiceStatus((invoiceData as any).status) ? (invoiceData as any).status : 'draft';

  const totalValue = invoiceData.total ?? total;
  const paidAmount = invoiceData.paidAmount ?? 0;

  return {
    id: invoiceData.id || generateInvoiceId(),
    number: invoiceData.number || generateInvoiceNumber(),
    client: (invoiceData as any).client || '',
    clientId: invoiceData.clientId || '',
    clientName: (invoiceData as any).clientName || ((typeof (invoiceData as any).client === 'string') ? (invoiceData as any).client : ''),
    clientEmail: invoiceData.clientEmail || '',
    date: invoiceData.date || now,
    invoiceDate: invoiceData.invoiceDate || invoiceData.date || now,
    dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    amount: invoiceData.amount ?? totalValue,
    subtotal: invoiceData.subtotal ?? subtotal,
    vatTotal: invoiceData.vatTotal ?? totalTax,
    total: totalValue,
    paidAmount,
    balance: totalValue - paidAmount,
    status,
    currency: invoiceData.currency || company?.currency || 'ZAR',
    vatRate: typeof invoiceData.vatRate === 'number' ? invoiceData.vatRate : (company?.taxRate ?? 0),
    reference: invoiceData.reference || '',
    project: (invoiceData as any).project,
    salesperson: (invoiceData as any).salesperson,
    salespersonId: (invoiceData as any).salespersonId,
    tags: invoiceData.tags,
    items,
    notes: invoiceData.notes || company?.invoiceNotes || '',
    terms: invoiceData.terms || company?.invoiceTerms || '',
    createdAt: invoiceData.createdAt || now,
    updatedAt: invoiceData.updatedAt || now,
    companyDetails,
  };
}, () => {
  const now = new Date().toISOString();
  return {
    id: generateInvoiceId(),
    number: generateInvoiceNumber(),
    client: '',
    clientId: '',
    clientName: '',
    clientEmail: '',
    date: now,
    invoiceDate: now,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 0,
    subtotal: 0,
    vatTotal: 0,
    total: 0,
    paidAmount: 0,
    balance: 0,
    status: 'draft',
    currency: 'ZAR',
    vatRate: 0,
    reference: '',
    project: undefined,
    salesperson: undefined,
    salespersonId: undefined,
    tags: [],
    items: [],
    notes: '',
    terms: '',
    createdAt: now,
    updatedAt: now,
  } as Invoice;
});
