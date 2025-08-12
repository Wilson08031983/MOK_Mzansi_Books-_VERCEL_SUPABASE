import React, { useState, useEffect } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { Clock, Globe } from 'lucide-react';

interface TimezoneDisplayProps {
  showDate?: boolean;
  showTime?: boolean;
  showTimezone?: boolean;
  className?: string;
  format?: 'date' | 'time' | 'datetime' | 'full';
}

const TimezoneDisplay: React.FC<TimezoneDisplayProps> = ({
  showDate = true,
  showTime = true,
  showTimezone = false,
  className = '',
  format = 'datetime'
}) => {
  const { 
    formatDate, 
    formatTime, 
    formatDateTime, 
    getCurrentTime, 
    getTimezoneDisplayName,
    settings 
  } = useLocalization();
  
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [getCurrentTime]);

  const renderTimeDisplay = () => {
    switch (format) {
      case 'date':
        return formatDate(currentTime);
      case 'time':
        return formatTime(currentTime);
      case 'datetime':
        return formatDateTime(currentTime);
      case 'full':
        return `${formatDateTime(currentTime)} (${getTimezoneDisplayName()})`;
      default:
        return formatDateTime(currentTime);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {format.includes('time') && <Clock className="h-4 w-4 text-slate-500" />}
      {format === 'date' && <Globe className="h-4 w-4 text-slate-500" />}
      
      <span className="text-sm font-medium text-slate-700">
        {renderTimeDisplay()}
      </span>
      
      {showTimezone && format !== 'full' && (
        <span className="text-xs text-slate-500">
          ({settings.timezone})
        </span>
      )}
    </div>
  );
};

export default TimezoneDisplay;
