import { Report, ReportCategory } from '../pages/Reports';

/**
 * Service to manage reports data and integrate with MOK Mzansi Books business data
 */
class ReportsDataService {
  private readonly REPORTS_STORAGE_KEY = 'mokReports';
  private readonly FAVORITES_STORAGE_KEY = 'mokReportsFavorites';

  /**
   * Get all available reports with real data integration
   */
  getReports(): Report[] {
    console.log('📊 [REPORTS DATA] Loading reports with real business data...');

    try {
      // Get saved custom reports
      const savedReports = this.getSavedReports();
      
      // Get system-generated reports based on actual data
      const systemReports = this.getSystemReports();
      
      // Combine and return all reports
      const allReports = [...systemReports, ...savedReports];
      
      console.log('✅ [REPORTS DATA] Loaded reports:', {
        systemReports: systemReports.length,
        customReports: savedReports.length,
        total: allReports.length
      });

      return allReports;
    } catch (error) {
      console.error('❌ [REPORTS DATA] Error loading reports:', error);
      return this.getDefaultReports();
    }
  }

  /**
   * Get system-generated reports based on actual business data
   */
  private getSystemReports(): Report[] {
    const reports: Report[] = [];
    const currentDate = new Date().toISOString().split('T')[0];

    // Check if we have actual business data
    const hasIncomes = this.hasData('incomes');
    const hasExpenses = this.hasData('expenses');
    const hasTaxReturns = this.hasData('taxReturns') || this.hasData('manualTaxReturns');
    const hasProjects = this.hasData('projects');
    const hasEmployees = this.hasData('employees');

    // Financial Reports
    if (hasIncomes || hasExpenses) {
      reports.push({
        id: 'sys-profit-loss',
        name: 'Profit & Loss Statement',
        description: 'Comprehensive P&L statement showing income, expenses, and net profit',
        category: 'financial',
        lastRun: currentDate,
        createdAt: '2025-01-15',
        createdBy: 'System',
        isFavorite: this.isFavorite('sys-profit-loss'),
        tags: ['financial', 'monthly', 'core']
      });

      reports.push({
        id: 'sys-balance-sheet',
        name: 'Balance Sheet',
        description: 'Current financial position showing assets, liabilities, and equity',
        category: 'financial',
        lastRun: currentDate,
        createdAt: '2025-01-15',
        createdBy: 'System',
        isFavorite: this.isFavorite('sys-balance-sheet'),
        tags: ['financial', 'quarterly', 'core']
      });

      reports.push({
        id: 'sys-cash-flow',
        name: 'Cash Flow Statement',
        description: 'Cash inflow and outflow over a specified period',
        category: 'financial',
        lastRun: currentDate,
        createdAt: '2025-01-15',
        createdBy: 'System',
        isFavorite: this.isFavorite('sys-cash-flow'),
        tags: ['financial', 'monthly', 'core']
      });
    }

    // Income/Sales Reports
    if (hasIncomes) {
      reports.push({
        id: 'sys-sales-by-client',
        name: 'Sales by Client',
        description: 'Breakdown of sales figures by client',
        category: 'sales',
        lastRun: currentDate,
        createdAt: '2025-01-15',
        createdBy: 'System',
        isFavorite: this.isFavorite('sys-sales-by-client'),
        tags: ['sales', 'monthly', 'client']
      });

      reports.push({
        id: 'sys-outstanding-invoices',
        name: 'Outstanding Invoices',
        description: 'Summary of all unpaid invoices',
        category: 'invoice',
        lastRun: currentDate,
        createdAt: '2025-01-15',
        createdBy: 'System',
        isFavorite: this.isFavorite('sys-outstanding-invoices'),
        tags: ['invoice', 'daily', 'essential']
      });

      reports.push({
        id: 'sys-accounts-receivable',
        name: 'Accounts Receivable Aging',
        description: 'Outstanding customer invoices categorized by age',
        category: 'financial',
        lastRun: currentDate,
        createdAt: '2025-01-15',
        createdBy: 'System',
        isFavorite: this.isFavorite('sys-accounts-receivable'),
        tags: ['financial', 'daily', 'accounts']
      });
    }

    // Expense Reports
    if (hasExpenses) {
      reports.push({
        id: 'sys-expense-by-category',
        name: 'Expense by Category',
        description: 'Breakdown of expenses by category',
        category: 'expense',
        lastRun: currentDate,
        createdAt: '2025-01-15',
        createdBy: 'System',
        isFavorite: this.isFavorite('sys-expense-by-category'),
        tags: ['expense', 'monthly', 'budget']
      });
    }

    // Project Reports
    if (hasProjects) {
      reports.push({
        id: 'sys-project-profitability',
        name: 'Project Profitability',
        description: 'Profit analysis by project',
        category: 'project',
        lastRun: currentDate,
        createdAt: '2025-01-15',
        createdBy: 'System',
        isFavorite: this.isFavorite('sys-project-profitability'),
        tags: ['project', 'profitability', 'management']
      });
    }

    // HR Reports
    if (hasEmployees) {
      reports.push({
        id: 'sys-employee-attendance',
        name: 'Employee Attendance Summary',
        description: 'Summary of employee attendance records',
        category: 'hr',
        lastRun: currentDate,
        createdAt: '2025-01-15',
        createdBy: 'System',
        isFavorite: this.isFavorite('sys-employee-attendance'),
        tags: ['hr', 'attendance', 'monthly']
      });
    }

    // Client Reports
    if (hasIncomes) {
      reports.push({
        id: 'sys-client-profitability',
        name: 'Client Profitability',
        description: 'Profit margin analysis by client',
        category: 'client',
        lastRun: currentDate,
        createdAt: '2025-01-15',
        createdBy: 'System',
        isFavorite: this.isFavorite('sys-client-profitability'),
        tags: ['client', 'profitability', 'analysis']
      });
    }

    return reports;
  }

  /**
   * Check if specific data exists in localStorage
   */
  private hasData(key: string): boolean {
    try {
      const data = localStorage.getItem(key);
      if (!data) return false;
      
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.length > 0 : Object.keys(parsed).length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if a report is marked as favorite
   */
  private isFavorite(reportId: string): boolean {
    try {
      const favorites = localStorage.getItem(this.FAVORITES_STORAGE_KEY);
      if (!favorites) return false;
      
      const favoritesArray = JSON.parse(favorites);
      return Array.isArray(favoritesArray) && favoritesArray.includes(reportId);
    } catch {
      return false;
    }
  }

  /**
   * Toggle favorite status for a report
   */
  toggleFavorite(reportId: string): void {
    try {
      let favorites: string[] = [];
      
      const existingFavorites = localStorage.getItem(this.FAVORITES_STORAGE_KEY);
      if (existingFavorites) {
        favorites = JSON.parse(existingFavorites);
      }

      if (favorites.includes(reportId)) {
        favorites = favorites.filter(id => id !== reportId);
      } else {
        favorites.push(reportId);
      }

      localStorage.setItem(this.FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      
      console.log('⭐ [REPORTS DATA] Toggled favorite for report:', reportId);
    } catch (error) {
      console.error('❌ [REPORTS DATA] Error toggling favorite:', error);
    }
  }

  /**
   * Get saved custom reports
   */
  private getSavedReports(): Report[] {
    try {
      const saved = localStorage.getItem(this.REPORTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save a custom report
   */
  saveReport(report: Omit<Report, 'id' | 'createdAt'>): Report {
    try {
      const reports = this.getSavedReports();
      const newReport: Report = {
        ...report,
        id: `custom-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0]
      };

      reports.push(newReport);
      localStorage.setItem(this.REPORTS_STORAGE_KEY, JSON.stringify(reports));
      
      console.log('💾 [REPORTS DATA] Saved custom report:', newReport.name);
      return newReport;
    } catch (error) {
      console.error('❌ [REPORTS DATA] Error saving report:', error);
      throw error;
    }
  }

  /**
   * Delete a custom report
   */
  deleteReport(reportId: string): void {
    try {
      const reports = this.getSavedReports();
      const filteredReports = reports.filter(report => report.id !== reportId);
      
      localStorage.setItem(this.REPORTS_STORAGE_KEY, JSON.stringify(filteredReports));
      
      console.log('🗑️ [REPORTS DATA] Deleted report:', reportId);
    } catch (error) {
      console.error('❌ [REPORTS DATA] Error deleting report:', error);
    }
  }

  /**
   * Get default reports when data loading fails
   */
  private getDefaultReports(): Report[] {
    return [
      {
        id: 'default-financial',
        name: 'Financial Overview',
        description: 'Basic financial overview report',
        category: 'financial',
        createdAt: '2025-01-15',
        createdBy: 'System',
        isFavorite: false,
        tags: ['financial', 'overview']
      }
    ];
  }

  /**
   * Get reports filtered by category
   */
  getReportsByCategory(category: ReportCategory | null): Report[] {
    const allReports = this.getReports();
    
    if (!category) return allReports;
    
    return allReports.filter(report => report.category === category);
  }

  /**
   * Search reports by query
   */
  searchReports(query: string): Report[] {
    if (!query.trim()) return this.getReports();
    
    const allReports = this.getReports();
    const searchLower = query.toLowerCase();
    
    return allReports.filter(report => 
      report.name.toLowerCase().includes(searchLower) ||
      report.description.toLowerCase().includes(searchLower) ||
      report.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  /**
   * Get favorite reports
   */
  getFavoriteReports(): Report[] {
    return this.getReports().filter(report => report.isFavorite);
  }

  /**
   * Get recently run reports
   */
  getRecentReports(): Report[] {
    return this.getReports()
      .filter(report => report.lastRun)
      .sort((a, b) => new Date(b.lastRun!).getTime() - new Date(a.lastRun!).getTime())
      .slice(0, 10);
  }

  /**
   * Execute a report (placeholder for actual report generation)
   */
  async executeReport(reportId: string): Promise<any> {
    console.log('🚀 [REPORTS DATA] Executing report:', reportId);
    
    // Update last run date
    const reports = this.getReports();
    const report = reports.find(r => r.id === reportId);
    
    if (report && !reportId.startsWith('sys-')) {
      // Update custom reports only
      const customReports = this.getSavedReports();
      const updatedReports = customReports.map(r => 
        r.id === reportId ? { ...r, lastRun: new Date().toISOString().split('T')[0] } : r
      );
      localStorage.setItem(this.REPORTS_STORAGE_KEY, JSON.stringify(updatedReports));
    }

    // For system reports, integrate with existing report generation service
    if (reportId.startsWith('sys-')) {
      // This would integrate with your existing reportGenerationService
      return { success: true, message: 'Report executed successfully' };
    }

    return { success: true, message: 'Custom report executed' };
  }
}

export const reportsDataService = new ReportsDataService();
