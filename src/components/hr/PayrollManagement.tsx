import React, { useState, useEffect } from 'react';
import { 
  Search, 
  DollarSign, 
  Calculator,
  TrendingUp,
  CreditCard,
  Eye,
  RefreshCw,
  Clock,
  X,
  AlertCircle,
  User,
  Download,
  Minus,
  Settings,
  TestTube
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { payrollCalculationService, PayrollCalculation, SalaryAdvance } from '@/services/payrollCalculationService';
import { PayslipService } from '@/services/payslipService';
import { Employee, getAllEmployees } from '@/services/employeeService';
import EmployeeDeductionsManagement from '@/components/hr/EmployeeDeductionsManagement';
import { employeeDeductionsService } from '@/services/employeeDeductionsService';
import { saPayrollCalculatorService } from '@/services/saPayrollCalculatorService';
import PayrollExpenseIntegration from '@/components/payroll/PayrollExpenseIntegration';
import PayrollTestRunner from '@/components/testing/PayrollTestRunner';

import { stuckToastCleanupService } from '@/services/stuckToastCleanupService';
// Removed PAYE sync from Accounting feature

// Import salary calculation functions from AllowanceManagement
interface MonthlyAttendance {
  employeeId: string;
  regularHours: number;
  overtimeHours: number;
  nightShiftHours: number;
  daysWorked: number;
}

interface EmployeeAllowances {
  thirteenthMonthBonus: number;
  retirementPlan: number;
  housingAllowance: number;
  motorVehicleAllowance: number;
  medicalAidAllowance: number;
  otherAllowances: number;
}

interface UIFCalculation {
  employeeContribution: number;
  employerContribution: number;
  cappedSalary: number;
}

interface SalaryBreakdown {
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  attendancePay: number;
  totalAllowances: number;
  grossSalary: number;
  tax: number;
  uif: UIFCalculation;
  salaryAdvanceDeduction: number;
  employeeDeductions: number;
  netSalary: number;
  // Additional properties for payroll details
  period?: string;
  status?: string;
  regularHours?: number;
  overtimeHours?: number;
  nightShiftHours?: number;
  leaveHours?: number;
  allowances?: {
    thirteenthMonthBonus: number;
    retirementPlan: number;
    housingAllowance: number;
    motorVehicleAllowance: number;
    medicalAidAllowance: number;
    otherAllowances: number;
    totalAllowances: number;
  };
  deductions?: {
    tax: number;
    uif: number;
    medicalAid: number;
    retirementFund: number;
    salaryAdvance: number;
    employeeDeductions: number;
    otherDeductions: number;
    totalDeductions: number;
  };
}

const UIF_CONSTANTS = {
  EMPLOYEE_RATE: 0.01,
  EMPLOYER_RATE: 0.01,
  MONTHLY_SALARY_CAP: 17712,
  MAX_MONTHLY_CONTRIBUTION: 177.12
};

const STANDARD_MONTHLY_HOURS = 173.33;

// South African PAYE tax brackets for 2024/2025
const SA_TAX_CONSTANTS = {
  PAYE_BRACKETS: [
    { min: 0, max: 237100, rate: 0.18 },
    { min: 237100, max: 370500, rate: 0.26 },
    { min: 370500, max: 512800, rate: 0.31 },
    { min: 512800, max: 673000, rate: 0.36 },
    { min: 673000, max: 857900, rate: 0.39 },
    { min: 857900, max: 1817000, rate: 0.41 },
    { min: 1817000, max: Infinity, rate: 0.45 }
  ],
  PRIMARY_REBATE: 17235 // Annual primary rebate for 2024/2025
};

const calculatePAYE = (annualTaxableIncome: number): number => {
  if (annualTaxableIncome <= 0) return 0;
  
  // Convert monthly to annual for calculation
  const annualIncome = annualTaxableIncome * 12;
  
  let tax = 0;
  let remainingIncome = annualIncome;
  
  for (const bracket of SA_TAX_CONSTANTS.PAYE_BRACKETS) {
    if (remainingIncome <= 0) break;
    
    const bracketMin = bracket.min;
    const bracketMax = bracket.max === Infinity ? remainingIncome + bracketMin : bracket.max;
    
    if (annualIncome > bracketMin) {
      const taxableInBracket = Math.min(remainingIncome, bracketMax - bracketMin);
      const bracketTax = taxableInBracket * bracket.rate;
      tax += bracketTax;
      remainingIncome -= taxableInBracket;
    }
  }
  
  // Subtract primary rebate
  tax -= SA_TAX_CONSTANTS.PRIMARY_REBATE;
  if (tax < 0) tax = 0;
  
  // Convert back to monthly
  return tax / 12;
};

const calculateUIF = (grossSalary: number): UIFCalculation => {
  const cappedSalary = Math.min(grossSalary, UIF_CONSTANTS.MONTHLY_SALARY_CAP);
  const employeeContribution = Math.min(cappedSalary * UIF_CONSTANTS.EMPLOYEE_RATE, UIF_CONSTANTS.MAX_MONTHLY_CONTRIBUTION);
  const employerContribution = Math.min(cappedSalary * UIF_CONSTANTS.EMPLOYER_RATE, UIF_CONSTANTS.MAX_MONTHLY_CONTRIBUTION);
  
  return { employeeContribution, employerContribution, cappedSalary };
};

const getMonthlyAttendance = (employeeId: string): MonthlyAttendance => {
  try {
    // Use the real attendance data from PayrollCalculationService
    const currentPeriod = new Date().toISOString().slice(0, 7);
    const attendanceData = payrollCalculationService.getAttendanceData(employeeId, currentPeriod);
    
    if (attendanceData) {
      const result = {
        employeeId,
        regularHours: attendanceData.regularHours || 0,
        overtimeHours: attendanceData.overtimeHours || 0,
        nightShiftHours: attendanceData.nightShiftHours || 0,
        daysWorked: Math.ceil((attendanceData.regularHours || 0) / 8)
      };
      
      console.log(`Real attendance data for ${employeeId}:`, result);
      return result;
    }
    
    // Fallback: try to get from attendanceSummaries in localStorage
    const attendanceSummariesRaw = localStorage.getItem('attendanceSummaries');
    if (attendanceSummariesRaw) {
      const attendanceSummaries = JSON.parse(attendanceSummariesRaw);
      const attendanceSummary = attendanceSummaries.find((summary: any) => summary.employeeId === employeeId);
      
      if (attendanceSummary) {
        const result = {
          employeeId,
          regularHours: attendanceSummary.currentMonthRegularHours || 0,
          overtimeHours: attendanceSummary.currentMonthOvertimeHours || 0,
          nightShiftHours: attendanceSummary.currentMonthNightShiftHours || 0,
          daysWorked: Math.ceil((attendanceSummary.currentMonthRegularHours || 0) / 8)
        };
        
        console.log(`Fallback attendance data for ${employeeId}:`, result);
        return result;
      }
    }
    
    // Final fallback: return zero hours (no attendance recorded)
    console.log(`No attendance data found for ${employeeId}, using zero hours`);
    return { 
      employeeId, 
      regularHours: 0, 
      overtimeHours: 0, 
      nightShiftHours: 0, 
      daysWorked: 0 
    };
    
  } catch (error) {
    console.error('Error getting attendance data:', error);
    // Return zero hours as fallback when there's an error
    return { 
      employeeId, 
      regularHours: 0, 
      overtimeHours: 0, 
      nightShiftHours: 0, 
      daysWorked: 0 
    };
  }
};

const calculateEmployeeSalary = (employee: Employee, attendance: MonthlyAttendance, allowances: EmployeeAllowances): SalaryBreakdown => {
  console.log(`🔍 [calculateEmployeeSalary] Starting calculation for: ${employee.firstName} ${employee.surname}`);
  console.log(`🔍 [calculateEmployeeSalary] Employee ID: ${employee.id}`);
  console.log(`🔍 [calculateEmployeeSalary] Employee Salary: R${employee.salary}`);
  
  const baseSalary = employee.salary || 0;
  const hourlyRate = baseSalary / STANDARD_MONTHLY_HOURS;
  
  console.log(`🔍 [calculateEmployeeSalary] Base Salary: R${baseSalary}, Hourly Rate: R${hourlyRate.toFixed(2)}`);
  console.log(`🔍 [calculateEmployeeSalary] Attendance Hours:`, {
    regular: attendance.regularHours,
    overtime: attendance.overtimeHours,
    nightShift: attendance.nightShiftHours
  });
  
  // Calculate attendance-based pay with proper South African labor law rates
  const regularPay = attendance.regularHours * hourlyRate;
  const overtimePay = attendance.overtimeHours * hourlyRate * 1.5; // 1.5x for overtime
  const nightShiftPay = attendance.nightShiftHours * hourlyRate * 0.1; // 10% night shift allowance
  const attendancePay = regularPay + overtimePay + nightShiftPay;
  
  console.log(`🔍 [calculateEmployeeSalary] Pay Breakdown:`, {
    regularPay: regularPay.toFixed(2),
    overtimePay: overtimePay.toFixed(2),
    nightShiftPay: nightShiftPay.toFixed(2),
    totalAttendancePay: attendancePay.toFixed(2)
  });
  
  // Calculate total allowances
  const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
  
  // Calculate gross salary (attendance-based pay + allowances)
  const grossSalary = attendancePay + totalAllowances;
  
  // Calculate deductions using PAYE (South African tax brackets)
  const tax = calculatePAYE(attendancePay); // Use attendance pay as taxable income
  const uif = calculateUIF(grossSalary);
  
  // Calculate salary advance deductions for approved advances
  // Check for advances that are approved and should be deducted
  const approvedAdvances = payrollCalculationService.getSalaryAdvances(employee.id)
    .filter(advance => advance.status === 'approved');
  const salaryAdvanceDeduction = approvedAdvances.reduce((sum, advance) => sum + advance.amount, 0);
  
  console.log(`Salary advance calculation for ${employee.firstName} ${employee.surname}:`);
  console.log(`  - All advances:`, payrollCalculationService.getSalaryAdvances(employee.id));
  console.log(`  - Approved advances:`, approvedAdvances);
  console.log(`  - Total advance deduction: R${salaryAdvanceDeduction.toFixed(2)}`);
  
  // Calculate employee deductions from Employee Deductions Management
  const deductionCalculation = employeeDeductionsService.calculateEmployeeDeductions(employee.id, grossSalary);
  const employeeDeductions = deductionCalculation.totalDeductions;
  
  // Calculate net salary (gross - tax - uif - salary advances - employee deductions)
  const netSalary = grossSalary - tax - uif.employeeContribution - salaryAdvanceDeduction - employeeDeductions;
  
  console.log(`Salary for ${employee.firstName} ${employee.surname}: Attendance Pay = R${attendancePay.toFixed(2)}, Advance Deduction = R${salaryAdvanceDeduction.toFixed(2)}, Employee Deductions = R${employeeDeductions.toFixed(2)}`);
  
  const finalCalculation = {
    employeeId: employee.id,
    employeeName: `${employee.firstName} ${employee.surname}`,
    baseSalary,
    attendancePay,
    totalAllowances,
    grossSalary,
    tax,
    uif,
    salaryAdvanceDeduction,
    employeeDeductions,
    netSalary
  };
  
  console.log(`🎯 [calculateEmployeeSalary] FINAL RESULT for ${employee.firstName} ${employee.surname}:`, {
    employeeId: finalCalculation.employeeId,
    employeeName: finalCalculation.employeeName,
    baseSalary: `R${finalCalculation.baseSalary.toFixed(2)}`,
    attendancePay: `R${finalCalculation.attendancePay.toFixed(2)}`,
    grossSalary: `R${finalCalculation.grossSalary.toFixed(2)}`,
    netSalary: `R${finalCalculation.netSalary.toFixed(2)}`
  });
  
  return finalCalculation;
};

const PayrollManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>(new Date().toISOString().slice(0, 7));
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [salaryData, setSalaryData] = useState<SalaryBreakdown[]>([]);
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showPayrollDetails, setShowPayrollDetails] = useState(false);
  const [selectedPayrollData, setSelectedPayrollData] = useState<SalaryBreakdown | null>(null);
  const [showDeductionsModal, setShowDeductionsModal] = useState(false);
  
  // Salary Advance Form State
  const [advanceForm, setAdvanceForm] = useState({
    employeeId: '',
    amount: '',
    reason: ''
  });
  
  // Load data on component mount
  useEffect(() => {
    initializeSampleData();
    loadSalaryData();
    loadSalaryAdvances();
    
    // Initialize cleanup service to remove stuck PAYE sync toasts
    stuckToastCleanupService.initialize();
    
    // Listen for localStorage changes from Accounting EMP201 sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'payrollCalculations' || e.key === 'accounting_hr_sync_audit') {
        console.log('🔄 [PayrollManagement] Payroll data updated by Accounting sync, refreshing...');
        loadSalaryData();
        
        // If payroll details modal is open, refresh the selected data
        if (showPayrollDetails && selectedPayrollData) {
          const updatedData = localStorage.getItem('payrollCalculations');
          if (updatedData) {
            const payrollArray = JSON.parse(updatedData);
            const updatedPayroll = payrollArray.find((p: any) => p.employeeId === selectedPayrollData.employeeId);
            if (updatedPayroll) {
              console.log('🔄 [PayrollManagement] Refreshing payroll details modal with updated data');
              setSelectedPayrollData(updatedPayroll);
            }
          }
        }
      }
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    
    // Also set up a periodic check for same-tab changes (since Accounting sync happens in same tab)
    const intervalId = setInterval(() => {
      const syncAudit = localStorage.getItem('accounting_hr_sync_audit');
      if (syncAudit) {
        try {
          const audit = JSON.parse(syncAudit);
          const auditTime = new Date(audit.timestamp).getTime();
          const now = new Date().getTime();
          
          // If sync happened in last 5 seconds, refresh data
          if (now - auditTime < 5000) {
            console.log('🔄 [PayrollManagement] Recent Accounting sync detected, refreshing payroll data');
            loadSalaryData();
            
            // Refresh payroll details modal if open
            if (showPayrollDetails && selectedPayrollData) {
              const updatedData = localStorage.getItem('payrollCalculations');
              if (updatedData) {
                const payrollArray = JSON.parse(updatedData);
                const updatedPayroll = payrollArray.find((p: any) => p.employeeId === selectedPayrollData.employeeId);
                if (updatedPayroll) {
                  console.log('🔄 [PayrollManagement] Refreshing payroll details modal with synced data');
                  setSelectedPayrollData(updatedPayroll);
                }
              }
            }
          }
        } catch (error) {
          // Ignore parsing errors
        }
      }
    }, 2000); // Check every 2 seconds
    
    // Cleanup on unmount
    return () => {
      stuckToastCleanupService.stop();
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [periodFilter, showPayrollDetails, selectedPayrollData]);

  const initializeSampleData = () => {
    // Initialize sample employee deductions if none exist
    const existingDeductions = employeeDeductionsService.getAllDeductions();
    if (existingDeductions.length === 0) {
      const employees = getAllEmployees();
      if (employees.length > 0) {
        // Add sample deduction for Admin User
        const adminUser = employees.find(emp => emp.firstName === 'Admin' && emp.surname === 'User');
        if (adminUser) {
          employeeDeductionsService.addDeduction({
            employeeId: adminUser.id,
            employeeName: `${adminUser.firstName} ${adminUser.surname}`,
            deductionType: 'medical',
            amount: 850,
            isPercentage: false,
            description: 'Medical Aid Contribution',
            isActive: true,
            startDate: new Date().toISOString().slice(0, 10),
          });
        }


      }
    }

    // Initialize sample salary advances if none exist
    const existingAdvances = payrollCalculationService.getSalaryAdvances();
    if (existingAdvances.length === 0) {
      const employees = getAllEmployees();
      if (employees.length > 0) {
        const currentPeriod = new Date().toISOString().slice(0, 7);
        
        // Add sample salary advance for Admin User
        const adminUser = employees.find(emp => emp.firstName === 'Admin' && emp.surname === 'User');
        if (adminUser) {
          payrollCalculationService.requestSalaryAdvance(
            adminUser.id,
            `${adminUser.firstName} ${adminUser.surname}`,
            5000,
            'Emergency medical expenses'
          );
          // Approve it immediately for sample data
          const advances = payrollCalculationService.getSalaryAdvances(adminUser.id);
          const latestAdvance = advances[advances.length - 1];
          if (latestAdvance) {
            payrollCalculationService.approveSalaryAdvance(latestAdvance.id, 'System');
          }
        }


      }
    }
  };
  
  const loadSalaryData = () => {
    const employees = getAllEmployees();
    console.log('🔄 [PayrollManagement] Loading salary data for employees:', employees.map(e => `${e.firstName} ${e.surname} (${e.id})`));
    
    // Exclude the seeded Regular User from payroll calculations
    const filteredEmployees = employees.filter(emp => {
      const byEmail = (emp.email || '').toLowerCase() === 'user@mokmzansibooks.com';
      const byName = (emp.firstName?.trim() === 'Regular' && emp.surname?.trim() === 'User');
      return !(byEmail || byName);
    });
    
    const calculatedSalaries: SalaryBreakdown[] = filteredEmployees.map(employee => {
      console.log(`🧮 [PayrollManagement] Calculating salary for: ${employee.firstName} ${employee.surname} (${employee.id})`);
      
      const attendance = getMonthlyAttendance(employee.id);
      console.log(`📊 [PayrollManagement] Attendance for ${employee.firstName} ${employee.surname}:`, attendance);
      
      // Get allowances from localStorage with default values
      const storedAllowances = JSON.parse(localStorage.getItem('employeeAllowances') || '{}');
      const employeeAllowances = storedAllowances[employee.id] || {
        thirteenthMonthBonus: (employee.salary || 0) / 12, // Default 13th month bonus
        retirementPlan: 0,
        housingAllowance: 0,
        motorVehicleAllowance: 0,
        medicalAidAllowance: 0,
        otherAllowances: 0
      };
      
      console.log(`💰 [PayrollManagement] Allowances for ${employee.firstName} ${employee.surname}:`, employeeAllowances);
      
      const salaryCalculation = calculateEmployeeSalary(employee, attendance, employeeAllowances);
      console.log(`✅ [PayrollManagement] Final calculation for ${employee.firstName} ${employee.surname}:`, salaryCalculation);
      
      return salaryCalculation;
    });
    
    // CRITICAL: Cache the payroll data for EMP201 service to use
    console.log('💾 [PayrollManagement] Caching payroll calculations for EMP201 service...');
    localStorage.setItem('payrollCalculations', JSON.stringify(calculatedSalaries));
    
    // Also cache with period-specific key for consistency
    const currentPeriod = new Date().toISOString().slice(0, 7);
    localStorage.setItem(`payroll_calculations_${currentPeriod}`, JSON.stringify(calculatedSalaries));
    
    console.log('✅ [PayrollManagement] Payroll data cached successfully');
    setSalaryData(calculatedSalaries);
  };
  
  const loadSalaryAdvances = () => {
    try {
      const advances = payrollCalculationService.getSalaryAdvances();
      console.log('Loaded salary advances:', advances);
      setSalaryAdvances(advances);
    } catch (error) {
      console.error('Error loading salary advances:', error);
      setSalaryAdvances([]);
    }
  };
  
  // Calculate payroll for all employees
  const handleCalculatePayroll = async () => {
    setIsCalculating(true);
    try {
      loadSalaryData();
      toast.success(`Payroll calculated for ${salaryData.length} employees`);
    } catch (error) {
      console.error('Error calculating payroll:', error);
      toast.error('Failed to calculate payroll');
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Handle salary advance request
  const handleSalaryAdvanceRequest = () => {
    if (!advanceForm.employeeId || !advanceForm.amount || !advanceForm.reason) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const employee = salaryData.find(calc => calc.employeeId === advanceForm.employeeId);
    if (!employee) {
      toast.error('Employee not found');
      return;
    }
    
    try {
      const advance = payrollCalculationService.requestSalaryAdvance(
        advanceForm.employeeId,
        employee.employeeName,
        parseFloat(advanceForm.amount),
        advanceForm.reason
      );
      
      setSalaryAdvances(prev => [...prev, advance]);
      setAdvanceForm({ employeeId: '', amount: '', reason: '' });
      setShowAdvanceModal(false);
      toast.success('Salary advance request submitted successfully');
    } catch (error) {
      console.error('Error requesting salary advance:', error);
      toast.error('Failed to submit salary advance request');
    }
  };
  
  // Approve salary advance
  const handleApproveSalaryAdvance = (advanceId: string) => {
    try {
      console.log('Approving salary advance:', advanceId);
      const success = payrollCalculationService.approveSalaryAdvance(advanceId, 'Admin User');
      if (success) {
        console.log('Salary advance approved successfully');
        
        // Force immediate refresh of salary advances
        setTimeout(() => {
          loadSalaryAdvances();
          loadSalaryData();
        }, 100);
        
        toast.success('Salary advance approved and deducted from payroll');
      } else {
        console.error('Failed to approve salary advance');
        toast.error('Failed to approve salary advance');
      }
    } catch (error) {
      console.error('Error approving salary advance:', error);
      toast.error('Error approving salary advance');
    }
  };

  // Reject salary advance
  const handleRejectSalaryAdvance = (advanceId: string) => {
    try {
      console.log('Rejecting salary advance:', advanceId);
      const success = payrollCalculationService.rejectSalaryAdvance(advanceId, 'Admin User');
      if (success) {
        console.log('Salary advance rejected successfully');
        
        // Force immediate refresh of salary advances
        setTimeout(() => {
          loadSalaryAdvances();
        }, 100);
        
        toast.success('Salary advance request rejected');
      } else {
        console.error('Failed to reject salary advance');
        toast.error('Failed to reject salary advance');
      }
    } catch (error) {
      console.error('Error rejecting salary advance:', error);
      toast.error('Error rejecting salary advance');
    }
  };
  
  // View payroll details
  const handleViewPayrollDetails = (calculation: SalaryBreakdown) => {
    console.log('🔍 [PayrollManagement] Opening payroll details modal, loading fresh data from localStorage...');
    
    // CRITICAL: Load fresh payroll data from localStorage (may have been updated by Accounting sync)
    const freshPayrollData = localStorage.getItem('payrollCalculations');
    let currentCalculation = calculation;
    
    if (freshPayrollData) {
      try {
        const payrollArray = JSON.parse(freshPayrollData);
        let freshCalculation = payrollArray.find((p: any) => p.employeeId === calculation.employeeId);
        
        // Fallback: sometimes Accounting and HR use different IDs for the same person.
        // If no ID match, try matching by employeeName (case-insensitive, trimmed)
        if (!freshCalculation) {
          const targetName = (calculation.employeeName || '').trim().toLowerCase();
          freshCalculation = payrollArray.find((p: any) => (p.employeeName || '').trim().toLowerCase() === targetName);
          if (freshCalculation) {
            console.log('🧩 [PayrollManagement] No ID match; matched fresh payroll by name:', {
              employeeName: calculation.employeeName,
              originalId: calculation.employeeId,
              freshId: freshCalculation.employeeId
            });
          } else {
            console.log('❓ [PayrollManagement] No fresh payroll match by ID or name; using existing state values');
          }
        }
        
        if (freshCalculation) {
          console.log('✅ [PayrollManagement] Found fresh payroll data for employee:', {
            employeeId: calculation.employeeId,
            oldPAYE: calculation.tax,
            freshPAYE: freshCalculation.deductions?.tax || calculation.tax,
            oldUIF: calculation.uif?.employeeContribution || 0,
            freshUIF: freshCalculation.deductions?.uif || 0
          });
          
          // Use fresh data from localStorage (updated by Accounting sync)
          currentCalculation = {
            ...calculation,
            tax: freshCalculation.deductions?.tax || calculation.tax,
            uif: {
              employeeContribution: freshCalculation.deductions?.uif || calculation.uif?.employeeContribution || 0,
              employerContribution: freshCalculation.deductions?.uif || calculation.uif?.employerContribution || 0,
              cappedSalary: Math.min(freshCalculation.attendancePay || calculation.attendancePay, 17712)
            },
            netSalary: freshCalculation.netSalary || calculation.netSalary,
            grossSalary: freshCalculation.grossSalary || calculation.grossSalary
          };
        }
      } catch (error) {
        console.warn('⚠️ [PayrollManagement] Error parsing fresh payroll data, using original calculation');
      }
    }
    
    // Get attendance data for this employee
    const attendance = getMonthlyAttendance(calculation.employeeId);
    
    // Get allowances from localStorage
    const storedAllowances = JSON.parse(localStorage.getItem('employeeAllowances') || '{}');
    const employeeAllowances = storedAllowances[calculation.employeeId] || {
      thirteenthMonthBonus: 0,
      retirementPlan: 0,
      housingAllowance: 0,
      motorVehicleAllowance: 0,
      medicalAidAllowance: 0,
      otherAllowances: 0
    };
    
    // Get deduction calculation for detailed breakdown
    const deductionCalculation = employeeDeductionsService.calculateEmployeeDeductions(calculation.employeeId, currentCalculation.grossSalary);
    
    // SYNC WITH EMPLOYEE DEDUCTIONS MANAGEMENT: Get PAYE and UIF from Employee Deductions calculations
    console.log('🔗 [PayrollManagement] Syncing PAYE/UIF from Employee Deductions Management for modal...');
    
    let linkedPAYE = currentCalculation.tax;
    let linkedUIF = currentCalculation.uif.employeeContribution;
    
    try {
      // Calculate PAYE and UIF using Employee Deductions Management logic (SA Payroll Calculator)
      const attendancePay = currentCalculation.attendancePay || 0;
      
      if (attendancePay > 0) {
        const employeeDeductionsResult = saPayrollCalculatorService.calculateEmployeePayroll(
          calculation.employeeId,
          calculation.employeeName,
          attendancePay
        );
        
        linkedPAYE = employeeDeductionsResult.paye;
        linkedUIF = employeeDeductionsResult.uif.employee;
        
        console.log('✅ [PayrollManagement] Successfully synced PAYE/UIF from Employee Deductions Management:', {
          employeeId: calculation.employeeId,
          employeeName: calculation.employeeName,
          attendancePay: `R${attendancePay.toFixed(2)}`,
          originalPAYE: `R${currentCalculation.tax.toFixed(2)}`,
          linkedPAYE: `R${linkedPAYE.toFixed(2)}`,
          originalUIF: `R${currentCalculation.uif.employeeContribution.toFixed(2)}`,
          linkedUIF: `R${linkedUIF.toFixed(2)}`,
          source: 'Employee Deductions Management (SA Payroll Calculator)'
        });
      } else {
        console.warn('⚠️ [PayrollManagement] No Attendance Pay found, using original PAYE/UIF values');
      }
    } catch (error) {
      console.error('❌ [PayrollManagement] Error syncing PAYE/UIF from Employee Deductions Management:', error);
      // Fall back to original values
    }
    
    // Structure the data properly for the modal using fresh data
    const detailedPayrollData = {
      ...currentCalculation,
      period: periodFilter,
      status: 'calculated',
      regularHours: attendance.regularHours,
      overtimeHours: attendance.overtimeHours,
      nightShiftHours: attendance.nightShiftHours,
      leaveHours: 0, // Not tracked in current attendance data
      allowances: {
        thirteenthMonthBonus: employeeAllowances.thirteenthMonthBonus || 0,
        retirementPlan: employeeAllowances.retirementPlan || 0,
        housingAllowance: employeeAllowances.housingAllowance || 0,
        motorVehicleAllowance: employeeAllowances.motorVehicleAllowance || 0,
        medicalAidAllowance: employeeAllowances.medicalAidAllowance || 0,
        otherAllowances: employeeAllowances.otherAllowances || 0,
        totalAllowances: currentCalculation.totalAllowances
      },
      deductions: {
        tax: linkedPAYE, // Now synced from Employee Deductions Management
        uif: linkedUIF, // Now synced from Employee Deductions Management
        medicalAid: deductionCalculation.deductions.medical || 0,
        retirementFund: deductionCalculation.deductions.retirement_plans || 0,
        salaryAdvance: currentCalculation.salaryAdvanceDeduction,
        employeeDeductions: currentCalculation.employeeDeductions,
        otherDeductions: Object.entries(deductionCalculation.deductions)
          .filter(([key]) => !['medical', 'retirement_plans'].includes(key))
          .reduce((sum, [, value]) => sum + (value || 0), 0),
        totalDeductions: linkedPAYE + linkedUIF + currentCalculation.salaryAdvanceDeduction + currentCalculation.employeeDeductions
      }
    };
    
    console.log('✅ [PayrollManagement] Payroll details modal data prepared with Employee Deductions sync:', {
      employeeName: detailedPayrollData.employeeName,
      PAYE: `R${detailedPayrollData.deductions.tax.toFixed(2)}`,
      UIF: `R${detailedPayrollData.deductions.uif.toFixed(2)}`,
      source: 'Synced from Employee Deductions Management (SA Payroll Calculator)'
    });
    
    setSelectedPayrollData(detailedPayrollData);
    setShowPayrollDetails(true);
  };

  // Removed PAYE sync from Accounting handler and state
  
  // Download payslip
  const [downloadingPayslips, setDownloadingPayslips] = useState<Set<string>>(new Set());
  
  const handleDownloadPayslip = (calculation: any) => {
    // Prevent multiple simultaneous downloads for the same employee
    if (downloadingPayslips.has(calculation.employeeId)) {
      return;
    }
    
    try {
      // Get employee data from localStorage
      const employeesData = localStorage.getItem('employees');
      if (!employeesData) {
        toast.error('Employee data not found');
        return;
      }
      
      const employees: Employee[] = JSON.parse(employeesData);
      const employee = employees.find(emp => emp.id === calculation.employeeId);
      
      if (!employee) {
        toast.error('Employee not found');
        return;
      }
      
      // Mark as downloading
      setDownloadingPayslips(prev => new Set(prev).add(calculation.employeeId));
      
      // Show loading toast
      const loadingToast = toast.loading('Generating payslip PDF...');
      
      try {
        // Generate the payslip
        PayslipService.generatePayslip(employee, calculation);
        
        // Dismiss the loading toast
        toast.dismiss(loadingToast);
        
        // Show success message
        toast.success('Payslip downloaded successfully!');
      } catch (pdfError) {
        // Dismiss the loading toast
        toast.dismiss(loadingToast);
        throw pdfError;
      } finally {
        // Remove from downloading set
        setDownloadingPayslips(prev => {
          const newSet = new Set(prev);
          newSet.delete(calculation.employeeId);
          return newSet;
        });
      }
      
    } catch (error) {
      console.error('Error downloading payslip:', error);
      toast.error('Failed to download payslip');
      // Ensure we remove from downloading set on error
      setDownloadingPayslips(prev => {
        const newSet = new Set(prev);
        newSet.delete(calculation.employeeId);
        return newSet;
      });
    }
  };
  
  // Filter salary data
  const filteredCalculations = salaryData.filter(calc => {
    const matchesSearch = calc.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'calculated' && calc.grossSalary > 0) ||
                         (statusFilter === 'pending' && calc.grossSalary === 0);
    return matchesSearch && matchesStatus;
  });
  
  // Generate payroll summary
  const payrollSummary = {
    totalEmployees: filteredCalculations.length,
    totalGrossSalary: filteredCalculations.reduce((sum, calc) => sum + calc.grossSalary, 0),
    totalDeductions: filteredCalculations.reduce((sum, calc) => sum + (calc.tax + calc.uif.employeeContribution), 0),
    totalNetSalary: filteredCalculations.reduce((sum, calc) => sum + calc.netSalary, 0),
    totalRegularHours: filteredCalculations.reduce((sum, calc) => {
      const attendance = getMonthlyAttendance(calc.employeeId);
      return sum + attendance.regularHours;
    }, 0),
    totalOvertimeHours: filteredCalculations.reduce((sum, calc) => {
      const attendance = getMonthlyAttendance(calc.employeeId);
      return sum + attendance.overtimeHours;
    }, 0),
    totalNightShiftHours: filteredCalculations.reduce((sum, calc) => {
      const attendance = getMonthlyAttendance(calc.employeeId);
      return sum + attendance.nightShiftHours;
    }, 0),
    totalLeaveHours: 0
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sf-pro">Payroll Management</h2>
          <p className="text-slate-600 font-sf-pro">Calculate payroll with Time & Attendance integration</p>
        </div>
        
      </div>

      <Tabs defaultValue="payroll" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payroll">Payroll Calculations</TabsTrigger>
          <TabsTrigger value="advances">Salary Advances</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payroll" className="space-y-6">
          <div className="flex gap-3">
            <Button
              onClick={() => setShowDeductionsModal(true)}
              variant="outline"
              className="font-sf-pro"
            >
              <Minus className="h-4 w-4 mr-2" />
              Employee Deductions
            </Button>
            
            <Dialog open={showAdvanceModal} onOpenChange={setShowAdvanceModal}>
              <DialogTrigger asChild>
                <Button variant="outline" className="font-sf-pro">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Salary Advance
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Request Salary Advance</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Employee</label>
                    <Select value={advanceForm.employeeId} onValueChange={(value) => setAdvanceForm(prev => ({ ...prev, employeeId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {salaryData.map(calc => (
                          <SelectItem key={calc.employeeId} value={calc.employeeId}>
                            {calc.employeeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (R)</label>
                    <Input
                      type="number"
                      value={advanceForm.amount}
                      onChange={(e) => setAdvanceForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="Enter amount"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Reason</label>
                    <Textarea
                      value={advanceForm.reason}
                      onChange={(e) => setAdvanceForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Reason for salary advance"
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowAdvanceModal(false)}>Cancel</Button>
                    <Button onClick={handleSalaryAdvanceRequest}>Submit Request</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* PAYE sync button removed as requested */}
            
            <Button
              onClick={handleCalculatePayroll}
              disabled={isCalculating}
              className="bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 hover:from-mokm-purple-600 hover:to-mokm-blue-600 font-sf-pro"
            >
              {isCalculating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4 mr-2" />
              )}
              {isCalculating ? 'Calculating...' : 'Calculate Payroll'}
            </Button>
          </div>


      
      {/* Payroll Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Total Employees</p>
                <p className="text-2xl font-bold text-slate-900 font-sf-pro">{payrollSummary.totalEmployees}</p>
              </div>
              <User className="h-8 w-8 text-mokm-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Gross Payroll</p>
                <p className="text-2xl font-bold text-green-600 font-sf-pro">R {payrollSummary.totalGrossSalary.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600 font-sf-pro">R {payrollSummary.totalDeductions.toLocaleString()}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Net Payroll</p>
                <p className="text-2xl font-bold text-mokm-purple-600 font-sf-pro">R {payrollSummary.totalNetSalary.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-mokm-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Hours Summary */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="font-sf-pro flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time & Attendance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900 font-sf-pro">{payrollSummary.totalRegularHours.toFixed(1)}</p>
              <p className="text-sm text-slate-600 font-sf-pro">Regular Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600 font-sf-pro">{payrollSummary.totalOvertimeHours.toFixed(1)}</p>
              <p className="text-sm text-slate-600 font-sf-pro">Overtime Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 font-sf-pro">{payrollSummary.totalNightShiftHours.toFixed(1)}</p>
              <p className="text-sm text-slate-600 font-sf-pro">Night Shift Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 font-sf-pro">{payrollSummary.totalLeaveHours.toFixed(1)}</p>
              <p className="text-sm text-slate-600 font-sf-pro">Leave Hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Employee Payroll Table */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="font-sf-pro">Employee Payroll Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 font-sf-pro"
              />
            </div>
            
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={new Date().toISOString().slice(0, 7)}>Current Month</SelectItem>
                <SelectItem value={new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)}>Last Month</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="calculated">Calculated</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Employee</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Base Salary</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Hours</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Attendance Pay</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Allowances</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Gross Salary</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Salary Advance</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Employee Deductions</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Net Salary</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalculations.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-slate-500 font-sf-pro">
                      {salaryData.length === 0 
                        ? "No payroll calculated yet. Click 'Calculate Payroll' to begin."
                        : "No employees match your search criteria."
                      }
                    </td>
                  </tr>
                ) : (
                  filteredCalculations.map((calculation) => (
                    <tr key={calculation.employeeId} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900 font-sf-pro">{calculation.employeeName}</p>
                          <p className="text-sm text-slate-500 font-sf-pro">{calculation.employeeId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sf-pro">R {calculation.baseSalary.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="text-xs font-sf-pro space-y-0.5">
                          {(() => {
                            const attendance = getMonthlyAttendance(calculation.employeeId);
                            return (
                              <>
                                <div className="leading-tight">Regular: {attendance.regularHours.toFixed(1)}h</div>
                                <div className="text-orange-600 leading-tight">OT: {attendance.overtimeHours.toFixed(1)}h</div>
                                <div className="text-purple-600 leading-tight">Night: {attendance.nightShiftHours.toFixed(1)}h</div>
                                <div className="text-blue-600 leading-tight">Leave: 0.0h</div>
                              </>
                            );
                          })()} 
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sf-pro">R {calculation.attendancePay.toLocaleString()}</td>
                      <td className="py-3 px-4 font-sf-pro">R {calculation.totalAllowances.toLocaleString()}</td>
                      <td className="py-3 px-4 font-sf-pro font-semibold text-green-600">R {calculation.grossSalary.toLocaleString()}</td>
                      <td className="py-3 px-4 font-sf-pro font-semibold text-red-600">
                        {calculation.salaryAdvanceDeduction > 0 ? `-R ${calculation.salaryAdvanceDeduction.toLocaleString()}` : 'R 0'}
                      </td>
                      <td className="py-3 px-4 font-sf-pro font-semibold text-red-600">
                        -R {(calculation.tax + calculation.uif.employeeContribution + calculation.salaryAdvanceDeduction + calculation.employeeDeductions).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-sf-pro font-semibold text-mokm-purple-600">R {calculation.netSalary.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Get allowances from localStorage for detailed view
                              const employeeAllowances = JSON.parse(localStorage.getItem(`employee_allowances_${calculation.employeeId}`) || '{}');
                              const payrollCalc = {
                                ...calculation,
                                period: periodFilter,
                                status: 'calculated',
                                regularHours: getMonthlyAttendance(calculation.employeeId).regularHours,
                                overtimeHours: getMonthlyAttendance(calculation.employeeId).overtimeHours,
                                nightShiftHours: getMonthlyAttendance(calculation.employeeId).nightShiftHours,
                                leaveHours: 0,
                                allowances: {
                                  thirteenthMonthBonus: employeeAllowances.thirteenthMonthBonus || 0,
                                  retirementPlan: employeeAllowances.retirementPlan || 0,
                                  housingAllowance: employeeAllowances.housingAllowance || 0,
                                  motorVehicleAllowance: employeeAllowances.motorVehicleAllowance || 0,
                                  medicalAidAllowance: employeeAllowances.medicalAidAllowance || 0,
                                  otherAllowances: employeeAllowances.otherAllowances || 0,
                                  totalAllowances: calculation.totalAllowances
                                },
                                deductions: {
                                  tax: calculation.tax,
                                  uif: calculation.uif.employeeContribution,
                                  medicalAid: 0,
                                  retirementFund: 0,
                                  salaryAdvance: calculation.salaryAdvanceDeduction,
                                  employeeDeductions: calculation.employeeDeductions,
                                  otherDeductions: 0,
                                  totalDeductions: calculation.tax + calculation.uif.employeeContribution + calculation.salaryAdvanceDeduction + calculation.employeeDeductions
                                }
                              };
                              handleViewPayrollDetails(payrollCalc);
                            }}
                            className="font-sf-pro"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const payrollCalc = {
                                ...calculation,
                                period: periodFilter,
                                status: 'calculated'
                              };
                              handleDownloadPayslip(payrollCalc);
                            }}
                            disabled={downloadingPayslips.has(calculation.employeeId)}
                            className="font-sf-pro text-mokm-purple-600 hover:text-mokm-purple-700 hover:bg-mokm-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={downloadingPayslips.has(calculation.employeeId) ? "Generating payslip..." : "Download Payslip"}
                          >
                            {downloadingPayslips.has(calculation.employeeId) ? (
                              <div className="animate-spin h-4 w-4 border-2 border-mokm-purple-600 border-t-transparent rounded-full" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                          <Badge 
                            variant="secondary"
                            className="font-sf-pro"
                          >
                            calculated
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      


      {/* Payroll Details Modal */}
      <Dialog open={showPayrollDetails} onOpenChange={setShowPayrollDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900 font-sf-pro">
              Payroll Details - {selectedPayrollData?.employeeName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPayrollData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sf-pro">Employee Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Employee ID:</span>
                    <span className="font-medium font-sf-pro">{selectedPayrollData.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Name:</span>
                    <span className="font-medium font-sf-pro">{selectedPayrollData.employeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Base Salary:</span>
                    <span className="font-medium font-sf-pro">R {selectedPayrollData.baseSalary?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Period:</span>
                    <span className="font-medium font-sf-pro">{selectedPayrollData.period}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Status:</span>
                    <Badge 
                      variant={selectedPayrollData.status === 'paid' ? 'default' : 'secondary'}
                      className="font-sf-pro"
                    >
                      {selectedPayrollData.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Hours Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sf-pro">Hours Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Regular Hours:</span>
                    <span className="font-medium font-sf-pro">{(selectedPayrollData.regularHours || 0).toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-600 font-sf-pro">Overtime Hours:</span>
                    <span className="font-medium font-sf-pro">{(selectedPayrollData.overtimeHours || 0).toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-600 font-sf-pro">Night Shift Hours:</span>
                    <span className="font-medium font-sf-pro">{(selectedPayrollData.nightShiftHours || 0).toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600 font-sf-pro">Leave Hours:</span>
                    <span className="font-medium font-sf-pro">{(selectedPayrollData.leaveHours || 0).toFixed(1)}h</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-900 font-sf-pro">Total Hours:</span>
                      <span className="font-sf-pro">
                        {((selectedPayrollData.regularHours || 0) + (selectedPayrollData.overtimeHours || 0) + 
                          (selectedPayrollData.nightShiftHours || 0) + (selectedPayrollData.leaveHours || 0)).toFixed(1)}h
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Earnings Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sf-pro">Earnings Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Base Salary:</span>
                    <span className="font-medium font-sf-pro">R {selectedPayrollData.baseSalary?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Attendance Pay:</span>
                    <span className="font-medium font-sf-pro">R {selectedPayrollData.attendancePay?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Total Allowances:</span>
                    <span className="font-medium font-sf-pro">R {selectedPayrollData.allowances?.totalAllowances?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-green-600 font-sf-pro">Gross Salary:</span>
                      <span className="text-green-600 font-sf-pro">R {selectedPayrollData.grossSalary?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deductions Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sf-pro">Deductions Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro flex items-center gap-1">
                      PAYE:
                      <span className="flex w-3 h-3 bg-green-100 rounded-full text-[8px] text-green-700 items-center justify-center" title="Synced from Employee Deductions Management (SA Payroll Calculator)">✓</span>
                    </span>
                    <span className="font-medium font-sf-pro">R {selectedPayrollData.deductions?.tax?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro flex items-center gap-1">
                      UIF:
                      <span className="flex w-3 h-3 bg-green-100 rounded-full text-[8px] text-green-700 items-center justify-center" title="Synced from Employee Deductions Management (SA Payroll Calculator)">✓</span>
                    </span>
                    <span className="font-medium font-sf-pro">R {selectedPayrollData.deductions?.uif?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Medical Aid:</span>
                    <span className="font-medium font-sf-pro">R {selectedPayrollData.deductions?.medicalAid?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Retirement Fund:</span>
                    <span className="font-medium font-sf-pro">R {selectedPayrollData.deductions?.retirementFund?.toLocaleString() || '0'}</span>
                  </div>
                  {(selectedPayrollData.deductions?.salaryAdvance || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-600 font-sf-pro">Salary Advance:</span>
                      <span className="text-red-600 font-medium font-sf-pro">R {selectedPayrollData.deductions?.salaryAdvance?.toLocaleString() || '0'}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Other Deductions:</span>
                    <span className="font-medium font-sf-pro">R {selectedPayrollData.deductions?.otherDeductions?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-red-600 font-sf-pro">Total Deductions:</span>
                      <span className="text-red-600 font-sf-pro">R {selectedPayrollData.deductions?.totalDeductions?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Allowances Breakdown */}
              {(selectedPayrollData.allowances?.totalAllowances || 0) > 0 && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="font-sf-pro">Allowances Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(selectedPayrollData.allowances?.housingAllowance || 0) > 0 && (
                        <div className="text-center">
                          <div className="text-sm text-slate-600 font-sf-pro">Housing</div>
                          <div className="font-medium font-sf-pro">R {selectedPayrollData.allowances?.housingAllowance?.toLocaleString() || '0'}</div>
                        </div>
                      )}
                      {(selectedPayrollData.allowances?.motorVehicleAllowance || 0) > 0 && (
                        <div className="text-center">
                          <div className="text-sm text-slate-600 font-sf-pro">Motor Vehicle</div>
                          <div className="font-medium font-sf-pro">R {selectedPayrollData.allowances?.motorVehicleAllowance?.toLocaleString() || '0'}</div>
                        </div>
                      )}
                      {(selectedPayrollData.allowances?.medicalAidAllowance || 0) > 0 && (
                        <div className="text-center">
                          <div className="text-sm text-slate-600 font-sf-pro">Medical Aid</div>
                          <div className="font-medium font-sf-pro">R {selectedPayrollData.allowances?.medicalAidAllowance?.toLocaleString() || '0'}</div>
                        </div>
                      )}
                      {(selectedPayrollData.allowances?.otherAllowances || 0) > 0 && (
                        <div className="text-center">
                          <div className="text-sm text-slate-600 font-sf-pro">Other</div>
                          <div className="font-medium font-sf-pro">R {selectedPayrollData.allowances?.otherAllowances?.toLocaleString() || '0'}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Net Salary Summary */}
              <Card className="md:col-span-2 bg-gradient-to-r from-purple-50 to-blue-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 font-sf-pro">Net Salary</h3>
                    <div className="text-3xl font-bold text-purple-600 font-sf-pro">
                      R {selectedPayrollData.netSalary?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-slate-600 mt-2 font-sf-pro">
                      Base Salary + Attendance Pay + Allowances - Total Deductions
                    </div>
                    <div className="text-sm text-slate-500 mt-1 font-sf-pro">
                      R {selectedPayrollData.baseSalary?.toLocaleString() || '0'} + R {selectedPayrollData.attendancePay?.toLocaleString() || '0'} + R {selectedPayrollData.allowances?.totalAllowances?.toLocaleString() || '0'} - R {selectedPayrollData.deductions?.totalDeductions?.toLocaleString() || '0'}
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => setShowPayrollDetails(false)}
                  className="font-sf-pro"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Employee Deductions Modal */}
      <Dialog open={showDeductionsModal} onOpenChange={setShowDeductionsModal}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Deductions Management</DialogTitle>
          </DialogHeader>
          <EmployeeDeductionsManagement onClose={() => setShowDeductionsModal(false)} />
        </DialogContent>
      </Dialog>
        </TabsContent>
        
        <TabsContent value="advances" className="space-y-6">
          {/* Request New Salary Advance */}
          <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro">Request Salary Advance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 font-sf-pro mb-4">Submit new salary advance requests for employees.</p>
              <Dialog open={showAdvanceModal} onOpenChange={setShowAdvanceModal}>
                <DialogTrigger asChild>
                  <Button className="font-sf-pro">
                    <CreditCard className="h-4 w-4 mr-2" />
                    New Salary Advance Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Request Salary Advance</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Employee</label>
                      <Select value={advanceForm.employeeId} onValueChange={(value) => setAdvanceForm(prev => ({ ...prev, employeeId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {salaryData.map(calc => (
                            <SelectItem key={calc.employeeId} value={calc.employeeId}>
                              {calc.employeeName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Amount (R)</label>
                      <Input
                        type="number"
                        value={advanceForm.amount}
                        onChange={(e) => setAdvanceForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="Enter amount"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Reason</label>
                      <Textarea
                        value={advanceForm.reason}
                        onChange={(e) => setAdvanceForm(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder="Reason for salary advance"
                      />
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowAdvanceModal(false)}>Cancel</Button>
                      <Button onClick={handleSalaryAdvanceRequest}>Submit Request</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Existing Salary Advances */}
          <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro">Salary Advance Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Employee</th>
                      <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Amount</th>
                      <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Reason</th>
                      <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Request Date</th>
                      <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Deduction Period</th>
                      <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryAdvances.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-500 font-sf-pro">
                          No salary advances found. Click "New Salary Advance Request" to create one.
                        </td>
                      </tr>
                    ) : (
                      salaryAdvances.map((advance) => (
                        <tr key={advance.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-slate-900 font-sf-pro">{advance.employeeName}</p>
                              <p className="text-sm text-slate-500 font-sf-pro">{advance.employeeId}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-sf-pro font-semibold text-green-600">
                            R {advance.amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-sf-pro text-slate-600">
                            {advance.reason}
                          </td>
                          <td className="py-3 px-4 font-sf-pro text-slate-600">
                            {new Date(advance.requestDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-sf-pro text-slate-600">
                            {advance.deductionPeriod}
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={advance.status === 'approved' ? 'default' : advance.status === 'pending' ? 'secondary' : 'destructive'}
                              className="font-sf-pro"
                            >
                              {advance.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {advance.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproveSalaryAdvance(advance.id)}
                                  className="font-sf-pro text-green-600 border-green-600 hover:bg-green-50"
                                >
                                  Approve
                                </Button>
                              )}
                              {advance.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectSalaryAdvance(advance.id)}
                                  className="font-sf-pro text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  Reject
                                </Button>
                              )}
                              {advance.status === 'approved' && (
                                <Badge variant="outline" className="font-sf-pro text-green-600">
                                  Deducted from Payroll
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        

        
      </Tabs>
    </div>
  );
};

export default PayrollManagement;
