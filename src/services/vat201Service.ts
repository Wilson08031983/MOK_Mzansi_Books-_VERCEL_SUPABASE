import { getInvoices } from './invoiceService';
import { formatCompanyForPdf } from '../utils/companyUtils';

export interface VAT201Data {
  period: string;
  startDate: string;
  endDate: string;
  outputVAT: {
    standardRated: number;
    zeroRated: number;
    exempt: number;
    exports: number;
    total: number;
  };
  inputVAT: {
    standardRated: number;
    capitalGoods: number;
    importVAT: number;
    total: number;
  };
  netVAT: number;
  vatNumber?: string;
  companyInfo?: any;
}

export interface VAT201Return {
  id: string;
  period: string;
  startDate: string;
  endDate: string;
  outputVAT: number;
  inputVAT: number;
  netVAT: number;
  createdAt: string;
  reference: string;
  status: 'draft' | 'submitted' | 'completed';
}

/**
 * Calculate VAT 201 data for a given period
 * @param startDate Start date of the period (YYYY-MM-DD)
 * @param endDate End date of the period (YYYY-MM-DD)
 * @returns VAT201Data object with calculated amounts
 */
export const calculateVAT201 = (startDate: string, endDate: string): VAT201Data => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Get all invoices for the period
  const invoices = getInvoices().filter(invoice => {
    const invoiceDate = new Date(invoice.date || invoice.invoiceDate);
    return invoiceDate >= start && invoiceDate <= end;
  });
  
  // Calculate Output VAT (VAT collected from sales)
  let outputVATTotal = 0;
  invoices.forEach(invoice => {
    if (invoice.vatRate && invoice.vatRate > 0) {
      // Calculate VAT amount from invoice
      const subtotal = invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0);
      const vatAmount = subtotal * (invoice.vatRate / 100);
      outputVATTotal += vatAmount;
    }
  });
  
  // For now, we'll assume all output VAT is standard-rated
  // In a real implementation, you'd categorize based on item types
  const outputVAT = {
    standardRated: outputVATTotal,
    zeroRated: 0,
    exempt: 0,
    exports: 0,
    total: outputVATTotal
  };
  
  // Calculate Input VAT (VAT paid on expenses)
  // Note: Current expense structure doesn't include VAT fields
  // This would need to be enhanced to track VAT on expenses
  const inputVAT = {
    standardRated: 0, // Would be calculated from expenses with VAT
    capitalGoods: 0,
    importVAT: 0,
    total: 0
  };
  
  // Calculate net VAT (Output VAT - Input VAT)
  const netVAT = outputVAT.total - inputVAT.total;
  
  // Get company information
  const companyInfo = formatCompanyForPdf();
  
  return {
    period: `${startDate} to ${endDate}`,
    startDate,
    endDate,
    outputVAT,
    inputVAT,
    netVAT,
    vatNumber: companyInfo.vatNumber || '',
    companyInfo
  };
};

/**
 * Parse period string to get start and end dates
 * Supports formats like "June 2025", "Q2 2025", "2025-06"
 */
export const parsePeriod = (period: string): { startDate: string; endDate: string } => {
  const currentYear = new Date().getFullYear();
  
  // Handle "Month YYYY" format (e.g., "June 2025")
  const monthYearMatch = period.match(/^(\w+)\s+(\d{4})$/);
  if (monthYearMatch) {
    const [, monthName, year] = monthYearMatch;
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
    const startDate = new Date(parseInt(year), monthIndex, 1);
    const endDate = new Date(parseInt(year), monthIndex + 1, 0); // Last day of month
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }
  
  // Handle "QX YYYY" format (e.g., "Q2 2025")
  const quarterMatch = period.match(/^Q([1-4])\s+(\d{4})$/);
  if (quarterMatch) {
    const [, quarter, year] = quarterMatch;
    const quarterNum = parseInt(quarter);
    const startMonth = (quarterNum - 1) * 3;
    const endMonth = startMonth + 2;
    
    const startDate = new Date(parseInt(year), startMonth, 1);
    const endDate = new Date(parseInt(year), endMonth + 1, 0); // Last day of quarter
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }
  
  // Handle "YYYY-MM" format
  const yearMonthMatch = period.match(/^(\d{4})-(\d{2})$/);
  if (yearMonthMatch) {
    const [, year, month] = yearMonthMatch;
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of month
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }
  
  // Default to current month if parsing fails
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

/**
 * Save VAT 201 return to localStorage
 */
export const saveVAT201Return = (vat201Data: VAT201Data, reference?: string): VAT201Return => {
  const returns = getVAT201Returns();
  
  const newReturn: VAT201Return = {
    id: `vat201-${Date.now()}`,
    period: vat201Data.period,
    startDate: vat201Data.startDate,
    endDate: vat201Data.endDate,
    outputVAT: vat201Data.outputVAT.total,
    inputVAT: vat201Data.inputVAT.total,
    netVAT: vat201Data.netVAT,
    createdAt: new Date().toISOString(),
    reference: reference || `VAT201-${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
    status: 'draft'
  };
  
  returns.push(newReturn);
  localStorage.setItem('vat201Returns', JSON.stringify(returns));
  
  return newReturn;
};

/**
 * Get all VAT 201 returns from localStorage
 */
export const getVAT201Returns = (): VAT201Return[] => {
  try {
    const stored = localStorage.getItem('vat201Returns');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading VAT 201 returns:', error);
    return [];
  }
};

/**
 * Delete VAT 201 return
 */
export const deleteVAT201Return = (id: string): boolean => {
  try {
    const returns = getVAT201Returns();
    const filtered = returns.filter(r => r.id !== id);
    localStorage.setItem('vat201Returns', JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting VAT 201 return:', error);
    return false;
  }
};

/**
 * Update VAT 201 return status
 */
export const updateVAT201Status = (id: string, status: VAT201Return['status']): boolean => {
  try {
    const returns = getVAT201Returns();
    const returnIndex = returns.findIndex(r => r.id === id);
    
    if (returnIndex >= 0) {
      returns[returnIndex].status = status;
      localStorage.setItem('vat201Returns', JSON.stringify(returns));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating VAT 201 status:', error);
    return false;
  }
};