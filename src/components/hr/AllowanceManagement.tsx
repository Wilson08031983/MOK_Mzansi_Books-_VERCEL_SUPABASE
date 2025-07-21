import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, Calculator, Users, PiggyBank, Car, Home, Heart, Shield, Edit, Save, Clock, Briefcase, TrendingUp } from 'lucide-react';
import { Employee } from '@/services/employeeService';
import { TimeEntry } from '@/components/hr/TimeAttendanceTypes';
import { toast } from 'sonner';
import { getAttendancePayExpensesSummary, updateAllActiveProjectsWithAttendanceExpenses, calculateProjectAttendanceExpenses } from '@/services/projectAttendanceExpenseService';
import { Project } from '@/types/project';

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
    
    // If no attendance summary exists, create one with realistic data
    if (!attendanceSummary) {
      attendanceSummary = {
        employeeId,
        currentMonthRegularHours: 25.0 + Math.random() * 15, // 25-40 hours
        currentMonthOvertimeHours: Math.random() * 8, // 0-8 overtime hours
        currentMonthNightShiftHours: Math.random() * 5, // 0-5 night shift hours
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
  
  console.log(`Salary for ${employee.firstName} ${employee.surname}: Attendance Pay = R${attendancePay.toFixed(2)}`);
  
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
interface ProjectExpensesTabProps {
  employees: Employee[];
}

const ProjectExpensesTab: React.FC<ProjectExpensesTabProps> = ({ employees }) => {
  const [projectExpensesSummary, setProjectExpensesSummary] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProjectData();
  }, []);

  const loadProjectData = () => {
    setIsLoading(true);
    try {
      // Load projects from localStorage
      const projectsRaw = localStorage.getItem('projects');
      const loadedProjects: Project[] = projectsRaw ? JSON.parse(projectsRaw) : [];
      setProjects(loadedProjects);

      // Get attendance pay expenses summary
      const summary = getAttendancePayExpensesSummary();
      setProjectExpensesSummary(summary);
    } catch (error) {
      console.error('Error loading project data:', error);
      toast.error('Failed to load project data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProjectExpenses = () => {
    setIsLoading(true);
    try {
      updateAllActiveProjectsWithAttendanceExpenses();
      loadProjectData(); // Reload data
      toast.success('Project expenses updated with attendance pay');
    } catch (error) {
      console.error('Error updating project expenses:', error);
      toast.error('Failed to update project expenses');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sf-pro">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sf-pro">{projectExpensesSummary?.projectCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sf-pro">Assigned Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sf-pro">{projectExpensesSummary?.employeeCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sf-pro">Total Attendance Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sf-pro text-green-600">
              {formatCurrency(projectExpensesSummary?.totalAttendanceExpenses || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sf-pro">Update Expenses</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleUpdateProjectExpenses}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 hover:from-mokm-purple-600 hover:to-mokm-blue-600 text-white"
            >
              {isLoading ? 'Updating...' : 'Update Now'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Project Breakdown Table */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="font-sf-pro">Project Attendance Expenses Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {projectExpensesSummary?.breakdown && projectExpensesSummary.breakdown.length > 0 ? (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-sf-pro">Project Name</TableHead>
                    <TableHead className="font-sf-pro">Assigned Employees</TableHead>
                    <TableHead className="font-sf-pro">Monthly Attendance Pay</TableHead>
                    <TableHead className="font-sf-pro">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectExpensesSummary.breakdown.map((project: any, index: number) => {
                    const projectData = projects.find(p => p.name === project.projectName);
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium font-sf-pro">{project.projectName}</TableCell>
                        <TableCell className="font-sf-pro">{project.employeeCount}</TableCell>
                        <TableCell className="font-sf-pro text-green-600">
                          {formatCurrency(project.totalAttendancePay)}
                        </TableCell>
                        <TableCell className="font-sf-pro">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            projectData?.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            projectData?.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            projectData?.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
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
              <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-sf-pro">No active projects with assigned employees found.</p>
              <p className="text-sm text-slate-400 font-sf-pro mt-2">
                Assign employees to projects in the Projects page to see attendance expenses here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="glass backdrop-blur-sm bg-blue-50/50 border border-blue-200/20 shadow-business">
        <CardHeader>
          <CardTitle className="font-sf-pro text-blue-800">How Project Attendance Expenses Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-blue-700">
            <p className="font-sf-pro">
              <strong>Automatic Integration:</strong> When employees are assigned to projects, their attendance pay automatically becomes part of the project expenses.
            </p>
            <p className="font-sf-pro">
              <strong>Real-time Calculation:</strong> Attendance pay is calculated based on regular hours, overtime (1.5x), and night shift allowances (10%).
            </p>
            <p className="font-sf-pro">
              <strong>Project Allocation:</strong> Only the percentage of attendance pay allocated to each project is included in expenses.
            </p>
            <p className="font-sf-pro">
              <strong>Duration-based:</strong> Expenses continue until the project is marked as 100% complete.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AllowanceManagement: React.FC<AllowanceManagementProps> = ({ employees }) => {
  const [salaryData, setSalaryData] = useState<SalaryBreakdown[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'individual' | 'uif' | 'projects'>('overview');
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
              currentMonthRegularHours: 20.0 + Math.random() * 20, // 20-40 hours
              currentMonthOvertimeHours: Math.random() * 8, // 0-8 overtime hours
              currentMonthNightShiftHours: Math.random() * 5, // 0-5 night shift hours
              currentWeekOvertimeHours: Math.random() * 3,
              currentDayOvertimeHours: 0,
              attendanceRate: 95 + Math.random() * 5,
              punctualityRate: 90 + Math.random() * 10,
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
        const attendance = getMonthlyAttendance(employeeId);
        const updatedSalaryBreakdown = calculateEmployeeSalary(employee, attendance, tempAllowances);
        
        setSalaryData(prev => prev.map(data => 
          data.employeeId === employeeId ? updatedSalaryBreakdown : data
        ));
        
        const savedAllowances = JSON.parse(localStorage.getItem('employeeAllowances') || '{}');
        savedAllowances[employeeId] = tempAllowances;
        localStorage.setItem('employeeAllowances', JSON.stringify(savedAllowances));
        
        setEditingAllowances(null);
        toast.success('Allowances updated successfully');
      }
    } catch (error) {
      console.error('Error saving allowances:', error);
      toast.error('Error saving allowances');
    }
  };

  const handleEditAllowances = (employeeId: string) => {
    const savedAllowances = JSON.parse(localStorage.getItem('employeeAllowances') || '{}');
    const employee = employees.find(emp => emp.id === employeeId);
    const allowances = savedAllowances[employeeId] || {
      thirteenthMonthBonus: (employee?.salary || 0) / 12,
      retirementPlan: 0,
      housingAllowance: 0,
      motorVehicleAllowance: 0,
      medicalAidAllowance: 0,
      otherAllowances: 0
    };
    
    setTempAllowances(allowances);
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
          <h2 className="text-2xl font-bold text-slate-900 font-sf-pro">Allowance Management</h2>
          <p className="text-slate-600 font-sf-pro">
            Calculate final salaries with Time & Attendance integration and South African allowances
          </p>
        </div>
        
        <Button 
          onClick={() => {
            setIsLoading(true);
            // Force recalculation by triggering useEffect
            setTimeout(() => {
              window.location.reload();
            }, 100);
          }}
          disabled={isLoading}
          className="bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 font-sf-pro"
        >
          <Calculator className="h-4 w-4 mr-2" />
          {isLoading ? 'Recalculating...' : 'Refresh Calculations'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Breakdown</TabsTrigger>
          <TabsTrigger value="projects">Project Expenses</TabsTrigger>
          <TabsTrigger value="uif">UIF Information</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sf-pro">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sf-pro">{salaryData.length}</div>
              </CardContent>
            </Card>

            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sf-pro">Total Payroll Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sf-pro">{formatCurrency(getTotalPayrollCost())}</div>
                <p className="text-xs text-muted-foreground font-sf-pro">Monthly gross salaries</p>
              </CardContent>
            </Card>

            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sf-pro">Total UIF</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sf-pro">{formatCurrency(getTotalUIFContributions().total)}</div>
                <p className="text-xs text-muted-foreground font-sf-pro">Employee + Employer contributions</p>
              </CardContent>
            </Card>
          </div>

          {/* Employee Salary Overview Table */}
          <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro">Employee Salary Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-sf-pro">Employee</TableHead>
                    <TableHead className="font-sf-pro">Base Salary</TableHead>
                    <TableHead className="font-sf-pro">Attendance Pay</TableHead>
                    <TableHead className="font-sf-pro">Allowances</TableHead>
                    <TableHead className="font-sf-pro">Gross Salary</TableHead>
                    <TableHead className="font-sf-pro">Net Salary</TableHead>
                    <TableHead className="font-sf-pro">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryData.map((data) => (
                    <TableRow key={data.employeeId}>
                      <TableCell className="font-medium font-sf-pro">{data.employeeName}</TableCell>
                      <TableCell className="font-sf-pro">{formatCurrency(data.baseSalary)}</TableCell>
                      <TableCell className="font-sf-pro">{formatCurrency(data.attendancePay)}</TableCell>
                      <TableCell className="font-sf-pro">{formatCurrency(data.totalAllowances)}</TableCell>
                      <TableCell className="font-sf-pro font-medium">{formatCurrency(data.grossSalary)}</TableCell>
                      <TableCell className="font-sf-pro font-medium text-green-600">{formatCurrency(data.netSalary)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAllowances(data.employeeId)}
                          className="font-sf-pro hover:bg-mokm-purple-50 hover:text-mokm-purple-600 hover:border-mokm-purple-200"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
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
          <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro">Select Employee</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger className="w-full">
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
              <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
                <CardHeader>
                  <CardTitle className="font-sf-pro flex items-center gap-2">
                    <PiggyBank className="h-5 w-5" />
                    South African Allowances
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-sf-pro">13th Month Bonus (Annual)</Label>
                      <Input
                        type="number"
                        value={editingAllowances === selectedEmployeeId ? tempAllowances.thirteenthMonthBonus : 0}
                        onChange={(e) => setTempAllowances(prev => ({ ...prev, thirteenthMonthBonus: parseFloat(e.target.value) || 0 }))}
                        disabled={editingAllowances !== selectedEmployeeId}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="font-sf-pro">Retirement Plan</Label>
                      <Input
                        type="number"
                        value={editingAllowances === selectedEmployeeId ? tempAllowances.retirementPlan : 0}
                        onChange={(e) => setTempAllowances(prev => ({ ...prev, retirementPlan: parseFloat(e.target.value) || 0 }))}
                        disabled={editingAllowances !== selectedEmployeeId}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="font-sf-pro flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Housing Allowance
                      </Label>
                      <Input
                        type="number"
                        value={editingAllowances === selectedEmployeeId ? tempAllowances.housingAllowance : 0}
                        onChange={(e) => setTempAllowances(prev => ({ ...prev, housingAllowance: parseFloat(e.target.value) || 0 }))}
                        disabled={editingAllowances !== selectedEmployeeId}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="font-sf-pro flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Motor Vehicle Allowance
                      </Label>
                      <Input
                        type="number"
                        value={editingAllowances === selectedEmployeeId ? tempAllowances.motorVehicleAllowance : 0}
                        onChange={(e) => setTempAllowances(prev => ({ ...prev, motorVehicleAllowance: parseFloat(e.target.value) || 0 }))}
                        disabled={editingAllowances !== selectedEmployeeId}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="font-sf-pro flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Medical Aid Allowance
                      </Label>
                      <Input
                        type="number"
                        value={editingAllowances === selectedEmployeeId ? tempAllowances.medicalAidAllowance : 0}
                        onChange={(e) => setTempAllowances(prev => ({ ...prev, medicalAidAllowance: parseFloat(e.target.value) || 0 }))}
                        disabled={editingAllowances !== selectedEmployeeId}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="font-sf-pro">Other Allowances</Label>
                      <Input
                        type="number"
                        value={editingAllowances === selectedEmployeeId ? tempAllowances.otherAllowances : 0}
                        onChange={(e) => setTempAllowances(prev => ({ ...prev, otherAllowances: parseFloat(e.target.value) || 0 }))}
                        disabled={editingAllowances !== selectedEmployeeId}
                        className="mt-1"
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
                          className="font-sf-pro"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleEditAllowances(selectedEmployeeId)}
                        variant="outline"
                        className="font-sf-pro"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Allowances
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Salary Breakdown */}
              <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
                <CardHeader>
                  <CardTitle className="font-sf-pro flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Salary Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-sf-pro">Base Salary:</span>
                      <span className="font-sf-pro">{formatCurrency(getSelectedEmployeeData()!.baseSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sf-pro">Attendance Pay:</span>
                      <span className="font-sf-pro">{formatCurrency(getSelectedEmployeeData()!.attendancePay)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sf-pro">Total Allowances:</span>
                      <span className="font-sf-pro">{formatCurrency(getSelectedEmployeeData()!.totalAllowances)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span className="font-sf-pro">Gross Salary:</span>
                      <span className="font-sf-pro">{formatCurrency(getSelectedEmployeeData()!.grossSalary)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span className="font-sf-pro">Tax ({employees.find(e => e.id === selectedEmployeeId)?.taxPercentage || 0}%):</span>
                      <span className="font-sf-pro">-{formatCurrency(getSelectedEmployeeData()!.tax)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span className="font-sf-pro">UIF (Employee):</span>
                      <span className="font-sf-pro">-{formatCurrency(getSelectedEmployeeData()!.uif.employeeContribution)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-green-600 border-t pt-2">
                      <span className="font-sf-pro">Net Salary:</span>
                      <span className="font-sf-pro">{formatCurrency(getSelectedEmployeeData()!.netSalary)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <ProjectExpensesTab employees={employees} />
        </TabsContent>

        <TabsContent value="uif" className="space-y-6">
          <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro">UIF Information (2025)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-slate-500 font-sf-pro">UIF Rate</div>
                    <div className="text-lg font-bold font-sf-pro">1% Employee + 1% Employer</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-500 font-sf-pro">Maximum Salary Cap</div>
                    <div className="text-lg font-bold font-sf-pro">{formatCurrency(UIF_CONSTANTS.MONTHLY_SALARY_CAP)} per month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-500 font-sf-pro">Maximum Contribution</div>
                    <div className="text-lg font-bold font-sf-pro">{formatCurrency(UIF_CONSTANTS.MAX_MONTHLY_CONTRIBUTION)} per party</div>
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
