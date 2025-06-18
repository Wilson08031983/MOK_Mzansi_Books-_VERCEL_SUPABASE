
import React from 'react';
import QuickActions from '@/components/QuickActions';
import RevenueChart from '@/components/RevenueChart';
import ExpenseBreakdown from '@/components/ExpenseBreakdown';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import StatsGrid from '@/components/dashboard/StatsGrid';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import TaskList from '@/components/dashboard/TaskList';

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

interface DashboardContentProps {
  period: string;
  setPeriod: (period: string) => void;
  stats: StatItem[];
  activities: ActivityItem[];
  tasks: TaskItem[];
  revenueData: { label: string; value: number }[];
  expensesByCategory: { label: string; value: number }[];
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  period,
  setPeriod,
  stats,
  activities,
  tasks,
  revenueData,
  expensesByCategory
}) => {
  return (
    <main className="p-8">
      {/* Welcome Message and Controls */}
      <WelcomeSection period={period} setPeriod={setPeriod} />

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Quick Actions */}
      <div className="mb-10 animate-fade-in delay-400">
        <h3 className="text-2xl font-bold text-slate-900 mb-6 font-sf-pro">Quick Actions</h3>
        <QuickActions />
      </div>

      {/* Charts and Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 animate-fade-in delay-500">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>
        <div>
          <ExpenseBreakdown data={expensesByCategory} />
        </div>
      </div>

      {/* Recent Activity and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in delay-600">
        <ActivityFeed activities={activities} />
        <TaskList tasks={tasks} />
      </div>
    </main>
  );
};

export default DashboardContent;
