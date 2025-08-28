
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { 
  Smartphone, 
  Camera, 
  Vibrate, 
  Download, 
  Share, 
  Monitor, 
  Settings,
  Scan,
  FlipHorizontal,
  Volume2,
  VolumeX,
  RefreshCw,
  Zap,
  Tablet
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useIsMobile } from '@/hooks/use-mobile';
import { setItem, getItem } from '@/services/localStorageService';
import { getDefaultConfig, type ScannerConfig } from '@/services/barcodeScannerService';
import { useLocalization } from '@/hooks/useLocalization';

// Types for mobile settings
interface MobileSettings {
  scanner: {
    fps: number;
    qrboxSize: number;
    aspectRatio: number;
    disableFlip: boolean;
    preferredCamera: string;
    beepEnabled: boolean;
    vibrationEnabled: boolean;
  };
  layout: {
    compactMode: boolean;
    hideSidebar: boolean;
    optimizeTouch: boolean;
    largeButtons: boolean;
  };
  accessibility: {
    hapticFeedback: boolean;
    voiceAssistance: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
  };
  pwa: {
    autoPrompt: boolean;
    offlineMode: boolean;
    backgroundSync: boolean;
  };
}

const DEFAULT_MOBILE_SETTINGS: MobileSettings = {
  scanner: {
    fps: 10,
    qrboxSize: 250,
    aspectRatio: 1.0,
    disableFlip: false,
    preferredCamera: 'environment',
    beepEnabled: true,
    vibrationEnabled: true,
  },
  layout: {
    compactMode: true,
    hideSidebar: false,
    optimizeTouch: true,
    largeButtons: false,
  },
  accessibility: {
    hapticFeedback: true,
    voiceAssistance: false,
    highContrast: false,
    reducedMotion: false,
  },
  pwa: {
    autoPrompt: true,
    offlineMode: false,
    backgroundSync: false,
  },
};

const MobileSettingsTab = () => {
  const [settings, setSettings] = useState<MobileSettings>(DEFAULT_MOBILE_SETTINGS);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [notificationPermission, setNotificationPermission] = useState<'granted' | 'denied' | 'default'>('default');
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    userAgent: '',
    isTouchDevice: false,
    screenSize: '',
    isStandalone: false,
  });
  
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const installEventRef = useRef<any>(null);
  const { t } = useLocalization();
  const [testingScanner, setTestingScanner] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  // Generate a unique ID for each scanner instance to prevent DOM conflicts
  const scannerContainerId = useRef(`test-scanner-preview-${Math.random().toString(36).substring(2, 15)}`);
  
  // Keep track of component mount state to prevent async operations after unmount
  const isMounted = useRef(true);

  // Load settings on mount
  useEffect(() => {
    const savedSettings = getItem<MobileSettings>('mobileSettings', DEFAULT_MOBILE_SETTINGS);
    setSettings(savedSettings);
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      // Execute cleanup synchronously to ensure it happens before component is fully unmounted
      (async () => {
        try {
          if (scannerRef.current) {
            // @ts-ignore isScanning is not in types but exists
            if (scannerRef.current.isScanning) {
              await scannerRef.current.stop();
            }
            await scannerRef.current.clear();
          }
        } catch (e) {
          console.warn('Error during unmount cleanup', e);
        } finally {
          scannerRef.current = null;
        }
      })();
    };
  }, []);

  // Detect device capabilities and permissions
  useEffect(() => {
    const detectDevice = () => {
      setDeviceInfo({
        userAgent: navigator.userAgent,
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      });
    };

    const checkPermissions = async () => {
      // Check camera permission
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setCameraPermission('granted');
          stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          setCameraPermission('denied');
        }
      }

      // Check notification permission
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    };

    // Load available cameras
    const loadCameras = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        setAvailableCameras(cameras || []);
      } catch (error) {
        console.error('Error loading cameras:', error);
      }
    };

    detectDevice();
    checkPermissions();
    loadCameras();

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setIsInstallable(true);
      installEventRef.current = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Update settings and save to localStorage
  const updateSettings = <K extends keyof MobileSettings>(
    category: K,
    key: keyof MobileSettings[K],
    value: any
  ) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    };
    setSettings(newSettings);
    setItem('mobileSettings', newSettings);
  };

  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission('granted');
      stream.getTracks().forEach(track => track.stop());
      toast({
        title: t('settings.mobile.toasts.cameraGrantedTitle'),
        description: t('settings.mobile.toasts.cameraGrantedDesc'),
      });
    } catch (error) {
      setCameraPermission('denied');
      toast({
        title: t('settings.mobile.toasts.cameraDeniedTitle'),
        description: t('settings.mobile.toasts.cameraDeniedDesc'),
        variant: 'destructive',
      });
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        toast({
          title: t('settings.mobile.toasts.notificationsEnabledTitle'),
          description: t('settings.mobile.receiveMobileNotifications'),
        });
      }
    }
  };

  // Test vibration
  const testVibration = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
      toast({
        title: t('settings.mobile.toasts.vibrationTestTitle'),
        description: t('settings.mobile.toasts.vibrationTestDesc'),
      });
    } else {
      toast({
        title: t('settings.mobile.toasts.vibrationNotSupportedTitle'),
        description: t('settings.mobile.toasts.vibrationNotSupportedDesc'),
        variant: 'destructive',
      });
    }
  };

  // Install PWA
  const installPWA = async () => {
    if (installPromptEvent) {
      const result = await installPromptEvent.prompt();
      if (result.outcome === 'accepted') {
        toast({
          title: t('settings.mobile.toasts.appInstalledTitle'),
          description: t('settings.mobile.toasts.appInstalledDesc'),
        });
        setIsInstallable(false);
        setInstallPromptEvent(null);
      }
    }
  };

  // Share app
  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MOK Mzansi Books',
          text: 'Check out this awesome business management app!',
          url: window.location.origin,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin);
        toast({
          title: t('settings.mobile.toasts.linkCopiedTitle'),
          description: t('settings.mobile.toasts.linkCopiedDesc'),
        });
      } catch (error) {
        toast({
          title: t('settings.mobile.toasts.shareNotSupportedTitle'),
          description: t('settings.mobile.toasts.shareNotSupportedDesc'),
          variant: 'destructive',
        });
      }
    }
  };

  const permissionLabel = (p: string) => {
    switch (p) {
      case 'granted':
        return t('settings.mobile.permissionGranted');
      case 'denied':
        return t('settings.mobile.permissionDenied');
      case 'prompt':
      case 'default':
        return t('settings.mobile.permissionPrompt');
      case 'unknown':
      default:
        return t('settings.mobile.permissionUnknown');
    }
  };

  // Apply layout changes immediately
  useEffect(() => {
    const root = document.documentElement;
    if (settings.layout.compactMode) {
      root.classList.add('mobile-compact');
    } else {
      root.classList.remove('mobile-compact');
    }
    
    if (settings.layout.largeButtons) {
      root.classList.add('large-buttons');
    } else {
      root.classList.remove('large-buttons');
    }

    if (settings.accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.accessibility.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }, [settings.layout.compactMode, settings.layout.largeButtons, settings.accessibility.highContrast, settings.accessibility.reducedMotion]);

  // Map preferred camera to constraints/device selection
  const getCameraConfig = () => {
    const pref = settings.scanner.preferredCamera;
    if (pref === 'environment' || pref === 'user') {
      return { facingMode: pref } as any;
    }
    // assume deviceId from Html5Qrcode.getCameras()
    return { deviceId: { exact: pref } } as any;
  };

  const getScannerConfig = (): any => {
    return {
      fps: settings.scanner.fps,
      qrbox: settings.scanner.qrboxSize,
      aspectRatio: settings.scanner.aspectRatio,
      disableFlip: settings.scanner.disableFlip,
    };
  };

  /**
   * Safely cleans up the scanner instance with multiple fallback mechanisms
   * to prevent DOM errors related to node removal
   */
  const safeCleanupScanner = useCallback(async () => {
    if (!scannerRef.current) return;

    try {
      // First try the standard approach
      try {
        // @ts-ignore isScanning is not in types but exists
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }

      try {
        await scannerRef.current.clear();
      } catch (e) {
        console.warn('Error clearing scanner:', e);
        
        // If the standard clear fails, try additional DOM cleanup as a fallback
        try {
          const container = document.getElementById(scannerContainerId.current);
          if (container) {
            // Force DOM cleanup by replacing the entire container with a clone
            const parent = container.parentNode;
            if (parent) {
              // Create a clean replacement
              const replacement = container.cloneNode(false) as HTMLElement;
              replacement.id = scannerContainerId.current;
              
              // Replace the problematic node entirely
              parent.replaceChild(replacement, container);
              
              // Add placeholder text back if needed
              if (isMounted.current && !testingScanner) {
                const span = document.createElement('span');
                span.className = 'text-slate-400';
                span.textContent = t('settings.mobile.testScannerHint') || 'Press Start Test';
                replacement.appendChild(span);
              }
            } else {
              // Fallback to innerHTML clearing if parent isn't available
              container.innerHTML = '';
            }
          }
        } catch (innerE) {
          console.warn('Fallback DOM cleanup failed:', innerE);
        }
      }
    } finally {
      // Always reset the scanner ref to avoid stale references
      scannerRef.current = null;
    }
  }, [t, testingScanner]);

  const startTestScanner = useCallback(async () => {
    if (!isMounted.current) return;
    setScannerError(null);
    
    try {
      // First, ensure any existing scanner is properly cleaned up
      await safeCleanupScanner();
      
      // Verify the container exists and is ready
      const container = document.getElementById(scannerContainerId.current);
      if (!container) {
        throw new Error('Scanner preview container not found');
      }
      
      // Force container to be empty
      container.innerHTML = '';
      
      // Create a new scanner instance with the element ID
      scannerRef.current = new Html5Qrcode(scannerContainerId.current, /* verbose= */ false);
      
      // Update UI state before starting the scanner
      if (isMounted.current) setTestingScanner(true);
      
      // Start the scanner with the current settings
      await scannerRef.current.start(
        getCameraConfig(),
        getScannerConfig(),
        (decodedText: string, _decodedResult: any) => {
          if (!isMounted.current) return;
          
          // On success: feedback
          if (settings.scanner.beepEnabled) {
            try {
              const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
              if (AudioContext) {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.type = 'sine'; osc.frequency.value = 1800; gain.gain.value = 0.3;
                osc.start(); setTimeout(() => osc.stop(), 120);
              }
            } catch {}
          }
          if (settings.scanner.vibrationEnabled && 'vibrate' in navigator) {
            navigator.vibrate([60, 40, 60]);
          }
          toast({
            title: t('settings.mobile.toasts.scannerDetectedTitle'),
            description: decodedText,
          });
          // stop after first detection for test
          stopTestScanner();
        },
        (errorMessage: string) => {
          // scan failure callbacks are noisy; keep quiet during preview
        }
      );
    } catch (e: any) {
      console.error('Failed to start test scanner', e);
      if (isMounted.current) {
        setScannerError(e?.message || String(e));
        setTestingScanner(false);
      }
      toast({
        title: t('settings.mobile.toasts.scannerStartFailedTitle'),
        description: e?.message || String(e),
        variant: 'destructive',
      });
    }
  }, [safeCleanupScanner, settings, getCameraConfig, getScannerConfig, toast, t]);

  const stopTestScanner = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      await safeCleanupScanner();
    } finally {
      if (isMounted.current) {
        setTestingScanner(false);
      }
    }
  }, [safeCleanupScanner]);

  return (
    <div className="space-y-6">
      {/* Device Info */}
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro text-slate-100">
            <Smartphone className="h-5 w-5 mr-2" />
            {t('settings.mobile.deviceInfoTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-slate-400">{t('settings.mobile.deviceType')}</Label>
              <p className="font-medium">{isMobile ? t('settings.mobile.deviceTypeMobile') : t('settings.mobile.deviceTypeDesktop')}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-400">{t('settings.mobile.touchSupport')}</Label>
              <p className="font-medium">{deviceInfo.isTouchDevice ? t('settings.mobile.yes') : t('settings.mobile.no')}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-400">{t('settings.mobile.screenSize')}</Label>
              <p className="font-medium">{deviceInfo.screenSize}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-400">{t('settings.mobile.pwaMode')}</Label>
              <p className="font-medium">{deviceInfo.isStandalone ? t('settings.mobile.pwaInstalled') : t('settings.mobile.pwaBrowser')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scanner Settings */}
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro text-slate-100">
            <Scan className="h-5 w-5 mr-2" />
            {t('settings.mobile.scannerTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium text-slate-100">{t('settings.mobile.cameraPermission')}</Label>
              <p className="text-sm text-slate-400">{t('settings.mobile.cameraRequired')}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${cameraPermission === 'granted' ? 'text-green-600' : 'text-red-600'}`}>
                {permissionLabel(cameraPermission)}
              </span>
              {cameraPermission !== 'granted' && (
                <Button size="sm" onClick={requestCameraPermission}>{t('settings.mobile.grantAccessBtn')}</Button>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fps">{t('settings.mobile.fps')}</Label>
              <Select 
                value={settings.scanner.fps.toString()} 
                onValueChange={(value) => updateSettings('scanner', 'fps', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">{t('settings.mobile.fps5Label')}</SelectItem>
                  <SelectItem value="10">{t('settings.mobile.fps10Label')}</SelectItem>
                  <SelectItem value="15">{t('settings.mobile.fps15Label')}</SelectItem>
                  <SelectItem value="30">{t('settings.mobile.fps30Label')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="qrboxSize">{t('settings.mobile.scanAreaSize')}</Label>
              <Select 
                value={settings.scanner.qrboxSize.toString()} 
                onValueChange={(value) => updateSettings('scanner', 'qrboxSize', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="150">{t('settings.mobile.small150')}</SelectItem>
                  <SelectItem value="200">{t('settings.mobile.medium200')}</SelectItem>
                  <SelectItem value="250">{t('settings.mobile.large250')}</SelectItem>
                  <SelectItem value="300">{t('settings.mobile.xlarge300')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preferredCamera">{t('settings.mobile.preferredCamera')}</Label>
              <Select 
                value={settings.scanner.preferredCamera} 
                onValueChange={(value) => updateSettings('scanner', 'preferredCamera', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="environment">{t('settings.mobile.rearCamera')}</SelectItem>
                  <SelectItem value="user">{t('settings.mobile.frontCamera')}</SelectItem>
                  {availableCameras.map((camera) => (
                    <SelectItem key={camera.id} value={camera.id}>
                      {camera.label || t('settings.mobile.cameraId', { id: camera.id })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="aspectRatio">{t('settings.mobile.aspectRatio')}</Label>
              <Select 
                value={settings.scanner.aspectRatio.toString()} 
                onValueChange={(value) => updateSettings('scanner', 'aspectRatio', parseFloat(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.0">{t('settings.mobile.square')}</SelectItem>
                  <SelectItem value="1.33">{t('settings.mobile.standard43')}</SelectItem>
                  <SelectItem value="1.78">{t('settings.mobile.widescreen169')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-100">{t('settings.mobile.scanBeep')}</Label>
                <p className="text-sm text-slate-400">{t('settings.mobile.audioFeedback')}</p>
              </div>
              <Switch
                checked={settings.scanner.beepEnabled}
                onCheckedChange={(checked) => updateSettings('scanner', 'beepEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-100">{t('settings.mobile.vibrationFeedback')}</Label>
                <p className="text-sm text-slate-400">{t('settings.mobile.hapticFeedbackDesc')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.scanner.vibrationEnabled}
                  onCheckedChange={(checked) => updateSettings('scanner', 'vibrationEnabled', checked)}
                />
                <Button size="sm" variant="ghost" onClick={testVibration}>
                  <Vibrate className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-100">{t('settings.mobile.disableFlip')}</Label>
                <p className="text-sm text-slate-400">{t('settings.mobile.preventMirror')}</p>
              </div>
              <Switch
                checked={settings.scanner.disableFlip}
                onCheckedChange={(checked) => updateSettings('scanner', 'disableFlip', checked)}
              />
            </div>
          </div>
          <Separator />

          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-slate-300" />
                <Label className="text-base text-slate-100">{t('settings.mobile.testScannerTitle')}</Label>
              </div>
              <div className="flex items-center gap-2">
                {!testingScanner ? (
                  <Button size="sm" onClick={startTestScanner} className="bg-blue-600 hover:bg-blue-700">
                    <Scan className="h-4 w-4 mr-1" /> {t('settings.mobile.startTestBtn')}
                  </Button>
                ) : (
                  <Button size="sm" variant="destructive" onClick={stopTestScanner}>
                    <RefreshCw className="h-4 w-4 mr-1" /> {t('settings.mobile.stopTestBtn')}
                  </Button>
                )}
              </div>
            </div>
            {scannerError && (
              <p className="text-sm text-red-400 mb-3">{scannerError}</p>
            )}
            {/* Scanner container - remounted completely when scanner state changes to prevent DOM issues */}
            <div key={testingScanner ? 'active-scanner' : 'inactive-scanner'} 
                 id={scannerContainerId.current} 
                 className="w-full h-64 rounded-lg overflow-hidden bg-black/40 flex items-center justify-center text-slate-400">
              {!testingScanner && <span>{t('settings.mobile.testScannerHint')}</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      

      {/* Accessibility Settings */}
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro text-slate-100">
            <Settings className="h-5 w-5 mr-2" />
            {t('settings.mobile.accessibilityTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-100">{t('settings.mobile.hapticFeedback')}</Label>
                <p className="text-sm text-slate-400">{t('settings.mobile.systemVibrations')}</p>
              </div>
              <Switch
                checked={settings.accessibility.hapticFeedback}
                onCheckedChange={(checked) => updateSettings('accessibility', 'hapticFeedback', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-100">{t('settings.mobile.highContrastMode')}</Label>
                <p className="text-sm text-slate-400">{t('settings.mobile.betterVisibility')}</p>
              </div>
              <Switch
                checked={settings.accessibility.highContrast}
                onCheckedChange={(checked) => updateSettings('accessibility', 'highContrast', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-100">{t('settings.mobile.reducedMotion')}</Label>
                <p className="text-sm text-slate-400">{t('settings.mobile.minimizeAnimations')}</p>
              </div>
              <Switch
                checked={settings.accessibility.reducedMotion}
                onCheckedChange={(checked) => updateSettings('accessibility', 'reducedMotion', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-100">{t('settings.mobile.voiceAssistance')}</Label>
                <p className="text-sm text-slate-400">{t('settings.mobile.screenReaderSupport')}</p>
              </div>
              <Switch
                checked={settings.accessibility.voiceAssistance}
                onCheckedChange={(checked) => updateSettings('accessibility', 'voiceAssistance', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PWA & Installation */}
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro text-slate-100">
            <Download className="h-5 w-5 mr-2" />
            {t('settings.mobile.pwaTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isInstallable && (
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="h-5 w-5 text-slate-300" />
                  <Label className="text-base text-slate-100">{t('settings.mobile.installApp')}</Label>
                </div>
                <p className="text-sm text-slate-400 mb-3">{t('settings.mobile.installDesc')}</p>
                <Button onClick={installPWA} className="bg-blue-600 hover:bg-blue-700">
                  {t('settings.mobile.installNow')}
                </Button>
              </div>
            )}

            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Share className="h-5 w-5 text-slate-300" />
                <Label className="text-base text-slate-100">{t('settings.mobile.shareApp')}</Label>
              </div>
              <p className="text-sm text-slate-400 mb-3">{t('settings.mobile.shareDesc')}</p>
              <Button onClick={shareApp} variant="outline" className="border-white/10 text-slate-100 hover:bg-white/10">
                {t('settings.mobile.shareButton')}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('settings.mobile.autoInstallPrompt')}</Label>
                <p className="text-sm text-slate-400">{t('settings.mobile.suggestInstall')}</p>
              </div>
              <Switch
                checked={settings.pwa.autoPrompt}
                onCheckedChange={(checked) => updateSettings('pwa', 'autoPrompt', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>{t('settings.mobile.offlineMode')}</Label>
                <p className="text-sm text-slate-400">{t('settings.mobile.workOffline')}</p>
              </div>
              <Switch
                checked={settings.pwa.offlineMode}
                onCheckedChange={(checked) => updateSettings('pwa', 'offlineMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>{t('settings.mobile.backgroundSync')}</Label>
                <p className="text-sm text-slate-400">{t('settings.mobile.syncWhenOnline')}</p>
              </div>
              <Switch
                checked={settings.pwa.backgroundSync}
                onCheckedChange={(checked) => updateSettings('pwa', 'backgroundSync', checked)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">{t('settings.mobile.pushNotifications')}</Label>
              <p className="text-sm text-slate-400">{t('settings.mobile.receiveMobileNotifications')}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${notificationPermission === 'granted' ? 'text-green-600' : 'text-red-600'}`}>
                {permissionLabel(notificationPermission)}
              </span>
              {notificationPermission !== 'granted' && (
                <Button size="sm" onClick={requestNotificationPermission}>{t('settings.mobile.enableBtn')}</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileSettingsTab;
