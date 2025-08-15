
import React, { useState, useEffect, useRef } from 'react';
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
  Layout,
  Tablet
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useIsMobile } from '@/hooks/use-mobile';
import { setItem, getItem } from '@/services/localStorageService';
import { getDefaultConfig, type ScannerConfig } from '@/services/barcodeScannerService';

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

  // Load settings on mount
  useEffect(() => {
    const savedSettings = getItem<MobileSettings>('mobileSettings', DEFAULT_MOBILE_SETTINGS);
    setSettings(savedSettings);
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
        title: 'Camera Access Granted',
        description: 'You can now use the barcode scanner',
      });
    } catch (error) {
      setCameraPermission('denied');
      toast({
        title: 'Camera Access Denied',
        description: 'Please enable camera access in your browser settings',
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
          title: 'Notifications Enabled',
          description: 'You will receive mobile notifications',
        });
      }
    }
  };

  // Test vibration
  const testVibration = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
      toast({
        title: 'Vibration Test',
        description: 'Did you feel the vibration?',
      });
    } else {
      toast({
        title: 'Vibration Not Supported',
        description: 'Your device does not support vibration',
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
          title: 'App Installed',
          description: 'MOK Mzansi Books has been added to your home screen',
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
          title: 'Link Copied',
          description: 'App link copied to clipboard',
        });
      } catch (error) {
        toast({
          title: 'Share Not Supported',
          description: 'Web Share API not available on this device',
          variant: 'destructive',
        });
      }
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

  return (
    <div className="space-y-6">
      {/* Device Info */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Smartphone className="h-5 w-5 mr-2" />
            Device Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-slate-500">Device Type</Label>
              <p className="font-medium">{isMobile ? 'Mobile' : 'Desktop'}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Touch Support</Label>
              <p className="font-medium">{deviceInfo.isTouchDevice ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Screen Size</Label>
              <p className="font-medium">{deviceInfo.screenSize}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">PWA Mode</Label>
              <p className="font-medium">{deviceInfo.isStandalone ? 'Installed' : 'Browser'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scanner Settings */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Scan className="h-5 w-5 mr-2" />
            Barcode Scanner Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Camera Permission</Label>
              <p className="text-sm text-gray-600">Required for barcode scanning</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${cameraPermission === 'granted' ? 'text-green-600' : 'text-red-600'}`}>
                {cameraPermission}
              </span>
              {cameraPermission !== 'granted' && (
                <Button size="sm" onClick={requestCameraPermission}>Grant Access</Button>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fps">Frames Per Second</Label>
              <Select 
                value={settings.scanner.fps.toString()} 
                onValueChange={(value) => updateSettings('scanner', 'fps', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 FPS (Power Saving)</SelectItem>
                  <SelectItem value="10">10 FPS (Balanced)</SelectItem>
                  <SelectItem value="15">15 FPS (Fast)</SelectItem>
                  <SelectItem value="30">30 FPS (High Performance)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="qrboxSize">Scan Area Size</Label>
              <Select 
                value={settings.scanner.qrboxSize.toString()} 
                onValueChange={(value) => updateSettings('scanner', 'qrboxSize', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="150">Small (150px)</SelectItem>
                  <SelectItem value="200">Medium (200px)</SelectItem>
                  <SelectItem value="250">Large (250px)</SelectItem>
                  <SelectItem value="300">Extra Large (300px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preferredCamera">Preferred Camera</Label>
              <Select 
                value={settings.scanner.preferredCamera} 
                onValueChange={(value) => updateSettings('scanner', 'preferredCamera', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="environment">Rear Camera</SelectItem>
                  <SelectItem value="user">Front Camera</SelectItem>
                  {availableCameras.map((camera) => (
                    <SelectItem key={camera.id} value={camera.id}>
                      {camera.label || `Camera ${camera.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="aspectRatio">Aspect Ratio</Label>
              <Select 
                value={settings.scanner.aspectRatio.toString()} 
                onValueChange={(value) => updateSettings('scanner', 'aspectRatio', parseFloat(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.0">Square (1:1)</SelectItem>
                  <SelectItem value="1.33">Standard (4:3)</SelectItem>
                  <SelectItem value="1.78">Widescreen (16:9)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Scan Beep Sound</Label>
                <p className="text-sm text-gray-600">Audio feedback on scan</p>
              </div>
              <Switch
                checked={settings.scanner.beepEnabled}
                onCheckedChange={(checked) => updateSettings('scanner', 'beepEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Vibration Feedback</Label>
                <p className="text-sm text-gray-600">Haptic feedback on scan</p>
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
                <Label>Disable Image Flip</Label>
                <p className="text-sm text-gray-600">Prevent mirror effect</p>
              </div>
              <Switch
                checked={settings.scanner.disableFlip}
                onCheckedChange={(checked) => updateSettings('scanner', 'disableFlip', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout & UI Settings */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Layout className="h-5 w-5 mr-2" />
            Layout & Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Compact Mode</Label>
                <p className="text-sm text-gray-600">Reduced spacing for mobile</p>
              </div>
              <Switch
                checked={settings.layout.compactMode}
                onCheckedChange={(checked) => updateSettings('layout', 'compactMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Large Touch Buttons</Label>
                <p className="text-sm text-gray-600">Bigger buttons for touch</p>
              </div>
              <Switch
                checked={settings.layout.largeButtons}
                onCheckedChange={(checked) => updateSettings('layout', 'largeButtons', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Optimize for Touch</Label>
                <p className="text-sm text-gray-600">Touch-friendly interactions</p>
              </div>
              <Switch
                checked={settings.layout.optimizeTouch}
                onCheckedChange={(checked) => updateSettings('layout', 'optimizeTouch', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-hide Sidebar</Label>
                <p className="text-sm text-gray-600">More screen space</p>
              </div>
              <Switch
                checked={settings.layout.hideSidebar}
                onCheckedChange={(checked) => updateSettings('layout', 'hideSidebar', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Settings */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Settings className="h-5 w-5 mr-2" />
            Accessibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Haptic Feedback</Label>
                <p className="text-sm text-gray-600">System vibrations</p>
              </div>
              <Switch
                checked={settings.accessibility.hapticFeedback}
                onCheckedChange={(checked) => updateSettings('accessibility', 'hapticFeedback', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>High Contrast Mode</Label>
                <p className="text-sm text-gray-600">Better visibility</p>
              </div>
              <Switch
                checked={settings.accessibility.highContrast}
                onCheckedChange={(checked) => updateSettings('accessibility', 'highContrast', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Reduced Motion</Label>
                <p className="text-sm text-gray-600">Minimize animations</p>
              </div>
              <Switch
                checked={settings.accessibility.reducedMotion}
                onCheckedChange={(checked) => updateSettings('accessibility', 'reducedMotion', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Voice Assistance</Label>
                <p className="text-sm text-gray-600">Screen reader support</p>
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
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Download className="h-5 w-5 mr-2" />
            Progressive Web App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isInstallable && (
              <div className="rounded-xl border bg-blue-50/70 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="h-5 w-5 text-blue-700" />
                  <Label className="text-base text-blue-800">Install App</Label>
                </div>
                <p className="text-sm text-blue-700 mb-3">Add MOK Mzansi Books to your home screen for quick access.</p>
                <Button onClick={installPWA} className="bg-blue-600 hover:bg-blue-700">
                  Install Now
                </Button>
              </div>
            )}

            <div className="rounded-xl border bg-green-50/70 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Share className="h-5 w-5 text-green-700" />
                <Label className="text-base text-green-800">Share App</Label>
              </div>
              <p className="text-sm text-green-700 mb-3">Share MOK Mzansi Books with colleagues and friends.</p>
              <Button onClick={shareApp} variant="outline" className="border-green-200 text-green-700 hover:bg-green-100">
                Share App
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Install Prompt</Label>
                <p className="text-sm text-gray-600">Suggest app installation</p>
              </div>
              <Switch
                checked={settings.pwa.autoPrompt}
                onCheckedChange={(checked) => updateSettings('pwa', 'autoPrompt', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Offline Mode</Label>
                <p className="text-sm text-gray-600">Work without internet</p>
              </div>
              <Switch
                checked={settings.pwa.offlineMode}
                onCheckedChange={(checked) => updateSettings('pwa', 'offlineMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Background Sync</Label>
                <p className="text-sm text-gray-600">Sync when online</p>
              </div>
              <Switch
                checked={settings.pwa.backgroundSync}
                onCheckedChange={(checked) => updateSettings('pwa', 'backgroundSync', checked)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Push Notifications</Label>
              <p className="text-sm text-gray-600">Receive mobile notifications</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${notificationPermission === 'granted' ? 'text-green-600' : 'text-red-600'}`}>
                {notificationPermission}
              </span>
              {notificationPermission !== 'granted' && (
                <Button size="sm" onClick={requestNotificationPermission}>Enable</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileSettingsTab;
