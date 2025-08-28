
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, LifeBuoy, Mail, BookOpen, Bug, Clipboard, RefreshCcw, Trash2, ShieldAlert, Network, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link, useLocation } from 'react-router-dom';
import * as ls from '@/services/localStorageService';
import { stuckToastCleanupService } from '@/services/stuckToastCleanupService';
import { resetAndReload } from '@/services/resetLocalAuth';
import { useLocalization } from '@/hooks/useLocalization';
import { auditService } from '@/services/auditService';

const HelpSupportTab = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [autoCleanupEnabled, setAutoCleanupEnabled] = useState(false);
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(false);
  const { t } = useLocalization();

  // Lightweight telemetry logger
  const telemetry = (event: string, details?: Record<string, any>) => {
    try {
      console.info('[Telemetry]', {
        event,
        path: location.pathname,
        ts: new Date().toISOString(),
        ...(details || {}),
      });
    } catch {/* noop */}
  };

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
     
    console.log('[HelpSupportTab] Copy diagnostics requested');
    telemetry('help.copyDiagnostics');
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
      const text = JSON.stringify(payload, null, 2);
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for environments without Clipboard API
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      toast({ title: t('settings.help.toasts.diagnosticsCopiedTitle') || 'Diagnostics copied', description: t('settings.help.toasts.diagnosticsCopiedDesc') || 'Diagnostic info copied to clipboard.' });
      
      console.log('[HelpSupportTab] Diagnostics copied to clipboard', payload);
      try {
        auditService.logAudit({
          category: 'system',
          action: 'Diagnostics Copied',
          page: 'Settings',
          section: 'Help & Support',
          changeType: 'export',
          description: 'Copied diagnostics data to clipboard from Help & Support',
          metadata: payload,
        });
      } catch (e) {
        console.warn('[HelpSupportTab] Failed to audit diagnostics copy', e);
      }
    } catch (e) {
      toast({ title: t('settings.help.toasts.copyFailedTitle') || 'Copy failed', description: t('settings.help.toasts.copyFailedDesc') || 'Could not copy diagnostics to clipboard.', variant: 'destructive' });
      
      console.warn('[HelpSupportTab] Failed to copy diagnostics', e);
      try {
        auditService.logAudit({
          category: 'system',
          action: 'Diagnostics Copy Failed',
          page: 'Settings',
          section: 'Help & Support',
          changeType: 'read',
          description: 'Failed to copy diagnostics data',
          metadata: { error: String(e) },
        });
      } catch {/* noop */}
    }
  };

  const clearAppCache = async () => {
     
    console.log('[HelpSupportTab] Clear app cache initiated');
    telemetry('help.clearCache.click');
    const confirmClear = window.confirm(t('settings.help.confirms.clearCache'));
    if (!confirmClear) return;

    const ok = ls.clear();
    if (ok) {
      toast({ title: t('settings.help.toasts.cacheClearedTitle') || 'Cache cleared', description: t('settings.help.toasts.cacheClearedDesc') || 'Local app cache was cleared.' });
       
      console.log('[HelpSupportTab] Cache cleared, reloading');
      try {
        auditService.logAudit({
          category: 'settings',
          action: 'App Cache Cleared',
          page: 'Settings',
          section: 'Help & Support',
          changeType: 'delete',
          description: 'User cleared local application cache',
        });
      } catch {/* noop */}
      setTimeout(() => window.location.reload(), 600);
    } else {
      toast({ title: t('settings.help.toasts.cacheClearFailedTitle') || 'Failed to clear cache', description: t('settings.help.toasts.cacheClearFailedDesc') || 'An error occurred while clearing cache.', variant: 'destructive' });
       
      console.warn('[HelpSupportTab] Failed to clear cache');
      try {
        auditService.logAudit({
          category: 'settings',
          action: 'App Cache Clear Failed',
          page: 'Settings',
          section: 'Help & Support',
          changeType: 'update',
          description: 'Attempt to clear local application cache failed',
        });
      } catch {/* noop */}
    }
  };

  const toggleAutoCleanup = () => {
    if (!autoCleanupEnabled) {
      stuckToastCleanupService.initialize();
      setAutoCleanupEnabled(true);
      toast({ title: t('settings.help.toasts.autoCleanEnabledTitle') || 'Auto-clean enabled', description: t('settings.help.toasts.autoCleanEnabledDesc') || 'The service will periodically clear stuck toasts.' });
      
      console.log('[HelpSupportTab] Auto-clean enabled');
      telemetry('help.autoClean.enabled');
      try {
        auditService.logSettings('Auto-clean Enabled', 'Settings', 'Help & Support', { enabled: false }, { enabled: true });
      } catch {/* noop */}
    } else {
      stuckToastCleanupService.stop();
      setAutoCleanupEnabled(false);
      toast({ title: t('settings.help.toasts.autoCleanDisabledTitle') || 'Auto-clean disabled', description: t('settings.help.toasts.autoCleanDisabledDesc') || 'Periodic cleanups have been stopped.' });
      
      console.log('[HelpSupportTab] Auto-clean disabled');
      telemetry('help.autoClean.disabled');
      try {
        auditService.logSettings('Auto-clean Disabled', 'Settings', 'Help & Support', { enabled: true }, { enabled: false });
      } catch {/* noop */}
    }
  };

  const forceCleanup = () => {
     
    console.log('[HelpSupportTab] Force cleanup requested');
    telemetry('help.forceCleanup');
    stuckToastCleanupService.forceCleanupAndShowStatus();
    try {
      auditService.logSettings('Force Cleanup Triggered', 'Settings', 'Help & Support');
    } catch {/* noop */}
  };

  const checkNetwork = async () => {
    setIsCheckingNetwork(true);
    try {
       
      console.log('[HelpSupportTab] Checking network...');
      telemetry('help.checkNetwork.start', { online: navigator.onLine });
      try {
        auditService.logAudit({
          category: 'system',
          action: 'Network Check Started',
          page: 'Settings',
          section: 'Help & Support',
          changeType: 'read',
          description: 'User initiated network connectivity check',
          metadata: { online: navigator.onLine },
        });
      } catch {/* noop */}
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3500);
      await fetch(window.location.origin, { method: 'HEAD', cache: 'no-store', signal: controller.signal });
      clearTimeout(id);
      toast({ title: t('settings.help.toasts.networkOkTitle') || 'Network OK', description: t('settings.help.toasts.networkOkDesc') || 'Your network appears to be working.' });
       
      console.log('[HelpSupportTab] Network OK');
      telemetry('help.checkNetwork.success');
      try {
        auditService.logAudit({
          category: 'system',
          action: 'Network Check Success',
          page: 'Settings',
          section: 'Help & Support',
          changeType: 'read',
          description: 'Network connectivity check succeeded',
        });
      } catch {/* noop */}
    } catch (e) {
      toast({ title: t('settings.help.toasts.networkIssueTitle') || 'Network issue', description: t('settings.help.toasts.networkIssueDesc') || 'We could not verify connectivity.', variant: 'destructive' });
       
      console.warn('[HelpSupportTab] Network check failed', e);
      telemetry('help.checkNetwork.error', { error: String(e) });
      try {
        auditService.logAudit({
          category: 'system',
          action: 'Network Check Failed',
          page: 'Settings',
          section: 'Help & Support',
          changeType: 'read',
          description: 'Network connectivity check failed',
          metadata: { error: String(e) },
        });
      } catch {/* noop */}
    } finally {
      setIsCheckingNetwork(false);
    }
  };

  const resetAuthAndReload = () => {
    const ok = window.confirm(t('settings.help.confirms.resetAuth'));
    if (!ok) {
       
      console.log('[HelpSupportTab] Reset auth cancelled');
      try {
        auditService.logAudit({
          category: 'auth',
          action: 'Reset Auth Cancelled',
          page: 'Settings',
          section: 'Help & Support',
          changeType: 'read',
          description: 'User cancelled local auth reset',
        });
      } catch {/* noop */}
      return;
    }
     
    console.log('[HelpSupportTab] Reset auth confirmed, reloading');
    telemetry('help.resetAuth');
    try {
      auditService.logAuth('Reset Local Auth', 'User triggered local auth reset from Help & Support');
    } catch {/* noop */}
    resetAndReload();
  };

  // Context detection for per-page guidance
  const ctx = useMemo(() => {
    const path = location.pathname.toLowerCase();
    // Map common routes to keys/titles
    const map: Record<string, { key: string; title: string }> = {
      '/company': { key: 'company', title: t('nav.company') },
      '/clients': { key: 'clients', title: t('nav.clients') },
      '/quotations': { key: 'quotations', title: t('nav.quotations') },
      '/invoices': { key: 'invoices', title: t('nav.invoices') },
      '/projects': { key: 'projects', title: t('nav.projects') },
      '/inventory': { key: 'inventory', title: t('nav.inventory') },
      '/hr-management': { key: 'hr', title: t('nav.hr') },
      '/accounting': { key: 'accounting', title: t('nav.accounting') },
      '/settings': { key: 'settings', title: t('nav.settings') },
    };
    const match = map[path] ?? { key: 'generic', title: t('common.overview') };
    return { ...match, path };
  }, [location.pathname, t]);

  useEffect(() => {
    // Log contextual mount for diagnostics
     
    console.log('[HelpSupportTab] Mounted on route:', ctx.path, 'contextKey:', ctx.key);
  }, [ctx.path, ctx.key]);

  const renderContextualGuidance = () => {
    switch (ctx.key) {
      case 'company':
        return (
          <>
            <p className="text-muted-foreground font-sf-pro">{t('settings.help.contextual.company.p1')}</p>
            <ul className="list-disc ml-5 space-y-1 text-sm font-sf-pro">
              <li>{t('settings.help.contextual.company.li1')}</li>
              <li>{t('settings.help.contextual.company.li2')}</li>
              <li>{t('settings.help.contextual.company.li3')}</li>
              <li>{t('settings.help.contextual.company.li4')}</li>
            </ul>
          </>
        );
      case 'clients':
        return (
          <>
            <p className="text-muted-foreground font-sf-pro">{t('settings.help.contextual.clients.p1')}</p>
            <ul className="list-disc ml-5 space-y-1 text-sm font-sf-pro">
              <li>{t('settings.help.contextual.clients.li1')}</li>
              <li>{t('settings.help.contextual.clients.li2')}</li>
              <li>{t('settings.help.contextual.clients.li3')}</li>
            </ul>
          </>
        );
      case 'quotations':
        return (
          <>
            <p className="text-muted-foreground font-sf-pro">{t('settings.help.contextual.quotations.p1')}</p>
            <ul className="list-disc ml-5 space-y-1 text-sm font-sf-pro">
              <li>{t('settings.help.contextual.quotations.li1')}</li>
              <li>{t('settings.help.contextual.quotations.li2')}</li>
              <li>{t('settings.help.contextual.quotations.li3')}</li>
              <li>{t('settings.help.contextual.quotations.li4')}</li>
            </ul>
          </>
        );
      case 'invoices':
        return (
          <>
            <p className="text-muted-foreground font-sf-pro">{t('settings.help.contextual.invoices.p1')}</p>
            <ul className="list-disc ml-5 space-y-1 text-sm font-sf-pro">
              <li>{t('settings.help.contextual.invoices.li1')}</li>
              <li>{t('settings.help.contextual.invoices.li2')}</li>
              <li>{t('settings.help.contextual.invoices.li3')}</li>
            </ul>
          </>
        );
      case 'projects':
        return (
          <>
            <p className="text-muted-foreground font-sf-pro">{t('settings.help.contextual.projects.p1')}</p>
            <ul className="list-disc ml-5 space-y-1 text-sm font-sf-pro">
              <li>{t('settings.help.contextual.projects.li1')}</li>
              <li>{t('settings.help.contextual.projects.li2')}</li>
            </ul>
          </>
        );
      case 'inventory':
        return (
          <>
            <p className="text-muted-foreground font-sf-pro">{t('settings.help.contextual.inventory.p1')}</p>
            <ul className="list-disc ml-5 space-y-1 text-sm font-sf-pro">
              <li>{t('settings.help.contextual.inventory.li1')}</li>
              <li>{t('settings.help.contextual.inventory.li2')}</li>
            </ul>
          </>
        );
      case 'hr':
        return (
          <>
            <p className="text-muted-foreground font-sf-pro">{t('settings.help.contextual.hr.p1')}</p>
            <ul className="list-disc ml-5 space-y-1 text-sm font-sf-pro">
              <li>{t('settings.help.contextual.hr.li1')}</li>
              <li>{t('settings.help.contextual.hr.li2')}</li>
            </ul>
          </>
        );
      case 'accounting':
        return (
          <>
            <p className="text-muted-foreground font-sf-pro">{t('settings.help.contextual.accounting.p1')}</p>
            <ul className="list-disc ml-5 space-y-1 text-sm font-sf-pro">
              <li>{t('settings.help.contextual.accounting.li1')}</li>
              <li>{t('settings.help.contextual.accounting.li2')}</li>
            </ul>
          </>
        );
      case 'settings':
        return (
          <>
            <p className="text-muted-foreground font-sf-pro">{t('settings.help.contextual.settings.p1')}</p>
            <ul className="list-disc ml-5 space-y-1 text-sm font-sf-pro">
              <li>{t('settings.help.contextual.settings.li1')}</li>
              <li>{t('settings.help.contextual.settings.li2')}</li>
            </ul>
          </>
        );
      default:
        return (
          <>
            <p className="text-muted-foreground font-sf-pro">{t('settings.help.contextual.generic')}</p>
          </>
        );
    }
  };

  const openSupportEmail = () => {
     
    console.log('[HelpSupportTab] Opening support email link');
    const subject = encodeURIComponent(t('settings.help.mail.subject'));
    const body = encodeURIComponent(t('settings.help.mail.body'));
    try {
      window.location.href = `mailto:support@mokmzansibooks.com?subject=${subject}&body=${body}`;
      // Provide guidance in case user has no mail client
      setTimeout(() => {
        toast({
          title: t('settings.help.toasts.mailtoHintTitle'),
          description: t('settings.help.toasts.mailtoHintDesc'),
        });
      }, 300);
      try {
        auditService.logAudit({
          category: 'system',
          action: 'Open Support Email',
          page: 'Settings',
          section: 'Help & Support',
          changeType: 'send',
          description: 'Opened default mail client to contact support',
        });
      } catch {/* noop */}
    } catch {
      toast({ title: t('settings.help.toasts.mailtoOpenFailedTitle'), description: t('settings.help.toasts.mailtoOpenFailedDesc'), variant: 'destructive' });
      try {
        auditService.logAudit({
          category: 'system',
          action: 'Open Support Email Failed',
          page: 'Settings',
          section: 'Help & Support',
          changeType: 'read',
          description: 'Failed to open default mail client',
        });
      } catch {/* noop */}
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Help */}
      <Card className="glass backdrop-blur-xl bg-white/80 dark:bg-black/40 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <HelpCircle className="h-5 w-5 mr-2" />
            {t('settings.help.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground font-sf-pro">{t('settings.help.intro')}</p>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" aria-label={t('settings.help.buttons.emailSupport')} onClick={openSupportEmail}>
              <Mail className="h-4 w-4 mr-2" /> {t('settings.help.buttons.emailSupport')}
            </Button>
            <Link to="/contact" className="inline-flex">
              <Button size="sm" variant="secondary" aria-label={t('settings.help.buttons.contactPage')}>
                <LifeBuoy className="h-4 w-4 mr-2" /> {t('settings.help.buttons.contactPage')}
              </Button>
            </Link>
            <Button size="sm" variant="outline" aria-label={t('settings.help.buttons.copyDiagnostics')} onClick={copyDiagnostics}>
              <Clipboard className="h-4 w-4 mr-2" /> {t('settings.help.buttons.copyDiagnostics')}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="rounded-lg border p-4 bg-background/60">
              <div className="text-xs uppercase text-muted-foreground">{t('settings.help.stats.status')}</div>
              <div className="text-sm">{stats.online ? t('settings.help.stats.online') : t('settings.help.stats.offline')}</div>
            </div>
            <div className="rounded-lg border p-4 bg-background/60">
              <div className="text-xs uppercase text-muted-foreground">{t('settings.help.stats.storageKeys')}</div>
              <div className="text-sm">{stats.keysCount}</div>
            </div>
            <div className="rounded-lg border p-4 bg-background/60">
              <div className="text-xs uppercase text-muted-foreground">{t('settings.help.stats.localDataSize')}</div>
              <div className="text-sm">{`${stats.sizeKB} KB`}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="glass backdrop-blur-xl bg-white/80 dark:bg-black/40 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <ShieldAlert className="h-5 w-5 mr-2" />
            {t('settings.help.troubleshooting')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Button size="sm" aria-label={autoCleanupEnabled ? t('settings.help.buttons.disableAutoClean') : t('settings.help.buttons.enableAutoClean')} variant={autoCleanupEnabled ? 'secondary' : 'default'} onClick={toggleAutoCleanup}>
              <RefreshCcw className="h-4 w-4 mr-2" /> {autoCleanupEnabled ? t('settings.help.buttons.disableAutoClean') : t('settings.help.buttons.enableAutoClean')}
            </Button>
            <Button size="sm" aria-label={t('settings.help.buttons.forceCleanupNow')} variant="outline" onClick={forceCleanup}>
              <Bug className="h-4 w-4 mr-2" /> {t('settings.help.buttons.forceCleanupNow')}
            </Button>
            <Button size="sm" aria-label={t('settings.help.buttons.checkNetwork')} variant="outline" onClick={checkNetwork} disabled={isCheckingNetwork}>
              {isCheckingNetwork ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Network className="h-4 w-4 mr-2" />}
              {t('settings.help.buttons.checkNetwork')} {isCheckingNetwork ? `(${navigator.onLine ? (t('common.online') || 'Online') : (t('common.offline') || 'Offline')})` : ''}
            </Button>
            <Button size="sm" aria-label={t('settings.help.buttons.clearAppCache')} variant="destructive" onClick={clearAppCache}>
              <Trash2 className="h-4 w-4 mr-2" /> {t('settings.help.buttons.clearAppCache')}
            </Button>
            <Button size="sm" aria-label={t('settings.help.buttons.resetAuthReload')} variant="secondary" onClick={resetAuthAndReload}>
              <CheckCircle2 className="h-4 w-4 mr-2" /> {t('settings.help.buttons.resetAuthReload')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contextual Guidance */}
      <Card className="glass backdrop-blur-xl bg-white/80 dark:bg-black/40 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <HelpCircle className="h-5 w-5 mr-2" />
            {t('settings.help.contextual.heading', { title: ctx.title })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {renderContextualGuidance()}
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card className="glass backdrop-blur-xl bg-white/80 dark:bg-black/40 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <BookOpen className="h-5 w-5 mr-2" />
            {t('settings.help.faqs.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>{t('settings.help.faqs.q1')}</AccordionTrigger>
              <AccordionContent>
                {t('settings.help.faqs.a1')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>{t('settings.help.faqs.q2')}</AccordionTrigger>
              <AccordionContent>
                {t('settings.help.faqs.a2')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>{t('settings.help.faqs.q3')}</AccordionTrigger>
              <AccordionContent>
                {t('settings.help.faqs.a3')}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpSupportTab;
