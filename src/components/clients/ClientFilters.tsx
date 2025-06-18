
import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientFiltersProps {
  filters: {
    status: string;
    clientType: string;
    dateRange: string;
  };
  onFiltersChange: (filters: any) => void;
}

const ClientFilters = ({ filters, onFiltersChange }: ClientFiltersProps) => {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status: 'all',
      clientType: 'all',
      dateRange: 'all'
    });
  };

  const hasActiveFilters = filters.status !== 'all' || filters.clientType !== 'all' || filters.dateRange !== 'all';

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-slate-500" />
        
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="overdue">Overdue</option>
          <option value="pending">Pending</option>
        </select>
        
        <select
          value={filters.clientType}
          onChange={(e) => handleFilterChange('clientType', e.target.value)}
          className="px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro text-sm"
        >
          <option value="all">All Types</option>
          <option value="individual">Individual</option>
          <option value="business">Business</option>
          <option value="government">Government</option>
        </select>
        
        <select
          value={filters.dateRange}
          onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          className="px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro text-sm"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>
      
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-slate-500 hover:text-slate-700 hover:bg-white/50 rounded-xl"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default ClientFilters;
