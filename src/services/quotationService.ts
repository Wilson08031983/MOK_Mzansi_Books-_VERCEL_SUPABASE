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
  clientContact?: string;
  clientLogo?: string;
  date: string;
  expiryDate?: string;
  lastModified?: string;
  amount: number;
  currency: string;
  language?: string;
  status: 'draft' | 'saved' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  salesperson?: string;
  salespersonId?: string;
  project?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  customFields?: Record<string, unknown>;
  items: QuotationItem[];
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  discount?: number;
  totalAmount?: number;
  terms?: string;
  notes?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  revisionHistory?: Array<{
    date: string;
    changes: string[];
    userId: string;
    userName: string;
  }>;
  // Timestamps for status changes
  viewedAt?: string | null;
  sentAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  expiredAt?: string | null;
  cancelledAt?: string | null;
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
    date: '2024-01-15',
    expiryDate: '2024-02-15',
    amount: 25000,
    currency: 'ZAR',
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
    attachments: [{
      name: 'specs.pdf',
      url: '/attachments/specs.pdf',
      type: 'application/pdf',
      size: 1024
    }],
    revisionHistory: [{
      date: '2024-01-16T10:30:00Z',
      changes: ['Created initial quotation'],
      userId: 'user-1',
      userName: 'Sarah Johnson'
    }],
    sentAt: '2024-01-15T14:20:00Z',
    viewedAt: '2024-01-16T10:30:00Z'
  },
  {
    id: '2',
    number: 'QUO-2024-002',
    reference: 'WEBSITE-REDESIGN',
    client: 'Acme Corp',
    clientId: 'client-2',
    clientEmail: 'jane@acmecorp.com',
    clientContact: 'Jane Doe',
    date: '2024-01-20',
    expiryDate: '2024-02-20',
    amount: 45000,
    currency: 'ZAR',
    status: 'accepted',
    salesperson: 'Mike Wilson',
    salespersonId: 'user-2',
    project: 'Website Redesign',
    tags: ['design', 'website'],
    priority: 'medium',
    customFields: {
      department: 'Marketing',
      region: 'Gauteng'
    },
    items: [
      {
        id: 'item-2a',
        description: 'Website Design',
        quantity: 1,
        unit: 'project',
        rate: 30000,
        taxRate: 15,
        discount: 0,
        amount: 30000
      },
      {
        id: 'item-2b',
        description: 'Content Migration',
        quantity: 1,
        unit: 'project',
        rate: 10000,
        taxRate: 15,
        discount: 0,
        amount: 10000
      }
    ],
    subtotal: 40000,
    taxAmount: 5000,
    discount: 0,
    totalAmount: 45000,
    terms: '50% deposit required',
    notes: 'Project kickoff next week',
    attachments: [{
      name: 'proposal.pdf',
      url: '/attachments/proposal.pdf',
      type: 'application/pdf',
      size: 2048
    }],
    revisionHistory: [
      {
        date: '2024-01-20T09:15:00Z',
        changes: ['Created initial quotation'],
        userId: 'user-2',
        userName: 'Mike Wilson'
      },
      {
        date: '2024-01-21T14:00:00Z',
        changes: ['Client accepted the quotation'],
        userId: 'client-2',
        userName: 'Jane Doe'
      }
    ],
    sentAt: '2024-01-20T09:15:00Z',
    viewedAt: '2024-01-20T11:30:00Z',
    acceptedAt: '2024-01-21T14:00:00Z'
  },
  {
    id: '3',
    number: 'QUO-2024-003',
    reference: 'GOV-CONTRACT',
    client: 'Government Dept',
    clientId: 'client-3',
    clientEmail: 'emily@gov.za',
    clientContact: 'Emily Johnson',
    date: '2024-01-12',
    expiryDate: '2024-01-20',
    amount: 45000,
    currency: 'ZAR',
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
    attachments: [{
      name: 'contract.pdf',
      url: '/attachments/contract.pdf',
      type: 'application/pdf',
      size: 3072
    }],
    revisionHistory: [{
      date: '2024-01-12T08:00:00Z',
      changes: ['Created initial quotation'],
      userId: 'user-3',
      userName: 'David Wilson'
    }],
    sentAt: '2024-01-12T08:00:00Z',
    viewedAt: null
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
// Default values for new quotations
const defaultQuotation: Partial<Quotation> = {
  date: new Date().toISOString().split('T')[0],
  currency: 'ZAR',
  status: 'draft',
  items: [],
  tags: [],
  customFields: {},
  attachments: [],
  revisionHistory: []
};

/**
 * Generate a new unique quotation number in the format QUO-YYYY-NNN
 * @returns string - The generated quotation number
 */
export const generateQuotationNumber = (): string => {
  try {
    const currentYear = new Date().getFullYear();
    const quotations = getQuotations();
    
    // Filter quotations from the current year and extract numbers
    const currentYearQuotations = quotations.filter(q => {
      const yearMatch = q.number?.match(/QUO-(\d{4})-(\d+)/);
      return yearMatch && parseInt(yearMatch[1]) === currentYear;
    });
    
    // Find the highest sequence number for current year
    let maxSequence = 0;
    currentYearQuotations.forEach(q => {
      const match = q.number?.match(/QUO-\d{4}-(\d+)/);
      if (match) {
        const sequence = parseInt(match[1]);
        if (sequence > maxSequence) {
          maxSequence = sequence;
        }
      }
    });
    
    // Increment the sequence and format with leading zeros
    const nextSequence = maxSequence + 1;
    return `QUO-${currentYear}-${nextSequence.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating quotation number:', error);
    // Fallback to a timestamp-based number if there's an error
    return `QUO-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;
  }
};

export const saveQuotation = (quotation: Quotation): Quotation[] => {
  try {
    const quotations = getQuotations();
    const now = new Date().toISOString();
    
    // Generate a new quotation number for new quotations if not provided
    const quotationNumber = quotation.number || generateQuotationNumber();
    
    // Create a safe quotation with defaults
    const safeQuotation: Quotation = {
      ...defaultQuotation,
      ...quotation,
      number: quotationNumber, // Use provided number or generated one
      lastModified: now,
      // Ensure items array exists and has required fields
      items: (quotation.items || []).map(item => ({
        id: item.id || crypto.randomUUID(),
        description: item.description || '',
        quantity: Number(item.quantity) || 0,
        unit: item.unit || 'unit',
        rate: Number(item.rate) || 0,
        taxRate: Number(item.taxRate) || 0,
        discount: Number(item.discount) || 0,
        amount: Number(item.amount) || 0
      }))
    };
    
    const index = quotations.findIndex(q => q.id === safeQuotation.id);
    
    if (index >= 0) {
      // Update existing quotation - preserve created date and number if they exist
      const createdDate = quotations[index].date || now;
      const existingNumber = quotations[index].number || quotationNumber;
      quotations[index] = { 
        ...safeQuotation,
        number: existingNumber, // Preserve existing number
        date: createdDate,
        lastModified: now 
      };
    } else {
      // Add new quotation with created date and generated number
      quotations.push({
        ...safeQuotation,
        id: safeQuotation.id || Date.now().toString(),
        number: quotationNumber, // Ensure new quotation has a number
        date: now, // Set creation date
        lastModified: now
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
// Type for valid status values
type QuotationStatus = Quotation['status'];

// Valid status values
const VALID_STATUSES: QuotationStatus[] = [
  'draft', 'saved', 'sent', 'viewed', 
  'accepted', 'rejected', 'expired', 'cancelled'
];

// Helper function to validate status
const isValidStatus = (status: string): status is QuotationStatus => {
  return VALID_STATUSES.includes(status as QuotationStatus);
};

export function updateQuotationStatus(id: string, status: string | QuotationStatus): Quotation[] {
  // Validate status parameter if it's a string
  if (typeof status === 'string' && !isValidStatus(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  
  // At this point, TypeScript knows status is QuotationStatus
  const validStatus = status as QuotationStatus;
  
  try {
    const quotations = getQuotations();
    const index = quotations.findIndex(q => q.id === id);
    
    if (index === -1) {
      throw new Error('Quotation not found');
    }
    
    const now = new Date().toISOString();
    const updatedQuotation: Quotation = {
      ...quotations[index],
      status: validStatus,
      lastModified: now
    };
    
    // Update status-specific timestamps
    switch (validStatus) {
      case 'sent':
        updatedQuotation.sentAt = updatedQuotation.sentAt || now;
        break;
      case 'viewed':
        updatedQuotation.viewedAt = now;
        break;
      case 'accepted':
        updatedQuotation.acceptedAt = now;
        break;
      case 'rejected':
        updatedQuotation.rejectedAt = now;
        break;
      case 'expired':
        updatedQuotation.expiredAt = now;
        break;
      case 'cancelled':
        updatedQuotation.cancelledAt = now;
        break;
      // 'draft' and 'saved' don't have specific timestamps
      case 'draft':
      case 'saved':
        break;
    }
    
    // Add to revision history
    const statusChange = {
      date: now,
      changes: [`Status changed to ${validStatus}`],
      userId: 'system', // In a real app, this would be the current user's ID
      userName: 'System'
    };
    
    updatedQuotation.revisionHistory = [
      ...(updatedQuotation.revisionHistory || []),
      statusChange
    ];
    
    quotations[index] = updatedQuotation;
    safeLocalStorage.setItem(QUOTATIONS_STORAGE_KEY, quotations);
    
    return quotations;
  } catch (error) {
    console.error('Error updating quotation status:', error);
    throw error;
  }
}
