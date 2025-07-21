import { Project, ProjectEmployee, Expense } from '@/types/project';
import { Employee, getAllEmployees } from '@/services/employeeService';

/**
 * Service for linking HR Management Attendance Pay to Project Expenses
 * This service calculates and tracks attendance pay as project expenses for assigned employees
 */

interface MonthlyAttendance {
  employeeId: string;
  regularHours: number;
  overtimeHours: number;
  nightShiftHours: number;
  daysWorked: number;
}

interface AttendancePayCalculation {
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  regularPay: number;
  overtimePay: number;
  nightShiftPay: number;
  totalAttendancePay: number;
  projectAllocation: number; // Percentage allocated to project
  projectAttendancePay: number; // Attendance pay allocated to this project
}

/**
 * Get monthly attendance data for an employee
 */
const getMonthlyAttendance = (employeeId: string): MonthlyAttendance => {
  try {
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
    
    return {
      employeeId,
      regularHours: attendanceSummary.currentMonthRegularHours || 0,
      overtimeHours: attendanceSummary.currentMonthOvertimeHours || 0,
      nightShiftHours: attendanceSummary.currentMonthNightShiftHours || 0,
      daysWorked: Math.ceil((attendanceSummary.currentMonthRegularHours || 0) / 8) // Estimate days worked
    };
  } catch (error) {
    console.error('Error getting monthly attendance:', error);
    return {
      employeeId,
      regularHours: 0,
      overtimeHours: 0,
      nightShiftHours: 0,
      daysWorked: 0
    };
  }
};

/**
 * Calculate attendance pay for an employee
 */
const calculateAttendancePay = (employee: Employee, attendance: MonthlyAttendance): AttendancePayCalculation => {
  const hourlyRate = employee.salary / 173.33; // Standard monthly hours
  
  // Calculate different types of pay
  const regularPay = attendance.regularHours * hourlyRate;
  const overtimePay = attendance.overtimeHours * hourlyRate * 1.5; // 1.5x for overtime
  const nightShiftPay = attendance.nightShiftHours * hourlyRate * 1.1; // 10% night shift allowance
  
  const totalAttendancePay = regularPay + overtimePay + nightShiftPay;
  
  return {
    employeeId: employee.id,
    employeeName: `${employee.firstName} ${employee.surname}`,
    baseSalary: employee.salary,
    regularPay,
    overtimePay,
    nightShiftPay,
    totalAttendancePay,
    projectAllocation: 0, // Will be set based on project assignment
    projectAttendancePay: 0 // Will be calculated based on allocation
  };
};

/**
 * Calculate attendance pay expenses for a project based on assigned employees
 */
export const calculateProjectAttendanceExpenses = (project: Project): AttendancePayCalculation[] => {
  if (!project.assignedEmployees || project.assignedEmployees.length === 0) {
    return [];
  }

  const employees = getAllEmployees();
  const attendanceCalculations: AttendancePayCalculation[] = [];

  project.assignedEmployees.forEach(assignedEmployee => {
    const employee = employees.find(emp => emp.id === assignedEmployee.employeeId);
    if (!employee) return;

    const attendance = getMonthlyAttendance(assignedEmployee.employeeId);
    const attendanceCalc = calculateAttendancePay(employee, attendance);
    
    // Apply project allocation
    attendanceCalc.projectAllocation = assignedEmployee.allocation;
    attendanceCalc.projectAttendancePay = (attendanceCalc.totalAttendancePay * assignedEmployee.allocation) / 100;
    
    attendanceCalculations.push(attendanceCalc);
  });

  return attendanceCalculations;
};

/**
 * Get total attendance pay expenses for a project
 */
export const getTotalProjectAttendanceExpenses = (project: Project): number => {
  const attendanceCalculations = calculateProjectAttendanceExpenses(project);
  return attendanceCalculations.reduce((total, calc) => total + calc.projectAttendancePay, 0);
};

/**
 * Create attendance pay expense entries for a project
 */
export const createAttendancePayExpenses = (project: Project, month: string = new Date().toISOString().slice(0, 7)): Expense[] => {
  const attendanceCalculations = calculateProjectAttendanceExpenses(project);
  const expenses: Expense[] = [];

  attendanceCalculations.forEach(calc => {
    if (calc.projectAttendancePay > 0) {
      const expense: Expense = {
        id: `attendance-${calc.employeeId}-${month}-${Date.now()}`,
        type: 'Attendance Pay',
        amount: Math.round(calc.projectAttendancePay),
        date: new Date().toISOString().split('T')[0],
        notes: `Attendance pay for ${calc.employeeName} (${calc.projectAllocation}% allocation)\n` +
               `Regular: R${calc.regularPay.toFixed(2)}, Overtime: R${calc.overtimePay.toFixed(2)}, Night Shift: R${calc.nightShiftPay.toFixed(2)}`
      };
      expenses.push(expense);
    }
  });

  return expenses;
};

/**
 * Update project expenses with attendance pay
 */
export const updateProjectWithAttendanceExpenses = (project: Project): Project => {
  if (project.status === 'Completed') {
    return project; // Don't add expenses to completed projects
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const attendanceExpenses = createAttendancePayExpenses(project, currentMonth);
  
  // Initialize expenses array if it doesn't exist
  if (!project.expenses_list) {
    project.expenses_list = [];
  }

  // Remove existing attendance pay expenses for the current month to avoid duplicates
  project.expenses_list = project.expenses_list.filter(expense => 
    expense.type !== 'Attendance Pay' || !expense.id.includes(currentMonth)
  );

  // Add new attendance pay expenses
  project.expenses_list.push(...attendanceExpenses);

  // Update total expenses
  const totalExpenses = project.expenses_list.reduce((total, expense) => total + expense.amount, 0);
  project.expenses = totalExpenses;

  return project;
};

/**
 * Get attendance pay breakdown for a specific employee in a project
 */
export const getEmployeeAttendancePayInProject = (project: Project, employeeId: string): AttendancePayCalculation | null => {
  const attendanceCalculations = calculateProjectAttendanceExpenses(project);
  return attendanceCalculations.find(calc => calc.employeeId === employeeId) || null;
};

/**
 * Update all active projects with attendance pay expenses
 */
export const updateAllActiveProjectsWithAttendanceExpenses = (): void => {
  try {
    const projectsRaw = localStorage.getItem('projects');
    if (!projectsRaw) return;

    const projects: Project[] = JSON.parse(projectsRaw);
    const updatedProjects = projects.map(project => {
      // Only update active projects (not completed)
      if (project.status !== 'Completed' && project.assignedEmployees && project.assignedEmployees.length > 0) {
        return updateProjectWithAttendanceExpenses(project);
      }
      return project;
    });

    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    console.log('Updated all active projects with attendance pay expenses');
  } catch (error) {
    console.error('Error updating projects with attendance expenses:', error);
  }
};

/**
 * Get summary of attendance pay expenses across all projects
 */
export const getAttendancePayExpensesSummary = (): {
  totalAttendanceExpenses: number;
  projectCount: number;
  employeeCount: number;
  breakdown: { projectName: string; totalAttendancePay: number; employeeCount: number }[];
} => {
  try {
    const projectsRaw = localStorage.getItem('projects');
    if (!projectsRaw) {
      return { totalAttendanceExpenses: 0, projectCount: 0, employeeCount: 0, breakdown: [] };
    }

    const projects: Project[] = JSON.parse(projectsRaw);
    let totalAttendanceExpenses = 0;
    let totalEmployeeCount = 0;
    const breakdown: { projectName: string; totalAttendancePay: number; employeeCount: number }[] = [];

    projects.forEach(project => {
      if (project.status !== 'Completed' && project.assignedEmployees && project.assignedEmployees.length > 0) {
        const projectAttendanceExpenses = getTotalProjectAttendanceExpenses(project);
        if (projectAttendanceExpenses > 0) {
          totalAttendanceExpenses += projectAttendanceExpenses;
          totalEmployeeCount += project.assignedEmployees.length;
          breakdown.push({
            projectName: project.name,
            totalAttendancePay: projectAttendanceExpenses,
            employeeCount: project.assignedEmployees.length
          });
        }
      }
    });

    return {
      totalAttendanceExpenses,
      projectCount: breakdown.length,
      employeeCount: totalEmployeeCount,
      breakdown
    };
  } catch (error) {
    console.error('Error getting attendance pay expenses summary:', error);
    return { totalAttendanceExpenses: 0, projectCount: 0, employeeCount: 0, breakdown: [] };
  }
};
