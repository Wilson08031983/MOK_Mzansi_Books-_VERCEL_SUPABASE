
import React, { useState, useEffect } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Receipt, FileText, TrendingUp, DollarSign, CreditCard, ChevronLeft } from 'lucide-react';
import ExpensesTab from '@/components/accounting/ExpensesTab';
import IncomeTab from '@/components/accounting/IncomeTab';
import TaxTab from '@/components/accounting/TaxTab';
import ReportsTab from '@/components/accounting/ReportsTab';
import AddIncomeModal from '@/components/accounting/AddIncomeModal';
import EditIncomeModal from '@/components/accounting/EditIncomeModal';
import { financialSummaryService, FinancialSummary } from '../services/financialSummaryService';

const Accounting = () => {
  const { t, formatCurrency, getCurrencySymbol } = useLocalization();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [taxSubTab, setTaxSubTab] = useState('business');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showEditIncomeModal, setShowEditIncomeModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  
  // Get or generate company ID
  const getCompanyId = () => {
    try {
      const companyDetails = localStorage.getItem('companyDetails');
      if (companyDetails) {
        const parsed = JSON.parse(companyDetails);
        return `company_${parsed.companyName?.replace(/\s+/g, '_').toLowerCase() || 'default'}`;
      }
    } catch (error) {
      console.error('Error getting company details:', error);
    }
    return 'current-company-id';
  };
  
  const [companyId] = useState(getCompanyId());

  // Load financial summary on component mount and when data changes
  useEffect(() => {
    const loadFinancialSummary = () => {
      const summary = financialSummaryService.getFinancialSummary();
      setFinancialSummary(summary);
    };

    loadFinancialSummary();

    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(loadFinancialSummary, 30000);

    return () => clearInterval(interval);
  }, []);

  // Handle navigation from HR Management
  useEffect(() => {
    if (location.state) {
      const { activeTab: navActiveTab, selectedEmployee: navEmployee, taxSubTab: navTaxSubTab } = location.state;
      if (navActiveTab) {
        setActiveTab(navActiveTab);
      }
      if (navEmployee) {
        setSelectedEmployee(navEmployee);
      }
      if (navTaxSubTab) {
        setTaxSubTab(navTaxSubTab);
      }
    }
  }, [location.state]);

  const handleAddExpense = () => {
    setShowAddExpenseModal(true);
  };

  const handleAddIncome = () => {
    setShowAddIncomeModal(true);
  };

  const handleEditIncome = (income) => {
    setEditingIncome(income);
    setShowEditIncomeModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto p-8">
        {/* Back to Dashboard Button */}
        <Link 
          to="/dashboard"
          className="inline-flex items-center mb-6 px-4 py-2 text-sm font-medium text-slate-700 bg-white rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors hover:text-mokm-purple-600 animate-fade-in">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
        
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent mb-4 font-sf-pro">
            {t('accounting.title')}
          </h1>
          <p className="text-xl text-slate-600 font-sf-pro">
            Manage your business finances, expenses, and financial documents
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in delay-200">
          <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300 hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {financialSummary ? formatCurrency(financialSummary.totalRevenue) : formatCurrency(0)}
                  </p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {financialSummary ? financialSummaryService.formatPercentageChange(financialSummary.monthlyComparison.revenueChange) : '+0.0%'} vs last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300 hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {financialSummary ? formatCurrency(financialSummary.totalExpenses) : formatCurrency(0)}
                  </p>
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                    {financialSummary ? financialSummaryService.formatPercentageChange(financialSummary.monthlyComparison.expensesChange) : '+0.0%'} vs last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300 hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Net Profit</p>
                  <p className={`text-2xl font-bold ${
                    financialSummary && financialSummary.netProfit >= 0 ? 'text-slate-900' : 'text-red-600'
                  }`}>
                    {financialSummary ? formatCurrency(financialSummary.netProfit) : formatCurrency(0)}
                  </p>
                  <p className={`text-xs flex items-center mt-1 ${
                    financialSummary && financialSummary.monthlyComparison.profitChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className={`h-3 w-3 mr-1 ${
                      financialSummary && financialSummary.monthlyComparison.profitChange < 0 ? 'rotate-180' : ''
                    }`} />
                    {financialSummary ? financialSummaryService.formatPercentageChange(financialSummary.monthlyComparison.profitChange) : '+0.0%'} vs last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-mokm-purple-500 to-mokm-blue-500 rounded-xl flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300 hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Outstanding</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {financialSummary ? formatCurrency(financialSummary.outstanding) : formatCurrency(0)}
                  </p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <CreditCard className="h-3 w-3 mr-1" />
                    {financialSummary ? financialSummary.pendingPayments : 0} pending payments
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <div className="animate-fade-in delay-400">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business p-1 h-auto">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-orange-500 data-[state=active]:via-mokm-pink-500 data-[state=active]:to-mokm-purple-500 data-[state=active]:text-white px-6 py-3 font-sf-pro"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="expenses" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-orange-500 data-[state=active]:via-mokm-pink-500 data-[state=active]:to-mokm-purple-500 data-[state=active]:text-white px-6 py-3 font-sf-pro"
              >
                Expenses
              </TabsTrigger>
              <TabsTrigger 
                value="income" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-orange-500 data-[state=active]:via-mokm-pink-500 data-[state=active]:to-mokm-purple-500 data-[state=active]:text-white px-6 py-3 font-sf-pro"
              >
                Income
              </TabsTrigger>
              <TabsTrigger 
                value="tax" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-orange-500 data-[state=active]:via-mokm-pink-500 data-[state=active]:to-mokm-purple-500 data-[state=active]:text-white px-6 py-3 font-sf-pro"
              >
                Tax
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-orange-500 data-[state=active]:via-mokm-pink-500 data-[state=active]:to-mokm-purple-500 data-[state=active]:text-white px-6 py-3 font-sf-pro"
              >
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 font-sf-pro">Recent Transactions</h3>
                    <div className="space-y-3">
                      {financialSummary && financialSummary.recentTransactions.length > 0 ? (
                        financialSummary.recentTransactions.slice(0, 5).map((transaction, index) => (
                          <div key={transaction.id || index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                            <div>
                              <p className="font-medium text-slate-900">{transaction.description}</p>
                              <p className="text-sm text-slate-600">
                                {financialSummaryService.getRelativeTime(transaction.date)}
                              </p>
                            </div>
                            <span className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <p className="text-sm">No recent transactions found</p>
                          <p className="text-xs mt-1">Add some expenses or income to see them here</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 font-sf-pro">Financial Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Monthly Revenue</span>
                        <span className="font-semibold text-slate-900">
                          {financialSummary ? formatCurrency(financialSummary.totalRevenue) : formatCurrency(0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Monthly Expenses</span>
                        <span className="font-semibold text-slate-900">
                          {financialSummary ? formatCurrency(financialSummary.totalExpenses) : formatCurrency(0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Tax Liability</span>
                        <span className="font-semibold text-slate-900">
                          {financialSummary ? formatCurrency(financialSummary.taxLiability) : formatCurrency(0)}
                        </span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-medium">Net Income</span>
                          <span className={`font-bold text-lg ${
                            financialSummary && financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {financialSummary ? formatCurrency(financialSummary.netProfit) : formatCurrency(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="expenses">
              <ExpensesTab onAddExpense={handleAddExpense} companyId={companyId} />
            </TabsContent>

            <TabsContent value="income">
              <IncomeTab onAddIncome={handleAddIncome} onEditIncome={handleEditIncome} />
            </TabsContent>

            <TabsContent value="tax">
              <TaxTab 
                selectedEmployee={selectedEmployee}
                taxSubTab={taxSubTab}
                onEmployeeChange={setSelectedEmployee}
              />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <ReportsTab companyId={companyId} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Add Expense Modal */}
        {showAddExpenseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
              <div className="p-4 border-b">
                <h3 className="text-lg font-medium">Record New Expense</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600">Expense recording form would go here...</p>
              </div>
              <div className="p-4 border-t bg-gray-50 flex justify-end">
                <button 
                  onClick={() => setShowAddExpenseModal(false)}
                  className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors mr-2"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowAddExpenseModal(false);
                    // Handle expense creation
                    alert('Expense recorded successfully!');
                  }}
                  className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-colored-lg transition-all duration-300"
                >
                  Record Expense
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Income Modal */}
        {showAddIncomeModal && (
          <AddIncomeModal 
            onClose={() => setShowAddIncomeModal(false)}
            onSave={() => {
              setShowAddIncomeModal(false);
              // Trigger income list refresh
              window.dispatchEvent(new CustomEvent('income-updated'));
            }}
          />
        )}

        {/* Edit Income Modal */}
        {showEditIncomeModal && editingIncome && (
          <EditIncomeModal 
            income={editingIncome}
            onClose={() => {
              setShowEditIncomeModal(false);
              setEditingIncome(null);
            }}
            onSave={() => {
              setShowEditIncomeModal(false);
              setEditingIncome(null);
              // Trigger income list refresh
              window.dispatchEvent(new CustomEvent('income-updated'));
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Accounting;
