
import React from 'react';
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
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
        <Key className="h-5 w-5 mr-2 text-mokm-orange-500" />
        Password Security
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">Require Strong Passwords</Label>
            <p className="text-sm text-gray-500">Enforce password complexity requirements</p>
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
            <Label className="text-sm font-medium">Password Requirements:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="min-length"
                  checked={passwordComplexity.minLength >= 8}
                  onCheckedChange={(checked) => 
                    setPasswordComplexity({...passwordComplexity, minLength: checked ? 8 : 4})
                  }
                />
                <Label htmlFor="min-length" className="text-sm">
                  Minimum 8 characters
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="uppercase"
                  checked={passwordComplexity.requireUppercase}
                  onCheckedChange={(checked) => 
                    setPasswordComplexity({...passwordComplexity, requireUppercase: !!checked})
                  }
                />
                <Label htmlFor="uppercase" className="text-sm">
                  Uppercase letters (A-Z)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lowercase"
                  checked={passwordComplexity.requireLowercase}
                  onCheckedChange={(checked) => 
                    setPasswordComplexity({...passwordComplexity, requireLowercase: !!checked})
                  }
                />
                <Label htmlFor="lowercase" className="text-sm">
                  Lowercase letters (a-z)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="numbers"
                  checked={passwordComplexity.requireNumbers}
                  onCheckedChange={(checked) => 
                    setPasswordComplexity({...passwordComplexity, requireNumbers: !!checked})
                  }
                />
                <Label htmlFor="numbers" className="text-sm">
                  Numbers (0-9)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="special"
                  checked={passwordComplexity.requireSpecialChars}
                  onCheckedChange={(checked) => 
                    setPasswordComplexity({...passwordComplexity, requireSpecialChars: !!checked})
                  }
                />
                <Label htmlFor="special" className="text-sm">
                  Special characters (!@#$%^&*)
                </Label>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="password-expiry">Password Expiry (Days)</Label>
          <select
            id="password-expiry"
            value={securitySettings.passwordExpiryDays}
            onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiryDays: parseInt(e.target.value)})}
            className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="30">30 days</option>
            <option value="60">60 days</option>
            <option value="90">90 days</option>
            <option value="180">180 days</option>
            <option value="365">365 days</option>
          </select>
          <p className="text-xs text-gray-500">
            Users will be required to change their password after this period
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordSecuritySection;
