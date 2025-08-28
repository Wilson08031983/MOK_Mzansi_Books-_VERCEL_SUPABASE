
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLocalization } from '@/hooks/useLocalization';
import PasswordSecuritySection from './security/PasswordSecuritySection';
import SessionSecuritySection from './security/SessionSecuritySection';
import ActiveDevicesSection from './security/ActiveDevicesSection';
import {
  getSecuritySettings,
  saveSecuritySettings,
  getPasswordComplexity,
  savePasswordComplexity,
  getDeviceSessions,
  removeDeviceSession,
  getCurrentDeviceSession,
  addDeviceSession
} from '@/services/securityService';
import { auditService } from '@/services/auditService';

const SecuritySettingsTab = () => {
  const [saveLoading, setSaveLoading] = useState(false);
  const { t } = useLocalization();
  
  // Security settings - initialize and coerce 2FA off
  const [securitySettings, setSecuritySettings] = useState(() => {
    try {
      const s = getSecuritySettings();
      return { ...s, twoFactorEnabled: false };
    } catch (e) {
      console.error('Failed to load initial security settings', e);
      return {
        twoFactorEnabled: false,
        passwordExpiryDays: 90,
        sessionTimeoutMinutes: 30,
        requireStrongPasswords: true,
        loginNotifications: true,
        deviceManagement: true
      };
    }
  });
  
  // Password complexity settings
  const [passwordComplexity, setPasswordComplexity] = useState({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  });
  
  // Active devices
  const [activeDevices, setActiveDevices] = useState<Array<{ 
    id: string; 
    name: string; 
    lastActive: string; 
    location: string; 
    browser: string;
    current: boolean;
  }>>([]);

  // Load settings and sessions on mount
  useEffect(() => {
    try {
      // Force-disable Two-Factor Authentication persistently if it was previously on
      const current = getSecuritySettings();
      if (current?.twoFactorEnabled) {
        const updated = { ...current, twoFactorEnabled: false };
        setSecuritySettings(updated);
        saveSecuritySettings(updated);
      }

      // Don't reload security settings otherwise since they're already initialized
      const complexity = getPasswordComplexity();
      setPasswordComplexity(complexity);

      let sessions = getDeviceSessions();
      if (!sessions || sessions.length === 0) {
        // Ensure at least current device is present
        const current = getCurrentDeviceSession();
        addDeviceSession(current);
        sessions = getDeviceSessions();
      }
      setActiveDevices(
        sessions.map(s => ({
          id: s.id,
          name: s.deviceName,
          lastActive: s.lastActive,
          location: s.location,
          browser: s.browser,
          current: !!s.current
        }))
      );
    } catch (e) {
      console.error('Failed to load security settings or sessions', e);
    }
  }, []);

  // Handle form submission
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaveLoading(true);
    
    try {
      // Capture old values before persisting
      const prevSecurity = getSecuritySettings();
      const prevComplexity = getPasswordComplexity();

      const ok1 = saveSecuritySettings(securitySettings);
      const ok2 = savePasswordComplexity(passwordComplexity);

      if (ok1 && ok2) {
        toast({
          title: t('settings.security.savedTitle'),
          description: t('settings.security.savedDesc'),
        });
        try {
          auditService.logSettings(
            'Saved Security Settings',
            'Settings',
            'Security',
            { securitySettings: prevSecurity, passwordComplexity: prevComplexity },
            { securitySettings, passwordComplexity }
          );
        } catch {}
      } else {
        throw new Error('Failed to save one or more settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: t('settings.security.errorTitle'),
        description: t('settings.security.saveErrorDesc'),
        variant: 'destructive',
      });
      try {
        auditService.logSettings('Save Security Settings Failed', 'Settings', 'Security');
      } catch {}
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeviceLogout = (deviceId: string) => {
    try {
      const success = removeDeviceSession(deviceId);
      if (success) {
        const sessions = getDeviceSessions();
        setActiveDevices(
          sessions.map(s => ({
            id: s.id,
            name: s.deviceName,
            lastActive: s.lastActive,
            location: s.location,
            browser: s.browser,
            current: !!s.current
          }))
        );
        toast({
          title: t('settings.security.deviceLoggedOutTitle'),
          description: t('settings.security.deviceLoggedOutDesc'),
        });
        try {
          auditService.logSettings(
            'Logged Out Device Session',
            'Settings',
            'Security',
            { deviceId },
            { deviceId, status: 'logged_out' }
          );
        } catch {}
      } else {
        throw new Error('removeDeviceSession returned false');
      }
    } catch (e) {
      console.error('Failed to logout device', e);
      toast({
        title: t('settings.security.deviceLogoutErrorTitle'),
        description: t('settings.security.deviceLogoutErrorDesc'),
        variant: 'destructive'
      });
      try {
        auditService.logSettings('Device Logout Failed', 'Settings', 'Security', { deviceId }, { deviceId, status: 'error' });
      } catch {}
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro text-slate-100">
            <Shield className="h-5 w-5 mr-2" />
            {t('settings.security.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <PasswordSecuritySection
              securitySettings={securitySettings}
              setSecuritySettings={setSecuritySettings as any}
              passwordComplexity={passwordComplexity}
              setPasswordComplexity={setPasswordComplexity as any}
            />

            {/* Two-Factor Authentication section removed by request */}

            <SessionSecuritySection
              securitySettings={securitySettings}
              setSecuritySettings={setSecuritySettings as any}
            />

            <ActiveDevicesSection
              activeDevices={activeDevices}
              onDeviceLogout={handleDeviceLogout}
            />

            <div className="pt-6 border-t border-white/10 flex justify-end">
              <Button
                type="submit"
                disabled={saveLoading}
                className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600"
              >
                {saveLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('settings.security.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('settings.security.saveSettings')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettingsTab;
