import { PayrollCalculation, payrollCalculationService } from './payrollCalculationService';
import { Employee, getAllEmployees } from './employeeService';
import { hrAccountingLinkService } from './hrAccountingLinkService';

// South African PAYE/EMP201 Constants for 2025/2026 Tax Year
const SA_TAX_CONSTANTS = {
  // PAYE Tax Brackets (Monthly) - 1 March 2025 – 28 Feb 2026
  PAYE_BRACKETS: [
    { min: 0, max: 19758, rate: 0.18, baseAmount: 0 },
    { min: 19758.42, max: 30875, rate: 0.26, baseAmount: 3556.50 },
    { min: 30875.01, max: 42733.33, rate: 0.31, baseAmount: 6446.83 },
    { min: 42733.34, max: 56083.33, rate: 0.36, baseAmount: 10122.92 },
    { min: 56083.34, max: 71491.67, rate: 0.39, baseAmount: 14928.92 },
    { min: 71491.68, max: 151416.67, rate: 0.41, baseAmount: 20938.17 },
    { min: 151416.68, max: Infinity, rate: 0.45, baseAmount: 53707.42 }
  ],
  
  // Primary Rebate (Monthly)
  PRIMARY_REBATE: 1183, // R14,200 / 12
  
  // UIF Constants
  UIF_EMPLOYEE_RATE: 0.01, // 1%
  UIF_EMPLOYER_RATE: 0.01, // 1%
  UIF_MAX_MONTHLY_SALARY: 17712, // Maximum salary for UIF calculation
  
  // SDL Constants
  SDL_RATE: 0.01, // 1%
  SDL_ANNUAL_THRESHOLD: 500000, // R500,000 annual payroll threshold
  
  // Medical Aid Tax Credits (Monthly)
  MEDICAL_AID_CREDITS: {
    MAIN_MEMBER: 347,
    FIRST_DEPENDANT: 347,
    ADDITIONAL_DEPENDANTS: 234
  }
};

export interface EMP201Calculation {
  period: string; // Format: "2025-01" (YYYY-MM)
  periodName: string; // Format: "January 2025"
  
  // Employee Summary
  totalEmployees: number;
  
  // PAYE Summary
  totalPAYE: number;
  totalTaxableIncome: number;
  
  // UIF Summary (Employee portion only - 1% of taxable income)
  totalUIF: number;
  totalUIFEmployee: number;
  totalUIFSalaries: number; // Capped salaries for UIF
  
  // SDL Summary
  totalSDL: number;
  totalSDLSalaries: number;
  isSDLApplicable: boolean;
  annualPayrollEstimate: number;
  
  // Grand Total
  totalEMP201Amount: number;
  
  // Employee Breakdown
  employeeBreakdown: EMP201EmployeeBreakdown[];
  
  // Calculation Date
  calculatedDate: string;
}

export interface EMP201EmployeeBreakdown {
  employeeId: string;
  employeeName: string;
  
  // Salary Information
  grossSalary: number;
  taxableIncome: number;
  rawTaxableIncome?: number; // Original taxable income before adjustments
  hasNegativeTaxableIncome?: boolean; // Flag for UI warning
  
  // Data Quality Warnings
  missingBaseSalary?: boolean; // Flag when Base Salary is missing or zero
  missingAttendancePay?: boolean; // Flag when Attendance Pay is missing or zero
  warningMessage?: string; // Custom warning message for UI display
  
  // PAYE Calculation
  paye: number;
  payeBracket: string;
  
  // UIF Calculation (Employee portion only - 1% of taxable income)
  uifSalary: number; // Capped at R17,712
  uifEmployee: number;
  uifTotal: number;
  
  // SDL Calculation
  sdl: number;
  
  // Total Deductions
  totalDeductions: number;
  netSalary: number;
}

class EMP201Service {
  
  /**
   * Calculate PAYE using South African tax brackets
   */
  calculatePAYE(taxableIncome: number): number {
    if (taxableIncome <= 0) return 0;
    
    console.log(`🧮 [EMP201] Calculating PAYE for taxable income: R${taxableIncome.toFixed(2)} using 2025-2026 tax brackets`);
    
    // Find the appropriate tax bracket
    let applicableBracket = null;
    for (const bracket of SA_TAX_CONSTANTS.PAYE_BRACKETS) {
      if (taxableIncome >= bracket.min && taxableIncome <= bracket.max) {
        applicableBracket = bracket;
        break;
      }
    }
    
    if (!applicableBracket) {
      console.error(`🧮 [EMP201] No tax bracket found for income: R${taxableIncome.toFixed(2)}`);
      return 0;
    }
    
    // Calculate tax using the 2025-2026 formula: baseAmount + rate × (income - bracket.min)
    const excessIncome = taxableIncome - applicableBracket.min;
    const tax = applicableBracket.baseAmount + (applicableBracket.rate * excessIncome);
    
    console.log(`🧮 [EMP201] Tax bracket: R${applicableBracket.min.toFixed(2)} - R${applicableBracket.max === Infinity ? '∞' : applicableBracket.max.toFixed(2)}`);
    console.log(`🧮 [EMP201] Base amount: R${applicableBracket.baseAmount.toFixed(2)}`);
    console.log(`🧮 [EMP201] Excess income: R${excessIncome.toFixed(2)} (R${taxableIncome.toFixed(2)} - R${applicableBracket.min.toFixed(2)})`);
    console.log(`🧮 [EMP201] Tax on excess: R${excessIncome.toFixed(2)} × ${(applicableBracket.rate * 100).toFixed(0)}% = R${(applicableBracket.rate * excessIncome).toFixed(2)}`);
    console.log(`🧮 [EMP201] Total PAYE: R${applicableBracket.baseAmount.toFixed(2)} + R${(applicableBracket.rate * excessIncome).toFixed(2)} = R${tax.toFixed(2)}`);
    
    return Math.round(tax * 100) / 100;
  }
  
  /**
   * Calculate UIF for employee only (1% of taxable income, capped at R17,712)
   */
  calculateUIF(taxableIncome: number): { employee: number; employer: number; total: number; cappedSalary: number } {
    // Cap the taxable income at the UIF maximum monthly salary
    const cappedSalary = Math.min(taxableIncome, SA_TAX_CONSTANTS.UIF_MAX_MONTHLY_SALARY);
    
    // Calculate employee UIF as 1% of capped taxable income
    const employee = Math.round(cappedSalary * SA_TAX_CONSTANTS.UIF_EMPLOYEE_RATE * 100) / 100;
    
    // Employer UIF is no longer calculated or displayed per user request
    const employer = 0;
    
    console.log(`🧮 [EMP201] UIF calculation: Taxable Income R${taxableIncome.toFixed(2)} → Capped R${cappedSalary.toFixed(2)} → Employee UIF R${employee.toFixed(2)} (1%)`);
    
    return {
      employee,
      employer,
      total: employee, // Only employee portion
      cappedSalary
    };
  }
  
  /**
   * Calculate SDL (Skills Development Levy)
   */
  calculateSDL(grossSalary: number, isApplicable: boolean): number {
    if (!isApplicable) return 0;
    return Math.round(grossSalary * SA_TAX_CONSTANTS.SDL_RATE * 100) / 100;
  }
  
  /**
   * Estimate annual payroll to determine SDL applicability
   */
  estimateAnnualPayroll(monthlyPayroll: number): number {
    return monthlyPayroll * 12;
  }
  
  /**
   * Get payroll data for a specific period - use the EXACT same data from HR Management
   */
  getPayrollDataForPeriod(period: string): PayrollCalculation[] {
    console.log(`🔄 [EMP201] Getting HR Management payroll data for period: ${period}`);
    
    try {
      // CRITICAL: Get the exact same payroll data that's displayed in HR Management
      // This ensures perfect consistency between HR and Accounting modules
      
      // First, try to get cached payroll data from HR Management
      const hrPayrollKey = 'payrollCalculations'; // HR Management cache key
      const cachedHRPayroll = localStorage.getItem(hrPayrollKey);
      
      if (cachedHRPayroll) {
        const hrPayrollData = JSON.parse(cachedHRPayroll);
        console.log(`✅ [EMP201] Found HR Management payroll data: ${hrPayrollData.length} employees`);
        
        // Log the HR data to verify it matches what's shown in HR Management
        console.log(`🔍 [EMP201] Verifying employee data mapping:`);
        hrPayrollData.forEach((payroll: any, index: number) => {
          console.log(`🔍 [EMP201] Employee ${index + 1}: ${payroll.employeeName} (ID: ${payroll.employeeId})`);
          console.log(`    Base Salary: R${payroll.baseSalary?.toFixed(2) || 'N/A'}`);
          console.log(`    Attendance Pay: R${payroll.attendancePay?.toFixed(2) || 'N/A'}`);
          console.log(`    Gross Salary: R${payroll.grossSalary?.toFixed(2) || 'N/A'}`);
          console.log(`    Employee ID Verification: ${payroll.employeeId}`);
        });
        
        // Sort by employee name to ensure consistent ordering
        const sortedPayrollData = hrPayrollData.sort((a: any, b: any) => 
          a.employeeName.localeCompare(b.employeeName)
        );
        
        console.log(`✅ [EMP201] Sorted payroll data by employee name for consistency`);
        
        return sortedPayrollData;
      }
      
      // If no cached HR data, generate fresh data but ensure it matches HR Management calculations
      console.log(`⚠️ [EMP201] No cached HR payroll data found, generating fresh data...`);
      const freshPayrollData = payrollCalculationService.calculateAllEmployeesPayroll(period);
      
      // Cache this data for consistency
      localStorage.setItem(hrPayrollKey, JSON.stringify(freshPayrollData));
      
      console.log(`✅ [EMP201] Generated and cached fresh payroll data: ${freshPayrollData.length} employees`);
      
      // Log the fresh data to verify it's correct
      freshPayrollData.forEach(payroll => {
        console.log(`🔍 [EMP201] Fresh payroll - ${payroll.employeeName}:`);
        console.log(`    Base Salary: R${payroll.baseSalary?.toFixed(2) || 'N/A'}`);
        console.log(`    Attendance Pay: R${payroll.attendancePay?.toFixed(2) || 'N/A'}`);
        console.log(`    Gross Salary: R${payroll.grossSalary?.toFixed(2) || 'N/A'}`);
      });
      
      return freshPayrollData;
    } catch (error) {
      console.error('❌ [EMP201] Error getting HR Management payroll data:', error);
      
      // If all fails, return empty array to avoid using incorrect data
      console.warn('⚠️ [EMP201] Returning empty array to avoid using incorrect data');
      return [];
    }
  }
  
  /**
   * Calculate EMP201 for a specific period
   * @param period - The period to calculate for (e.g., "2025-08")
   * @param selectedEmployeeId - Optional: If provided, only calculate for this specific employee
   */
  calculateEMP201(period: string, selectedEmployeeId?: string): EMP201Calculation {
    console.log(`🧮 [EMP201] Starting EMP201 calculation for period: ${period}`);
    if (selectedEmployeeId) {
      console.log(`🎯 [EMP201] Filtering for specific employee: ${selectedEmployeeId}`);
    }
    
    // Get payroll data for the period
    let payrollData = this.getPayrollDataForPeriod(period);
    
    // Filter for specific employee if requested
    if (selectedEmployeeId) {
      const originalCount = payrollData.length;
      payrollData = payrollData.filter(payroll => payroll.employeeId === selectedEmployeeId);
      console.log(`🎯 [EMP201] Filtered payroll data: ${originalCount} → ${payrollData.length} employees`);
      
      if (payrollData.length === 0) {
        console.warn(`⚠️ [EMP201] No payroll data found for employee: ${selectedEmployeeId}`);
      } else {
        console.log(`✅ [EMP201] Found payroll data for: ${payrollData[0].employeeName} (${payrollData[0].employeeId})`);
      }
    }
    console.log(`🧮 [EMP201] Found ${payrollData.length} payroll records for period ${period}`);
    
    if (payrollData.length === 0) {
      console.log(`⚠️ [EMP201] No payroll data found for period ${period}`);
      return this.createEmptyEMP201(period);
    }
    
    // Calculate totals
    let totalPAYE = 0;
    let totalTaxableIncome = 0;
    let totalUIFEmployee = 0;
    let totalUIFSalaries = 0;
    const totalSDL = 0;
    const totalSDLSalaries = 0;
    let totalGrossSalary = 0;
    
    const employeeBreakdown: EMP201EmployeeBreakdown[] = [];
    
    // Process each employee's payroll
    for (const payroll of payrollData) {
      console.log(`🧮 [EMP201] ===== PROCESSING EMPLOYEE =====`);
      console.log(`🧮 [EMP201] Employee Name: ${payroll.employeeName}`);
      console.log(`🧮 [EMP201] Employee ID: ${payroll.employeeId}`);
      
      // CRITICAL: Use HR-Accounting Link Service for proper data mapping
      // Maps HR Payroll fields to PAYE/EMP201 UI according to requirements:
      // - Base Salary → Gross Salary (display only)
      // - Attendance Pay → Taxable Income (used for PAYE calculation)
      const payeMapping = hrAccountingLinkService.getPAYEDataMapping(payroll.employeeId);
      
      console.log(`🔗 [EMP201] HR-Accounting data mapping for ${payeMapping.employeeName}:`);
      console.log(`    Gross Salary (from Base Salary): R${payeMapping.grossSalary.toFixed(2)}`);
      console.log(`    Taxable Income (from Attendance Pay): R${payeMapping.taxableIncome.toFixed(2)}`);
      console.log(`    Has Valid Data: ${payeMapping.hasValidData}`);
      console.log(`    Warnings: ${payeMapping.warnings.length}`);
      
      // Log any warnings for missing HR data
      if (payeMapping.warnings.length > 0) {
        console.warn(`⚠️ [EMP201] HR Data warnings for ${payeMapping.employeeName}:`);
        payeMapping.warnings.forEach(warning => console.warn(`    - ${warning}`));
      }
      
      // Use mapped values from HR-Accounting Link Service
      const grossSalary = payeMapping.grossSalary;
      const rawTaxableIncome = payeMapping.taxableIncome;
      let taxableIncome = rawTaxableIncome;
      let hasNegativeTaxableIncome = false;
      let warningMessage = '';
      
      // SAFETY CHECK: If taxableIncome is zero or negative, handle appropriately
      if (taxableIncome <= 0) {
        if (taxableIncome < 0) {
          console.warn(`⚠️ [EMP201] Negative taxable income detected for ${payeMapping.employeeName}: R${taxableIncome.toFixed(2)}`);
          console.warn(`⚠️ [EMP201] This indicates deductions exceeded attendance pay. Setting PAYE to R0.00.`);
          hasNegativeTaxableIncome = true;
          warningMessage = `Taxable income was negative (R${rawTaxableIncome.toFixed(2)}) — set to R0.00. Please review HR deductions.`;
        } else {
          console.warn(`⚠️ [EMP201] Zero taxable income for ${payeMapping.employeeName}. PAYE will be R0.00.`);
          warningMessage = 'Missing Attendance Pay — please review HR attendance data';
        }
        taxableIncome = 0; // Set to 0 for PAYE calculation
      }
      
      // Log final values used for calculation
      console.log(`🔍 [EMP201] Final calculation values for ${payeMapping.employeeName}:`);
      console.log(`    Gross Salary (from Base Salary): R${grossSalary.toFixed(2)}`);
      console.log(`    Taxable Income (from Attendance Pay): R${taxableIncome.toFixed(2)}`);
      console.log(`    Has negative income: ${hasNegativeTaxableIncome}`);
      console.log(`    Data quality warnings: ${payeMapping.warnings.length}`);
      
      // Calculate PAYE on the adjusted taxable income
      const paye = this.calculatePAYE(taxableIncome);
      
      // Calculate UIF on taxable income (1% employee portion only, capped at R17,712)
      const uif = this.calculateUIF(taxableIncome);
      
      // Create employee breakdown with all calculated values
      const employeeData: EMP201EmployeeBreakdown = {
        employeeId: payroll.employeeId,
        employeeName: payeMapping.employeeName,
        grossSalary: grossSalary,
        taxableIncome: taxableIncome, // Adjusted taxable income (0 if negative)
        rawTaxableIncome: rawTaxableIncome, // Original value for reference
        hasNegativeTaxableIncome: hasNegativeTaxableIncome, // Warning flag
        missingBaseSalary: payeMapping.warnings.some(w => w.includes('Base Salary')),
        missingAttendancePay: payeMapping.warnings.some(w => w.includes('Attendance Pay')),
        warningMessage: warningMessage || (payeMapping.warnings.length > 0 ? `Warning: ${payeMapping.warnings.join(', ')}` : undefined),
        paye: paye,
        payeBracket: this.getPAYEBracket(taxableIncome),
        uifSalary: uif.cappedSalary,
        uifEmployee: uif.employee,
        uifTotal: uif.total,
        sdl: 0, // SDL disabled per user request
        totalDeductions: paye + uif.employee, // Employee portion only
        netSalary: taxableIncome - (paye + uif.employee) // Final net after PAYE/UIF deductions
      };
      
      employeeBreakdown.push(employeeData);
      
      // Add to totals
      totalPAYE += paye;
      totalTaxableIncome += taxableIncome;
      totalUIFEmployee += uif.employee;
      totalUIFSalaries += uif.cappedSalary;
      totalGrossSalary += grossSalary;
      
      console.log(`✅ [EMP201] Employee ${payeMapping.employeeName} processed:`);
      console.log(`    PAYE: R${paye.toFixed(2)}`);
      console.log(`    UIF Employee: R${uif.employee.toFixed(2)} (1% of taxable income, capped at R17,712)`);
      console.log(`    UIF Calculation: R${taxableIncome.toFixed(2)} → R${Math.min(taxableIncome, 17712).toFixed(2)} × 1% = R${uif.employee.toFixed(2)}`);
      console.log(`    Running totals - PAYE: R${totalPAYE.toFixed(2)}, UIF: R${totalUIFEmployee.toFixed(2)}`);
    }
    
    const totalUIF = totalUIFEmployee; // Only employee UIF portion
    // SDL removed per user request - set to 0
    const totalEMP201Amount = totalPAYE + totalUIF; // SDL removed from total
    
    const result: EMP201Calculation = {
      period,
      periodName: this.formatPeriodName(period),
      totalEmployees: payrollData.length,
      totalPAYE: Math.round(totalPAYE * 100) / 100,
      totalTaxableIncome: Math.round(totalTaxableIncome * 100) / 100,
      totalUIF: Math.round(totalUIF * 100) / 100,
      totalUIFEmployee: Math.round(totalUIFEmployee * 100) / 100,
      totalUIFSalaries: Math.round(totalUIFSalaries * 100) / 100,
      totalSDL: 0, // SDL disabled per user request
      totalSDLSalaries: 0, // SDL disabled per user request
      isSDLApplicable: false, // SDL disabled per user request
      annualPayrollEstimate: 0, // Not needed without SDL
      totalEMP201Amount: Math.round(totalEMP201Amount * 100) / 100,
      employeeBreakdown,
      calculatedDate: new Date().toISOString()
    };
    
    console.log(`✅ [EMP201] EMP201 calculation completed:`);
    console.log(`   - Total PAYE: R${result.totalPAYE.toLocaleString()}`);
    console.log(`   - Total UIF: R${result.totalUIF.toLocaleString()}`);
    console.log(`   - SDL: Disabled per user request`);
    console.log(`   - Total EMP201: R${result.totalEMP201Amount.toLocaleString()}`);
    
    return result;
  }
  
  /**
   * Get PAYE bracket description for taxable income
   */
  private getPAYEBracket(taxableIncome: number): string {
    for (const bracket of SA_TAX_CONSTANTS.PAYE_BRACKETS) {
      if (taxableIncome >= bracket.min && taxableIncome <= bracket.max) {
        return `${(bracket.rate * 100).toFixed(0)}%`;
      }
    }
    return '0%';
  }
  
  /**
   * Create empty EMP201 calculation
   */
  private createEmptyEMP201(period: string): EMP201Calculation {
    return {
      period,
      periodName: this.formatPeriodName(period),
      totalEmployees: 0,
      totalPAYE: 0,
      totalTaxableIncome: 0,
      totalUIF: 0,
      totalUIFEmployee: 0,
      totalUIFSalaries: 0,
      totalSDL: 0,
      totalSDLSalaries: 0,
      isSDLApplicable: false,
      annualPayrollEstimate: 0,
      totalEMP201Amount: 0,
      employeeBreakdown: [],
      calculatedDate: new Date().toISOString()
    };
  }
  
  /**
   * Format period name for display
   */
  private formatPeriodName(period: string): string {
    try {
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
    } catch (error) {
      return period;
    }
  }
  
  /**
   * Get available periods with payroll data
   */
  getAvailablePeriods(): string[] {
    try {
      const payrollData = localStorage.getItem('payrollCalculations');
      if (!payrollData) return [];
      
      const allPayroll = JSON.parse(payrollData) as PayrollCalculation[];
      const periods = [...new Set(allPayroll.map(p => p.period))];
      return periods.sort().reverse(); // Most recent first
    } catch (error) {
      console.error('Error loading available periods:', error);
      return [];
    }
  }
  
  /**
   * Save EMP201 calculation to localStorage
   */
  saveEMP201Calculation(calculation: EMP201Calculation): void {
    try {
      const existingData = localStorage.getItem('emp201Calculations');
      const calculations = existingData ? JSON.parse(existingData) : [];
      
      // Remove existing calculation for the same period
      const filteredCalculations = calculations.filter((calc: EMP201Calculation) => calc.period !== calculation.period);
      
      // Add new calculation
      filteredCalculations.push(calculation);
      
      localStorage.setItem('emp201Calculations', JSON.stringify(filteredCalculations));
      console.log(`✅ [EMP201] Saved EMP201 calculation for period ${calculation.period}`);
    } catch (error) {
      console.error('Error saving EMP201 calculation:', error);
    }
  }
  
  /**
   * Load saved EMP201 calculations
   */
  getSavedEMP201Calculations(): EMP201Calculation[] {
    try {
      const data = localStorage.getItem('emp201Calculations');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading EMP201 calculations:', error);
      return [];
    }
  }
}

export const emp201Service = new EMP201Service();
