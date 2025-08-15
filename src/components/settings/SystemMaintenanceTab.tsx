
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

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const SystemMaintenanceTab: React.FC = () => {
  const [initializing, setInitializing] = useState(false);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [cleaningSamples, setCleaningSamples] = useState(false);
  const [authResetting, setAuthResetting] = useState(false);
  const [storageSize, setStorageSize] = useState<number>(0);
  const [status, setStatus] = useState<Record<string, ServiceStatus>>({});
  const [servicesReady, setServicesReady] = useState<boolean>(false);
  const [diagResults, setDiagResults] = useState<Record<string, { success: boolean; message: string }>>({});

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
        title: ok ? 'Services initialized' : 'Initialization completed with issues',
        description: ok ? 'All services are ready.' : 'Some services may have failed. See status below.',
      });
    } catch (e) {
      toast({ title: 'Initialization failed', description: 'See console for details.' });
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
        title: res.success ? 'Diagnostics passed' : 'Diagnostics found issues',
        description: 'See results below.',
      });
    } catch (e) {
      toast({ title: 'Diagnostics failed', description: 'See console for details.' });
    } finally {
      setRunningDiagnostics(false);
    }
  };

  const handleCleanupStuckToasts = () => {
    try {
      stuckToastCleanupService.forceCleanupAndShowStatus();
      toast({ title: 'Cleanup triggered', description: 'Stuck toast notifications were cleaned.' });
    } catch (e) {
      toast({ title: 'Cleanup failed', description: 'Could not clean stuck toasts.' });
    }
  };

  const handleCleanupSamples = async () => {
    setCleaningSamples(true);
    try {
      const res = cleanupAllSampleData();
      refreshStorageSize();
      toast({
        title: res.success ? 'Sample data removed' : 'Cleanup completed with errors',
        description: `Removed ${res.employeesRemoved} sample employees.`,
      });
    } catch (e) {
      toast({ title: 'Cleanup failed', description: 'See console for details.' });
    } finally {
      setCleaningSamples(false);
    }
  };

  const handleAuthReset = async () => {
    setAuthResetting(true);
    try {
      resetAuthState();
      initializeLocalAuth();
      toast({ title: 'Local auth reset', description: 'Authentication state has been reset.' });
    } catch (e) {
      toast({ title: 'Auth reset failed', description: 'See console for details.' });
    } finally {
      setAuthResetting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      signOut();
      toast({ title: 'Signed out', description: 'Current user has been signed out.' });
    } catch (e) {
      toast({ title: 'Sign out failed', description: 'See console for details.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sf-pro">
            <Monitor className="h-5 w-5" />
            System Maintenance
            {servicesReady ? (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">All Services Ready</Badge>
            ) : (
              <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700">Attention Needed</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button size="sm" onClick={handleInitialize} disabled={initializing}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              {initializing ? 'Initializing...' : 'Initialize Services'}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => { refreshStatus(); toast({ title: 'Status refreshed' }); }}>
              <ActivityIcon className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
            <Button size="sm" variant="outline" onClick={refreshStorageSize}>
              <HardDrive className="h-4 w-4 mr-2" />
              Check Storage Size
            </Button>
          </div>

          {/* Service Status List */}
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {statusList.length === 0 ? (
              <p className="text-sm text-gray-600">No service status available yet.</p>
            ) : (
              statusList.map(([key, s]) => (
                <div key={key} className="rounded-lg border border-gray-200 p-3 bg-white/70">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{s.name || key}</div>
                    {s.initialized ? (
                      <Badge className="bg-emerald-100 text-emerald-700">Initialized</Badge>
                    ) : s.error ? (
                      <Badge className="bg-red-100 text-red-700">Error</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700">Pending</Badge>
                    )}
                  </div>
                  {s.error && (
                    <p className="mt-2 text-xs text-red-600">{s.error}</p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* LocalStorage size */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span className="flex items-center gap-2"><HardDrive className="h-4 w-4" /> Local Storage Usage</span>
              <span>{formatBytes(storageSize)}</span>
            </div>
            <Progress value={Math.min(100, (storageSize / (5 * 1024 * 1024)) * 100)} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">Browser storage limit varies by browser (approx. 5-10 MB).</p>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostics */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sf-pro">
            <TestTube className="h-5 w-5" />
            Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button size="sm" onClick={handleDiagnostics} disabled={runningDiagnostics}>
              <TestTube className="h-4 w-4 mr-2" />
              {runningDiagnostics ? 'Running...' : 'Run Service Test'}
            </Button>
          </div>

          {Object.keys(diagResults).length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(diagResults).map(([k, r]) => (
                <div key={k} className="rounded-lg border border-gray-200 p-3 bg-white/70">
                  <div className="flex items-center justify-between">
                    <div className="font-medium capitalize">{k.replace(/_/g, ' ')}</div>
                    <Badge className={r.success ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                      {r.success ? 'OK' : 'Issue'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-gray-700">{r.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cleanup Operations */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sf-pro">
            <Trash2 className="h-5 w-5" />
            Cleanup Operations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button size="sm" variant="secondary" onClick={handleCleanupStuckToasts}>
              <ShieldAlert className="h-4 w-4 mr-2" />
              Cleanup Stuck Toasts
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={cleaningSamples}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {cleaningSamples ? 'Cleaning...' : 'Remove Sample HR Data'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove all sample HR data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove sample employees and related HR records (time entries, allowances, payroll, etc.). This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCleanupSamples} className="bg-red-600 hover:bg-red-700">Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Auth Maintenance */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sf-pro">
            <Wrench className="h-5 w-5" />
            Authentication Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button size="sm" variant="outline" onClick={handleAuthReset} disabled={authResetting}>
              <ShieldAlert className="h-4 w-4 mr-2" />
              {authResetting ? 'Resetting...' : 'Reset Local Auth State'}
            </Button>

            <Button size="sm" variant="secondary" onClick={() => { initializeLocalAuth(); toast({ title: 'Local auth initialized' }); }}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Reinitialize Local Auth
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" onClick={() => {}}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out Current User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out current user?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will end the current session on this device.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut} className="bg-red-600 hover:bg-red-700">Sign Out</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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
