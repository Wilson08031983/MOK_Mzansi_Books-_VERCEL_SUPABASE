import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getNextPublicHoliday } from './LeaveManagementTypes';

interface NextPublicHolidayDisplayProps {
  compact?: boolean;
}

const NextPublicHolidayDisplay: React.FC<NextPublicHolidayDisplayProps> = ({ compact = false }) => {
  const [holiday, setHoliday] = React.useState(getNextPublicHoliday());

  // Refresh every day at midnight
  React.useEffect(() => {
    // Initial calculation
    setHoliday(getNextPublicHoliday());

    // Set up auto-refresh at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timerId = setTimeout(() => {
      setHoliday(getNextPublicHoliday());
    }, timeUntilMidnight);

    return () => clearTimeout(timerId);
  }, []);

  if (!holiday) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between glass backdrop-blur-md bg-white/10 dark:bg-black/30 rounded-xl p-3 border border-white/10 shadow-business animate-fade-in">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-mokm-purple-500" />
          <div>
            <span className="font-medium text-sm text-slate-900 dark:text-slate-100">
              {holiday.isToday ? 'Today is ' : 'Next Holiday: '}
              {holiday.name}
            </span>
            {holiday.isSoon && !holiday.isToday && (
              <span className="ml-2 text-xs animate-pulse bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                Soon
              </span>
            )}
          </div>
        </div>
        <span className="text-xs bg-mokm-blue-100/70 text-mokm-blue-800 px-2 py-1 rounded-full">
          {holiday.isToday ? 'Today' : holiday.formattedDate}
        </span>
      </div>
    );
  }

  return (
    <Card className="glass backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 shadow-business mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-900 dark:text-slate-100 font-sf-pro text-sm flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-mokm-purple-500" />
          Next Public Holiday
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-medium text-mokm-blue-700 dark:text-slate-100">
              {holiday.isToday ? 'Today is ' : ''}{holiday.name}
              {holiday.isSoon && !holiday.isToday && (
                <span className="ml-2 text-xs animate-pulse bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  {holiday.daysUntil} day{holiday.daysUntil !== 1 ? 's' : ''} away
                </span>
              )}
            </span>
            <span className="text-sm bg-mokm-blue-100 text-mokm-blue-800 px-2 py-1 rounded-full">
              {holiday.isToday ? 'Today' : holiday.formattedDate}
            </span>
          </div>
          {holiday.description && (
            <p className="text-xs text-slate-600 dark:text-slate-300">{holiday.description}</p>
          )}
          <p className="text-xs mt-2 text-mokm-purple-600 font-medium">
            Note: Public holidays do not count against leave days
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextPublicHolidayDisplay;
