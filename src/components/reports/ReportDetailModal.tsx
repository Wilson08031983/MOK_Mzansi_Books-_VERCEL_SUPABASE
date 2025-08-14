import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PlayCircle,
  Download,
  Calendar,
  Star,
  Clock,
  User,
  FileBarChart,
  Settings,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import type { Report } from '../../pages/Reports';
import { reportsDataService } from '../../services/reportsDataService';
import { pdfReportService } from '../../services/pdfReportService';
import { reportGenerationService } from '../../services/reportGenerationService';
import { useLocalization } from '@/hooks/useLocalization';

interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
  onReportUpdated: (report: Report) => void;
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    financial: 'bg-blue-100 text-blue-800',
    sales: 'bg-green-100 text-green-800',
    client: 'bg-purple-100 text-purple-800',
    invoice: 'bg-yellow-100 text-yellow-800',
    expense: 'bg-red-100 text-red-800',
    project: 'bg-indigo-100 text-indigo-800',
    hr: 'bg-pink-100 text-pink-800',
    document: 'bg-slate-100 text-slate-800',
    system: 'bg-gray-100 text-gray-800',
    custom: 'bg-orange-100 text-orange-800',
  };
  
  return colors[category] || 'bg-gray-100 text-gray-800';
};

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  isOpen,
  onClose,
  report,
  onReportUpdated
}) => {
  const { t } = useLocalization();
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!report) return null;

  const handleExecuteReport = async () => {
    setIsExecuting(true);
    try {
      console.log('🚀 [REPORT DETAIL] Executing report:', report.id);
      
      // Generate report data with proper type casting
      const reportType = report.id.startsWith('sys-') ? report.id.replace('sys-', '') as any : 'expense-summary';
      const defaultFilters = {
        dateRange: 'all',
        startDate: '',
        endDate: '',
        status: 'all',
        category: 'all',
        paymentMethod: 'all',
        project: 'all',
        taxType: 'all',
        amountMin: '0',
        amountMax: '1000000'
      };
      const reportData = await reportGenerationService.generateReport(
        reportType,
        defaultFilters
      );

      // Execute through service
      await reportsDataService.executeReport(report.id);
      
      // Update the report with new last run date
      const updatedReports = reportsDataService.getReports();
      const updatedReport = updatedReports.find(r => r.id === report.id);
      
      if (updatedReport) {
        onReportUpdated(updatedReport);
      }

      toast.success('Report executed successfully!');
      console.log('✅ [REPORT DETAIL] Report executed:', reportData);
      
    } catch (error) {
      console.error('❌ [REPORT DETAIL] Error executing report:', error);
      toast.error('Failed to execute report');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      console.log('📄 [REPORT DETAIL] Downloading report:', report.id);
      
      // Generate report data with proper filters
      const defaultFilters = {
        dateRange: 'all',
        startDate: '',
        endDate: '',
        status: 'all',
        category: 'all',
        paymentMethod: 'all',
        project: 'all',
        taxType: 'all',
        amountMin: '0',
        amountMax: '1000000'
      };
      
      const reportType = report.id.startsWith('sys-') ? report.id.replace('sys-', '') as any : 'expense-summary';
      const reportData = await reportGenerationService.generateReport(
        reportType,
        defaultFilters
      );

      // Generate PDF using the correct method name
      await pdfReportService.downloadReport(
        reportData,
        reportType,
        defaultFilters
      );

      toast.success('Report downloaded successfully!');
      
    } catch (error) {
      console.error('❌ [REPORT DETAIL] Error downloading report:', error);
      toast.error('Failed to download report');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleToggleFavorite = () => {
    try {
      reportsDataService.toggleFavorite(report.id);
      
      // Get updated report
      const updatedReports = reportsDataService.getReports();
      const updatedReport = updatedReports.find(r => r.id === report.id);
      
      if (updatedReport) {
        onReportUpdated(updatedReport);
      }

      toast.success(
        updatedReport?.isFavorite ? 'Added to favorites' : 'Removed from favorites'
      );
      
    } catch (error) {
      console.error('❌ [REPORT DETAIL] Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getCategoryColor(report.category)}>
                  {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                </Badge>
                {report.lastRun && (
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Last run: {report.lastRun}
                  </div>
                )}
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {report.name}
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                {report.description}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className="text-gray-500 hover:text-yellow-500"
            >
              <Star 
                className={`h-5 w-5 ${report.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} 
              />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">{t('common.overview')}</TabsTrigger>
            <TabsTrigger value="settings">{t('common.settings')}</TabsTrigger>
            <TabsTrigger value="history">{t('common.history')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">{t('common.reportDetails')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Created By:</span>
                    <div className="flex items-center text-sm">
                      <User className="h-3 w-3 mr-1" />
                      {report.createdBy}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Created:</span>
                    <span className="text-sm">{report.createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Type:</span>
                    <span className="text-sm">
                      {report.id.startsWith('sys-') ? 'System Report' : 'Custom Report'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleExecuteReport}
                    disabled={isExecuting}
                    className="w-full bg-mokm-purple-500 hover:bg-mokm-purple-600 text-white"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    {isExecuting ? 'Running...' : 'Run Report'}
                  </Button>
                  
                  <Button
                    onClick={handleDownloadReport}
                    disabled={isDownloading}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isDownloading ? 'Downloading...' : 'Download PDF'}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    disabled
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Report
                  </Button>
                </CardContent>
              </Card>
            </div>

            {report.tags && report.tags.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {report.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <FileBarChart className="h-4 w-4 mr-2" />
                  Report Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileBarChart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Run the report to see preview data</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Report Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Report settings and configuration options</p>
                  <p className="text-xs text-gray-400 mt-1">Coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-4 w-4 mr-2" />
                  Execution History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No execution history available</p>
                  <p className="text-xs text-gray-400 mt-1">Run the report to see execution history</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDetailModal;
