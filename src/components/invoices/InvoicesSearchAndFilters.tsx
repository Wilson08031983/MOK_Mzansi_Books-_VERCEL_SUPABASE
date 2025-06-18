
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  ChevronDown,
  Calendar,
  X
} from 'lucide-react';

interface InvoicesSearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  dateFilter: string;
  onDateFilterChange: (date: string) => void;
  clientFilter: string;
  onClientFilterChange: (client: string) => void;
}

const InvoicesSearchAndFilters: React.FC<InvoicesSearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  clientFilter,
  onClientFilterChange
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'viewed', label: 'Viewed' },
    { value: 'partial', label: 'Partial' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisQuarter', label: 'This Quarter' },
    { value: 'lastQuarter', label: 'Last Quarter' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'overdue', label: 'Overdue' }
  ];

  const clearFilters = () => {
    onSearchChange('');
    onStatusFilterChange('all');
    onDateFilterChange('all');
    onClientFilterChange('all');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || dateFilter !== 'all' || clientFilter !== 'all';

  return (
    <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search invoices by number, client, or reference"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 font-sf-pro"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg font-sf-pro focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg font-sf-pro focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {dateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="font-sf-pro"
            >
              <Filter className="h-4 w-4 mr-2" />
              More Filters
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-slate-500 hover:text-slate-700 font-sf-pro"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
        
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                  Amount Range
                </label>
                <div className="flex items-center gap-2">
                  <Input placeholder="Min" className="font-sf-pro" />
                  <span className="text-slate-500">to</span>
                  <Input placeholder="Max" className="font-sf-pro" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                  Client
                </label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg font-sf-pro focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="all">All Clients</option>
                  <option value="acme">ACME Corporation</option>
                  <option value="tech">Tech Solutions Ltd</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                  Custom Date Range
                </label>
                <div className="flex items-center gap-2">
                  <Input type="date" className="font-sf-pro" />
                  <span className="text-slate-500">to</span>
                  <Input type="date" className="font-sf-pro" />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoicesSearchAndFilters;
