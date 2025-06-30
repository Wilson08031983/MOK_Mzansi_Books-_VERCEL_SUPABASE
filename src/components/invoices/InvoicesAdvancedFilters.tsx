import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface InvoicesAdvancedFiltersProps {
  filters: {
    status: string;
    dateRange: string;
    dateType: string;
    client: string;
    amountMin: string;
    amountMax: string;
    salesperson: string;
    tags: string[];
    customFields: Record<string, any>;
  };
  setFilters: (filters: any) => void;
  clients: Array<{ id: string; name: string }>;
  salespersons: Array<{ id: string; name: string }>;
  allTags: string[];
}

const dateRanges = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'lastWeek', label: 'Last Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'thisQuarter', label: 'This Quarter' },
  { value: 'lastQuarter', label: 'Last Quarter' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partially Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

const dateTypeOptions = [
  { value: 'created', label: 'Created Date' },
  { value: 'due', label: 'Due Date' },
  { value: 'paid', label: 'Paid Date' },
];

export default function InvoicesAdvancedFilters({
  filters,
  setFilters,
  clients,
  salespersons,
  allTags,
}: InvoicesAdvancedFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [customDate, setCustomDate] = React.useState({
    from: undefined as Date | undefined,
    to: undefined as Date | undefined,
  });

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters((prev: any) => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter((t: string) => t !== tag)
        : [...prev.tags, tag];
      return {
        ...prev,
        tags: newTags,
      };
    });
  };

  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      dateRange: 'all',
      dateType: 'created',
      client: 'all',
      amountMin: '',
      amountMax: '',
      salesperson: 'all',
      tags: [],
      customFields: {},
    });
    setCustomDate({ from: undefined, to: undefined });
  };

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Advanced Filters</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={clearAllFilters}
        >
          Clear all
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Status
          </Label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label htmlFor="dateRange" className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Date Range
          </Label>
          <Select
            value={filters.dateRange}
            onValueChange={(value) => handleFilterChange('dateRange', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Type */}
        <div className="space-y-2">
          <Label htmlFor="dateType" className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Date Type
          </Label>
          <Select
            value={filters.dateType}
            onValueChange={(value) => handleFilterChange('dateType', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select date type" />
            </SelectTrigger>
            <SelectContent>
              {dateTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Client Filter */}
        <div className="space-y-2">
          <Label htmlFor="client" className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Client
          </Label>
          <Select
            value={filters.client}
            onValueChange={(value) => handleFilterChange('client', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount Range */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Amount Range</Label>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.amountMin}
              onChange={(e) => handleFilterChange('amountMin', e.target.value)}
              className="w-full"
            />
            <div className="flex items-center">
              <span className="text-gray-400">-</span>
            </div>
            <Input
              type="number"
              placeholder="Max"
              value={filters.amountMax}
              onChange={(e) => handleFilterChange('amountMax', e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Salesperson */}
        <div className="space-y-2">
          <Label htmlFor="salesperson" className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Salesperson
          </Label>
          <Select
            value={filters.salesperson}
            onValueChange={(value) => handleFilterChange('salesperson', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All salespersons" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Salespersons</SelectItem>
              {salespersons.map((person) => (
                <SelectItem key={person.id} value={person.id}>
                  {person.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="mt-4">
          <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
            Tags
          </Label>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Button
                key={tag}
                variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                size="sm"
                className={`text-xs px-2 h-7 ${
                  filters.tags.includes(tag)
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Date Range Picker (shown when custom is selected) */}
      {filters.dateRange === 'custom' && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !customDate.from && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customDate.from ? (
                    format(customDate.from, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={customDate.from}
                  onSelect={(date) => {
                    setCustomDate((prev) => ({ ...prev, from: date }));
                    // Update the filter with the new date range
                    // You might want to implement this based on your date handling logic
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !customDate.to && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customDate.to ? (
                    format(customDate.to, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={customDate.to}
                  onSelect={(date) => {
                    setCustomDate((prev) => ({ ...prev, to: date }));
                    // Update the filter with the new date range
                    // You might want to implement this based on your date handling logic
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </div>
  );
}
