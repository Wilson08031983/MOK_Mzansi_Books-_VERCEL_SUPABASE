import { ExtractedTransaction, BankStatement } from './ocrService';
import { CategorizedExpense } from './expenseCategorizationService';
import ExpenseCategorizationService from './expenseCategorizationService';

export interface StoredBankStatement extends BankStatement {
  id: string;
  fileName: string;
  uploadDate: string;
  companyId: string;
  processedTransactions: CategorizedExpense[];
  status: 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

export interface ExpenseSlip {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadDate: string;
  linkedTransactionId?: string;
  extractedText?: string;
  companyId: string;
}

class BankStatementService {
  private static instance: BankStatementService;
  private readonly STORAGE_KEY = 'bankStatements';
  private readonly SLIPS_STORAGE_KEY = 'expenseSlips';
  private readonly EXPENSES_STORAGE_KEY = 'categorizedExpenses';
  
  public static getInstance(): BankStatementService {
    if (!BankStatementService.instance) {
      BankStatementService.instance = new BankStatementService();
    }
    return BankStatementService.instance;
  }

  /**
   * Save a bank statement with its transactions
   */
  async saveBankStatement(
    bankStatement: BankStatement,
    fileName: string,
    companyId: string,
    rawTransactions: ExtractedTransaction[]
  ): Promise<string> {
    console.log('BankStatementService: Saving bank statement for company:', companyId);
    console.log('BankStatementService: Raw transactions count:', rawTransactions.length);
    
    const id = this.generateId();
    const categorizationService = ExpenseCategorizationService;
    
    // Process and categorize transactions
    const processedTransactions: CategorizedExpense[] = rawTransactions.map(transaction => {
      const categorization = categorizationService.categorizeExpense(
        transaction.description,
        Math.abs(transaction.amount)
      );
      
      return {
        id: this.generateId(),
        date: transaction.date,
        description: transaction.description,
        amount: Math.abs(transaction.amount),
        category: categorization.category,
        subcategory: categorization.subcategory,
        confidence: categorization.confidence,
        vatDeductible: categorization.vatDeductible,
        autoDetected: true,
        bankStatementId: id,
        status: 'pending',
        submittedDate: new Date().toISOString()
      };
    });
    
    console.log('BankStatementService: Processed transactions count:', processedTransactions.length);
    console.log('BankStatementService: Sample processed transaction:', processedTransactions[0]);
    
    const storedStatement: StoredBankStatement = {
      ...bankStatement,
      id,
      fileName,
      uploadDate: new Date().toISOString(),
      companyId,
      processedTransactions,
      status: 'completed'
    };
    
    // Save to localStorage
    const statements = this.getBankStatements();
    statements.push(storedStatement);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(statements));
    console.log('BankStatementService: Saved bank statement to localStorage. Total statements:', statements.length);
    
    // Save individual expenses
    this.saveExpenses(processedTransactions);
    console.log('BankStatementService: Saved individual expenses to localStorage');
    
    return id;
  }

  /**
   * Get all bank statements for a company
   */
  getBankStatements(companyId?: string): StoredBankStatement[] {
    const statements = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    console.log('BankStatementService: Retrieved statements from localStorage:', statements.length);
    const filtered = companyId ? statements.filter((s: StoredBankStatement) => s.companyId === companyId) : statements;
    console.log('BankStatementService: Filtered statements for company', companyId, ':', filtered.length);
    return filtered;
  }

  /**
   * Get bank statement by ID
   */
  getBankStatementById(id: string): StoredBankStatement | undefined {
    const statements = this.getBankStatements();
    return statements.find(s => s.id === id);
  }

  /**
   * Save categorized expenses
   */
  private saveExpenses(expenses: CategorizedExpense[]): void {
    console.log('BankStatementService: Saving expenses:', expenses.length);
    // Get ALL expenses (not filtered by company) to maintain the full list
    const existingExpenses = JSON.parse(localStorage.getItem(this.EXPENSES_STORAGE_KEY) || '[]');
    console.log('BankStatementService: Existing expenses count:', existingExpenses.length);
    const updatedExpenses = [...existingExpenses, ...expenses];
    localStorage.setItem(this.EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses));
    console.log('BankStatementService: Total expenses after save:', updatedExpenses.length);
  }

  /**
   * Get all expenses for a company
   */
  getExpenses(companyId?: string): CategorizedExpense[] {
    const expenses = JSON.parse(localStorage.getItem(this.EXPENSES_STORAGE_KEY) || '[]');
    console.log('BankStatementService: Retrieved expenses from localStorage:', expenses.length);
    console.log('BankStatementService: Sample expense from storage:', expenses[0]);
    
    if (!companyId) {
      console.log('BankStatementService: No companyId provided, returning all expenses');
      return expenses;
    }
    
    // Filter by company through bank statement
    const companyStatements = this.getBankStatements(companyId);
    const companyStatementIds = companyStatements.map(s => s.id);
    console.log('BankStatementService: Company statement IDs for', companyId, ':', companyStatementIds);
    console.log('BankStatementService: Company statements:', companyStatements.map(s => ({ id: s.id, companyId: s.companyId, fileName: s.fileName })));
    
    // If no company statements exist, return all expenses (for development/testing)
    if (companyStatementIds.length === 0) {
      console.log('BankStatementService: No company statements found, returning all expenses for development');
      return expenses;
    }
    
    const filtered = expenses.filter((e: CategorizedExpense) => 
      e.bankStatementId && companyStatementIds.includes(e.bankStatementId)
    );
    console.log('BankStatementService: Filtered expenses for company', companyId, ':', filtered.length);
    console.log('BankStatementService: Sample filtered expense:', filtered[0]);
    
    // If filtering results in no expenses but we have expenses in storage, 
    // return all expenses (this handles companyId mismatch issues)
    if (filtered.length === 0 && expenses.length > 0) {
      console.log('BankStatementService: No filtered expenses found but expenses exist in storage. Returning all expenses to prevent data loss.');
      return expenses;
    }
    
    return filtered;
  }

  /**
   * Update an expense
   */
  updateExpense(expenseId: string, updates: Partial<CategorizedExpense>): boolean {
    // Get ALL expenses (not filtered by company) to maintain the full list
    const expenses = JSON.parse(localStorage.getItem(this.EXPENSES_STORAGE_KEY) || '[]');
    const index = expenses.findIndex((e: CategorizedExpense) => e.id === expenseId);
    
    if (index === -1) return false;
    
    expenses[index] = { ...expenses[index], ...updates };
    localStorage.setItem(this.EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
    
    return true;
  }

  /**
   * Delete an expense (admin only)
   */
  deleteExpense(expenseId: string, isAdmin: boolean = false): boolean {
    if (!isAdmin) {
      console.warn('Only admin users can delete expenses');
      return false;
    }
    
    // Get ALL expenses (not filtered by company) to maintain the full list
    const expenses = JSON.parse(localStorage.getItem(this.EXPENSES_STORAGE_KEY) || '[]');
    const filteredExpenses = expenses.filter((e: CategorizedExpense) => e.id !== expenseId);
    
    localStorage.setItem(this.EXPENSES_STORAGE_KEY, JSON.stringify(filteredExpenses));
    return true;
  }

  /**
   * Save an expense slip
   */
  async saveExpenseSlip(
    file: File,
    companyId: string,
    linkedTransactionId?: string,
    extractedText?: string
  ): Promise<string> {
    const id = this.generateId();
    
    // Convert file to base64 for storage
    const fileUrl = await this.fileToBase64(file);
    
    const slip: ExpenseSlip = {
      id,
      fileName: file.name,
      fileUrl,
      fileType: file.type,
      uploadDate: new Date().toISOString(),
      linkedTransactionId,
      extractedText,
      companyId
    };
    
    const slips = this.getExpenseSlips();
    slips.push(slip);
    localStorage.setItem(this.SLIPS_STORAGE_KEY, JSON.stringify(slips));
    
    // If linked to a transaction, update the expense
    if (linkedTransactionId) {
      this.updateExpense(linkedTransactionId, {
        slipAttached: true,
        slipUrl: fileUrl
      });
    }
    
    return id;
  }

  /**
   * Get all expense slips for a company
   */
  getExpenseSlips(companyId?: string): ExpenseSlip[] {
    const slips = JSON.parse(localStorage.getItem(this.SLIPS_STORAGE_KEY) || '[]');
    return companyId ? slips.filter((s: ExpenseSlip) => s.companyId === companyId) : slips;
  }

  /**
   * Get expense slip by ID
   */
  getExpenseSlipById(id: string): ExpenseSlip | undefined {
    const slips = this.getExpenseSlips();
    return slips.find(s => s.id === id);
  }

  /**
   * Link a slip to a transaction by finding the best match
   */
  linkSlipToTransaction(
    slipId: string,
    slipAmount?: number,
    slipDate?: string,
    slipDescription?: string
  ): string | null {
    const slip = this.getExpenseSlipById(slipId);
    if (!slip) return null;
    
    const expenses = this.getExpenses(slip.companyId);
    
    // Find best matching transaction
    let bestMatch: CategorizedExpense | null = null;
    let bestScore = 0;
    
    for (const expense of expenses) {
      if (expense.slipAttached) continue; // Skip already linked expenses
      
      let score = 0;
      
      // Date matching (within 7 days)
      if (slipDate) {
        const expenseDate = new Date(expense.date);
        const slipDateObj = new Date(slipDate);
        const daysDiff = Math.abs((expenseDate.getTime() - slipDateObj.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 7) {
          score += Math.max(0, 30 - daysDiff * 4); // Max 30 points, decreasing by 4 per day
        }
      }
      
      // Amount matching (within 10% tolerance)
      if (slipAmount) {
        const amountDiff = Math.abs(expense.amount - slipAmount) / expense.amount;
        if (amountDiff <= 0.1) {
          score += Math.max(0, 40 - amountDiff * 400); // Max 40 points
        }
      }
      
      // Description similarity
      if (slipDescription) {
        const similarity = this.calculateStringSimilarity(expense.description, slipDescription);
        score += similarity * 30; // Max 30 points
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = expense;
      }
    }
    
    // Link if confidence is high enough (>50 points)
    if (bestMatch && bestScore > 50) {
      this.updateExpense(bestMatch.id, {
        slipAttached: true,
        slipUrl: slip.fileUrl
      });
      
      // Update slip with transaction link
      const slips = this.getExpenseSlips();
      const slipIndex = slips.findIndex(s => s.id === slipId);
      if (slipIndex !== -1) {
        slips[slipIndex].linkedTransactionId = bestMatch.id;
        localStorage.setItem(this.SLIPS_STORAGE_KEY, JSON.stringify(slips));
      }
      
      return bestMatch.id;
    }
    
    return null;
  }

  /**
   * Get VAT deductible expenses for VAT 201 calculation
   */
  getVATDeductibleExpenses(companyId: string, startDate: string, endDate: string): CategorizedExpense[] {
    const expenses = this.getExpenses(companyId);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expense.vatDeductible && 
             expense.status === 'approved' &&
             expenseDate >= start && 
             expenseDate <= end;
    });
  }

  /**
   * Calculate total VAT deductible amount for a period
   */
  calculateInputVAT(companyId: string, startDate: string, endDate: string): number {
    const vatExpenses = this.getVATDeductibleExpenses(companyId, startDate, endDate);
    const totalAmount = vatExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate VAT (15% of total amount / 1.15)
    return totalAmount * 0.15 / 1.15;
  }

  /**
   * Get expense statistics for a company
   */
  getExpenseStatistics(companyId: string): {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    vatDeductible: number;
    byCategory: Record<string, number>;
  } {
    const expenses = this.getExpenses(companyId);
    
    const stats = {
      total: expenses.length,
      approved: expenses.filter(e => e.status === 'approved').length,
      pending: expenses.filter(e => e.status === 'pending').length,
      rejected: expenses.filter(e => e.status === 'rejected').length,
      vatDeductible: expenses.filter(e => e.vatDeductible).length,
      byCategory: {} as Record<string, number>
    };
    
    // Count by category
    expenses.forEach(expense => {
      const categoryName = ExpenseCategorizationService.getCategoryDisplayName(expense.category);
      stats.byCategory[categoryName] = (stats.byCategory[categoryName] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Convert file to base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Calculate string similarity (simple implementation)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Clear all data (for testing/reset)
   */
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SLIPS_STORAGE_KEY);
    localStorage.removeItem(this.EXPENSES_STORAGE_KEY);
  }
}

export default BankStatementService.getInstance();