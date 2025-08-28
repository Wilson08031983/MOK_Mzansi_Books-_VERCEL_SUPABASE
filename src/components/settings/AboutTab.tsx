
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Info, Monitor, Clipboard, CheckCircle2, Shield, BookOpenText, FileText, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTheme } from 'next-themes';
import { Link } from 'react-router-dom';
import { useLocalization } from '@/hooks/useLocalization';
import { auditService } from '@/services/auditService';

const AboutTab = () => {
  const { toast } = useToast();
  const { theme, systemTheme } = useTheme();
  const { t } = useLocalization();

  const appInfo = useMemo(() => {
    const mode = import.meta.env.MODE;
    const buildTime = new Date().toLocaleString();
    // Safe fallback version if not injected; can be replaced later with build-time value
    const version = import.meta.env.VITE_APP_VERSION || 'v1.0.6';

    return { version, mode, buildTime };
  }, []);

  const systemInfo = useMemo(() => {
    const nav = navigator as any;
    return {
      browser: nav.userAgent || 'Unknown',
      platform: nav.platform || 'Unknown',
      language: navigator.language || 'Unknown',
      languages: (navigator.languages || []).join(', ') || 'Unknown',
      online: navigator.onLine ? t('settings.help.stats.online') : t('settings.help.stats.offline'),
      memory: (nav.deviceMemory ? `${nav.deviceMemory} GB` : 'Unknown'),
      cores: (nav.hardwareConcurrency ? `${nav.hardwareConcurrency}` : 'Unknown'),
      theme: theme === 'system' ? `System (${systemTheme || 'auto'})` : theme,
    };
  }, [theme, systemTheme]);

  const copyDiagnostics = async () => {
    const payload = {
      app: appInfo,
      system: systemInfo,
      timestamp: new Date().toISOString(),
      location: window.location.href,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      toast({
        title: t('settings.about.toasts.diagnosticsCopiedTitle'),
        description: t('settings.about.toasts.diagnosticsCopiedDesc'),
      });
      try {
        auditService.logAudit({
          category: 'about',
          action: 'Diagnostics Copied',
          page: 'Settings',
          section: 'About',
          entityType: 'diagnostics',
          changeType: 'export',
          description: 'User copied system/application diagnostics to clipboard',
          metadata: payload,
        });
      } catch {/* noop */}
    } catch (e) {
      toast({
        title: t('settings.about.toasts.copyFailedTitle'),
        description: t('settings.about.toasts.copyFailedDesc'),
        variant: 'destructive',
      });
      try {
        auditService.logAudit({
          category: 'about',
          action: 'Diagnostics Copy Failed',
          page: 'Settings',
          section: 'About',
          entityType: 'diagnostics',
          changeType: 'read',
          description: 'Attempt to copy diagnostics failed',
          metadata: { error: String(e) },
          severity: 'warning'
        });
      } catch {/* noop */}
    }
  };

  const checkForUpdates = () => {
    // Placeholder: In a real setup, this could call an endpoint or compare against a releases feed
    toast({
      title: t('settings.about.toasts.upToDateTitle'),
      description: t('settings.about.toasts.upToDateDesc', { version: appInfo.version }),
    });
    try {
      auditService.logAudit({
        category: 'about',
        action: 'Check For Updates',
        page: 'Settings',
        section: 'About',
        entityType: 'application',
        changeType: 'read',
        description: `User checked for updates. Current version: ${appInfo.version}`,
      });
    } catch {/* noop */}
  };

  return (
    <div className="space-y-6">
      {/* About Overview */}
      <Card className="glass backdrop-blur-xl bg-white/80 dark:bg-black/40 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Info className="h-5 w-5 mr-2" />
            {t('settings.about.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground font-sf-pro">
            {t('settings.about.intro')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4 bg-background/60">
              <div className="text-sm text-muted-foreground">{t('settings.about.labels.version')}</div>
              <div className="text-lg font-medium">{appInfo.version}</div>
            </div>
            <div className="rounded-lg border p-4 bg-background/60">
              <div className="text-sm text-muted-foreground">{t('settings.about.labels.environment')}</div>
              <div className="text-lg font-medium capitalize">{appInfo.mode}</div>
            </div>
            <div className="rounded-lg border p-4 bg-background/60">
              <div className="text-sm text-muted-foreground">{t('settings.about.labels.buildTime')}</div>
              <div className="text-lg font-medium">{appInfo.buildTime}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card className="glass backdrop-blur-xl bg-white/80 dark:bg-black/40 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Monitor className="h-5 w-5 mr-2" />
            {t('settings.about.labels.systemInformation')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(systemInfo).map(([key, value]) => (
              <div key={key} className="rounded-lg border p-4 bg-background/60">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{key}</div>
                <div className="text-sm break-words">{String(value)}</div>
              </div>
            ))}
          </div>
          <Separator className="my-2" />
          <div className="flex flex-wrap gap-3">
            <Button size="sm" onClick={copyDiagnostics}>
              <Clipboard className="h-4 w-4 mr-2" /> {t('settings.about.buttons.copyDiagnostics')}
            </Button>
            <Button size="sm" variant="secondary" onClick={checkForUpdates}>
              <CheckCircle2 className="h-4 w-4 mr-2" /> {t('settings.about.buttons.checkForUpdates')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resources & Legal */}
      <Card className="glass backdrop-blur-xl bg-white/80 dark:bg-black/40 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <BookOpenText className="h-5 w-5 mr-2" />
            {t('settings.about.resources.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/privacy" className="rounded-lg border p-4 bg-background/60 hover:bg-accent transition-colors">
              <div className="flex items-center font-medium">
                <Shield className="h-4 w-4 mr-2" /> {t('settings.about.resources.privacy')}
              </div>
              <div className="text-sm text-muted-foreground">{t('settings.about.resources.privacyDesc')}</div>
            </Link>
            <Link to="/terms" className="rounded-lg border p-4 bg-background/60 hover:bg-accent transition-colors">
              <div className="flex items-center font-medium">
                <FileText className="h-4 w-4 mr-2" /> {t('settings.about.resources.terms')}
              </div>
              <div className="text-sm text-muted-foreground">{t('settings.about.resources.termsDesc')}</div>
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href="mailto:support@mokmzansibooks.com?subject=Support%20Request%20-%20MOK%20Mzansi%20Books"
              className="inline-flex items-center"
              onClick={() => { try { auditService.logAudit({ category: 'about', action: 'Contact Support', page: 'Settings', section: 'About', entityType: 'support', changeType: 'send', description: 'User clicked contact support email link from About tab', }); } catch {/* noop */} }}
            >
              <Button size="sm" variant="outline">
                <Mail className="h-4 w-4 mr-2" /> {t('settings.about.buttons.contactSupport')}
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutTab;
