
import React, { useEffect, useMemo, useState } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { FileText } from 'lucide-react';
import { activityService } from '@/services/activityService';

const ActivityLog = () => {
  const { t, formatDateTime } = useLocalization();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Load and reactively update activities with icons from the service
  const [activities, setActivities] = useState(() => activityService.getActivitiesWithIcons());

  useEffect(() => {
    const handleUpdate = (_event: Event) => {
      setActivities(activityService.getActivitiesWithIcons());
    };

    window.addEventListener('activity-log-updated', handleUpdate);

    // In case activities changed in another tab or earlier
    setActivities(activityService.getActivitiesWithIcons());

    return () => {
      window.removeEventListener('activity-log-updated', handleUpdate);
    };
  }, []);

  const filteredActivities = useMemo(() => {
    return activityService.filterActivities(activities, {
      searchTerm,
      type: filterType === 'all' ? undefined : filterType
    });
  }, [activities, searchTerm, filterType]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('Search activities')}
          className="input input-bordered w-full"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="select select-bordered"
        >
          <option value="all">{t('All')}</option>
          <option value="user">{t('User')}</option>
          <option value="document">{t('Document')}</option>
          <option value="settings">{t('Settings')}</option>
          <option value="security">{t('Security')}</option>
          <option value="financial">{t('Financial')}</option>
          <option value="task">{t('Task')}</option>
          <option value="project">{t('Project')}</option>
          <option value="system">{t('System')}</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredActivities.length === 0 && (
          <div className="text-muted-foreground text-sm">{t('No activities found')}</div>
        )}

        {filteredActivities.map((activity) => {
          const Icon = activity.icon || FileText;
          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
              <div className={`p-2 rounded-md bg-gradient-to-r ${activity.color}`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{activity.action}</div>
                  <div className="text-xs text-muted-foreground">{formatDateTime(new Date(activity.timestamp))}</div>
                </div>
                <div className="text-sm text-muted-foreground">{activity.details}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t('By')}: {activity.user}
                  {activity.entityType && activity.entityId && (
                    <span> · {activity.entityType} #{activity.entityId}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityLog;
