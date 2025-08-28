
import React from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { Key } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

interface PasswordComplexity {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

interface SecuritySettings {
  requireStrongPasswords: boolean;
  passwordExpiryDays: number;
}

interface PasswordSecuritySectionProps {
  securitySettings: SecuritySettings;
  setSecuritySettings: (settings: SecuritySettings) => void;
  passwordComplexity: PasswordComplexity;
  setPasswordComplexity: (complexity: PasswordComplexity) => void;
}

const PasswordSecuritySection = ({
  securitySettings,
  setSecuritySettings,
  passwordComplexity,
  setPasswordComplexity
}: PasswordSecuritySectionProps) => {
  const { t } = useLocalization();
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
        <Key className="h-5 w-5 mr-2 text-mokm-orange-500" />
        {t('settings.security.passwordSecurity')}
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">{t('settings.security.requireStrongPasswords')}</Label>
            <p className="text-sm text-gray-500">{t('settings.security.enforcePasswordComplexity')}</p>
          </div>
          <Switch
            checked={securitySettings.requireStrongPasswords}
            onCheckedChange={(checked) => 
              setSecuritySettings({...securitySettings, requireStrongPasswords: !!checked})
            }
          />
        </div>
        
        {securitySettings.requireStrongPasswords && (
          <div className="pl-6 border-l-2 border-gray-100 space-y-3">
            <Label className="text-sm font-medium">{t('settings.security.requirementsTitle')}</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="min-length"
                  checked={passwordComplexity.minLength >= 8}
                  onCheckedChange={(checked) => 
                    setPasswordComplexity({...passwordComplexity, minLength: checked ? 8 : 4})
                  }
                />
                <Label htmlFor="min-length" className="text-sm">{t('settings.security.min8')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="uppercase"
                  checked={passwordComplexity.requireUppercase}
                  onCheckedChange={(checked) => 
                    setPasswordComplexity({...passwordComplexity, requireUppercase: !!checked})
                  }
                />
                <Label htmlFor="uppercase" className="text-sm">{t('settings.security.uppercase')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lowercase"
                  checked={passwordComplexity.requireLowercase}
                  onCheckedChange={(checked) => 
                    setPasswordComplexity({...passwordComplexity, requireLowercase: !!checked})
                  }
                />
                <Label htmlFor="lowercase" className="text-sm">{t('settings.security.lowercase')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="numbers"
                  checked={passwordComplexity.requireNumbers}
                  onCheckedChange={(checked) => 
                    setPasswordComplexity({...passwordComplexity, requireNumbers: !!checked})
                  }
                />
                <Label htmlFor="numbers" className="text-sm">{t('settings.security.numbers')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="special"
                  checked={passwordComplexity.requireSpecialChars}
                  onCheckedChange={(checked) => 
                    setPasswordComplexity({...passwordComplexity, requireSpecialChars: !!checked})
                  }
                />
                <Label htmlFor="special" className="text-sm">{t('settings.security.specialChars')}</Label>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="password-expiry">{t('settings.security.expiryDaysLabel')}</Label>
          <select
            id="password-expiry"
            value={securitySettings.passwordExpiryDays}
            onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiryDays: parseInt(e.target.value)})}
            className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="30">{t('settings.security.expiry30')}</option>
            <option value="60">{t('settings.security.expiry60')}</option>
            <option value="90">{t('settings.security.expiry90')}</option>
            <option value="180">{t('settings.security.expiry180')}</option>
            <option value="365">{t('settings.security.expiry365')}</option>
          </select>
          <p className="text-xs text-gray-500">{t('settings.security.expiryHelp')}</p>
        </div>
      </div>
    </div>
  );
};

export default PasswordSecuritySection;
