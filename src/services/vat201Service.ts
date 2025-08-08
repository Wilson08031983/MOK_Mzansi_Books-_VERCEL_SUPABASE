import { getInvoices } from './invoiceService';
import { formatCompanyForPdf } from '../utils/companyUtils';
import { slipOCRService } from './slipOCRService';
import vatCalculationService from './vatCalculationService';

// Constants
const VAT_RATE = 15; // 15% VAT rate for South Africa

// Helper function to parse different date formats
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  // Try standard Date parsing first
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Try to parse '7 August 2025' format
  const dayMonthYearMatch = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (dayMonthYearMatch) {
    const [, day, monthName, year] = dayMonthYearMatch;
    date = new Date(`${monthName} ${day}, ${year}`);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  return null;
};

// Helper function to check if a date is within a range
const isDateInRange = (dateStr: string, startDate: Date, endDate: Date): boolean => {
  const date = parseDate(dateStr);
  if (!date) return false;
  return date >= startDate && date <= endDate;
};

export interface VAT201Data {
  period: string;
  startDate: string;
  endDate: string;
  inputVAT: {
    standardRated: number;
    zeroRated: number;
    exempt: number;
    exports: number;
    total: number;
  };
  outputVAT: {
    standardRated: number;
    capitalGoods: number;
    importVAT: number;
    total: number;
  };
  // Additional breakdown for detailed reporting
  breakdown?: {
    invoiceVAT: number;
    salesVAT: number;
    expenseVAT: number;
    invoiceCount: number;
    salesCount: number;
    expenseCount: number;
  };
  netVAT: number;
  vatNumber?: string;
  companyInfo?: any;
  calculationTimestamp?: string; // Timestamp when calculation was performed
  // Summary for display
  summary?: {
    totalInputVAT: number;
    totalOutputVAT: number;
    netVATPayable: number;
    calculationDate: string;
  };
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
// Debug function to test VAT calculation - can be called from browser console
export const debugVATCalculation = () => {
  console.log('🔍 [VAT DEBUG] === DEBUGGING VAT CALCULATION ===');
  
  // Check localStorage data
  const invoicesStr = localStorage.getItem('invoices');
  const incomesStr = localStorage.getItem('incomes');
  const expensesStr = localStorage.getItem('expenses');
  
  console.log('🔍 [VAT DEBUG] LocalStorage contents:');
  console.log('- invoices exists:', !!invoicesStr);
  console.log('- incomes exists:', !!incomesStr);
  console.log('- expenses exists:', !!expensesStr);
  
  if (invoicesStr) {
    const invoices = JSON.parse(invoicesStr);
    console.log(`🔍 [VAT DEBUG] Found ${invoices.length} invoices`);
    
    invoices.forEach((invoice, index) => {
      console.log(`🔍 [VAT DEBUG] Invoice ${index + 1}:`, {
        id: invoice.id,
        number: invoice.number,
        date: invoice.date,
        status: invoice.status,
        vatAmount: invoice.vatAmount,
        vatTotal: invoice.vatTotal,
        total: invoice.total
      });
    });
    
    // Test with current VAT quarter
    const quarter = getCurrentVATQuarter();
    console.log('🔍 [VAT DEBUG] Current VAT quarter:', quarter);
    
    // Test calculation
    const result = calculateVAT201(quarter.startDate, quarter.endDate);
    console.log('🔍 [VAT DEBUG] VAT calculation result:', result);
  } else {
    console.log('🔍 [VAT DEBUG] No invoices found in localStorage');
  }
};

// Make debug function available globally
if (typeof window !== 'undefined') {
  (window as any).debugVATCalculation = debugVATCalculation;
}

export const calculateVAT201 = (startDateStr: string, endDateStr: string): VAT201Data => {
  console.log(`🧮 [VAT201] === STARTING FRESH VAT CALCULATION ===`);
  console.log(`🧮 [VAT201] Period: ${startDateStr} to ${endDateStr}`);
  
  // Parse start and end dates
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  // Clear any cached calculations
  localStorage.removeItem('vatCalculations');
  localStorage.removeItem('cachedVAT');
  localStorage.removeItem('vatCache');
  localStorage.removeItem('calculationCache');
  
  // Retrieve data from localStorage
  const invoicesStr = localStorage.getItem('invoices');
  const incomesStr = localStorage.getItem('incomes');
  const expensesStr = localStorage.getItem('expenses');
  const manualExpensesStr = localStorage.getItem('manual_expenses');
  
  console.log(`🧮 [VAT201] Raw data from localStorage:`);
  console.log(`- invoices: ${invoicesStr ? invoicesStr.substring(0, 100) + '...' : 'null'}`);
  console.log(`- incomes: ${incomesStr ? incomesStr.substring(0, 100) + '...' : 'null'}`);
  console.log(`- expenses: ${expensesStr ? expensesStr.substring(0, 100) + '...' : 'null'}`);
  console.log(`- manual_expenses: ${manualExpensesStr ? manualExpensesStr.substring(0, 100) + '...' : 'null'}`);
  
  let allInvoices = invoicesStr ? JSON.parse(invoicesStr) : [];
  let allIncomes = incomesStr ? JSON.parse(incomesStr) : [];
  let allExpenses = expensesStr ? JSON.parse(expensesStr) : [];
  let manualExpenses = manualExpensesStr ? JSON.parse(manualExpensesStr) : [];
  
  // Combine both expense sources
  allExpenses = [...allExpenses, ...manualExpenses];
  console.log(`🧮 [VAT201] Combined expenses: ${allExpenses.length} (${expensesStr ? JSON.parse(expensesStr).length : 0} from 'expenses' + ${manualExpenses.length} from 'manual_expenses')`);
  
  // Debug expense sources
  allExpenses.forEach((expense, index) => {
    console.log(`🧮 [VAT201] Expense ${index + 1}: ID=${expense.id}, Date=${expense.date}, Amount=${expense.amount}, HasReceipt=${expense.hasReceipt}, Source=${expense.source || 'unknown'}`);
  });
  
  // Use real data from the application - no sample data creation
  console.log(`🧮 [VAT201] Using real application data for VAT calculation.`);
  console.log(`🧮 [VAT201] Found ${allInvoices.length} invoices, ${allIncomes.length} income records, ${allExpenses.length} expenses`);
  
  // If no real data exists, show a message but don't create fake data
  if (allInvoices.length === 0 && allIncomes.length === 0) {
    console.log(`🧮 [VAT201] No real transaction data found. VAT calculation will show zero values.`);
    console.log(`🧮 [VAT201] To see VAT amounts, create real invoices or make sales through the inventory system.`);
  }
  console.log(`🧮 [VAT201] Using real data: ${allInvoices.length} invoices, ${allIncomes.length} incomes, ${allExpenses.length} expenses`);
  console.log(`🧮 [VAT201] Start Date Object: ${start.toISOString()}`);
  console.log(`🧮 [VAT201] End Date Object: ${end.toISOString()}`);
  console.log(`🧮 [VAT201] Calculation timestamp: ${new Date().toISOString()}`);
  
  // Debug: Log all invoice data to understand structure
  if (allInvoices.length > 0) {
    console.log(`🧮 [VAT201] === INVOICE DEBUG INFO ===`);
    
    // Count invoices by status
    const statusCounts = {};
    allInvoices.forEach(invoice => {
      const status = invoice.status || 'undefined';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    console.log(`🧮 [VAT201] Invoice status counts:`, statusCounts);
    
    allInvoices.forEach((invoice, index) => {
      console.log(`🧮 [VAT201] Invoice ${index + 1}:`, {
        id: invoice.id,
        number: invoice.number,
        date: invoice.date,
        status: invoice.status,
        vatAmount: invoice.vatAmount,
        vatTotal: invoice.vatTotal,
        total: invoice.total,
        subtotal: invoice.subtotal
      });
    });
    console.log(`🧮 [VAT201] === END INVOICE DEBUG ===`);
  }
  
  // Check invoice statuses for VAT calculation
  const validInvoicesForVAT = allInvoices.filter(inv => inv.status && inv.status !== 'cancelled' && inv.status !== 'void');
  console.log(`🧮 [VAT201] Found ${validInvoicesForVAT.length} valid invoices for VAT calculation out of ${allInvoices.length} total`);
  
  if (validInvoicesForVAT.length === 0 && allInvoices.length > 0) {
    console.log(`⚠️ [VAT201] WARNING: No valid invoices found for VAT calculation (excluding cancelled/void).`);
    console.log(`⚠️ [VAT201] Available statuses:`, [...new Set(allInvoices.map(inv => inv.status))]);
  }
  
  // Filter real invoices for the period (only paid invoices within the VAT period)
  const validInvoices = allInvoices.filter(invoice => {
    let invoiceDate;
    const rawDate = invoice.date;
    
    // Handle different date formats
    if (typeof rawDate === 'string') {
      // First, try to handle the specific format '7 August 2025'
      const dayMonthYearMatch = rawDate.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
      if (dayMonthYearMatch) {
        const [, day, monthName, year] = dayMonthYearMatch;
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const monthIndex = monthNames.findIndex(m => m.toLowerCase().startsWith(monthName.toLowerCase()));
        
        if (monthIndex !== -1) {
          invoiceDate = new Date(parseInt(year), monthIndex, parseInt(day));
        }
      } else {
        // Try standard date parsing (ISO format from real invoices)
        invoiceDate = new Date(rawDate);
      }
    } else if (rawDate instanceof Date) {
      invoiceDate = rawDate;
    }
    
    // Skip invalid dates
    if (!invoiceDate || isNaN(invoiceDate.getTime())) {
      console.log(`🧮 [VAT201] Skipping invoice with invalid date: ${rawDate}`);
      return false;
    }
    
    // Remove time component for date comparison
    const invoiceDateNoTime = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), invoiceDate.getDate());
    const startNoTime = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endNoTime = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    
    // Check if invoice date is within period
    // Note: SA VAT law requires VAT to be declared when invoice is issued (tax point), not when paid
    const isInPeriod = invoiceDateNoTime >= startNoTime && invoiceDateNoTime <= endNoTime;
    const isValidInvoice = invoice.status && invoice.status !== 'cancelled' && invoice.status !== 'void';
    
    // Debug logging for real invoices
    console.log(`🧮 [VAT201] Real Invoice ${invoice.number || invoice.id}:`);
    console.log(`  - Raw date: ${rawDate}`);
    console.log(`  - Parsed date: ${invoiceDate.toISOString()}`);
    console.log(`  - Date for comparison: ${invoiceDateNoTime.toISOString().split('T')[0]}`);
    console.log(`  - Period: ${startNoTime.toISOString().split('T')[0]} to ${endNoTime.toISOString().split('T')[0]}`);
    console.log(`  - In period: ${isInPeriod}`);
    console.log(`  - Status: ${invoice.status}`);
    console.log(`  - Is valid: ${isValidInvoice}`);
    console.log(`  - VAT amount: ${invoice.vatAmount || invoice.vatTotal || 0}`);
    
    if (isInPeriod && isValidInvoice) {
      console.log(`🧮 [VAT201] ✅ Valid real invoice ${invoice.number || invoice.id}: VAT R${invoice.vatAmount || invoice.vatTotal || 0}`);
    }
    
    return isInPeriod && isValidInvoice;
  });
  
  // Debug: Log filtered results
  console.log(`🧮 [VAT201] === FILTERING RESULTS ===`);
  console.log(`🧮 [VAT201] Total invoices: ${allInvoices.length}`);
  console.log(`🧮 [VAT201] Valid invoices (paid & in period): ${validInvoices.length}`);
  if (validInvoices.length > 0) {
    console.log(`🧮 [VAT201] Valid invoice IDs:`, validInvoices.map(inv => inv.id || inv.number));
  }
  console.log(`🧮 [VAT201] === END FILTERING RESULTS ===`);
  
  // Calculate VAT from invoices
  const invoiceVATTotal = validInvoices.reduce((total, invoice) => {
    // Try to get VAT amount from different possible properties
    let vatAmount = 0;
    
    // Helper function to safely parse numeric values from various formats
    const parseNumericValue = (value: any): number => {
      if (value === undefined || value === null) return 0;
      
      // If it's already a number, return it
      if (typeof value === 'number') return value;
      
      // If it's a string, try to parse it
      if (typeof value === 'string') {
        // Remove any currency symbols and commas
        const cleanedValue = value.replace(/[R$,\s]/g, '');
        return parseFloat(cleanedValue) || 0;
      }
      
      return 0;
    };
    
    if (invoice.vatTotal !== undefined && invoice.vatTotal !== null) {
      vatAmount = parseNumericValue(invoice.vatTotal);
    } else if (invoice.vatAmount !== undefined && invoice.vatAmount !== null) {
      vatAmount = parseNumericValue(invoice.vatAmount);
    } else if (invoice.tax !== undefined && invoice.tax !== null) {
      vatAmount = parseNumericValue(invoice.tax);
    } else if (invoice.total && invoice.subtotal) {
      // Calculate VAT as the difference between total and subtotal
      const total = parseNumericValue(invoice.total);
      const subtotal = parseNumericValue(invoice.subtotal);
      vatAmount = total - subtotal;
    }
    
    console.log(`🧮 [VAT201] Invoice ${invoice.id || invoice.number}: VAT Amount R${vatAmount.toFixed(2)}`);
    return total + vatAmount;
  }, 0);
  
  console.log(`🧮 [VAT201] Invoice VAT Total: R${invoiceVATTotal.toFixed(2)}`);

  
  // 2. Get VAT from confirmed sales (Print Slip / Send to Invoice)
  console.log(`🧮 [VAT201] Total income records in system: ${allIncomes.length}`);
  
  // Filter for real sales transactions that have been finalized
  const validSales = allIncomes.filter(income => {
    const incomeDate = parseDate(income.date);
    if (!incomeDate) {
      console.log(`🧮 [VAT201] Skipping income with invalid date: ${income.date}`);
      return false;
    }
    
    // Remove time component for date comparison
    const incomeDateNoTime = new Date(incomeDate.getFullYear(), incomeDate.getMonth(), incomeDate.getDate());
    const startNoTime = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endNoTime = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    
    // Check if income date is within period
    const isInPeriod = incomeDateNoTime >= startNoTime && incomeDateNoTime <= endNoTime;
    
    // Check if this is a finalized sales transaction (from Print Slip or Send to Invoice)
    const isSalesTransaction = income.description && (
      income.description.includes('Sales Transaction - Print Slip') ||
      income.description.includes('Send to Invoice') ||
      income.notes === 'Auto-generated from sales transaction'
    );
    
    // Debug logging for real sales
    console.log(`🧮 [VAT201] Real Income ${income.id}:`);
    console.log(`  - Date: ${incomeDate.toISOString()}`);
    console.log(`  - In period: ${isInPeriod}`);
    console.log(`  - Description: ${income.description || 'N/A'}`);
    console.log(`  - Notes: ${income.notes || 'N/A'}`);
    console.log(`  - Is sales transaction: ${isSalesTransaction}`);
    console.log(`  - Amount: ${income.amount}`);
    console.log(`  - VAT amount: ${income.vatAmount || 'N/A (will calculate from amount)'}`);
    
    if (isInPeriod && isSalesTransaction) {
      console.log(`🧮 [VAT201] ✅ Valid real sales transaction ${income.id}: Amount R${income.amount}`);
    }
    
    return isInPeriod && isSalesTransaction;
  });

  
  // Helper function to safely parse numeric values from various formats
  const parseNumericValue = (value: any): number => {
    if (value === undefined || value === null) return 0;
    
    // If it's already a number, return it
    if (typeof value === 'number') return value;
    
    // If it's a string, try to parse it
    if (typeof value === 'string') {
      // Remove any currency symbols and commas
      const cleanedValue = value.replace(/[R$,\s]/g, '');
      return parseFloat(cleanedValue) || 0;
    }
    
    return 0;
  };

  // Calculate VAT from sales (assuming 15% VAT rate for sales)
  const salesVATTotal = validSales.reduce((total, sale) => {
    // Calculate VAT from total amount (amount includes VAT)
    // VAT = amount * (VAT_RATE / (100 + VAT_RATE))
    const VAT_RATE = 15; // 15% VAT rate
    
    // Check if the sale has a specific VAT amount
    let vatAmount = 0;
    
    if (sale.vatAmount !== undefined && sale.vatAmount !== null) {
      vatAmount = parseNumericValue(sale.vatAmount);
    } else if (sale.tax !== undefined && sale.tax !== null) {
      vatAmount = parseNumericValue(sale.tax);
    } else {
      // Calculate VAT from total amount (amount includes VAT)
      const saleAmount = parseNumericValue(sale.amount);
      vatAmount = saleAmount * (VAT_RATE / (100 + VAT_RATE));
    }
    
    console.log(`🧮 [VAT201] Sales ${sale.id}: Total R${parseNumericValue(sale.amount).toFixed(2)}, VAT R${vatAmount.toFixed(2)}`);
    return total + vatAmount;
  }, 0);
  
  console.log(`🧮 [VAT201] Sales VAT Total: R${salesVATTotal.toFixed(2)}`);

  // ===== CALCULATE OUTPUT VAT (VAT paid on purchases) =====
  
  // Get VAT from expenses (receipts with VAT)
  console.log(`🧮 [VAT201] Total expense records in system: ${allExpenses.length}`);
  
  // Filter real expenses for the period (only expenses with receipts containing VAT)
  const validExpenses = allExpenses.filter(expense => {
    
    let expenseDate;
    const rawDate = expense.date;
    
    // Handle different date formats
    if (typeof rawDate === 'string') {
      // First, try to handle the specific format '7 August 2025'
      const dayMonthYearMatch = rawDate.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
      if (dayMonthYearMatch) {
        const [, day, monthName, year] = dayMonthYearMatch;
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const monthIndex = monthNames.findIndex(m => m.toLowerCase().startsWith(monthName.toLowerCase()));
        
        if (monthIndex !== -1) {
          expenseDate = new Date(parseInt(year), monthIndex, parseInt(day));
        }
      } else {
        // Try standard date parsing
        expenseDate = new Date(rawDate);
      }
    } else if (rawDate instanceof Date) {
      expenseDate = rawDate;
    }
    
    // Skip invalid dates
    if (!expenseDate || isNaN(expenseDate.getTime())) {
      console.log(`🧮 [VAT201] Skipping expense with invalid date: ${rawDate}`);
      return false;
    }
    
    // Remove time component for date comparison
    const expenseDateNoTime = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), expenseDate.getDate());
    const startNoTime = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endNoTime = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    
    // Check if expense date is within period
    const isInPeriod = expenseDateNoTime >= startNoTime && expenseDateNoTime <= endNoTime;
    
    // Check for receipts in multiple ways (for VAT claims)
    const hasReceiptFlag = expense.hasReceipt === true;
    const hasReceiptFile = expense.receipt && expense.receipt.length > 0;
    const hasOCRReceipt = slipOCRService.getReceiptData(expense.id) !== null;
    const hasReceipt = hasReceiptFlag || hasReceiptFile || hasOCRReceipt;
    
    // Debug logging for real expenses
    console.log(`🧮 [VAT201] Real Expense ${expense.id}:`);
    console.log(`  - Raw date: ${rawDate}`);
    console.log(`  - Parsed date: ${expenseDate.toISOString()}`);
    console.log(`  - Date for comparison: ${expenseDateNoTime.toISOString().split('T')[0]}`);
    console.log(`  - Period: ${startNoTime.toISOString().split('T')[0]} to ${endNoTime.toISOString().split('T')[0]}`);
    console.log(`  - In period: ${isInPeriod}`);
    console.log(`  - Has receipt flag: ${hasReceiptFlag}`);
    console.log(`  - Has receipt file: ${hasReceiptFile}`);
    console.log(`  - Has OCR receipt: ${hasOCRReceipt}`);
    console.log(`  - Final has receipt: ${hasReceipt}`);
    console.log(`  - Amount: ${expense.amount}`);
    console.log(`  - VAT amount: ${expense.vatAmount || 'N/A (will calculate from amount)'}`);
    
    if (isInPeriod && hasReceipt) {
      console.log(`🧮 [VAT201] ✅ Valid real expense with receipt ${expense.id}: Amount R${expense.amount}`);
    } else if (isInPeriod && !hasReceipt) {
      console.log(`🧮 [VAT201] ❌ Expense ${expense.id} in period but no receipt found`);
    }
    
    return isInPeriod && hasReceipt;
  });
  
  // Calculate VAT from expenses (assuming 15% VAT rate for expenses with receipts)
  const expenseVATTotal = validExpenses.reduce((total, expense) => {
    // Check if the expense has a specific VAT amount
    let vatAmount = 0;
    
    if (expense.vatAmount !== undefined && expense.vatAmount !== null) {
      vatAmount = parseNumericValue(expense.vatAmount);
    } else if (expense.tax !== undefined && expense.tax !== null) {
      vatAmount = parseNumericValue(expense.tax);
    } else if (expense.taxAmount !== undefined && expense.taxAmount !== null) {
      vatAmount = parseNumericValue(expense.taxAmount);
    } else {
      // Calculate VAT from total amount (amount includes VAT)
      // VAT = amount * (VAT_RATE / (100 + VAT_RATE))
      const VAT_RATE = 15; // 15% VAT rate
      const expenseAmount = parseNumericValue(expense.amount);
      vatAmount = expenseAmount * (VAT_RATE / (100 + VAT_RATE));
    }
    
    console.log(`🧮 [VAT201] Expense ${expense.id}: Total R${parseNumericValue(expense.amount).toFixed(2)}, VAT R${vatAmount.toFixed(2)}`);
    return total + vatAmount;
  }, 0);
  
  console.log(`🧮 [VAT201] Expense VAT Total (Output VAT): R${expenseVATTotal.toFixed(2)}`);


  
  // ===== FINAL CALCULATIONS =====
  
  // Total Input VAT (VAT collected from sales and invoices)
  const totalInputVAT = invoiceVATTotal + salesVATTotal;
  console.log(`🧮 [VAT201] Total Input VAT: R${totalInputVAT.toFixed(2)} (Invoices: R${invoiceVATTotal} + Sales: R${salesVATTotal.toFixed(2)})`);
  
  // Total Output VAT (VAT paid on purchases)
  const totalOutputVAT = expenseVATTotal;
  console.log(`🧮 [VAT201] Total Output VAT: R${totalOutputVAT.toFixed(2)}`);
  
  // Net VAT (Input VAT - Output VAT)
  const netVAT = totalInputVAT - totalOutputVAT;
  console.log(`🧮 [VAT201] Net VAT: R${netVAT.toFixed(2)} (Input: R${totalInputVAT.toFixed(2)} - Output: R${totalOutputVAT.toFixed(2)})`);
  
  // Structure the result
  const inputVAT = {
    standardRated: isNaN(totalInputVAT) ? 0 : totalInputVAT,
    zeroRated: 0,
    exempt: 0,
    exports: 0,
    total: isNaN(totalInputVAT) ? 0 : totalInputVAT
  };
  
  const outputVAT = {
    standardRated: isNaN(totalOutputVAT) ? 0 : totalOutputVAT,
    capitalGoods: 0,
    importVAT: 0,
    total: isNaN(totalOutputVAT) ? 0 : totalOutputVAT
  };
  
  // Create detailed breakdown for UI display
  const breakdown = {
    invoiceVAT: invoiceVATTotal,
    salesVAT: salesVATTotal,
    expenseVAT: expenseVATTotal,
    invoiceCount: validInvoices.length,
    salesCount: validSales.length,
    expenseCount: validExpenses.length
  };
  
  console.log(`🧮 [VAT201] Final Input VAT breakdown:`, inputVAT);
  console.log(`🧮 [VAT201] Final Output VAT breakdown:`, outputVAT);
  console.log(`🧮 [VAT201] Detailed breakdown:`, breakdown);
  
  // Get company information
  const companyInfo = formatCompanyForPdf();
  
  // Add calculation timestamp
  const calculationTimestamp = new Date().toISOString();
  
  // Create summary for display
  const summary = {
    totalInputVAT,
    totalOutputVAT,
    netVATPayable: netVAT,
    calculationDate: new Date().toLocaleString()
  };
  
  const result = {
    period: `${startDateStr} to ${endDateStr}`,
    startDate: startDateStr,
    endDate: endDateStr,
    outputVAT,
    inputVAT,
    netVAT: isNaN(netVAT) ? 0 : netVAT,
    vatNumber: companyInfo.vatNumber || '',
    companyInfo,
    calculationTimestamp,
    breakdown,
    summary
  };
  
  console.log(`🧮 [VAT201] Returning final result:`, result);
  return result;
};

/**
 * Parse period string to get start and end dates
 * Supports formats like "June 2025", "Q2 2025", "2025-06", "Jul-Aug 2025"
 */
export const parsePeriod = (period: string): { period: string; startDate: string; endDate: string; dueDate: string } => {
  console.log(`🔍 [parsePeriod] Parsing period: ${period}`);
  
  // Handle "Month-Month Year" format (e.g., "Jul-Aug 2025" or "Jul - Aug 2025")
  const biMonthMatch = period.match(/([a-zA-Z]{3})\s*-\s*([a-zA-Z]{3})\s+(\d{4})/i);
  if (biMonthMatch) {
    const [, startMonthStr, endMonthStr, year] = biMonthMatch;
    
    // Convert month names to numbers (0-based)
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const startMonth = monthNames.findIndex(m => m.toLowerCase() === startMonthStr.toLowerCase());
    const endMonth = monthNames.findIndex(m => m.toLowerCase() === endMonthStr.toLowerCase());
    
    if (startMonth !== -1 && endMonth !== -1) {
      const startDate = new Date(parseInt(year), startMonth, 1);
      const endDate = new Date(parseInt(year), endMonth + 1, 0); // Last day of end month
      const dueDate = new Date(parseInt(year), endMonth + 1, 25); // 25th of next month
      
      return {
        period,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0]
      };
    }
  }
  
  // Handle "Q# YYYY" format (e.g., "Q1 2025")
  const quarterMatch = period.match(/Q([1-4])\s+(\d{4})/i);
  if (quarterMatch) {
    const [, quarter, year] = quarterMatch;
    let startMonth: number;
    let endMonth: number;
    
    switch (quarter) {
      case '1': startMonth = 0; endMonth = 2; break; // Jan-Mar
      case '2': startMonth = 3; endMonth = 5; break; // Apr-Jun
      case '3': startMonth = 6; endMonth = 8; break; // Jul-Sep
      case '4': startMonth = 9; endMonth = 11; break; // Oct-Dec
      default: startMonth = 0; endMonth = 2; // Default to Q1
    }
    
    const startDate = new Date(parseInt(year), startMonth, 1);
    const endDate = new Date(parseInt(year), endMonth + 1, 0); // Last day of quarter
    const dueDate = new Date(parseInt(year), endMonth + 1, 25); // 25th of next month
    
    return {
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0]
    };
  }
  
  // Handle "YYYY/MM" or "MM/YYYY" format
  const yearMonthSlashMatch = period.match(/^(\d{4})\/(\d{1,2})$|^(\d{1,2})\/(\d{4})$/);
  if (yearMonthSlashMatch) {
    const [, yearFirst, monthFirst, monthSecond, yearSecond] = yearMonthSlashMatch;
    
    const year = yearFirst || yearSecond;
    const month = (monthFirst || monthSecond) as string;
    const monthNum = parseInt(month) - 1; // Convert to 0-based
    
    const startDate = new Date(parseInt(year), monthNum, 1);
    const endDate = new Date(parseInt(year), monthNum + 1, 0); // Last day of month
    const dueDate = new Date(parseInt(year), monthNum + 1, 25); // 25th of next month
    
    return {
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0]
    };
  }
  
  // Handle "YYYY-MM" format
  const yearMonthMatch = period.match(/^(\d{4})-(\d{2})$/);
  if (yearMonthMatch) {
    const [, year, month] = yearMonthMatch;
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of month
    const dueDate = new Date(parseInt(year), parseInt(month), 25); // 25th of month
    
    return {
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0]
    };
  }
  
  // Handle "Month Year" format (e.g., "August 2025")
  const monthYearMatch = period.match(/([a-zA-Z]+)\s+(\d{4})/i);
  if (monthYearMatch) {
    const [, monthStr, year] = monthYearMatch;
    
    // Convert month name to number (0-based)
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const monthAbbr = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ];
    
    let monthNum = monthNames.findIndex(m => m.toLowerCase() === monthStr.toLowerCase());
    if (monthNum === -1) {
      monthNum = monthAbbr.findIndex(m => m.toLowerCase() === monthStr.toLowerCase().substring(0, 3));
    }
    
    if (monthNum !== -1) {
      const startDate = new Date(parseInt(year), monthNum, 1);
      const endDate = new Date(parseInt(year), monthNum + 1, 0); // Last day of month
      const dueDate = new Date(parseInt(year), monthNum + 1, 25); // 25th of next month
      
      return {
        period,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0]
      };
    }
  }
  
  // Default to current month if parsing fails
  console.log(`⚠️ [parsePeriod] No pattern matched, using current month`);
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 25);
  
  return {
    period: `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0]
  };
};

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