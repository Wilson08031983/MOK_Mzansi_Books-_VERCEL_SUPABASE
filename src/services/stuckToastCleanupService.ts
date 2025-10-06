/**
 * Expense Storage Service
 * Handles local storage operations for manual expense entries
 */

import { NewExpenseData } from '@/components/accounting/RecordExpenseModal';

export interface StoredExpense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  transactionType: 'bank' | 'slip';
  projectId?: number;
  projectName?: string;
  projectCode?: string;
  status: 'pending' | 'approved' | 'rejected';
  receipt?: string; // base64 encoded image
  notes?: string;
  createdAt: string;
  updatedAt: string;
  submittedBy: string;
  submittedDate: string;
  hasReceipt: boolean;
  paymentMethod: string;
  source: 'manual';
}

class ExpenseStorageService {
  private readonly STORAGE_KEY = 'manual_expenses';
  private readonly ID_COUNTER_KEY = 'expense_id_counter';

  /**
   * Generate unique expense ID
   */
  private generateExpenseId(): string {
    const counter = this.getIdCounter();
    const newId = `EXP${String(counter).padStart(3, '0')}`;
    this.setIdCounter(counter + 1);
    return newId;
  }

  /**
   * Get current ID counter
   */
  private getIdCounter(): number {
    const stored = localStorage.getItem(this.ID_COUNTER_KEY);
    if (stored) {
      return parseInt(stored, 10);
    }
    
    // Initialize counter based on existing expenses
    const expenses = this.getAllExpenses();
    const maxId = expenses.reduce((max, expense) => {
      const idNumber = parseInt(expense.id.replace('EXP', ''), 10);
      return Math.max(max, idNumber);
    }, 0);
    
    const initialCounter = maxId + 1;
    this.setIdCounter(initialCounter);
    return initialCounter;
  }

  /**
   * Set ID counter
   */
  private setIdCounter(counter: number): void {
    localStorage.setItem(this.ID_COUNTER_KEY, counter.toString());
  }

  /**
   * Get all expenses from localStorage
   */
  getAllExpenses(): StoredExpense[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      console.error('Error loading expenses from localStorage:', error);
      return [];
    }
  }

  /**
   * Save expenses to localStorage
   */
  private saveExpenses(expenses: StoredExpense[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses to localStorage:', error);
      throw new Error('Failed to save expense data');
    }
  }

  /**
   * Create new expense
   */
  createExpense(expenseData: NewExpenseData): StoredExpense {
    const now = new Date().toISOString();
    const newExpense: StoredExpense = {
      id: this.generateExpenseId(),
      date: expenseData.date,
      description: expenseData.description,
      category: expenseData.category,
      amount: expenseData.amount,
      transactionType: expenseData.transactionType,
      projectId: expenseData.projectId,
      projectName: expenseData.projectName,
      projectCode: expenseData.projectCode,
      status: expenseData.status,
      receipt: expenseData.receipt,
      notes: expenseData.notes,
      createdAt: now,
      updatedAt: now,
      submittedBy: 'Manual Entry',
      submittedDate: expenseData.date,
      hasReceipt: !!expenseData.receipt,
      paymentMethod: expenseData.transactionType === 'bank' ? 'Bank Transfer' : 'Cash/Card',
      source: 'manual',
    };

    const expenses = this.getAllExpenses();
    expenses.push(newExpense);
    this.saveExpenses(expenses);

    return newExpense;
  }

  /**
   * Get expense by ID
   */
  getExpenseById(id: string): StoredExpense | null {
    const expenses = this.getAllExpenses();
    return expenses.find(expense => expense.id === id) || null;
  }

  /**
   * Update expense
   */
  updateExpense(id: string, updates: Partial<NewExpenseData>): StoredExpense | null {
    const expenses = this.getAllExpenses();
    const index = expenses.findIndex(expense => expense.id === id);
    
    if (index === -1) {
      return null;
    }

    const updatedExpense: StoredExpense = {
      ...expenses[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      hasReceipt: !!updates.receipt || expenses[index].hasReceipt,
    };

    expenses[index] = updatedExpense;
    this.saveExpenses(expenses);

    return updatedExpense;
  }

  /**
   * Delete expense
   */
  deleteExpense(id: string): boolean {
    const expenses = this.getAllExpenses();
    const index = expenses.findIndex(expense => expense.id === id);
    
    if (index === -1) {
      return false;
    }

    expenses.splice(index, 1);
    this.saveExpenses(expenses);
    return true;
  }

  /**
   * Get expenses by status
   */
  getExpensesByStatus(status: 'pending' | 'approved' | 'rejected'): StoredExpense[] {
    return this.getAllExpenses().filter(expense => expense.status === status);
  }

  /**
   * Get expenses by date range
   */
  getExpensesByDateRange(startDate: string, endDate: string): StoredExpense[] {
    return this.getAllExpenses().filter(expense => {
      return expense.date >= startDate && expense.date <= endDate;
    });
  }

  /**
   * Get expenses by project
   */
  getExpensesByProject(projectId: number): StoredExpense[] {
    return this.getAllExpenses().filter(expense => expense.projectId === projectId);
  }

  /**
   * Get expense statistics
   */
  getExpenseStatistics(): {
    total: number;
    totalAmount: number;
    approved: number;
    approvedAmount: number;
    pending: number;
    pendingAmount: number;
    rejected: number;
    rejectedAmount: number;
  } {
    const expenses = this.getAllExpenses();
    
    const stats = {
      total: expenses.length,
      totalAmount: 0,
      approved: 0,
      approvedAmount: 0,
      pending: 0,
      pendingAmount: 0,
      rejected: 0,
      rejectedAmount: 0,
    };

    expenses.forEach(expense => {
      stats.totalAmount += expense.amount;
      
      switch (expense.status) {
        case 'approved':
          stats.approved++;
          stats.approvedAmount += expense.amount;
          break;
        case 'pending':
          stats.pending++;
          stats.pendingAmount += expense.amount;
          break;
        case 'rejected':
          stats.rejected++;
          stats.rejectedAmount += expense.amount;
          break;
      }
    });

    return stats;
  }

  /**
   * Search expenses
   */
  searchExpenses(query: string): StoredExpense[] {
    const expenses = this.getAllExpenses();
    const lowercaseQuery = query.toLowerCase();
    
    return expenses.filter(expense => 
      expense.description.toLowerCase().includes(lowercaseQuery) ||
      expense.category.toLowerCase().includes(lowercaseQuery) ||
      expense.id.toLowerCase().includes(lowercaseQuery) ||
      expense.projectName?.toLowerCase().includes(lowercaseQuery) ||
      expense.projectCode?.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Bulk update expense status
   */
  bulkUpdateStatus(expenseIds: string[], status: 'pending' | 'approved' | 'rejected'): number {
    const expenses = this.getAllExpenses();
    let updatedCount = 0;
    
    expenses.forEach(expense => {
      if (expenseIds.includes(expense.id)) {
        expense.status = status;
        expense.updatedAt = new Date().toISOString();
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) {
      this.saveExpenses(expenses);
    }
    
    return updatedCount;
  }

  /**
   * Export expenses to JSON
   */
  exportExpenses(): string {
    const expenses = this.getAllExpenses();
    return JSON.stringify(expenses, null, 2);
  }

  /**
   * Import expenses from JSON
   */
  importExpenses(jsonData: string): number {
    try {
      const importedExpenses: StoredExpense[] = JSON.parse(jsonData);
      const currentExpenses = this.getAllExpenses();
      
      // Filter out duplicates based on ID
      const newExpenses = importedExpenses.filter(imported => 
        !currentExpenses.some(existing => existing.id === imported.id)
      );
      
      if (newExpenses.length > 0) {
        const allExpenses = [...currentExpenses, ...newExpenses];
        this.saveExpenses(allExpenses);
      }
      
      return newExpenses.length;
    } catch (error) {
      console.error('Error importing expenses:', error);
      throw new Error('Invalid JSON data');
    }
  }

  /**
   * Clear all expenses (use with caution)
   */
  clearAllExpenses(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.ID_COUNTER_KEY);
  }

  /**
   * Get expenses grouped by category
   */
  getExpensesByCategory(): Record<string, { count: number; amount: number; expenses: StoredExpense[] }> {
    const expenses = this.getAllExpenses();
    const grouped: Record<string, { count: number; amount: number; expenses: StoredExpense[] }> = {};
    
    expenses.forEach(expense => {
      if (!grouped[expense.category]) {
        grouped[expense.category] = {
          count: 0,
          amount: 0,
          expenses: [],
        };
      }
      
      grouped[expense.category].count++;
      grouped[expense.category].amount += expense.amount;
      grouped[expense.category].expenses.push(expense);
    });
    
    return grouped;
  }

  /**
   * Get monthly expense summary
   */
  getMonthlyExpenseSummary(year: number): Record<string, { count: number; amount: number }> {
    const expenses = this.getAllExpenses();
    const monthly: Record<string, { count: number; amount: number }> = {};
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getFullYear() === year) {
        const monthKey = `${year}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthly[monthKey]) {
          monthly[monthKey] = { count: 0, amount: 0 };
        }
        
        monthly[monthKey].count++;
        monthly[monthKey].amount += expense.amount;
      }
    });
    
    return monthly;
  }
}

// Create singleton instance
const expenseStorageService = new ExpenseStorageService();
export default expenseStorageService;
export { ExpenseStorageService };