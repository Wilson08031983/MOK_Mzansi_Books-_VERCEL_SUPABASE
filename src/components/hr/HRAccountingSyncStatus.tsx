import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface HRAccountingSyncStatusProps {
  employeeId?: string;
  employeeName?: string;
  onRefresh?: () => void;
}

interface SyncSnapshot {
  period: string;
  scope: 'single' | 'all';
  employeeId?: string;
  employeeName?: string;
  paye: number;
  uif: number;
  timestamp: string;
}

const HRAccountingSyncStatus: React.FC<HRAccountingSyncStatusProps> = ({
  employeeId,
  employeeName,
  onRefresh
}) => {
  const [syncStatus, setSyncStatus] = useState<'synced' | 'outdated' | 'never' | 'refreshing'>('never');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [payeValue, setPayeValue] = useState<number>(0);
  const [uifValue, setUifValue] = useState<number>(0);

  useEffect(() => {
    checkSyncStatus();
  }, [employeeId]);

  const checkSyncStatus = () => {
    try {
      const snapshot = localStorage.getItem('accounting_hr_link_snapshot');
      if (!snapshot) {
        setSyncStatus('never');
        setLastSync(null);
        return;
      }

      const data: SyncSnapshot = JSON.parse(snapshot);
      const syncTime = new Date(data.timestamp);
      const now = new Date();
      const hoursSinceSync = (now.getTime() - syncTime.getTime()) / (1000 * 60 * 60);

      // Check if this is for the current employee or all employees
      const isRelevant = !employeeId || data.scope === 'all' || data.employeeId === employeeId;
      
      if (isRelevant) {
        setLastSync(syncTime.toLocaleString());
        setPayeValue(data.paye);
        setUifValue(data.uif);
        
        // Consider outdated if more than 1 hour old
        setSyncStatus(hoursSinceSync > 1 ? 'outdated' : 'synced');
      } else {
        setSyncStatus('never');
        setLastSync(null);
      }
    } catch (error) {
      console.error('Error checking sync status:', error);
      setSyncStatus('never');
      setLastSync(null);
    }
  };

  const handleRefresh = async () => {
    setSyncStatus('refreshing');
    try {
      // Clear old snapshots
      localStorage.removeItem('accounting_hr_link_snapshot');
      
      // Trigger refresh callback if provided
      if (onRefresh) {
        await onRefresh();
      }
      
      // Re-check status after refresh
      setTimeout(() => {
        checkSyncStatus();
        toast.success('PAYE/UIF values refreshed from HR Payroll', {
          description: 'Values are now up to date'
        });
      }, 500);
    } catch (error) {
      console.error('Error refreshing sync:', error);
      setSyncStatus('outdated');
      toast.error('Failed to refresh PAYE/UIF values');
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'outdated':
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case 'refreshing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'synced':
        return 'PAYE/UIF synced from HR Payroll';
      case 'outdated':
        return 'PAYE/UIF values may be outdated';
      case 'refreshing':
        return 'Refreshing PAYE/UIF from HR Payroll...';
      default:
        return 'PAYE/UIF not synced from HR Payroll';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'synced':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'outdated':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'refreshing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div>
            <p className="text-sm font-medium">{getStatusText()}</p>
            {lastSync && (
              <p className="text-xs opacity-75">Last updated: {lastSync}</p>
            )}
            {(payeValue > 0 || uifValue > 0) && (
              <p className="text-xs opacity-75">
                PAYE: R{payeValue.toFixed(2)}, UIF: R{uifValue.toFixed(2)}
                {employeeName && ` (${employeeName})`}
              </p>
            )}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={syncStatus === 'refreshing'}
          className="text-xs"
        >
          {syncStatus === 'refreshing' ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
    </div>
  );
};

export default HRAccountingSyncStatus;
