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
          grossSalary: hrData.grossSalary
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
