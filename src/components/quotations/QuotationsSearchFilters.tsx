
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Search,
  Filter,
  Save
} from 'lucide-react';
import { useLocalization } from '@/hooks/useLocalization';

interface FiltersType {
  status: string;
  dateRange: string;
  dateType: string;
  client: string;
  amountMin: string;
  amountMax: string;
  salesperson: string;
  tags: string[];
  customFields: any;
}

interface QuotationsSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: FiltersType;
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  recentSearches: string[];
  clients: { id: string; name: string }[];
  handleSearch: (term: string) => void;
  handleClearFilters: () => void;
  handleSaveFilter: () => void;
}

const QuotationsSearchFilters: React.FC<QuotationsSearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  showAdvancedFilters,
  setShowAdvancedFilters,
  recentSearches,
  clients,
  handleSearch,
  handleClearFilters,
  handleSaveFilter
}) => {
  const { t } = useLocalization();
  return (
    <Card className="glass backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 shadow-business">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Main Search Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('quotations.search.placeholder')}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/40 focus:border-mokm-purple-500/40 transition-all duration-300 font-sf-pro placeholder-white/60"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`glass backdrop-blur-md bg-white/10 dark:bg-white/5 hover:bg-white/15 dark:hover:bg-white/10 border border-white/10 font-sf-pro rounded-xl transition-all duration-300 ${
                  showAdvancedFilters ? 'ring-1 ring-mokm-purple-500/40' : ''
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                {t('quotations.search.advancedFilters')}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSaveFilter}
                className="glass backdrop-blur-md bg-white/10 dark:bg-white/5 hover:bg-white/15 dark:hover:bg-white/10 border border-white/10 font-sf-pro rounded-xl transition-all duration-300"
              >
                <Save className="h-4 w-4 mr-2" />
                {t('quotations.search.saveFilter')}
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 glass backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/40 focus:border-mokm-purple-500/40 transition-all duration-300 font-sf-pro"
              >
                <option value="all">{t('quotations.search.status.all')}</option>
                <option value="draft">{t('quotations.statusLabels.draft')}</option>
                <option value="sent">{t('quotations.statusLabels.sent')}</option>
                <option value="viewed">{t('quotations.statusLabels.viewed')}</option>
                <option value="accepted">{t('quotations.statusLabels.accepted')}</option>
                <option value="rejected">{t('quotations.statusLabels.rejected')}</option>
                <option value="expired">{t('quotations.statusLabels.expired')}</option>
              </select>
            </div>
            
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-3 py-2 glass backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/40 focus:border-mokm-purple-500/40 transition-all duration-300 font-sf-pro"
            >
              <option value="all">{t('quotations.search.dates.all')}</option>
              <option value="today">{t('quotations.search.dates.today')}</option>
              <option value="week">{t('quotations.search.dates.week')}</option>
              <option value="month">{t('quotations.search.dates.month')}</option>
              <option value="quarter">{t('quotations.search.dates.quarter')}</option>
              <option value="year">{t('quotations.search.dates.year')}</option>
            </select>
            
            <select
              value={filters.client}
              onChange={(e) => setFilters(prev => ({ ...prev, client: e.target.value }))}
              className="px-3 py-2 glass backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/40 focus:border-mokm-purple-500/40 transition-all duration-300 font-sf-pro"
            >
              <option value="all">{t('quotations.search.allClients')}</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="glass backdrop-blur-md bg-white/10 dark:bg-white/5 hover:bg-white/15 dark:hover:bg-white/10 border border-white/10 font-sf-pro rounded-lg transition-all duration-300"
            >
              {t('quotations.search.clearFilters')}
            </Button>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 font-sf-pro">{t('quotations.search.recent')}</span>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchTerm(search)}
                    className="px-2 py-1 text-xs glass backdrop-blur-md bg-white/10 dark:bg-white/5 text-white hover:bg-white/20 border border-white/10 rounded-md transition-colors font-sf-pro"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotationsSearchFilters;

