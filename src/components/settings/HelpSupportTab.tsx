
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, LifeBuoy, Mail, BookOpen, Bug, Clipboard, RefreshCcw, Trash2, ShieldAlert, Network, ExternalLink, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import * as ls from '@/services/localStorageService';
import { stuckToastCleanupService } from '@/services/stuckToastCleanupService';
import { resetAndReload } from '@/services/resetLocalAuth';

const HelpSupportTab = () => {
  const { toast } = useToast();
  const [autoCleanupEnabled, setAutoCleanupEnabled] = useState(false);
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(false);

  useEffect(() => {
    return () => {
      // Stop cleanup when leaving the tab if it was enabled
      if (autoCleanupEnabled) {
        stuckToastCleanupService.stop();
      }
    };
  }, [autoCleanupEnabled]);

  const stats = useMemo(() => {
    const sizeBytes = ls.getSize();
    const keys = ls.getAllKeys();
    const toKB = (bytes: number) => (bytes / 1024).toFixed(2);
    return {
      keysCount: keys.length,
      sizeBytes,
      sizeKB: toKB(sizeBytes),
      online: navigator.onLine,
      mode: import.meta.env.MODE,
    };
  }, []);

  const copyDiagnostics = async () => {
    const payload = {
      help: true,
      env: stats.mode,
      online: navigator.onLine,
      url: window.location.href,
      storage: {
        keysCount: ls.getAllKeys().length,
        sizeBytes: ls.getSize(),
      },
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      toast({ title: 'Diagnostics copied', description: 'Details copied to clipboard. Paste into your support message.' });
    } catch (e) {
      toast({ title: 'Copy failed', description: 'Clipboard access was blocked by your browser.', variant: 'destructive' });
    }
  };

  const clearAppCache = async () => {
    const confirmClear = window.confirm('This will clear local application data and may sign you out. Continue?');
    if (!confirmClear) return;

    const ok = ls.clear();
    if (ok) {
      toast({ title: 'Cache cleared', description: 'Local data cleared successfully. Reloading…' });
      setTimeout(() => window.location.reload(), 600);
    } else {
      toast({ title: 'Failed to clear cache', description: 'Please try again or contact support.', variant: 'destructive' });
    }
  };

  const toggleAutoCleanup = () => {
    if (!autoCleanupEnabled) {
      stuckToastCleanupService.initialize();
      setAutoCleanupEnabled(true);
      toast({ title: 'Auto-clean enabled', description: 'We will periodically remove stuck syncing toasts.' });
    } else {
      stuckToastCleanupService.stop();
      setAutoCleanupEnabled(false);
      toast({ title: 'Auto-clean disabled', description: 'Periodic cleanup has been stopped.' });
    }
  };

  const forceCleanup = () => {
    stuckToastCleanupService.forceCleanupAndShowStatus();
  };

  const checkNetwork = async () => {
    setIsCheckingNetwork(true);
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3500);
      await fetch(window.location.origin, { method: 'HEAD', cache: 'no-store', signal: controller.signal });
      clearTimeout(id);
      toast({ title: 'Network looks good', description: 'Your browser is online and the app is reachable.' });
    } catch (e) {
      toast({ title: 'Network issue detected', description: 'We could not reach the app origin. Check your connection.', variant: 'destructive' });
    } finally {
      setIsCheckingNetwork(false);
    }
  };

  const resetAuthAndReload = () => {
    const ok = window.confirm('Reset local authentication and reload? Default accounts will be recreated.');
    if (!ok) return;
    resetAndReload();
  };

  const openSupportEmail = () => {
    const subject = encodeURIComponent('Support Request - MOK Mzansi Books');
    const body = encodeURIComponent('Describe your issue here...\n\n(You can paste diagnostics you copied here)');
    window.location.href = `mailto:support@mokmzansibooks.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      {/* Quick Help */}
      <Card className="glass backdrop-blur-xl bg-white/80 dark:bg-black/40 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <HelpCircle className="h-5 w-5 mr-2" />
            Help & Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground font-sf-pro">Get assistance, explore resources, or troubleshoot common issues.</p>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" onClick={openSupportEmail}>
              <Mail className="h-4 w-4 mr-2" /> Email Support
            </Button>
            <Link to="/contact" className="inline-flex">
              <Button size="sm" variant="secondary">
                <LifeBuoy className="h-4 w-4 mr-2" /> Contact Page
              </Button>
            </Link>
            <a href="https://www.mokmzansibooks.com" target="_blank" rel="noreferrer" className="inline-flex">
              <Button size="sm" variant="ghost">
                <BookOpen className="h-4 w-4 mr-2" /> Website <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </a>
            <Button size="sm" variant="outline" onClick={copyDiagnostics}>
              <Clipboard className="h-4 w-4 mr-2" /> Copy diagnostics
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="rounded-lg border p-4 bg-background/60">
              <div className="text-xs uppercase text-muted-foreground">Status</div>
              <div className="text-sm">{stats.online ? 'Online' : 'Offline'}</div>
            </div>
            <div className="rounded-lg border p-4 bg-background/60">
              <div className="text-xs uppercase text-muted-foreground">Storage Keys</div>
              <div className="text-sm">{stats.keysCount}</div>
            </div>
            <div className="rounded-lg border p-4 bg-background/60">
              <div className="text-xs uppercase text-muted-foreground">Local Data Size</div>
              <div className="text-sm">{stats.sizeKB} KB</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="glass backdrop-blur-xl bg-white/80 dark:bg-black/40 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <ShieldAlert className="h-5 w-5 mr-2" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Button size="sm" variant={autoCleanupEnabled ? 'secondary' : 'default'} onClick={toggleAutoCleanup}>
              <RefreshCcw className="h-4 w-4 mr-2" /> {autoCleanupEnabled ? 'Disable' : 'Enable'} Auto-clean stuck toasts
            </Button>
            <Button size="sm" variant="outline" onClick={forceCleanup}>
              <Bug className="h-4 w-4 mr-2" /> Force cleanup now
            </Button>
            <Button size="sm" variant="outline" onClick={checkNetwork} disabled={isCheckingNetwork}>
              {isCheckingNetwork ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Network className="h-4 w-4 mr-2" />}
              Check network
            </Button>
            <Button size="sm" variant="destructive" onClick={clearAppCache}>
              <Trash2 className="h-4 w-4 mr-2" /> Clear app cache
            </Button>
            <Button size="sm" variant="secondary" onClick={resetAuthAndReload}>
              <CheckCircle2 className="h-4 w-4 mr-2" /> Reset auth & reload
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card className="glass backdrop-blur-xl bg-white/80 dark:bg-black/40 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <BookOpen className="h-5 w-5 mr-2" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I contact support?</AccordionTrigger>
              <AccordionContent>
                Use the Email Support button above or write to support@mokmzansibooks.com. Include screenshots and steps to reproduce the issue.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How do I clear stuck loading spinners?</AccordionTrigger>
              <AccordionContent>
                Use "Force cleanup now" to dismiss any stuck toasts and spinners. You can also enable Auto-clean to run periodically in the background.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Will clearing app cache log me out?</AccordionTrigger>
              <AccordionContent>
                Clearing cache removes local data and may sign you out. You can sign back in or use the Reset auth action to recreate default test accounts.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpSupportTab;
