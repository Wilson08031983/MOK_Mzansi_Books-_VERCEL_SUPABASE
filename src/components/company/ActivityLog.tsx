
import React, { useEffect, useMemo, useState } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { 
  Search, Filter, Download, Trash2, Calendar, ChevronDown, 
  Shield, AlertTriangle, Info, CheckCircle, Eye, EyeOff,
  Clock, User, MapPin, FileText, Settings as SettingsIcon
} from 'lucide-react';
import { auditService } from '@/services/auditService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import useAuditLogger from '@/hooks/useAuditLogger';

const ActivityLog = () => {
  const { t, formatDateTime } = useLocalization();
  const { logNavigation } = useAuditLogger();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [pageFilter, setPageFilter] = useState('all');
  const [changeTypeFilter, setChangeTypeFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(20);

  // Load audit entries
  const [auditEntries, setAuditEntries] = useState(() => auditService.getAuditEntriesWithIcons());

  useEffect(() => {
    // Audit: viewing Activity Log tab
    try { logNavigation('Activity Log'); } catch {}
    const handleUpdate = () => {
      setAuditEntries(auditService.getAuditEntriesWithIcons());
    };

    window.addEventListener('audit-log-updated', handleUpdate);
    setAuditEntries(auditService.getAuditEntriesWithIcons());

    return () => {
      window.removeEventListener('audit-log-updated', handleUpdate);
    };
  }, []);

  // Get unique values for filter dropdowns
  const uniquePages = useMemo(() => {
    const pages = [...new Set(auditEntries.map(entry => entry.page))].sort();
    return pages;
  }, [auditEntries]);

  const filteredEntries = useMemo(() => {
    const dateFrom = dateFromFilter ? new Date(dateFromFilter) : undefined;
    const dateTo = dateToFilter ? new Date(dateToFilter) : undefined;

    return auditService.filterAuditEntries(auditEntries, {
      searchTerm,
      category: categoryFilter,
      severity: severityFilter,
      page: pageFilter,
      changeType: changeTypeFilter,
      dateFrom,
      dateTo
    });
  }, [auditEntries, searchTerm, categoryFilter, severityFilter, pageFilter, changeTypeFilter, dateFromFilter, dateToFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'high': return <Shield className="h-4 w-4 text-orange-400" />;
      case 'medium': return <Info className="h-4 w-4 text-blue-400" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-400" />;
      default: return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900/30 text-red-300 border-red-800/40';
      case 'high': return 'bg-orange-900/30 text-orange-300 border-orange-800/40';
      case 'medium': return 'bg-blue-900/30 text-blue-300 border-blue-800/40';
      case 'low': return 'bg-green-900/30 text-green-300 border-green-800/40';
      default: return 'bg-slate-800/50 text-slate-300 border-white/10';
    }
  };

  const toggleEntryExpansion = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const exportAuditLog = () => {
    // 1) Prepare and download export
    const data = auditService.exportAuditLog();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // 2) Log export action to audit log (non-blocking)
    try {
      auditService.logAudit({
        category: 'system',
        action: 'Export Activity Log',
        page: 'Company',
        section: 'Activity Log',
        changeType: 'export',
        description: 'User exported the activity log as JSON',
        metadata: { entriesCount: auditEntries.length }
      });
    } catch {}

    // 3) Ask user if they want to clear the log after export
    const confirmClear = window.confirm(
      t('company.activityLog.confirm.clearAfterExport')
    );
    if (confirmClear) {
      try {
        auditService.clearAuditLog();
        // Force UI refresh immediately in addition to event listener
        setAuditEntries(auditService.getAuditEntriesWithIcons());
        setExpandedEntries(new Set());
        setCurrentPage(1);
        try { alert(t('company.activityLog.buttons.clearLog') + ' — ' + t('common.success', { defaultValue: 'Success' } as any)); } catch {}
      } catch (e) {
        console.error('Failed to clear audit log after export:', e);
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setSeverityFilter('all');
    setPageFilter('all');
    setChangeTypeFilter('all');
    setDateFromFilter('');
    setDateToFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 font-sf-pro text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('company.activityLog.headerTitle')}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t('company.activityLog.headerSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 text-slate-700 dark:text-slate-100 border-slate-300 dark:border-white/20"
          >
            <Filter className="h-4 w-4" />
            {t('company.activityLog.buttons.filters')}
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportAuditLog}
            className="gap-2 text-slate-700 dark:text-slate-100 border-slate-300 dark:border-white/20"
          >
            <Download className="h-4 w-4" />
            {t('company.activityLog.buttons.export')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">{t('company.activityLog.stats.totalEntries')}</p>
                <p className="text-2xl font-bold">{auditEntries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">{t('company.activityLog.stats.critical')}</p>
                <p className="text-2xl font-bold">
                  {auditEntries.filter(e => e.severity === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">{t('company.activityLog.stats.activeUsers')}</p>
                <p className="text-2xl font-bold">
                  {new Set(auditEntries.map(e => e.userId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">{t('company.activityLog.stats.today')}</p>
                <p className="text-2xl font-bold">
                  {auditEntries.filter(e => 
                    new Date(e.timestamp).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent className="space-y-4">
          <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
            <CardHeader>
              <CardTitle className="text-lg text-slate-100">{t('company.activityLog.filters.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-slate-300">{t('company.activityLog.filters.searchLabel')}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder={t('company.activityLog.filters.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-slate-300">{t('company.activityLog.filters.category')}</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('company.activityLog.filters.allCategories')}</SelectItem>
                      <SelectItem value="navigation">{t('company.activityLog.filters.navigation')}</SelectItem>
                      <SelectItem value="crud">{t('company.activityLog.filters.crud')}</SelectItem>
                      <SelectItem value="auth">{t('company.activityLog.filters.auth')}</SelectItem>
                      <SelectItem value="settings">{t('company.activityLog.filters.settings')}</SelectItem>
                      <SelectItem value="financial">{t('company.activityLog.filters.financial')}</SelectItem>
                      <SelectItem value="hr">{t('company.activityLog.filters.hr')}</SelectItem>
                      <SelectItem value="document">{t('company.activityLog.filters.document')}</SelectItem>
                      <SelectItem value="system">{t('company.activityLog.filters.system')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-slate-300">{t('company.activityLog.filters.severity')}</label>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('company.activityLog.filters.allSeverities')}</SelectItem>
                      <SelectItem value="critical">{t('company.activityLog.severity.critical')}</SelectItem>
                      <SelectItem value="high">{t('company.activityLog.severity.high')}</SelectItem>
                      <SelectItem value="medium">{t('company.activityLog.severity.medium')}</SelectItem>
                      <SelectItem value="low">{t('company.activityLog.severity.low')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-slate-300">{t('company.activityLog.filters.page')}</label>
                  <Select value={pageFilter} onValueChange={setPageFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('company.activityLog.filters.allPages')}</SelectItem>
                      {uniquePages.map(page => (
                        <SelectItem key={page} value={page}>{page}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-slate-300">{t('company.activityLog.filters.changeType')}</label>
                  <Select value={changeTypeFilter} onValueChange={setChangeTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('company.activityLog.filters.allTypes')}</SelectItem>
                      <SelectItem value="create">{t('company.activityLog.filters.create')}</SelectItem>
                      <SelectItem value="read">{t('company.activityLog.filters.read')}</SelectItem>
                      <SelectItem value="update">{t('company.activityLog.filters.update')}</SelectItem>
                      <SelectItem value="delete">{t('company.activityLog.filters.delete')}</SelectItem>
                      <SelectItem value="export">{t('company.activityLog.filters.export')}</SelectItem>
                      <SelectItem value="import">{t('company.activityLog.filters.import')}</SelectItem>
                      <SelectItem value="send">{t('company.activityLog.filters.send')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-slate-300">{t('company.activityLog.filters.dateFrom')}</label>
                  <Input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-slate-300">{t('company.activityLog.filters.dateTo')}</label>
                  <Input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('company.activityLog.buttons.clearFilters')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          {t('company.activityLog.results.showing', { shown: paginatedEntries.length, total: filteredEntries.length })}
          {filteredEntries.length !== auditEntries.length && ` ${t('company.activityLog.results.filteredFrom', { all: auditEntries.length })}`}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              {t('common.previous')}
            </Button>
            <span>{t('company.activityLog.results.pageOf', { current: currentPage, total: totalPages })}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              {t('common.next')}
            </Button>
          </div>
        )}
      </div>

      {/* Audit Entries */}
      <div className="space-y-3">
        {paginatedEntries.length === 0 ? (
          <Card className="glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">{t('company.activityLog.empty.noMatches')}</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                {t('company.activityLog.buttons.clearFilters')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          paginatedEntries.map((entry) => {
            const Icon = entry.icon || FileText;
            const isExpanded = expandedEntries.has(entry.id);
            
            return (
              <Card key={entry.id} className="overflow-hidden glass backdrop-blur-sm bg-slate-900/40 border border-white/10 shadow-business">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-2 rounded-lg ${entry.bgColor}`}>
                        <Icon className={`h-5 w-5 ${entry.color}`} />
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{entry.action}</h3>
                              <Badge className={`text-xs ${getSeverityColor(entry.severity)}`}>
                                {entry.severity}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {entry.changeType}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{entry.description}</p>
                            
                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {entry.userName} ({entry.userRole})
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {entry.page}{entry.section && ` > ${entry.section}`}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDateTime(new Date(entry.timestamp))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {getSeverityIcon(entry.severity)}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleEntryExpansion(entry.id)}
                              className="p-1 h-auto"
                            >
                              {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                            {entry.entityType && (
                              <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{t('company.activityLog.entry.entity')}</label>
                                <p className="text-sm">
                                  {entry.entityType}
                                  {entry.entityId && ` #${entry.entityId}`}
                                  {entry.entityName && ` - ${entry.entityName}`}
                                </p>
                              </div>
                            )}

                            {entry.oldValues && Object.keys(entry.oldValues).length > 0 && (
                              <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{t('company.activityLog.entry.previousValues')}</label>
                                <pre className="text-xs bg-slate-800/60 p-2 rounded border border-white/10 text-slate-200 overflow-x-auto">
                                  {JSON.stringify(entry.oldValues, null, 2)}
                                </pre>
                              </div>
                            )}

                            {entry.newValues && Object.keys(entry.newValues).length > 0 && (
                              <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{t('company.activityLog.entry.newValues')}</label>
                                <pre className="text-xs bg-slate-800/60 p-2 rounded border border-white/10 text-slate-200 overflow-x-auto">
                                  {JSON.stringify(entry.newValues, null, 2)}
                                </pre>
                              </div>
                            )}

                            {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                              <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{t('company.activityLog.entry.metadata')}</label>
                                <pre className="text-xs bg-slate-800/60 p-2 rounded border border-white/10 text-slate-200 overflow-x-auto">
                                  {JSON.stringify(entry.metadata, null, 2)}
                                </pre>
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                              <span>{t('company.activityLog.entry.entryId')}: {entry.id}</span>
                              <span>{t('company.activityLog.entry.userId')}: {entry.userId}</span>
                              {entry.immutable && (
                                <Badge variant="secondary" className="text-xs">
                                  <Shield className="h-3 w-3 mr-1" />
                                  {t('company.activityLog.entry.immutable')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            {t('common.first')}
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            {t('common.previous')}
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            {t('common.next')}
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            {t('common.last')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
