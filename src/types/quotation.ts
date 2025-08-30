import { Client } from './invoice';

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  notes?: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  client: string | Client;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  date: string;
  quotationDate: string;
  validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  taxRate: number;
  reference?: string;
  project?: string;
  salesperson?: string;
  salespersonId?: string;
  tags?: string[];
  items: QuotationItem[];
  notes?: string;
  terms: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  conversionDate?: string;
  convertedToInvoiceId?: string;
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

export interface QuotationItemInput extends Omit<QuotationItem, 'id' | 'taxAmount' | 'amount'> {
  // Add any additional fields needed for input
}

export interface QuotationInput extends Omit<Quotation, 'id' | 'createdAt' | 'updatedAt' | 'clientName' | 'clientEmail' | 'convertedToInvoiceId' | 'acceptedAt' | 'rejectedAt' | 'conversionDate' | 'items'> {
  client: string; // Client ID for API
  items: QuotationItemInput[];
}

export const QUOTATION_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  CONVERTED: 'converted',
} as const;

export type QuotationStatus = typeof QUOTATION_STATUS[keyof typeof QUOTATION_STATUS];

export interface QuotationFilters {
  searchQuery: string;
  status: string;
  date: string;
  client: string;
  minAmount: number | '';
  maxAmount: number | '';
}
