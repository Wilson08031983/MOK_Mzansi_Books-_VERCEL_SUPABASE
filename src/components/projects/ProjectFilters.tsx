
import React, { useState } from 'react';
import { X, Calendar, DollarSign, Users, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProjectFiltersProps {
  onClose: () => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({ onClose }) => {
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    client: '',
    manager: '',
    tags: [],
    dateRange: { start: '', end: '' },
    budgetRange: { min: '', max: '' }
  });

  const statusOptions = ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];
  const priorityOptions = ['High', 'Medium', 'Low'];
  const tagOptions = ['Web Development', 'Mobile', 'UI/UX', 'Backend', 'E-commerce', 'React Native'];

  const handleStatusToggle = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const handlePriorityToggle = (priority: string) => {
    setFilters(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority]
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      client: '',
      manager: '',
      tags: [],
      dateRange: { start: '', end: '' },
      budgetRange: { min: '', max: '' }
    });
  };

  const applyFilters = () => {
    console.log('Applying filters:', filters);
    onClose();
  };

  return (
    <Card className="glass backdrop-blur-xl bg-white/90 border-white/20 shadow-business mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">Advanced Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Status</label>
            <div className="space-y-2">
              {statusOptions.map(status => (
                <label key={status} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => handleStatusToggle(status)}
                    className="rounded border-slate-300 text-mokm-purple-600 focus:ring-mokm-purple-500"
                  />
                  <span className="text-sm text-slate-600">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Priority</label>
            <div className="space-y-2">
              {priorityOptions.map(priority => (
                <label key={priority} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.priority.includes(priority)}
                    onChange={() => handlePriorityToggle(priority)}
                    className="rounded border-slate-300 text-mokm-purple-600 focus:ring-mokm-purple-500"
                  />
                  <span className="text-sm text-slate-600">{priority}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Client & Manager Filter */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Client</label>
              <input
                type="text"
                placeholder="Search clients..."
                value={filters.client}
                onChange={(e) => setFilters(prev => ({ ...prev, client: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Project Manager</label>
              <input
                type="text"
                placeholder="Search managers..."
                value={filters.manager}
                onChange={(e) => setFilters(prev => ({ ...prev, manager: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  placeholder="Start date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent text-sm"
                />
                <input
                  type="date"
                  placeholder="End date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Budget Range Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            <DollarSign className="h-4 w-4 inline mr-1" />
            Budget Range
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Min budget"
              value={filters.budgetRange.min}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                budgetRange: { ...prev.budgetRange, min: e.target.value }
              }))}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent text-sm"
            />
            <input
              type="number"
              placeholder="Max budget"
              value={filters.budgetRange.max}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                budgetRange: { ...prev.budgetRange, max: e.target.value }
              }))}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Tags Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            <Tag className="h-4 w-4 inline mr-1" />
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tagOptions.map(tag => (
              <Badge
                key={tag}
                variant={filters.tags.includes(tag) ? "default" : "secondary"}
                className={`cursor-pointer transition-colors ${
                  filters.tags.includes(tag)
                    ? 'bg-mokm-purple-500 text-white'
                    : 'hover:bg-slate-200'
                }`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={clearFilters}>
            Clear All
          </Button>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={applyFilters} className="bg-mokm-purple-500 hover:bg-mokm-purple-600 text-white">
              Apply Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectFilters;
