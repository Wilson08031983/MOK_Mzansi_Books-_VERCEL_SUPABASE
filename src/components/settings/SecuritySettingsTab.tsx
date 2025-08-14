
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PasswordSecuritySection from './security/PasswordSecuritySection';
import TwoFactorAuthSection from './security/TwoFactorAuthSection';
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

const SecuritySettingsTab = () => {
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    passwordExpiryDays: 90,
    sessionTimeoutMinutes: 30,
    requireStrongPasswords: true,
    loginNotifications: true,
    deviceManagement: true
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
      const settings = getSecuritySettings();
      setSecuritySettings(settings);
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
      const ok1 = saveSecuritySettings(securitySettings);
      const ok2 = savePasswordComplexity(passwordComplexity);

      if (ok1 && ok2) {
        toast({
          title: 'Security settings saved successfully',
          description: 'Your security preferences have been updated.',
        });
      } else {
        throw new Error('Failed to save one or more settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
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
          title: 'Device logged out',
          description: 'The device has been successfully logged out.',
        });
      } else {
        throw new Error('removeDeviceSession returned false');
      }
    } catch (e) {
      console.error('Failed to logout device', e);
      toast({
        title: 'Error',
        description: 'Could not logout the selected device.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Shield className="h-5 w-5 mr-2" />
            Security Settings
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

            <TwoFactorAuthSection
              securitySettings={securitySettings}
              setSecuritySettings={setSecuritySettings as any}
            />

            <SessionSecuritySection
              securitySettings={securitySettings}
              setSecuritySettings={setSecuritySettings as any}
            />

            <ActiveDevicesSection
              activeDevices={activeDevices}
              onDeviceLogout={handleDeviceLogout}
            />

            <div className="pt-6 border-t flex justify-end">
              <Button
                type="submit"
                disabled={saveLoading}
                className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600"
              >
                {saveLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
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
