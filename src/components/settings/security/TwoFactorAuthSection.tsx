
import React, { useState, useEffect } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { Smartphone } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import TwoFactorSetupModal from './TwoFactorSetupModal';
import { toast } from '@/hooks/use-toast';
import { saveSecuritySettings } from '@/services/securityService';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  passwordExpiryDays: number;
  sessionTimeoutMinutes: number;
  requireStrongPasswords: boolean;
  loginNotifications: boolean;
  deviceManagement: boolean;
}

interface TwoFactorAuthSectionProps {
  securitySettings: SecuritySettings;
  setSecuritySettings: (settings: SecuritySettings) => void;
}

const TwoFactorAuthSection = ({
  securitySettings,
  setSecuritySettings
}: TwoFactorAuthSectionProps) => {
  const { t } = useLocalization();
  const [setupOpen, setSetupOpen] = useState(false);
  // Local UI mirror of the prop to avoid flicker/loops
  const [uiEnabled, setUiEnabled] = useState<boolean>(securitySettings.twoFactorEnabled);

  // Note: Do NOT sync uiEnabled from props on every render to avoid flicker loops.
  // uiEnabled is initialized from props once and then controlled locally by this component.

  const handleToggle = async (nextChecked: boolean) => {
    console.log('[TwoFactorAuthSection] handleToggle called with:', nextChecked, 'current uiEnabled:', uiEnabled);
    
    if (nextChecked && !uiEnabled) {
      // User is trying to enable → open setup; do not flip UI yet
      console.log('[TwoFactorAuthSection] Opening setup modal');
      setSetupOpen(true);
    } else if (!nextChecked && uiEnabled) {
      // User is trying to disable
      console.log('[TwoFactorAuthSection] Attempting to disable');
      
      // Use a custom dialog instead of window.confirm to avoid browser issues
      const userConfirmed = await new Promise<boolean>((resolve) => {
        const result = window.confirm('Are you sure you want to disable Two-Factor Authentication?');
        resolve(result);
      });
      
      if (userConfirmed) {
        console.log('[TwoFactorAuthSection] User confirmed disable');
        // Immediately update UI state
        setUiEnabled(false);
        
        // Then update parent state and save
        setSecuritySettings({ ...securitySettings, twoFactorEnabled: false });
        saveSecuritySettings({ ...securitySettings, twoFactorEnabled: false });
        toast({ title: 'Two-Factor Disabled', description: '2FA has been turned off.' });
      } else {
        console.log('[TwoFactorAuthSection] User cancelled disable');
        // Force UI to stay enabled
        setUiEnabled(true);
      }
    }
  };
  return (
    <div className="pt-4 border-t">
      <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
        <Smartphone className="h-5 w-5 mr-2 text-mokm-orange-500" />
        {t('settings.security.twoFactor')}
      </h3>
      
      <div className="space-y-4">
        <div
          className="flex items-center justify-between"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleToggle(!uiEnabled);
          }}
        >
          <div>
            <Label htmlFor="2fa-toggle" className="font-medium">
              {t('settings.security.enableTwoFactor')}
            </Label>
            <p className="text-sm text-gray-500">{t('settings.security.twoFactorDesc')}</p>
          </div>
          <Switch
            id="2fa-toggle"
            checked={uiEnabled}
            onCheckedChange={() => {}} // Disable default handler (we handle on the row)
          />
        </div>
        
        {securitySettings.twoFactorEnabled && (
          <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
            {t('settings.security.twoFactorEnabledInfo')}
          </div>
        )}
      </div>

      <TwoFactorSetupModal
        open={setupOpen}
        onClose={() => setSetupOpen(false)}
        onEnabled={() => {
          setSecuritySettings({ ...securitySettings, twoFactorEnabled: true });
          saveSecuritySettings({ ...securitySettings, twoFactorEnabled: true });
          setUiEnabled(true);
          toast({ title: 'Two-Factor Enabled', description: '2FA has been turned on.' });
        }}
      />
    </div>
  );
};

export default TwoFactorAuthSection;
