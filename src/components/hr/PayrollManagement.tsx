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
  Users,
  Briefcase,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { useLocalization } from '@/hooks/useLocalization';
import { localizationService } from '@/services/localizationService';
import { getAttendancePayExpensesSummary, updateAllActiveProjectsWithAttendanceExpenses, ensureAssignedEmployeesFromManager } from '@/services/projectAttendanceExpenseService';
import ExpenseProjectSyncService from '@/services/expenseProjectSyncService';
import { Project } from '@/types/project';

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

// Project Expenses Tab (moved from AllowanceManagement) - top-level component
const ProjectExpensesTab: React.FC = () => {
  const { formatCurrency } = useLocalization();
  const [projectExpensesSummary, setProjectExpensesSummary] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    loadProjectData();
  }, []);

  const loadProjectData = () => {
    setIsLoadingProjects(true);
    try {
      const projectsRaw = localStorage.getItem('projects');
      const loadedProjects: Project[] = projectsRaw ? JSON.parse(projectsRaw) : [];
      setProjects(loadedProjects);

      const summary = getAttendancePayExpensesSummary();
      setProjectExpensesSummary(summary);
    } catch (error) {
      console.error('Error loading project data:', error);
      toast.error('Failed to load project data');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleUpdateProjectExpenses = () => {
    setIsLoadingProjects(true);
    try {
      ensureAssignedEmployeesFromManager();
      updateAllActiveProjectsWithAttendanceExpenses();
      ExpenseProjectSyncService.getInstance().updateAllProjectExpenses();
      loadProjectData();
      toast.success('Project expenses updated with attendance pay');
    } catch (error) {
      console.error('Error updating project expenses:', error);
      toast.error('Failed to update project expenses');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  if (isLoadingProjects) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mokm-purple-600 mx-auto mb-2"></div>
          <p className="text-sm text-slate-500">Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sf-pro text-slate-100">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-slate-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sf-pro text-slate-100">{projectExpensesSummary?.projectCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sf-pro text-slate-100">Assigned Employees</CardTitle>
            <Users className="h-4 w-4 text-slate-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sf-pro text-slate-100">{projectExpensesSummary?.employeeCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sf-pro text-slate-100">Total Attendance Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sf-pro text-green-300">
              {formatCurrency(projectExpensesSummary?.totalAttendanceExpenses || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sf-pro text-slate-100">Update Expenses</CardTitle>
            <Calculator className="h-4 w-4 text-slate-300" />
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleUpdateProjectExpenses}
              disabled={isLoadingProjects}
              className="w-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 hover:from-mokm-purple-600 hover:to-mokm-blue-600 text-white"
            >
              {isLoadingProjects ? 'Updating...' : 'Update Now'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Project Breakdown Table */}
      <Card className="bg-white border border-slate-200 dark:glass dark:backdrop-blur-sm dark:bg-slate-900/40 dark:border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="font-sf-pro text-slate-900 dark:text-slate-100">Project Attendance Expenses Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {projectExpensesSummary?.breakdown && projectExpensesSummary.breakdown.length > 0 ? (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Project Name</TableHead>
                    <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Assigned Employees</TableHead>
                    <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Monthly Attendance Pay</TableHead>
                    <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectExpensesSummary.breakdown.map((project: any, index: number) => {
                    const projectData = projects.find(p => p.name === project.projectName);
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium font-sf-pro text-slate-900 dark:text-slate-100">{project.projectName}</TableCell>
                        <TableCell className="font-sf-pro text-slate-600 dark:text-slate-300">{project.employeeCount}</TableCell>
                        <TableCell className="font-sf-pro text-green-700 dark:text-green-300">
                          {formatCurrency(project.totalAttendancePay)}
                        </TableCell>
                        <TableCell className="font-sf-pro">
                          <span className={`px-2 py-1 rounded-full text-xs border ${
                            projectData?.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/40' :
                            projectData?.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/40' :
                            projectData?.status === 'Planning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/40' :
                            'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-white/10'
                          }`}>
                            {projectData?.status || 'Unknown'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-slate-400 dark:text-gray-400 mx-auto mb-4" />
              <p className="font-sf-pro text-slate-700 dark:text-slate-300">No active projects with assigned employees found.</p>
              <p className="text-sm font-sf-pro mt-2 text-slate-600 dark:text-slate-500">
                Assign employees to projects in the Projects page to see attendance expenses here.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <Button 
                  variant="outline"
                  onClick={handleUpdateProjectExpenses}
                  className="border-white/10"
                >
                  Refresh
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="font-sf-pro text-slate-100">How Project Attendance Expenses Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-slate-300">
            <p className="font-sf-pro">
              <span className="text-blue-300 font-medium">Automatic Integration:</span> When employees are assigned to projects, their attendance pay automatically becomes part of the project expenses.
            </p>
            <p className="font-sf-pro">
              <span className="text-blue-300 font-medium">Real-time Calculation:</span> Attendance pay is calculated based on regular hours, overtime (1.5x), and night shift allowances (10%).
            </p>
            <p className="font-sf-pro">
              <span className="text-blue-300 font-medium">Project Allocation:</span> Only the percentage of attendance pay allocated to each project is included in expenses.
            </p>
            <p className="font-sf-pro">
              <span className="text-blue-300 font-medium">Duration-based:</span> Expenses continue until the project is marked as 100% complete.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

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
  console.log(`🔍 [calculateEmployeeSalary] Employee Salary: ${localizationService.formatCurrency(employee.salary || 0)}`);
  
  const baseSalary = employee.salary || 0;
  const hourlyRate = baseSalary / STANDARD_MONTHLY_HOURS;
  
  console.log(`🔍 [calculateEmployeeSalary] Base Salary: ${localizationService.formatCurrency(baseSalary)}, Hourly Rate: ${localizationService.formatCurrency(Number(hourlyRate.toFixed(2)))}`);
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
  console.log(`  - Total advance deduction: ${localizationService.formatCurrency(Number(salaryAdvanceDeduction.toFixed(2)))}`);
  
  // Calculate employee deductions from Employee Deductions Management
  const deductionCalculation = employeeDeductionsService.calculateEmployeeDeductions(employee.id, grossSalary);
  const employeeDeductions = deductionCalculation.totalDeductions;
  
  // Calculate net salary (gross - tax - uif - salary advances - employee deductions)
  const netSalary = grossSalary - tax - uif.employeeContribution - salaryAdvanceDeduction - employeeDeductions;
  
  console.log(`Salary for ${employee.firstName} ${employee.surname}: Attendance Pay = ${localizationService.formatCurrency(Number(attendancePay.toFixed(2)))}, Advance Deduction = ${localizationService.formatCurrency(Number(salaryAdvanceDeduction.toFixed(2)))}, Employee Deductions = ${localizationService.formatCurrency(Number(employeeDeductions.toFixed(2)))}`);
  
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
    baseSalary: localizationService.formatCurrency(Number(finalCalculation.baseSalary.toFixed(2))),
    attendancePay: localizationService.formatCurrency(Number(finalCalculation.attendancePay.toFixed(2))),
    grossSalary: localizationService.formatCurrency(Number(finalCalculation.grossSalary.toFixed(2))),
    netSalary: localizationService.formatCurrency(Number(finalCalculation.netSalary.toFixed(2)))
  });
  
  return finalCalculation;
};

const PayrollManagement: React.FC = () => {
  const { formatCurrency, getCurrencySymbol } = useLocalization();
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
        linkedUIF = employeeDeductionsResult.uifEmployee;

        console.log('✅ [PayrollManagement] Successfully synced PAYE/UIF from Employee Deductions Management:', {
          employeeId: calculation.employeeId,
          employeeName: calculation.employeeName,
          attendancePay: localizationService.formatCurrency(Number(attendancePay.toFixed(2))),
          originalPAYE: localizationService.formatCurrency(Number(currentCalculation.tax.toFixed(2))),
          linkedPAYE: localizationService.formatCurrency(Number(linkedPAYE.toFixed(2))),
          originalUIF: localizationService.formatCurrency(Number(currentCalculation.uif.employeeContribution.toFixed(2))),
          linkedUIF: localizationService.formatCurrency(Number(linkedUIF.toFixed(2))),
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
      PAYE: localizationService.formatCurrency(Number(detailedPayrollData.deductions.tax.toFixed(2))),
      UIF: localizationService.formatCurrency(Number(detailedPayrollData.deductions.uif.toFixed(2))),
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
      // Get employee data via employeeService
      const employees: Employee[] = getAllEmployees();
      if (!employees || employees.length === 0) {
        toast.error('Employee data not found');
        return;
      }
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
          <h2 className="text-2xl font-bold font-sf-pro text-slate-900 dark:text-slate-100">Payroll Management</h2>
          <p className="font-sf-pro text-slate-600 dark:text-slate-400">Calculate payroll with Time & Attendance integration</p>
        </div>
        
      </div>

      <Tabs defaultValue="payroll" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payroll">Payroll Calculations</TabsTrigger>
          <TabsTrigger value="advances">Salary Advances</TabsTrigger>
          <TabsTrigger value="projects">Project Expenses</TabsTrigger>
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
                <Button variant="outline" className="font-sf-pro dark:bg-black/30 dark:text-white dark:border-white/10">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Salary Advance
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md glass backdrop-blur-md bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white">
                <DialogHeader>
                  <DialogTitle className="text-slate-900 dark:text-white">Request Salary Advance</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Employee</label>
                    <Select value={advanceForm.employeeId} onValueChange={(value) => setAdvanceForm(prev => ({ ...prev, employeeId: value }))}>
                      <SelectTrigger className="bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                        <SelectValue placeholder="Select employee" className="text-slate-900 dark:text-white" />
                      </SelectTrigger>
                      <SelectContent className="glass backdrop-blur-md bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                        {salaryData.map(calc => (
                          <SelectItem key={calc.employeeId} value={calc.employeeId}>
                            {calc.employeeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Amount ({getCurrencySymbol()})</label>
                    <Input
                      type="number"
                      value={advanceForm.amount}
                      onChange={(e) => setAdvanceForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="Enter amount"
                      className="bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Reason</label>
                    <Textarea
                      value={advanceForm.reason}
                      onChange={(e) => setAdvanceForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Reason for salary advance"
                      className="bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-300"
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowAdvanceModal(false)} className="border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-black/30">Cancel</Button>
                    <Button onClick={handleSalaryAdvanceRequest} className="bg-mokm-purple-600 dark:bg-mokm-purple-700 hover:bg-mokm-purple-700 dark:hover:bg-mokm-purple-800">Submit Request</Button>
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
        <Card className="glass backdrop-blur-md bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shadow-business rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium font-sf-pro text-slate-600 dark:text-slate-400">Total Employees</p>
                <p className="text-2xl font-bold font-sf-pro text-slate-900 dark:text-slate-100">{payrollSummary.totalEmployees}</p>
              </div>
              <User className="h-8 w-8 text-mokm-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-md bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shadow-business rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium font-sf-pro text-slate-600 dark:text-slate-400">Gross Payroll</p>
                <p className="text-2xl font-bold text-emerald-400 font-sf-pro">{formatCurrency(payrollSummary.totalGrossSalary)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-md bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shadow-business rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium font-sf-pro text-slate-600 dark:text-slate-400">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 font-sf-pro">{formatCurrency(payrollSummary.totalDeductions)}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-md bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shadow-business rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium font-sf-pro text-slate-600 dark:text-slate-400">Net Payroll</p>
                <p className="text-2xl font-bold text-mokm-purple-600 dark:text-mokm-purple-300 font-sf-pro">{formatCurrency(payrollSummary.totalNetSalary)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-mokm-purple-600 dark:text-mokm-purple-300" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Hours Summary */}
      <Card className="glass backdrop-blur-md bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shadow-business rounded-xl">
        <CardHeader>
          <CardTitle className="font-sf-pro flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Clock className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            Time & Attendance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold font-sf-pro text-slate-900 dark:text-slate-100">{payrollSummary.totalRegularHours.toFixed(1)}</p>
              <p className="text-sm font-sf-pro text-slate-600 dark:text-slate-400">Regular Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-300 font-sf-pro">{payrollSummary.totalOvertimeHours.toFixed(1)}</p>
              <p className="text-sm font-sf-pro text-slate-600 dark:text-slate-400">Overtime Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-300 font-sf-pro">{payrollSummary.totalNightShiftHours.toFixed(1)}</p>
              <p className="text-sm font-sf-pro text-slate-600 dark:text-slate-400">Night Shift Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-300 font-sf-pro">{payrollSummary.totalLeaveHours.toFixed(1)}</p>
              <p className="text-sm font-sf-pro text-slate-600 dark:text-slate-400">Leave Hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Employee Payroll Table */}
      <Card className="glass backdrop-blur-md bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shadow-business rounded-xl">
        <CardHeader>
          <CardTitle className="font-sf-pro text-slate-900 dark:text-slate-100">Employee Payroll Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 font-sf-pro bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
              />
            </div>
            
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-40 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100">
                <SelectValue className="text-slate-900 dark:text-slate-100" />
              </SelectTrigger>
              <SelectContent className="glass backdrop-blur-md bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100">
                <SelectItem value={new Date().toISOString().slice(0, 7)}>Current Month</SelectItem>
                <SelectItem value={new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)}>Last Month</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100">
                <SelectValue className="text-slate-900 dark:text-slate-100" />
              </SelectTrigger>
              <SelectContent className="glass backdrop-blur-md bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100">
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
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700 dark:text-slate-300">Employee</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700 dark:text-slate-300">Base Salary</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700 dark:text-slate-300">Hours</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700 dark:text-slate-300">Attendance Pay</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700 dark:text-slate-300">Allowances</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700 dark:text-slate-300">Gross Salary</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700 dark:text-slate-300">Salary Advance</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700 dark:text-slate-300">Employee Deductions</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700 dark:text-slate-300">Net Salary</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalculations.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 font-sf-pro text-slate-600 dark:text-slate-400">
                      {salaryData.length === 0 
                        ? "No payroll calculated yet. Click 'Calculate Payroll' to begin."
                        : "No employees match your search criteria."
                      }
                    </td>
                  </tr>
                ) : (
                  filteredCalculations.map((calculation) => (
                    <tr key={calculation.employeeId} className="border-b border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium font-sf-pro text-slate-900 dark:text-slate-100">{calculation.employeeName}</p>
                          <p className="text-sm font-sf-pro text-slate-600 dark:text-slate-400">{calculation.employeeId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sf-pro text-slate-900 dark:text-slate-200">{formatCurrency(calculation.baseSalary)}</td>
                      <td className="py-3 px-4">
                        <div className="text-xs font-sf-pro space-y-0.5">
                          {(() => {
                            const attendance = getMonthlyAttendance(calculation.employeeId);
                            return (
                              <>
                                <div className="leading-tight text-slate-700 dark:text-slate-300">Regular: {attendance.regularHours.toFixed(1)}h</div>
                                <div className="leading-tight text-orange-600 dark:text-orange-300">OT: {attendance.overtimeHours.toFixed(1)}h</div>
                                <div className="leading-tight text-purple-600 dark:text-purple-300">Night: {attendance.nightShiftHours.toFixed(1)}h</div>
                                <div className="leading-tight text-blue-600 dark:text-blue-300">Leave: 0.0h</div>
                              </>
                            );
                          })()} 
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sf-pro text-slate-900 dark:text-slate-200">{formatCurrency(calculation.attendancePay)}</td>
                      <td className="py-3 px-4 font-sf-pro text-slate-900 dark:text-slate-200">{formatCurrency(calculation.totalAllowances)}</td>
                      <td className="py-3 px-4 font-sf-pro font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(calculation.grossSalary)}</td>
                      <td className="py-3 px-4 font-sf-pro font-semibold text-red-600 dark:text-red-400">
                        {calculation.salaryAdvanceDeduction > 0 ? `-${formatCurrency(calculation.salaryAdvanceDeduction)}` : formatCurrency(0)}
                      </td>
                      <td className="py-3 px-4 font-sf-pro font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(-1 * (calculation.tax + calculation.uif.employeeContribution + calculation.salaryAdvanceDeduction + calculation.employeeDeductions))}
                      </td>
                      <td className="py-3 px-4 font-sf-pro font-semibold text-mokm-purple-600 dark:text-mokm-purple-300">{formatCurrency(calculation.netSalary)}</td>
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
                            className="font-sf-pro border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
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
                            className="font-sf-pro border border-slate-300 text-mokm-purple-600 hover:bg-slate-50 dark:border-white/10 dark:text-mokm-purple-300 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={downloadingPayslips.has(calculation.employeeId) ? "Generating payslip..." : "Download Payslip"}
                          >
                            {downloadingPayslips.has(calculation.employeeId) ? (
                              <div className="animate-spin h-4 w-4 border-2 border-mokm-purple-600 dark:border-mokm-purple-300 border-t-transparent rounded-full" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                          <Badge 
                            variant="secondary"
                            className="font-sf-pro bg-slate-100 border border-slate-300 text-slate-700 dark:bg-white/10 dark:border-white/10 dark:text-slate-200"
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-100 font-sf-pro">
              Payroll Details - {selectedPayrollData?.employeeName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPayrollData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Information */}
              <Card className="glass backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 rounded-xl">
                <CardHeader>
                  <CardTitle className="font-sf-pro text-slate-100">Employee Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sf-pro">Employee ID:</span>
                    <span className="font-medium font-sf-pro text-slate-100">{selectedPayrollData.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sf-pro">Name:</span>
                    <span className="font-medium font-sf-pro text-slate-100">{selectedPayrollData.employeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sf-pro">Base Salary:</span>
                    <span className="font-medium font-sf-pro text-slate-100">{formatCurrency(selectedPayrollData.baseSalary || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sf-pro">Period:</span>
                    <span className="font-medium font-sf-pro text-slate-100">{selectedPayrollData.period}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sf-pro">Status:</span>
                    <Badge 
                      variant={selectedPayrollData.status === 'paid' ? 'default' : 'secondary'}
                      className="font-sf-pro bg-slate-100 border border-slate-300 text-slate-700 dark:bg-white/10 dark:border-white/10 dark:text-slate-200"
                    >
                      {selectedPayrollData.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Hours Breakdown */}
              <Card className="glass backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 rounded-xl">
                <CardHeader>
                  <CardTitle className="font-sf-pro text-slate-100">Hours Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sf-pro">Regular Hours:</span>
                    <span className="font-medium font-sf-pro text-slate-100">{(selectedPayrollData.regularHours || 0).toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-300 font-sf-pro">Overtime Hours:</span>
                    <span className="font-medium font-sf-pro text-slate-100">{(selectedPayrollData.overtimeHours || 0).toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300 font-sf-pro">Night Shift Hours:</span>
                    <span className="font-medium font-sf-pro text-slate-100">{(selectedPayrollData.nightShiftHours || 0).toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300 font-sf-pro">Leave Hours:</span>
                    <span className="font-medium font-sf-pro text-slate-100">{(selectedPayrollData.leaveHours || 0).toFixed(1)}h</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-100 font-sf-pro">Total Hours:</span>
                      <span className="font-sf-pro text-slate-100">
                        {((selectedPayrollData.regularHours || 0) + (selectedPayrollData.overtimeHours || 0) + 
                          (selectedPayrollData.nightShiftHours || 0) + (selectedPayrollData.leaveHours || 0)).toFixed(1)}h
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Earnings Breakdown */}
              <Card className="glass backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 rounded-xl">
                <CardHeader>
                  <CardTitle className="font-sf-pro text-slate-100">Earnings Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sf-pro">Base Salary:</span>
                    <span className="font-medium font-sf-pro text-slate-100">{formatCurrency(selectedPayrollData.baseSalary || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sf-pro">Attendance Pay:</span>
                    <span className="font-medium font-sf-pro text-slate-100">{formatCurrency(selectedPayrollData.attendancePay || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sf-pro">Total Allowances:</span>
                    <span className="font-medium font-sf-pro text-slate-100">{formatCurrency(selectedPayrollData.allowances?.totalAllowances || 0)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-emerald-300 font-sf-pro">Gross Salary:</span>
                      <span className="text-emerald-300 font-sf-pro">{formatCurrency(selectedPayrollData.grossSalary || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deductions Breakdown */}
              <Card className="glass backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 rounded-xl">
                <CardHeader>
                  <CardTitle className="font-sf-pro text-slate-100">Deductions Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sf-pro flex items-center gap-1">
                      PAYE:
                      <span className="flex w-3 h-3 bg-emerald-200/30 border border-emerald-300/30 rounded-full text-[8px] text-emerald-300 items-center justify-center" title="Synced from Employee Deductions Management (SA Payroll Calculator)">✓</span>
                    </span>
                    <span className="font-medium font-sf-pro text-slate-100">{formatCurrency(selectedPayrollData.deductions?.tax || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sf-pro flex items-center gap-1">
                      UIF:
                      <span className="flex w-3 h-3 bg-emerald-200/30 border border-emerald-300/30 rounded-full text-[8px] text-emerald-300 items-center justify-center" title="Synced from Employee Deductions Management (SA Payroll Calculator)">✓</span>
                    </span>
                    <span className="font-medium font-sf-pro text-slate-100">{formatCurrency(selectedPayrollData.deductions?.uif || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sf-pro">Medical Aid:</span>
                    <span className="font-medium font-sf-pro text-slate-100">{formatCurrency(selectedPayrollData.deductions?.medicalAid || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sf-pro">Retirement Fund:</span>
                    <span className="font-medium font-sf-pro text-slate-100">{formatCurrency(selectedPayrollData.deductions?.retirementFund || 0)}</span>
                  </div>
                  {(selectedPayrollData.deductions?.salaryAdvance || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-400 font-sf-pro">Salary Advance:</span>
                      <span className="text-red-400 font-medium font-sf-pro">{formatCurrency(selectedPayrollData.deductions?.salaryAdvance || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sf-pro">Other Deductions:</span>
                    <span className="font-medium font-sf-pro text-slate-100">{formatCurrency(selectedPayrollData.deductions?.otherDeductions || 0)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-red-400 font-sf-pro">Total Deductions:</span>
                      <span className="text-red-400 font-sf-pro">{formatCurrency(selectedPayrollData.deductions?.totalDeductions || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Allowances Breakdown */}
              {(selectedPayrollData.allowances?.totalAllowances || 0) > 0 && (
                <Card className="md:col-span-2 glass backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 rounded-xl">
                  <CardHeader>
                    <CardTitle className="font-sf-pro text-slate-100">Allowances Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(selectedPayrollData.allowances?.housingAllowance || 0) > 0 && (
                        <div className="text-center">
                          <div className="text-sm text-slate-400 font-sf-pro">Housing</div>
                          <div className="font-medium font-sf-pro text-slate-100">{formatCurrency(selectedPayrollData.allowances?.housingAllowance || 0)}</div>
                        </div>
                      )}
                      {(selectedPayrollData.allowances?.motorVehicleAllowance || 0) > 0 && (
                        <div className="text-center">
                          <div className="text-sm text-slate-400 font-sf-pro">Motor Vehicle</div>
                          <div className="font-medium font-sf-pro text-slate-100">{formatCurrency(selectedPayrollData.allowances?.motorVehicleAllowance || 0)}</div>
                        </div>
                      )}
                      {(selectedPayrollData.allowances?.medicalAidAllowance || 0) > 0 && (
                        <div className="text-center">
                          <div className="text-sm text-slate-400 font-sf-pro">Medical Aid</div>
                          <div className="font-medium font-sf-pro text-slate-100">{formatCurrency(selectedPayrollData.allowances?.medicalAidAllowance || 0)}</div>
                        </div>
                      )}
                      {(selectedPayrollData.allowances?.otherAllowances || 0) > 0 && (
                        <div className="text-center">
                          <div className="text-sm text-slate-400 font-sf-pro">Other</div>
                          <div className="font-medium font-sf-pro text-slate-100">{formatCurrency(selectedPayrollData.allowances?.otherAllowances || 0)}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Net Salary Summary */}
              <Card className="md:col-span-2 glass backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 rounded-xl">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-100 mb-2 font-sf-pro">Net Salary</h3>
                    <div className="text-3xl font-bold text-mokm-purple-300 font-sf-pro">
                      {formatCurrency(selectedPayrollData.netSalary || 0)}
                    </div>
                    <div className="text-sm text-slate-400 mt-2 font-sf-pro">
                      Base Salary + Attendance Pay + Allowances - Total Deductions
                    </div>
                    <div className="text-sm text-slate-400 mt-1 font-sf-pro">
                      {`${formatCurrency(selectedPayrollData.baseSalary || 0)} + ${formatCurrency(selectedPayrollData.attendancePay || 0)} + ${formatCurrency(selectedPayrollData.allowances?.totalAllowances || 0)} - ${formatCurrency(selectedPayrollData.deductions?.totalDeductions || 0)}`}
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

        <TabsContent value="projects" className="space-y-6">
          <ProjectExpensesTab />
        </TabsContent>

        
        <TabsContent value="advances" className="space-y-6">
          {/* Request New Salary Advance */}
          <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro text-slate-100">Request Salary Advance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 font-sf-pro mb-4">Submit new salary advance requests for employees.</p>
              <Dialog open={showAdvanceModal} onOpenChange={setShowAdvanceModal}>
                <DialogTrigger asChild>
                  <Button className="font-sf-pro bg-slate-800/60 border border-white/10 text-slate-100 hover:bg-slate-800/80">
                    <CreditCard className="h-4 w-4 mr-2" />
                    New Salary Advance Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md glass backdrop-blur-md bg-slate-900/60 border border-white/10 rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-slate-100">Request Salary Advance</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Employee</label>
                      <Select value={advanceForm.employeeId} onValueChange={(value) => setAdvanceForm(prev => ({ ...prev, employeeId: value }))}>
                        <SelectTrigger className="bg-slate-900/40 border border-white/10 text-slate-100 placeholder:text-slate-400">
                          <SelectValue placeholder="Select employee" className="text-slate-100" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900/80 border border-white/10 text-slate-100">
                          {salaryData.map(calc => (
                            <SelectItem key={calc.employeeId} value={calc.employeeId}>
                              {calc.employeeName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Amount (R)</label>
                      <Input
                        type="number"
                        value={advanceForm.amount}
                        onChange={(e) => setAdvanceForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="Enter amount"
                        className="bg-slate-900/40 border border-white/10 text-slate-100 placeholder:text-slate-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Reason</label>
                      <Textarea
                        value={advanceForm.reason}
                        onChange={(e) => setAdvanceForm(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder="Reason for salary advance"
                        className="bg-slate-900/40 border border-white/10 text-slate-100 placeholder:text-slate-400"
                      />
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowAdvanceModal(false)} className="border-white/15 text-slate-200 hover:bg-white/5">Cancel</Button>
                      <Button onClick={handleSalaryAdvanceRequest} className="bg-slate-800/60 border border-white/10 text-slate-100 hover:bg-slate-800/80">Submit Request</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Existing Salary Advances */}
          <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro text-slate-100">Salary Advance Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-300">Employee</th>
                      <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-300">Amount</th>
                      <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-300">Reason</th>
                      <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-300">Request Date</th>
                      <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-300">Deduction Period</th>
                      <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-300">Status</th>
                      <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryAdvances.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400 font-sf-pro">
                          No salary advances found. Click "New Salary Advance Request" to create one.
                        </td>
                      </tr>
                    ) : (
                      salaryAdvances.map((advance) => (
                        <tr key={advance.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-slate-100 font-sf-pro">{advance.employeeName}</p>
                              <p className="text-sm text-slate-400 font-sf-pro">{advance.employeeId}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-sf-pro font-semibold text-emerald-400">
                            {formatCurrency(advance.amount || 0)}
                          </td>
                          <td className="py-3 px-4 font-sf-pro text-slate-300">
                            {advance.reason}
                          </td>
                          <td className="py-3 px-4 font-sf-pro text-slate-300">
                            {new Date(advance.requestDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-sf-pro text-slate-300">
                            {advance.deductionPeriod}
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={advance.status === 'approved' ? 'outline' : advance.status === 'pending' ? 'secondary' : 'destructive'}
                              className={
                                `font-sf-pro ${advance.status === 'approved' ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30' : ''} ` +
                                `${advance.status === 'pending' ? 'bg-slate-500/10 text-slate-300 border-white/10' : ''} ` +
                                `${advance.status === 'rejected' ? 'bg-red-400/10 text-red-300 border-red-400/30' : ''}`
                              }
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
                                  className="font-sf-pro text-emerald-300 border-emerald-400/30 hover:bg-emerald-400/10"
                                >
                                  Approve
                                </Button>
                              )}
                              {advance.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectSalaryAdvance(advance.id)}
                                  className="font-sf-pro text-red-300 border-red-400/30 hover:bg-red-400/10"
                                >
                                  Reject
                                </Button>
                              )}
                              {advance.status === 'approved' && (
                                <Badge variant="outline" className="font-sf-pro text-emerald-300 border-emerald-400/30">
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
