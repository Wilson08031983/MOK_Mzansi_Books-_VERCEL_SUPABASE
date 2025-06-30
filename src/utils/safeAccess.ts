/**
 * Safe data access utilities to prevent crashes from null/undefined values
 */

// Safe object property access with default values
export const safeGet = <T>(
  obj: any,
  path: string,
  defaultValue: T
): T => {
  try {
    if (!obj || typeof obj !== 'object') {
      return defaultValue;
    }

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return defaultValue;
      }
      current = current[key];
    }

    return current !== null && current !== undefined ? current : defaultValue;
  } catch (error) {
    console.warn(`Safe access failed for path '${path}':`, error);
    return defaultValue;
  }
};

// Safe array access
export const safeArray = <T>(arr: T[] | null | undefined): T[] => {
  return Array.isArray(arr) ? arr : [];
};

// Safe string access
export const safeString = (str: string | null | undefined, defaultValue = ''): string => {
  return typeof str === 'string' ? str : defaultValue;
};

// Safe number access
export const safeNumber = (num: number | null | undefined, defaultValue = 0): number => {
  return typeof num === 'number' && !isNaN(num) ? num : defaultValue;
};

// Safe boolean access
export const safeBoolean = (bool: boolean | null | undefined, defaultValue = false): boolean => {
  return typeof bool === 'boolean' ? bool : defaultValue;
};

// Safe date access
export const safeDate = (date: string | Date | null | undefined, defaultValue?: Date): Date => {
  try {
    if (!date) {
      return defaultValue || new Date();
    }
    
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? (defaultValue || new Date()) : parsedDate;
  } catch (error) {
    console.warn('Safe date parsing failed:', error);
    return defaultValue || new Date();
  }
};

// Safe localStorage access
export const safeLocalStorage = {
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      if (typeof window === 'undefined') {
        return defaultValue;
      }
      
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Failed to get localStorage item '${key}':`, error);
      return defaultValue;
    }
  },

  setItem: (key: string, value: any): boolean => {
    try {
      if (typeof window === 'undefined') {
        return false;
      }
      
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Failed to set localStorage item '${key}':`, error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') {
        return false;
      }
      
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove localStorage item '${key}':`, error);
      return false;
    }
  }
};

// Safe JSON parsing
export const safeJsonParse = <T>(json: string, defaultValue: T): T => {
  try {
    if (!json || typeof json !== 'string') {
      return defaultValue;
    }
    
    return JSON.parse(json);
  } catch (error) {
    console.warn('Safe JSON parse failed:', error);
    return defaultValue;
  }
};

// Safe function execution
export const safeExecute = <T>(
  fn: () => T,
  defaultValue: T,
  context?: string
): T => {
  try {
    return fn();
  } catch (error) {
    console.warn(`Safe execution failed${context ? ` in ${context}` : ''}:`, error);
    return defaultValue;
  }
};

// Safe async function execution
export const safeExecuteAsync = async <T>(
  fn: () => Promise<T>,
  defaultValue: T,
  context?: string
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    console.warn(`Safe async execution failed${context ? ` in ${context}` : ''}:`, error);
    return defaultValue;
  }
};

// Validate required fields
export const validateRequired = (
  obj: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    const value = safeGet(obj, field, null);
    if (value === null || value === undefined || value === '') {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

// Safe email validation
export const isValidEmail = (email: string | null | undefined): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Safe URL validation
export const isValidUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Safe image loading check
export const isImageLoaded = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!src || typeof src !== 'string') {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
};

// Default values for common objects
export const defaultValues = {
  client: {
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    logo: '',
    contact: ''
  },
  company: {
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    logo: '',
    website: ''
  },
  quotationItem: {
    id: '',
    description: '',
    quantity: 1,
    unit: 'pcs',
    rate: 0,
    taxRate: 0,
    discount: 0,
    amount: 0
  },
  quotation: {
    id: '',
    number: '',
    reference: '',
    client: '',
    clientId: '',
    clientEmail: '',
    clientContact: '',
    clientLogo: '',
    date: new Date().toISOString(),
    expiryDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    amount: 0,
    currency: 'ZAR',
    language: 'en',
    status: 'draft',
    salesperson: '',
    salespersonId: '',
    project: '',
    tags: [],
    priority: 'medium',
    customFields: {},
    items: [],
    subtotal: 0,
    taxAmount: 0,
    discount: 0,
    totalAmount: 0,
    terms: '',
    notes: '',
    attachments: [],
    revisionHistory: []
  }
};