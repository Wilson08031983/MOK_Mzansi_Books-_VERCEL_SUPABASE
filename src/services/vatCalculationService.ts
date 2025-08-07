/**
 * VAT Calculation Service
 * Handles VAT calculations and VAT201 return generation
 */

export interface VATCalculation {
  id: string;
  period: string;
  startDate: string;
  endDate: string;
  totalSales: number;
  totalPurchases: number;
  outputVAT: {
    invoices: number;
    sales: number;
    total: number;
  };
  inputVAT: {
    expenses: number;
    total: number;
  };
  netVAT: number;
  vatPayable: number;
  vatRefund: number;
  createdDate: string;
}

export interface VAT201Return {
  id: string;
  period: string;
  reference: string;
  dueDate: string;
  calculation: VATCalculation;
  status: 'draft' | 'submitted' | 'approved';
  submissionDate?: string;
  referenceNumber?: string;
}

export interface SlipVATExtraction {
  id: string;
  expenseId?: string;
  vatAmount: number;
  totalAmount: number;
  extractionDate: string;
  confidence: number;
}

class VATCalculationService {
  private static instance: VATCalculationService;
  private readonly VAT_CALCULATIONS_KEY = 'vat_calculations';
  private readonly VAT_RETURNS_KEY = 'vat201_returns';
  private readonly SLIP_VAT_EXTRACTIONS_KEY = 'slip_vat_extractions';
  private readonly STANDARD_VAT_RATE = 0.15; // 15% VAT rate for South Africa
  private readonly ZERO_VAT_RATE = 0.0; // 0%

  // Helper method to calculate invoice subtotal from items
  private calculateInvoiceSubtotal(items: any[]): number {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  }

  public static getInstance(): VATCalculationService {
    if (!VATCalculationService.instance) {
      VATCalculationService.instance = new VATCalculationService();
    }
    return VATCalculationService.instance;
  }

  /**
   * Calculate VAT Input (VAT collected by business)
   */
  private calculateVATInput(start: Date, end: Date): { invoices: number; sales: number; total: number } {
    let invoicesVAT = 0;
    let salesVAT = 0;

    try {
      // Get paid invoices VAT
      const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      console.log('Debug - All invoices:', invoices);
      
      const filteredInvoices = invoices.filter((invoice: any) => {
        const invoiceDate = new Date(invoice.date || invoice.invoiceDate);
        const isValidStatus = invoice.status !== 'draft' && invoice.status !== 'cancelled';
        const isInDateRange = invoiceDate >= start && invoiceDate <= end;
        console.log(`Debug - Invoice ${invoice.id}: status=${invoice.status}, date=${invoice.date || invoice.invoiceDate}, validStatus=${isValidStatus}, inRange=${isInDateRange}`);
        return isValidStatus && isInDateRange;
      });
      
      console.log('Debug - Filtered invoices:', filteredInvoices);
      
      invoicesVAT = filteredInvoices.reduce((total: number, invoice: any) => {
        // Use vatTotal if available, otherwise calculate from subtotal and vatRate
        let vatAmount = 0;
        if (invoice.vatTotal !== undefined) {
          vatAmount = invoice.vatTotal;
          console.log(`Debug - Using vatTotal for invoice ${invoice.id}: ${vatAmount}`);
        } else if (invoice.subtotal !== undefined && invoice.vatRate !== undefined) {
          vatAmount = invoice.subtotal * (invoice.vatRate / 100);
          console.log(`Debug - Calculated from subtotal for invoice ${invoice.id}: ${invoice.subtotal} * ${invoice.vatRate}% = ${vatAmount}`);
        } else if (invoice.items && Array.isArray(invoice.items)) {
          // Calculate from items if subtotal not available
          const subtotal = this.calculateInvoiceSubtotal(invoice.items);
          vatAmount = subtotal * ((invoice.vatRate || this.STANDARD_VAT_RATE * 100) / 100);
          console.log(`Debug - Calculated from items for invoice ${invoice.id}: ${subtotal} * ${invoice.vatRate || this.STANDARD_VAT_RATE * 100}% = ${vatAmount}`);
        }
        console.log(`Debug - Adding VAT amount ${vatAmount} to total ${total}`);
        return total + vatAmount;
      }, 0);
      
      console.log('Debug - Final invoices VAT:', invoicesVAT);

      // Get sales VAT from inventory
      const sales = JSON.parse(localStorage.getItem('sales') || '[]');
      salesVAT = sales
        .filter((sale: any) => {
          const saleDate = new Date(sale.date || sale.createdAt);
          return saleDate >= start && saleDate <= end;
        })
        .reduce((total: number, sale: any) => {
          const vatAmount = (sale.total || 0) * this.STANDARD_VAT_RATE;
          return total + vatAmount;
        }, 0);
    } catch (error) {
      console.error('Error calculating VAT Input:', error);
    }

    return {
      invoices: invoicesVAT,
      sales: salesVAT,
      total: invoicesVAT + salesVAT
    };
  }

  /**
   * Calculate VAT Output (VAT paid by business)
   */
  private calculateVATOutput(start: Date, end: Date): { expenses: number; total: number } {
    let expensesVAT = 0;

    try {
      // Get slip VAT extractions for the period
      const slipExtractions = this.getSlipVATExtractionsForPeriod(
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      );
      
      // Calculate VAT from slip extractions
      expensesVAT = slipExtractions.reduce((total: number, extraction: SlipVATExtraction) => {
        return total + (extraction.vatAmount || 0);
      }, 0);
      
      // Also check for manual expenses with VAT
      const manualExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      const categorizedExpenses = JSON.parse(localStorage.getItem('categorizedExpenses') || '[]');
      const allExpenses = [...manualExpenses, ...categorizedExpenses];
      
      // Add VAT from manual expenses that don't have slip extractions
      const manualVAT = allExpenses
        .filter((expense: any) => {
          const expenseDate = new Date(expense.date);
          const isInPeriod = expenseDate >= start && expenseDate <= end;
          // Only include if no slip extraction exists for this expense
          const hasSlipExtraction = slipExtractions.some(extraction => extraction.expenseId === expense.id);
          return isInPeriod && !hasSlipExtraction;
        })
        .reduce((total: number, expense: any) => {
          // Use extractedVAT property if it exists
          if (expense.extractedVAT) {
            return total + expense.extractedVAT;
          }
          return total;
        }, 0);
      
      expensesVAT += manualVAT;
      
      console.log('VAT Output calculation:', {
        slipExtractionsVAT: slipExtractions.reduce((total, extraction) => total + (extraction.vatAmount || 0), 0),
        manualVAT,
        totalExpensesVAT: expensesVAT,
        slipExtractionsCount: slipExtractions.length
      });
      
    } catch (error) {
      console.error('Error calculating VAT Output:', error);
    }

    return {
      expenses: expensesVAT,
      total: expensesVAT
    };
  }

  /**
   * Calculate VAT for a specific period
   */
  calculateVATForPeriod(startDate: string, endDate: string): VATCalculation {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate VAT Input (VAT collected by business)
    const vatInput = this.calculateVATInput(start, end);
    
    // Calculate VAT Output (VAT paid by business)
    const vatOutput = this.calculateVATOutput(start, end);
    
    // Calculate net VAT
    const netVAT = vatInput.total - vatOutput.total;
    
    const calculation: VATCalculation = {
      id: `vat-calc-${Date.now()}`,
      period: `${startDate} to ${endDate}`,
      startDate,
      endDate,
      totalSales: vatInput.invoices / this.STANDARD_VAT_RATE + vatInput.sales / this.STANDARD_VAT_RATE,
      totalPurchases: vatOutput.expenses / this.STANDARD_VAT_RATE,
      outputVAT: {
        invoices: vatInput.invoices,
        sales: vatInput.sales,
        total: vatInput.total
      },
      inputVAT: {
        expenses: vatOutput.expenses,
        total: vatOutput.total
      },
      netVAT,
      vatPayable: netVAT > 0 ? netVAT : 0,
      vatRefund: netVAT < 0 ? Math.abs(netVAT) : 0,
      createdDate: new Date().toISOString()
    };

    // Save calculation
    this.saveVATCalculation(calculation);

    return calculation;
  }

  /**
   * Generate VAT201 return from calculation
   */
  generateVAT201Return(calculation: VATCalculation): VAT201Return {
    const periodDate = new Date(calculation.endDate);
    const dueDate = new Date(periodDate);
    dueDate.setMonth(dueDate.getMonth() + 1);
    dueDate.setDate(25); // VAT returns are typically due on the 25th of the following month

    const vatReturn: VAT201Return = {
      id: `vat201-${Date.now()}`,
      period: calculation.period,
      reference: `VAT201-${periodDate.getFullYear()}-${String(periodDate.getMonth() + 1).padStart(2, '0')}`,
      dueDate: dueDate.toISOString().split('T')[0],
      calculation,
      status: 'draft',
      submissionDate: undefined,
      referenceNumber: undefined
    };

    this.saveVAT201Return(vatReturn);
    return vatReturn;
  }

  /**
   * Add slip VAT extraction
   */
  addSlipVATExtraction(extraction: SlipVATExtraction): void {
    try {
      const extractions = this.getAllSlipVATExtractions();
      extractions.push(extraction);
      localStorage.setItem(this.SLIP_VAT_EXTRACTIONS_KEY, JSON.stringify(extractions));
    } catch (error) {
      console.error('Error saving slip VAT extraction:', error);
    }
  }

  /**
   * Get slip VAT extractions for a period
   */
  private getSlipVATExtractionsForPeriod(startDate: string, endDate: string): SlipVATExtraction[] {
    const allExtractions = this.getAllSlipVATExtractions();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return allExtractions.filter(extraction => {
      const extractionDate = new Date(extraction.extractionDate);
      return extractionDate >= start && extractionDate <= end;
    });
  }

  /**
   * Get all slip VAT extractions
   */
  getAllSlipVATExtractions(): SlipVATExtraction[] {
    try {
      return JSON.parse(localStorage.getItem(this.SLIP_VAT_EXTRACTIONS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Save VAT calculation
   */
  private saveVATCalculation(calculation: VATCalculation): void {
    try {
      const calculations = this.getAllVATCalculations();
      const existingIndex = calculations.findIndex(c => c.id === calculation.id);
      
      if (existingIndex >= 0) {
        calculations[existingIndex] = calculation;
      } else {
        calculations.push(calculation);
      }
      
      localStorage.setItem(this.VAT_CALCULATIONS_KEY, JSON.stringify(calculations));
    } catch (error) {
      console.error('Error saving VAT calculation:', error);
    }
  }

  /**
   * Get all VAT calculations
   */
  getAllVATCalculations(): VATCalculation[] {
    try {
      return JSON.parse(localStorage.getItem(this.VAT_CALCULATIONS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Save VAT201 return
   */
  private saveVAT201Return(vatReturn: VAT201Return): void {
    try {
      const returns = this.getAllVAT201Returns();
      const existingIndex = returns.findIndex(r => r.id === vatReturn.id);
      
      if (existingIndex >= 0) {
        returns[existingIndex] = vatReturn;
      } else {
        returns.push(vatReturn);
      }
      
      localStorage.setItem(this.VAT_RETURNS_KEY, JSON.stringify(returns));
    } catch (error) {
      console.error('Error saving VAT201 return:', error);
    }
  }

  /**
   * Get all VAT201 returns
   */
  getAllVAT201Returns(): VAT201Return[] {
    try {
      return JSON.parse(localStorage.getItem(this.VAT_RETURNS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Update VAT201 return status
   */
  updateVAT201ReturnStatus(returnId: string, status: VAT201Return['status'], submissionDate?: string, referenceNumber?: string): void {
    const returns = this.getAllVAT201Returns();
    const vatReturn = returns.find(r => r.id === returnId);
    
    if (vatReturn) {
      vatReturn.status = status;
      if (submissionDate) vatReturn.submissionDate = submissionDate;
      if (referenceNumber) vatReturn.referenceNumber = referenceNumber;
      
      localStorage.setItem(this.VAT_RETURNS_KEY, JSON.stringify(returns));
    }
  }

  /**
   * Calculate VAT amount from VAT-inclusive total
   */
  calculateVATFromInclusive(inclusiveAmount: number): number {
    return (inclusiveAmount * this.STANDARD_VAT_RATE) / (1 + this.STANDARD_VAT_RATE);
  }

  /**
   * Calculate VAT-exclusive amount from VAT-inclusive total
   */
  calculateExclusiveFromInclusive(inclusiveAmount: number): number {
    return inclusiveAmount / (1 + this.STANDARD_VAT_RATE);
  }

  /**
   * Add VAT to an exclusive amount
   */
  addVATToExclusive(exclusiveAmount: number): number {
    return exclusiveAmount * (1 + this.STANDARD_VAT_RATE);
  }
}

const vatCalculationService = VATCalculationService.getInstance();
export default vatCalculationService;