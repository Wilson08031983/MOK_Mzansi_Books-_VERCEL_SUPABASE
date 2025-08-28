export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';

// Centralized list of valid invoice statuses and a guard
export const VALID_INVOICE_STATUSES: readonly InvoiceStatus[] = [
  'draft',
  'sent',
  'viewed',
  'partial',
  'paid',
  'overdue',
  'cancelled',
] as const;

export const isValidInvoiceStatus = (value: unknown): value is InvoiceStatus => {
  return typeof value === 'string' && (VALID_INVOICE_STATUSES as readonly string[]).includes(value);
};

export interface InvoiceItem {
  id: string;
  itemNo: number;
  description: string;
  quantity: number;
  rate: number;
  unitPrice: number; // Alias for rate for UI compatibility
  markupPercent: number;
  discount: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  number: string;
  client: string | Client; // Can be string ID or full client object
  clientId: string;
  clientName: string; // For UI convenience
  clientEmail?: string;
  date: string;
  invoiceDate: string; // Alias for date
  dueDate: string;
  amount: number;
  subtotal?: number; // Subtotal before VAT
  vatTotal?: number; // VAT amount
  total: number; // Alias for amount
  paidAmount: number;
  balance: number;
  status: InvoiceStatus;
  currency: string;
  vatRate: number;
  reference: string;
  project?: string;
  salesperson?: string;
  salespersonId?: string;
  tags?: string[];
  items: InvoiceItem[];
  notes?: string;
  terms: string;
  createdAt: string;
  updatedAt: string;
  companyDetails?: {
    name: string;
    address: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    phone: string;
    email: string;
    website?: string;
    taxNumber?: string;
    logo?: string;
  };
}

// For form inputs and API payloads
// Note: omit 'items' from Invoice to avoid intersection type on items
export type InvoiceInput = Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'balance' | 'items'> & {
  client: string; // Client ID for API
  items: Array<Omit<InvoiceItem, 'id' | 'amount' | 'taxAmount'>>;
};

// For API responses
export type InvoiceResponse = Invoice;

export interface PaymentData {
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
  notes?: string;
}

export interface InvoiceFilters {
  searchQuery: string;
  status: string;
  date: string;
  client: string;
}

export interface SortConfig {
  field: keyof Invoice;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

// Service invoice type for API compatibility
export interface ServiceInvoice {
  id: string;
  number: string;
  client: string | Client;
  clientId: string;
  clientEmail?: string;
  date: string;
  dueDate: string;
  amount: number;
  subtotal?: number;
  vatTotal?: number;
  total: number;
  paidAmount: number;
  status: InvoiceStatus;
  currency: string;
  vatRate: number;
  reference: string;
  project?: string;
  salesperson?: string;
  salespersonId?: string;
  tags?: string[];
  items: InvoiceItem[];
  notes?: string;
  terms: string;
  createdAt: string;
  updatedAt: string;
}

// Helper function to map service invoice to UI invoice
export const mapToLocalInvoice = (invoice: ServiceInvoice): Invoice => {
  const client = typeof invoice.client === 'string' ? 
    { id: invoice.clientId || '', name: invoice.client, email: invoice.clientEmail || '' } : 
    invoice.client;

  return {
    ...invoice,
    clientName: client.name,
    clientEmail: client.email,
    invoiceDate: invoice.date,
    client: client.name,
    items: invoice.items.map((item, index) => ({
      ...item,
      itemNo: index + 1,
      unitPrice: item.rate,
      taxAmount: (item.amount || 0) * ((item.taxRate || 0) / 100)
    })),
    balance: (invoice.amount || 0) - (invoice.paidAmount || 0),
    paidAmount: invoice.paidAmount || 0,
    terms: invoice.terms || '',
    reference: invoice.reference || '',
    vatRate: invoice.vatRate || 0,
    currency: invoice.currency || 'ZAR',
    createdAt: invoice.createdAt || new Date().toISOString(),
    updatedAt: invoice.updatedAt || new Date().toISOString()
  };
};

// Helper function to map UI invoice to service invoice
export const mapToServiceInvoice = (invoice: Invoice): ServiceInvoice => {
  return {
    id: invoice.id,
    number: invoice.number,
    client: invoice.clientName,
    clientId: invoice.clientId,
    clientEmail: invoice.clientEmail,
    date: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    amount: invoice.amount,
    subtotal: invoice.subtotal,
    vatTotal: invoice.vatTotal,
    total: invoice.total,
    paidAmount: invoice.paidAmount,
    status: invoice.status,
    currency: invoice.currency,
    vatRate: invoice.vatRate,
    reference: invoice.reference,
    project: invoice.project,
    salesperson: invoice.salesperson,
    salespersonId: invoice.salespersonId,
    tags: invoice.tags,
    items: invoice.items.map(item => ({
      ...item,
      rate: item.unitPrice
    })),
    notes: invoice.notes,
    terms: invoice.terms,
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt
  };
};
