
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Users, FileText, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Project } from '@/types/project';

interface ProjectsStatsProps {
  projects: Project[];
}

const ProjectsStats: React.FC<ProjectsStatsProps> = ({ projects }) => {
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
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Projects</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalProjects}</p>
            </div>
            <FileText className="h-8 w-8 text-mokm-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active</p>
              <p className="text-2xl font-bold text-blue-600">{stats.activeProjects}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedProjects}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdueProjects}</p>
            </div>
            <Calendar className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Budget</p>
              <p className="text-2xl font-bold text-mokm-orange-600">R{stats.totalBudget.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-mokm-orange-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Expenses</p>
              <p className="text-2xl font-bold text-mokm-pink-600">R{stats.totalExpenses.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-mokm-pink-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Profit</p>
              <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R{stats.totalProfit.toLocaleString()}
              </p>
            </div>
            <DollarSign className={`h-8 w-8 ${stats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsStats;
