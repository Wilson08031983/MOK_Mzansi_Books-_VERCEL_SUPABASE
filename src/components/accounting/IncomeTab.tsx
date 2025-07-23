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
  FileCheck, 
  UserCheck, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Income {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'pending' | 'received' | 'overdue';
  paymentMethod: string;
  client?: string;
  project?: string;
  hasInvoice: boolean;
  invoiceNumber?: string;
  dueDate?: string;
  notes?: string;
}

interface IncomeTabProps {
  onAddIncome?: () => void;
  onEditIncome?: (income: Income) => void;
}

const IncomeTab: React.FC<IncomeTabProps> = ({ onAddIncome, onEditIncome }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<string | null>(null);

  // Sample income data
  const [incomes, setIncomes] = useState<Income[]>([]);

  // Load payments and income records from localStorage and conditionally add sample data
  useEffect(() => {
    const loadIncomeData = () => {
      try {
        const storedPayments = JSON.parse(localStorage.getItem('payments') || '[]');
        const storedIncomes = JSON.parse(localStorage.getItem('incomes') || '[]');
        
        // Transform payments into Income format
        const paymentIncomes: Income[] = storedPayments.map((payment: any) => ({
          id: `PAY-${payment.id}`,
          date: payment.paymentDate,
          description: `Payment for Invoice ${payment.invoiceNumber}`,
          amount: payment.amount,
          category: 'Invoice Payment',
          status: 'received' as const,
          paymentMethod: payment.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 
                       payment.paymentMethod === 'eft' ? 'EFT' : 
                       payment.paymentMethod === 'cash' ? 'Cash' : 
                       payment.paymentMethod === 'card' ? 'Credit Card' : 'Other',
          client: payment.clientName,
          hasInvoice: true,
          invoiceNumber: payment.invoiceNumber,
          notes: payment.notes || payment.reference || 'Payment received from invoice'
        }));
        
        let allIncomes = [...paymentIncomes, ...storedIncomes];
        
        const initialized = localStorage.getItem('income_initialized') === 'true';
        
        if (!initialized && allIncomes.length === 0) {
          const sample: Income[] = [
            {
              id: 'INC001',
              date: '2025-06-01',
              description: 'Website Development - ABC Corp',
              amount: 15000.00,
              category: 'Consulting Services',
              status: 'received',
              paymentMethod: 'Bank Transfer',
              client: 'ABC Corporation',
              project: 'Website Redesign',
              hasInvoice: true,
              invoiceNumber: 'INV-2025-001',
              notes: 'Payment received on time'
            },
            {
              id: 'INC002',
              date: '2025-06-02',
              description: 'Mobile App Development - XYZ Ltd',
              amount: 25000.00,
              category: 'Development Services',
              status: 'pending',
              paymentMethod: 'Bank Transfer',
              client: 'XYZ Limited',
              project: 'Mobile App Development',
              hasInvoice: true,
              invoiceNumber: 'INV-2025-002',
              dueDate: '2025-06-15',
              notes: 'Milestone 1 payment - 50% of total project value'
            },
            {
              id: 'INC003',
              date: '2025-05-28',
              description: 'Consulting Services - DEF Inc',
              amount: 8500.00,
              category: 'Consulting Services',
              status: 'overdue',
              paymentMethod: 'Bank Transfer',
              client: 'DEF Incorporated',
              project: 'Business Process Optimization',
              hasInvoice: true,
              invoiceNumber: 'INV-2025-003',
              dueDate: '2025-05-30',
              notes: 'Payment overdue by 3 days - follow up required'
            },
            {
              id: 'INC004',
              date: '2025-06-03',
              description: 'Training Workshop - Tech Solutions',
              amount: 5500.00,
              category: 'Training Services',
              status: 'received',
              paymentMethod: 'Credit Card',
              client: 'Tech Solutions Ltd',
              hasInvoice: true,
              invoiceNumber: 'INV-2025-004',
              notes: 'One-day React training workshop for 10 developers'
            }
          ];
          allIncomes = sample;
          localStorage.setItem('incomes', JSON.stringify(sample));
          localStorage.setItem('income_initialized', 'true');
        }
        
        setIncomes(allIncomes);
      } catch (error) {
        console.error('Error loading income data:', error);
      }
    };

    // Load income data on component mount
    loadIncomeData();

    // Listen for payment and income updates
    const handlePaymentsUpdate = () => {
      loadIncomeData();
    };

    const handleIncomeUpdate = () => {
      loadIncomeData();
    };

    window.addEventListener('payments-updated', handlePaymentsUpdate);
    window.addEventListener('income-updated', handleIncomeUpdate);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('payments-updated', handlePaymentsUpdate);
      window.removeEventListener('income-updated', handleIncomeUpdate);
    };
  }, []);

  // Filter and sort incomes
  const filteredIncomes = incomes
    .filter(income => {
      const matchesSearch = 
        income.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        income.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (income.project && income.project.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (income.client && income.client.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (income.invoiceNumber && income.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || income.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || income.category === categoryFilter;
      
      let matchesDateRange = true;
      const today = new Date();
      const incomeDate = new Date(income.date);
      
      if (dateRangeFilter === 'today') {
        matchesDateRange = incomeDate.toDateString() === today.toDateString();
      } else if (dateRangeFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        matchesDateRange = incomeDate >= weekAgo;
      } else if (dateRangeFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(today.getMonth() - 1);
        matchesDateRange = incomeDate >= monthAgo;
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
  const categories = Array.from(new Set(incomes.map(income => income.category)));

  // Function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-mokm-green-100 text-mokm-green-800';
      case 'pending':
        return 'bg-mokm-yellow-100 text-mokm-yellow-800';
      case 'overdue':
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

  // Toggle income details
  const toggleIncomeDetails = (id: string) => {
    if (selectedIncome === id) {
      setSelectedIncome(null);
    } else {
      setSelectedIncome(id);
    }
  };

  // Handle status change
  const handleStatusChange = (incomeId: string, newStatus: 'pending' | 'received' | 'overdue') => {
    setIncomes(prevIncomes => {
      const updatedIncomes = prevIncomes.map(income => 
        income.id === incomeId ? { ...income, status: newStatus } : income
      );
      
      // Update localStorage for all non-payment data (including sample data)
      const storedIncomes = updatedIncomes.filter(income => 
        !income.id.startsWith('PAY-')
      );
      localStorage.setItem('incomes', JSON.stringify(storedIncomes));
      
      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent('income-updated'));
      
      return updatedIncomes;
    });
  };

  // Handle edit income
  const handleEditIncome = (incomeId: string) => {
    const income = incomes.find(inc => inc.id === incomeId);
    if (income && onEditIncome) {
      onEditIncome(income);
    }
  };



  // Calculate totals
  const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
  const receivedIncome = filteredIncomes
    .filter(income => income.status === 'received')
    .reduce((sum, income) => sum + income.amount, 0);
  const pendingIncome = filteredIncomes
    .filter(income => income.status === 'pending')
    .reduce((sum, income) => sum + income.amount, 0);
  const overdueIncome = filteredIncomes
    .filter(income => income.status === 'overdue')
    .reduce((sum, income) => sum + income.amount, 0);

  return (
    <div className="space-y-6">
      {/* Income Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Income</p>
                <p className="text-2xl font-bold text-slate-900">R{totalIncome.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Received</p>
                <p className="text-2xl font-bold text-green-600">R{receivedIncome.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">R{pendingIncome.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">R{overdueIncome.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income Management */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl font-semibold text-slate-900 font-sf-pro">Income Records</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={onAddIncome}
                className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white hover:shadow-colored-lg transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Income
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="border-slate-200 hover:bg-slate-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search income records, clients, projects, or invoice numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-slate-200 focus:border-mokm-purple-500 focus:ring-mokm-purple-500"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md focus:border-mokm-purple-500 focus:ring-mokm-purple-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="received">Received</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md focus:border-mokm-purple-500 focus:ring-mokm-purple-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date Range</label>
                <select 
                  value={dateRangeFilter} 
                  onChange={(e) => setDateRangeFilter(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md focus:border-mokm-purple-500 focus:ring-mokm-purple-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sort By</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md focus:border-mokm-purple-500 focus:ring-mokm-purple-500"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="description">Description</option>
                  <option value="category">Category</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          )}

          {/* Income Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 font-medium text-slate-700 cursor-pointer hover:text-mokm-purple-600" onClick={() => handleSort('date')}>
                    Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left p-3 font-medium text-slate-700 cursor-pointer hover:text-mokm-purple-600" onClick={() => handleSort('description')}>
                    Description {sortBy === 'description' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left p-3 font-medium text-slate-700 cursor-pointer hover:text-mokm-purple-600" onClick={() => handleSort('amount')}>
                    Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left p-3 font-medium text-slate-700 cursor-pointer hover:text-mokm-purple-600" onClick={() => handleSort('category')}>
                    Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left p-3 font-medium text-slate-700 cursor-pointer hover:text-mokm-purple-600" onClick={() => handleSort('status')}>
                    Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left p-3 font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncomes.map((income) => (
                  <React.Fragment key={income.id}>
                    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-slate-900">{new Date(income.date).toLocaleDateString()}</td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-slate-900">{income.description}</p>
                          {income.client && <p className="text-sm text-slate-600">{income.client}</p>}
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-green-600">R{income.amount.toLocaleString()}</td>
                      <td className="p-3 text-slate-700">{income.category}</td>
                      <td className="p-3">
                        <select 
                          value={income.status}
                          onChange={(e) => handleStatusChange(income.id, e.target.value as 'pending' | 'received' | 'overdue')}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-mokm-purple-500 ${getStatusBadgeColor(income.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="received">Received</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleIncomeDetails(income.id)}
                            className="text-slate-600 hover:text-mokm-purple-600"
                          >
                            {selectedIncome === income.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditIncome(income.id)}
                            className="text-slate-600 hover:text-mokm-purple-600"
                            title="Edit Income Record"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Details */}
                    {selectedIncome === income.id && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <div className="bg-slate-50 p-4 border-l-4 border-mokm-purple-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-medium text-slate-900 mb-2">Payment Details</h4>
                                <p className="text-sm text-slate-600">Method: {income.paymentMethod}</p>
                                {income.invoiceNumber && <p className="text-sm text-slate-600">Invoice: {income.invoiceNumber}</p>}
                                {income.dueDate && <p className="text-sm text-slate-600">Due Date: {new Date(income.dueDate).toLocaleDateString()}</p>}
                              </div>
                              
                              {income.project && (
                                <div>
                                  <h4 className="font-medium text-slate-900 mb-2">Project Information</h4>
                                  <p className="text-sm text-slate-600">Project: {income.project}</p>
                                  {income.client && <p className="text-sm text-slate-600">Client: {income.client}</p>}
                                </div>
                              )}
                              
                              <div>
                                <h4 className="font-medium text-slate-900 mb-2">Documentation</h4>
                                <div className="flex items-center gap-2">
                                  {income.hasInvoice ? (
                                    <span className="flex items-center text-sm text-green-600">
                                      <FileCheck className="h-4 w-4 mr-1" />
                                      Invoice Available
                                    </span>
                                  ) : (
                                    <span className="flex items-center text-sm text-red-600">
                                      <AlertCircle className="h-4 w-4 mr-1" />
                                      No Invoice
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {income.notes && (
                              <div className="mt-4">
                                <h4 className="font-medium text-slate-900 mb-2">Notes</h4>
                                <p className="text-sm text-slate-600 bg-white p-3 rounded border">{income.notes}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            
            {filteredIncomes.length === 0 && (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No income records found matching your criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeTab;