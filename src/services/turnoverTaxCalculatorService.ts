/**
 * Turnover Tax Calculator Service
 * Handles bi-annual turnover tax calculations for South African SARS requirements
 * Uses local data sources (invoices, sales) and applies 2025/2026 tax brackets
 */

interface TurnoverTaxBracket {
  min: number;
  max: number | null;
  baseAmount: number;
  rate: number;
  description: string;
}

interface TurnoverSourceBreakdown {
  invoices: { count: number; total: number; items: any[] };
  sales: { count: number; total: number; items: any[] };
  manualAdjustments: { count: number; total: number; items: any[] };
  exclusions: { count: number; total: number; items: any[] };
}

interface TurnoverTaxCalculation {
  id: string;
  taxType: 'Turnover Tax';
  periodLabel: string;
  startDate: string;
  endDate: string;
  taxableTurnover: number;
  breakdown: TurnoverSourceBreakdown;
  applicableBracket: TurnoverTaxBracket;
  taxAmount: number;
  timestamp: string;
  isExempt: boolean;
}

interface TurnoverTaxPeriod {
  label: string;
  startDate: string;
  endDate: string;
  period: 'A' | 'B';
}

class TurnoverTaxCalculatorService {
  private readonly TAX_BRACKETS: TurnoverTaxBracket[] = [
    {
      min: 0,
      max: 335000,
      baseAmount: 0,
      rate: 0,
      description: 'R0 – R335,000 → 0% (Exempt)'
    },
    {
      min: 335001,
      max: 500000,
      baseAmount: 0,
      rate: 0.01,
      description: 'R335,001 – R500,000 → 1% on amount over R335,000'
    },
    {
      min: 500001,
      max: 750000,
      baseAmount: 1650,
      rate: 0.02,
      description: 'R500,001 – R750,000 → R1,650 + 2% on amount over R500,000'
    },
    {
      min: 750001,
      max: null,
      baseAmount: 6650,
      rate: 0.03,
      description: 'R750,001 and above → R6,650 + 3% on amount over R750,000'
    }
  ];

  private readonly STORAGE_KEY = 'turnoverTax.records';

  /**
   * Generate bi-annual tax periods for current SARS tax year (1 March - 28 Feb)
   */
  generateTaxPeriods(year: number = new Date().getFullYear()): TurnoverTaxPeriod[] {
    // SARS tax year runs from 1 March to 28/29 February
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const febEndDay = isLeapYear ? 29 : 28;
    
    return [
      {
        label: `Mar–Aug ${year}`,
        startDate: `${year}-03-01`,
        endDate: `${year}-08-31`,
        period: 'A'
      },
      {
        label: `Sep–Feb ${year}/${year + 1}`,
        startDate: `${year}-09-01`,
        endDate: `${year + 1}-02-${febEndDay}`,
        period: 'B'
      }
    ];
  }

  /**
   * Get current tax period based on today's date
   */
  getCurrentTaxPeriod(): TurnoverTaxPeriod {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-based month
    
    const periods = this.generateTaxPeriods(currentYear);
    
    // If we're in Jan-Feb, we're in period B of previous tax year
    if (currentMonth <= 2) {
      const prevYearPeriods = this.generateTaxPeriods(currentYear - 1);
      return prevYearPeriods[1]; // Period B
    }
    
    // If we're in Mar-Aug, we're in period A
    if (currentMonth >= 3 && currentMonth <= 8) {
      return periods[0]; // Period A
    }
    
    // If we're in Sep-Dec, we're in period B
    return periods[1]; // Period B
  }

  /**
   * Fetch invoices for the specified date range
   */
  private fetchInvoicesForPeriod(startDate: string, endDate: string): any[] {
    try {
      const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      return invoices.filter((invoice: any) => {
        const invoiceDate = new Date(invoice.date || invoice.createdAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return invoiceDate >= start && invoiceDate <= end && !invoice.excludeFromTurnover;
      });
    } catch (error) {
      console.warn('Error fetching invoices for turnover tax:', error);
      return [];
    }
  }

  /**
   * Fetch confirmed sales for the specified date range
   * Sales are confirmed when "Print Slip" or "Send to Invoice" is clicked
   */
  private fetchSalesForPeriod(startDate: string, endDate: string): any[] {
    try {
      // Get confirmed sales from income records (same logic as VAT201 service)
      const incomes = JSON.parse(localStorage.getItem('incomes') || '[]');
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const confirmedSales = incomes.filter((income: any) => {
        const incomeDate = new Date(income.date);
        const isInPeriod = incomeDate >= start && incomeDate <= end;
        
        // Check if this is a confirmed sales transaction (Print Slip or Send to Invoice)
        const isSalesTransaction = income.description && (
          income.description.includes('Sales Transaction - Print Slip') ||
          income.description.includes('Send to Invoice') ||
          income.notes === 'Auto-generated from sales transaction'
        );
        
        return isInPeriod && isSalesTransaction && !income.excludeFromTurnover;
      });
      
      console.log(`💰 [TurnoverTax] Found ${confirmedSales.length} confirmed sales in period ${startDate} to ${endDate}`);
      confirmedSales.forEach((sale: any, index: number) => {
        console.log(`  ${index + 1}. ${sale.description} - R${sale.amount} (${new Date(sale.date).toLocaleDateString()})`);
      });
      
      return confirmedSales;
    } catch (error) {
      console.warn('Error fetching confirmed sales for turnover tax:', error);
      return [];
    }
  }

  /**
   * Calculate taxable turnover from all sources
   */
  private calculateTaxableTurnover(startDate: string, endDate: string): TurnoverSourceBreakdown {
    const invoices = this.fetchInvoicesForPeriod(startDate, endDate);
    const sales = this.fetchSalesForPeriod(startDate, endDate);
    
    // Calculate totals
    const invoiceTotal = invoices.reduce((sum, inv) => sum + (inv.total || inv.amount || 0), 0);
    const salesTotal = sales.reduce((sum, sale) => sum + (sale.total || sale.amount || 0), 0);
    
    // Get manual adjustments (if any)
    const manualAdjustments = this.getManualAdjustments(startDate, endDate);
    const manualTotal = manualAdjustments.reduce((sum, adj) => sum + adj.amount, 0);
    
    // Get exclusions (if any)
    const exclusions = this.getExclusions(startDate, endDate);
    const exclusionTotal = exclusions.reduce((sum, exc) => sum + exc.amount, 0);

    return {
      invoices: { count: invoices.length, total: invoiceTotal, items: invoices },
      sales: { count: sales.length, total: salesTotal, items: sales },
      manualAdjustments: { count: manualAdjustments.length, total: manualTotal, items: manualAdjustments },
      exclusions: { count: exclusions.length, total: exclusionTotal, items: exclusions }
    };
  }

  /**
   * Get manual turnover adjustments for period
   */
  private getManualAdjustments(startDate: string, endDate: string): any[] {
    try {
      const adjustments = JSON.parse(localStorage.getItem('turnoverAdjustments') || '[]');
      return adjustments.filter((adj: any) => {
        const adjDate = new Date(adj.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return adjDate >= start && adjDate <= end;
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Get exclusions for period
   */
  private getExclusions(startDate: string, endDate: string): any[] {
    try {
      const exclusions = JSON.parse(localStorage.getItem('turnoverExclusions') || '[]');
      return exclusions.filter((exc: any) => {
        const excDate = new Date(exc.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return excDate >= start && excDate <= end;
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Find applicable tax bracket for given turnover amount
   */
  private findApplicableBracket(turnover: number): TurnoverTaxBracket {
    for (const bracket of this.TAX_BRACKETS) {
      if (turnover >= bracket.min && (bracket.max === null || turnover <= bracket.max)) {
        return bracket;
      }
    }
    return this.TAX_BRACKETS[0]; // Default to first bracket
  }

  /**
   * Calculate turnover tax amount based on brackets
   */
  private calculateTaxAmount(turnover: number, bracket: TurnoverTaxBracket): number {
    if (bracket.rate === 0) {
      return 0; // Exempt
    }

    const excessAmount = turnover - bracket.min + 1; // +1 because bracket.min is the last amount of previous bracket
    const tax = bracket.baseAmount + (excessAmount * bracket.rate);
    
    return Math.round(tax * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate turnover tax for a specific period
   */
  calculateTurnoverTax(startDate: string, endDate: string, periodLabel: string): TurnoverTaxCalculation {
    console.log(`🧮 [TurnoverTax] Calculating turnover tax for period: ${periodLabel}`);
    console.log(`📅 [TurnoverTax] Date range: ${startDate} to ${endDate}`);

    // Get taxable turnover breakdown
    const breakdown = this.calculateTaxableTurnover(startDate, endDate);
    const totalTurnover = breakdown.invoices.total + breakdown.sales.total + 
                         breakdown.manualAdjustments.total - breakdown.exclusions.total;

    console.log(`💰 [TurnoverTax] Taxable turnover breakdown:`, {
      invoices: `R${breakdown.invoices.total.toFixed(2)} (${breakdown.invoices.count} items)`,
      sales: `R${breakdown.sales.total.toFixed(2)} (${breakdown.sales.count} items)`,
      manualAdjustments: `R${breakdown.manualAdjustments.total.toFixed(2)} (${breakdown.manualAdjustments.count} items)`,
      exclusions: `R${breakdown.exclusions.total.toFixed(2)} (${breakdown.exclusions.count} items)`,
      totalTaxableTurnover: `R${totalTurnover.toFixed(2)}`
    });

    // Find applicable bracket and calculate tax
    const applicableBracket = this.findApplicableBracket(totalTurnover);
    const taxAmount = this.calculateTaxAmount(totalTurnover, applicableBracket);
    const isExempt = taxAmount === 0;

    console.log(`📊 [TurnoverTax] Tax calculation:`, {
      bracket: applicableBracket.description,
      taxAmount: `R${taxAmount.toFixed(2)}`,
      isExempt
    });

    const calculation: TurnoverTaxCalculation = {
      id: `tt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taxType: 'Turnover Tax',
      periodLabel,
      startDate,
      endDate,
      taxableTurnover: totalTurnover,
      breakdown,
      applicableBracket,
      taxAmount,
      timestamp: new Date().toISOString(),
      isExempt
    };

    // Log final calculation
    console.log(`✅ [TurnoverTax] Final calculation:`, {
      event: 'turnoverTax.calc',
      period: periodLabel,
      taxableTurnover: totalTurnover,
      taxAmount,
      sourceCounts: {
        invoices: breakdown.invoices.count,
        sales: breakdown.sales.count,
        manual: breakdown.manualAdjustments.count
      },
      timestamp: calculation.timestamp
    });

    return calculation;
  }

  /**
   * Save turnover tax calculation to localStorage
   */
  saveTurnoverTaxRecord(calculation: TurnoverTaxCalculation): void {
    try {
      const existingRecords = this.getTurnoverTaxRecords();
      const updatedRecords = [...existingRecords, calculation];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedRecords));
      
      console.log(`💾 [TurnoverTax] Saved record with ID: ${calculation.id}`);
    } catch (error) {
      console.error('Error saving turnover tax record:', error);
      throw new Error('Failed to save turnover tax calculation');
    }
  }

  /**
   * Get all saved turnover tax records
   */
  getTurnoverTaxRecords(): TurnoverTaxCalculation[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch (error) {
      console.warn('Error loading turnover tax records:', error);
      return [];
    }
  }

  /**
   * Get turnover tax record by ID
   */
  getTurnoverTaxRecord(id: string): TurnoverTaxCalculation | null {
    const records = this.getTurnoverTaxRecords();
    return records.find(record => record.id === id) || null;
  }

  /**
   * Delete turnover tax record
   */
  deleteTurnoverTaxRecord(id: string): boolean {
    try {
      const records = this.getTurnoverTaxRecords();
      const filteredRecords = records.filter(record => record.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredRecords));
      return true;
    } catch (error) {
      console.error('Error deleting turnover tax record:', error);
      return false;
    }
  }
}

export const turnoverTaxCalculatorService = new TurnoverTaxCalculatorService();
export type { TurnoverTaxCalculation, TurnoverTaxPeriod, TurnoverSourceBreakdown };
