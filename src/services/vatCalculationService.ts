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
  outputVAT: number;
  inputVAT: number;
  netVAT: number;
  createdDate: string;
}

export interface VAT201Return {
  id: string;
  period: string;
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

  public static getInstance(): VATCalculationService {
    if (!VATCalculationService.instance) {
      VATCalculationService.instance = new VATCalculationService();
    }
    return VATCalculationService.instance;
  }

  /**
   * Calculate VAT for a specific period
   */
  calculateVATForPeriod(startDate: string, endDate: string): VATCalculation {
    const calculation: VATCalculation = {
      id: `vat-calc-${Date.now()}`,
      period: `${startDate} to ${endDate}`,
      startDate,
      endDate,
      totalSales: 0,
      totalPurchases: 0,
      outputVAT: 0,
      inputVAT: 0,
      netVAT: 0,
      createdDate: new Date().toISOString()
    };

    // Get slip VAT extractions for the period
    const slipExtractions = this.getSlipVATExtractionsForPeriod(startDate, endDate);
    
    // Calculate input VAT from slip extractions
    calculation.inputVAT = slipExtractions.reduce((total, extraction) => {
      return total + extraction.vatAmount;
    }, 0);

    calculation.totalPurchases = slipExtractions.reduce((total, extraction) => {
      return total + extraction.totalAmount;
    }, 0);

    // For now, we'll use mock data for sales (in a real app, this would come from invoices/sales data)
    calculation.totalSales = calculation.totalPurchases * 1.5; // Mock sales data
    calculation.outputVAT = calculation.totalSales * this.STANDARD_VAT_RATE;

    // Calculate net VAT (output VAT - input VAT)
    calculation.netVAT = calculation.outputVAT - calculation.inputVAT;

    // Save calculation
    this.saveVATCalculation(calculation);

    return calculation;
  }

  /**
   * Generate VAT201 return from calculation
   */
  generateVAT201Return(calculation: VATCalculation): VAT201Return {
    const vatReturn: VAT201Return = {
      id: `vat201-${Date.now()}`,
      period: calculation.period,
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