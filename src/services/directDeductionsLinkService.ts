/**
 * Direct Employee Deductions Link Service
 * 
 * This service creates a direct linkage between:
 * - HR Management → Payroll Tab → Employee Deductions Management (authoritative source)
 * - Accounting → Tax Tab → Add New Tax Return → PAYE/EMP201 Calculation Breakdown (target)
 * 
 * Replaces the failed Payroll Details modal sync approach with direct fetching.
 */

import { employeeDeductionsService, DeductionType } from './employeeDeductionsService';
import { Employee, getAllEmployees } from './employeeService';

export interface DirectPAYEUIFData {
  employeeId: string;
  employeeName: string;
  paye: number;
  uif: number;
  hasData: boolean;
  source: 'Employee Deductions Management';
  timestamp: string;
  warnings: string[];
}

class DirectDeductionsLinkService {
  private static instance: DirectDeductionsLinkService;

  public static getInstance(): DirectDeductionsLinkService {
    if (!DirectDeductionsLinkService.instance) {
      DirectDeductionsLinkService.instance = new DirectDeductionsLinkService();
    }
    return DirectDeductionsLinkService.instance;
  }

  /**
   * Fetch PAYE and UIF values directly from Employee Deductions Management
   * This is the new authoritative source for PAYE/EMP201 calculations
   */
  public fetchPAYEUIFFromDeductions(employeeId: string): DirectPAYEUIFData {
    const timestamp = new Date().toISOString();
    console.log(`🔗 [DirectDeductionsLink] Fetching PAYE/UIF from Employee Deductions Management for employee: ${employeeId}`);
    
    const warnings: string[] = [];
    let employeeName = 'Unknown Employee';
    let paye = 0;
    let uif = 0;
    let hasData = false;

    try {
      // Get employee name
      const employees = getAllEmployees();
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee) {
        employeeName = `${employee.firstName} ${employee.surname}`;
      } else {
        warnings.push(`Employee not found in employee registry`);
      }

      // Get employee deductions from Employee Deductions Management
      const employeeDeductions = employeeDeductionsService.getEmployeeDeductions(employeeId);
      
      console.log(`📊 [DirectDeductionsLink] Found ${employeeDeductions.length} active deductions for ${employeeName}`);

      // Extract PAYE (income_tax deduction type)
      const payeDeductions = employeeDeductions.filter(d => d.deductionType === 'income_tax');
      if (payeDeductions.length > 0) {
        paye = payeDeductions.reduce((sum, deduction) => sum + deduction.amount, 0);
        console.log(`✅ [DirectDeductionsLink] PAYE found: R${paye.toFixed(2)} from ${payeDeductions.length} income_tax deduction(s)`);
        hasData = true;
      } else {
        console.log(`⚠️ [DirectDeductionsLink] No PAYE (income_tax) deductions found for ${employeeName}`);
        warnings.push(`No PAYE deductions found in Employee Deductions Management`);
      }

      // Extract UIF (social_security_tax deduction type)
      const uifDeductions = employeeDeductions.filter(d => d.deductionType === 'social_security_tax');
      if (uifDeductions.length > 0) {
        uif = uifDeductions.reduce((sum, deduction) => sum + deduction.amount, 0);
        console.log(`✅ [DirectDeductionsLink] UIF found: R${uif.toFixed(2)} from ${uifDeductions.length} social_security_tax deduction(s)`);
        hasData = true;
      } else {
        console.log(`⚠️ [DirectDeductionsLink] No UIF (social_security_tax) deductions found for ${employeeName}`);
        warnings.push(`No UIF deductions found in Employee Deductions Management`);
      }

      // Log the complete fetch result
      console.log(`🎯 [DirectDeductionsLink] Fetch completed for ${employeeName}:`, {
        employeeId,
        employeeName,
        paye: `R${paye.toFixed(2)}`,
        uif: `R${uif.toFixed(2)}`,
        hasData,
        warningCount: warnings.length,
        timestamp
      });

    } catch (error) {
      console.error(`❌ [DirectDeductionsLink] Error fetching PAYE/UIF for employee ${employeeId}:`, error);
      warnings.push(`Error accessing Employee Deductions Management: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const result: DirectPAYEUIFData = {
      employeeId,
      employeeName,
      paye,
      uif,
      hasData,
      source: 'Employee Deductions Management',
      timestamp,
      warnings
    };

    return result;
  }

  /**
   * Fetch PAYE/UIF for multiple employees
   * Used when calculating for all employees in PAYE/EMP201
   */
  public fetchMultipleEmployeesPAYEUIF(employeeIds: string[]): DirectPAYEUIFData[] {
    console.log(`🔗 [DirectDeductionsLink] Fetching PAYE/UIF for ${employeeIds.length} employees from Employee Deductions Management`);
    
    const results = employeeIds.map(employeeId => this.fetchPAYEUIFFromDeductions(employeeId));
    
    const successCount = results.filter(r => r.hasData).length;
    console.log(`✅ [DirectDeductionsLink] Batch fetch completed: ${successCount}/${employeeIds.length} employees have PAYE/UIF data`);
    
    return results;
  }

  /**
   * Get all employees with PAYE/UIF deductions
   * Used to populate employee selection dropdown
   */
  public getEmployeesWithPAYEUIFDeductions(): DirectPAYEUIFData[] {
    console.log(`🔗 [DirectDeductionsLink] Finding all employees with PAYE/UIF deductions in Employee Deductions Management`);
    
    try {
      // Get all active deductions
      const allDeductions = employeeDeductionsService.getAllDeductions();
      
      // Find employees with PAYE (income_tax) or UIF (social_security_tax) deductions
      const employeesWithPAYEUIF = new Set<string>();
      
      allDeductions
        .filter(d => d.isActive && (d.deductionType === 'income_tax' || d.deductionType === 'social_security_tax'))
        .forEach(d => employeesWithPAYEUIF.add(d.employeeId));
      
      console.log(`📊 [DirectDeductionsLink] Found ${employeesWithPAYEUIF.size} employees with PAYE/UIF deductions`);
      
      // Fetch data for each employee
      const results = Array.from(employeesWithPAYEUIF).map(employeeId => 
        this.fetchPAYEUIFFromDeductions(employeeId)
      );
      
      return results.filter(r => r.hasData);
      
    } catch (error) {
      console.error(`❌ [DirectDeductionsLink] Error finding employees with PAYE/UIF deductions:`, error);
      return [];
    }
  }

  /**
   * Validate that Employee Deductions Management has required data
   * Used for pre-flight checks before PAYE/EMP201 calculation
   */
  public validateDeductionsAvailability(): {
    isAvailable: boolean;
    employeeCount: number;
    payeEmployeeCount: number;
    uifEmployeeCount: number;
    warnings: string[];
  } {
    console.log(`🔍 [DirectDeductionsLink] Validating Employee Deductions Management availability`);
    
    const warnings: string[] = [];
    
    try {
      const allDeductions = employeeDeductionsService.getAllDeductions();
      const activeDeductions = allDeductions.filter(d => d.isActive);
      
      const payeEmployees = new Set(
        activeDeductions
          .filter(d => d.deductionType === 'income_tax')
          .map(d => d.employeeId)
      );
      
      const uifEmployees = new Set(
        activeDeductions
          .filter(d => d.deductionType === 'social_security_tax')
          .map(d => d.employeeId)
      );
      
      const allEmployeesWithDeductions = new Set([...payeEmployees, ...uifEmployees]);
      
      if (allEmployeesWithDeductions.size === 0) {
        warnings.push('No employees found with PAYE or UIF deductions in Employee Deductions Management');
      }
      
      if (payeEmployees.size === 0) {
        warnings.push('No employees found with PAYE (income_tax) deductions');
      }
      
      if (uifEmployees.size === 0) {
        warnings.push('No employees found with UIF (social_security_tax) deductions');
      }
      
      const result = {
        isAvailable: allEmployeesWithDeductions.size > 0,
        employeeCount: allEmployeesWithDeductions.size,
        payeEmployeeCount: payeEmployees.size,
        uifEmployeeCount: uifEmployees.size,
        warnings
      };
      
      console.log(`✅ [DirectDeductionsLink] Validation completed:`, result);
      
      return result;
      
    } catch (error) {
      console.error(`❌ [DirectDeductionsLink] Error validating deductions availability:`, error);
      return {
        isAvailable: false,
        employeeCount: 0,
        payeEmployeeCount: 0,
        uifEmployeeCount: 0,
        warnings: [`Error accessing Employee Deductions Management: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }
}

// Export singleton instance
export const directDeductionsLinkService = DirectDeductionsLinkService.getInstance();
export default directDeductionsLinkService;
