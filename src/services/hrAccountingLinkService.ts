/**
 * HR-Accounting Employee Linking Service
 * 
 * This service creates a direct, reliable link between:
 * - HR Management > Payroll Tab > Employee Payroll Calculations table
 * - Accounting > Tax Tab > Add New Tax Return > Employee Selection
 * 
 * Ensures accurate data mapping and prevents employee data mix-ups.
 */

import { Employee } from './employeeService';
import { PayrollCalculation } from './payrollCalculationService';

export interface HREmployeeData {
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  attendancePay: number;
  grossSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  uif: number; // UIF value from HR Payroll (source of truth)
  hours: {
    regular: number;
    overtime: number;
    nightShift: number;
    leave: number;
  };
}

export interface AccountingEmployeeOption {
  value: string; // Employee ID
  label: string; // Employee Name with ID
  hrData: HREmployeeData;
}

class HRAccountingLinkService {
  private static instance: HRAccountingLinkService;

  public static getInstance(): HRAccountingLinkService {
    if (!HRAccountingLinkService.instance) {
      HRAccountingLinkService.instance = new HRAccountingLinkService();
    }
    return HRAccountingLinkService.instance;
  }

  /**
   * Get employees directly from HR Payroll Calculations table
   * This is the single source of truth for employee selection
   * 
   * CRITICAL: Maps HR Payroll fields to PAYE/EMP201 UI:
   * - Base Salary → Gross Salary (display only, with tooltip)
   * - Attendance Pay → Taxable Income (used for PAYE calculation)
   */
  public getHRPayrollEmployees(): HREmployeeData[] {
    console.log('🔗 [HRAccountingLink] Fetching employees from HR Payroll Calculations table...');
    
    try {
      // Get cached payroll data from HR Management
      const payrollData = localStorage.getItem('payrollCalculations');
      if (!payrollData) {
        console.warn('⚠️ [HRAccountingLink] No payroll data found in HR Management cache');
        return [];
      }

      const payrollCalculations: PayrollCalculation[] = JSON.parse(payrollData);
      console.log(`📊 [HRAccountingLink] Found ${payrollCalculations.length} payroll records`);

      const hrEmployees: HREmployeeData[] = payrollCalculations.map(payroll => {
        const hrData: HREmployeeData = {
          employeeId: payroll.employeeId,
          employeeName: payroll.employeeName,
          baseSalary: payroll.baseSalary || 0,
          attendancePay: payroll.attendancePay || 0,
          grossSalary: payroll.grossSalary || 0,
          allowances: payroll.allowances?.totalAllowances || 0,
          deductions: payroll.deductions?.totalDeductions || 0,
          netSalary: payroll.netSalary || 0,
          uif: payroll.deductions?.uif || 0, // UIF from HR Payroll (source of truth)
          hours: {
            regular: payroll.regularHours || 0,
            overtime: payroll.overtimeHours || 0,
            nightShift: payroll.nightShiftHours || 0,
            leave: payroll.leaveHours || 0
          }
        };

        console.log(`✅ [HRAccountingLink] Mapped HR data for ${hrData.employeeName}:`, {
          employeeId: hrData.employeeId,
          attendancePay: hrData.attendancePay,
          grossSalary: hrData.grossSalary,
          uif: hrData.uif
        });

        return hrData;
      });

      return hrEmployees;
    } catch (error) {
      console.error('❌ [HRAccountingLink] Error fetching HR payroll employees:', error);
      return [];
    }
  }

  /**
   * Convert HR employees to Accounting employee options
   * Creates the dropdown options for employee selection
   */
  public getAccountingEmployeeOptions(): AccountingEmployeeOption[] {
    console.log('🔗 [HRAccountingLink] Converting HR employees to Accounting options...');
    
    const hrEmployees = this.getHRPayrollEmployees();
    
    const options: AccountingEmployeeOption[] = hrEmployees.map(hrData => ({
      value: hrData.employeeId,
      label: `${hrData.employeeName} (${hrData.employeeId.substring(0, 8)}...)`,
      hrData: hrData
    }));

    console.log(`✅ [HRAccountingLink] Created ${options.length} employee options for Accounting`);
    return options;
  }

  /**
   * Get specific employee HR data by ID
   * Used when an employee is selected in Accounting
   */
  public getEmployeeHRData(employeeId: string): HREmployeeData | null {
    console.log(`🎯 [HRAccountingLink] Getting HR data for employee: ${employeeId}`);
    
    const hrEmployees = this.getHRPayrollEmployees();
    
    const employeeData = hrEmployees.find(emp => emp.employeeId === employeeId);
    
    if (employeeData) {
      console.log(`✅ [HRAccountingLink] Found HR data for ${employeeData.employeeName}:`, {
        attendancePay: employeeData.attendancePay,
        grossSalary: employeeData.grossSalary,
        taxableIncome: employeeData.attendancePay // Use attendance pay as taxable income
      });
      return employeeData;
    } else {
      console.error(`❌ [HRAccountingLink] No HR data found for employee ID: ${employeeId}`);
      return null;
    }
  }

  /**
   * Validate employee selection against HR data
   * Ensures selected employee exists in HR Payroll table
   */
  public validateEmployeeSelection(employeeId: string): boolean {
    console.log(`🔍 [HRAccountingLink] Validating employee selection: ${employeeId}`);
    
    const hrData = this.getEmployeeHRData(employeeId);
    const isValid = hrData !== null;
    
    console.log(`${isValid ? '✅' : '❌'} [HRAccountingLink] Employee validation result: ${isValid}`);
    return isValid;
  }

  /**
   * Get PAYE/EMP201 specific data mapping from HR Payroll
   * Maps HR fields to PAYE UI fields according to requirements:
   * - Base Salary → Gross Salary (display only)
   * - Attendance Pay → Taxable Income (used for PAYE calculation)
   */
  public getPAYEDataMapping(employeeId: string): {
    grossSalary: number;
    taxableIncome: number;
    employeeName: string;
    hasValidData: boolean;
    warnings: string[];
  } {
    console.log(`🔗 [HRAccountingLink] Getting PAYE data mapping for employee: ${employeeId}`);
    
    const warnings: string[] = [];
    const hrData = this.getEmployeeHRData(employeeId);
    
    if (!hrData) {
      console.error(`❌ [HRAccountingLink] No HR data found for PAYE mapping: ${employeeId}`);
      return {
        grossSalary: 0,
        taxableIncome: 0,
        employeeName: 'Unknown Employee',
        hasValidData: false,
        warnings: ['Missing HR Payroll value: Employee not found. Please review employee payroll record.']
      };
    }
    
    // Map Base Salary → Gross Salary (display only)
    const grossSalary = hrData.baseSalary || 0;
    if (grossSalary === 0) {
      warnings.push('Missing HR Payroll value: Base Salary. Please review employee payroll record.');
    }
    
    // Map Attendance Pay → Taxable Income (used for PAYE calculation)
    const taxableIncome = hrData.attendancePay || 0;
    if (taxableIncome === 0) {
      warnings.push('Missing HR Payroll value: Attendance Pay. Please review employee payroll record.');
    } else if (taxableIncome < 0) {
      warnings.push('Attendance Pay is negative — PAYE set to R0.00. Review HR payroll deductions.');
    }
    
    const result = {
      grossSalary,
      taxableIncome,
      employeeName: hrData.employeeName,
      hasValidData: warnings.length === 0,
      warnings
    };
    
    console.log(`✅ [HRAccountingLink] PAYE data mapping for ${hrData.employeeName}:`, {
      grossSalary: `R${grossSalary.toFixed(2)}`,
      taxableIncome: `R${taxableIncome.toFixed(2)}`,
      hasValidData: result.hasValidData,
      warningCount: warnings.length
    });
    
    return result;
  }

  /**
   * Get UIF data directly from HR Payroll (source of truth)
   * Links UIF value from HR Management > Payroll Tab to Accounting > Tax Tab
   */
  public getUIFDataMapping(employeeId: string): {
    uifValue: number;
    employeeName: string;
    hasUIFData: boolean;
    warnings: string[];
  } {
    console.log(`🔗 [HRAccountingLink] Getting UIF data mapping for employee: ${employeeId}`);
    
    const warnings: string[] = [];
    const hrData = this.getEmployeeHRData(employeeId);
    
    if (!hrData) {
      console.error(`❌ [HRAccountingLink] No HR data found for UIF mapping: ${employeeId}`);
      return {
        uifValue: 0,
        employeeName: 'Unknown Employee',
        hasUIFData: false,
        warnings: ['UIF value not found in HR Payroll. Please update payroll record.']
      };
    }
    
    // Get UIF value directly from HR Payroll deductions
    const uifValue = hrData.uif || 0;
    if (uifValue === 0) {
      warnings.push('UIF value not found in HR Payroll. Please update payroll record.');
    }
    
    const result = {
      uifValue,
      employeeName: hrData.employeeName,
      hasUIFData: uifValue > 0,
      warnings
    };
    
    console.log(`✅ [HRAccountingLink] UIF data mapping for ${hrData.employeeName}:`, {
      uifValue: `R${uifValue.toFixed(2)}`,
      hasUIFData: result.hasUIFData,
      warningCount: warnings.length
    });
    
    return result;
  }

  /**
   * Get PAYE values from Accounting EMP201 calculations to update HR Payroll deductions
   * Links PAYE calculated in Accounting Tax Tab to HR Payroll Tax field (renamed to PAYE)
   */
  public getPAYEFromAccounting(employeeId: string, period: string): {
    paye: number;
    hasPayeData: boolean;
    source: string;
    warnings: string[];
  } {
    console.log(`🔗 [HRAccountingLink] Getting PAYE from Accounting EMP201 for employee: ${employeeId}, period: ${period}`);
    
    const warnings: string[] = [];
    
    try {
      // Get EMP201 calculations from localStorage (Accounting module)
      const emp201Key = 'emp201Calculations';
      console.log(`🔍 [HRAccountingLink] Looking for EMP201 data with key: ${emp201Key}`);
      
      const emp201Data = localStorage.getItem(emp201Key);
      
      if (!emp201Data) {
        console.warn(`⚠️ [HRAccountingLink] No EMP201 data found in localStorage`);
        return {
          paye: 0,
          hasPayeData: false,
          source: 'Missing - No Accounting EMP201 calculation found',
          warnings: [`No PAYE calculation found in Accounting. Please calculate PAYE/EMP201 in Accounting > Tax Tab first.`]
        };
      }
      
      const emp201Calculations = JSON.parse(emp201Data);
      console.log(`🔍 [HRAccountingLink] Found ${emp201Calculations.length} EMP201 calculations`);
      
      // Find calculation for the specific period
      const emp201Calculation = emp201Calculations.find((calc: any) => calc.period === period);
      
      if (!emp201Calculation) {
        console.warn(`⚠️ [HRAccountingLink] No EMP201 calculation found for period: ${period}`);
        console.warn(`⚠️ [HRAccountingLink] Available periods:`, emp201Calculations.map((calc: any) => calc.period));
        return {
          paye: 0,
          hasPayeData: false,
          source: `Missing - No Accounting EMP201 calculation for period ${period}`,
          warnings: [`No PAYE calculation found for period ${period}. Please calculate PAYE/EMP201 in Accounting > Tax Tab for this period.`]
        };
      }
      
      // Find employee in EMP201 breakdown
      const employeeBreakdown = emp201Calculation.employeeBreakdown?.find((emp: any) => emp.employeeId === employeeId);
      
      if (!employeeBreakdown) {
        console.warn(`⚠️ [HRAccountingLink] Employee ${employeeId} not found in EMP201 calculation`);
        return {
          paye: 0,
          hasPayeData: false,
          source: 'Missing - Employee not in Accounting EMP201 calculation',
          warnings: [`Employee not found in Accounting PAYE/EMP201 calculation. Please include this employee in Accounting > Tax Tab calculation.`]
        };
      }
      
      const paye = employeeBreakdown.paye || 0;
      
      console.log(`✅ [HRAccountingLink] Found PAYE for ${employeeBreakdown.employeeName}: R${paye.toFixed(2)} from Accounting EMP201`);
      
      return {
        paye: paye,
        hasPayeData: true,
        source: `Accounting EMP201 (${period})`,
        warnings: paye === 0 ? [`PAYE is R0.00 - verify taxable income in Accounting calculation`] : []
      };
      
    } catch (error) {
      console.error('❌ [HRAccountingLink] Error fetching PAYE from Accounting:', error);
      return {
        paye: 0,
        hasPayeData: false,
        source: 'Error - Failed to fetch from Accounting',
        warnings: [`Error accessing Accounting PAYE data: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Update HR Payroll deductions with PAYE from Accounting
   * Replaces the "tax" field with "paye" linked from Accounting calculations
   */
  public updateHRPayrollWithPAYE(employeeId: string, period: string): boolean {
    console.log(`🔄 [HRAccountingLink] Updating HR Payroll with PAYE from Accounting for employee: ${employeeId}, period: ${period}`);
    
    try {
      // Get PAYE from Accounting
      const payeData = this.getPAYEFromAccounting(employeeId, period);
      console.log(`🔍 [HRAccountingLink] PAYE data retrieved:`, payeData);
      
      if (!payeData.hasPayeData) {
        console.warn(`⚠️ [HRAccountingLink] No valid PAYE data found for employee ${employeeId}`);
        return false;
      }
      
      // Get current payroll data using period-specific key
      const payrollKey = `payroll_calculations_${period}`;
      console.log(`🔍 [HRAccountingLink] Looking for payroll data with key: ${payrollKey}`);
      let payrollData = localStorage.getItem(payrollKey);
      
      // Fallback to general payrollCalculations key if period-specific not found
      if (!payrollData) {
        console.log(`🔍 [HRAccountingLink] Period-specific key not found, trying general key: payrollCalculations`);
        payrollData = localStorage.getItem('payrollCalculations');
      }
      
      if (!payrollData) {
        console.error('❌ [HRAccountingLink] No payroll data found in HR');
        return false;
      }
      
      const payrollCalculations = JSON.parse(payrollData);
      console.log(`🔍 [HRAccountingLink] Found ${payrollCalculations.length} payroll records`);
      
      // Find and update the employee's payroll record
      const employeeIndex = payrollCalculations.findIndex((calc: any) => 
        calc.employeeId === employeeId && (calc.period === period || !calc.period)
      );
      
      console.log(`🔍 [HRAccountingLink] Employee index found: ${employeeIndex}`);
      
      if (employeeIndex === -1) {
        console.error(`❌ [HRAccountingLink] Employee payroll record not found: ${employeeId} for period ${period}`);
        console.error(`❌ [HRAccountingLink] Available records:`, payrollCalculations.map((calc: any) => ({
          employeeId: calc.employeeId,
          period: calc.period,
          employeeName: calc.employeeName
        })));
        return false;
      }
      
      // Update the tax field with PAYE from Accounting
      const oldTax = payrollCalculations[employeeIndex].deductions.tax;
      payrollCalculations[employeeIndex].deductions.tax = payeData.paye;
      
      // Recalculate total deductions
      const deductions = payrollCalculations[employeeIndex].deductions;
      deductions.totalDeductions = deductions.tax + deductions.uif + deductions.medicalAid + 
                                   deductions.retirementFund + deductions.salaryAdvance + deductions.otherDeductions;
      
      // Recalculate net salary
      payrollCalculations[employeeIndex].netSalary = 
        payrollCalculations[employeeIndex].grossSalary - deductions.totalDeductions;
      
      // Save updated payroll data back to both keys for consistency
      localStorage.setItem(`payroll_calculations_${period}`, JSON.stringify(payrollCalculations));
      localStorage.setItem('payrollCalculations', JSON.stringify(payrollCalculations));
      
      console.log(`✅ [HRAccountingLink] Updated HR Payroll PAYE: ${payrollCalculations[employeeIndex].employeeName}`);
      console.log(`    Old Tax: R${oldTax.toFixed(2)} → New PAYE: R${payeData.paye.toFixed(2)}`);
      console.log(`    Source: ${payeData.source}`);
      console.log(`    Total Deductions: R${deductions.totalDeductions.toFixed(2)}`);
      console.log(`    Net Salary: R${payrollCalculations[employeeIndex].netSalary.toFixed(2)}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ [HRAccountingLink] Error updating HR Payroll with PAYE:', error);
      return false;
    }
  }

  /**
   * Get filtered payroll data for EMP201 calculation
   * Returns only the selected employee's data for accurate calculations
   */
  public getFilteredPayrollForEMP201(employeeId?: string): PayrollCalculation[] {
    console.log(`🧮 [HRAccountingLink] Getting filtered payroll data for EMP201...`);
    console.log(`🎯 [HRAccountingLink] Employee filter: ${employeeId || 'ALL EMPLOYEES'}`);
    

    
    try {
      const payrollData = localStorage.getItem('payrollCalculations');
      if (!payrollData) {
        console.error('❌ [HRAccountingLink] No payroll data available for EMP201');
        return [];
      }

      const allPayroll: PayrollCalculation[] = JSON.parse(payrollData);
      
      if (!employeeId) {
        console.log(`📊 [HRAccountingLink] Returning all ${allPayroll.length} employees for EMP201`);
        return allPayroll;
      }

      // Filter for specific employee
      const filteredPayroll = allPayroll.filter(payroll => payroll.employeeId === employeeId);
      
      console.log(`🎯 [HRAccountingLink] Filtered payroll: ${filteredPayroll.length} employee(s)`);
      
      if (filteredPayroll.length === 0) {
        console.error(`❌ [HRAccountingLink] No payroll data found for employee: ${employeeId}`);
      } else {
        const employee = filteredPayroll[0];
        console.log(`✅ [HRAccountingLink] Found payroll data for ${employee.employeeName}:`, {
          employeeId: employee.employeeId,
          attendancePay: employee.attendancePay,
          grossSalary: employee.grossSalary
        });
      }

      return filteredPayroll;
    } catch (error) {
      console.error('❌ [HRAccountingLink] Error filtering payroll data:', error);
      return [];
    }
  }

  /**
   * Clear cached data to force fresh HR-Accounting sync
   */
  public clearCache(): void {
    console.log('🧹 [HRAccountingLink] Clearing HR-Accounting link cache...');
    
    // Clear relevant caches
    localStorage.removeItem('emp201Cache');
    localStorage.removeItem('emp201_calculations');
    
    console.log('✅ [HRAccountingLink] Cache cleared successfully');
  }

  /**
   * Sync HR data with Accounting module
   * Ensures data consistency between modules
   */
  public syncHRToAccounting(): boolean {
    console.log('🔄 [HRAccountingLink] Syncing HR data to Accounting module...');
    
    try {
      const hrEmployees = this.getHRPayrollEmployees();
      
      if (hrEmployees.length === 0) {
        console.warn('⚠️ [HRAccountingLink] No HR employees found to sync');
        return false;
      }

      // Store synced data for Accounting module access
      localStorage.setItem('hrAccountingSync', JSON.stringify({
        employees: hrEmployees,
        lastSync: new Date().toISOString(),
        version: '1.0'
      }));

      console.log(`✅ [HRAccountingLink] Successfully synced ${hrEmployees.length} employees to Accounting`);
      return true;
    } catch (error) {
      console.error('❌ [HRAccountingLink] Error syncing HR to Accounting:', error);
      return false;
    }
  }
}

// Export singleton instance
export const hrAccountingLinkService = HRAccountingLinkService.getInstance();
