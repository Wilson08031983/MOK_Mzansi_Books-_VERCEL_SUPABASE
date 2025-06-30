export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';

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
export type InvoiceInput = Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'balance'> & {
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

// Helper function to map service invoice to UI invoice
export const mapToLocalInvoice = (invoice: ServiceInvoice): Invoice => {
  const client = typeof invoice.client === 'string' ? 
    { id: invoice.clientId || '', name: invoice.client, email: invoice.clientEmail || '' } : 
    { 
      id: invoice.client.id || invoice.clientId || '', 
      name: invoice.client.name || invoice.client, 
      email: invoice.client.email || invoice.clientEmail || '' 
    };

  return {
    ...invoice,
    clientName: client.name,
    clientEmail: client.email,
    clientDetails: {
      ...client,
      phone: client.phone || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      zip: client.zip || '',
      country: client.country || ''
    },
    invoiceDate: invoice.date,
    date: invoice.date, // Alias
    client: client.name, // Alias
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
  const serviceInvoice: ServiceInvoice = {
    ...invoice,
    client: invoice.clientName,
    clientId: invoice.clientId,
    clientEmail: invoice.clientEmail,
    date: invoice.invoiceDate,
    items: invoice.items.map(item => ({
      ...item,
      rate: item.unitPrice
    }))
  };
  
  // Remove UI-specific fields
  const { clientName, clientDetails, invoiceDate, ...rest } = serviceInvoice as any;
  return rest as ServiceInvoice;
};
