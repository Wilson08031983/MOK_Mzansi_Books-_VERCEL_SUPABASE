
import React from 'react';
import { Smartphone } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface SecuritySettings {
  twoFactorEnabled: boolean;
}

interface TwoFactorAuthSectionProps {
  securitySettings: SecuritySettings;
  setSecuritySettings: (settings: SecuritySettings) => void;
}

const TwoFactorAuthSection = ({
  securitySettings,
  setSecuritySettings
}: TwoFactorAuthSectionProps) => {
  return (
    <div className="pt-4 border-t">
      <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
        <Smartphone className="h-5 w-5 mr-2 text-mokm-orange-500" />
        Two-Factor Authentication
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">Enable Two-Factor Authentication</Label>
            <p className="text-sm text-gray-500">Require a verification code in addition to passwords for login</p>
          </div>
          <Switch
            checked={securitySettings.twoFactorEnabled}
            onCheckedChange={(checked) => 
              setSecuritySettings({...securitySettings, twoFactorEnabled: !!checked})
            }
          />
        </div>
        
        {securitySettings.twoFactorEnabled && (
          <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
            Two-factor authentication is enabled. Users will be prompted to set up 2FA using an authenticator app when they next sign in.
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorAuthSection;
