
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalization } from '@/hooks/useLocalization';
import { 
  getNotificationSettings, 
  saveNotificationSettings, 
  requestNotificationPermission, 
  canShowDesktopNotifications,
  type NotificationSettings 
} from '@/services/notificationService';

const NotificationSettingsTab = () => {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const { t } = useLocalization();
  const saveTimeoutRef = React.useRef<number | null>(null);

  useEffect(() => {
    // Load current settings on mount
    setSettings(getNotificationSettings());
  }, []);

  // Clear any pending debounced save on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  // Debounced persist helper (no toast; explicit Save shows toast)
  const debouncedPersist = (updated: NotificationSettings) => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      try {
        saveNotificationSettings(updated);
      } catch (e) {
        console.error('Error auto-saving notification settings:', e);
      }
    }, 300);
  };

  const handleSave = async () => {
    try {
      saveNotificationSettings(settings);
      toast.success(t('settings.notifications.saveSuccess'));
      
      // Request notification permission if desktop notifications are enabled
      if (settings.inApp.desktop && !canShowDesktopNotifications()) {
        const permission = await requestNotificationPermission();
        if (permission === 'granted') {
          toast.success(t('settings.notifications.desktopEnabled'));
        } else if (permission === 'denied') {
          toast.error(t('settings.notifications.permissionDenied'));
        }
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error(t('settings.notifications.saveError'));
    }
  };

  const updateEmailSetting = (key: string, value: boolean | string) => {
    setSettings(prev => {
      const updated = { ...prev, email: { ...prev.email, [key]: value } };
      debouncedPersist(updated);
      return updated;
    });
  };

  const updateInAppSetting = (key: string, value: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, inApp: { ...prev.inApp, [key]: value } };
      debouncedPersist(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications - Hidden by request */}
      {false && (
        <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
          <CardHeader>
            <CardTitle className="flex items-center font-sf-pro text-slate-100">
              <Mail className="h-5 w-5 mr-2" />
              {t('settings.notifications.emailNotifications')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">{/* ...hidden content... */}</CardContent>
        </Card>
      )}

      {/* In-App Notifications */}
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro text-slate-100">
            <Bell className="h-5 w-5 mr-2" />
            {t('settings.notifications.inAppNotifications')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-200">{t('settings.notifications.enableSound')}</Label>
                <p className="text-sm text-slate-400">{t('settings.notifications.playNotificationSounds')}</p>
              </div>
              <Switch
                checked={settings.inApp.sound}
                onCheckedChange={(checked) => updateInAppSetting('sound', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-200">{t('settings.notifications.desktopNotifications')}</Label>
                <p className="text-sm text-slate-400">{t('settings.notifications.showBrowserNotifications')}</p>
              </div>
              <Switch
                checked={settings.inApp.desktop}
                onCheckedChange={(checked) => updateInAppSetting('desktop', checked)}
              />
            </div>
            {settings.inApp.desktop && !canShowDesktopNotifications() && (
              <div className="mt-2 text-sm text-slate-300 flex items-center justify-between">
                <span>{t('settings.notifications.permissionNotGranted')}</span>
                <Button size="sm" variant="secondary" onClick={async () => {
                  const perm = await requestNotificationPermission();
                  if (perm === 'granted') {
                    toast.success(t('settings.notifications.desktopEnabled'));
                  } else if (perm === 'denied') {
                    toast.error(t('settings.notifications.permissionDenied'));
                  }
                }}>{t('settings.notifications.grantPermission')}</Button>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-200">{t('settings.notifications.newInvoices')}</Label>
                <p className="text-sm text-slate-400">{t('settings.notifications.invoiceCreationAlerts')}</p>
              </div>
              <Switch
                checked={settings.inApp.newInvoices}
                onCheckedChange={(checked) => updateInAppSetting('newInvoices', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-200">{t('settings.notifications.taskReminders')}</Label>
                <p className="text-sm text-slate-400">{t('settings.notifications.upcomingTaskNotifications')}</p>
              </div>
              <Switch
                checked={settings.inApp.taskReminders}
                onCheckedChange={(checked) => updateInAppSetting('taskReminders', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Frequency - Hidden by request */}
      {false && (
        <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
          <CardHeader>
            <CardTitle className="flex items-center font-sf-pro text-slate-100">
              <Calendar className="h-5 w-5 mr-2" />
              {t('settings.notifications.notificationFrequency')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">{/* ...hidden content... */}</CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white">
          {t('settings.notifications.save')}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettingsTab;
