
import React from 'react';
import { Lock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

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
  return (
    <div className="pt-4 border-t">
      <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
        <Lock className="h-5 w-5 mr-2 text-mokm-orange-500" />
        Session Security
      </h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="session-timeout">Session Timeout (Minutes)</Label>
          <select
            id="session-timeout"
            value={securitySettings.sessionTimeoutMinutes}
            onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeoutMinutes: parseInt(e.target.value)})}
            className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="240">4 hours</option>
          </select>
          <p className="text-xs text-gray-500">
            Users will be automatically logged out after this period of inactivity
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">Login Notifications</Label>
            <p className="text-sm text-gray-500">Send email notifications for new logins</p>
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
