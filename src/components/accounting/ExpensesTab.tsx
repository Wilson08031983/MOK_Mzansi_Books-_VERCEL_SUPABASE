
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Receipt, 
  FileText, 
  Calendar, 
  Upload, 
  Edit, 
  Trash2, 
  FileCheck, 
  UserCheck, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Database,
  Eye,
  Download,
  FolderOpen,
  Link,
  FileX,
  CheckCircle,
  XCircle,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BankStatementUpload from './BankStatementUpload';

import RecordExpenseModal, { NewExpenseData } from './RecordExpenseModal';
import bankStatementService from '../../services/bankStatementService';
import expenseCategorizationService, { CategorizedExpense } from '../../services/expenseCategorizationService';
import expenseStorageService, { StoredExpense } from '../../services/expenseStorageService';
import { Project } from '@/types/project';
import ExpenseProjectSyncService from '@/services/expenseProjectSyncService';
import { toast } from 'sonner';
import slipOCRService, { ReceiptData } from '../../services/slipOCRService';
import SlipUploadWithOCR from './SlipUploadWithOCR';

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  assignedTo?: string;
  project?: string;
  // Enhanced project linking fields
  projectId?: number;
  projectCode?: string;
  projectName?: string;
  hasReceipt: boolean;
  submittedBy: string;
  submittedDate: string;
  notes?: string;
  // Bank statement specific fields
  debit?: number;
  credit?: number;
  balance?: number;
  transactionType?: 'debit' | 'credit';
  source?: 'manual' | 'bank_statement';
  bankStatementId?: string;
  // Receipt data for OCR and validation
  receipt?: ReceiptData;
}

interface ExpensesTabProps {
  onAddExpense: () => void;
  companyId?: string;
}

const ExpensesTab: React.FC<ExpensesTabProps> = ({ onAddExpense, companyId = 'current-company-id' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const [bankStatements, setBankStatements] = useState<any[]>([]);
  const [categorizedExpenses, setCategorizedExpenses] = useState<CategorizedExpense[]>([]);
  const [showBankUpload, setShowBankUpload] = useState(false);

  const [viewMode, setViewMode] = useState<'expense' | 'bank_statement'>('expense');
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<any[]>([]);
  // Project-related state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [selectedExpensesForBulkProject, setSelectedExpensesForBulkProject] = useState<string[]>([]);
  // companyId is now passed as a prop
  
  // Manual expense recording state
  const [showRecordExpenseModal, setShowRecordExpenseModal] = useState(false);
  const [manualExpenses, setManualExpenses] = useState<StoredExpense[]>([]);
  
  // Force refresh data when component mounts
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Initialize sync service
  const syncService = ExpenseProjectSyncService.getInstance();
  
  // Edit functionality state
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Expense>>({});
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | CategorizedExpense | null>(null);
  


  // Load bank statements, expenses, and projects on component mount
  useEffect(() => {
    console.log('ExpensesTab: Loading data for company:', companyId, 'refreshKey:', refreshKey);
    loadBankStatements();
    loadCategorizedExpenses();
    loadManualExpenses();
    loadProjects();
    
    // Initialize sync service
    syncService.initializeSync();
  }, [companyId, refreshKey]);
  
  // Subscribe to sync service updates
  useEffect(() => {
    const unsubscribe = syncService.subscribe(() => {
      console.log('ExpensesTab: Received sync update, refreshing projects');
      loadProjects();
    });
    
    return unsubscribe;
  }, [syncService]);

  // Load projects from localStorage
  const loadProjects = () => {
    try {
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        const parsed = JSON.parse(storedProjects);
        // Filter projects available for expense assignment (exclude only cancelled projects)
        const activeProjects = parsed.filter((project: Project) => 
          project.status !== 'Cancelled'
        );
        setProjects(activeProjects);
        console.log('ExpensesTab: Loaded active projects:', activeProjects.length);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const loadBankStatements = async () => {
    try {
      const statements = await bankStatementService.getBankStatements(companyId);
      console.log('ExpensesTab: Loaded bank statements:', statements.length);
      setBankStatements(statements);
    } catch (error) {
      console.error('Error loading bank statements:', error);
    }
  };

  const loadCategorizedExpenses = async () => {
    try {
      const expenses = await bankStatementService.getExpenses(companyId);
      console.log('ExpensesTab: Loaded categorized expenses:', expenses.length);
      console.log('ExpensesTab: Company ID used for filtering:', companyId);
      console.log('ExpensesTab: Sample expense data:', expenses.slice(0, 2));
      
      // Debug: Check localStorage directly
      const allExpensesInStorage = JSON.parse(localStorage.getItem('categorizedExpenses') || '[]');
      console.log('ExpensesTab: Total expenses in localStorage:', allExpensesInStorage.length);
      console.log('ExpensesTab: Sample localStorage expense:', allExpensesInStorage.slice(0, 2));
      
      setCategorizedExpenses(expenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const handleBankStatementUpload = async (statementId: string) => {
    console.log('ExpensesTab: Bank statement uploaded with ID:', statementId);
    setShowBankUpload(false);
    await loadBankStatements();
    await loadCategorizedExpenses();
    // Force component refresh
    setRefreshKey(prev => prev + 1);
    console.log('ExpensesTab: Data reloaded after bank statement upload');
  };

  // Standardize date format
  const standardizeDate = (dateStr: string): string => {
    try {
      // Handle various date formats
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // Try parsing DD-MM or DD/MM formats
        const parts = dateStr.split(/[-\/]/);
        if (parts.length >= 2) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // Month is 0-indexed
          const year = parts[2] ? parseInt(parts[2]) : new Date().getFullYear();
          const parsedDate = new Date(year, month, day);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString().split('T')[0];
          }
        }
        return new Date().toISOString().split('T')[0]; // Fallback to today
      }
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  // Check for duplicate transactions
  const isDuplicateTransaction = (transaction: any, existingExpenses: any[]): boolean => {
    return existingExpenses.some(expense => {
      const dateDiff = Math.abs(new Date(expense.date).getTime() - new Date(transaction.date).getTime());
      const amountDiff = Math.abs(expense.amount - Math.abs(transaction.amount));
      const descriptionMatch = expense.description.toLowerCase().includes(transaction.description.toLowerCase().substring(0, 10)) ||
                              transaction.description.toLowerCase().includes(expense.description.toLowerCase().substring(0, 10));
      
      // Consider duplicate if same day, similar amount (within R1), and similar description
      return dateDiff < 24 * 60 * 60 * 1000 && amountDiff < 1.0 && descriptionMatch;
    });
  };

  // Handle import from bank statement with preview
  const handleImportFromBankStatement = () => {
    // Get unprocessed bank statement transactions
    const unprocessedTransactions = bankStatements.flatMap(statement => 
      statement.transactions?.filter(transaction => {
        // Check if transaction is already imported
        const isAlreadyImported = categorizedExpenses.some(expense => 
          expense.bankStatementId === statement.id &&
          expense.description === transaction.description &&
          Math.abs(expense.amount - transaction.amount) < 0.01
        );
        return !isAlreadyImported;
      }).map(transaction => ({
        ...transaction,
        date: standardizeDate(transaction.date),
        bankStatementId: statement.id,
        isDuplicate: isDuplicateTransaction(transaction, categorizedExpenses),
        selected: !isDuplicateTransaction(transaction, categorizedExpenses) // Auto-select non-duplicates
      })) || []
    );
    
    if (unprocessedTransactions.length === 0) {
      alert('No new transactions to import. All bank statement transactions have already been processed.');
      return;
    }
    
    setPendingImportData(unprocessedTransactions);
    setShowImportPreview(true);
  };

  // Handle bulk import of selected transactions
  const handleBulkImport = async (selectedTransactions: any[]) => {
    try {
      const expenseCategorizationService = (await import('../../services/expenseCategorizationService')).default;
      
      const newExpenses = selectedTransactions.map(transaction => {
        const categorization = expenseCategorizationService.categorizeExpense(
          transaction.description,
          transaction.amount
        );
        
        return {
          id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: transaction.date,
          description: transaction.description,
          amount: transaction.amount,
          category: categorization.category,
          subcategory: categorization.subcategory,
          confidence: categorization.confidence,
          vatDeductible: categorization.vatDeductible,
          autoDetected: true,
          bankStatementId: transaction.bankStatementId || 'unknown',
          status: 'pending',
          submittedDate: new Date().toISOString(),
          slipAttached: false
        };
      });
      
      // Save to localStorage
      const existingExpenses = JSON.parse(localStorage.getItem('categorizedExpenses') || '[]');
      const updatedExpenses = [...existingExpenses, ...newExpenses];
      localStorage.setItem('categorizedExpenses', JSON.stringify(updatedExpenses));
      
      // Refresh data
      await loadCategorizedExpenses();
      setShowImportPreview(false);
      setPendingImportData([]);
      
      alert(`Successfully imported ${selectedTransactions.length} transactions!`);
    } catch (error) {
      console.error('Error importing transactions:', error);
      alert('Error importing transactions. Please try again.');
    }
  };



  const handleCategoryChange = async (expenseId: string, newCategory: string, newSubcategory: string) => {
    try {
      const expense = categorizedExpenses.find(e => e.id === expenseId);
      if (expense) {
        const updatedExpense = {
          ...expense,
          category: newCategory,
          subcategory: newSubcategory
        };
        await bankStatementService.updateExpense(expenseId, updatedExpense);
        await loadCategorizedExpenses();
      }
    } catch (error) {
      console.error('Error updating expense category:', error);
    }
  };



  // Manual expenses data (legacy)
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load manual expenses from expenseStorageService
  const loadManualExpenses = () => {
    try {
      const storedExpenses = expenseStorageService.getAllExpenses();
      setManualExpenses(storedExpenses);
      console.log('ExpensesTab: Loaded manual expenses:', storedExpenses.length);
      
      // Also load legacy expenses for backward compatibility
      const legacyExpenses = localStorage.getItem('expenses');
      if (legacyExpenses) {
        const parsed = JSON.parse(legacyExpenses);
        setExpenses(parsed);
        console.log('ExpensesTab: Loaded legacy expenses:', parsed.length);
      } else {
        // Initialize with sample data if no stored expenses
         const sampleExpenses: Expense[] = [
           {
             id: 'EXP001',
             date: '2025-06-01',
             description: 'Office Supplies - Stationery',
             amount: 450.00,
             category: 'Office Supplies',
             paymentMethod: 'Company Card',
             assignedTo: 'John Smith',
             project: 'Website Redesign',
             hasReceipt: true,
             submittedBy: 'Jane Doe',
             submittedDate: '2025-06-01',
             notes: 'Monthly stationery order for the team'
           },
           {
             id: 'EXP002',
             date: '2025-06-02',
             description: 'Client Lunch Meeting',
             amount: 180.50,
             category: 'Business Meals',
             paymentMethod: 'Personal Card',
             assignedTo: 'Sarah Johnson',
             project: 'Mobile App Development',
             hasReceipt: false,
             submittedBy: 'Mike Wilson',
             submittedDate: '2025-06-02',
             notes: 'Lunch with ABC Corporation team to discuss project requirements'
           },
           {
             id: 'EXP003',
             date: '2025-06-03',
             description: 'Uber to Client Office',
             amount: 45.00,
             category: 'Transportation',
             paymentMethod: 'Personal Card',
             submittedBy: 'David Brown',
             submittedDate: '2025-06-03',
             hasReceipt: true,
             notes: 'Transportation was not pre-approved'
           }
         ];
        setExpenses(sampleExpenses);
        localStorage.setItem('expenses', JSON.stringify(sampleExpenses));
        console.log('ExpensesTab: Initialized sample manual expenses');
      }
    } catch (error) {
      console.error('Error loading manual expenses:', error);
      setExpenses([]);
      setManualExpenses([]);
    }
  };

  /**
   * Handle saving new expense from modal
   */
  const handleSaveExpense = async (expenseData: NewExpenseData) => {
    try {
      const newExpense = expenseStorageService.createExpense(expenseData);
      console.log('ExpensesTab: Created new expense:', newExpense.id);
      
      // Reload manual expenses to update the display
      loadManualExpenses();
      
      // Update summary statistics
      setRefreshKey(prev => prev + 1);
      
      return newExpense;
    } catch (error) {
      console.error('Error saving expense:', error);
      throw error;
    }
  };

  /**
   * Handle opening record expense modal
   */
  const handleOpenRecordExpenseModal = () => {
    setShowRecordExpenseModal(true);
  };

  /**
   * Handle closing record expense modal
   */
  const handleCloseRecordExpenseModal = () => {
    setShowRecordExpenseModal(false);
  };

  /**
   * Delete manual expense
   */
  const handleDeleteManualExpense = (expenseId: string) => {
    try {
      const success = expenseStorageService.deleteExpense(expenseId);
      if (success) {
        toast.success('Expense deleted successfully');
        loadManualExpenses();
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Error deleting expense');
    }
  };

  /**
   * Update manual expense status
   */
  const handleUpdateExpenseStatus = (expenseId: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const updatedExpense = expenseStorageService.updateExpense(expenseId, { status });
      if (updatedExpense) {
        toast.success(`Expense ${status} successfully`);
        loadManualExpenses();
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error('Failed to update expense status');
      }
    } catch (error) {
      console.error('Error updating expense status:', error);
      toast.error('Error updating expense status');
    }
  };

  // Combine all expense sources: legacy manual, new manual, and categorized bank expenses
  const allExpenses: Expense[] = [
    // Legacy manual expenses
    ...expenses.map(expense => ({
      ...expense,
      source: 'manual' as const,
      debit: expense.amount,
      credit: undefined,
      balance: undefined,
      transactionType: 'debit' as const
    })),
    // New manual expenses from expenseStorageService
     ...manualExpenses.map(expense => ({
        id: expense.id,
        date: expense.date,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        status: expense.status,
        paymentMethod: expense.transactionType === 'bank' ? 'Bank Transfer' : 'Cash/Card',
        assignedTo: 'Current User',
        project: expense.projectName || undefined,
        projectId: expense.projectId || undefined,
        projectCode: expense.projectCode || undefined,
        projectName: expense.projectName || undefined,
        hasReceipt: expense.hasReceipt,
        submittedBy: expense.submittedBy,
        submittedDate: expense.submittedDate,
        notes: expense.notes,
        source: 'manual' as const,
        debit: expense.amount,
        credit: undefined,
        balance: undefined,
        transactionType: 'debit' as const
      })),
    ...categorizedExpenses.map(expense => {
      // Get original transaction data from bank statements
      const bankStatement = bankStatements.find(bs => bs.id === expense.bankStatementId);
      const originalTransaction = bankStatement?.transactions?.find(t => 
        t.description === expense.description && 
        Math.abs(t.amount - expense.amount) < 0.01
      );
      
      return {
        id: expense.id,
        date: expense.date,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        status: (expense.slipAttached ? 'approved' : 'pending') as 'pending' | 'approved' | 'rejected',
        paymentMethod: 'Bank Transfer',
        assignedTo: undefined,
        project: expense.bankStatementId || '',
        // Include project assignment fields
        projectId: expense.projectId,
        projectName: expense.projectName,
        projectCode: expense.projectCode,
        hasReceipt: expense.slipAttached || false,
        submittedBy: 'Auto-extracted',
        submittedDate: expense.date,
        notes: expense.subcategory ? `Subcategory: ${expense.subcategory}` : undefined,
        // Bank statement specific fields
        source: 'bank_statement' as const,
        debit: originalTransaction?.type === 'debit' ? originalTransaction.amount : undefined,
        credit: originalTransaction?.type === 'credit' ? originalTransaction.amount : undefined,
        balance: originalTransaction?.balance,
        transactionType: originalTransaction?.type || 'debit',
        bankStatementId: expense.bankStatementId
      };
    })
  ];
  
  console.log('ExpensesTab: Total expenses to display:', allExpenses.length, '(Sample:', expenses.length, '+ Bank extracted:', categorizedExpenses.length, ')');

  // Project assignment functions
  const handleProjectAssignment = async (expenseId: string, projectId: number | null) => {
    try {
      console.log('ExpensesTab: Assigning project', projectId, 'to expense', expenseId);
      
      // Determine expense type (manual or categorized)
      const isManualExpense = expenses.some(e => e.id === expenseId);
      const isCategorizedExpense = categorizedExpenses.some(e => e.id === expenseId);
      
      let expenseType: 'manual' | 'categorized' = 'manual';
      if (isCategorizedExpense) {
        expenseType = 'categorized';
      }
      
      // Use sync service to handle the assignment
      const success = syncService.assignExpenseToProject(expenseId, projectId, expenseType);
      
      if (success) {
        console.log('ExpensesTab: Project assignment successful');
        
        // Refresh local data to reflect changes
        await loadCategorizedExpenses();
        loadManualExpenses();
        
        // Show success feedback
        const selectedProject = projectId ? projects.find(p => p.id === projectId) : null;
        const message = selectedProject 
          ? `Expense assigned to ${selectedProject.name}` 
          : 'Project assignment removed';
        
        // You could add a toast notification here
        console.log(message);
      } else {
        throw new Error('Failed to assign project to expense');
      }
    } catch (error) {
      console.error('Error assigning project to expense:', error);
      alert('Error assigning project. Please try again.');
    }
  };
  
  // Update project expenses totals
  const updateProjectExpenses = async (projectId: number, amount: number, operation: 'add' | 'remove') => {
    try {
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        const projects = JSON.parse(storedProjects);
        const updatedProjects = projects.map((project: Project) => {
          if (project.id === projectId) {
            const currentExpenses = project.expenses || 0;
            const newExpenses = operation === 'add' 
              ? currentExpenses + amount 
              : Math.max(0, currentExpenses - amount);
            
            return {
              ...project,
              expenses: newExpenses,
              totalProjectExpenses: newExpenses + (project.salaryExpenses || 0)
            };
          }
          return project;
        });
        
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        loadProjects(); // Refresh local projects state
        console.log('Project expenses updated:', projectId, operation, amount);
      }
    } catch (error) {
      console.error('Error updating project expenses:', error);
    }
  };
  
  // Bulk project assignment
  const handleBulkProjectAssignment = async (projectId: number | null) => {
    if (selectedExpensesForBulkProject.length === 0) {
      alert('Please select expenses to assign to project.');
      return;
    }
    
    for (const expenseId of selectedExpensesForBulkProject) {
      await handleProjectAssignment(expenseId, projectId);
    }
    
    setSelectedExpensesForBulkProject([]);
    alert(`Successfully assigned ${selectedExpensesForBulkProject.length} expenses to project.`);
  };

  // Filter and sort expenses
  const filteredExpenses = allExpenses
    .filter(expense => {
      const matchesSearch = 
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (expense.project && expense.project.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (expense.projectName && expense.projectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (expense.projectCode && expense.projectCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (expense.assignedTo && expense.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
      const matchesProject = projectFilter === 'all' || 
        (projectFilter === 'unassigned' && !expense.projectId) ||
        (expense.projectId && expense.projectId.toString() === projectFilter);
      
      let matchesDateRange = true;
      const today = new Date();
      const expenseDate = new Date(expense.date);
      
      if (dateRangeFilter === 'today') {
        matchesDateRange = expenseDate.toDateString() === today.toDateString();
      } else if (dateRangeFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        matchesDateRange = expenseDate >= weekAgo;
      } else if (dateRangeFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(today.getMonth() - 1);
        matchesDateRange = expenseDate >= monthAgo;
      }
      
      return matchesSearch && matchesCategory && matchesProject && matchesDateRange;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;

        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Get unique categories from all expenses
  const categories = Array.from(new Set(allExpenses.map(expense => expense.category)));



  // Toggle sort order
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Toggle expense details
  const toggleExpenseDetails = (id: string) => {
    if (selectedExpense === id) {
      setSelectedExpense(null);
    } else {
      setSelectedExpense(id);
    }
  };

  // Handle edit expense
  const handleEditExpense = (expenseId: string) => {
    console.log('Edit expense:', expenseId);
    
    // Find the expense to edit
    const expenseToEdit = [...expenses, ...categorizedExpenses].find(e => e.id === expenseId);
    if (!expenseToEdit) {
      toast.error('Expense not found');
      return;
    }
    
    // Set edit mode and populate form data
     setEditingExpense(expenseId);
     setEditFormData({
       description: expenseToEdit.description,
       amount: expenseToEdit.amount,
       category: expenseToEdit.category,
       paymentMethod: 'paymentMethod' in expenseToEdit ? expenseToEdit.paymentMethod : 'Bank Transfer',
       notes: expenseToEdit.notes || ''
     });
    
    // Expand the expense details if not already expanded
    if (selectedExpense !== expenseId) {
      setSelectedExpense(expenseId);
    }
  };
  
  // Handle save edit
  const handleSaveEdit = async (expenseId: string) => {
    try {
      console.log('Saving edit for expense:', expenseId);
      
      // Determine expense type
      const isManualExpense = expenses.some(e => e.id === expenseId);
      const isCategorizedExpense = categorizedExpenses.some(e => e.id === expenseId);
      
      if (isManualExpense) {
         // Update manual expense - only update allowed fields
         const updateData = {
           description: editFormData.description,
           amount: editFormData.amount,
           category: editFormData.category,
           notes: editFormData.notes
         };
         const success = expenseStorageService.updateExpense(expenseId, updateData);
         if (success) {
           toast.success('Expense updated successfully');
           loadManualExpenses();
         } else {
           throw new Error('Failed to update manual expense');
         }
       } else if (isCategorizedExpense) {
        // Update categorized expense
        const expense = categorizedExpenses.find(e => e.id === expenseId);
        if (expense) {
          const updatedExpense = { ...expense, ...editFormData };
          await bankStatementService.updateExpense(expenseId, updatedExpense);
          await loadCategorizedExpenses();
          toast.success('Expense updated successfully');
        }
      }
      
      // Clear edit mode
      setEditingExpense(null);
      setEditFormData({});
      
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Error updating expense. Please try again.');
    }
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingExpense(null);
    setEditFormData({});
  };

  // Handle delete expense - show confirmation modal
  const handleDeleteExpense = (expenseId: string) => {
    const expense = [...expenses, ...categorizedExpenses].find(e => e.id === expenseId);
    if (expense) {
      setExpenseToDelete(expense);
      setShowDeleteModal(true);
    } else {
      toast.error('Expense not found');
    }
  };
  
  // Confirm delete expense
  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return;
    
    try {
      console.log('ExpensesTab: Deleting expense', expenseToDelete.id);
      
      // Determine expense type
      const isManualExpense = expenses.some(e => e.id === expenseToDelete.id);
      const isCategorizedExpense = categorizedExpenses.some(e => e.id === expenseToDelete.id);
      
      let expenseType: 'manual' | 'categorized' = 'manual';
      if (isCategorizedExpense) {
        expenseType = 'categorized';
      }
      
      // Use sync service to handle deletion (this will update project totals)
      const success = syncService.deleteExpense(expenseToDelete.id, expenseType);
      
      if (success) {
        console.log('ExpensesTab: Expense deletion successful');
        
        // For categorized expenses, also delete from bank statement service
        if (isCategorizedExpense) {
          await bankStatementService.deleteExpense(expenseToDelete.id);
        }
        
        // Refresh local data
        await loadCategorizedExpenses();
        loadManualExpenses();
        setRefreshKey(prev => prev + 1);
        
        toast.success(`Expense ${expenseToDelete.id} deleted successfully`);
        console.log('Expense deleted successfully:', expenseToDelete.id);
      } else {
        throw new Error('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense. Please try again.');
    } finally {
      setShowDeleteModal(false);
      setExpenseToDelete(null);
    }
  };
  
  // Cancel delete expense
  const cancelDeleteExpense = () => {
    setShowDeleteModal(false);
    setExpenseToDelete(null);
  };



  // Handle approve expense
  const handleApproveExpense = async (expenseId: string) => {
    try {
      console.log('ExpensesTab: Approving expense', expenseId);
      
      // Determine expense type
      const isManualExpense = expenses.some(e => e.id === expenseId);
      const isCategorizedExpense = categorizedExpenses.some(e => e.id === expenseId);
      
      let expenseType: 'manual' | 'categorized' = 'manual';
      if (isCategorizedExpense) {
        expenseType = 'categorized';
      }
      
      // Use sync service to handle status change (this will update project totals)
      const success = syncService.updateExpenseStatus(expenseId, 'approved', expenseType);
      
      if (success) {
        console.log('ExpensesTab: Expense approval successful');
        
        // For categorized expenses, also update in bank statement service
        if (isCategorizedExpense) {
          const expense = categorizedExpenses.find(e => e.id === expenseId);
          if (expense) {
            const updatedExpense = {
              ...expense,
              status: 'approved' as const
            };
            await bankStatementService.updateExpense(expenseId, updatedExpense);
          }
        }
        
        // Refresh local data
        await loadCategorizedExpenses();
        loadManualExpenses();
        
        console.log('Expense approved successfully:', expenseId);
      } else {
        throw new Error('Failed to approve expense');
      }
    } catch (error) {
      console.error('Error approving expense:', error);
      alert('Error approving expense. Please try again.');
    }
  };



  // Calculate totals
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expensesWithReceipts = filteredExpenses.filter(expense => expense.hasReceipt).length;
  const expensesWithoutReceipts = filteredExpenses.filter(expense => !expense.hasReceipt).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-4">
            <div className="text-sm text-slate-600 font-sf-pro">Total Expenses (Filtered)</div>
            <div className="text-xl font-bold mt-1 font-sf-pro">R{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="mt-2 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                <Receipt className="h-4 w-4" />
                <span>{filteredExpenses.length} expense records</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-4">
            <div className="text-sm text-slate-600 font-sf-pro">With Receipts</div>
            <div className="text-xl font-bold mt-1 text-mokm-green-600 font-sf-pro">{expensesWithReceipts}</div>
            <div className="mt-2 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                <FileCheck className="h-4 w-4" />
                <span>receipts attached</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-4">
            <div className="text-sm text-slate-600 font-sf-pro">Missing Receipts</div>
            <div className="text-xl font-bold mt-1 text-mokm-yellow-600 font-sf-pro">{expensesWithoutReceipts}</div>
            <div className="mt-2 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                <Receipt className="h-4 w-4" />
                <span>receipts needed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Search and basic filters */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass backdrop-blur-sm bg-white/50 border border-white/20"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-slate-600">
              <Filter className="h-4 w-4" />
              <span>Status:</span>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-mokm-blue-500 focus:border-transparent glass backdrop-blur-sm bg-white/50"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <div className="flex items-center space-x-1 text-sm text-slate-600">
              <Calendar className="h-4 w-4" />
              <span>Period:</span>
            </div>
            
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-mokm-blue-500 focus:border-transparent glass backdrop-blur-sm bg-white/50"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="ml-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'More Filters'}
              {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </Button>
          </div>
          
          {/* Advanced filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-mokm-blue-500 focus:border-transparent glass backdrop-blur-sm bg-white/50"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
                    Project
                  </label>
                  <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-mokm-blue-500 focus:border-transparent glass backdrop-blur-sm bg-white/50"
                  >
                    <option value="all">All Projects</option>
                    <option value="unassigned">Unassigned</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({project.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value)}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-mokm-blue-500 focus:border-transparent glass backdrop-blur-sm bg-white/50"
                  >
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="description">Description</option>
                    <option value="category">Category</option>
                    <option value="status">Status</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
                    Sort Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-mokm-blue-500 focus:border-transparent glass backdrop-blur-sm bg-white/50"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Bulk Project Assignment */}
      {selectedExpensesForBulkProject.length > 0 && (
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business mb-4">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-slate-700 font-sf-pro">
                  {selectedExpensesForBulkProject.length} expenses selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <select
                   value=""
                   onChange={(e) => {
                     if (e.target.value) {
                       const projectId = e.target.value === 'unassigned' ? null : parseInt(e.target.value);
                       handleBulkProjectAssignment(projectId);
                     }
                   }}
                   className="px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-mokm-blue-500 focus:border-transparent glass backdrop-blur-sm bg-white/50"
                 >
                   <option value="">Assign to Project...</option>
                   <option value="unassigned">Remove Project Assignment</option>
                   {projects.map(project => (
                     <option key={project.id} value={project.id}>
                       {project.name} ({project.code})
                     </option>
                   ))}
                 </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedExpensesForBulkProject([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Button
            onClick={handleOpenRecordExpenseModal}
            className="bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 font-sf-pro"
          >
            <Plus className="h-4 w-4 mr-2" />
            Record Expense
          </Button>
          
          <Dialog open={showBankUpload} onOpenChange={setShowBankUpload}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-mokm-green-500 text-mokm-green-700 hover:bg-mokm-green-50 font-sf-pro"
              >
                <Database className="h-4 w-4 mr-2" />
                Upload Bank Statement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload Bank Statement</DialogTitle>
              </DialogHeader>
              <BankStatementUpload
                companyId={companyId}
                onUploadComplete={handleBankStatementUpload}
              />
            </DialogContent>
          </Dialog>
          

          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-white/30 rounded-lg p-1">
            <Button
              variant={viewMode === 'expense' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('expense')}
              className={viewMode === 'expense' ? 'bg-mokm-blue-500 text-white' : 'text-slate-600'}
            >
              <Receipt className="h-4 w-4 mr-1" />
              Expense View
            </Button>
            <Button
              variant={viewMode === 'bank_statement' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('bank_statement')}
              className={viewMode === 'bank_statement' ? 'bg-mokm-green-500 text-white' : 'text-slate-600'}
            >
              <Database className="h-4 w-4 mr-1" />
              Bank Statement View
            </Button>
          </div>
        </div>
      </div>
      
      {/* Expenses table */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    <input
                      type="checkbox"
                      checked={selectedExpensesForBulkProject.length === filteredExpenses.length && filteredExpenses.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedExpensesForBulkProject(filteredExpenses.map(exp => exp.id));
                        } else {
                          setSelectedExpensesForBulkProject([]);
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    <button 
                      onClick={() => handleSort('date')} 
                      className="flex items-center space-x-1 hover:text-slate-900"
                    >
                      <span>Date</span>
                      {sortBy === 'date' && (
                        sortOrder === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    <button 
                      onClick={() => handleSort('description')} 
                      className="flex items-center space-x-1 hover:text-slate-900"
                    >
                      <span>Description</span>
                      {sortBy === 'description' && (
                        sortOrder === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  {viewMode === 'bank_statement' && (
                    <>
                      <th className="py-3 px-4 text-right text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                        <span>Debit</span>
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                        <span>Credit</span>
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                        <span>Balance</span>
                      </th>
                    </>
                  )}
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    <button 
                      onClick={() => handleSort('category')} 
                      className="flex items-center space-x-1 hover:text-slate-900"
                    >
                      <span>Category</span>
                      {sortBy === 'category' && (
                        sortOrder === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    <span>Project</span>
                  </th>
                  {viewMode === 'expense' && (
                    <th className="py-3 px-4 text-right text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                      <button 
                        onClick={() => handleSort('amount')} 
                        className="flex items-center space-x-1 ml-auto hover:text-slate-900"
                      >
                        <span>Amount</span>
                        {sortBy === 'amount' && (
                          sortOrder === 'asc' ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                  )}

                  <th className="py-3 px-4 text-center text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    <div className="flex items-center justify-center space-x-1">
                      <Receipt className="h-4 w-4" />
                      <span>RECEIPT</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map(expense => (
                    <React.Fragment key={expense.id}>
                      <tr 
                        className={`hover:bg-white/30 cursor-pointer transition-colors ${selectedExpense === expense.id ? 'bg-white/30' : ''}`}
                        onClick={() => toggleExpenseDetails(expense.id)}
                      >
                        <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedExpensesForBulkProject.includes(expense.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExpensesForBulkProject([...selectedExpensesForBulkProject, expense.id]);
                              } else {
                                setSelectedExpensesForBulkProject(selectedExpensesForBulkProject.filter(id => id !== expense.id));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900 font-sf-pro">{new Date(expense.date).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500 font-sf-pro">{expense.id}</div>
                          {expense.source === 'bank_statement' && (
                            <Badge variant="outline" className="text-xs mt-1">Bank Import</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-900 font-sf-pro">{expense.description}</div>
                        </td>
                        {viewMode === 'bank_statement' && (
                          <>
                            <td className="py-3 px-4 text-right">
                              <div className="text-sm font-medium text-slate-900 font-sf-pro">
                                {expense.debit ? `R${expense.debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="text-sm font-medium text-mokm-green-600 font-sf-pro">
                                {expense.credit ? `R${expense.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="text-sm font-medium text-slate-700 font-sf-pro">
                                {expense.balance ? `R${expense.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                              </div>
                            </td>
                          </>
                        )}
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-900 font-sf-pro">{expense.category}</div>
                          {expense.notes && expense.notes.includes('Subcategory:') && (
                            <div className="text-xs text-slate-500 font-sf-pro">{expense.notes.replace('Subcategory: ', '')}</div>
                          )}
                          <div className="text-xs text-slate-500 font-sf-pro">{expense.paymentMethod}</div>
                          {categorizedExpenses.find(e => e.id === expense.id)?.vatDeductible && (
                            <Badge variant="secondary" className="text-xs mt-1">VAT Deductible</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          {expense.projectId ? (
                            <div>
                              <div className="text-sm text-slate-900 font-sf-pro">{expense.projectName}</div>
                              <div className="text-xs text-slate-500 font-sf-pro">{expense.projectCode}</div>
                            </div>
                          ) : (
                            <select
                              value={expense.projectId || ''}
                              onChange={(e) => {
                                const projectId = e.target.value ? parseInt(e.target.value) : null;
                                handleProjectAssignment(expense.id, projectId);
                              }}
                              className="text-sm px-2 py-1 border border-white/20 rounded focus:ring-2 focus:ring-mokm-blue-500 focus:border-transparent glass backdrop-blur-sm bg-white/50"
                            >
                              <option value="">Assign Project...</option>
                              {projects.map(project => (
                                <option key={project.id} value={project.id}>
                                  {project.name} ({project.code})
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        {viewMode === 'expense' && (
                          <td className="py-3 px-4 text-right">
                            <div className="text-sm font-medium text-slate-900 font-sf-pro">R{expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          </td>
                        )}
                        <td className="py-3 px-4 text-center">
                          {(() => {
                            const receiptData = slipOCRService.getReceiptData(expense.id);
                            const status = receiptData?.status || (expense.hasReceipt ? 'attached' : 'missing');
                            
                            switch (status) {
                              case 'attached':
                                return (
                                  <div className="flex flex-col items-center space-y-1">
                                    <CheckCircle className="h-5 w-5 text-mokm-green-500" />
                                    <span className="text-xs text-mokm-green-600 font-sf-pro">Attached</span>
                                    {receiptData?.extractedAmount && (
                                      <span className="text-xs text-slate-500 font-sf-pro">
                                        R{receiptData.extractedAmount.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                );
                              case 'rejected':
                                return (
                                  <div className="flex flex-col items-center space-y-1">
                                    <XCircle className="h-5 w-5 text-mokm-red-500" />
                                    <span className="text-xs text-mokm-red-600 font-sf-pro">Rejected</span>
                                    {receiptData?.extractedAmount && (
                                      <span className="text-xs text-slate-500 font-sf-pro">
                                        R{receiptData.extractedAmount.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                );
                              default: // missing
                                return (
                                  <div className="flex flex-col items-center space-y-1">
                                    <Receipt className="h-5 w-5 text-mokm-yellow-500" />
                                    <span className="text-xs text-mokm-yellow-600 font-sf-pro">Missing</span>
                                  </div>
                                );
                            }
                          })()
                        }</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditExpense(expense.id);
                              }}
                              title="Edit expense"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteExpense(expense.id);
                              }}
                              title="Delete expense"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>

                          </div>
                        </td>
                      </tr>
                      {selectedExpense === expense.id && (
                        <tr>
                          <td colSpan={viewMode === 'bank_statement' ? 12 : 9} className="p-0">
                            <div className="bg-white/30 p-4 border-t border-b border-white/20">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-slate-700 mb-2 font-sf-pro">Details</h4>
                                  <div className="text-sm space-y-2">
                                    <div className="flex justify-between py-1 border-b border-white/20">
                                      <span className="text-slate-500">Submitted by:</span>
                                      <span className="font-sf-pro">{expense.submittedBy}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-white/20">
                                      <span className="text-slate-500">Submitted date:</span>
                                      <span className="font-sf-pro">{new Date(expense.submittedDate).toLocaleDateString()}</span>
                                    </div>
                                    {expense.assignedTo && (
                                      <div className="flex justify-between py-1 border-b border-white/20">
                                        <span className="text-slate-500">Assigned to:</span>
                                        <span className="font-sf-pro">{expense.assignedTo}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between py-1 border-b border-white/20">
                                      <span className="text-slate-500">Payment method:</span>
                                      <span className="font-sf-pro">{expense.paymentMethod}</span>
                                    </div>
                                    {categorizedExpenses.find(e => e.id === expense.id) && (
                                      <div className="py-1 border-b border-white/20">
                                        <span className="text-slate-500 block mb-1">Category:</span>
                                        <Select
                                          value={expense.category}
                                          onValueChange={(value) => {
                                            const [category, subcategory] = value.split('|');
                                            handleCategoryChange(expense.id, category, subcategory);
                                          }}
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="operating|Rent & Lease">💼 Operating - Rent & Lease</SelectItem>
                                            <SelectItem value="operating|Utilities">💼 Operating - Utilities</SelectItem>
                                            <SelectItem value="operating|Salaries">💼 Operating - Salaries</SelectItem>
                                            <SelectItem value="cost_of_sales|Raw Materials">🚚 Cost of Sales - Raw Materials</SelectItem>
                                            <SelectItem value="cost_of_sales|Inventory">🚚 Cost of Sales - Inventory</SelectItem>
                                            <SelectItem value="marketing|Ads">📣 Marketing - Ads</SelectItem>
                                            <SelectItem value="marketing|Promotions">📣 Marketing - Promotions</SelectItem>
                                            <SelectItem value="professional|Legal">🧑‍💻 Professional - Legal</SelectItem>
                                            <SelectItem value="professional|Accounting">🧑‍💻 Professional - Accounting</SelectItem>
                                            <SelectItem value="financial|Bank Charges">🧾 Financial - Bank Charges</SelectItem>
                                            <SelectItem value="financial|Insurance">🧾 Financial - Insurance</SelectItem>
                                            <SelectItem value="it_software|Software">🖥️ IT & Software - Software</SelectItem>
                                            <SelectItem value="it_software|Subscriptions">🖥️ IT & Software - Subscriptions</SelectItem>
                                            <SelectItem value="travel|Fuel">🚗 Travel - Fuel</SelectItem>
                                            <SelectItem value="travel|Accommodation">🚗 Travel - Accommodation</SelectItem>
                                            <SelectItem value="regulatory|SARS">🏛️ Regulatory - SARS</SelectItem>
                                            <SelectItem value="regulatory|CIPC">🏛️ Regulatory - CIPC</SelectItem>
                                            <SelectItem value="training|Courses">🎓 Training - Courses</SelectItem>
                                            <SelectItem value="miscellaneous|Sundry">🎁 Miscellaneous - Sundry</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}
                                    <div className="py-1 border-b border-white/20">
                                      <span className="text-slate-500 block mb-1">Project:</span>
                                      <select
                                        value={expense.projectId || ''}
                                        onChange={(e) => {
                                          const projectId = e.target.value ? parseInt(e.target.value) : null;
                                          handleProjectAssignment(expense.id, projectId);
                                        }}
                                        className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-mokm-blue-500 focus:border-transparent glass backdrop-blur-sm bg-white/50"
                                      >
                                        <option value="">No Project Assigned</option>
                                        {projects.map(project => (
                                          <option key={project.id} value={project.id}>
                                            {project.name} ({project.code})
                                          </option>
                                        ))}
                                      </select>
                                      {expense.projectId && (
                                        <div className="text-xs text-slate-500 mt-1">
                                          Budget: R{projects.find(p => p.id === expense.projectId)?.budget?.toLocaleString() || 'N/A'}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium text-slate-700 mb-2 font-sf-pro">Actions</h4>
                                  <div className="space-y-2">
                                    {editingExpense === expense.id ? (
                                      // Edit Form
                                      <div className="space-y-3 p-3 bg-white/50 rounded border">
                                        <div>
                                          <label className="text-xs text-slate-600 font-sf-pro">Description</label>
                                          <Input
                                            value={editFormData.description || ''}
                                            onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                                            className="mt-1"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs text-slate-600 font-sf-pro">Amount</label>
                                          <Input
                                            type="number"
                                            value={editFormData.amount || ''}
                                            onChange={(e) => setEditFormData({...editFormData, amount: parseFloat(e.target.value)})}
                                            className="mt-1"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs text-slate-600 font-sf-pro">Category</label>
                                          <Input
                                            value={editFormData.category || ''}
                                            onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                                            className="mt-1"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs text-slate-600 font-sf-pro">Notes</label>
                                          <Input
                                            value={editFormData.notes || ''}
                                            onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                                            className="mt-1"
                                          />
                                        </div>
                                        <div className="flex space-x-2">
                                          <Button
                                            size="sm"
                                            onClick={() => handleSaveEdit(expense.id)}
                                            className="bg-mokm-green-600 hover:bg-mokm-green-700"
                                          >
                                            <Save className="h-4 w-4 mr-1" />
                                            Save
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleCancelEdit}
                                          >
                                            <X className="h-4 w-4 mr-1" />
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      // Normal Actions
                                      <>
                                        <SlipUploadWithOCR
                                          expenseId={expense.id}
                                          debitAmount={expense.debit || expense.amount}
                                          onUploadComplete={() => {
                                            // Refresh the component to show updated status
                                            setExpenses([...expenses]);
                                          }}
                                          className="w-full"
                                        />

                                      </>
                                    )}
                                  </div>
                                </div>
                                
                                <div>
                                  {expense.notes && (
                                    <>
                                      <h4 className="text-sm font-medium text-slate-700 mb-2 font-sf-pro">Notes</h4>
                                      <p className="text-sm text-slate-600 bg-white/50 p-2 rounded font-sf-pro">
                                        {expense.notes}
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={viewMode === 'bank_statement' ? 10 : 7} className="py-8 text-center text-slate-500">
                      <Receipt className="h-12 w-12 mx-auto text-slate-300" />
                      <p className="mt-2 text-lg font-medium font-sf-pro">No expenses found</p>
                      <p className="mt-1 font-sf-pro">Adjust your filters or add a new expense</p>
                      <div className="mt-4">
                        <Button
                          onClick={handleOpenRecordExpenseModal}
                          className="bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Record Expense
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      

      
      {/* Import Preview Dialog */}
      <Dialog open={showImportPreview} onOpenChange={setShowImportPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Bank Statement Transactions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
             <div className="text-sm text-slate-600">
               Found {pendingImportData.length} new transactions to import. Select the transactions you want to import:
             </div>
             
             <div className="max-h-96 overflow-y-auto border border-white/20 rounded-lg">
               <table className="w-full">
                 <thead className="bg-white/20 sticky top-0">
                   <tr>
                     <th className="text-left p-3 text-sm font-medium text-slate-700">
                       <input
                         type="checkbox"
                         onChange={(e) => {
                           const allSelected = e.target.checked;
                           setPendingImportData(prev => 
                             prev.map(t => ({ ...t, selected: allSelected }))
                           );
                         }}
                         checked={pendingImportData.every(t => t.selected)}
                       />
                     </th>
                     <th className="text-left p-3 text-sm font-medium text-slate-700">Date</th>
                     <th className="text-left p-3 text-sm font-medium text-slate-700">Description</th>
                     <th className="text-left p-3 text-sm font-medium text-slate-700">Amount</th>
                     <th className="text-left p-3 text-sm font-medium text-slate-700">Type</th>
                     <th className="text-left p-3 text-sm font-medium text-slate-700">Suggested Category</th>
                   </tr>
                 </thead>
                 <tbody>
                   {pendingImportData.map((transaction, index) => {
                     const categorization = expenseCategorizationService.categorizeExpense(
                       transaction.description,
                       transaction.amount
                     );
                     
                     return (
                        <tr key={index} className={`border-b border-white/10 hover:bg-white/10 ${
                          transaction.isDuplicate ? 'bg-yellow-50/50' : ''
                        }`}>
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={transaction.selected || false}
                              onChange={(e) => {
                                setPendingImportData(prev => 
                                  prev.map((t, i) => 
                                    i === index ? { ...t, selected: e.target.checked } : t
                                  )
                                );
                              }}
                            />
                          </td>
                          <td className="p-3 text-sm">
                            {new Date(transaction.date).toLocaleDateString('en-ZA', {
                              day: '2-digit',
                              month: '2-digit', 
                              year: 'numeric'
                            })}
                          </td>
                          <td className="p-3 text-sm">
                            <div>
                              {transaction.description}
                              {transaction.isDuplicate && (
                                <div className="flex items-center mt-1">
                                  <AlertCircle className="h-3 w-3 text-yellow-500 mr-1" />
                                  <span className="text-xs text-yellow-600">Possible duplicate</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-sm font-medium">
                            R{Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3">
                            <Badge variant={transaction.type === 'debit' ? 'destructive' : 'default'}>
                              {transaction.type === 'debit' ? 'Expense' : 'Income'}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm">
                            <div className="flex items-center space-x-2">
                              <span>{categorization.category}</span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  categorization.confidence > 0.8 ? 'border-green-300 text-green-700' :
                                  categorization.confidence > 0.6 ? 'border-yellow-300 text-yellow-700' :
                                  'border-red-300 text-red-700'
                                }`}
                              >
                                {Math.round(categorization.confidence * 100)}% confidence
                              </Badge>
                            </div>
                          </td>
                        </tr>
                      );
                   })}
                 </tbody>
               </table>
             </div>
             
             <div className="flex justify-between items-center pt-4 border-t border-white/20">
               <div className="text-sm text-slate-600">
                 {pendingImportData.filter(t => t.selected).length} of {pendingImportData.length} transactions selected
               </div>
               <div className="flex space-x-3">
                 <Button
                   variant="outline"
                   onClick={() => {
                     setShowImportPreview(false);
                     setPendingImportData([]);
                   }}
                 >
                   Cancel
                 </Button>
                 <Button
                   onClick={() => {
                     const selectedTransactions = pendingImportData.filter(t => t.selected);
                     if (selectedTransactions.length === 0) {
                       alert('Please select at least one transaction to import.');
                       return;
                     }
                     handleBulkImport(selectedTransactions);
                   }}
                   className="bg-mokm-green-600 hover:bg-mokm-green-700"
                 >
                   Import Selected ({pendingImportData.filter(t => t.selected).length})
                 </Button>
               </div>
             </div>
           </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span>Confirm Delete</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
            {expenseToDelete && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-sm">Description:</span>
                  <span className="text-sm">{expenseToDelete.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-sm">Amount:</span>
                  <span className="text-sm font-medium">R{expenseToDelete.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-sm">Date:</span>
                  <span className="text-sm">{expenseToDelete.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-sm">Category:</span>
                  <span className="text-sm">{expenseToDelete.category}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={cancelDeleteExpense}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteExpense}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Expense
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Record Expense Modal */}
      <RecordExpenseModal
        isOpen={showRecordExpenseModal}
        onClose={handleCloseRecordExpenseModal}
        onSave={handleSaveExpense}
        projects={projects}
      />
    </div>
  );
};

export default ExpensesTab;
