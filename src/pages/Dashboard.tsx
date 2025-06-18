
import { useState, useEffect } from 'react';
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
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';

// Define TypeScript types
type StatItem = {
  name: string;
  value?: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ElementType;
  color: string;
  bgGradient: string;
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

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState('month');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Get data from our custom hook
  const { invoices, expenses, clients, quotations, loading } = useDashboardData();

  // State for computed data
  const [stats, setStats] = useState<StatItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [revenueData, setRevenueData] = useState<{ label: string; value: number }[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<{ label: string; value: number }[]>([]);
  const [notifications, setNotifications] = useState<{id: string; title: string; message: string; date: string; read: boolean}[]>([]);

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
      
      // Set stats with real values and MOKMzansiBooks brand colors
      setStats([
        { 
          name: 'Total Revenue', 
          value: formatCurrency(totalRevenue), 
          change: '+8.2%', 
          trend: 'up', 
          icon: DollarSign, 
          color: 'text-mokm-orange-600',
          bgGradient: 'from-mokm-orange-500 to-mokm-pink-500'
        },
        { 
          name: 'Active Clients', 
          value: formatNumber(clientCount), 
          change: '+12', 
          trend: 'up', 
          icon: Users, 
          color: 'text-mokm-blue-600',
          bgGradient: 'from-mokm-blue-500 to-mokm-purple-500'
        },
        { 
          name: 'Pending Invoices', 
          value: formatNumber(invoices.filter(i => i.status === 'sent').length), 
          change: formatCurrency(invoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.total, 0)), 
          trend: 'up', 
          icon: FileText, 
          color: 'text-mokm-purple-600',
          bgGradient: 'from-mokm-purple-500 to-mokm-pink-500'
        },
        { 
          name: 'Monthly Growth', 
          value: '12.5%', 
          change: '+2.1%', 
          trend: 'up', 
          icon: TrendingUp, 
          color: 'text-mokm-pink-600',
          bgGradient: 'from-mokm-pink-500 to-mokm-orange-500'
        }
      ]);

      // Generate recent activities
      const recentInvoices = invoices.slice(0, 2).map(invoice => ({
        id: invoice.id,
        type: 'invoice' as const,
        action: 'created invoice',
        subject: `${invoice.invoiceNumber} for ${invoice.clientName}`,
        date: formatDate(invoice.createdAt),
        user: 'You'
      }));
      
      const recentClients = clients.slice(0, 2).map(client => ({
        id: client.id,
        type: 'client' as const,
        action: 'added client',
        subject: client.name,
        date: formatDate(client.createdAt),
        user: 'You'
      }));
      
      setActivities([...recentInvoices, ...recentClients]);

      // Generate tasks from overdue invoices
      const overdueTasks = invoices
        .filter(invoice => invoice.status === 'sent')
        .map(invoice => ({
          id: invoice.id,
          title: `Follow up on ${invoice.invoiceNumber} - ${invoice.clientName}`,
          dueDate: formatDate(invoice.dueDate),
          priority: 'high' as const
        }));
        
      setTasks(overdueTasks);

      // Generate revenue chart data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const revenueByMonth = months.map(month => ({
        label: month,
        value: Math.floor(Math.random() * 50000) + 10000
      }));
      setRevenueData(revenueByMonth);

      // Generate expense breakdown
      const categories = [
        { label: 'Office', value: 12000 },
        { label: 'Travel', value: 8500 },
        { label: 'Meals', value: 4200 },
        { label: 'Software', value: 6800 },
        { label: 'Other', value: 3500 }
      ];
      setExpensesByCategory(categories);

      // Generate notifications
      setNotifications([
        {
          id: '1',
          title: 'New invoice payment',
          message: 'Payment received for INV-001',
          date: formatDate(new Date().toISOString()),
          read: false
        },
        {
          id: '2',
          title: 'Quotation viewed',
          message: 'ABC Corp viewed your quotation',
          date: formatDate(new Date(Date.now() - 86400000).toISOString()),
          read: true
        }
      ]);
    }
  }, [loading, invoices, expenses, clients, quotations, period]);

  if (loading) {
    return <DashboardLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex relative overflow-hidden">
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
          expensesByCategory={expensesByCategory}
        />
      </div>

      {/* Sidebar Overlay */}
      <DashboardSidebarOverlay 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
    </div>
  );
};

export default Dashboard;
