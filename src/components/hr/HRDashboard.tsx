
import React from 'react';
import { 
  Users,
  UserPlus,
  Calendar,
  Gift,
  Briefcase,
  TrendingDown,
  DollarSign,
  UserCheck,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalization } from '@/hooks/useLocalization';

interface HRMetrics {
  totalEmployees: number;
  newHires: number;
  onLeaveToday: number;
  upcomingBirthdays: number;
  openPositions: number;
  turnoverRate: number;
}

interface HRDashboardProps {
  metrics: HRMetrics;
  onAddEmployee?: () => void;
  onApproveLeave?: () => void;
}

const HRDashboard: React.FC<HRDashboardProps> = ({ 
  metrics, 
  onAddEmployee, 
  onApproveLeave
}) => {
  const { t } = useLocalization();
  return (
    <div className="space-y-8">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card className="glass backdrop-blur-md bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shadow-business rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 font-sf-pro">{t('hr.totalEmployees')}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-sf-pro">{metrics.totalEmployees}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-md bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shadow-business rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 font-sf-pro">{t('hr.newHires')}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-sf-pro">{metrics.newHires}</p>
                <p className="text-xs text-green-400 font-sf-pro">{t('hr.thisMonth')}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-green-500 to-mokm-blue-500">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-md bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shadow-business rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 font-sf-pro">{t('hr.onLeaveToday')}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-sf-pro">{metrics.onLeaveToday}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-yellow-500 to-mokm-orange-500">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-md bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shadow-business rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 font-sf-pro">{t('hr.birthdays')}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-sf-pro">{metrics.upcomingBirthdays}</p>
                <p className="text-xs text-mokm-pink-400 font-sf-pro">{t('hr.thisWeek')}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-pink-500 to-mokm-purple-500">
                <Gift className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-md bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shadow-business rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 font-sf-pro">{t('hr.openPositions')}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-sf-pro">{metrics.openPositions}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-md bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shadow-business rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 font-sf-pro">{t('hr.turnoverRate')}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-sf-pro">{metrics.turnoverRate}%</p>
                <p className="text-xs text-green-400 font-sf-pro">{t('hr.belowTarget')}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass backdrop-blur-md bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shadow-business rounded-xl">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-slate-100 font-sf-pro">{t('hr.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={onAddEmployee}
              className="h-20 w-full flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 text-white transition-all duration-200 hover:scale-105 border border-white/10 hover:border-white/20 focus:ring-2 focus:ring-mokm-purple-500/40"
            >
              <UserPlus className="h-6 w-6" />
              <span className="font-sf-pro">{t('hr.addEmployee')}</span>
            </Button>
            <Button 
              onClick={onApproveLeave}
              className="h-20 w-full flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 hover:from-mokm-orange-600 hover:to-mokm-pink-600 text-white transition-all duration-200 hover:scale-105 border border-white/10 hover:border-white/20 focus:ring-2 focus:ring-mokm-purple-500/40"
            >
              <UserCheck className="h-6 w-6" />
              <span className="font-sf-pro">{t('hr.approveLeave')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HRDashboard;
