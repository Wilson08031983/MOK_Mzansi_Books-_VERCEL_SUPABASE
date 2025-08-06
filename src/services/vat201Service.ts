import { getInvoices } from './invoiceService';
import { formatCompanyForPdf } from '../utils/companyUtils';
import { slipOCRService } from './slipOCRService';
import vatCalculationService from './vatCalculationService';

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
  
  // Calculate Input VAT (VAT paid on expenses) from uploaded receipts
  let inputVATTotal = 0;
  
  try {
    // Use vatCalculationService to get the calculated VAT for the period
    const vatCalculation = vatCalculationService.calculateVATForPeriod(startDate, endDate);
    inputVATTotal = vatCalculation.inputVAT.total;
    
    console.log(`🧮 [VAT201] Using vatCalculationService - Input VAT: R${inputVATTotal.toFixed(2)}`);
    console.log(`🧮 [VAT201] VAT calculation details:`, {
      period: vatCalculation.period,
      inputVAT: vatCalculation.inputVAT,
      outputVAT: vatCalculation.outputVAT,
      netVAT: vatCalculation.netVAT
    });
    
    // Also get slip VAT extractions for detailed logging
    const slipExtractions = vatCalculationService.getAllSlipVATExtractions();
    const periodExtractions = slipExtractions.filter(extraction => {
      const extractionDate = new Date(extraction.extractionDate);
      return extractionDate >= start && extractionDate <= end;
    });
    
    console.log(`🧮 [VAT201] Found ${periodExtractions.length} slip VAT extractions in period`);
    periodExtractions.forEach(extraction => {
      console.log(`🧮 [VAT201] Extraction ${extraction.id}: VAT R${extraction.vatAmount}, Expense: ${extraction.expenseId}`);
    });
    
  } catch (error) {
    console.error('Error calculating Input VAT from vatCalculationService:', error);
    
    // Fallback to legacy method if vatCalculationService fails
    console.log('🧮 [VAT201] Falling back to legacy slipOCRService method');
    try {
      const allReceiptData = slipOCRService.getAllReceiptData();
      console.log(`🧮 [VAT201] Found ${allReceiptData.length} total receipts (legacy)`);
      
      const manualExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      const categorizedExpenses = JSON.parse(localStorage.getItem('categorizedExpenses') || '[]');
      const allExpenses = [...manualExpenses, ...categorizedExpenses];
      
      const periodExpenses = allExpenses.filter((expense: any) => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= start && expenseDate <= end;
      });
      
      let vatFoundCount = 0;
      periodExpenses.forEach((expense: any) => {
        const receipt = allReceiptData.find((r: any) => r.expenseId === expense.id);
        if (receipt && receipt.vatAmount && receipt.status === 'completed') {
          inputVATTotal += receipt.vatAmount;
          vatFoundCount++;
          console.log(`🧮 [VAT201] ✅ Added VAT R${receipt.vatAmount} from expense ${expense.id} (legacy)`);
        }
      });
      
      console.log(`🧮 [VAT201] Legacy calculation: ${vatFoundCount} receipts, Total: R${inputVATTotal.toFixed(2)}`);
    } catch (legacyError) {
      console.error('Error with legacy VAT calculation:', legacyError);
    }
  }
  
  const inputVAT = {
    standardRated: inputVATTotal,
    capitalGoods: 0, // Could be enhanced to categorize capital goods
    importVAT: 0,
    total: inputVATTotal
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
/**
 * Generate current South African VAT quarter information
 * South African VAT quarters: Jan-Feb, Mar-Apr, May-Jun, Jul-Aug, Sep-Oct, Nov-Dec
 */
export const getCurrentVATQuarter = (): { period: string; startDate: string; endDate: string; dueDate: string } => {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-based (0 = January)
  const currentYear = now.getFullYear();
  
  // Determine which VAT quarter we're in
  let quarterStartMonth: number;
  let quarterEndMonth: number;
  let quarterName: string;
  
  if (currentMonth >= 0 && currentMonth <= 1) { // Jan-Feb
    quarterStartMonth = 0; // January
    quarterEndMonth = 1; // February
    quarterName = 'Jan-Feb';
  } else if (currentMonth >= 2 && currentMonth <= 3) { // Mar-Apr
    quarterStartMonth = 2; // March
    quarterEndMonth = 3; // April
    quarterName = 'Mar-Apr';
  } else if (currentMonth >= 4 && currentMonth <= 5) { // May-Jun
    quarterStartMonth = 4; // May
    quarterEndMonth = 5; // June
    quarterName = 'May-Jun';
  } else if (currentMonth >= 6 && currentMonth <= 7) { // Jul-Aug
    quarterStartMonth = 6; // July
    quarterEndMonth = 7; // August
    quarterName = 'Jul-Aug';
  } else if (currentMonth >= 8 && currentMonth <= 9) { // Sep-Oct
    quarterStartMonth = 8; // September
    quarterEndMonth = 9; // October
    quarterName = 'Sep-Oct';
  } else { // Nov-Dec
    quarterStartMonth = 10; // November
    quarterEndMonth = 11; // December
    quarterName = 'Nov-Dec';
  }
  
  // Calculate start and end dates
  const startDate = new Date(currentYear, quarterStartMonth, 1);
  const endDate = new Date(currentYear, quarterEndMonth + 1, 0); // Last day of end month
  
  // Calculate due date (25th of the month following the quarter end)
  const dueDate = new Date(currentYear, quarterEndMonth + 1, 25);
  
  return {
    period: `${quarterName} ${currentYear}`,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0]
  };
};

/**
 * Get VAT quarter information for a specific date
 */
export const getVATQuarterForDate = (date: Date): { period: string; startDate: string; endDate: string; dueDate: string } => {
  const month = date.getMonth(); // 0-based
  const year = date.getFullYear();
  
  let quarterStartMonth: number;
  let quarterEndMonth: number;
  let quarterName: string;
  
  if (month >= 0 && month <= 1) { // Jan-Feb
    quarterStartMonth = 0;
    quarterEndMonth = 1;
    quarterName = 'Jan-Feb';
  } else if (month >= 2 && month <= 3) { // Mar-Apr
    quarterStartMonth = 2;
    quarterEndMonth = 3;
    quarterName = 'Mar-Apr';
  } else if (month >= 4 && month <= 5) { // May-Jun
    quarterStartMonth = 4;
    quarterEndMonth = 5;
    quarterName = 'May-Jun';
  } else if (month >= 6 && month <= 7) { // Jul-Aug
    quarterStartMonth = 6;
    quarterEndMonth = 7;
    quarterName = 'Jul-Aug';
  } else if (month >= 8 && month <= 9) { // Sep-Oct
    quarterStartMonth = 8;
    quarterEndMonth = 9;
    quarterName = 'Sep-Oct';
  } else { // Nov-Dec
    quarterStartMonth = 10;
    quarterEndMonth = 11;
    quarterName = 'Nov-Dec';
  }
  
  const startDate = new Date(year, quarterStartMonth, 1);
  const endDate = new Date(year, quarterEndMonth + 1, 0);
  const dueDate = new Date(year, quarterEndMonth + 1, 25);
  
  return {
    period: `${quarterName} ${year}`,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0]
  };
};

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