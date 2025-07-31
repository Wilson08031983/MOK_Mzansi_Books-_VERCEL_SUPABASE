import { Project, ProjectEmployee, Expense } from '@/types/project';
import { Employee, getAllEmployees } from '@/services/employeeService';
import payrollCalculationService, { PayrollCalculation } from '@/services/payrollCalculationService';
import ExpenseProjectSyncService from '@/services/expenseProjectSyncService';

/**
 * Automated Payroll Expense Integration Service
 * Links employee salaries to project expenses based on project team assignments and date ranges
 * Automatically calculates and updates project expenses with team member salaries
 */

export interface PayrollExpenseEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  projectId: number;
  projectName: string;
  projectCode: string;
  amount: number;
  month: string;
  year: number;
  allocation: number; // Percentage allocation to project
  netSalary: number; // Employee's full net salary
  createdDate: string;
  status: 'pending' | 'approved' | 'processed';
  expenseId?: string; // Link to generated expense entry
}

export interface ProjectSalaryExpense {
  projectId: number;
  projectName: string;
  projectCode: string;
  month: string;
  year: number;
  teamMembers: {
    employeeId: string;
    employeeName: string;
    netSalary: number;
    allocation: number;
    allocatedAmount: number;
  }[];
  totalSalaryExpense: number;
  createdDate: string;
  expenseEntries: string[]; // IDs of generated expense entries
}

export interface MonthlyAutomationLog {
  id: string;
  executionDate: string;
  month: string;
  year: number;
  projectsProcessed: number;
  expensesGenerated: number;
  totalAmount: number;
  errors: string[];
  status: 'success' | 'partial' | 'failed';
}

class PayrollExpenseIntegrationService {
  private static instance: PayrollExpenseIntegrationService;
  private payrollService: typeof payrollCalculationService;
  private syncService: ExpenseProjectSyncService;
  private automationEnabled: boolean = true;
  private lastAutomationRun: string | null = null;

  private constructor() {
    this.payrollService = payrollCalculationService;
    this.syncService = ExpenseProjectSyncService.getInstance();
    this.initializeAutomation();
  }

  public static getInstance(): PayrollExpenseIntegrationService {
    if (!PayrollExpenseIntegrationService.instance) {
      PayrollExpenseIntegrationService.instance = new PayrollExpenseIntegrationService();
    }
    return PayrollExpenseIntegrationService.instance;
  }

  /**
   * Initialize automation system
   */
  private initializeAutomation(): void {
    // Check if automation should run on service initialization
    this.checkAndRunMonthlyAutomation();
    
    // Set up interval to check for monthly automation (check every hour)
    setInterval(() => {
      this.checkAndRunMonthlyAutomation();
    }, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Check if monthly automation should run and execute if needed
   */
  private checkAndRunMonthlyAutomation(): void {
    if (!this.automationEnabled) return;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentDate = now.getDate();
    
    // Run on the 1st of each month
    if (currentDate === 1) {
      const automationKey = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
      
      // Check if automation already ran this month
      if (this.lastAutomationRun !== automationKey) {
        console.log(`PayrollExpenseIntegration: Running monthly automation for ${automationKey}`);
        this.runMonthlyAutomation(currentMonth, currentYear);
        this.lastAutomationRun = automationKey;
        localStorage.setItem('lastPayrollAutomationRun', automationKey);
      }
    }
  }

  /**
   * Run monthly automation for salary expense generation
   */
  public async runMonthlyAutomation(month: number, year: number): Promise<MonthlyAutomationLog> {
    const log: MonthlyAutomationLog = {
      id: `automation-${year}-${month.toString().padStart(2, '0')}-${Date.now()}`,
      executionDate: new Date().toISOString(),
      month: month.toString().padStart(2, '0'),
      year,
      projectsProcessed: 0,
      expensesGenerated: 0,
      totalAmount: 0,
      errors: [],
      status: 'success'
    };

    try {
      console.log(`PayrollExpenseIntegration: Starting monthly automation for ${month}/${year}`);
      
      // Get all active projects for the given month/year
      const activeProjects = this.getActiveProjectsForMonth(month, year);
      console.log(`Found ${activeProjects.length} active projects for ${month}/${year}`);
      
      for (const project of activeProjects) {
        try {
          const projectSalaryExpense = await this.generateProjectSalaryExpenses(project, month, year);
          if (projectSalaryExpense) {
            log.projectsProcessed++;
            log.expensesGenerated += projectSalaryExpense.expenseEntries.length;
            log.totalAmount += projectSalaryExpense.totalSalaryExpense;
          }
        } catch (error) {
          const errorMsg = `Error processing project ${project.name} (${project.code}): ${error}`;
          console.error(errorMsg);
          log.errors.push(errorMsg);
        }
      }
      
      if (log.errors.length > 0) {
        log.status = log.projectsProcessed > 0 ? 'partial' : 'failed';
      }
      
      // Save automation log
      this.saveAutomationLog(log);
      
      console.log(`PayrollExpenseIntegration: Monthly automation completed. Processed ${log.projectsProcessed} projects, generated ${log.expensesGenerated} expenses`);
      
    } catch (error) {
      log.status = 'failed';
      log.errors.push(`Critical automation error: ${error}`);
      console.error('PayrollExpenseIntegration: Critical automation error:', error);
    }

    return log;
  }

  /**
   * Get all projects that are active during a specific month/year
   */
  private getActiveProjectsForMonth(month: number, year: number): Project[] {
    try {
      const projects: Project[] = JSON.parse(localStorage.getItem('projects') || '[]');
      const targetDate = new Date(year, month - 1, 1); // First day of target month
      const nextMonth = new Date(year, month, 1); // First day of next month
      
      return projects.filter(project => {
        // Skip projects without assigned employees
        if (!project.assignedEmployees || project.assignedEmployees.length === 0) {
          return false;
        }
        
        // Skip completed or cancelled projects (unless they extended beyond end date)
        if (project.status === 'Cancelled') {
          return false;
        }
        
        const startDate = new Date(project.startDate);
        const endDate = new Date(project.endDate);
        
        // Project is active if:
        // 1. It started before or during the target month AND
        // 2. It ends after or during the target month OR it's still in progress
        const isActive = startDate < nextMonth && 
                        (endDate >= targetDate || 
                         project.status === 'In Progress' || 
                         project.status === 'Planning' ||
                         project.status === 'On Hold');
        
        return isActive;
      });
    } catch (error) {
      console.error('Error getting active projects:', error);
      return [];
    }
  }

  /**
   * Generate salary expenses for a specific project and month
   */
  public async generateProjectSalaryExpenses(
    project: Project, 
    month: number, 
    year: number
  ): Promise<ProjectSalaryExpense | null> {
    try {
      if (!project.assignedEmployees || project.assignedEmployees.length === 0) {
        console.log(`Project ${project.name} has no assigned employees, skipping`);
        return null;
      }

      const monthStr = month.toString().padStart(2, '0');
      const period = `${year}-${monthStr}`;
      
      // Check if salary expenses already generated for this project/month
      if (this.isSalaryExpenseAlreadyGenerated(project.id, period)) {
        console.log(`Salary expenses already generated for project ${project.name} in ${period}`);
        return null;
      }

      const projectSalaryExpense: ProjectSalaryExpense = {
        projectId: project.id,
        projectName: project.name,
        projectCode: project.code,
        month: monthStr,
        year,
        teamMembers: [],
        totalSalaryExpense: 0,
        createdDate: new Date().toISOString(),
        expenseEntries: []
      };

      // Calculate pro-rated amounts based on project timeline
      const daysInMonth = this.getDaysInMonth(month, year);
      const projectDaysInMonth = this.getProjectDaysInMonth(project, month, year);
      const proRationFactor = projectDaysInMonth / daysInMonth;

      console.log(`Project ${project.name}: ${projectDaysInMonth}/${daysInMonth} days in ${period} (factor: ${proRationFactor.toFixed(3)})`);

      // Process each assigned employee
      for (const assignedEmployee of project.assignedEmployees) {
        try {
          const employee = this.getEmployeeById(assignedEmployee.employeeId);
          if (!employee) {
            console.warn(`Employee ${assignedEmployee.employeeId} not found`);
            continue;
          }

          // Calculate employee's payroll for the period
          const payrollCalculation = this.payrollService.calculateEmployeePayroll(employee, period);
          
          // Calculate allocated amount based on project allocation percentage
          const allocationFactor = assignedEmployee.allocation / 100;
          const allocatedSalary = payrollCalculation.netSalary * allocationFactor * proRationFactor;

          if (allocatedSalary > 0) {
            // Create expense entry for this employee's salary allocation
            const expenseEntry = await this.createSalaryExpenseEntry(
              project,
              assignedEmployee,
              payrollCalculation,
              allocatedSalary,
              period
            );

            projectSalaryExpense.teamMembers.push({
              employeeId: assignedEmployee.employeeId,
              employeeName: assignedEmployee.employeeName,
              netSalary: payrollCalculation.netSalary,
              allocation: assignedEmployee.allocation,
              allocatedAmount: allocatedSalary
            });

            projectSalaryExpense.totalSalaryExpense += allocatedSalary;
            projectSalaryExpense.expenseEntries.push(expenseEntry.id);
          }
        } catch (error) {
          console.error(`Error processing employee ${assignedEmployee.employeeName}:`, error);
        }
      }

      if (projectSalaryExpense.totalSalaryExpense > 0) {
        // Save project salary expense record
        this.saveProjectSalaryExpense(projectSalaryExpense);
        
        // Update project's salary expenses
        this.updateProjectSalaryExpenses(project.id);
        
        console.log(`Generated salary expenses for project ${project.name}: R${projectSalaryExpense.totalSalaryExpense.toFixed(2)}`);
        
        return projectSalaryExpense;
      }

      return null;
    } catch (error) {
      console.error(`Error generating salary expenses for project ${project.name}:`, error);
      throw error;
    }
  }

  /**
   * Create individual salary expense entry
   */
  private async createSalaryExpenseEntry(
    project: Project,
    assignedEmployee: ProjectEmployee,
    payrollCalculation: PayrollCalculation,
    allocatedAmount: number,
    period: string
  ): Promise<any> {
    const [year, month] = period.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[parseInt(month) - 1];

    const expenseEntry = {
      id: `salary-${assignedEmployee.employeeId}-${project.id}-${period}-${Date.now()}`,
      date: `${year}-${month}-01`, // First day of the month
      description: `Monthly Salary - ${assignedEmployee.employeeName} - ${project.name} - ${monthName} ${year}`,
      amount: Math.round(allocatedAmount * 100) / 100, // Round to 2 decimal places
      category: 'Payroll Expenses',
      status: 'approved' as const, // Auto-approve salary expenses
      paymentMethod: 'Payroll System',
      assignedTo: assignedEmployee.employeeName,
      project: project.name,
      projectId: project.id,
      projectCode: project.code,
      projectName: project.name,
      hasReceipt: false, // System-generated expenses don't have receipts
      submittedBy: 'Payroll Integration System',
      submittedDate: new Date().toISOString().split('T')[0],
      notes: `Automated salary expense - ${assignedEmployee.allocation}% allocation\n` +
             `Net Salary: R${payrollCalculation.netSalary.toFixed(2)}\n` +
             `Allocated Amount: R${allocatedAmount.toFixed(2)}\n` +
             `Period: ${monthName} ${year}`,
      source: 'payroll_system' as const,
      transactionType: 'debit' as const,
      debit: Math.round(allocatedAmount * 100) / 100
    };

    // Add to expenses in localStorage
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    expenses.push(expenseEntry);
    localStorage.setItem('expenses', JSON.stringify(expenses));

    // Update project expense totals through sync service
    this.syncService.updateProjectExpenses(project.id);

    console.log(`Created salary expense entry: ${expenseEntry.description} - R${expenseEntry.amount}`);
    
    return expenseEntry;
  }

  /**
   * Get employee by ID
   */
  private getEmployeeById(employeeId: string): Employee | null {
    const employees = getAllEmployees();
    return employees.find(emp => emp.id === employeeId) || null;
  }

  /**
   * Get number of days in a month
   */
  private getDaysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
  }

  /**
   * Get number of project days within a specific month
   */
  private getProjectDaysInMonth(project: Project, month: number, year: number): number {
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0); // Last day of month

    // Determine the actual start and end dates within the month
    const effectiveStart = startDate > monthStart ? startDate : monthStart;
    const effectiveEnd = endDate < monthEnd ? endDate : monthEnd;

    // If project doesn't overlap with this month, return 0
    if (effectiveStart > effectiveEnd) {
      return 0;
    }

    // Calculate days (inclusive)
    const timeDiff = effectiveEnd.getTime() - effectiveStart.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }

  /**
   * Check if salary expense already generated for project/period
   */
  private isSalaryExpenseAlreadyGenerated(projectId: number, period: string): boolean {
    try {
      const projectSalaryExpenses = JSON.parse(localStorage.getItem('projectSalaryExpenses') || '[]');
      return projectSalaryExpenses.some((expense: ProjectSalaryExpense) => 
        expense.projectId === projectId && 
        `${expense.year}-${expense.month}` === period
      );
    } catch (error) {
      console.error('Error checking existing salary expenses:', error);
      return false;
    }
  }

  /**
   * Save project salary expense record
   */
  private saveProjectSalaryExpense(projectSalaryExpense: ProjectSalaryExpense): void {
    try {
      const projectSalaryExpenses = JSON.parse(localStorage.getItem('projectSalaryExpenses') || '[]');
      projectSalaryExpenses.push(projectSalaryExpense);
      localStorage.setItem('projectSalaryExpenses', JSON.stringify(projectSalaryExpenses));
    } catch (error) {
      console.error('Error saving project salary expense:', error);
    }
  }

  /**
   * Save automation log
   */
  private saveAutomationLog(log: MonthlyAutomationLog): void {
    try {
      const logs = JSON.parse(localStorage.getItem('payrollAutomationLogs') || '[]');
      logs.push(log);
      // Keep only last 12 months of logs
      if (logs.length > 12) {
        logs.splice(0, logs.length - 12);
      }
      localStorage.setItem('payrollAutomationLogs', JSON.stringify(logs));
    } catch (error) {
      console.error('Error saving automation log:', error);
    }
  }

  /**
   * Update project's salary expenses total
   */
  private updateProjectSalaryExpenses(projectId: number): void {
    try {
      const projects: Project[] = JSON.parse(localStorage.getItem('projects') || '[]');
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex !== -1) {
        const totalSalaryExpenses = this.calculateTotalSalaryExpensesForProject(projectId);
        projects[projectIndex].salaryExpenses = totalSalaryExpenses;
        
        // Update total project expenses
        const regularExpenses = projects[projectIndex].expenses || 0;
        projects[projectIndex].totalProjectExpenses = regularExpenses + totalSalaryExpenses;
        
        localStorage.setItem('projects', JSON.stringify(projects));
        console.log(`Updated project ${projectId} salary expenses: R${totalSalaryExpenses.toFixed(2)}`);
      }
    } catch (error) {
      console.error('Error updating project salary expenses:', error);
    }
  }

  /**
   * Calculate total salary expenses for a project
   */
  private calculateTotalSalaryExpensesForProject(projectId: number): number {
    try {
      const projectSalaryExpenses = JSON.parse(localStorage.getItem('projectSalaryExpenses') || '[]');
      return projectSalaryExpenses
        .filter((expense: ProjectSalaryExpense) => expense.projectId === projectId)
        .reduce((total: number, expense: ProjectSalaryExpense) => total + expense.totalSalaryExpense, 0);
    } catch (error) {
      console.error('Error calculating total salary expenses:', error);
      return 0;
    }
  }

  /**
   * Get project salary expenses for a specific project
   */
  public getProjectSalaryExpenses(projectId: number): ProjectSalaryExpense[] {
    try {
      const projectSalaryExpenses = JSON.parse(localStorage.getItem('projectSalaryExpenses') || '[]');
      return projectSalaryExpenses.filter((expense: ProjectSalaryExpense) => expense.projectId === projectId);
    } catch (error) {
      console.error('Error getting project salary expenses:', error);
      return [];
    }
  }

  /**
   * Get automation logs
   */
  public getAutomationLogs(): MonthlyAutomationLog[] {
    try {
      return JSON.parse(localStorage.getItem('payrollAutomationLogs') || '[]');
    } catch (error) {
      console.error('Error getting automation logs:', error);
      return [];
    }
  }

  /**
   * Enable/disable automation
   */
  public setAutomationEnabled(enabled: boolean): void {
    this.automationEnabled = enabled;
    localStorage.setItem('payrollAutomationEnabled', enabled.toString());
    console.log(`Payroll automation ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if automation is enabled
   */
  public isAutomationEnabled(): boolean {
    return this.automationEnabled;
  }

  /**
   * Manually trigger automation for testing
   */
  public async triggerManualAutomation(month?: number, year?: number): Promise<MonthlyAutomationLog> {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();
    
    console.log(`Manually triggering payroll automation for ${targetMonth}/${targetYear}`);
    return this.runMonthlyAutomation(targetMonth, targetYear);
  }

  /**
   * Get salary expense breakdown for a project
   */
  public getProjectSalaryBreakdown(projectId: number): {
    totalSalaryExpenses: number;
    monthlyBreakdown: { month: string; amount: number; employeeCount: number }[];
    employeeBreakdown: { employeeName: string; totalAmount: number; months: number }[];
  } {
    const salaryExpenses = this.getProjectSalaryExpenses(projectId);
    
    const monthlyBreakdown = salaryExpenses.map(expense => ({
      month: `${expense.year}-${expense.month}`,
      amount: expense.totalSalaryExpense,
      employeeCount: expense.teamMembers.length
    }));

    const employeeMap = new Map<string, { totalAmount: number; months: Set<string> }>();
    
    salaryExpenses.forEach(expense => {
      expense.teamMembers.forEach(member => {
        const key = member.employeeName;
        if (!employeeMap.has(key)) {
          employeeMap.set(key, { totalAmount: 0, months: new Set() });
        }
        const data = employeeMap.get(key)!;
        data.totalAmount += member.allocatedAmount;
        data.months.add(`${expense.year}-${expense.month}`);
      });
    });

    const employeeBreakdown = Array.from(employeeMap.entries()).map(([name, data]) => ({
      employeeName: name,
      totalAmount: data.totalAmount,
      months: data.months.size
    }));

    const totalSalaryExpenses = salaryExpenses.reduce((total, expense) => total + expense.totalSalaryExpense, 0);

    return {
      totalSalaryExpenses,
      monthlyBreakdown,
      employeeBreakdown
    };
  }
}

export default PayrollExpenseIntegrationService;
export { PayrollExpenseIntegrationService };