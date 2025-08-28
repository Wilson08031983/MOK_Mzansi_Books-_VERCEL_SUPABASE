import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalization } from '@/hooks/useLocalization';
import { DollarSign, Calculator, Users, PiggyBank, Car, Home, Heart, Shield, Edit, Save, Clock, Briefcase, TrendingUp } from 'lucide-react';
import { Employee } from '@/services/employeeService';
import { TimeEntry } from '@/components/hr/TimeAttendanceTypes';
import { toast } from 'sonner';
// Removed Project Expenses tab from Allowance; moved to Payroll
import { localizationService } from '@/services/localizationService';

// Types
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
  netSalary: number;
}

interface AllowanceManagementProps {
  employees: Employee[];
}

// Constants
const UIF_CONSTANTS = {
  EMPLOYEE_RATE: 0.01,
  EMPLOYER_RATE: 0.01,
  MONTHLY_SALARY_CAP: 17712,
  MAX_MONTHLY_CONTRIBUTION: 177.12
};

const STANDARD_MONTHLY_HOURS = 173.33;

// Utility Functions
const calculateUIF = (grossSalary: number): UIFCalculation => {
  const cappedSalary = Math.min(grossSalary, UIF_CONSTANTS.MONTHLY_SALARY_CAP);
  const employeeContribution = Math.min(cappedSalary * UIF_CONSTANTS.EMPLOYEE_RATE, UIF_CONSTANTS.MAX_MONTHLY_CONTRIBUTION);
  const employerContribution = Math.min(cappedSalary * UIF_CONSTANTS.EMPLOYER_RATE, UIF_CONSTANTS.MAX_MONTHLY_CONTRIBUTION);
  
  return { employeeContribution, employerContribution, cappedSalary };
};

const getMonthlyAttendance = (employeeId: string): MonthlyAttendance => {
  try {
    // Always ensure we have some attendance data for demonstration
    const attendanceSummariesRaw = localStorage.getItem('attendanceSummaries');
    let attendanceSummaries = [];
    
    if (attendanceSummariesRaw) {
      attendanceSummaries = JSON.parse(attendanceSummariesRaw);
    }
    
    // Find existing attendance summary for this employee
    let attendanceSummary = attendanceSummaries.find((summary: any) => summary.employeeId === employeeId);
    
    // If no attendance summary exists, create one with default data
    if (!attendanceSummary) {
      attendanceSummary = {
        employeeId,
        currentMonthRegularHours: 160, // Standard 8 hours/day * 20 working days
        currentMonthOvertimeHours: 0, // No overtime by default
        currentMonthNightShiftHours: 0, // No night shift by default
      };
      
      // Save the new attendance summary
      attendanceSummaries.push(attendanceSummary);
      localStorage.setItem('attendanceSummaries', JSON.stringify(attendanceSummaries));
    }
    
    const result = {
      employeeId,
      regularHours: attendanceSummary.currentMonthRegularHours || 0,
      overtimeHours: attendanceSummary.currentMonthOvertimeHours || 0,
      nightShiftHours: attendanceSummary.currentMonthNightShiftHours || 0,
      daysWorked: Math.ceil((attendanceSummary.currentMonthRegularHours || 0) / 8)
    };
    
    console.log(`Attendance data for ${employeeId}:`, result);
    return result;
    
  } catch (error) {
    console.error('Error getting attendance data:', error);
    // Return default realistic attendance data as fallback
    return { 
      employeeId, 
      regularHours: 30, 
      overtimeHours: 2, 
      nightShiftHours: 1, 
      daysWorked: 4 
    };
  }
};

const calculateEmployeeSalary = (employee: Employee, attendance: MonthlyAttendance, allowances: EmployeeAllowances): SalaryBreakdown => {
  const baseSalary = employee.salary || 0;
  const hourlyRate = baseSalary / STANDARD_MONTHLY_HOURS;
  
  // Calculate attendance-based pay with proper South African labor law rates
  const regularPay = attendance.regularHours * hourlyRate;
  const overtimePay = attendance.overtimeHours * hourlyRate * 1.5; // 1.5x for overtime
  const nightShiftPay = attendance.nightShiftHours * hourlyRate * 0.1; // 10% night shift allowance
  const attendancePay = regularPay + overtimePay + nightShiftPay;
  
  // Calculate total allowances
  const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
  
  // Calculate gross salary (attendance-based pay + allowances)
  const grossSalary = attendancePay + totalAllowances;
  
  // Calculate deductions
  const tax = grossSalary * ((employee.taxPercentage || 0) / 100);
  const uif = calculateUIF(grossSalary);
  const netSalary = grossSalary - tax - uif.employeeContribution;
  
  console.log(
    `Salary for ${employee.firstName} ${employee.surname}: Attendance Pay = ${localizationService.formatCurrency(
      attendancePay
    )}`
  );
  
  return {
    employeeId: employee.id,
    employeeName: `${employee.firstName} ${employee.surname}`,
    baseSalary,
    attendancePay,
    totalAllowances,
    grossSalary,
    tax,
    uif,
    netSalary
  };
};

// Project Expenses Tab Component
// Project Expenses UI moved to PayrollManagement

const AllowanceManagement: React.FC<AllowanceManagementProps> = ({ employees }) => {
  const { formatCurrency, getCurrencySymbol } = useLocalization();
  const [salaryData, setSalaryData] = useState<SalaryBreakdown[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'individual' | 'uif'>('overview');
  const [editingAllowances, setEditingAllowances] = useState<string | null>(null);
  const [tempAllowances, setTempAllowances] = useState<EmployeeAllowances>({
    thirteenthMonthBonus: 0,
    retirementPlan: 0,
    housingAllowance: 0,
    motorVehicleAllowance: 0,
    medicalAidAllowance: 0,
    otherAllowances: 0
  });

  useEffect(() => {
    if (employees.length > 0) {
      setIsLoading(true);
      try {
        // Ensure we have attendance data for all employees
        console.log('Initializing attendance data for employees...');
        
        const existingAttendanceSummaries = localStorage.getItem('attendanceSummaries');
        let attendanceSummaries = [];
        
        if (existingAttendanceSummaries) {
          attendanceSummaries = JSON.parse(existingAttendanceSummaries);
        }
        
        // Create attendance data for any missing employees
        employees.forEach(employee => {
          const existingSummary = attendanceSummaries.find((summary: any) => summary.employeeId === employee.id);
          if (!existingSummary) {
            const newSummary = {
              employeeId: employee.id,
              employeeName: `${employee.firstName} ${employee.surname}`,
              department: employee.department,
              position: employee.position,
              currentMonthRegularHours: 160, // Standard 8 hours/day * 20 working days
              currentMonthOvertimeHours: 0, // No overtime by default
              currentMonthNightShiftHours: 0, // No night shift by default
              currentWeekOvertimeHours: 0,
              currentDayOvertimeHours: 0,
              attendanceRate: 100, // Perfect attendance by default
              punctualityRate: 100, // Perfect punctuality by default
              leaveHoursTaken: 0,
              isExemptFromOvertimeRules: false
            };
            attendanceSummaries.push(newSummary);
          }
        });
        
        localStorage.setItem('attendanceSummaries', JSON.stringify(attendanceSummaries));
        console.log('Updated attendance summaries:', attendanceSummaries);
        
        const savedAllowances = localStorage.getItem('employeeAllowances');
        let existingAllowances: Record<string, EmployeeAllowances> = {};
        
        if (savedAllowances) {
          existingAllowances = JSON.parse(savedAllowances);
        }
        
        const calculatedSalaryData = employees.map(employee => {
          const attendance = getMonthlyAttendance(employee.id);
          const allowances = existingAllowances[employee.id] || {
            thirteenthMonthBonus: (employee.salary || 0) / 12,
            retirementPlan: 0,
            housingAllowance: 0,
            motorVehicleAllowance: 0,
            medicalAidAllowance: 0,
            otherAllowances: 0
          };
          
          const salaryBreakdown = calculateEmployeeSalary(employee, attendance, allowances);
          
          return salaryBreakdown;
        });
        
        setSalaryData(calculatedSalaryData);
        
        if (!selectedEmployeeId && calculatedSalaryData.length > 0) {
          setSelectedEmployeeId(calculatedSalaryData[0].employeeId);
        }
      } catch (error) {
        console.error('Error initializing salary data:', error);
        toast.error('Error loading salary data');
      } finally {
        setIsLoading(false);
      }
    }
  }, [employees, selectedEmployeeId]);

  const handleSaveAllowances = (employeeId: string) => {
    try {
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee) {
        // Save allowances to localStorage for PayrollManagement to use
        const existingAllowances = localStorage.getItem('employeeAllowances');
        const allAllowances = existingAllowances ? JSON.parse(existingAllowances) : {};
        allAllowances[employeeId] = tempAllowances;
        localStorage.setItem('employeeAllowances', JSON.stringify(allAllowances));
        
        const attendance = getMonthlyAttendance(employeeId);
        const updatedSalaryBreakdown = calculateEmployeeSalary(employee, attendance, tempAllowances);
        
        setSalaryData(prev => prev.map(data => 
          data.employeeId === employeeId ? updatedSalaryBreakdown : data
        ));
        
        setEditingAllowances(null);
        toast.success(`Allowances updated for ${employee.firstName} ${employee.surname} and synced to Payroll`);
      }
    } catch (error) {
      console.error('Error saving allowances:', error);
      toast.error('Failed to save allowances');
    }
  };

  const handleEditAllowances = (employeeId: string) => {
    // Load existing allowances from localStorage
    try {
      const existingAllowances = localStorage.getItem('employeeAllowances');
      if (existingAllowances) {
        const allAllowances = JSON.parse(existingAllowances);
        const employeeAllowances = allAllowances[employeeId];
        if (employeeAllowances) {
          setTempAllowances(employeeAllowances);
        } else {
          // Default allowances for new employee
          const employee = employees.find(emp => emp.id === employeeId);
          setTempAllowances({
            thirteenthMonthBonus: (employee?.salary || 0) / 12,
            retirementPlan: 0,
            housingAllowance: 0,
            motorVehicleAllowance: 0,
            medicalAidAllowance: 0,
            otherAllowances: 0
          });
        }
      } else {
        // Default allowances if no localStorage data
        const employee = employees.find(emp => emp.id === employeeId);
        setTempAllowances({
          thirteenthMonthBonus: (employee?.salary || 0) / 12,
          retirementPlan: 0,
          housingAllowance: 0,
          motorVehicleAllowance: 0,
          medicalAidAllowance: 0,
          otherAllowances: 0
        });
      }
    } catch (error) {
      console.error('Error loading existing allowances:', error);
      // Fallback to default allowances
      const employee = employees.find(emp => emp.id === employeeId);
      setTempAllowances({
        thirteenthMonthBonus: (employee?.salary || 0) / 12,
        retirementPlan: 0,
        housingAllowance: 0,
        motorVehicleAllowance: 0,
        medicalAidAllowance: 0,
        otherAllowances: 0
      });
    }
    
    setEditingAllowances(employeeId);
    setSelectedEmployeeId(employeeId);
    setActiveTab('individual');
  };

  const getSelectedEmployeeData = (): SalaryBreakdown | undefined => {
    return salaryData.find(data => data.employeeId === selectedEmployeeId);
  };

  const getTotalPayrollCost = (): number => {
    return salaryData.reduce((total, data) => total + data.grossSalary, 0);
  };

  const getTotalUIFContributions = (): { employee: number; employer: number; total: number } => {
    const totals = salaryData.reduce((acc, data) => {
      acc.employee += data.uif.employeeContribution;
      acc.employer += data.uif.employerContribution;
      return acc;
    }, { employee: 0, employer: 0 });
    
    return { ...totals, total: totals.employee + totals.employer };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mokm-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-sf-pro">Loading salary calculations...</p>
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="text-center p-8">
        <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-500 font-sf-pro mb-2">No Employees Found</h3>
        <p className="text-slate-400 font-sf-pro">
          Add employees in the Employee Management tab to calculate allowances and salaries.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-sf-pro">Allowance Management</h2>
          <p className="text-slate-600 dark:text-slate-400 font-sf-pro">
            Calculate final salaries with Time & Attendance integration and South African allowances
          </p>
        </div>
        
        <Button 
          onClick={() => {
            setIsLoading(true);
            // Force recalculation by recalculating salary data
            setTimeout(() => {
              try {
                const savedAllowances = localStorage.getItem('employeeAllowances');
                let existingAllowances: Record<string, EmployeeAllowances> = {};
                
                if (savedAllowances) {
                  existingAllowances = JSON.parse(savedAllowances);
                }
                
                const recalculatedSalaryData = employees.map(employee => {
                  const attendance = getMonthlyAttendance(employee.id);
                  const allowances = existingAllowances[employee.id] || {
                    thirteenthMonthBonus: (employee.salary || 0) / 12,
                    retirementPlan: 0,
                    housingAllowance: 0,
                    motorVehicleAllowance: 0,
                    medicalAidAllowance: 0,
                    otherAllowances: 0
                  };
                  
                  return calculateEmployeeSalary(employee, attendance, allowances);
                });
                
                setSalaryData(recalculatedSalaryData);
                toast.success('Calculations refreshed successfully');
              } catch (error) {
                console.error('Error refreshing calculations:', error);
                toast.error('Failed to refresh calculations');
              } finally {
                setIsLoading(false);
              }
            }, 500);
          }}
          disabled={isLoading}
          className="bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 font-sf-pro"
        >
          <Calculator className="h-4 w-4 mr-2" />
          {isLoading ? 'Recalculating...' : 'Refresh Calculations'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Breakdown</TabsTrigger>
          <TabsTrigger value="uif">UIF Information</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sf-pro text-slate-100">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-slate-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sf-pro text-slate-100">{salaryData.length}</div>
              </CardContent>
            </Card>

            <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sf-pro text-slate-100">Total Payroll Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-slate-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sf-pro text-slate-100">{formatCurrency(getTotalPayrollCost())}</div>
                <p className="text-xs text-slate-400 font-sf-pro">Monthly gross salaries</p>
              </CardContent>
            </Card>

            <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sf-pro text-slate-100">Total UIF</CardTitle>
                <Shield className="h-4 w-4 text-slate-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sf-pro text-slate-100">{formatCurrency(getTotalUIFContributions().total)}</div>
                <p className="text-xs text-slate-400 font-sf-pro">Employee + Employer contributions</p>
              </CardContent>
            </Card>
          </div>

          {/* Employee Salary Overview Table */}
          <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro text-slate-100">Employee Salary Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-sf-pro text-slate-300">Employee</TableHead>
                    <TableHead className="font-sf-pro text-slate-300">Base Salary</TableHead>
                    <TableHead className="font-sf-pro text-slate-300">Attendance Pay</TableHead>
                    <TableHead className="font-sf-pro text-slate-300">Allowances</TableHead>
                    <TableHead className="font-sf-pro text-slate-300">Gross Salary</TableHead>
                    <TableHead className="font-sf-pro text-slate-300">Net Salary</TableHead>
                    <TableHead className="font-sf-pro text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryData.map((data) => (
                    <TableRow key={data.employeeId}>
                      <TableCell className="font-medium font-sf-pro text-slate-100">{data.employeeName}</TableCell>
                      <TableCell className="font-sf-pro text-slate-300">{formatCurrency(data.baseSalary)}</TableCell>
                      <TableCell className="font-sf-pro text-slate-300">{formatCurrency(data.attendancePay)}</TableCell>
                      <TableCell className="font-sf-pro text-slate-300">{formatCurrency(data.totalAllowances)}</TableCell>
                      <TableCell className="font-sf-pro font-medium text-slate-100">{formatCurrency(data.grossSalary)}</TableCell>
                      <TableCell className="font-sf-pro font-medium text-green-300">{formatCurrency(data.netSalary)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAllowances(data.employeeId)}
                            className="font-sf-pro border-white/10 hover:bg-slate-800/40 hover:text-slate-100"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          {/* Employee Selection */}
          <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro text-slate-100">Select Employee</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger className="w-full bg-slate-800/60 text-slate-100 border border-white/10">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {salaryData.map((data) => {
                    const employee = employees.find(emp => emp.id === data.employeeId);
                    return (
                      <SelectItem key={data.employeeId} value={data.employeeId}>
                        {data.employeeName} - {employee?.position || 'No position'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Individual Employee Breakdown */}
          {getSelectedEmployeeData() && (
            <>
              {/* Allowances Configuration */}
              <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
                <CardHeader>
                  <CardTitle className="font-sf-pro flex items-center gap-2 text-slate-100">
                    <PiggyBank className="h-5 w-5 text-slate-300" />
                    South African Allowances
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-sf-pro text-slate-300">13th Month Bonus (Annual)</Label>
                      <Input
                        type="number"
                        value={editingAllowances === selectedEmployeeId ? tempAllowances.thirteenthMonthBonus : 0}
                        onChange={(e) => setTempAllowances(prev => ({ ...prev, thirteenthMonthBonus: parseFloat(e.target.value) || 0 }))}
                        disabled={editingAllowances !== selectedEmployeeId}
                        className="mt-1 bg-slate-800/60 text-slate-100 border border-white/10"
                      />
                    </div>

                    <div>
                      <Label className="font-sf-pro text-slate-300">Retirement Plan</Label>
                      <Input
                        type="number"
                        value={editingAllowances === selectedEmployeeId ? tempAllowances.retirementPlan : 0}
                        onChange={(e) => setTempAllowances(prev => ({ ...prev, retirementPlan: parseFloat(e.target.value) || 0 }))}
                        disabled={editingAllowances !== selectedEmployeeId}
                        className="mt-1 bg-slate-800/60 text-slate-100 border border-white/10"
                      />
                    </div>

                    <div>
                      <Label className="font-sf-pro flex items-center gap-2 text-slate-300">
                        <Home className="h-4 w-4 text-slate-300" />
                        Housing Allowance
                      </Label>
                      <Input
                        type="number"
                        value={editingAllowances === selectedEmployeeId ? tempAllowances.housingAllowance : 0}
                        onChange={(e) => setTempAllowances(prev => ({ ...prev, housingAllowance: parseFloat(e.target.value) || 0 }))}
                        disabled={editingAllowances !== selectedEmployeeId}
                        className="mt-1 bg-slate-800/60 text-slate-100 border border-white/10"
                      />
                    </div>

                    <div>
                      <Label className="font-sf-pro flex items-center gap-2 text-slate-300">
                        <Car className="h-4 w-4 text-slate-300" />
                        Motor Vehicle Allowance
                      </Label>
                      <Input
                        type="number"
                        value={editingAllowances === selectedEmployeeId ? tempAllowances.motorVehicleAllowance : 0}
                        onChange={(e) => setTempAllowances(prev => ({ ...prev, motorVehicleAllowance: parseFloat(e.target.value) || 0 }))}
                        disabled={editingAllowances !== selectedEmployeeId}
                        className="mt-1 bg-slate-800/60 text-slate-100 border border-white/10"
                      />
                    </div>

                    <div>
                      <Label className="font-sf-pro flex items-center gap-2 text-slate-300">
                        <Heart className="h-4 w-4 text-slate-300" />
                        Medical Aid Allowance
                      </Label>
                      <Input
                        type="number"
                        value={editingAllowances === selectedEmployeeId ? tempAllowances.medicalAidAllowance : 0}
                        onChange={(e) => setTempAllowances(prev => ({ ...prev, medicalAidAllowance: parseFloat(e.target.value) || 0 }))}
                        disabled={editingAllowances !== selectedEmployeeId}
                        className="mt-1 bg-slate-800/60 text-slate-100 border border-white/10"
                      />
                    </div>

                    <div>
                      <Label className="font-sf-pro text-slate-300">Other Allowances</Label>
                      <Input
                        type="number"
                        value={editingAllowances === selectedEmployeeId ? tempAllowances.otherAllowances : 0}
                        onChange={(e) => setTempAllowances(prev => ({ ...prev, otherAllowances: parseFloat(e.target.value) || 0 }))}
                        disabled={editingAllowances !== selectedEmployeeId}
                        className="mt-1 bg-slate-800/60 text-slate-100 border border-white/10"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    {editingAllowances === selectedEmployeeId ? (
                      <>
                        <Button
                          onClick={() => handleSaveAllowances(selectedEmployeeId)}
                          className="bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 font-sf-pro"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Allowances
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingAllowances(null)}
                          className="font-sf-pro bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-transparent dark:text-slate-100 dark:border-white/10 dark:hover:bg-slate-800/40"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleEditAllowances(selectedEmployeeId)}
                        variant="outline"
                        className="font-sf-pro bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-transparent dark:text-slate-100 dark:border-white/10 dark:hover:bg-slate-800/40"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Allowances
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Salary Breakdown */}
              <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
                <CardHeader>
                  <CardTitle className="font-sf-pro flex items-center gap-2 text-slate-100">
                    <Calculator className="h-5 w-5 text-slate-300" />
                    Salary Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-sf-pro text-slate-300">Base Salary:</span>
                      <span className="font-sf-pro text-slate-100">{formatCurrency(getSelectedEmployeeData()!.baseSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sf-pro text-slate-300">Attendance Pay:</span>
                      <span className="font-sf-pro text-slate-100">{formatCurrency(getSelectedEmployeeData()!.attendancePay)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sf-pro text-slate-300">Total Allowances:</span>
                      <span className="font-sf-pro text-slate-100">{formatCurrency(getSelectedEmployeeData()!.totalAllowances)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2 border-white/10">
                      <span className="font-sf-pro text-slate-300">Gross Salary:</span>
                      <span className="font-sf-pro text-slate-100">{formatCurrency(getSelectedEmployeeData()!.grossSalary)}</span>
                    </div>
                    <div className="flex justify-between text-red-300">
                      <span className="font-sf-pro">Tax ({employees.find(e => e.id === selectedEmployeeId)?.taxPercentage || 0}%):</span>
                      <span className="font-sf-pro">-{formatCurrency(getSelectedEmployeeData()!.tax)}</span>
                    </div>
                    <div className="flex justify-between text-red-300">
                      <span className="font-sf-pro">UIF (Employee):</span>
                      <span className="font-sf-pro">-{formatCurrency(getSelectedEmployeeData()!.uif.employeeContribution)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-green-300 border-t pt-2 border-white/10">
                      <span className="font-sf-pro">Net Salary:</span>
                      <span className="font-sf-pro">{formatCurrency(getSelectedEmployeeData()!.netSalary)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        

        <TabsContent value="uif" className="space-y-6">
          <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro text-slate-100">UIF Information (2025)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-slate-400 font-sf-pro">UIF Rate</div>
                    <div className="text-lg font-bold font-sf-pro text-slate-100">1% Employee + 1% Employer</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-400 font-sf-pro">Maximum Salary Cap</div>
                    <div className="text-lg font-bold font-sf-pro text-slate-100">{formatCurrency(UIF_CONSTANTS.MONTHLY_SALARY_CAP)} per month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-400 font-sf-pro">Maximum Contribution</div>
                    <div className="text-lg font-bold font-sf-pro text-slate-100">{formatCurrency(UIF_CONSTANTS.MAX_MONTHLY_CONTRIBUTION)} per party</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AllowanceManagement;
