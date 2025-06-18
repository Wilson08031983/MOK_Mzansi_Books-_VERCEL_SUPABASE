
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Grid3X3, List, Plus, RefreshCw, Download, Upload } from 'lucide-react';
import ClientFilters from './ClientFilters';

interface ClientsSearchAndFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  filters: {
    status: string;
    clientType: string;
    dateRange: string;
  };
  onFiltersChange: (filters: any) => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  onAddClientClick?: () => void;
}

const ClientsSearchAndFilters = ({
  searchTerm,
  onSearchTermChange,
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  onAddClientClick
}: ClientsSearchAndFiltersProps) => {
  return (
    <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Action Buttons Row */}
          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl transition-all duration-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl transition-all duration-300"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            
            <Button 
              onClick={onAddClientClick}
              size="sm"
              className="bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 hover:from-mokm-purple-600 hover:to-mokm-blue-600 text-white font-sf-pro rounded-xl shadow-colored hover:shadow-colored-lg transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>

          {/* Search and Filters Row */}
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients by name, email, or company"
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              />
            </div>
            
            <ClientFilters filters={filters} onFiltersChange={onFiltersChange} />
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('table')}
                className="rounded-xl"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-xl"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientsSearchAndFilters;
