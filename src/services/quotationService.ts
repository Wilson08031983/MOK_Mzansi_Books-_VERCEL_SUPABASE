// Quotation Type Definitions
export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  taxRate: number;
  discount: number;
  amount: number;
}

export interface Quotation {
  id: string;
  number: string;
  reference: string;
  client: string;
  clientId: string;
  clientEmail: string;
  clientContact: string;
  clientLogo: string;
  date: string;
  expiryDate: string;
  lastModified: string;
  amount: number;
  currency: string;
  language: string;
  status: string;
  salesperson: string;
  salespersonId: string;
  project: string;
  tags: string[];
  priority: string;
  customFields: Record<string, any>;
  items: QuotationItem[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  terms: string;
  notes: string;
  attachments: string[];
  revisionHistory: any[];
  viewedAt?: string | null;
  sentAt?: string | null;
  acceptedAt?: string | null;
}

import { safeLocalStorage, safeArray, safeString, safeNumber, defaultValues } from '@/utils/safeAccess';

// Mock quotations for initial data seeding
const mockQuotations: Quotation[] = [
  {
    id: '1',
    number: 'QUO-2024-001',
    reference: 'PROJECT-ALPHA',
    client: 'Tech Solutions Ltd',
    clientId: 'client-1',
    clientEmail: 'john@techsolutions.com',
    clientContact: 'John Smith',
    clientLogo: '',
    date: '2024-01-15',
    expiryDate: '2024-02-15',
    lastModified: '2024-01-16',
    amount: 25000,
    currency: 'ZAR',
    language: 'en',
    status: 'sent',
    salesperson: 'Sarah Johnson',
    salespersonId: 'user-1',
    project: 'Alpha Development',
    tags: ['urgent', 'development'],
    priority: 'high',
    customFields: {
      department: 'IT',
      region: 'Western Cape'
    },
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
      }
    ],
    subtotal: 20000,
    taxAmount: 3000,
    discount: 0,
    totalAmount: 25000,
    terms: 'Payment due within 30 days',
    notes: 'Initial development phase',
    attachments: [],
    revisionHistory: [],
    viewedAt: '2024-01-16T10:30:00Z',
    sentAt: '2024-01-15T14:20:00Z'
  },
  {
    id: '2',
    number: 'QUO-2024-002',
    reference: 'DESIGN-WORK',
    client: 'Creative Agency',
    clientId: 'client-2',
    clientEmail: 'sarah@creative.com',
    clientContact: 'Sarah Davis',
    clientLogo: '',
    date: '2024-01-14',
    expiryDate: '2024-02-14',
    lastModified: '2024-01-17',
    amount: 18500,
    currency: 'ZAR',
    language: 'en',
    status: 'accepted',
    salesperson: 'Michael Chen',
    salespersonId: 'user-2',
    project: 'Brand Redesign',
    tags: ['design', 'branding'],
    priority: 'medium',
    customFields: {
      department: 'Marketing',
      region: 'Gauteng'
    },
    items: [
      {
        id: 'item-2',
        description: 'Brand Design Package',
        quantity: 1,
        unit: 'package',
        rate: 15000,
        taxRate: 15,
        discount: 500,
        amount: 14500
      }
    ],
    subtotal: 14500,
    taxAmount: 2175,
    discount: 500,
    totalAmount: 18500,
    terms: 'Payment due within 15 days',
    notes: 'Brand guidelines included',
    attachments: [],
    revisionHistory: [],
    viewedAt: '2024-01-16T09:15:00Z',
    sentAt: '2024-01-14T11:30:00Z',
    acceptedAt: '2024-01-17T16:45:00Z'
  },
  {
    id: '3',
    number: 'QUO-2024-003',
    reference: 'GOV-CONTRACT',
    client: 'Government Dept',
    clientId: 'client-3',
    clientEmail: 'emily@gov.za',
    clientContact: 'Emily Johnson',
    clientLogo: '',
    date: '2024-01-12',
    expiryDate: '2024-01-20',
    lastModified: '2024-01-20',
    amount: 45000,
    currency: 'ZAR',
    language: 'en',
    status: 'expired',
    salesperson: 'David Wilson',
    salespersonId: 'user-3',
    project: 'Government Portal',
    tags: ['government', 'portal'],
    priority: 'high',
    customFields: {
      department: 'Public Sector',
      region: 'Western Cape'
    },
    items: [
      {
        id: 'item-3',
        description: 'Portal Development',
        quantity: 1,
        unit: 'project',
        rate: 40000,
        taxRate: 15,
        discount: 1000,
        amount: 39000
      }
    ],
    subtotal: 39000,
    taxAmount: 5850,
    discount: 1000,
    totalAmount: 45000,
    terms: 'Payment due within 45 days',
    notes: 'Government compliance required',
    attachments: [],
    revisionHistory: [],
    viewedAt: null,
    sentAt: '2024-01-12T08:00:00Z'
  }
];

// Local Storage Keys
const QUOTATIONS_STORAGE_KEY = 'mokMzansiBooks_quotations';

/**
 * Initialize quotations in localStorage with sample data if none exist
 * @returns array of quotations
 */
export const initializeQuotations = (): Quotation[] => {
  try {
    const storedQuotations = safeLocalStorage.getItem(QUOTATIONS_STORAGE_KEY, null);
    
    if (!storedQuotations) {
      safeLocalStorage.setItem(QUOTATIONS_STORAGE_KEY, mockQuotations);
      return mockQuotations;
    }
    
    return safeArray(storedQuotations);
  } catch (error) {
    console.error('Error initializing quotations:', error);
    return mockQuotations;
  }
};

/**
 * Get all quotations from localStorage
 * @returns array of quotations
 */
export const getQuotations = (): Quotation[] => {
  return initializeQuotations();
};

/**
 * Get a specific quotation by ID
 * @param id quotation ID
 * @returns quotation or undefined if not found
 */
export const getQuotationById = (id: string): Quotation | undefined => {
  const quotations = getQuotations();
  return quotations.find(quotation => quotation.id === id);
};

/**
 * Save a quotation to localStorage (create or update)
 * @param quotation quotation data
 * @returns updated quotations array
 */
export const saveQuotation = (quotation: Quotation): Quotation[] => {
  try {
    const quotations = getQuotations();
    const safeQuotation = { ...defaultValues.quotation, ...quotation };
    const index = quotations.findIndex(q => q.id === safeQuotation.id);
    
    if (index >= 0) {
      // Update existing quotation
      quotations[index] = { ...safeQuotation, lastModified: new Date().toISOString() };
    } else {
      // Add new quotation
      quotations.push({
        ...safeQuotation,
        id: safeQuotation.id || Date.now().toString(),
        lastModified: new Date().toISOString()
      });
    }
    
    safeLocalStorage.setItem(QUOTATIONS_STORAGE_KEY, quotations);
    return quotations;
  } catch (error) {
    console.error('Error saving quotation:', error);
    return getQuotations();
  }
};

/**
 * Delete a quotation from localStorage
 * @param id quotation ID to delete
 * @returns updated quotations array
 */
export const deleteQuotation = (id: string): Quotation[] => {
  try {
    const quotations = getQuotations();
    const safeId = safeString(id);
    const updatedQuotations = quotations.filter(quotation => quotation.id !== safeId);
    
    safeLocalStorage.setItem(QUOTATIONS_STORAGE_KEY, updatedQuotations);
    return updatedQuotations;
  } catch (error) {
    console.error('Error deleting quotation:', error);
    return getQuotations();
  }
};

/**
 * Update quotation status
 * @param id quotation ID
 * @param status new status
 * @returns updated quotations array
 */
export const updateQuotationStatus = (id: string, status: string): Quotation[] => {
  try {
    const quotations = getQuotations();
    const safeId = safeString(id);
    const safeStatus = safeString(status);
    const index = quotations.findIndex(q => q.id === safeId);
    
    if (index >= 0) {
      quotations[index] = { 
        ...quotations[index], 
        status: safeStatus, 
        lastModified: new Date().toISOString() 
      };
      safeLocalStorage.setItem(QUOTATIONS_STORAGE_KEY, quotations);
    }
    
    return quotations;
  } catch (error) {
    console.error('Error updating quotation status:', error);
    return getQuotations();
  }
};
