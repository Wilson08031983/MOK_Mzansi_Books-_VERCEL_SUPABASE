
import React, { useState } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  ChevronDown,
  Calendar,
  X,
  List,
  Grid3X3
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
}

interface InvoicesSearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  dateFilter: string;
  onDateFilterChange: (date: string) => void;
  clientFilter: string;
  onClientFilterChange: (client: string) => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  className?: string;
  clients?: Client[];
  onCreateInvoice?: () => void;
}

const InvoicesSearchAndFilters: React.FC<InvoicesSearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  clientFilter,
  onClientFilterChange,
  viewMode,
  onViewModeChange,
  className = '',
  clients = [],
  onCreateInvoice
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { t } = useLocalization();

  const statusOptions = [
    { value: 'all', label: t('invoices.filters.allStatuses') },
    { value: 'draft', label: t('invoices.statusLabels.draft') },
    { value: 'sent', label: t('invoices.statusLabels.sent') },
    { value: 'viewed', label: t('invoices.statusLabels.viewed') },
    { value: 'partial', label: t('invoices.statusLabels.partial') },
    { value: 'paid', label: t('invoices.statusLabels.paid') },
    { value: 'overdue', label: t('invoices.statusLabels.overdue') },
    { value: 'cancelled', label: t('invoices.statusLabels.cancelled') }
  ];

  const dateOptions = [
    { value: 'all', label: t('invoices.filters.dateAllTime') },
    { value: 'thisMonth', label: t('invoices.filters.dateThisMonth') },
    { value: 'lastMonth', label: t('invoices.filters.dateLastMonth') },
    { value: 'thisQuarter', label: t('invoices.filters.dateThisQuarter') },
    { value: 'lastQuarter', label: t('invoices.filters.dateLastQuarter') },
    { value: 'thisYear', label: t('invoices.filters.dateThisYear') },
    { value: 'overdue', label: t('invoices.statusLabels.overdue') }
  ];

  const clearFilters = () => {
    onSearchChange('');
    onStatusFilterChange('all');
    onDateFilterChange('all');
    onClientFilterChange('all');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || dateFilter !== 'all' || clientFilter !== 'all';

  return (
    <Card className={`mb-6 ${className}`}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder={t('invoices.searchPlaceholder')}
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('table')}
              className="h-10"
            >
              <List className="h-4 w-4 mr-2" />
              {t('invoices.tableView')}
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="h-10"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              {t('invoices.gridView')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="h-10"
            >
              <Filter className="h-4 w-4 mr-2" />
              {t('invoices.filters.label')}
              {showAdvancedFilters ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4 transform rotate-180" />
              )}
            </Button>
            {onCreateInvoice && (
              <Button
                size="sm"
                onClick={onCreateInvoice}
                className="h-10 ml-2"
              >
                + {t('invoices.newInvoiceButton')}
              </Button>
            )}
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">{t('invoices.filters.status')}</label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">{t('invoices.filters.dateRange')}</label>
                <div className="relative">
                  <select
                    value={dateFilter}
                    onChange={(e) => onDateFilterChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {dateOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">{t('invoices.client')}</label>
                <div className="relative">
                  <select
                    value={clientFilter}
                    onChange={(e) => onClientFilterChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">{t('invoices.allClients')}</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t('invoices.filters.clearAll')}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoicesSearchAndFilters;
