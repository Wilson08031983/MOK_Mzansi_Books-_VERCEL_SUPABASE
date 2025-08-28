
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar,
  DollarSign,
  Users,
  Tag,
  Filter,
  X
} from 'lucide-react';
import { useLocalization } from '@/hooks/useLocalization';

interface QuotationsAdvancedFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  clients: any[];
  salespersons: any[];
  allTags: string[];
}

const QuotationsAdvancedFilters: React.FC<QuotationsAdvancedFiltersProps> = ({
  filters,
  setFilters,
  clients,
  salespersons,
  allTags
}) => {
  const { t } = useLocalization();
  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleCustomFieldChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [field]: value
      }
    }));
  };

  return (
    <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
      <CardHeader>
        <CardTitle className="text-lg font-sf-pro flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          {t('quotations.filters.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Date Range Filters */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {t('quotations.filters.dateRange')}
            </Label>
            <div className="space-y-2">
              <select
                value={filters.dateType}
                onChange={(e) => setFilters(prev => ({ ...prev, dateType: e.target.value }))}
                className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro text-sm"
              >
                <option value="created">{t('quotations.filters.dateType.created')}</option>
                <option value="expiry">{t('quotations.filters.dateType.expiry')}</option>
                <option value="modified">{t('quotations.filters.dateType.modified')}</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  placeholder={t('quotations.filters.startDate')}
                  className="text-sm"
                />
                <Input
                  type="date"
                  placeholder={t('quotations.filters.endDate')}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Amount Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              {t('quotations.filters.amountRange')}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder={t('quotations.filters.minAmount')}
                value={filters.amountMin}
                onChange={(e) => setFilters(prev => ({ ...prev, amountMin: e.target.value }))}
                className="text-sm"
              />
              <Input
                type="number"
                placeholder={t('quotations.filters.maxAmount')}
                value={filters.amountMax}
                onChange={(e) => setFilters(prev => ({ ...prev, amountMax: e.target.value }))}
                className="text-sm"
              />
            </div>
          </div>

          {/* Salesperson Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {t('quotations.filters.salesperson')}
            </Label>
            <select
              value={filters.salesperson}
              onChange={(e) => setFilters(prev => ({ ...prev, salesperson: e.target.value }))}
              className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro text-sm"
            >
              <option value="all">{t('quotations.filters.allSalespersons')}</option>
              {salespersons.map(person => (
                <option key={person.id} value={person.id}>{person.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700 flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            {t('quotations.filters.tags')}
          </Label>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 text-xs rounded-full border transition-all duration-200 font-sf-pro ${
                  filters.tags.includes(tag)
                    ? 'bg-mokm-purple-100 text-mokm-purple-800 border-mokm-purple-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                {tag}
                {filters.tags.includes(tag) && (
                  <X className="h-3 w-3 ml-1 inline" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Fields */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">{t('quotations.filters.customFields')}</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department" className="text-xs text-slate-600">{t('quotations.filters.department')}</Label>
              <select
                id="department"
                value={filters.customFields.department || ''}
                onChange={(e) => handleCustomFieldChange('department', e.target.value)}
                className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro text-sm"
              >
                <option value="">{t('quotations.filters.allDepartments')}</option>
                <option value="IT">IT</option>
                <option value="Marketing">Marketing</option>
                <option value="Public Sector">Public Sector</option>
                <option value="Technology">Technology</option>
              </select>
            </div>
            <div>
              <Label htmlFor="region" className="text-xs text-slate-600">{t('quotations.filters.region')}</Label>
              <select
                id="region"
                value={filters.customFields.region || ''}
                onChange={(e) => handleCustomFieldChange('region', e.target.value)}
                className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro text-sm"
              >
                <option value="">{t('quotations.filters.allRegions')}</option>
                <option value="Western Cape">{t('quotations.filters.regions.westernCape')}</option>
                <option value="Gauteng">{t('quotations.filters.regions.gauteng')}</option>
                <option value="KwaZulu-Natal">{t('quotations.filters.regions.kwazuluNatal')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            {t('quotations.filters.infoActiveApplied')}
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({
                status: 'all',
                dateRange: 'all',
                dateType: 'created',
                client: 'all',
                amountMin: '',
                amountMax: '',
                salesperson: 'all',
                tags: [],
                customFields: {}
              })}
              className="font-sf-pro"
            >
              {t('quotations.filters.reset')}
            </Button>
            <Button
              size="sm"
              className="bg-mokm-purple-600 hover:bg-mokm-purple-700 text-white font-sf-pro"
            >
              {t('quotations.filters.apply')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotationsAdvancedFilters;
