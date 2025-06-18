
import React, { useState } from 'react';
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
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  hasReceipt: boolean;
  submittedBy: string;
  submittedDate: string;
  notes?: string;
}

interface ExpensesTabProps {
  onAddExpense: () => void;
}

const ExpensesTab: React.FC<ExpensesTabProps> = ({ onAddExpense }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);

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

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch = 
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (expense.project && expense.project.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (expense.assignedTo && expense.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
      
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
      
      return matchesSearch && matchesStatus && matchesCategory && matchesDateRange;
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

  // Get unique categories
  const categories = Array.from(new Set(expenses.map(expense => expense.category)));

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      
      {/* Add Expense Button */}
      <div className="flex justify-end">
        <Button
          onClick={onAddExpense}
          className="bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 font-sf-pro"
        >
          <Plus className="h-4 w-4 mr-2" />
          Record Expense
        </Button>
      </div>
      
      {/* Expenses table */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
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
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900 font-sf-pro">{new Date(expense.date).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500 font-sf-pro">{expense.id}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-900 font-sf-pro">{expense.description}</div>
                          {expense.project && (
                            <div className="text-xs text-slate-500 font-sf-pro">Project: {expense.project}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-900 font-sf-pro">{expense.category}</div>
                          <div className="text-xs text-slate-500 font-sf-pro">{expense.paymentMethod}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="text-sm font-medium text-slate-900 font-sf-pro">R{expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </td>
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
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {selectedExpense === expense.id && (
                        <tr>
                          <td colSpan={7} className="p-0">
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
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium text-slate-700 mb-2 font-sf-pro">Actions</h4>
                                  <div className="space-y-2">
                                    {expense.status === 'pending' && (
                                      <Button 
                                        size="sm" 
                                        className="w-full bg-gradient-to-r from-mokm-green-500 to-mokm-green-600 hover:from-mokm-green-600 hover:to-mokm-green-700"
                                      >
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Approve Expense
                                      </Button>
                                    )}
                                    {!expense.hasReceipt && (
                                      <Button 
                                        size="sm" 
                                        className="w-full bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600"
                                      >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Receipt
                                      </Button>
                                    )}
                                    <Button variant="outline" size="sm" className="w-full">
                                      <FileText className="h-4 w-4 mr-2" />
                                      Export to PDF
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
                    <td colSpan={7} className="py-8 text-center text-slate-500">
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
    </div>
  );
};

export default ExpensesTab;
