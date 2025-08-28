import { Project } from '@/types/project';

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod: string;
  assignedTo?: string;
  project?: string;
  projectId?: number;
  projectCode?: string;
  projectName?: string;
  hasReceipt: boolean;
  submittedBy: string;
  submittedDate: string;
  notes?: string;
  debit?: number;
  credit?: number;
  balance?: number;
  transactionType?: 'debit' | 'credit';
  source?: 'manual' | 'bank_statement';
  bankStatementId?: string;
}

interface ProjectExpenseData {
  projectId: number;
  totalExpenses: number;
  approvedExpenses: number;
  pendingExpenses: number;
  rejectedExpenses: number;
  expenseCount: number;
  lastUpdated: string;
}

class ExpenseProjectSyncService {
  private static instance: ExpenseProjectSyncService;
  private listeners: Set<() => void> = new Set();

  static getInstance(): ExpenseProjectSyncService {
    if (!ExpenseProjectSyncService.instance) {
      ExpenseProjectSyncService.instance = new ExpenseProjectSyncService();
    }
    return ExpenseProjectSyncService.instance;
  }

  // Subscribe to expense-project sync updates
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of changes
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }

  // Get all expenses from localStorage
  private getAllExpenses(): Expense[] {
    try {
      // Legacy/manual entries stored by other modules
      const legacyManualExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      // Bank statement categorized entries
      const categorizedExpenses = JSON.parse(localStorage.getItem('categorizedExpenses') || '[]');
      // Manual expenses stored via ExpenseStorageService
      const sharedManualExpenses = JSON.parse(localStorage.getItem('manual_expenses') || '[]');
      return [...legacyManualExpenses, ...categorizedExpenses, ...sharedManualExpenses];
    } catch (error) {
      console.error('Error loading expenses:', error);
      return [];
    }
  }

  // Get all projects from localStorage
  private getAllProjects(): Project[] {
    try {
      return JSON.parse(localStorage.getItem('projects') || '[]');
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  // Save projects to localStorage
  private saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem('projects', JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  }

  // Calculate project expense data
  calculateProjectExpenses(projectId: number): ProjectExpenseData {
    const expenses = this.getAllExpenses().filter(expense => expense.projectId === projectId);
    
    // External/manual expenses total (bank/manual sources)
    const externalExpensesTotal = expenses.reduce((sum, expense) => {
      const amount = expense.amount || expense.debit || 0;
      return sum + amount;
    }, 0);

    // Attendance Pay expenses stored directly on the project.expenses_list
    const projects = this.getAllProjects();
    const project = projects.find(p => p.id === projectId);
    const attendanceExpensesTotal = project && Array.isArray((project as any).expenses_list)
      ? (project as any).expenses_list.reduce((sum: number, e: any) => {
          const isAttendance = e && (e.type === 'Attendance Pay');
          const amount = typeof e?.amount === 'number' ? e.amount : 0;
          return sum + (isAttendance ? amount : 0);
        }, 0)
      : 0;

    const totalExpenses = externalExpensesTotal + attendanceExpensesTotal;

    const approvedExpenses = expenses
      .filter(expense => expense.status === 'approved')
      .reduce((sum, expense) => {
        const amount = expense.amount || expense.debit || 0;
        return sum + amount;
      }, 0);

    const pendingExpenses = expenses
      .filter(expense => expense.status === 'pending')
      .reduce((sum, expense) => {
        const amount = expense.amount || expense.debit || 0;
        return sum + amount;
      }, 0);

    const rejectedExpenses = expenses
      .filter(expense => expense.status === 'rejected')
      .reduce((sum, expense) => {
        const amount = expense.amount || expense.debit || 0;
        return sum + amount;
      }, 0);

    return {
      projectId,
      totalExpenses,
      approvedExpenses,
      pendingExpenses,
      rejectedExpenses,
      expenseCount: expenses.length,
      lastUpdated: new Date().toISOString()
    };
  }

  // Update project expense totals
  updateProjectExpenses(projectId: number): void {
    const projects = this.getAllProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      console.warn(`Project with ID ${projectId} not found`);
      return;
    }

    const expenseData = this.calculateProjectExpenses(projectId);
    
    // Update the project with new expense data
    projects[projectIndex] = {
      ...projects[projectIndex],
      expenses: expenseData.totalExpenses,
      approvedExpenses: expenseData.approvedExpenses,
      pendingExpenses: expenseData.pendingExpenses,
      rejectedExpenses: expenseData.rejectedExpenses,
      expenseCount: expenseData.expenseCount,
      lastExpenseUpdate: expenseData.lastUpdated
    };

    this.saveProjects(projects);
    this.notifyListeners();
  }

  // Update all project expenses
  updateAllProjectExpenses(): void {
    const projects = this.getAllProjects();
    const updated = this.getAllProjects();
    projects.forEach(project => {
      const data = this.calculateProjectExpenses(project.id);
      const idx = updated.findIndex(p => p.id === project.id);
      if (idx !== -1) {
        updated[idx] = {
          ...updated[idx],
          expenses: data.totalExpenses,
          approvedExpenses: data.approvedExpenses,
          pendingExpenses: data.pendingExpenses,
          rejectedExpenses: data.rejectedExpenses,
          expenseCount: data.expenseCount,
          lastExpenseUpdate: data.lastUpdated
        };
      }
    });
    this.saveProjects(updated);
    this.notifyListeners();
  }

  // Handle expense assignment to project
  assignExpenseToProject(expenseId: string, projectId: number | null, expenseType: 'manual' | 'categorized' = 'manual'): boolean {
    try {
      const storageKey = expenseType === 'manual' ? 'expenses' : 'categorizedExpenses';
      const expenses = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const expenseIndex = expenses.findIndex((expense: Expense) => expense.id === expenseId);
      
      if (expenseIndex === -1) {
        console.warn(`Expense with ID ${expenseId} not found in ${expenseType} expenses`);
        return false;
      }

      const oldProjectId = expenses[expenseIndex].projectId;
      
      if (projectId) {
        // Assign to new project
        const projects = this.getAllProjects();
        const project = projects.find(p => p.id === projectId);
        
        if (!project) {
          console.warn(`Project with ID ${projectId} not found`);
          return false;
        }

        expenses[expenseIndex] = {
          ...expenses[expenseIndex],
          projectId,
          projectCode: project.code,
          projectName: project.name
        };
      } else {
        // Remove project assignment
        expenses[expenseIndex] = {
          ...expenses[expenseIndex],
          projectId: null,
          projectCode: undefined,
          projectName: undefined
        };
      }

      // Save updated expenses
      localStorage.setItem(storageKey, JSON.stringify(expenses));

      // Update project totals for both old and new projects
      if (oldProjectId) {
        this.updateProjectExpenses(oldProjectId);
      }
      if (projectId) {
        this.updateProjectExpenses(projectId);
      }

      return true;
    } catch (error) {
      console.error('Error assigning expense to project:', error);
      return false;
    }
  }

  // Handle expense deletion
  deleteExpense(expenseId: string, expenseType: 'manual' | 'categorized' = 'manual'): boolean {
    try {
      const storageKey = expenseType === 'manual' ? 'expenses' : 'categorizedExpenses';
      const expenses = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const expenseIndex = expenses.findIndex((expense: Expense) => expense.id === expenseId);
      
      if (expenseIndex === -1) {
        console.warn(`Expense with ID ${expenseId} not found`);
        return false;
      }

      const expense = expenses[expenseIndex];
      const projectId = expense.projectId;
      
      // Remove expense
      expenses.splice(expenseIndex, 1);
      localStorage.setItem(storageKey, JSON.stringify(expenses));

      // Update project totals if expense was assigned to a project
      if (projectId) {
        this.updateProjectExpenses(projectId);
      }

      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      return false;
    }
  }

  // Handle expense amount change
  updateExpenseAmount(expenseId: string, newAmount: number, expenseType: 'manual' | 'categorized' = 'manual'): boolean {
    try {
      const storageKey = expenseType === 'manual' ? 'expenses' : 'categorizedExpenses';
      const expenses = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const expenseIndex = expenses.findIndex((expense: Expense) => expense.id === expenseId);
      
      if (expenseIndex === -1) {
        console.warn(`Expense with ID ${expenseId} not found`);
        return false;
      }

      const expense = expenses[expenseIndex];
      const projectId = expense.projectId;
      
      // Update expense amount
      expenses[expenseIndex] = {
        ...expenses[expenseIndex],
        amount: newAmount
      };
      
      localStorage.setItem(storageKey, JSON.stringify(expenses));

      // Update project totals if expense is assigned to a project
      if (projectId) {
        this.updateProjectExpenses(projectId);
      }

      return true;
    } catch (error) {
      console.error('Error updating expense amount:', error);
      return false;
    }
  }

  // Handle expense status change
  updateExpenseStatus(expenseId: string, newStatus: 'pending' | 'approved' | 'rejected', expenseType: 'manual' | 'categorized' = 'manual'): boolean {
    try {
      const storageKey = expenseType === 'manual' ? 'expenses' : 'categorizedExpenses';
      const expenses = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const expenseIndex = expenses.findIndex((expense: Expense) => expense.id === expenseId);
      
      if (expenseIndex === -1) {
        console.warn(`Expense with ID ${expenseId} not found`);
        return false;
      }

      const expense = expenses[expenseIndex];
      const projectId = expense.projectId;
      
      // Update expense status
      expenses[expenseIndex] = {
        ...expenses[expenseIndex],
        status: newStatus
      };
      
      localStorage.setItem(storageKey, JSON.stringify(expenses));

      // Update project totals if expense is assigned to a project
      if (projectId) {
        this.updateProjectExpenses(projectId);
      }

      return true;
    } catch (error) {
      console.error('Error updating expense status:', error);
      return false;
    }
  }

  // Get project expense summary
  getProjectExpenseSummary(projectId: number): ProjectExpenseData | null {
    try {
      return this.calculateProjectExpenses(projectId);
    } catch (error) {
      console.error('Error getting project expense summary:', error);
      return null;
    }
  }

  // Get all project expense summaries
  getAllProjectExpenseSummaries(): Record<number, ProjectExpenseData> {
    const projects = this.getAllProjects();
    const summaries: Record<number, ProjectExpenseData> = {};
    
    projects.forEach(project => {
      summaries[project.id] = this.calculateProjectExpenses(project.id);
    });
    
    return summaries;
  }

  // Initialize and sync all data
  initializeSync(): void {
    console.log('Initializing expense-project synchronization...');
    this.updateAllProjectExpenses();
    console.log('Expense-project synchronization initialized');
  }

  // Validate data integrity
  validateDataIntegrity(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    const expenses = this.getAllExpenses();
    const projects = this.getAllProjects();
    const projectIds = new Set(projects.map(p => p.id));
    
    // Check for expenses assigned to non-existent projects
    expenses.forEach(expense => {
      if (expense.projectId && !projectIds.has(expense.projectId)) {
        issues.push(`Expense ${expense.id} is assigned to non-existent project ${expense.projectId}`);
      }
    });
    
    // Check for project expense totals that don't match calculated values
    projects.forEach(project => {
      const calculated = this.calculateProjectExpenses(project.id);
      if (Math.abs((project.expenses || 0) - calculated.totalExpenses) > 0.01) {
        issues.push(`Project ${project.id} expense total (${project.expenses}) doesn't match calculated value (${calculated.totalExpenses})`);
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  // Repair data integrity issues
  repairDataIntegrity(): void {
    console.log('Repairing data integrity...');
    
    // Remove project assignments for non-existent projects
    const projects = this.getAllProjects();
    const projectIds = new Set(projects.map(p => p.id));
    
    ['expenses', 'categorizedExpenses'].forEach(storageKey => {
      try {
        const expenses = JSON.parse(localStorage.getItem(storageKey) || '[]');
        let modified = false;
        
        expenses.forEach((expense: Expense) => {
          if (expense.projectId && !projectIds.has(expense.projectId)) {
            expense.projectId = null;
            expense.projectCode = undefined;
            expense.projectName = undefined;
            modified = true;
          }
        });
        
        if (modified) {
          localStorage.setItem(storageKey, JSON.stringify(expenses));
        }
      } catch (error) {
        console.error(`Error repairing ${storageKey}:`, error);
      }
    });
    
    // Recalculate all project expenses
    this.updateAllProjectExpenses();
    
    console.log('Data integrity repair completed');
  }
}

export default ExpenseProjectSyncService;
export type { ProjectExpenseData, Expense };