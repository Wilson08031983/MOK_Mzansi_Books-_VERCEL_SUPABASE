
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PasswordSecuritySection from './security/PasswordSecuritySection';
import TwoFactorAuthSection from './security/TwoFactorAuthSection';
import SessionSecuritySection from './security/SessionSecuritySection';
import ActiveDevicesSection from './security/ActiveDevicesSection';

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
  const [activeDevices] = useState([
    { 
      id: '1', 
      name: 'MacBook Pro', 
      lastActive: '2025-06-02T10:30:00', 
      location: 'Johannesburg, South Africa', 
      browser: 'Chrome',
      current: true
    },
    { 
      id: '2', 
      name: 'iPhone 15', 
      lastActive: '2025-06-01T18:45:00', 
      location: 'Johannesburg, South Africa', 
      browser: 'Safari',
      current: false
    },
    { 
      id: '3', 
      name: 'iPad Pro', 
      lastActive: '2025-05-28T14:20:00', 
      location: 'Cape Town, South Africa', 
      browser: 'Safari',
      current: false
    }
  ]);

  // Handle form submission
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaveLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Security settings saved successfully",
        description: "Your security preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeviceLogout = (deviceId: string) => {
    toast({
      title: "Device logged out",
      description: "The device has been successfully logged out.",
    });
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
              setSecuritySettings={setSecuritySettings}
              passwordComplexity={passwordComplexity}
              setPasswordComplexity={setPasswordComplexity}
            />

            <TwoFactorAuthSection
              securitySettings={securitySettings}
              setSecuritySettings={setSecuritySettings}
            />

            <SessionSecuritySection
              securitySettings={securitySettings}
              setSecuritySettings={setSecuritySettings}
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
