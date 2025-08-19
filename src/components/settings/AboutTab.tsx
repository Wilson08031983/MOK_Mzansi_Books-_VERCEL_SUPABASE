
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Info, Monitor, Clipboard, CheckCircle2, ExternalLink, Shield, BookOpenText, FileText, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTheme } from 'next-themes';
import { Link } from 'react-router-dom';

const AboutTab = () => {
  const { toast } = useToast();
  const { theme, systemTheme } = useTheme();

  const appInfo = useMemo(() => {
    const mode = import.meta.env.MODE;
    const buildTime = new Date().toLocaleString();
    // Safe fallback version if not injected; can be replaced later with build-time value
    const version = import.meta.env.VITE_APP_VERSION || 'v1.0.0';

    return { version, mode, buildTime };
  }, []);

  const systemInfo = useMemo(() => {
    const nav = navigator as any;
    return {
      browser: nav.userAgent || 'Unknown',
      platform: nav.platform || 'Unknown',
      language: navigator.language || 'Unknown',
      languages: (navigator.languages || []).join(', ') || 'Unknown',
      online: navigator.onLine ? 'Online' : 'Offline',
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
        title: 'Diagnostics copied',
        description: 'System details have been copied to your clipboard.',
      });
    } catch (e) {
      toast({
        title: 'Unable to copy',
        description: 'Your browser blocked clipboard access. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const checkForUpdates = () => {
    // Placeholder: In a real setup, this could call an endpoint or compare against a releases feed
    toast({
      title: 'You are up to date',
      description: `Running ${appInfo.version}. No updates available right now.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* About Overview */}
      <Card className="glass backdrop-blur-xl bg-white/80 dark:bg-black/40 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Info className="h-5 w-5 mr-2" />
            About MOK Mzansi Books
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground font-sf-pro">
            MOK Mzansi Books is an all-in-one business suite designed to simplify operations, from invoicing to reporting, with a focus on a delightful and efficient user experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4 bg-background/60">
              <div className="text-sm text-muted-foreground">Version</div>
              <div className="text-lg font-medium">{appInfo.version}</div>
            </div>
            <div className="rounded-lg border p-4 bg-background/60">
              <div className="text-sm text-muted-foreground">Environment</div>
              <div className="text-lg font-medium capitalize">{appInfo.mode}</div>
            </div>
            <div className="rounded-lg border p-4 bg-background/60">
              <div className="text-sm text-muted-foreground">Build Time</div>
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
            System Information
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
              <Clipboard className="h-4 w-4 mr-2" /> Copy diagnostics
            </Button>
            <Button size="sm" variant="secondary" onClick={checkForUpdates}>
              <CheckCircle2 className="h-4 w-4 mr-2" /> Check for updates
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resources & Legal */}
      <Card className="glass backdrop-blur-xl bg-white/80 dark:bg-black/40 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <BookOpenText className="h-5 w-5 mr-2" />
            Resources & Legal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/privacy" className="rounded-lg border p-4 bg-background/60 hover:bg-accent transition-colors">
              <div className="flex items-center font-medium">
                <Shield className="h-4 w-4 mr-2" /> Privacy Policy
              </div>
              <div className="text-sm text-muted-foreground">Learn how we handle your data</div>
            </Link>
            <Link to="/terms" className="rounded-lg border p-4 bg-background/60 hover:bg-accent transition-colors">
              <div className="flex items-center font-medium">
                <FileText className="h-4 w-4 mr-2" /> Terms of Service
              </div>
              <div className="text-sm text-muted-foreground">Read the terms for using this app</div>
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href="mailto:support@mokmzansibooks.com?subject=Support%20Request%20-%20MOK%20Mzansi%20Books"
              className="inline-flex items-center"
            >
              <Button size="sm" variant="outline">
                <Mail className="h-4 w-4 mr-2" /> Contact support
              </Button>
            </a>
            <a href="https://www.mokmzansibooks.com" target="_blank" rel="noreferrer" className="inline-flex items-center">
              <Button size="sm" variant="ghost">
                <ExternalLink className="h-4 w-4 mr-2" /> Website
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutTab;
