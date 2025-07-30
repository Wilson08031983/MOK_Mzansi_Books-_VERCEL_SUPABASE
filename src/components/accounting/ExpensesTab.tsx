
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Receipt, 
  FileText, 
  Calendar, 
  Upload, 
  MoreVertical, 
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
  Link
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BankStatementUpload from './BankStatementUpload';
import SlipUpload from './SlipUpload';
import bankStatementService from '../../services/bankStatementService';
import expenseCategorizationService, { CategorizedExpense } from '../../services/expenseCategorizationService';
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
  const [selectedExpenseForSlip, setSelectedExpenseForSlip] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'expense' | 'bank_statement'>('expense');
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<any[]>([]);
  // Project-related state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [selectedExpensesForBulkProject, setSelectedExpensesForBulkProject] = useState<string[]>([]);
  // companyId is now passed as a prop
  
  // Force refresh data when component mounts
  const [refreshKey, setRefreshKey] = useState(0);

  // Load bank statements, expenses, and projects on component mount
  useEffect(() => {
    console.log('ExpensesTab: Loading data for company:', companyId, 'refreshKey:', refreshKey);
    loadBankStatements();
    loadCategorizedExpenses();
    loadProjects();
  }, [companyId, refreshKey]);

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

  const handleSlipUpload = async (expenseId: string) => {
    setSelectedExpenseForSlip(null);
    await loadCategorizedExpenses();
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



  // Sample expenses data
  const [expenses] = useState<Expense[]>([
    {
      id: 'EXP001',
      date: '2025-06-01',
      description: 'Office Supplies - Stationery',
      amount: 450.00,
      category: 'Office Supplies',
      status: 'approved',
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
      status: 'pending',
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
      status: 'rejected',
      paymentMethod: 'Personal Card',
      submittedBy: 'David Brown',
      submittedDate: '2025-06-03',
      hasReceipt: true,
      notes: 'Transportation was not pre-approved'
    }
  ]);

  // Combine sample expenses with categorized expenses from bank statements
  const allExpenses: Expense[] = [
    ...expenses.map(expense => ({
      ...expense,
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
      const selectedProject = projectId ? projects.find(p => p.id === projectId) : null;
      
      // Update expense with project information
      const updatedExpenses = allExpenses.map(expense => {
        if (expense.id === expenseId) {
          return {
            ...expense,
            projectId: selectedProject?.id || undefined,
            projectCode: selectedProject?.code || undefined,
            projectName: selectedProject?.name || undefined,
            project: selectedProject ? `${selectedProject.name} (${selectedProject.code})` : undefined
          };
        }
        return expense;
      });
      
      // Update project expenses if approved expense
      if (selectedProject) {
        const expense = allExpenses.find(e => e.id === expenseId);
        if (expense && expense.status === 'approved') {
          await updateProjectExpenses(selectedProject.id, expense.amount, 'add');
        }
      }
      
      // Save to localStorage (for manual expenses)
      const manualExpense = expenses.find(e => e.id === expenseId);
      if (manualExpense) {
        // Update sample expenses (in real app, this would be an API call)
        console.log('Manual expense project assignment:', expenseId, selectedProject?.name);
      }
      
      // For bank statement expenses, update categorized expenses
      const bankExpense = categorizedExpenses.find(e => e.id === expenseId);
      if (bankExpense) {
        const updatedCategorizedExpenses = categorizedExpenses.map(expense => {
          if (expense.id === expenseId) {
            return {
              ...expense,
              projectId: selectedProject?.id,
              projectCode: selectedProject?.code,
              projectName: selectedProject?.name
            };
          }
          return expense;
        });
        
        // Save to localStorage
        const allStoredExpenses = JSON.parse(localStorage.getItem('categorizedExpenses') || '[]');
        const updatedStoredExpenses = allStoredExpenses.map((expense: any) => {
          if (expense.id === expenseId) {
            return {
              ...expense,
              projectId: selectedProject?.id,
              projectCode: selectedProject?.code,
              projectName: selectedProject?.name
            };
          }
          return expense;
        });
        
        localStorage.setItem('categorizedExpenses', JSON.stringify(updatedStoredExpenses));
        setCategorizedExpenses(updatedCategorizedExpenses);
      }
      
      console.log('Project assigned to expense:', expenseId, selectedProject?.name);
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
      
      const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
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
      
      return matchesSearch && matchesStatus && matchesCategory && matchesProject && matchesDateRange;
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
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Get unique categories from all expenses
  const categories = Array.from(new Set(allExpenses.map(expense => expense.category)));

  // Function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-mokm-green-100 text-mokm-green-800';
      case 'pending':
        return 'bg-mokm-yellow-100 text-mokm-yellow-800';
      case 'rejected':
        return 'bg-mokm-red-100 text-mokm-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

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
    // TODO: Implement edit expense functionality
    alert(`Edit expense ${expenseId} - Feature coming soon!`);
  };

  // Handle delete expense
  const handleDeleteExpense = async (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        // Check if it's a bank statement expense
        const isBankExpense = categorizedExpenses.find(e => e.id === expenseId);
        if (isBankExpense) {
          await bankStatementService.deleteExpense(expenseId);
          await loadCategorizedExpenses();
          console.log('Bank expense deleted:', expenseId);
        } else {
          // Handle sample expense deletion (in real app, this would call an API)
          console.log('Sample expense deletion not implemented:', expenseId);
          alert('Sample expense deletion not implemented yet');
        }
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Error deleting expense. Please try again.');
      }
    }
  };

  // Handle more actions menu
  const handleMoreActions = (expenseId: string) => {
    console.log('More actions for expense:', expenseId);
    // TODO: Implement dropdown menu with additional actions
    alert(`More actions for expense ${expenseId} - Feature coming soon!`);
  };

  // Handle approve expense
  const handleApproveExpense = async (expenseId: string) => {
    try {
      const expense = categorizedExpenses.find(e => e.id === expenseId);
      if (expense) {
        const updatedExpense = {
          ...expense,
          status: 'approved' as const
        };
        await bankStatementService.updateExpense(expenseId, updatedExpense);
        await loadCategorizedExpenses();
        console.log('Expense approved:', expenseId);
      } else {
        // Handle sample expense approval
        console.log('Sample expense approval not implemented:', expenseId);
        alert('Sample expense approval not implemented yet');
      }
    } catch (error) {
      console.error('Error approving expense:', error);
      alert('Error approving expense. Please try again.');
    }
  };

  // Handle upload receipt
  const handleUploadReceipt = (expenseId: string) => {
    console.log('Upload receipt for expense:', expenseId);
    // TODO: Implement receipt upload functionality
    alert(`Upload receipt for expense ${expenseId} - Feature coming soon!`);
  };

  // Calculate totals
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const approvedExpenses = filteredExpenses
    .filter(expense => expense.status === 'approved')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = filteredExpenses
    .filter(expense => expense.status === 'pending')
    .reduce((sum, expense) => sum + expense.amount, 0);

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
            <div className="text-sm text-slate-600 font-sf-pro">Approved Expenses</div>
            <div className="text-xl font-bold mt-1 text-mokm-green-600 font-sf-pro">R{approvedExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="mt-2 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                <FileCheck className="h-4 w-4" />
                <span>{filteredExpenses.filter(e => e.status === 'approved').length} approved records</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-4">
            <div className="text-sm text-slate-600 font-sf-pro">Pending Expenses</div>
            <div className="text-xl font-bold mt-1 text-mokm-yellow-600 font-sf-pro">R{pendingExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="mt-2 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{filteredExpenses.filter(e => e.status === 'pending').length} pending approvals</span>
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
            onClick={onAddExpense}
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
          
          <Button
            onClick={handleImportFromBankStatement}
            variant="outline"
            className="border-blue-500 text-blue-700 hover:bg-blue-50 font-sf-pro"
          >
            <Download className="h-4 w-4 mr-2" />
            Import from Bank Statement
          </Button>
          
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
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    <button 
                      onClick={() => handleSort('status')} 
                      className="flex items-center space-x-1 hover:text-slate-900"
                    >
                      <span>Status</span>
                      {sortBy === 'status' && (
                        sortOrder === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    Receipt
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
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full font-sf-pro ${getStatusBadgeColor(expense.status)}`}>
                            {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {expense.hasReceipt ? (
                            <FileCheck className="h-5 w-5 text-mokm-green-500 mx-auto" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-mokm-yellow-500 mx-auto" />
                          )}
                        </td>
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
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoreActions(expense.id);
                              }}
                              title="More actions"
                            >
                              <MoreVertical className="h-4 w-4" />
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
                                    {expense.status === 'pending' && (
                                      <Button 
                                        size="sm" 
                                        className="w-full bg-gradient-to-r from-mokm-green-500 to-mokm-green-600 hover:from-mokm-green-600 hover:to-mokm-green-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleApproveExpense(expense.id);
                                        }}
                                      >
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Approve Expense
                                      </Button>
                                    )}
                                    {!expense.hasReceipt && (
                                      <Button 
                                        size="sm" 
                                        className="w-full bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUploadReceipt(expense.id);
                                        }}
                                      >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Receipt
                                      </Button>
                                    )}
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedExpenseForSlip(expense.id);
                                      }}
                                    >
                                      <Upload className="h-4 w-4 mr-2" />
                                      Upload Slip
                                    </Button>
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
                          onClick={onAddExpense}
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
      
      {/* Slip Upload Dialog */}
      {selectedExpenseForSlip && (
        <Dialog open={!!selectedExpenseForSlip} onOpenChange={() => setSelectedExpenseForSlip(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Expense Slip</DialogTitle>
            </DialogHeader>
            <SlipUpload
               companyId={companyId}
               expenseId={selectedExpenseForSlip}
               onUploadComplete={() => handleSlipUpload(selectedExpenseForSlip)}
               onClose={() => setSelectedExpenseForSlip(null)}
             />
          </DialogContent>
        </Dialog>
      )}
      
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
    </div>
  );
};

export default ExpensesTab;
