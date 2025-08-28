import React from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface InvoicesSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: {
    status: string;
    dateRange: string;
    client: string;
    amountMin: string;
    amountMax: string;
    salesperson: string;
    tags: string[];
    customFields: Record<string, any>;
  };
  setFilters: (filters: any) => void;
  onSaveFilter?: () => void;
  onClearFilters: () => void;
  savedFilters?: Array<{ id: string; name: string }>;
  onSelectFilter?: (filter: any) => void;
}

export default function InvoicesSearchFilters({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  onSaveFilter,
  onClearFilters,
  savedFilters = [],
  onSelectFilter,
}: InvoicesSearchFiltersProps) {
  const { t } = useLocalization();
  const statusOptions = [
    { value: 'all', label: t('invoices.filters.allStatuses') },
    { value: 'draft', label: t('invoices.statusLabels.draft') },
    { value: 'sent', label: t('invoices.statusLabels.sent') },
    { value: 'paid', label: t('invoices.statusLabels.paid') },
    { value: 'overdue', label: t('invoices.statusLabels.overdue') },
    { value: 'unpaid', label: t('invoices.statusLabels.unpaid') },
    { value: 'partial', label: t('invoices.statusLabels.partial') },
    { value: 'cancelled', label: t('invoices.statusLabels.cancelled') },
  ];

  const dateRangeOptions = [
    { value: 'all', label: t('invoices.filters.allDates') },
    { value: 'today', label: t('invoices.filters.today') },
    { value: 'thisWeek', label: t('invoices.filters.thisWeek') },
    { value: 'thisMonth', label: t('invoices.filters.dateThisMonth') },
    { value: 'custom', label: t('invoices.filters.customRange') },
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between w-full">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('invoices.searchPlaceholder')}
          className="pl-10 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('invoices.filters.status')} />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.dateRange}
          onValueChange={(value) => handleFilterChange('dateRange', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('invoices.filters.dateRange')} />
          </SelectTrigger>
          <SelectContent>
            {dateRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              <span>{t('invoices.filters.more')}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">{t('invoices.filters.advanced')}</h4>
              <div className="grid gap-2">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">{t('invoices.filters.amountRange')}</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('invoices.filters.min')}
                      type="number"
                      value={filters.amountMin}
                      onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                    />
                    <Input
                      placeholder={t('invoices.filters.max')}
                      type="number"
                      value={filters.amountMax}
                      onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                {t('invoices.filters.clear')}
              </Button>
              {onSaveFilter && (
                <Button size="sm" onClick={onSaveFilter}>
                  {t('invoices.filters.saveFilter')}
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
