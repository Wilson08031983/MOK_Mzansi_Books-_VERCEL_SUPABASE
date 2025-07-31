/**
 * VAT Calculation Service
 * Handles comprehensive VAT calculations for VAT 201 returns
 * Extracts VAT from expenses, invoices, sales, and OCR-processed slips
 */

import expenseStorageService from './expenseStorageService';

export interface VATSource {
  id: string;
  description: string;
  amount: number;
  vatAmount: number;
  vatRate: number;
  date: string;
  source: 'expense' | 'invoice' | 'sale' | 'slip';
  category: string;
  reference?: string;
}

export interface VATCalculation {
  period: string;
  startDate: string;
  endDate: string;
  
  // Output VAT (VAT collected)
  outputVAT: {
    standardRated: VATSource[];
    zeroRated: VATSource[];
    exempt: VATSource[];
    exports: VATSource[];
    slipVAT: VATSource[];
    total: number;
  };
  
  // Input VAT (VAT paid)
  inputVAT: {
    standardRated: VATSource[];
    capitalGoods: VATSource[];
    imports: VATSource[];
    other: VATSource[];
    total: number;
  };
  
  // Final calculation
  netVAT: number;
  vatPayable: number;
  vatRefund: number;
  
  // Metadata
  calculatedAt: string;
  companyId: string;
}

export interface VAT201Return {
  id: string;
  period: string;
  dueDate: string;
  calculation: VATCalculation;
  status: 'draft' | 'pending' | 'submitted' | 'overdue';
  reference: string;
  createdAt: string;
  updatedAt: string;
  pdfGenerated?: boolean;
  pdfPath?: string;
}

class VATCalculationService {
  private readonly STORAGE_KEY = 'vat_calculations';
  private readonly VAT201_STORAGE_KEY = 'vat201_returns';
  private readonly SLIP_VAT_STORAGE_KEY = 'slip_vat_extractions';
  private readonly STANDARD_VAT_RATE = 0.15; // 15% South African VAT rate

  /**
   * Calculate VAT for a specific period
   */
  calculateVATForPeriod(startDate: string, endDate: string, companyId: string = 'default'): VATCalculation {
    const period = this.formatPeriod(startDate, endDate);
    
    // Get all VAT sources for the period
    const outputVATSources = this.getOutputVATSources(startDate, endDate);
    const inputVATSources = this.getInputVATSources(startDate, endDate);
    
    // Calculate totals
    const outputVATTotal = this.calculateTotal(outputVATSources);
    const inputVATTotal = this.calculateTotal(inputVATSources);
    
    const netVAT = outputVATTotal - inputVATTotal;
    
    const calculation: VATCalculation = {
      period,
      startDate,
      endDate,
      outputVAT: {
        standardRated: outputVATSources.filter(s => s.vatRate === this.STANDARD_VAT_RATE),
        zeroRated: outputVATSources.filter(s => s.vatRate === 0),
        exempt: [],
        exports: [],
        slipVAT: outputVATSources.filter(s => s.source === 'slip'),
        total: outputVATTotal
      },
      inputVAT: {
        standardRated: inputVATSources.filter(s => s.vatRate === this.STANDARD_VAT_RATE),
        capitalGoods: inputVATSources.filter(s => s.category.toLowerCase().includes('capital')),
        imports: inputVATSources.filter(s => s.category.toLowerCase().includes('import')),
        other: inputVATSources.filter(s => !s.category.toLowerCase().includes('capital') && !s.category.toLowerCase().includes('import')),
        total: inputVATTotal
      },
      netVAT,
      vatPayable: netVAT > 0 ? netVAT : 0,
      vatRefund: netVAT < 0 ? Math.abs(netVAT) : 0,
      calculatedAt: new Date().toISOString(),
      companyId
    };
    
    // Save calculation
    this.saveVATCalculation(calculation);
    
    return calculation;
  }

  /**
   * Get Output VAT sources (VAT collected from sales/invoices)
   */
  private getOutputVATSources(startDate: string, endDate: string): VATSource[] {
    const sources: VATSource[] = [];
    
    // Get VAT from invoices
    const invoices = this.getInvoicesForPeriod(startDate, endDate);
    invoices.forEach(invoice => {
      if (invoice.vatAmount && invoice.vatAmount > 0) {
        sources.push({
          id: `invoice-${invoice.id}`,
          description: `Invoice ${invoice.invoiceNumber} - ${invoice.clientName}`,
          amount: invoice.subtotal || 0,
          vatAmount: invoice.vatAmount,
          vatRate: this.STANDARD_VAT_RATE,
          date: invoice.date,
          source: 'invoice',
          category: 'Standard Rated Sales',
          reference: invoice.invoiceNumber
        });
      }
    });
    
    // Get VAT from sales transactions
    const sales = this.getSalesForPeriod(startDate, endDate);
    sales.forEach(sale => {
      if (sale.vatAmount && sale.vatAmount > 0) {
        sources.push({
          id: `sale-${sale.id}`,
          description: `Sale - ${sale.description}`,
          amount: sale.amount,
          vatAmount: sale.vatAmount,
          vatRate: this.STANDARD_VAT_RATE,
          date: sale.date,
          source: 'sale',
          category: 'Standard Rated Sales',
          reference: sale.reference
        });
      }
    });
    
    // Get VAT from OCR-processed slips
    const slipVAT = this.getSlipVATForPeriod(startDate, endDate);
    slipVAT.forEach(slip => {
      sources.push({
        id: `slip-${slip.id}`,
        description: `Slip VAT - ${slip.description}`,
        amount: slip.amount,
        vatAmount: slip.vatAmount,
        vatRate: this.STANDARD_VAT_RATE,
        date: slip.date,
        source: 'slip',
        category: 'OCR Extracted VAT',
        reference: slip.reference
      });
    });
    
    return sources;
  }

  /**
   * Get Input VAT sources (VAT paid on expenses)
   */
  private getInputVATSources(startDate: string, endDate: string): VATSource[] {
    const sources: VATSource[] = [];
    
    // Get VAT from expenses
    const expenses = expenseStorageService.getExpensesByDateRange(startDate, endDate);
    expenses.forEach(expense => {
      // Calculate VAT from expense amount (assuming VAT inclusive)
      const vatAmount = this.calculateVATFromInclusive(expense.amount);
      if (vatAmount > 0) {
        sources.push({
          id: `expense-${expense.id}`,
          description: expense.description,
          amount: expense.amount - vatAmount, // Exclude VAT from base amount
          vatAmount,
          vatRate: this.STANDARD_VAT_RATE,
          date: expense.date,
          source: 'expense',
          category: expense.category,
          reference: expense.id
        });
      }
    });
    
    return sources;
  }

  /**
   * Calculate VAT amount from VAT-inclusive amount
   */
  private calculateVATFromInclusive(inclusiveAmount: number): number {
    return (inclusiveAmount * this.STANDARD_VAT_RATE) / (1 + this.STANDARD_VAT_RATE);
  }

  /**
   * Calculate VAT amount from VAT-exclusive amount
   */
  private calculateVATFromExclusive(exclusiveAmount: number): number {
    return exclusiveAmount * this.STANDARD_VAT_RATE;
  }

  /**
   * Calculate total VAT from sources
   */
  private calculateTotal(sources: VATSource[]): number {
    return sources.reduce((total, source) => total + source.vatAmount, 0);
  }

  /**
   * Format period string
   */
  private formatPeriod(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleString('default', { month: 'long' })} ${start.getFullYear()}`;
    }
    
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }

  /**
   * Get invoices for period (placeholder - integrate with actual invoice service)
   */
  private getInvoicesForPeriod(startDate: string, endDate: string): any[] {
    try {
      const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      return invoices.filter((invoice: any) => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
      });
    } catch {
      return [];
    }
  }

  /**
   * Get sales for period (placeholder - integrate with actual sales service)
   */
  private getSalesForPeriod(startDate: string, endDate: string): any[] {
    try {
      const sales = JSON.parse(localStorage.getItem('sales') || '[]');
      return sales.filter((sale: any) => {
        const saleDate = new Date(sale.date);
        return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
      });
    } catch {
      return [];
    }
  }

  /**
   * Get slip VAT extractions for period
   */
  private getSlipVATForPeriod(startDate: string, endDate: string): any[] {
    try {
      const slipVAT = JSON.parse(localStorage.getItem(this.SLIP_VAT_STORAGE_KEY) || '[]');
      return slipVAT.filter((slip: any) => {
        const slipDate = new Date(slip.date);
        return slipDate >= new Date(startDate) && slipDate <= new Date(endDate);
      });
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
      const existingIndex = calculations.findIndex(c => 
        c.period === calculation.period && c.companyId === calculation.companyId
      );
      
      if (existingIndex >= 0) {
        calculations[existingIndex] = calculation;
      } else {
        calculations.push(calculation);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(calculations));
    } catch (error) {
      console.error('Error saving VAT calculation:', error);
    }
  }

  /**
   * Get all VAT calculations
   */
  getAllVATCalculations(): VATCalculation[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Generate VAT 201 return
   */
  generateVAT201Return(calculation: VATCalculation): VAT201Return {
    const now = new Date();
    const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 25); // 25th of next month
    
    const vat201: VAT201Return = {
      id: `vat201-${Date.now()}`,
      period: calculation.period,
      dueDate: dueDate.toISOString().split('T')[0],
      calculation,
      status: 'draft',
      reference: `VAT-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      pdfGenerated: false
    };
    
    this.saveVAT201Return(vat201);
    return vat201;
  }

  /**
   * Save VAT 201 return
   */
  private saveVAT201Return(vat201: VAT201Return): void {
    try {
      const returns = this.getAllVAT201Returns();
      const existingIndex = returns.findIndex(r => r.id === vat201.id);
      
      if (existingIndex >= 0) {
        returns[existingIndex] = vat201;
      } else {
        returns.push(vat201);
      }
      
      localStorage.setItem(this.VAT201_STORAGE_KEY, JSON.stringify(returns));
    } catch (error) {
      console.error('Error saving VAT 201 return:', error);
    }
  }

  /**
   * Get all VAT 201 returns
   */
  getAllVAT201Returns(): VAT201Return[] {
    try {
      return JSON.parse(localStorage.getItem(this.VAT201_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Update VAT 201 return status
   */
  updateVAT201Status(id: string, status: VAT201Return['status']): boolean {
    try {
      const returns = this.getAllVAT201Returns();
      const returnIndex = returns.findIndex(r => r.id === id);
      
      if (returnIndex >= 0) {
        returns[returnIndex].status = status;
        returns[returnIndex].updatedAt = new Date().toISOString();
        localStorage.setItem(this.VAT201_STORAGE_KEY, JSON.stringify(returns));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating VAT 201 status:', error);
      return false;
    }
  }

  /**
   * Get current month VAT calculation
   */
  getCurrentMonthVATCalculation(companyId: string = 'default'): VATCalculation {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    return this.calculateVATForPeriod(startDate, endDate, companyId);
  }

  /**
   * Add slip VAT extraction
   */
  addSlipVATExtraction(slipVAT: {
    id: string;
    description: string;
    amount: number;
    vatAmount: number;
    date: string;
    reference?: string;
    ocrConfidence?: number;
  }): void {
    try {
      const extractions = JSON.parse(localStorage.getItem(this.SLIP_VAT_STORAGE_KEY) || '[]');
      extractions.push({
        ...slipVAT,
        extractedAt: new Date().toISOString()
      });
      localStorage.setItem(this.SLIP_VAT_STORAGE_KEY, JSON.stringify(extractions));
    } catch (error) {
      console.error('Error saving slip VAT extraction:', error);
    }
  }
}

const vatCalculationService = new VATCalculationService();
export default vatCalculationService;
export { VATCalculationService };