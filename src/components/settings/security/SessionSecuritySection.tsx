
import React from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { Lock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { saveSecuritySettings } from '@/services/securityService';

interface SecuritySettings {
  sessionTimeoutMinutes: number;
  loginNotifications: boolean;
}

interface SessionSecuritySectionProps {
  securitySettings: SecuritySettings;
  setSecuritySettings: (settings: SecuritySettings) => void;
}

const SessionSecuritySection = ({
  securitySettings,
  setSecuritySettings
}: SessionSecuritySectionProps) => {
  const { t } = useLocalization();
  return (
    <div className="pt-4 border-t">
      <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
        <Lock className="h-5 w-5 mr-2 text-mokm-orange-500" />
        {t('settings.security.sessionSecurity')}
      </h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="session-timeout">{t('settings.security.sessionTimeoutMinutes')}</Label>
          <select
            id="session-timeout"
            value={securitySettings.sessionTimeoutMinutes}
            onChange={(e) => {
              const minutes = parseInt(e.target.value);
              const updated = { ...securitySettings, sessionTimeoutMinutes: minutes };
              setSecuritySettings(updated);
              // Persist immediately so it doesn't revert when leaving the page
              try { saveSecuritySettings(updated as any); } catch {}
            }}
            className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="15">{t('settings.security.timeout15')}</option>
            <option value="30">{t('settings.security.timeout30')}</option>
            <option value="60">{t('settings.security.timeout60')}</option>
            <option value="120">{t('settings.security.timeout120')}</option>
            <option value="240">{t('settings.security.timeout240')}</option>
          </select>
          <p className="text-xs text-gray-500">{t('settings.security.autoLogoutHelp')}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">{t('settings.security.loginNotifications')}</Label>
            <p className="text-sm text-gray-500">{t('settings.security.loginNotificationsDesc')}</p>
          </div>
          <Switch
            checked={securitySettings.loginNotifications}
            onCheckedChange={(checked) => 
              setSecuritySettings({...securitySettings, loginNotifications: !!checked})
            }
          />
        </div>
      </div>
    </div>
  );
};

export default SessionSecuritySection;
