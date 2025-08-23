
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Users, FileText, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Project } from '@/types/project';
import { useLocalization } from '@/hooks/useLocalization';

interface ProjectsStatsProps {
  projects: Project[];
}

const ProjectsStats: React.FC<ProjectsStatsProps> = ({ projects }) => {
  const { formatCurrency, t } = useLocalization();
  // Force refresh of calculations whenever projects change
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    overdueProjects: 0,
    totalBudget: 0,
    totalExpenses: 0,
    totalProfit: 0
  });
  
  useEffect(() => {
    // Calculate all stats based on current projects
    const totalProjects = projects.length;
    
    const activeProjects = projects.filter(p => 
      p.status === 'In Progress' || p.status === 'Planning'
    ).length;
    
    const completedProjects = projects.filter(p => 
      p.status === 'Completed'
    ).length;
    
    const overdueProjects = projects.filter(p => {
      const endDate = new Date(p.endDate);
      const today = new Date();
      return endDate < today && p.status !== 'Completed';
    }).length;
    
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalExpenses = projects.reduce((sum, p) => sum + (p.expenses || 0), 0);
    const totalProfit = totalBudget - totalExpenses;
    
    // Update the stats state
    setStats({
      totalProjects,
      activeProjects,
      completedProjects,
      overdueProjects,
      totalBudget,
      totalExpenses,
      totalProfit
    });
  }, [projects]); // Re-calculate whenever projects change

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-8 mb-10">
      <Card className="liquid-glass glow-hover border border-white/10 shadow-business hover:shadow-business-lg transition-all duration-500 hover-lift animate-fade-in group">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 font-sf-pro">{t('projects.stats.totalProjects')}</p>
              <div className="mt-3">
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-sf-pro truncate">{stats.totalProjects}</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-mokm-purple-500/10 shadow-colored group-hover:shadow-colored-lg transition-all duration-300 group-hover:scale-110">
              <FileText className="h-7 w-7 text-mokm-purple-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="liquid-glass glow-hover border border-white/10 shadow-business hover:shadow-business-lg transition-all duration-500 hover-lift animate-fade-in group">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 font-sf-pro">{t('projects.stats.active')}</p>
              <div className="mt-3">
                <p className="text-lg font-bold text-blue-600 font-sf-pro truncate">{stats.activeProjects}</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-blue-500/10 shadow-colored group-hover:shadow-colored-lg transition-all duration-300 group-hover:scale-110">
              <Clock className="h-7 w-7 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="liquid-glass glow-hover border border-white/10 shadow-business hover:shadow-business-lg transition-all duration-500 hover-lift animate-fade-in group">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 font-sf-pro">{t('projects.stats.completed')}</p>
              <div className="mt-3">
                <p className="text-lg font-bold text-green-600 font-sf-pro truncate">{stats.completedProjects}</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-green-500/10 shadow-colored group-hover:shadow-colored-lg transition-all duration-300 group-hover:scale-110">
              <Users className="h-7 w-7 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="liquid-glass glow-hover border border-white/10 shadow-business hover:shadow-business-lg transition-all duration-500 hover-lift animate-fade-in group">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 font-sf-pro">{t('projects.stats.overdue')}</p>
              <div className="mt-3">
                <p className="text-lg font-bold text-red-600 font-sf-pro truncate">{stats.overdueProjects}</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-red-500/10 shadow-colored group-hover:shadow-colored-lg transition-all duration-300 group-hover:scale-110">
              <Calendar className="h-7 w-7 text-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="liquid-glass glow-hover border border-white/10 shadow-business hover:shadow-business-lg transition-all duration-500 hover-lift animate-fade-in group">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 font-sf-pro">{t('projects.stats.budget')}</p>
              <div className="mt-3">
                <p className="text-lg font-bold text-mokm-orange-600 font-sf-pro truncate">{formatCurrency(stats.totalBudget)}</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-mokm-orange-500/10 shadow-colored group-hover:shadow-colored-lg transition-all duration-300 group-hover:scale-110">
              <DollarSign className="h-7 w-7 text-mokm-orange-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="liquid-glass glow-hover border border-white/10 shadow-business hover:shadow-business-lg transition-all duration-500 hover-lift animate-fade-in group">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 font-sf-pro">{t('projects.stats.expenses')}</p>
              <div className="mt-3">
                <p className="text-lg font-bold text-mokm-pink-600 font-sf-pro truncate">{formatCurrency(stats.totalExpenses)}</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-mokm-pink-500/10 shadow-colored group-hover:shadow-colored-lg transition-all duration-300 group-hover:scale-110">
              <DollarSign className="h-7 w-7 text-mokm-pink-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="liquid-glass glow-hover border border-white/10 shadow-business hover:shadow-business-lg transition-all duration-500 hover-lift animate-fade-in group">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 font-sf-pro">{t('projects.stats.profit')}</p>
              <div className="mt-3">
                <p className={`text-lg font-bold font-sf-pro truncate ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(stats.totalProfit)}</p>
              </div>
            </div>
            <div className={`p-4 rounded-2xl shadow-colored group-hover:shadow-colored-lg transition-all duration-300 group-hover:scale-110 ${stats.totalProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <DollarSign className={`h-7 w-7 ${stats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsStats;
