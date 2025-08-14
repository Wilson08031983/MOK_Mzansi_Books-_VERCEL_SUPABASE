/**
 * South African PAYE and UIF Calculator Service
 * Calculates PAYE and UIF based on Attendance Pay using South African tax regulations
 */

export interface SAPayrollCalculation {
  employeeId: string;
  employeeName: string;
  attendancePay: number;
  paye: number;
  uifEmployee: number;
  uifEmployer: number;
  totalDeductions: number;
  netPay: number;
  timestamp: string;
}

export interface SAPayrollBatch {
  calculations: SAPayrollCalculation[];
  totalPAYE: number;
  totalUIFEmployee: number;
  totalUIFEmployer: number;
  totalDeductions: number;
  calculatedAt: string;
}

class SAPayrollCalculatorService {
  // South African PAYE tax brackets for 2024/2025 tax year (monthly)
  private readonly PAYE_BRACKETS = [
    { min: 0, max: 7100, rate: 0.18, rebate: 0 },
    { min: 7100, max: 11600, rate: 0.26, rebate: 568 },
    { min: 11600, max: 19133, rate: 0.31, rebate: 1148 },
    { min: 19133, max: 26183, rate: 0.36, rebate: 2105 },
    { min: 26183, max: 36800, rate: 0.39, rebate: 2890 },
    { min: 36800, max: 64733, rate: 0.41, rebate: 3626 },
    { min: 64733, max: Infinity, rate: 0.45, rebate: 6215 }
  ];

  // South African monthly rebates for 2024/2025
  private readonly PRIMARY_REBATE = 1365; // Monthly primary rebate
  
  // UIF rates and caps
  private readonly UIF_RATE = 0.01; // 1% for both employee and employer
  private readonly UIF_MONTHLY_CAP = 177.12; // Monthly UIF cap for 2024

  /**
   * Calculate PAYE based on monthly taxable income (Attendance Pay)
   */
  calculatePAYE(monthlyTaxableIncome: number): number {
    if (monthlyTaxableIncome <= 0) return 0;

    // Find applicable tax bracket
    const bracket = this.PAYE_BRACKETS.find(b => 
      monthlyTaxableIncome > b.min && monthlyTaxableIncome <= b.max
    );

    if (!bracket) return 0;

    // Calculate gross tax
    let grossTax = 0;
    
    // Calculate tax for each bracket up to current income
    for (const b of this.PAYE_BRACKETS) {
      if (b.max <= monthlyTaxableIncome) {
        // Full bracket
        grossTax += (Math.min(b.max, monthlyTaxableIncome) - b.min) * b.rate;
      } else if (b.min < monthlyTaxableIncome) {
        // Partial bracket
        grossTax += (monthlyTaxableIncome - b.min) * b.rate;
        break;
      }
    }

    // Apply primary rebate
    const netTax = Math.max(0, grossTax - this.PRIMARY_REBATE);
    
    return Math.round(netTax * 100) / 100;
  }

  /**
   * Calculate UIF contributions based on Attendance Pay
   */
  calculateUIF(attendancePay: number): { employee: number; employer: number } {
    if (attendancePay <= 0) {
      return { employee: 0, employer: 0 };
    }

    const employeeUIF = Math.min(attendancePay * this.UIF_RATE, this.UIF_MONTHLY_CAP);
    const employerUIF = Math.min(attendancePay * this.UIF_RATE, this.UIF_MONTHLY_CAP);

    return {
      employee: Math.round(employeeUIF * 100) / 100,
      employer: Math.round(employerUIF * 100) / 100
    };
  }

  /**
   * Calculate complete payroll for a single employee
   */
  calculateEmployeePayroll(
    employeeId: string,
    employeeName: string,
    attendancePay: number
  ): SAPayrollCalculation {
    const timestamp = new Date().toISOString();
    
    console.log(`🧮 [SAPayrollCalculator] Calculating payroll for ${employeeName} (${employeeId})`);
    console.log(`    Attendance Pay: R${attendancePay.toFixed(2)}`);

    // Calculate PAYE
    const paye = this.calculatePAYE(attendancePay);
    console.log(`    Calculated PAYE: R${paye.toFixed(2)}`);

    // Calculate UIF
    const uif = this.calculateUIF(attendancePay);
    console.log(`    Calculated UIF Employee: R${uif.employee.toFixed(2)}`);
    console.log(`    Calculated UIF Employer: R${uif.employer.toFixed(2)}`);

    const totalDeductions = paye + uif.employee;
    const netPay = attendancePay - totalDeductions;

    console.log(`    Total Deductions: R${totalDeductions.toFixed(2)}`);
    console.log(`    Net Pay: R${netPay.toFixed(2)}`);
    console.log(`    Calculation completed at: ${timestamp}`);

    return {
      employeeId,
      employeeName,
      attendancePay,
      paye,
      uifEmployee: uif.employee,
      uifEmployer: uif.employer,
      totalDeductions,
      netPay,
      timestamp
    };
  }

  /**
   * Calculate payroll for multiple employees
   */
  calculateBatchPayroll(employees: Array<{
    employeeId: string;
    employeeName: string;
    attendancePay: number;
  }>): SAPayrollBatch {
    const calculatedAt = new Date().toISOString();
    
    console.log(`🧮 [SAPayrollCalculator] Starting batch payroll calculation for ${employees.length} employees`);

    const calculations = employees.map(emp => 
      this.calculateEmployeePayroll(emp.employeeId, emp.employeeName, emp.attendancePay)
    );

    const totals = calculations.reduce((acc, calc) => ({
      totalPAYE: acc.totalPAYE + calc.paye,
      totalUIFEmployee: acc.totalUIFEmployee + calc.uifEmployee,
      totalUIFEmployer: acc.totalUIFEmployer + calc.uifEmployer,
      totalDeductions: acc.totalDeductions + calc.totalDeductions
    }), {
      totalPAYE: 0,
      totalUIFEmployee: 0,
      totalUIFEmployer: 0,
      totalDeductions: 0
    });

    console.log(`🧮 [SAPayrollCalculator] Batch calculation completed:`);
    console.log(`    Total PAYE: R${totals.totalPAYE.toFixed(2)}`);
    console.log(`    Total UIF Employee: R${totals.totalUIFEmployee.toFixed(2)}`);
    console.log(`    Total UIF Employer: R${totals.totalUIFEmployer.toFixed(2)}`);
    console.log(`    Total Deductions: R${totals.totalDeductions.toFixed(2)}`);
    console.log(`    Calculated at: ${calculatedAt}`);

    return {
      calculations,
      ...totals,
      calculatedAt
    };
  }

  /**
   * Get UIF monthly cap
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
}

export const saPayrollCalculatorService = new SAPayrollCalculatorService();
