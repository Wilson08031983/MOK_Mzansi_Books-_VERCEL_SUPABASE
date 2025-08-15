
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Clock, 
  Star, 
  Settings, 
  RefreshCw,
  Calendar,
  Trash2,
  HardDrive,
  Play,
  Filter,
  Mail,
  ChevronDown,
  ChevronUp,
  Heart,
  HeartOff
} from 'lucide-react';
import { toast } from 'sonner';
import { reportsDataService } from '@/services/reportsDataService';
import { pdfReportService } from '@/services/pdfReportService';
import { reportGenerationService, ReportType } from '@/services/reportGenerationService';
import { getNotificationSettings, saveNotificationSettings, type NotificationSettings } from '@/services/notificationService';
import { safeLocalStorage } from '@/utils/safeAccess';
import type { Report } from '@/pages/Reports';

interface ReportSettings {
  autoGenerate: boolean;
  emailReports: boolean;
  retentionDays: number;
  defaultFormat: string;
  compressionEnabled: boolean;
  scheduleEnabled: boolean;
  maxStorageSize: string;
}

interface TestFilters {
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

const defaultReportSettings: ReportSettings = {
  autoGenerate: false,
  emailReports: false,
  retentionDays: 30,
  defaultFormat: 'pdf',
  compressionEnabled: true,
  scheduleEnabled: false,
  maxStorageSize: '500MB'
};

const defaultTestFilters: TestFilters = {
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
};

// Parse human-readable sizes like "100MB", "1GB" into megabytes
const parseSizeToMB = (size: string): number => {
  if (!size) return 0;
  const normalized = size.trim().toUpperCase();
  const num = parseFloat(normalized.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(num)) return 0;
  if (normalized.endsWith('GB')) return num * 1024;
  if (normalized.endsWith('MB')) return num;
  if (normalized.endsWith('KB')) return num / 1024;
  if (normalized.endsWith('B')) return num / (1024 * 1024);
  // Fallback assume MB when no unit
  return num;
};

const ReportSettingsTab = () => {
  const [settings, setSettings] = useState<ReportSettings>(defaultReportSettings);
  const [reports, setReports] = useState<Report[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ used: '0MB', total: '500MB', percentage: 0 });
  const [selectedTestReport, setSelectedTestReport] = useState<ReportType | undefined>(undefined);
  const [testFilters, setTestFilters] = useState<TestFilters>(defaultTestFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(getNotificationSettings());

  // Load settings and reports on mount
  useEffect(() => {
    loadSettings();
    loadReports();
    calculateStorageInfo();
    loadNotificationSettings();
  }, []);

  // Recalculate storage info when dependencies change
  useEffect(() => {
    calculateStorageInfo();
  }, [settings.maxStorageSize, reports]);

  const loadSettings = () => {
    const savedSettings = safeLocalStorage.getItem<ReportSettings>('reportSettings', defaultReportSettings);
    setSettings(savedSettings);
  };

  const loadNotificationSettings = () => {
    const notifSettings = getNotificationSettings();
    setNotificationSettings(notifSettings);
  };

  const saveSettings = (newSettings: ReportSettings) => {
    setSettings(newSettings);
    safeLocalStorage.setItem('reportSettings', newSettings);
    toast.success('Report settings saved successfully');
  };

  const loadReports = () => {
    try {
      const allReports = reportsDataService.getReports();
      setReports(allReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports');
    }
  };

  const calculateStorageInfo = () => {
    try {
      // Simulate storage calculation based on localStorage usage
      const reportData = localStorage.getItem('mokReports') || '';
      const favoritesData = localStorage.getItem('mokReportsFavorites') || '';
      const settingsData = localStorage.getItem('reportSettings') || '';

      const totalBytes = new Blob([reportData + favoritesData + settingsData]).size;
      const usedMBNumber = totalBytes / (1024 * 1024);
      const usedMB = usedMBNumber.toFixed(1);
      const maxMB = parseSizeToMB(settings.maxStorageSize);
      const percentage = maxMB > 0 ? (usedMBNumber / maxMB) * 100 : 0;

      setStorageInfo({
        used: `${usedMB}MB`,
        total: settings.maxStorageSize,
        percentage: Math.min(percentage, 100),
      });
    } catch (error) {
      console.error('Error calculating storage:', error);
    }
  };

  const handleTestReportGeneration = async () => {
    if (!selectedTestReport) {
      toast.error('Please select a report type to test');
      return;
    }

    setIsGenerating(true);
    try {
      const reportData = await reportGenerationService.generateReport(selectedTestReport, testFilters);
      toast.success(`Test report generated successfully: ${reportData.summary.totalRecords} records`);

      // Refresh reports list
      loadReports();
    } catch (error) {
      console.error('Error generating test report:', error);
      toast.error('Failed to generate test report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestDownload = async () => {
    if (!selectedTestReport) {
      toast.error('Please select a report type to download');
      return;
    }

    setIsDownloading(true);
    try {
      const reportData = await reportGenerationService.generateReport(selectedTestReport, testFilters);
      await pdfReportService.downloadReport(reportData, selectedTestReport, testFilters);
      toast.success('Test report downloaded successfully');
    } catch (error) {
      console.error('Error downloading test report:', error);
      toast.error('Failed to download test report');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClearReportCache = () => {
    try {
      localStorage.removeItem('mokReports');
      localStorage.removeItem('mokReportsFavorites');
      setReports([]);
      calculateStorageInfo();
      toast.success('Report cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear report cache');
    }
  };

  const handleToggleFavorite = (reportId: string) => {
    try {
      reportsDataService.toggleFavorite(reportId);
      loadReports(); // Reload to reflect changes
      toast.success('Favorite status updated');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const handleScheduleChange = (field: string, value: string | boolean) => {
    const updatedSettings = {
      ...notificationSettings,
      email: {
        ...notificationSettings.email,
        weeklyReports: field === 'weeklyReports' ? value as boolean : notificationSettings.email.weeklyReports,
        monthlyReports: field === 'monthlyReports' ? value as boolean : notificationSettings.email.monthlyReports,
      },
      frequency: {
        ...notificationSettings.frequency,
        reportSchedule: field === 'reportSchedule' ? value as string : notificationSettings.frequency.reportSchedule,
      }
    };
    
    setNotificationSettings(updatedSettings);
    saveNotificationSettings(updatedSettings);
    toast.success('Report schedule updated');
  };

  const clearOldReports = () => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - settings.retentionDays);
      
      const reportsData = localStorage.getItem('mokReports');
      if (reportsData) {
        const reports = JSON.parse(reportsData);
        const filteredReports = reports.filter((report: any) => 
          !report.createdAt || new Date(report.createdAt) > cutoffDate
        );
        localStorage.setItem('mokReports', JSON.stringify(filteredReports));
      }
      
      calculateStorageInfo();
      loadReports();
      toast.success(`Cleared reports older than ${settings.retentionDays} days`);
    } catch (error) {
      console.error('Error clearing old reports:', error);
      toast.error('Failed to clear old reports');
    }
  };

  const recentReports = reports
    .filter((report) => report.lastRun)
    .sort((a, b) => new Date(b.lastRun!).getTime() - new Date(a.lastRun!).getTime())
    .slice(0, 5);

  const favoriteReports = reports.filter((report) => report.isFavorite);

  const reportCategories = [
    { value: 'expense-summary', label: 'Expense Summary' },
    { value: 'income-summary', label: 'Income Summary' },
    { value: 'tax-summary', label: 'Tax Summary' },
    { value: 'profit-loss', label: 'Profit & Loss' },
    { value: 'cash-flow', label: 'Cash Flow Analysis' },
    { value: 'expense-category', label: 'Expense by Category' },
    { value: 'income-client', label: 'Revenue by Client' },
  ];

  return (
    <div className="space-y-6">
      {/* Report Generation Section */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <BarChart3 className="h-5 w-5 mr-2" />
            Report Generation & Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Test Report Type</Label>
              <Select value={(selectedTestReport as string | undefined)} onValueChange={(value) => setSelectedTestReport(value as ReportType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type to test" />
                </SelectTrigger>
                <SelectContent>
                  {reportCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleTestReportGeneration} disabled={isGenerating || !selectedTestReport} className="flex-1">
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate Test
                  </>
                )}
              </Button>
              <Button onClick={handleTestDownload} disabled={isDownloading || !selectedTestReport} variant="outline">
                {isDownloading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="border-t pt-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="mb-3"
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
              {showAdvancedFilters ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>

            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select value={testFilters.dateRange} onValueChange={(value) => setTestFilters({ ...testFilters, dateRange: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="this-year">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={testFilters.status} onValueChange={(value) => setTestFilters({ ...testFilters, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={testFilters.category} onValueChange={(value) => setTestFilters({ ...testFilters, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="office">Office Supplies</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount Range (Min)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={testFilters.amountMin} 
                    onChange={(e) => setTestFilters({ ...testFilters, amountMin: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Amount Range (Max)</Label>
                  <Input 
                    type="number" 
                    placeholder="No limit" 
                    value={testFilters.amountMax} 
                    onChange={(e) => setTestFilters({ ...testFilters, amountMax: e.target.value })}
                  />
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setTestFilters(defaultTestFilters)}
                    className="w-full"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600">
            Use the test functionality to verify report generation and download capabilities with sample data.
          </div>
        </CardContent>
      </Card>

      {/* Report Scheduling */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Calendar className="h-5 w-5 mr-2" />
            Report Scheduling & Automation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Weekly Reports</Label>
                  <p className="text-xs text-gray-600">Automatically send weekly financial summaries</p>
                </div>
                <Switch
                  checked={notificationSettings.email.weeklyReports}
                  onCheckedChange={(checked) => handleScheduleChange('weeklyReports', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Monthly Reports</Label>
                  <p className="text-xs text-gray-600">Automatically send monthly comprehensive reports</p>
                </div>
                <Switch
                  checked={notificationSettings.email.monthlyReports}
                  onCheckedChange={(checked) => handleScheduleChange('monthlyReports', checked)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Schedule Frequency</Label>
                <Select 
                  value={notificationSettings.frequency.reportSchedule} 
                  onValueChange={(value) => handleScheduleChange('reportSchedule', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <Mail className="h-4 w-4 text-blue-600" />
                <div className="text-xs">
                  <div className="font-medium">Email: {notificationSettings.email.address}</div>
                  <div className="text-gray-600">Configure in Notification Settings</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Clock className="h-5 w-5 mr-2" />
            Recent Reports ({recentReports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium text-sm">{report.name}</div>
                      <div className="text-xs text-gray-500">Last run: {report.lastRun} • Created by: {report.createdBy}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {report.category}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(report.id)}
                      className="h-8 w-8 p-0"
                    >
                      {report.isFavorite ? (
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                      ) : (
                        <HeartOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No recent reports available</p>
              <p className="text-sm">Generate some test reports to see them here</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Favorite Reports */}
        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardHeader>
            <CardTitle className="flex items-center font-sf-pro">
              <Star className="h-5 w-5 mr-2" />
              Favorite Reports ({favoriteReports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favoriteReports.length > 0 ? (
              <div className="space-y-2">
                {favoriteReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{report.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {report.category}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleFavorite(report.id)}
                        className="h-6 w-6 p-0"
                      >
                        <HeartOff className="h-3 w-3 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Star className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No favorite reports yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Storage Management */}
        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardHeader>
            <CardTitle className="flex items-center font-sf-pro">
              <HardDrive className="h-5 w-5 mr-2" />
              Storage Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used Storage</span>
                <span>
                  {storageInfo.used} / {storageInfo.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-mokm-orange-500 to-mokm-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${storageInfo.percentage}%` }}
                ></div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Reports</span>
                <Badge variant="outline">{reports.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Recent Reports</span>
                <Badge variant="outline">{recentReports.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Favorite Reports</span>
                <Badge variant="outline">{favoriteReports.length}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Button onClick={handleClearReportCache} variant="outline" size="sm" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Report Cache
              </Button>
              <Button onClick={clearOldReports} variant="outline" size="sm" className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                Clear Old Reports ({settings.retentionDays} days+)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Settings */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Settings className="h-5 w-5 mr-2" />
            General Report Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-generate" className="text-sm font-medium">
                  Auto-generate Reports
                </Label>
                <Switch
                  id="auto-generate"
                  checked={settings.autoGenerate}
                  onCheckedChange={(checked) => saveSettings({ ...settings, autoGenerate: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-reports" className="text-sm font-medium">
                  Email Reports
                </Label>
                <Switch
                  id="email-reports"
                  checked={settings.emailReports}
                  onCheckedChange={(checked) => saveSettings({ ...settings, emailReports: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="compression" className="text-sm font-medium">
                  Enable Compression
                </Label>
                <Switch
                  id="compression"
                  checked={settings.compressionEnabled}
                  onCheckedChange={(checked) => saveSettings({ ...settings, compressionEnabled: checked })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Report Retention (Days)</Label>
                <Select value={settings.retentionDays.toString()} onValueChange={(value) => saveSettings({ ...settings, retentionDays: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Default Format</Label>
                <Select value={settings.defaultFormat} onValueChange={(value) => saveSettings({ ...settings, defaultFormat: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Max Storage Size</Label>
                <Select value={settings.maxStorageSize} onValueChange={(value) => saveSettings({ ...settings, maxStorageSize: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100MB">100MB</SelectItem>
                    <SelectItem value="500MB">500MB</SelectItem>
                    <SelectItem value="1GB">1GB</SelectItem>
                    <SelectItem value="5GB">5GB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportSettingsTab;
