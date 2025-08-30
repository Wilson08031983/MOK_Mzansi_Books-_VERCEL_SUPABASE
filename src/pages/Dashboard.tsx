import { useState, useEffect, useContext, useCallback } from 'react';
import { 
  DollarSign, 
  Users, 
  FileText, 
  TrendingUp
} from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardBackground from '@/components/dashboard/DashboardBackground';
import DashboardLoadingScreen from '@/components/dashboard/DashboardLoadingScreen';
import DashboardSidebarOverlay from '@/components/dashboard/DashboardSidebarOverlay';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';
import { getNotifications } from '@/services/notificationService';
import bankStatementService from '@/services/bankStatementService';
import ExpenseCategorizationService from '@/services/expenseCategorizationService';
import { useAuth } from '@/hooks/useAuthHook';
import { startOfWeek, endOfWeek, subMonths, format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useUserTracking } from '@/hooks/useUserTracking';

// Define TypeScript types
type StatItem = {
  name: string;
  value?: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ElementType;
  color?: string;
  bgColor?: string;
  route?: string;
};

type ActivityItem = {
  id: number | string;
  type: 'client' | 'quotation' | 'invoice' | 'user';
  action: string;
  subject: string;
  date: string;
  user: string;
};

type TaskItem = {
  id: number | string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
};

// General dashboard task (not tied to Projects)
type GeneralTask = {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  dueDate?: string; // ISO string (yyyy-MM-dd)
  subtasks?: string[];
  attachments?: string[]; // URLs for now
  category?: string; // e.g., Accounting, HR, Inventory, Sales, General
};

const Dashboard: React.FC = () => {
  const { 
    t, 
    formatCurrency: localizeCurrency, 
    formatNumber: localizeNumber, 
    formatDate: localizeDate,
    formatTime: localizeTime,
    formatDateTime: localizeDateTime,
    getTimezoneDisplayName
  } = useLocalization();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Sync sidebar visibility with localStorage hideSidebar setting
  useEffect(() => {
    // Get hideSidebar setting from localStorage
    try {
      const appSettings = localStorage.getItem('app.settings');
      if (appSettings) {
        const settings = JSON.parse(appSettings);
        const hideSidebar = settings?.layout?.hideSidebar;
        
        // If hideSidebar is true and on mobile, ensure sidebar is closed
        if (hideSidebar === true && window.innerWidth < 1024) {
          setSidebarOpen(false);
        }
      }
    } catch (error) {
      console.error('Error reading sidebar settings:', error);
    }
    
    // Listen for changes to hideSidebar setting
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'app.settings' && event.newValue) {
        try {
          const settings = JSON.parse(event.newValue);
          const hideSidebar = settings?.layout?.hideSidebar;
          
          // Only auto-hide on mobile devices
          if (hideSidebar === true && window.innerWidth < 1024) {
            setSidebarOpen(false);
          }
        } catch (error) {
          console.error('Error parsing storage change:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const [period, setPeriod] = useState('month');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Get authenticated user and activity service
  const { user } = useAuth();
  useUserTracking(user || null);
  
  // Initialize activity service
  const activityService = {
    logActivity: async (activity: { type: string; action: string; details: string }) => {
      console.log('Activity logged:', activity);
      // In a real app, this would save to a database
      return { success: true };
    },
    logTaskAction: async (taskId: string, action: string, details: Record<string, any> = {}) => {
      console.log(`Task action logged - Task ID: ${taskId}, Action: ${action}`, details);
      // In a real app, this would save to a database
      return { success: true };
    }
  };

  // State for the new task modal
  // Task management state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [savedTasks, setSavedTasks] = useState<GeneralTask[]>([]);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    assignee: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
    dueDate: string; // yyyy-MM-dd
    category: string;
    subtasksText: string; // textarea input, one per line
    attachmentsText: string; // comma or newline separated URLs
  }>({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    status: 'not_started',
    dueDate: '',
    category: 'General',
    subtasksText: '',
    attachmentsText: ''
  });

  // Derive companyId similar to Accounting page
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
  const [companyId] = useState<string>(getCompanyId());

  // Load saved dashboard tasks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dashboardTasks');
      if (stored) {
        const parsed: GeneralTask[] = JSON.parse(stored);
        if (Array.isArray(parsed)) setSavedTasks(parsed);
      }
    } catch (e) {
      console.error('Failed to parse saved dashboard tasks:', e);
    }
  }, []);

  // Get data from our custom hook
  const { invoices, expenses, clients, quotations, loading } = useDashboardData();

  // State for computed data
  const [stats, setStats] = useState<StatItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [revenueData, setRevenueData] = useState<{ label: string; value: number }[]>([]);
  const [expensesSeriesData, setExpensesSeriesData] = useState<{ label: string; value: number }[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<{ label: string; value: number }[]>([]);
  const [notifications, setNotifications] = useState<{id: string; title: string; message: string; date: string; read: boolean}[]>([]);

  // Load notifications from service on mount and keep in sync with storage changes
  useEffect(() => {
    setNotifications(getNotifications());

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'notifications') {
        setNotifications(getNotifications());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Process data when dependencies change
  useEffect(() => {
    if (!loading) {
      // Calculate stats from real data
      const totalRevenue = invoices
        .filter(invoice => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + invoice.total, 0);
        
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      const clientCount = clients.length;
      const quotationCount = quotations.length;
      
      // Define stats data with proper typing and localization
      const computedStats: StatItem[] = [
        {
          name: t('dashboard.stats.totalRevenue'),
          value: localizeCurrency(totalRevenue || 0),
          change: '+12%',
          trend: 'up' as const,
          icon: DollarSign,
          color: 'text-success',
          bgColor: 'bg-success/10',
          route: '/accounting'
        },
        {
          name: t('dashboard.stats.activeProjects'),
          value: localizeNumber(quotationCount || 0),
          change: '+3',
          trend: 'up' as const,
          icon: FileText,
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          route: '/quotations'
        },
        {
          name: t('dashboard.stats.pendingInvoices'),
          value: localizeNumber(invoices.filter(inv => inv.status !== 'paid').length || 0),
          change: '-2',
          trend: 'down' as const,
          icon: FileText,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          route: '/invoices'
        },
        {
          name: t('dashboard.stats.totalClients'),
          value: localizeNumber(clientCount || 0),
          change: '+5',
          trend: 'up' as const,
          icon: Users,
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          route: '/clients'
        }
      ];

      // Update state with computed stats
      setStats(computedStats);

      // Generate recent activities
      const recentInvoices = invoices.slice(0, 2).map(invoice => ({
        id: `invoice-${invoice.id}`,
        type: 'invoice' as const,
        action: 'created invoice',
        subject: `${invoice.invoiceNumber} for ${invoice.clientName}`,
        date: formatDate(invoice.createdAt),
        user: 'You'
      }));
      
      const recentClients = clients.slice(0, 2).map(client => ({
        id: `client-${client.id}`,
        type: 'client' as const,
        action: 'added client',
        subject: client.name,
        date: formatDate(client.createdAt),
        user: 'You'
      }));
      
      setActivities([...recentInvoices, ...recentClients]);

      // Generate tasks: combine saved dashboard tasks with overdue invoice follow-ups
      const overdueTasks = invoices
        .filter(invoice => invoice.status === 'sent')
        .map(invoice => ({
          id: `task-${invoice.id}`,
          title: `Follow up on ${invoice.invoiceNumber} - ${invoice.clientName}`,
          dueDate: formatDate(invoice.dueDate),
          priority: 'high' as const
        }));

      const mappedSavedTasks: TaskItem[] = savedTasks.map(t => ({
        id: `saved-${t.id}`,
        title: t.title,
        dueDate: t.dueDate ? formatDate(t.dueDate) : '—',
        priority: (t.priority === 'critical' ? 'high' : t.priority) as 'high' | 'medium' | 'low'
      }));
        
      setTasks([...mappedSavedTasks, ...overdueTasks]);

      // Generate monthly series for last 6 months (Revenue and Expenses)
      const now = new Date();
      const months = Array.from({ length: 6 }, (_, idx) => subMonths(now, 5 - idx));
      const monthKeys = months.map(d => format(d, 'yyyy-MM'));
      const monthLabels = months.map(d => format(d, 'MMM'));

      // Initialize maps
      const revenueMap: Record<string, number> = Object.fromEntries(monthKeys.map(k => [k, 0]));
      const expensesMap: Record<string, number> = Object.fromEntries(monthKeys.map(k => [k, 0]));

      // Aggregate revenue by invoice month (use invoiceDate if available, else date/createdAt)
      invoices
        .filter(inv => inv.status === 'paid')
        .forEach(inv => {
          const dateStr = inv.invoiceDate || inv.date || inv.createdAt;
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            const key = format(d, 'yyyy-MM');
            if (revenueMap[key] !== undefined) {
              revenueMap[key] += inv.total || 0;
            }
          }
        });

      // Aggregate manual expenses by month
      expenses.forEach(exp => {
        const d = new Date(exp.date);
        if (!isNaN(d.getTime())) {
          const key = format(d, 'yyyy-MM');
          if (expensesMap[key] !== undefined) {
            expensesMap[key] += exp.amount || 0;
          }
        }
      });

      // Aggregate bank statement categorized expenses by month for this company
      try {
        const bsExpenses = bankStatementService.getExpenses(companyId);
        bsExpenses.forEach(exp => {
          const d = new Date(exp.date);
          if (!isNaN(d.getTime())) {
            const key = format(d, 'yyyy-MM');
            if (expensesMap[key] !== undefined) {
              expensesMap[key] += exp.amount || 0;
            }
          }
        });
      } catch (e) {
        console.error('Failed to aggregate bank statement expenses for series:', e);
      }

      // Build datasets in display order
      const seriesRevenue = monthKeys.map((k, i) => ({ label: monthLabels[i], value: revenueMap[k] }));
      const seriesExpenses = monthKeys.map((k, i) => ({ label: monthLabels[i], value: expensesMap[k] }));

      setRevenueData(seriesRevenue);
      setExpensesSeriesData(seriesExpenses);

      // Helper: get date range for current period selection
      const getPeriodRange = (p: string): { start: Date; end: Date } => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      
        if (p === 'today') {
          return { start: todayStart, end: todayEnd };
        }
        if (p === 'week') {
          // Week starts on Monday
          const start = startOfWeek(now, { weekStartsOn: 1 });
          const end = endOfWeek(now, { weekStartsOn: 1 });
          // Normalize to full-day boundaries
          const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
          const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
          return { start: startDay, end: endDay };
        }
        if (p === 'month') {
          const startDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
          const endDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          return { start: startDay, end: endDay };
        }
        if (p === 'year') {
          const startDay = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
          const endDay = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
          return { start: startDay, end: endDay };
        }
        return { start: todayStart, end: todayEnd };
      };
      // Generate expense breakdown from real data (manual + bank statement expenses)
      try {
        // Compute selected period range and predicate
        const { start, end } = getPeriodRange(period);
        const inRange = (dateStr: string): boolean => {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return false;
          return d >= start && d <= end;
        };
      
        // 1) Aggregate manual expenses by display label (filtered by period)
        const manualAgg: Record<string, number> = {};
        const filteredManual = expenses.filter(exp => inRange(exp.date));
        filteredManual.forEach(exp => {
          const label = (() => {
            const normalized = (exp.category || '').toLowerCase();
            if (normalized.includes('office')) return 'Office';
            if (normalized.includes('travel') || normalized.includes('transport')) return 'Travel';
            if (normalized.includes('meal') || normalized.includes('entertain')) return 'Meals';
            if (normalized.includes('software') || normalized.includes('subscription') || normalized.includes('it')) return 'Software';
            return 'Other';
          })();
          manualAgg[label] = (manualAgg[label] || 0) + (exp.amount || 0);
        });
      
        // 2) Aggregate bank statement categorized expenses for this company (filtered by period)
        const bsExpenses = bankStatementService.getExpenses(companyId);
        const bsAgg: Record<string, number> = {};
        const filteredBs = bsExpenses.filter(exp => inRange(exp.date));
        filteredBs.forEach(exp => {
          const displayName = ExpenseCategorizationService.getCategoryDisplayName(exp.category);
          const label = (() => {
            const name = displayName.toLowerCase();
            if (name.includes('operating') || name.includes('office')) return 'Office';
            if (name.includes('travel') || name.includes('transport')) return 'Travel';
            if (name.includes('training') || name.includes('meals') || name.includes('entertainment')) return 'Meals';
            if (name.includes('it') || name.includes('software') || name.includes('subscriptions')) return 'Software';
            return 'Other';
          })();
          bsAgg[label] = (bsAgg[label] || 0) + (exp.amount || 0);
        });
      
        // 3) Merge aggregations into final five buckets expected by chart
        const labels = ['Office', 'Travel', 'Meals', 'Software', 'Other'];
        const merged = labels.map(label => ({
          label,
          value: (manualAgg[label] || 0) + (bsAgg[label] || 0)
        }));
      
        // 4) Filter out empty categories but keep structure (show at least one if all zero)
        const nonZero = merged.filter(item => item.value > 0);
        setExpensesByCategory(nonZero.length > 0 ? nonZero : merged);
      } catch (e) {
        console.error('Failed to aggregate expense breakdown:', e);
      }

      // Removed mock notifications generation; notifications now come from service
    }
  }, [loading, invoices, expenses, clients, quotations, period, savedTasks]);

  if (loading) {
    return <DashboardLoadingScreen />;
  }

  // Handlers for Add Task modal
  const handleNewTaskChange = (field: string, value: string) => {
    setNewTask(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    const toArray = (text: string) => text
      .split(/\r?\n|,/)
      .map(s => s.trim())
      .filter(Boolean);

    const task: GeneralTask = {
      id: `${Date.now()}`,
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      assignee: newTask.assignee.trim() || undefined,
      priority: newTask.priority,
      status: newTask.status,
      dueDate: newTask.dueDate || undefined,
      category: newTask.category || 'General',
      subtasks: toArray(newTask.subtasksText),
      attachments: toArray(newTask.attachmentsText)
    };

    const updated = [task, ...savedTasks];
    setSavedTasks(updated);
    try {
      localStorage.setItem('dashboardTasks', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist dashboardTasks:', e);
    }

    // Log activity
    activityService.logTaskAction(
      'Task created',
      `Created task "${task.title}" in ${task.category} with priority ${task.priority}${task.assignee ? ` assigned to ${task.assignee}` : ''}`,
      task.id,
      {
        taskTitle: task.title,
        category: task.category,
        priority: task.priority,
        assignee: task.assignee,
        dueDate: task.dueDate
      }
    );

    setShowAddTaskModal(false);
    setNewTask({
      title: '',
      description: '',
      assignee: '',
      priority: 'medium',
      status: 'not_started',
      dueDate: '',
      category: 'General',
      subtasksText: '',
      attachmentsText: ''
    });
  };

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Animated Pulsating Balls Background */}
      <DashboardBackground />

      {/* Sidebar */}
      <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 relative z-10">
        {/* Header */}
        <DashboardHeader 
          setSidebarOpen={setSidebarOpen}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          notifications={notifications}
          setNotifications={setNotifications}
        />

        {/* Dashboard Content */}
        <DashboardContent 
          period={period}
          setPeriod={setPeriod}
          stats={stats}
          activities={activities}
          tasks={tasks}
          revenueData={revenueData}
          expensesSeriesData={expensesSeriesData}
          expensesByCategory={expensesByCategory}
          onAddTaskClick={() => setShowAddTaskModal(true)}
        />
      </div>

      {/* Sidebar Overlay */}
      <DashboardSidebarOverlay 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Add Task Modal */}
      <Dialog open={showAddTaskModal} onOpenChange={setShowAddTaskModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-sf-pro dark:text-slate-100">Add New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitNewTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taskTitle" className="font-sf-pro dark:text-slate-200">Title *</Label>
                <Input id="taskTitle" value={newTask.title} onChange={(e) => handleNewTaskChange('title', e.target.value)} placeholder="e.g., Prepare Client Invoice" required />
              </div>
              <div>
                <Label htmlFor="taskAssignee" className="font-sf-pro dark:text-slate-200">Assignee</Label>
                <Input id="taskAssignee" value={newTask.assignee} onChange={(e) => handleNewTaskChange('assignee', e.target.value)} placeholder="e.g., Jane Doe" />
              </div>
              <div>
                <Label className="font-sf-pro dark:text-slate-200">Priority</Label>
                <Select value={newTask.priority} onValueChange={(v) => handleNewTaskChange('priority', v)}>
                  <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-sf-pro dark:text-slate-200">Status</Label>
                <Select value={newTask.status} onValueChange={(v) => handleNewTaskChange('status', v)}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="taskDueDate" className="font-sf-pro dark:text-slate-200">Due Date</Label>
                <Input id="taskDueDate" type="date" value={newTask.dueDate} onChange={(e) => handleNewTaskChange('dueDate', e.target.value)} />
              </div>
              <div>
                <Label className="font-sf-pro dark:text-slate-200">Category/Department</Label>
                <Select value={newTask.category} onValueChange={(v) => handleNewTaskChange('category', v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Accounting">Accounting</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Inventory">Inventory</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Projects">Projects</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="taskDescription" className="font-sf-pro dark:text-slate-200">Description</Label>
              <Textarea id="taskDescription" value={newTask.description} onChange={(e) => handleNewTaskChange('description', e.target.value)} placeholder="Detailed instructions or notes about the task" rows={3} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taskSubtasks" className="font-sf-pro dark:text-slate-200">Subtasks</Label>
                <Textarea id="taskSubtasks" value={newTask.subtasksText} onChange={(e) => handleNewTaskChange('subtasksText', e.target.value)} placeholder="One per line" rows={3} />
              </div>
              <div>
                <Label htmlFor="taskAttachments" className="font-sf-pro dark:text-slate-200">Attachments (URLs)</Label>
                <Textarea id="taskAttachments" value={newTask.attachmentsText} onChange={(e) => handleNewTaskChange('attachmentsText', e.target.value)} placeholder="Paste links, separated by commas or new lines" rows={3} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowAddTaskModal(false)}>Cancel</Button>
              <Button type="submit">Save Task</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
