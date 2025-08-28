import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Building2, 
  Calculator,
  PieChart,
  BarChart3,
  FileSpreadsheet,
  Search,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { reportGenerationService, ReportType, ReportFilters, ReportData } from '../../services/reportGenerationService';
import { pdfReportService } from '../../services/pdfReportService';
import { useAuditLogger } from '@/hooks/useAuditLogger';

interface ReportsTabProps {
  companyId?: string;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ companyId = 'current-company-id' }) => {
  const { logAudit, logDocument } = useAuditLogger();
  const [selectedReportType, setSelectedReportType] = useState<ReportType | ''>('');
  const [reportFilters, setReportFilters] = useState<ReportFilters>({
    dateRange: 'all',
    startDate: '',
    endDate: '',
    status: 'all',
    category: 'all',
    paymentMethod: 'all',
    project: 'all',
    taxType: 'all',
    amountMin: '',
    amountMax: ''
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Auto-generate report when report type or filters change
  useEffect(() => {
    const generateReport = async () => {
      if (!selectedReportType) {
        setReportData(null);
        return;
      }

      setIsGenerating(true);
      try {
        console.log('🔄 [REPORTS] Auto-generating report:', selectedReportType, reportFilters);
        
        const data = await reportGenerationService.generateReport(
          selectedReportType as ReportType,
          reportFilters
        );
        
        setReportData(data);
        
        console.log('✅ [REPORTS] Report auto-generated:', {
          type: selectedReportType,
          recordCount: data.summary?.totalRecords || 0,
          totalAmount: data.summary?.totalAmount || 0
        });
      } catch (error) {
        console.error('❌ [REPORTS] Error auto-generating report:', error);
        setReportData(null);
      } finally {
        setIsGenerating(false);
      }
    };

    generateReport();
  }, [selectedReportType, reportFilters]);

  // Report type categories for better organization
  const reportCategories = {
    expenses: {
      title: 'Expense Reports',
      icon: DollarSign,
      reports: [
        { value: 'expense-summary', label: 'Total Expenses Overview' },
        { value: 'expense-category', label: 'Expense by Category' },
        { value: 'expense-payment-method', label: 'Payment Method Distribution' },
        { value: 'expense-project', label: 'Project Expense Allocation' },
        { value: 'expense-receipt-compliance', label: 'Receipt Tracking Status' },
        { value: 'expense-bank-integration', label: 'Bank vs Manual Expenses' }
      ]
    },
    income: {
      title: 'Income Reports',
      icon: TrendingUp,
      reports: [
        { value: 'income-summary', label: 'Total Revenue Overview' },
        { value: 'income-status', label: 'Payment Status Breakdown' },
        { value: 'income-client', label: 'Revenue by Client' },
        { value: 'income-service', label: 'Revenue by Service Type' },
        { value: 'income-invoice', label: 'Invoice Tracking & Performance' },
        { value: 'income-payment-method', label: 'Income Payment Methods' }
      ]
    },
    tax: {
      title: 'Tax Reports',
      icon: Building2,
      reports: [
        { value: 'tax-summary', label: 'Business Tax Returns Overview' },
        { value: 'tax-type', label: 'Tax Returns by Type' },
        { value: 'tax-compliance', label: 'Compliance Status Tracking' },
        { value: 'tax-liability', label: 'Tax Amounts Due/Paid' },
        { value: 'tax-period', label: 'Tax Returns by Period' },
        { value: 'tax-entry-method', label: 'Manual vs Automated Tax' }
      ]
    },
    integrated: {
      title: 'Integrated Reports',
      icon: BarChart3,
      reports: [
        { value: 'profit-loss', label: 'Comprehensive P&L Statement' },
        { value: 'cash-flow', label: 'Cash Flow Analysis' },
        { value: 'tax-impact', label: 'Tax Implications Analysis' }
      ]
    }
  };

  // Generate report data
  const handleGenerateReport = async () => {
    if (!selectedReportType) {
      toast.error('Please select a report type');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🔄 [REPORTS] Generating report:', selectedReportType, reportFilters);
      
      const data = await reportGenerationService.generateReport(
        selectedReportType as ReportType,
        reportFilters
      );
      
      setReportData(data);
      toast.success('Report generated successfully');
      
      console.log('✅ [REPORTS] Report generated:', {
        type: selectedReportType,
        recordCount: data.summary?.totalRecords || 0,
        totalAmount: data.summary?.totalAmount || 0
      });

      // Audit: manual report generation
      try {
        const label = getReportTypeLabel(selectedReportType);
        logAudit({
          category: 'financial',
          action: 'Generated Report',
          entityType: 'report',
          entityId: String(selectedReportType),
          entityName: label,
          changeType: 'create',
          description: `Generated report: ${label}`,
          metadata: { filters: reportFilters, recordCount: data.summary?.totalRecords, totalAmount: data.summary?.totalAmount }
        });
      } catch {}
    } catch (error) {
      console.error('❌ [REPORTS] Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download report as PDF
  const handleDownloadPDF = async () => {
    if (!reportData || !selectedReportType) {
      toast.error('No report data available for download');
      return;
    }

    setIsDownloading(true);
    try {
      console.log('📄 [REPORTS] Downloading PDF for report:', selectedReportType);
      
      await pdfReportService.downloadReport(
        reportData,
        selectedReportType as ReportType,
        reportFilters
      );
      
      toast.success('Report downloaded successfully');

      // Audit: PDF download
      try {
        const label = getReportTypeLabel(selectedReportType);
        logDocument('Downloaded Report PDF', 'report', label, String(selectedReportType));
      } catch {}
    } catch (error) {
      console.error('❌ [REPORTS] Error downloading PDF:', error);
      toast.error('Failed to download report');
    } finally {
      setIsDownloading(false);
    }
  };

  // Update filter values
  const updateFilter = (key: keyof ReportFilters, value: string) => {
    setReportFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setReportFilters({
      dateRange: 'all',
      startDate: '',
      endDate: '',
      status: 'all',
      category: 'all',
      paymentMethod: 'all',
      project: 'all',
      taxType: 'all',
      amountMin: '',
      amountMax: ''
    });
  };

  // Get report type label
  const getReportTypeLabel = (reportType: string): string => {
    for (const category of Object.values(reportCategories)) {
      const report = category.reports.find(r => r.value === reportType);
      if (report) return report.label;
    }
    return reportType;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-sf-pro">Financial Reports</h2>
          <p className="text-slate-600 dark:text-slate-400 font-sf-pro">Generate comprehensive reports for your business finances</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={resetFilters}
            className="border-white/10 text-slate-200 hover:bg-white/5"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Report Selection */}
      <Card className="glass backdrop-blur-xl bg-slate-900/40 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-sf-pro">
            <FileText className="h-5 w-5 text-mokm-purple-600" />
            Select Report Type
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(reportCategories).map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <div key={key} className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <IconComponent className="h-4 w-4 text-mokm-purple-600" />
                    {category.title}
                  </div>
                  <Select
                    value={selectedReportType}
                    onValueChange={(value) => setSelectedReportType(value as ReportType)}
                  >
                    <SelectTrigger className="w-full bg-slate-900/40 border-white/10 text-slate-100">
                      <SelectValue placeholder="Select report..." />
                    </SelectTrigger>
                    <SelectContent>
                      {category.reports.map((report) => (
                        <SelectItem key={report.value} value={report.value}>
                          {report.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>

          {/* Report Filters */}
          {selectedReportType && (
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 font-sf-pro">Report Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Date Range</label>
                  <Select
                    value={reportFilters.dateRange}
                    onValueChange={(value) => updateFilter('dateRange', value)}
                  >
                    <SelectTrigger className="bg-slate-900/40 border-white/10 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="this-quarter">This Quarter</SelectItem>
                      <SelectItem value="last-quarter">Last Quarter</SelectItem>
                      <SelectItem value="this-year">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Date Range */}
                {reportFilters.dateRange === 'custom' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Start Date</label>
                      <Input
                        type="date"
                        value={reportFilters.startDate}
                        onChange={(e) => updateFilter('startDate', e.target.value)}
                        className="bg-slate-900/40 border-white/10 text-slate-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">End Date</label>
                      <Input
                        type="date"
                        value={reportFilters.endDate}
                        onChange={(e) => updateFilter('endDate', e.target.value)}
                        className="bg-slate-900/40 border-white/10 text-slate-100"
                      />
                    </div>
                  </>
                )}

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Status</label>
                  <Select
                    value={reportFilters.status}
                    onValueChange={(value) => updateFilter('status', value)}
                  >
                    <SelectTrigger className="bg-slate-900/40 border-white/10 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="received">Received/Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Category</label>
                  <Select
                    value={reportFilters.category}
                    onValueChange={(value) => updateFilter('category', value)}
                  >
                    <SelectTrigger className="bg-slate-900/40 border-white/10 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="office-supplies">Office Supplies</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="consulting">Consulting Services</SelectItem>
                      <SelectItem value="development">Development Services</SelectItem>
                      <SelectItem value="training">Training Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Min Amount</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={reportFilters.amountMin}
                    onChange={(e) => updateFilter('amountMin', e.target.value)}
                    className="bg-slate-900/40 border-white/10 text-slate-100 placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Max Amount</label>
                  <Input
                    type="number"
                    placeholder="999999.99"
                    value={reportFilters.amountMax}
                    onChange={(e) => updateFilter('amountMax', e.target.value)}
                    className="bg-slate-900/40 border-white/10 text-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Generate Report Button */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <Button
              onClick={handleGenerateReport}
              disabled={!selectedReportType || isGenerating}
              className="bg-mokm-purple-600 hover:bg-mokm-purple-700 text-white"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>

            {reportData && (
              <Button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                variant="outline"
                className="border-white/10 text-slate-200 hover:bg-white/5"
              >
                {isDownloading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <Card className="glass backdrop-blur-xl bg-slate-900/40 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-slate-900 dark:text-slate-100 font-sf-pro">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-mokm-purple-600" />
                {getReportTypeLabel(selectedReportType)}
              </div>
              <Badge variant="secondary" className="bg-mokm-purple-500/20 text-mokm-purple-300 border border-mokm-purple-400/30">
                {reportData.summary?.totalRecords || 0} records
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Report Summary */}
            {reportData.summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="glass backdrop-blur-sm bg-slate-900/50 border border-white/10 p-4 rounded-lg">
                  <div className="text-sm text-slate-300 font-medium">Total Amount</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    R{reportData.summary.totalAmount?.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) || '0.00'}
                  </div>
                </div>
                <div className="glass backdrop-blur-sm bg-slate-900/50 border border-white/10 p-4 rounded-lg">
                  <div className="text-sm text-slate-300 font-medium">Total Records</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {reportData.summary.totalRecords || 0}
                  </div>
                </div>
                <div className="glass backdrop-blur-sm bg-slate-900/50 border border-white/10 p-4 rounded-lg">
                  <div className="text-sm text-slate-300 font-medium">Average Amount</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    R{reportData.summary.averageAmount?.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) || '0.00'}
                  </div>
                </div>
              </div>
            )}

            {/* Report Data Table */}
            {reportData.data && reportData.data.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {Object.keys(reportData.data[0]).map((key) => (
                        <th key={key} className="text-left p-3 font-medium text-slate-300 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.data.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                        {Object.entries(row).map(([key, value], cellIndex) => (
                          <td key={cellIndex} className="p-3 text-slate-300">
                            {typeof value === 'number' && key.toLowerCase().includes('amount') 
                              ? `R${value.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
                              : String(value || '-')
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportData.data.length > 10 && (
                  <div className="text-center py-3 text-sm text-slate-400">
                    Showing first 10 of {reportData.data.length} records. Download PDF for complete report.
                  </div>
                )}
              </div>
            )}

            {/* No Data Message */}
            {reportData.data && reportData.data.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <div className="text-lg font-medium">No data found</div>
                <div className="text-sm">Try adjusting your filters or date range</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsTab;
