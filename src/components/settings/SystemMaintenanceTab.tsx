
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Monitor,
  RefreshCcw,
  TestTube,
  Trash2,
  ShieldAlert,
  Wrench,
  HardDrive,
  LogOut,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { initializeServices, getServiceStatus, areServicesReady, ServiceStatus } from '@/services/serviceRegistry';
import * as localStorageService from '@/services/localStorageService';
import { cleanupAllSampleData } from '@/services/cleanupSampleData';
import { stuckToastCleanupService } from '@/services/stuckToastCleanupService';
import { resetAuthState, initializeLocalAuth, signOut } from '@/services/localAuthService';
import { testAllServices } from '@/utils/serviceTest';
import { useLocalizationContext } from '@/contexts/LocalizationContext';

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const SystemMaintenanceTab: React.FC = () => {
  const { t } = useLocalizationContext();
  const [initializing, setInitializing] = useState(false);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [cleaningSamples, setCleaningSamples] = useState(false);
  const [authResetting, setAuthResetting] = useState(false);
  const [storageSize, setStorageSize] = useState<number>(0);
  const [status, setStatus] = useState<Record<string, ServiceStatus>>({});
  const [servicesReady, setServicesReady] = useState<boolean>(false);
  const [diagResults, setDiagResults] = useState<Record<string, { success: boolean; message: string }>>({});

  // Local i18n fallback helper
  const tt = (key: string, fallback: string, params?: Record<string, any>) => {
    try {
      const val = t(key as any, params as any);
      if (!val || val === key) return fallback;
      return val;
    } catch {
      return fallback;
    }
  };

  const statusList = useMemo(() => Object.entries(status), [status]);

  const refreshStatus = () => {
    try {
      const s = getServiceStatus();
      setStatus(s);
      setServicesReady(areServicesReady());
    } catch (e) {
      // no-op
    }
  };

  const refreshStorageSize = () => {
    try {
      const size = localStorageService.getSize();
      setStorageSize(size);
    } catch (e) {
      setStorageSize(0);
    }
  };

  useEffect(() => {
    refreshStatus();
    refreshStorageSize();
  }, []);

  const handleInitialize = async () => {
    setInitializing(true);
    try {
      const ok = await initializeServices();
      refreshStatus();
      toast({
        title: ok ? t('common.success') : t('common.error'),
        description: ok ? t('about.toasts.upToDateDesc', { version: '' }) : t('settings.help.toasts.cacheClearFailedDesc')
      });
    } catch (e) {
      toast({ title: t('common.error') });
    } finally {
      setInitializing(false);
    }
  };

  const handleDiagnostics = async () => {
    setRunningDiagnostics(true);
    try {
      const res = await testAllServices();
      setDiagResults(res.results);
      refreshStatus();
      toast({
        title: res.success ? t('common.success') : t('common.error'),
        description: t('settings.help.troubleshooting')
      });
    } catch (e) {
      toast({ title: t('common.error'), description: t('inventory.errorOccurredWhileDeleting') });
    } finally {
      setRunningDiagnostics(false);
    }
  };

  const handleCleanupStuckToasts = () => {
    try {
      stuckToastCleanupService.forceCleanupAndShowStatus();
      toast({ title: t('settings.help.toasts.cacheClearedTitle'), description: t('settings.help.toasts.cacheClearedDesc') });
    } catch (e) {
      toast({ title: t('common.error'), description: t('settings.help.toasts.cacheClearFailedDesc') });
    }
  };

  const handleCleanupSamples = async () => {
    setCleaningSamples(true);
    try {
      const res = cleanupAllSampleData();
      refreshStorageSize();
      toast({
        title: res.success ? t('settings.dataManagement.clearSuccessTitle') : t('settings.dataManagement.clearFailedTitle'),
        description: res.success
          ? t('settings.dataManagement.clearSuccessDesc')
          : t('settings.dataManagement.clearFailedDesc')
      });
    } catch (e) {
      toast({ title: t('common.error'), description: t('settings.help.toasts.cacheClearFailedDesc') });
    } finally {
      setCleaningSamples(false);
    }
  };

  const handleAuthReset = async () => {
    setAuthResetting(true);
    try {
      resetAuthState();
      initializeLocalAuth();
      toast({ title: t('common.success'), description: t('settings.help.confirms.resetAuth') });
    } catch (e) {
      toast({ title: t('common.error'), description: t('settings.help.toasts.cacheClearFailedDesc') });
    } finally {
      setAuthResetting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      signOut();
      toast({ title: t('common.signOut') });
    } catch (e) {
      toast({ title: t('common.error') });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sf-pro">
            <Monitor className="h-5 w-5" />
            {t('settings.tabs.maintenance')}
            {servicesReady ? (
              <Badge variant="secondary" className="ml-2">{t('common.success')}</Badge>
            ) : (
              <Badge variant="secondary" className="ml-2">{tt('settings.notifications.permissionNotGranted', 'Permission not granted')}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button size="sm" onClick={handleInitialize} disabled={initializing}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              {initializing ? t('security.saving') : tt('settings.users.refresh', 'Refresh')}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => { refreshStatus(); toast({ title: tt('settings.users.refresh', 'Refresh') }); }}>
              <ActivityIcon className="h-4 w-4 mr-2" />
              {tt('settings.users.refresh', 'Refresh')}
            </Button>
            <Button size="sm" variant="outline" onClick={refreshStorageSize}>
              <HardDrive className="h-4 w-4 mr-2" />
              {tt('settings.dataManagement.storageUsage', 'Storage usage')}
            </Button>
          </div>

          {/* Service Status List */}
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {statusList.length === 0 ? (
              <p className="text-sm text-slate-400">{t('common.noData')}</p>
            ) : (
              statusList.map(([key, s]) => (
                <div key={key} className="rounded-lg border border-white/10 p-3 bg-slate-900/40">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{s.name || key}</div>
                    {s.initialized ? (
                      <Badge>{t('common.success')}</Badge>
                    ) : s.error ? (
                      <Badge variant="destructive">{t('common.error')}</Badge>
                    ) : (
                      <Badge variant="secondary">{t('clients.pending')}</Badge>
                    )}
                  </div>
                  {s.error && (
                    <p className="mt-2 text-xs text-red-300">{s.error}</p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* LocalStorage size */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span className="flex items-center gap-2"><HardDrive className="h-4 w-4" /> {tt('settings.dataManagement.storageUsage', 'Storage usage')}</span>
              <span>{formatBytes(storageSize)}</span>
            </div>
            <Progress value={Math.min(100, (storageSize / (30 * 1024 * 1024)) * 100)} className="mt-2" />
            <p className="text-xs text-slate-400 mt-1">{t('settings.description')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostics */}
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sf-pro">
            <TestTube className="h-5 w-5" />
            {t('settings.help.troubleshooting')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button size="sm" onClick={handleDiagnostics} disabled={runningDiagnostics}>
              <TestTube className="h-4 w-4 mr-2" />
              {runningDiagnostics ? t('common.loading') : t('settings.help.troubleshooting')}
            </Button>
          </div>

          {Object.keys(diagResults).length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(diagResults).map(([k, r]) => (
                <div key={k} className="rounded-lg border border-white/10 p-3 bg-slate-900/40">
                  <div className="flex items-center justify-between">
                    <div className="font-medium capitalize">{k.replace(/_/g, ' ')}</div>
                    <Badge className={r.success ? '' : ''} variant={r.success ? 'secondary' : 'destructive'}>
                      {r.success ? t('common.success') : t('common.error')}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-300">{r.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cleanup Operations */}
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sf-pro">
            <Trash2 className="h-5 w-5" />
            {t('settings.help.buttons.clearAppCache')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button size="sm" variant="secondary" onClick={handleCleanupStuckToasts}>
              <ShieldAlert className="h-4 w-4 mr-2" />
              {t('settings.help.buttons.forceCleanupNow')}
            </Button>
          </div>
          <Progress value={Math.min(100, (storageSize / (30 * 1024 * 1024)) * 100)} className="mt-2" />
          <p className="text-xs text-slate-400 mt-1">{t('settings.description')}</p>
      </CardContent>
    </Card>

    {/* Diagnostics */}
    <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-sf-pro">
          <TestTube className="h-5 w-5" />
          {t('settings.help.troubleshooting')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button size="sm" onClick={handleDiagnostics} disabled={runningDiagnostics}>
            <TestTube className="h-4 w-4 mr-2" />
            {runningDiagnostics ? t('common.loading') : t('settings.help.troubleshooting')}
          </Button>
        </div>

            <Button size="sm" variant="secondary" onClick={() => { initializeLocalAuth(); toast({ title: t('common.success') }); }}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              {t('settings.help.buttons.resetAuthReload')}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" onClick={() => {}}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('common.signOut')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('common.signOut')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('settings.help.confirms.resetAuth')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut} className="bg-red-600 hover:bg-red-700">{t('common.signOut')}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

// Simple inline icon to avoid importing another component
const ActivityIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path d="M22 12h-4l-3 9L9 3l-2 9H2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default SystemMaintenanceTab;
