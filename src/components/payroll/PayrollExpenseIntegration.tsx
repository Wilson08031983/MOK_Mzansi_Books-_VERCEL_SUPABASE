import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, DollarSign, Users, AlertCircle, CheckCircle, XCircle, Play, Settings, RefreshCw, Activity } from 'lucide-react';
import PayrollExpenseIntegrationService, { MonthlyAutomationLog, ProjectSalaryExpense } from '@/services/payrollExpenseIntegrationService';
import { Project } from '@/types/project';
import { useLocalization } from '@/hooks/useLocalization';

interface PayrollExpenseIntegrationProps {
  companyId: string;
}

const PayrollExpenseIntegration: React.FC<PayrollExpenseIntegrationProps> = ({ companyId }) => {
  const { t } = useLocalization();
  const [integrationService] = useState(() => PayrollExpenseIntegrationService.getInstance());
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [automationLogs, setAutomationLogs] = useState<MonthlyAutomationLog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectSalaryBreakdown, setProjectSalaryBreakdown] = useState<any>(null);
  const [isRunningManualAutomation, setIsRunningManualAutomation] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const loadData = () => {
    // Load automation status
    setAutomationEnabled(integrationService.isAutomationEnabled());
    
    // Load automation logs
    setAutomationLogs(integrationService.getAutomationLogs());
    
    // Load projects
    try {
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        setProjects(parsedProjects.filter((p: Project) => p.assignedEmployees && p.assignedEmployees.length > 0));
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleAutomationToggle = (enabled: boolean) => {
    integrationService.setAutomationEnabled(enabled);
    setAutomationEnabled(enabled);
  };

  const handleManualAutomation = async () => {
    setIsRunningManualAutomation(true);
    try {
      const now = new Date();
      const result = await integrationService.triggerManualAutomation(now.getMonth() + 1, now.getFullYear());
      console.log('Manual automation result:', result);
      
      // Refresh data
      setRefreshKey(prev => prev + 1);
      
      alert(`Manual automation completed!\n\nProcessed: ${result.projectsProcessed} projects\nGenerated: ${result.expensesGenerated} expenses\nTotal Amount: R${result.totalAmount.toFixed(2)}\nStatus: ${result.status}`);
    } catch (error) {
      console.error('Error running manual automation:', error);
      alert('Error running manual automation. Please check the console for details.');
    } finally {
      setIsRunningManualAutomation(false);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    const breakdown = integrationService.getProjectSalaryBreakdown(project.id);
    setProjectSalaryBreakdown(breakdown);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      success: 'default',
      partial: 'secondary',
      failed: 'destructive'
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sf-pro">Payroll Expense Integration</h2>
          <p className="text-slate-600 font-sf-pro mt-1">
            Automated system linking employee salaries to project expenses
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge 
            variant="outline" 
            className={`${automationEnabled ? 'bg-green-500' : 'bg-gray-500'} text-white border-0`}
          >
            {automationEnabled ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
            {automationEnabled ? 'Active' : 'Paused'}
          </Badge>
        </div>
      </div>

      {/* Automation Controls */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="font-sf-pro flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium font-sf-pro">Monthly Automation</h3>
              <p className="text-sm text-slate-600 font-sf-pro">
                Automatically generate salary expenses on the 1st of each month
              </p>
            </div>
            <Switch 
              checked={automationEnabled} 
              onCheckedChange={handleAutomationToggle}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium text-slate-600 font-sf-pro">Last Run</p>
              <p className="text-sm font-sf-pro">
                {automationLogs.length > 0
                  ? formatDate(automationLogs[automationLogs.length - 1].executionDate)
                  : 'Never'
                }
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 font-sf-pro">Next Run</p>
              <p className="text-sm font-sf-pro">
                {automationEnabled ? '1st of next month' : 'Disabled'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                      <SelectItem key={index + 1} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleManualAutomation}
                disabled={isRunningManualAutomation}
                variant="outline"
                className="font-sf-pro w-full"
              >
                {isRunningManualAutomation ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isRunningManualAutomation ? 'Running...' : 'Run Manual Sync'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {automationEnabled
            ? 'Automation is enabled. Salary expenses will be automatically generated on the 1st of each month for active projects.'
            : 'Automation is disabled. Salary expenses will not be automatically generated.'}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('common.overview')}</TabsTrigger>
          <TabsTrigger value="projects">{t('common.projectBreakdown')}</TabsTrigger>
          <TabsTrigger value="automation">{t('common.automationLogs')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 font-sf-pro">{t('common.totalSalaryExpenses')}</p>
                    <p className="text-2xl font-bold text-green-600 font-sf-pro">
                      {formatCurrency(
                        projects.reduce((total, project) => total + (project.salaryExpenses || 0), 0)
                      )}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 font-sf-pro">Active Projects</p>
                    <p className="text-2xl font-bold text-blue-600 font-sf-pro">{projects.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 font-sf-pro">Team Members</p>
                    <p className="text-2xl font-bold text-purple-600 font-sf-pro">
                      {projects.reduce((total, project) => total + (project.assignedEmployees?.length || 0), 0)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 font-sf-pro">Last Status</p>
                    <div className="text-lg font-bold font-sf-pro">
                      {automationLogs.length > 0 ? (
                        <Badge className={`${getStatusIcon(automationLogs[automationLogs.length - 1].status) ? 'bg-green-500' : 'bg-red-500'} text-white border-0`}>
                          {getStatusIcon(automationLogs[automationLogs.length - 1].status)}
                          {automationLogs[automationLogs.length - 1].status}
                        </Badge>
                      ) : (
                        <span>Never</span>
                      )}
                    </div>
                  </div>
                  <Activity className="h-8 w-8 text-gray-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Projects with Salary Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-600">{project.code} • {project.assignedEmployees?.length || 0} team members</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(project.salaryExpenses || 0)}
                      </p>
                      <p className="text-sm text-gray-600">Salary Expenses</p>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No projects with assigned employees found.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Breakdown Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project List */}
            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
              <CardHeader>
                <CardTitle className="font-sf-pro">Select Project</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedProject?.id === project.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleProjectSelect(project)}
                    >
                      <h4 className="font-medium text-gray-900 font-sf-pro">{project.name}</h4>
                      <p className="text-sm text-gray-600 font-sf-pro">
                        {project.code} • {project.assignedEmployees?.length || 0} employees
                      </p>
                      <p className="text-sm font-medium text-green-600 font-sf-pro">
                        {formatCurrency(project.salaryExpenses || 0)} salary expenses
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
              <CardHeader>
                <CardTitle className="font-sf-pro">
                  {selectedProject ? `${selectedProject.name} Breakdown` : 'Select a Project'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedProject && projectSalaryBreakdown ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 font-sf-pro">Total Salary Expenses</p>
                        <p className="text-lg font-bold text-gray-900 font-sf-pro">
                          {formatCurrency(projectSalaryBreakdown.totalSalaryExpenses)}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 font-sf-pro">Team Members</p>
                        <p className="text-lg font-bold text-gray-900 font-sf-pro">
                          {projectSalaryBreakdown.employeeBreakdown.length}
                        </p>
                      </div>
                    </div>

                    {/* Monthly Breakdown */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 font-sf-pro">Monthly Breakdown</h5>
                      <div className="space-y-2">
                        {projectSalaryBreakdown.monthlyBreakdown.map((month: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 border rounded">
                            <span className="text-sm text-gray-600 font-sf-pro">{month.month}</span>
                            <div className="text-right">
                              <span className="font-medium font-sf-pro">{formatCurrency(month.amount)}</span>
                              <span className="text-xs text-gray-500 ml-2 font-sf-pro">({month.employeeCount} employees)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Employee Breakdown */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 font-sf-pro">Employee Breakdown</h5>
                      <div className="space-y-2">
                        {projectSalaryBreakdown.employeeBreakdown.map((employee: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 border rounded">
                            <span className="text-sm text-gray-600 font-sf-pro">{employee.employeeName}</span>
                            <div className="text-right">
                              <span className="font-medium font-sf-pro">{formatCurrency(employee.totalAmount)}</span>
                              <span className="text-xs text-gray-500 ml-2 font-sf-pro">({employee.months} months)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8 font-sf-pro">
                    Select a project to view salary expense breakdown
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automation Logs Tab */}
        <TabsContent value="automation" className="space-y-4">
          <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro">Automation Execution Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {automationLogs.length > 0 ? (
                  automationLogs
                    .slice()
                    .reverse()
                    .map((log) => (
                      <div key={log.id} className="border rounded-lg p-4 bg-white/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(log.status)}
                            <span className="font-medium text-gray-900 font-sf-pro">
                              {log.month}/{log.year} Automation
                            </span>
                            {getStatusBadge(log.status)}
                          </div>
                          <span className="text-sm text-gray-600 font-sf-pro">
                            {formatDate(log.executionDate)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-600 font-sf-pro">Projects Processed</p>
                            <p className="font-medium font-sf-pro">{log.projectsProcessed}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-sf-pro">Expenses Generated</p>
                            <p className="font-medium font-sf-pro">{log.expensesGenerated}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-sf-pro">Total Amount</p>
                            <p className="font-medium font-sf-pro">{formatCurrency(log.totalAmount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-sf-pro">Status</p>
                            <p className="font-medium capitalize font-sf-pro">{log.status}</p>
                          </div>
                        </div>
                        
                        {log.errors.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-red-600 mb-1 font-sf-pro">Errors:</p>
                            <div className="space-y-1">
                              {log.errors.map((error, index) => (
                                <p key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded font-sf-pro">
                                  {error}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 text-center py-8 font-sf-pro">
                    {t('common.noAutomationLogs')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollExpenseIntegration;