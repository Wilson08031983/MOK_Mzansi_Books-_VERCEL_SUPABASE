export type ReportType = 
  | 'expense-summary' | 'expense-category' | 'expense-payment-method' | 'expense-project' | 'expense-receipt-compliance' | 'expense-bank-integration'
  | 'income-summary' | 'income-status' | 'income-client' | 'income-service' | 'income-invoice' | 'income-payment-method'
  | 'tax-summary' | 'tax-type' | 'tax-compliance' | 'tax-liability' | 'tax-period' | 'tax-entry-method'
  | 'profit-loss' | 'cash-flow' | 'tax-impact';

export interface ReportFilters {
  dateRange: string;
  startDate: string;
  endDate: string;
  status: string;
  category: string;
  paymentMethod: string;
  project: string;
  taxType: string;
  amountMin: string;
  amountMax: string;
}

export interface ReportSummary {
  totalAmount: number;
  totalRecords: number;
  averageAmount: number;
  [key: string]: any;
}

export interface ReportData {
  summary: ReportSummary;
  data: any[];
  chartData?: any[];
  metadata: {
    reportType: ReportType;
    generatedAt: string;
    filters: ReportFilters;
    dateRange: { start: string; end: string; };
  };
}

class ReportGenerationService {
  async generateReport(reportType: ReportType, filters: ReportFilters): Promise<ReportData> {
    console.log('📊 [REPORT SERVICE] Generating report:', reportType, filters);

    const dateRange = this.getDateRange(filters);
    let reportData: ReportData;

    switch (reportType) {
      case 'expense-summary':
        reportData = await this.generateExpenseSummaryReport(filters, dateRange);
        break;
      case 'income-summary':
        reportData = await this.generateIncomeSummaryReport(filters, dateRange);
        break;
      case 'tax-summary':
        reportData = await this.generateTaxSummaryReport(filters, dateRange);
        break;
      case 'profit-loss':
        reportData = await this.generateProfitLossReport(filters, dateRange);
        break;
      default:
        reportData = await this.generateGenericReport(reportType, filters, dateRange);
        break;
    }

    console.log('✅ [REPORT SERVICE] Report generated:', reportData.summary.totalRecords, 'records');
    return reportData;
  }

  private getDateRange(filters: ReportFilters): { start: Date; end: Date } {
    const now = new Date();
    
    switch (filters.dateRange) {
      case 'today':
        return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate()), end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59) };
      case 'this-month':
        return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0) };
      case 'this-year':
        return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31) };
      case 'custom':
        return {
          start: filters.startDate ? new Date(filters.startDate) : new Date('1900-01-01'),
          end: filters.endDate ? new Date(filters.endDate) : now
        };
      default:
        return { start: new Date('1900-01-01'), end: now };
    }
  }

  private loadExpensesData(filters: ReportFilters, dateRange: { start: Date; end: Date }): any[] {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const legacyExpenses = JSON.parse(localStorage.getItem('manual_expenses') || '[]');
    const categorizedExpenses = JSON.parse(localStorage.getItem('categorizedExpenses') || '[]');
    
    let allExpenses = [...expenses, ...legacyExpenses, ...categorizedExpenses];
    
    return allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate < dateRange.start || expenseDate > dateRange.end) return false;
      if (filters.category !== 'all' && expense.category !== filters.category) return false;
      if (filters.amountMin && expense.amount < parseFloat(filters.amountMin)) return false;
      if (filters.amountMax && expense.amount > parseFloat(filters.amountMax)) return false;
      return true;
    });
  }

  private loadIncomeData(filters: ReportFilters, dateRange: { start: Date; end: Date }): any[] {
    const incomes = JSON.parse(localStorage.getItem('incomes') || '[]');
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    
    const paymentIncomes = payments.map((payment: any) => ({
      id: `PAY-${payment.id}`,
      date: payment.paymentDate,
      description: `Payment for Invoice ${payment.invoiceNumber}`,
      amount: payment.amount,
      category: 'Invoice Payment',
      status: 'received',
      paymentMethod: payment.paymentMethod,
      client: payment.clientName
    }));
    
    let allIncomes = [...incomes, ...paymentIncomes];
    
    return allIncomes.filter(income => {
      const incomeDate = new Date(income.date);
      if (incomeDate < dateRange.start || incomeDate > dateRange.end) return false;
      if (filters.status !== 'all' && income.status !== filters.status) return false;
      if (filters.category !== 'all' && income.category !== filters.category) return false;
      if (filters.amountMin && income.amount < parseFloat(filters.amountMin)) return false;
      if (filters.amountMax && income.amount > parseFloat(filters.amountMax)) return false;
      return true;
    });
  }

  private loadTaxData(filters: ReportFilters, dateRange: { start: Date; end: Date }): any[] {
    const taxReturns = JSON.parse(localStorage.getItem('mokm_business_tax_returns') || '[]');
    const manualTaxReturns = JSON.parse(localStorage.getItem('manualTaxReturns') || '[]');
    
    let allTaxReturns = [...taxReturns, ...manualTaxReturns];
    
    return allTaxReturns.filter(taxReturn => {
      const dueDate = new Date(taxReturn.dueDate || taxReturn.period);
      if (dueDate < dateRange.start || dueDate > dateRange.end) return false;
      if (filters.status !== 'all' && taxReturn.status !== filters.status) return false;
      if (filters.taxType !== 'all' && taxReturn.type !== filters.taxType) return false;
      if (filters.amountMin && taxReturn.amount < parseFloat(filters.amountMin)) return false;
      if (filters.amountMax && taxReturn.amount > parseFloat(filters.amountMax)) return false;
      return true;
    });
  }

  private async generateExpenseSummaryReport(filters: ReportFilters, dateRange: { start: Date; end: Date }): Promise<ReportData> {
    const expenses = this.loadExpensesData(filters, dateRange);
    const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const totalRecords = expenses.length;
    const averageAmount = totalRecords > 0 ? totalAmount / totalRecords : 0;
    
    return {
      summary: { totalAmount, totalRecords, averageAmount },
      data: expenses.map(expense => ({
        date: expense.date,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        paymentMethod: expense.paymentMethod,
        project: expense.project || 'Unassigned'
      })),
      metadata: {
        reportType: 'expense-summary',
        generatedAt: new Date().toISOString(),
        filters,
        dateRange: { start: dateRange.start.toISOString(), end: dateRange.end.toISOString() }
      }
    };
  }

  private async generateIncomeSummaryReport(filters: ReportFilters, dateRange: { start: Date; end: Date }): Promise<ReportData> {
    const incomes = this.loadIncomeData(filters, dateRange);
    const totalAmount = incomes.reduce((sum, income) => sum + (income.amount || 0), 0);
    const totalRecords = incomes.length;
    const averageAmount = totalRecords > 0 ? totalAmount / totalRecords : 0;
    
    return {
      summary: { totalAmount, totalRecords, averageAmount },
      data: incomes.map(income => ({
        date: income.date,
        description: income.description,
        amount: income.amount,
        category: income.category,
        status: income.status,
        client: income.client || 'Unknown'
      })),
      metadata: { reportType: 'income-summary', generatedAt: new Date().toISOString(), filters, dateRange: { start: dateRange.start.toISOString(), end: dateRange.end.toISOString() } }
    };
  }

  private async generateTaxSummaryReport(filters: ReportFilters, dateRange: { start: Date; end: Date }): Promise<ReportData> {
    const taxReturns = this.loadTaxData(filters, dateRange);
    const totalAmount = taxReturns.reduce((sum, tax) => sum + (tax.amount || 0), 0);
    const totalRecords = taxReturns.length;
    const averageAmount = totalRecords > 0 ? totalAmount / totalRecords : 0;
    
    return {
      summary: { totalAmount, totalRecords, averageAmount },
      data: taxReturns.map(tax => ({
        name: tax.name,
        type: tax.type,
        period: tax.period,
        dueDate: tax.dueDate,
        amount: tax.amount,
        status: tax.status
      })),
      metadata: { reportType: 'tax-summary', generatedAt: new Date().toISOString(), filters, dateRange: { start: dateRange.start.toISOString(), end: dateRange.end.toISOString() } }
    };
  }

  private async generateProfitLossReport(filters: ReportFilters, dateRange: { start: Date; end: Date }): Promise<ReportData> {
    const expenses = this.loadExpensesData(filters, dateRange);
    const incomes = this.loadIncomeData(filters, dateRange);
    
    const totalIncome = incomes.reduce((sum, income) => sum + (income.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const netProfit = totalIncome - totalExpenses;
    
    return {
      summary: { totalAmount: netProfit, totalRecords: incomes.length + expenses.length, averageAmount: 0, totalIncome, totalExpenses, netProfit },
      data: [
        { category: 'Total Income', amount: totalIncome, type: 'Income' },
        { category: 'Total Expenses', amount: totalExpenses, type: 'Expense' },
        { category: 'Net Profit', amount: netProfit, type: 'Result' }
      ],
      metadata: { reportType: 'profit-loss', generatedAt: new Date().toISOString(), filters, dateRange: { start: dateRange.start.toISOString(), end: dateRange.end.toISOString() } }
    };
  }

  private async generateGenericReport(reportType: ReportType, filters: ReportFilters, dateRange: { start: Date; end: Date }): Promise<ReportData> {
    // Generic fallback for other report types
    const expenses = this.loadExpensesData(filters, dateRange);
    const incomes = this.loadIncomeData(filters, dateRange);
    const taxReturns = this.loadTaxData(filters, dateRange);
    
    const totalAmount = [...expenses, ...incomes, ...taxReturns].reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalRecords = expenses.length + incomes.length + taxReturns.length;
    
    return {
      summary: { totalAmount, totalRecords, averageAmount: totalRecords > 0 ? totalAmount / totalRecords : 0 },
      data: [
        { category: 'Expenses', count: expenses.length, amount: expenses.reduce((sum, e) => sum + (e.amount || 0), 0) },
        { category: 'Income', count: incomes.length, amount: incomes.reduce((sum, i) => sum + (i.amount || 0), 0) },
        { category: 'Tax Returns', count: taxReturns.length, amount: taxReturns.reduce((sum, t) => sum + (t.amount || 0), 0) }
      ],
      metadata: { reportType, generatedAt: new Date().toISOString(), filters, dateRange: { start: dateRange.start.toISOString(), end: dateRange.end.toISOString() } }
    };
  }
}

export const reportGenerationService = new ReportGenerationService();
