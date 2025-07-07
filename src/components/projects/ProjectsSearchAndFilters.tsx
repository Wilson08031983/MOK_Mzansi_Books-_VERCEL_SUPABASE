
import React from 'react';
import { Search, Filter, ArrowUpDown, Edit, Trash2, Grid3X3, List, Kanban } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  return (
    <div className="space-y-4">
      {/* Filters Toggle */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </Button>
        
        {/* View mode toggle buttons removed as requested */}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search projects by name, client, or reference"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Planning">Planning</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="h-4 w-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent text-sm"
          >
            <option value="name">Project Name</option>
            <option value="client">Client</option>
            <option value="progress">Progress</option>
            <option value="budget">Budget</option>
            <option value="startDate">Start Date</option>
            <option value="endDate">End Date</option>
          </select>
        </div>

        {selectedProjects.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">{selectedProjects.length} selected</span>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsSearchAndFilters;
