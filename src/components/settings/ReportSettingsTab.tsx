
import React, { useState, useEffect, useRef } from 'react';
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
import { useLocalizationContext } from '@/contexts/LocalizationContext';
import { reportsDataService } from '@/services/reportsDataService';
import { pdfReportService } from '@/services/pdfReportService';
import { reportGenerationService, ReportType } from '@/services/reportGenerationService';
import { getNotificationSettings, saveNotificationSettings, type NotificationSettings } from '@/services/notificationService';
import { safeLocalStorage } from '@/utils/safeAccess';
import type { Report } from '@/pages/Reports';
import { auditService } from '@/services/auditService';

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
  const { t } = useLocalizationContext();
  // i18n fallback helper for this component: use fallback if t(key) returns the key itself or an empty value
  const tt = (key: string, fallback: string) => {
    const v = t(key);
    if (!v || v === key) return fallback;
    return v;
  };
  const [settings, setSettings] = useState<ReportSettings>(defaultReportSettings);
  const [reports, setReports] = useState<Report[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ used: '0MB', total: '500MB', percentage: 0 });
  const [selectedTestReport, setSelectedTestReport] = useState<ReportType | undefined>(undefined);
  const [testFilters, setTestFilters] = useState<TestFilters>(defaultTestFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(getNotificationSettings());
  // Debounce timer and toast throttle for settings persistence
  const saveTimeoutRef = useRef<number | null>(null);
  const lastToastTimeRef = useRef<number>(0);
  // Add a separate debounce timer for notification schedule saves
  const notifSaveTimeoutRef = useRef<number | null>(null);

  // Load settings and reports on mount
  useEffect(() => {
    loadSettings();
    loadReports();
    calculateStorageInfo();
    loadNotificationSettings();
  }, []);

  // Ensure timers are cleared on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      if (notifSaveTimeoutRef.current) {
        window.clearTimeout(notifSaveTimeoutRef.current);
        notifSaveTimeoutRef.current = null;
      }
    };
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
    // Update local state immediately for responsive UI
    setSettings(newSettings);

    // Debounce actual persistence to avoid storage storms during rapid toggles/changes
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      try {
        safeLocalStorage.setItem('reportSettings', newSettings);

        // Throttle success toast to avoid spam when user flips multiple controls
        const now = Date.now();
        if (now - lastToastTimeRef.current > 1500) {
          toast.success(t('common.success'));
          lastToastTimeRef.current = now;
        }

        try {
          auditService.logAudit({
            category: 'reports',
            action: 'Report Settings Updated',
            page: 'Settings',
            section: 'Reports',
            entityType: 'report_settings',
            changeType: 'update',
            newValues: newSettings,
            description: 'User updated report settings (debounced)',
          });
        } catch {/* noop */}
      } catch (error) {
        console.error('Error saving report settings:', error);
        toast.error(t('common.error'));
      }
    }, 300);
  };

  const loadReports = () => {
    try {
      const allReports = reportsDataService.getReports();
      setReports(allReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error(t('common.error'));
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
      toast.error(t('common.error'));
      return;
    }

    setIsGenerating(true);
    try {
      const reportData = await reportGenerationService.generateReport(selectedTestReport, testFilters);
      toast.success(t('common.success'));

      // Refresh reports list
      loadReports();
      try {
        auditService.logAudit({
          category: 'reports',
          action: 'Generate Test Report',
          page: 'Settings',
          section: 'Reports',
          entityType: 'report',
          changeType: 'create',
          description: `Generated test report: ${selectedTestReport}`,
          metadata: { filters: testFilters }
        });
      } catch {/* noop */}
    } catch (error) {
      console.error('Error generating test report:', error);
      toast.error(t('common.error'));
      try {
        auditService.logAudit({
          category: 'reports',
          action: 'Generate Test Report Failed',
          page: 'Settings',
          section: 'Reports',
          entityType: 'report',
          changeType: 'read',
          description: `Failed to generate test report: ${selectedTestReport}`,
          metadata: { error: String(error) },
          severity: 'warning'
        });
      } catch {/* noop */}
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestDownload = async () => {
    if (!selectedTestReport) {
      toast.error(t('common.error'));
      return;
    }

    setIsDownloading(true);
    try {
      const reportData = await reportGenerationService.generateReport(selectedTestReport, testFilters);
      await pdfReportService.downloadReport(reportData, selectedTestReport, testFilters);
      toast.success(t('common.success'));
      try {
        auditService.logAudit({
          category: 'reports',
          action: 'Download Test Report',
          page: 'Settings',
          section: 'Reports',
          entityType: 'report',
          changeType: 'export',
          description: `Downloaded test report: ${selectedTestReport}`,
          metadata: { filters: testFilters }
        });
      } catch {/* noop */}
    } catch (error) {
      console.error('Error downloading test report:', error);
      toast.error(t('common.error'));
      try {
        auditService.logAudit({
          category: 'reports',
          action: 'Download Test Report Failed',
          page: 'Settings',
          section: 'Reports',
          entityType: 'report',
          changeType: 'read',
          description: `Failed to download test report: ${selectedTestReport}`,
          metadata: { error: String(error) },
          severity: 'warning'
        });
      } catch {/* noop */}
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
      toast.success(t('dataManagement.clearSuccessTitle'));
      try {
        auditService.logAudit({
          category: 'reports',
          action: 'Clear Reports Cache',
          page: 'Settings',
          section: 'Reports',
          entityType: 'report_cache',
          changeType: 'delete',
          description: 'Cleared reports and favorites cache',
        });
      } catch {/* noop */}
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error(t('dataManagement.clearFailedTitle'));
      try {
        auditService.logAudit({
          category: 'reports',
          action: 'Clear Reports Cache Failed',
          page: 'Settings',
          section: 'Reports',
          entityType: 'report_cache',
          changeType: 'update',
          description: 'Failed clearing reports cache',
          metadata: { error: String(error) },
          severity: 'warning'
        });
      } catch {/* noop */}
    }
  };

  const handleToggleFavorite = (reportId: string) => {
    try {
      reportsDataService.toggleFavorite(reportId);
      loadReports(); // Reload to reflect changes
      toast.success(t('common.success'));
      try {
        auditService.logAudit({
          category: 'reports',
          action: 'Toggle Favorite Report',
          page: 'Settings',
          section: 'Reports',
          entityType: 'report',
          changeType: 'update',
          description: `Toggled favorite for report ${reportId}`,
        });
      } catch {/* noop */}
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error(t('common.error'));
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

    // Debounce persistence to avoid rapid successive writes and toast spam
    if (notifSaveTimeoutRef.current) {
      window.clearTimeout(notifSaveTimeoutRef.current);
    }

    notifSaveTimeoutRef.current = window.setTimeout(() => {
      saveNotificationSettings(updatedSettings);

      // Throttle success toast similar to report settings
      const now = Date.now();
      if (now - lastToastTimeRef.current > 1500) {
        toast.success(t('common.success'));
        lastToastTimeRef.current = now;
      }

      try {
        auditService.logAudit({
          category: 'reports',
          action: 'Report Schedule Updated',
          page: 'Settings',
          section: 'Reports',
          entityType: 'report_schedule',
          changeType: 'update',
          description: `Updated schedule field ${field}`,
          newValues: { [field]: value }
        });
      } catch {/* noop */}
    }, 300);
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
      toast.success(t('common.success'));
      try {
        auditService.logAudit({
          category: 'reports',
          action: 'Clear Old Reports',
          page: 'Settings',
          section: 'Reports',
          entityType: 'report',
          changeType: 'delete',
          description: `Cleared reports older than ${settings.retentionDays} days`,
          metadata: { retentionDays: settings.retentionDays }
        });
      } catch {/* noop */}
    } catch (error) {
      console.error('Error clearing old reports:', error);
      toast.error(t('common.error'));
      try {
        auditService.logAudit({
          category: 'reports',
          action: 'Clear Old Reports Failed',
          page: 'Settings',
          section: 'Reports',
          entityType: 'report',
          changeType: 'update',
          description: 'Failed clearing old reports',
          metadata: { error: String(error) },
          severity: 'warning'
        });
      } catch {/* noop */}
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
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <BarChart3 className="h-5 w-5 mr-2" />
            {tt('settings.tabs.reports', 'Manage report configuration and behavior')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{tt('common.reports', 'Reports')}</Label>
              <Select value={(selectedTestReport as string | undefined)} onValueChange={(value) => setSelectedTestReport(value as ReportType)}>
                <SelectTrigger>
                  <SelectValue placeholder={tt('common.select', 'Select')} />
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
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    {t('common.submit')}
                  </>
                )}
              </Button>
              <Button onClick={handleTestDownload} disabled={isDownloading || !selectedTestReport} variant="outline">
                {isDownloading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    {t('common.download')}
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
              {tt('common.filter', 'Filter')}
              {showAdvancedFilters ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>

            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-lg bg-slate-900/40 border border-white/10">
                <div className="space-y-2">
                  <Label>{t('invoices.date')}</Label>
                  <Select value={testFilters.dateRange} onValueChange={(value) => setTestFilters({ ...testFilters, dateRange: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all')}</SelectItem>
                      <SelectItem value="today">{t('dashboard.date')}</SelectItem>
                      <SelectItem value="this-month">{t('dashboard.stats.totalRevenue')}</SelectItem>
                      <SelectItem value="this-year">{t('dashboard.overview')}</SelectItem>
                      <SelectItem value="custom">{t('common.custom')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('clients.status')}</Label>
                  <Select value={testFilters.status} onValueChange={(value) => setTestFilters({ ...testFilters, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('clients.allStatus')}</SelectItem>
                      <SelectItem value="paid">{t('invoices.statusLabels.paid')}</SelectItem>
                      <SelectItem value="pending">{t('clients.pending')}</SelectItem>
                      <SelectItem value="overdue">{t('clients.overdue')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('inventory.category')}</Label>
                  <Select value={testFilters.category} onValueChange={(value) => setTestFilters({ ...testFilters, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('inventory.allCategories')}</SelectItem>
                      <SelectItem value="office">Office Supplies</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('invoices.amount')}</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={testFilters.amountMin} 
                    onChange={(e) => setTestFilters({ ...testFilters, amountMin: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('invoices.amount')}</Label>
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
                    {t('common.reset')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="text-sm text-slate-400">{tt('settings.description', 'Configure how reports are generated, scheduled and stored')}</div>
        </CardContent>
      </Card>

      {/* Report Scheduling */}
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Calendar className="h-5 w-5 mr-2" />
            {tt('notifications.reportSchedule', 'Report Schedule')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">{tt('notifications.weekly', 'Weekly')}</Label>
                  <p className="text-xs text-slate-400">{tt('notifications.weekly', 'Weekly')}</p>
                </div>
                <Switch
                  checked={notificationSettings.email.weeklyReports}
                  onCheckedChange={(checked) => handleScheduleChange('weeklyReports', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">{tt('notifications.monthly', 'Monthly')}</Label>
                  <p className="text-xs text-slate-400">{tt('notifications.monthly', 'Monthly')}</p>
                </div>
                <Switch
                  checked={notificationSettings.email.monthlyReports}
                  onCheckedChange={(checked) => handleScheduleChange('monthlyReports', checked)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{tt('notifications.reportSchedule', 'Report schedule')}</Label>
                <Select 
                  value={notificationSettings.frequency.reportSchedule} 
                  onValueChange={(value) => handleScheduleChange('reportSchedule', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{tt('notifications.daily', 'Daily')}</SelectItem>
                    <SelectItem value="weekly">{tt('notifications.weekly', 'Weekly')}</SelectItem>
                    <SelectItem value="monthly">{tt('notifications.monthly', 'Monthly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg bg-sky-950/30 border border-sky-500/20">
                <Mail className="h-4 w-4 text-sky-300" />
                <div className="text-xs">
                  <div className="font-medium text-slate-200">{tt('common.email', 'Email')}: {notificationSettings.email.address}</div>
                  <div className="text-slate-400">{tt('notifications.emailAddress', 'Notification email address')}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Clock className="h-5 w-5 mr-2" />
            {t('common.reports')} ({recentReports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <div>
                      <div className="font-medium text-sm">{report.name}</div>
                      <div className="text-xs text-slate-400">Last run: {report.lastRun} • Created by: {report.createdBy}</div>
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
                        <HeartOff className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <FileText className="h-12 w-12 mx-auto mb-3 text-slate-600" />
              <p>{t('common.noData')}</p>
              <p className="text-sm">{t('settings.description')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Favorite Reports */}
        <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
          <CardHeader>
            <CardTitle className="flex items-center font-sf-pro">
              <Star className="h-5 w-5 mr-2" />
              {t('settings.tabs.reports')} ({favoriteReports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favoriteReports.length > 0 ? (
              <div className="space-y-2">
                {favoriteReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-white/10">
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
                        aria-label="unfavorite"
                      >
                        <HeartOff className="h-3 w-3 text-slate-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <Star className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm">{t('common.noData')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Storage Management */}
        <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
          <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <HardDrive className="h-5 w-5 mr-2" />
            {tt('dataManagement.storageUsage', 'Storage usage')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{tt('dataManagement.storageUsage', 'Storage usage')}</span>
              <span>
                {storageInfo.used} / {storageInfo.total}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-mokm-orange-500 to-mokm-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${storageInfo.percentage}%` }}
                ></div>
              </div>
          </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">{t('common.reports')}</span>
                <Badge variant="outline">{reports.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{t('common.reports')}</span>
                <Badge variant="outline">{recentReports.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{t('common.reports')}</span>
                <Badge variant="outline">{favoriteReports.length}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Button onClick={handleClearReportCache} variant="outline" size="sm" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                {tt('dataManagement.clearAllButton', 'Clear all')}
              </Button>
              <Button onClick={clearOldReports} variant="outline" size="sm" className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                {t('common.delete')} ({settings.retentionDays} {tt('common.days', 'days')}+)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Settings */}
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Settings className="h-5 w-5 mr-2" />
            {t('settings.tabs.reports')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-generate" className="text-sm font-medium">{tt('common.automatic', 'Automatic')}</Label>
                <Switch
                  id="auto-generate"
                  checked={settings.autoGenerate}
                  onCheckedChange={(checked) => saveSettings({ ...settings, autoGenerate: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-reports" className="text-sm font-medium">{tt('notifications.emailNotifications', 'Email notifications')}</Label>
                <Switch
                  id="email-reports"
                  checked={settings.emailReports}
                  onCheckedChange={(checked) => saveSettings({ ...settings, emailReports: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="compression" className="text-sm font-medium">{tt('mobile.backgroundSync', 'Background sync')}</Label>
                <Switch
                  id="compression"
                  checked={settings.compressionEnabled}
                  onCheckedChange={(checked) => saveSettings({ ...settings, compressionEnabled: checked })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{tt('notifications.digestFrequency', 'Digest frequency')}</Label>
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
                <Label className="text-sm font-medium">{tt('common.format', 'Format')}</Label>
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
                <Label className="text-sm font-medium">{tt('dataManagement.storageUsage', 'Storage usage')}</Label>
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
