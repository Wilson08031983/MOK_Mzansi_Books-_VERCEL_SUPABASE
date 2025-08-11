/**
 * Accounting PAYE and UIF Calculator Service
 * Calculates PAYE and UIF for Accounting module using South African tax regulations
 * Based on Taxable Income (not Gross Salary)
 * Separate from HR Management calculations
 */

export interface AccountingPayeUifResult {
  employeeId: string;
  employeeName: string;
  taxableIncome: number;
  paye: number;
  uif: number;
  uifCapped: boolean;
  timestamp: string;
  source: 'Accounting Calculation';
}

export interface AccountingPayeUifBatch {
  results: AccountingPayeUifResult[];
  totalPAYE: number;
  totalUIF: number;
  calculatedAt: string;
}

class AccountingPayeUifCalculatorService {
  // South African PAYE tax brackets for 2025/2026 tax year (monthly)
  private readonly PAYE_BRACKETS = [
    { min: 0, max: 7100, rate: 0.18, rebate: 0 },
    { min: 7100, max: 11600, rate: 0.26, rebate: 568 },
    { min: 11600, max: 19133, rate: 0.31, rebate: 1148 },
    { min: 19133, max: 26183, rate: 0.36, rebate: 2105 },
    { min: 26183, max: 36800, rate: 0.39, rebate: 2890 },
    { min: 36800, max: 64733, rate: 0.41, rebate: 3626 },
    { min: 64733, max: Infinity, rate: 0.45, rebate: 6215 }
  ];

  // South African monthly rebates for 2025/2026
  private readonly PRIMARY_REBATE = 1365; // Monthly primary rebate
  
  // UIF rates and caps
  private readonly UIF_RATE = 0.01; // 1% for employee
  private readonly UIF_MONTHLY_CAP = 177.12; // Monthly UIF cap for 2025

  /**
   * Calculate PAYE based on monthly taxable income
   */
  private calculatePAYE(monthlyTaxableIncome: number): number {
    if (monthlyTaxableIncome <= 0) return 0;

    // Calculate gross tax using progressive brackets
    let grossTax = 0;
    
    for (const bracket of this.PAYE_BRACKETS) {
      if (monthlyTaxableIncome > bracket.min) {
        const taxableInThisBracket = Math.min(
          monthlyTaxableIncome - bracket.min,
          bracket.max - bracket.min
        );
        grossTax += taxableInThisBracket * bracket.rate;
        
        if (monthlyTaxableIncome <= bracket.max) {
          break;
        }
      }
    }

    // Apply primary rebate
    const netTax = Math.max(0, grossTax - this.PRIMARY_REBATE);
    
    return Math.round(netTax * 100) / 100;
  }

  /**
   * Calculate UIF based on taxable income
   */
  private calculateUIF(taxableIncome: number): { amount: number; capped: boolean } {
    if (taxableIncome <= 0) {
      return { amount: 0, capped: false };
    }

    const calculatedUIF = taxableIncome * this.UIF_RATE;
    const cappedUIF = Math.min(calculatedUIF, this.UIF_MONTHLY_CAP);
    
    return {
      amount: Math.round(cappedUIF * 100) / 100,
      capped: calculatedUIF > this.UIF_MONTHLY_CAP
    };
  }

  /**
   * Calculate PAYE and UIF for a single employee
   */
  calculateForEmployee(
    employeeId: string,
    employeeName: string,
    taxableIncome: number
  ): AccountingPayeUifResult {
    const timestamp = new Date().toISOString();
    
    console.log(`💼 [AccountingPayeUifCalculator] Calculating for ${employeeName} (${employeeId})`);
    console.log(`    Taxable Income (source field): R${taxableIncome.toFixed(2)}`);

    // Calculate PAYE
    const paye = this.calculatePAYE(taxableIncome);
    console.log(`    Calculated PAYE: R${paye.toFixed(2)}`);

    // Calculate UIF
    const uifResult = this.calculateUIF(taxableIncome);
    console.log(`    Calculated UIF: R${uifResult.amount.toFixed(2)}`);
    
    if (uifResult.capped) {
      console.log(`    UIF capped: computed R${(taxableIncome * this.UIF_RATE).toFixed(2)} > cap R${this.UIF_MONTHLY_CAP}; applied R${this.UIF_MONTHLY_CAP}`);
    }

    const result: AccountingPayeUifResult = {
      employeeId,
      employeeName,
      taxableIncome,
      paye,
      uif: uifResult.amount,
      uifCapped: uifResult.capped,
      timestamp,
      source: 'Accounting Calculation'
    };

    console.log(`✅ [AccountingPayeUifCalculator] Completed for ${employeeName}:`, {
      employeeId,
      employeeName,
      taxableIncome: `R${taxableIncome.toFixed(2)}`,
      calculatedPAYE: `R${paye.toFixed(2)}`,
      calculatedUIF: `R${uifResult.amount.toFixed(2)}`,
      timestamp
    });

    return result;
  }

  /**
   * Calculate PAYE and UIF for multiple employees
   */
  calculateBatch(employees: Array<{
    employeeId: string;
    employeeName: string;
    taxableIncome: number;
  }>): AccountingPayeUifBatch {
    const calculatedAt = new Date().toISOString();
    
    console.log(`💼 [AccountingPayeUifCalculator] Starting batch calculation for ${employees.length} employees`);

    const results = employees.map(emp => 
      this.calculateForEmployee(emp.employeeId, emp.employeeName, emp.taxableIncome)
    );

    const totals = results.reduce((acc, result) => ({
      totalPAYE: acc.totalPAYE + result.paye,
      totalUIF: acc.totalUIF + result.uif
    }), {
      totalPAYE: 0,
      totalUIF: 0
    });

    console.log(`✅ [AccountingPayeUifCalculator] Batch calculation completed:`);
    console.log(`    Total PAYE: R${totals.totalPAYE.toFixed(2)}`);
    console.log(`    Total UIF: R${totals.totalUIF.toFixed(2)}`);
    console.log(`    Calculated at: ${calculatedAt}`);

    return {
      results,
      totalPAYE: Math.round(totals.totalPAYE * 100) / 100,
      totalUIF: Math.round(totals.totalUIF * 100) / 100,
      calculatedAt
    };
  }

  /**
   * Get UIF monthly cap for reference
   */
  getUIFCap(): number {
    return this.UIF_MONTHLY_CAP;
  }

  /**
   * Get current PAYE brackets for reference
   */
  getPAYEBrackets() {
    return [...this.PAYE_BRACKETS];
  }

  /**
   * Validate taxable income and provide user-friendly messages
   */
  validateTaxableIncome(taxableIncome: number): { valid: boolean; message?: string } {
    if (taxableIncome === undefined || taxableIncome === null) {
      return {
        valid: false,
        message: "Taxable Income missing — cannot calculate PAYE/UIF. Please set Taxable Income in HR/Payroll."
      };
    }

    if (taxableIncome < 0) {
      return {
        valid: false,
        message: "Taxable Income cannot be negative. Please check HR/Payroll data."
      };
    }

    if (taxableIncome === 0) {
      return {
        valid: true,
        message: "Taxable Income is R0.00 — PAYE and UIF will be R0.00."
      };
    }

    return { valid: true };
  }
}

export const accountingPayeUifCalculatorService = new AccountingPayeUifCalculatorService();
