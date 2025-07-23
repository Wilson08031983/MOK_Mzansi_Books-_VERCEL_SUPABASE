import { Employee } from './employeeService';

export interface EmployeeDeduction {
  id: string;
  employeeId: string;
  employeeName: string;
  deductionType: DeductionType;
  amount: number;
  percentage?: number; // For percentage-based deductions
  isPercentage: boolean;
  description: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  createdDate: string;
  updatedDate: string;
}

export type DeductionType = 
  | 'garnishments'
  | 'retirement_plans'
  | 'child_support'
  | 'income_tax'
  | 'medical'
  | 'pension_funds'
  | 'social_security_tax'
  | 'statutory_deductions'
  | 'union_dues';

export const DEDUCTION_TYPES: { value: DeductionType; label: string; description: string }[] = [
  { value: 'garnishments', label: 'Garnishments', description: 'Court-ordered wage garnishments' },
  { value: 'retirement_plans', label: 'Retirement Plans', description: 'Employee retirement plan contributions' },
  { value: 'child_support', label: 'Child Support', description: 'Court-ordered child support payments' },
  { value: 'income_tax', label: 'Income Tax', description: 'Additional income tax withholding' },
  { value: 'medical', label: 'Medical', description: 'Medical insurance premiums and expenses' },
  { value: 'pension_funds', label: 'Pension Funds', description: 'Pension fund contributions' },
  { value: 'social_security_tax', label: 'Social Security Tax', description: 'Social security tax contributions' },
  { value: 'statutory_deductions', label: 'Statutory Deductions', description: 'Other statutory deductions' },
  { value: 'union_dues', label: 'Union Dues', description: 'Trade union membership dues' }
];

class EmployeeDeductionsService {
  private storageKey = 'employee_deductions';

  // Get all deductions
  getAllDeductions(): EmployeeDeduction[] {
    try {
      const deductionsData = localStorage.getItem(this.storageKey);
      return deductionsData ? JSON.parse(deductionsData) : [];
    } catch (error) {
      console.error('Error getting deductions:', error);
      return [];
    }
  }

  // Get deductions for a specific employee
  getEmployeeDeductions(employeeId: string): EmployeeDeduction[] {
    const allDeductions = this.getAllDeductions();
    return allDeductions.filter(deduction => 
      deduction.employeeId === employeeId && deduction.isActive
    );
  }

  // Get deductions by type
  getDeductionsByType(deductionType: DeductionType): EmployeeDeduction[] {
    const allDeductions = this.getAllDeductions();
    return allDeductions.filter(deduction => 
      deduction.deductionType === deductionType && deduction.isActive
    );
  }

  // Add new deduction
  addDeduction(deduction: Omit<EmployeeDeduction, 'id' | 'createdDate' | 'updatedDate'>): EmployeeDeduction {
    const newDeduction: EmployeeDeduction = {
      ...deduction,
      id: this.generateDeductionId(),
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    const allDeductions = this.getAllDeductions();
    allDeductions.push(newDeduction);
    this.saveDeductions(allDeductions);
    
    return newDeduction;
  }

  // Update deduction
  updateDeduction(deductionId: string, updates: Partial<EmployeeDeduction>): boolean {
    try {
      const allDeductions = this.getAllDeductions();
      const deductionIndex = allDeductions.findIndex(d => d.id === deductionId);
      
      if (deductionIndex === -1) return false;
      
      allDeductions[deductionIndex] = {
        ...allDeductions[deductionIndex],
        ...updates,
        updatedDate: new Date().toISOString()
      };
      
      this.saveDeductions(allDeductions);
      return true;
    } catch (error) {
      console.error('Error updating deduction:', error);
      return false;
    }
  }

  // Delete deduction (soft delete by setting isActive to false)
  deleteDeduction(deductionId: string): boolean {
    return this.updateDeduction(deductionId, { isActive: false });
  }

  // Calculate total deductions for an employee
  calculateEmployeeDeductions(employeeId: string, grossSalary: number): {
    deductions: { [key in DeductionType]?: number };
    totalDeductions: number;
  } {
    const employeeDeductions = this.getEmployeeDeductions(employeeId);
    const deductions: { [key in DeductionType]?: number } = {};
    let totalDeductions = 0;

    employeeDeductions.forEach(deduction => {
      let deductionAmount = 0;
      
      if (deduction.isPercentage && deduction.percentage) {
        deductionAmount = grossSalary * (deduction.percentage / 100);
      } else {
        deductionAmount = deduction.amount;
      }
      
      deductions[deduction.deductionType] = (deductions[deduction.deductionType] || 0) + deductionAmount;
      totalDeductions += deductionAmount;
    });

    return { deductions, totalDeductions };
  }

  // Get deduction summary for reporting
  getDeductionSummary(): {
    totalEmployeesWithDeductions: number;
    totalDeductionAmount: number;
    deductionsByType: { [key in DeductionType]?: { count: number; amount: number } };
  } {
    const allDeductions = this.getAllDeductions().filter(d => d.isActive);
    const employeesWithDeductions = new Set(allDeductions.map(d => d.employeeId));
    const deductionsByType: { [key in DeductionType]?: { count: number; amount: number } } = {};
    let totalDeductionAmount = 0;

    allDeductions.forEach(deduction => {
      if (!deductionsByType[deduction.deductionType]) {
        deductionsByType[deduction.deductionType] = { count: 0, amount: 0 };
      }
      
      deductionsByType[deduction.deductionType]!.count++;
      deductionsByType[deduction.deductionType]!.amount += deduction.amount;
      totalDeductionAmount += deduction.amount;
    });

    return {
      totalEmployeesWithDeductions: employeesWithDeductions.size,
      totalDeductionAmount,
      deductionsByType
    };
  }

  // Private helper methods
  private generateDeductionId(): string {
    return 'DED' + Date.now().toString() + Math.random().toString(36).substr(2, 5);
  }

  private saveDeductions(deductions: EmployeeDeduction[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(deductions));
    } catch (error) {
      console.error('Error saving deductions:', error);
      throw new Error('Failed to save deductions');
    }
  }
}

export const employeeDeductionsService = new EmployeeDeductionsService();
export default employeeDeductionsService;