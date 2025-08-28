
import React from 'react';
import { Search, Filter, ArrowUpDown, Edit, Trash2, Grid3X3, List, Kanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalization } from '@/hooks/useLocalization';

interface ProjectsSearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  handleSort: (column: string) => void;
  selectedProjects: number[];
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const ProjectsSearchAndFilters: React.FC<ProjectsSearchAndFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortBy,
  handleSort,
  selectedProjects,
  showFilters,
  setShowFilters
}) => {
  const { t } = useLocalization();
  return (
    <div className="space-y-4">
      {/* Filters Toggle */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 glass backdrop-blur-md bg-white/80 dark:bg-white/5 border border-white/10 text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-white/10"
        >
          <Filter className="h-4 w-4" />
          <span>{t('projects.filters.label')}</span>
        </Button>
        
        {/* View mode toggle buttons removed as requested */}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-300" />
          <input
            type="text"
            placeholder={t('projects.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 glass backdrop-blur-md bg-white/80 dark:bg-white/5 border border-white/10 rounded-lg text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mokm-purple-500/40 focus:border-mokm-purple-500/40"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-500 dark:text-slate-300" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 glass backdrop-blur-md bg-white/80 dark:bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500/40 focus:border-mokm-purple-500/40 text-sm text-slate-700 dark:text-slate-200"
          >
            <option value="all">{t('projects.filters.allStatuses')}</option>
            <option value="In Progress">{t('projects.statusLabels.inProgress')}</option>
            <option value="Completed">{t('projects.statusLabels.completed')}</option>
            <option value="Planning">{t('projects.statusLabels.planning')}</option>
            <option value="On Hold">{t('projects.statusLabels.onHold')}</option>
            <option value="Cancelled">{t('projects.statusLabels.cancelled')}</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="h-4 w-4 text-slate-500 dark:text-slate-300" />
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="px-3 py-2 glass backdrop-blur-md bg-white/80 dark:bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500/40 focus:border-mokm-purple-500/40 text-sm text-slate-700 dark:text-slate-200"
          >
            <option value="name">{t('projects.sort.name')}</option>
            <option value="client">{t('projects.sort.client')}</option>
            <option value="progress">{t('projects.sort.progress')}</option>
            <option value="budget">{t('projects.sort.budget')}</option>
            <option value="startDate">{t('projects.sort.startDate')}</option>
            <option value="endDate">{t('projects.sort.endDate')}</option>
          </select>
        </div>

        {selectedProjects.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600 dark:text-slate-300">{t('projects.actionsBar.selectedCount', { count: selectedProjects.length })}</span>
            <Button variant="outline" size="sm" className="glass backdrop-blur-md bg-white/80 dark:bg-white/5 border border-white/10 text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-white/10">
              <Edit className="h-4 w-4 mr-2" />
              {t('projects.actionsBar.edit')}
            </Button>
            <Button variant="outline" size="sm" className="glass backdrop-blur-md bg-white/80 dark:bg-white/5 border border-white/10 text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-white/10">
              <Trash2 className="h-4 w-4 mr-2" />
              {t('projects.actionsBar.delete')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsSearchAndFilters;
