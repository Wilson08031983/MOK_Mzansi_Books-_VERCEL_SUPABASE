import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  TrendingUp,
  DollarSign,
  Building2
} from 'lucide-react';
import BusinessTaxCard, { BusinessTaxReturn } from './BusinessTaxCard';
import AddReturnModal from './AddReturnModal';

const BusinessTaxTab: React.FC = () => {
  // State management for tax returns
  const [taxReturns, setTaxReturns] = useState<BusinessTaxReturn[]>([]);
  const [filteredReturns, setFilteredReturns] = useState<BusinessTaxReturn[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Local storage key for tax returns
  const STORAGE_KEY = 'mokm_business_tax_returns';

  // Load tax returns from localStorage on component mount
  useEffect(() => {
    loadTaxReturns();
  }, []);

  // Filter tax returns when search term or filters change
  useEffect(() => {
    filterTaxReturns();
  }, [taxReturns, searchTerm, statusFilter, typeFilter]);

  /**
   * Load tax returns from localStorage
   * If no data exists, initialize with sample data
   */
  const loadTaxReturns = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedReturns = JSON.parse(stored) as BusinessTaxReturn[];
        setTaxReturns(parsedReturns);
      } else {
        // Initialize with sample data for demonstration
        const sampleReturns = createSampleTaxReturns();
        setTaxReturns(sampleReturns);
        saveTaxReturns(sampleReturns);
      }
    } catch (error) {
      console.error('Error loading tax returns from localStorage:', error);
      // Fallback to sample data if localStorage fails
      const sampleReturns = createSampleTaxReturns();
      setTaxReturns(sampleReturns);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save tax returns to localStorage
   */
  const saveTaxReturns = (returns: BusinessTaxReturn[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(returns));
    } catch (error) {
      console.error('Error saving tax returns to localStorage:', error);
    }
  };

  /**
   * Create sample tax returns for initial demonstration
   */
  const createSampleTaxReturns = (): BusinessTaxReturn[] => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 25);
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 25);
    const nextQuarter = new Date(now.getFullYear(), now.getMonth() + 3, 28);

    return [
      {
        id: 'vat-001',
        name: 'VAT 201 - Current Period',
        description: 'Value Added Tax Return for current trading period',
        type: 'VAT201',
        status: 'pending',
        dueDate: nextMonth.toISOString().split('T')[0],
        amount: 15420.50,
        period: `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`,
        reference: `VAT-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: 'paye-001',
        name: 'PAYE/EMP201 - Employee Tax',
        description: 'Pay As You Earn monthly employee tax return',
        type: 'PAYE_EMP201',
        status: 'submitted',
        dueDate: lastMonth.toISOString().split('T')[0],
        amount: 8750.00,
        period: `${lastMonth.toLocaleString('default', { month: 'long' })} ${lastMonth.getFullYear()}`,
        reference: `PAYE-${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`,
        createdAt: new Date(now.getTime() - 86400000).toISOString(),
        updatedAt: new Date(now.getTime() - 43200000).toISOString()
      },
      {
        id: 'irp6-001',
        name: 'Provisional Tax (IRP6)',
        description: 'Provisional Tax Return - Second Payment',
        type: 'IRP6',
        status: 'overdue',
        dueDate: new Date(now.getTime() - 172800000).toISOString().split('T')[0], // 2 days ago
        amount: 25000.00,
        period: `H2 ${now.getFullYear()}`,
        reference: `IRP6-${now.getFullYear()}-02`,
        createdAt: new Date(now.getTime() - 2592000000).toISOString(), // 30 days ago
        updatedAt: new Date(now.getTime() - 259200000).toISOString() // 3 days ago
      },
      {
        id: 'itr14-001',
        name: 'Company Income Tax (ITR14)',
        description: 'Annual Company Income Tax Return',
        type: 'ITR14',
        status: 'completed',
        dueDate: nextQuarter.toISOString().split('T')[0],
        amount: 125000.00,
        period: `${now.getFullYear() - 1} Tax Year`,
        reference: `ITR14-${now.getFullYear() - 1}`,
        createdAt: new Date(now.getTime() - 5184000000).toISOString(), // 60 days ago
        updatedAt: new Date(now.getTime() - 1728000000).toISOString() // 20 days ago
      }
    ];
  };

  /**
   * Filter tax returns based on search term and filters
   */
  const filterTaxReturns = () => {
    let filtered = [...taxReturns];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(taxReturn => 
        taxReturn.name.toLowerCase().includes(search) ||
        taxReturn.description.toLowerCase().includes(search) ||
        taxReturn.type.toLowerCase().includes(search) ||
        taxReturn.period.toLowerCase().includes(search) ||
        (taxReturn.reference && taxReturn.reference.toLowerCase().includes(search))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(taxReturn => taxReturn.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(taxReturn => taxReturn.type === typeFilter);
    }

    // Sort by due date (overdue first, then by date)
    filtered.sort((a, b) => {
      const aOverdue = new Date(a.dueDate) < new Date();
      const bOverdue = new Date(b.dueDate) < new Date();
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    setFilteredReturns(filtered);
  };

  /**
   * Handle adding a new tax return
   */
  const handleAddTaxReturn = (newTaxReturn: Omit<BusinessTaxReturn, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const taxReturn: BusinessTaxReturn = {
      ...newTaxReturn,
      id: `tax-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };

    const updatedReturns = [...taxReturns, taxReturn];
    setTaxReturns(updatedReturns);
    saveTaxReturns(updatedReturns);
  };

  /**
   * Handle submitting a tax return
   */
  const handleSubmitTaxReturn = (id: string) => {
    const updatedReturns = taxReturns.map(taxReturn => {
      if (taxReturn.id === id) {
        return {
          ...taxReturn,
          status: 'submitted' as const,
          updatedAt: new Date().toISOString()
        };
      }
      return taxReturn;
    });
    
    setTaxReturns(updatedReturns);
    saveTaxReturns(updatedReturns);
  };

  /**
   * Handle viewing a tax return (placeholder for future implementation)
   */
  const handleViewTaxReturn = (id: string) => {
    const taxReturn = taxReturns.find(tr => tr.id === id);
    if (taxReturn) {
      // TODO: Implement view modal or navigation to detailed view
      console.log('Viewing tax return:', taxReturn);
      alert(`Viewing ${taxReturn.name}\n\nThis feature will open a detailed view of the tax return.`);
    }
  };

  /**
   * Handle deleting a tax return
   */
  const handleDeleteTaxReturn = (id: string) => {
    const taxReturn = taxReturns.find(tr => tr.id === id);
    if (taxReturn && confirm(`Are you sure you want to delete "${taxReturn.name}"?\n\nThis action cannot be undone.`)) {
      const updatedReturns = taxReturns.filter(tr => tr.id !== id);
      setTaxReturns(updatedReturns);
      saveTaxReturns(updatedReturns);
    }
  };

  /**
   * Calculate summary statistics
   */
  const getSummaryStats = () => {
    const total = taxReturns.length;
    const pending = taxReturns.filter(tr => tr.status === 'pending').length;
    const overdue = taxReturns.filter(tr => {
      return tr.status !== 'completed' && new Date(tr.dueDate) < new Date();
    }).length;
    const completed = taxReturns.filter(tr => tr.status === 'completed').length;
    const totalAmount = taxReturns
      .filter(tr => tr.amount)
      .reduce((sum, tr) => sum + (tr.amount || 0), 0);

    return { total, pending, overdue, completed, totalAmount };
  };

  const stats = getSummaryStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mokm-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sf-pro flex items-center gap-2">
            <Building2 className="h-6 w-6 text-mokm-orange-500" />
            Business Tax Returns
          </h2>
          <p className="text-slate-600 mt-1">
            Manage your South African business tax obligations and submissions
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white hover:shadow-lg transition-all duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tax Return
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass backdrop-blur-xl bg-white/95 border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Returns</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-mokm-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-xl bg-white/95 border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-xl bg-white/95 border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-xl bg-white/95 border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  R{stats.totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="glass backdrop-blur-xl bg-white/95 border-white/30">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search tax returns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:border-mokm-purple-500"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 border-slate-200 focus:border-mokm-purple-500">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48 border-slate-200 focus:border-mokm-purple-500">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="VAT201">VAT 201</SelectItem>
                <SelectItem value="PAYE_EMP201">PAYE/EMP201</SelectItem>
                <SelectItem value="IRP6">Provisional Tax</SelectItem>
                <SelectItem value="ITR14">Company Income Tax</SelectItem>
                <SelectItem value="DTR01">Dividends Tax</SelectItem>
                <SelectItem value="CUSTOMS">Customs & Excise</SelectItem>
                <SelectItem value="TURNOVER">Turnover Tax</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tax Returns Grid */}
      {filteredReturns.length === 0 ? (
        <Card className="glass backdrop-blur-xl bg-white/95 border-white/30">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {taxReturns.length === 0 ? 'No Tax Returns Yet' : 'No Matching Returns'}
            </h3>
            <p className="text-slate-600 mb-4">
              {taxReturns.length === 0 
                ? 'Get started by adding your first business tax return.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {taxReturns.length === 0 && (
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Tax Return
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReturns.map((taxReturn) => (
            <BusinessTaxCard
                  key={taxReturn.id}
                  taxReturn={taxReturn}
                  onSubmit={handleSubmitTaxReturn}
                  onView={handleViewTaxReturn}
                  onDelete={handleDeleteTaxReturn}
                  allTaxReturns={taxReturns}
                />
          ))}
        </div>
      )}

      {/* Add Return Modal */}
      <AddReturnModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTaxReturn}
      />
    </div>
  );
};

export default BusinessTaxTab;