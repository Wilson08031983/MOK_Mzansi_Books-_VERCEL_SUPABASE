import { Project, ProjectEmployee, Expense } from '@/types/project';
import { Employee, getAllEmployees } from '@/services/employeeService';
import payrollCalculationService from '@/services/payrollCalculationService';
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
   * Trigger manual automation for a specific month/year
   */
  public async triggerManualAutomation(month: number, year: number): Promise<MonthlyAutomationLog> {
    return this.runMonthlyAutomation(month, year);
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
      console.log(`Found ${projects.length} total projects in storage`);
      
      const targetDate = new Date(year, month - 1, 1); // First day of target month
      const nextMonth = new Date(year, month, 1); // First day of next month
      
      const activeProjects = projects.filter(project => {
        console.log(`Checking project: ${project.name} (${project.code})`);
        
        // Check if project has assigned employees (either new format or legacy team)
        const hasEmployees = (project.assignedEmployees && project.assignedEmployees.length > 0) ||
                           (project.team && project.team.length > 0);
        
        if (!hasEmployees) {
          console.log(`  - Skipping: No assigned employees`);
          return false;
        }
        
        // Skip cancelled projects only
        if (project.status === 'Cancelled') {
          console.log(`  - Skipping: Project cancelled`);
          return false;
        }
        
        const startDate = new Date(project.startDate);
        const endDate = new Date(project.endDate);
        
        // Project is active if it overlaps with the target month
        const isActive = startDate < nextMonth && endDate >= targetDate;
        
        console.log(`  - Start: ${startDate.toISOString().split('T')[0]}, End: ${endDate.toISOString().split('T')[0]}`);
        console.log(`  - Target month: ${targetDate.toISOString().split('T')[0]} to ${new Date(nextMonth.getTime() - 1).toISOString().split('T')[0]}`);
        console.log(`  - Status: ${project.status}, Active: ${isActive}`);
        
        return isActive;
      });
      
      console.log(`Found ${activeProjects.length} active projects for ${month}/${year}:`, activeProjects.map(p => p.name));
      return activeProjects;
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

      // Process assigned employees (handle both new and legacy formats)
      const employeesToProcess = project.assignedEmployees || [];
      
      // If no assignedEmployees but has legacy team, convert them
      if (employeesToProcess.length === 0 && project.team && project.team.length > 0) {
        console.log(`Converting legacy team format for project ${project.name}`);
        const allEmployees = getAllEmployees();
        
        for (const teamMemberName of project.team) {
          const employee = allEmployees.find(emp => `${emp.firstName} ${emp.surname}` === teamMemberName);
          if (employee) {
            employeesToProcess.push({
              employeeId: employee.id,
              employeeName: `${employee.firstName} ${employee.surname}`,
              employeeNumber: employee.employeeNumber || '',
              position: employee.position,
              department: employee.department,
              monthlySalary: employee.salary,
              assignedDate: project.startDate,
              allocation: 100 // Default 100% allocation for legacy projects
            });
          }
        }
      }
      
      console.log(`Processing ${employeesToProcess.length} employees for project ${project.name}`);
      
      for (const assignedEmployee of employeesToProcess) {
        try {
          const employee = this.getEmployeeById(assignedEmployee.employeeId);
          if (!employee) {
            console.warn(`Employee ${assignedEmployee.employeeId} (${assignedEmployee.employeeName}) not found`);
            continue;
          }
          // Prefer cached payroll for this period (reflects Accounting PAYE/UIF updates) and fallback to live calculation
          const cachedNetSalary = this.getCachedNetSalaryForEmployeePeriod(employee.id, period);
          const netSalary =
            cachedNetSalary !== null
              ? cachedNetSalary
              : this.payrollService.calculateEmployeePayroll(employee, period).netSalary;
          console.log(
            `Payroll for ${employee.firstName} ${employee.surname}: Net Salary R${netSalary.toFixed(2)} ` +
              (cachedNetSalary !== null ? '(from cache)' : '(fresh calc)')
          );

          // Calculate allocated amount based on project allocation percentage
          const allocationFactor = (assignedEmployee.allocation || 100) / 100;
          const allocatedSalary = netSalary * allocationFactor * proRationFactor;

          console.log(
            `Allocated salary: R${netSalary.toFixed(2)} × ${allocationFactor} × ${proRationFactor.toFixed(3)} = R${allocatedSalary.toFixed(2)}`
          );

          if (allocatedSalary > 0) {
            // Create expense entry for this employee's salary allocation
            const expenseEntry = await this.createSalaryExpenseEntry(
              project,
              assignedEmployee,
              netSalary,
              allocatedSalary,
              period
            );

            projectSalaryExpense.teamMembers.push({
              employeeId: assignedEmployee.employeeId,
              employeeName: assignedEmployee.employeeName,
              netSalary: netSalary,
              allocation: assignedEmployee.allocation || 100,
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
    netSalary: number,
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
             `Net Salary: R${netSalary.toFixed(2)}\n` +
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
   * Get project salary expenses
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

  /**
   * Helper method to get employee by ID
   */
  private getEmployeeById(employeeId: string): Employee | null {
    try {
      const employees = getAllEmployees();
      return employees.find(emp => emp.id === employeeId) || null;
    } catch (error) {
      console.error('Error getting employee by ID:', error);
      return null;
    }
  }

  /**
   * Attempt to read cached payroll net salary for a given employee and period.
   * Checks `payroll_calculations_YYYY-MM` first, then falls back to `payrollCalculations`.
   * Returns null if not found or malformed.
   */
  private getCachedNetSalaryForEmployeePeriod(employeeId: string, period: string): number | null {
    try {
      const periodKey = `payroll_calculations_${period}`;
      let raw = localStorage.getItem(periodKey);
      if (!raw) {
        raw = localStorage.getItem('payrollCalculations');
      }
      if (!raw) return null;

      const records: any[] = JSON.parse(raw);
      if (!Array.isArray(records)) return null;

      // Prefer exact period match if available; otherwise accept any record for the employee
      const rec = records.find(
        (r: any) => r && r.employeeId === employeeId && (r.period ? r.period === period : true)
      );
      if (!rec) return null;
      const net = rec.netSalary;
      if (typeof net !== 'number' || isNaN(net)) return null;
      return net;
    } catch (e) {
      console.warn('PayrollExpenseIntegration: Failed to read cached payroll; will fallback to calc', e);
      return null;
    }
  }

  /**
   * Check if salary expense already generated for project/period
   */
  private isSalaryExpenseAlreadyGenerated(projectId: number, period: string): boolean {
    try {
      const existingExpenses = JSON.parse(localStorage.getItem('projectSalaryExpenses') || '[]');
      return existingExpenses.some((expense: ProjectSalaryExpense) => 
        expense.projectId === projectId && 
        `${expense.year}-${expense.month}` === period
      );
    } catch (error) {
      console.error('Error checking existing salary expenses:', error);
      return false;
    }
  }

  /**
   * Get days in month
   */
  private getDaysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
  }

  /**
   * Get project active days in month
   */
  private getProjectDaysInMonth(project: Project, month: number, year: number): number {
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    const effectiveStart = startDate > monthStart ? startDate : monthStart;
    const effectiveEnd = endDate < monthEnd ? endDate : monthEnd;

    if (effectiveStart > effectiveEnd) return 0;

    const timeDiff = effectiveEnd.getTime() - effectiveStart.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }

  /**
   * Save project salary expense record
   */
  private saveProjectSalaryExpense(projectSalaryExpense: ProjectSalaryExpense): void {
    try {
      const existingExpenses = JSON.parse(localStorage.getItem('projectSalaryExpenses') || '[]');
      existingExpenses.push(projectSalaryExpense);
      localStorage.setItem('projectSalaryExpenses', JSON.stringify(existingExpenses));
    } catch (error) {
      console.error('Error saving project salary expense:', error);
    }
  }





  /**
   * Save automation log
   */
  private saveAutomationLog(log: MonthlyAutomationLog): void {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('payrollAutomationLogs') || '[]');
      existingLogs.push(log);
      
      // Keep only last 50 logs
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      
      localStorage.setItem('payrollAutomationLogs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Error saving automation log:', error);
    }
  }

}

export default PayrollExpenseIntegrationService;
export { PayrollExpenseIntegrationService };