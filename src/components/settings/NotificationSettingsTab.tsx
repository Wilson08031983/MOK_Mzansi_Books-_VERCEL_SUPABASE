
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getNotificationSettings, 
  saveNotificationSettings, 
  requestNotificationPermission, 
  canShowDesktopNotifications,
  type NotificationSettings 
} from '@/services/notificationService';

const NotificationSettingsTab = () => {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());

  useEffect(() => {
    // Load current settings on mount
    setSettings(getNotificationSettings());
  }, []);

  const handleSave = async () => {
    try {
      saveNotificationSettings(settings);
      toast.success('Notification settings saved successfully!');
      
      // Request notification permission if desktop notifications are enabled
      if (settings.inApp.desktop && !canShowDesktopNotifications()) {
        const permission = await requestNotificationPermission();
        if (permission === 'granted') {
          toast.success('Desktop notification permission granted!');
        } else if (permission === 'denied') {
          toast.error('Desktop notification permission denied. You can enable it in your browser settings.');
        }
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    }
  };

  const updateEmailSetting = (key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      email: { ...prev.email, [key]: value }
    }));
  };

  const updateInAppSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      inApp: { ...prev.inApp, [key]: value }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Mail className="h-5 w-5 mr-2" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Email Notifications</Label>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <Switch
              checked={settings.email.enabled}
              onCheckedChange={(checked) => updateEmailSetting('enabled', checked)}
            />
          </div>
          
          {settings.email.enabled && (
            <>
              <div>
                <Label htmlFor="emailAddress">Email Address</Label>
                <Input
                  id="emailAddress"
                  type="email"
                  value={settings.email.address}
                  onChange={(e) => updateEmailSetting('address', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Invoice Reminders</Label>
                    <p className="text-sm text-gray-600">Payment due reminders</p>
                  </div>
                  <Switch
                    checked={settings.email.invoiceReminders}
                    onCheckedChange={(checked) => updateEmailSetting('invoiceReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Payment Received</Label>
                    <p className="text-sm text-gray-600">Payment confirmations</p>
                  </div>
                  <Switch
                    checked={settings.email.paymentReceived}
                    onCheckedChange={(checked) => updateEmailSetting('paymentReceived', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-gray-600">Inventory warnings</p>
                  </div>
                  <Switch
                    checked={settings.email.lowStock}
                    onCheckedChange={(checked) => updateEmailSetting('lowStock', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Alerts</Label>
                    <p className="text-sm text-gray-600">Important system messages</p>
                  </div>
                  <Switch
                    checked={settings.email.systemAlerts}
                    onCheckedChange={(checked) => updateEmailSetting('systemAlerts', checked)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Bell className="h-5 w-5 mr-2" />
            In-App Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Sound</Label>
                <p className="text-sm text-gray-600">Play notification sounds</p>
              </div>
              <Switch
                checked={settings.inApp.sound}
                onCheckedChange={(checked) => updateInAppSetting('sound', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Desktop Notifications</Label>
                <p className="text-sm text-gray-600">Show browser notifications</p>
              </div>
              <Switch
                checked={settings.inApp.desktop}
                onCheckedChange={(checked) => updateInAppSetting('desktop', checked)}
              />
            </div>
            {settings.inApp.desktop && !canShowDesktopNotifications() && (
              <div className="mt-2 text-sm text-slate-600 flex items-center justify-between">
                <span>Permission not granted yet.</span>
                <Button size="sm" variant="secondary" onClick={async () => {
                  const perm = await requestNotificationPermission();
                  if (perm === 'granted') {
                    toast.success('Desktop notifications enabled');
                  } else if (perm === 'denied') {
                    toast.error('Permission denied in browser settings');
                  }
                }}>Grant permission</Button>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <Label>New Invoices</Label>
                <p className="text-sm text-gray-600">Invoice creation alerts</p>
              </div>
              <Switch
                checked={settings.inApp.newInvoices}
                onCheckedChange={(checked) => updateInAppSetting('newInvoices', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Task Reminders</Label>
                <p className="text-sm text-gray-600">Upcoming task notifications</p>
              </div>
              <Switch
                checked={settings.inApp.taskReminders}
                onCheckedChange={(checked) => updateInAppSetting('taskReminders', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Frequency */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Calendar className="h-5 w-5 mr-2" />
            Notification Frequency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoiceReminders">Invoice Reminder (days before due)</Label>
              <Select 
                value={settings.frequency.invoiceReminders} 
                onValueChange={(value) => setSettings(prev => ({
                  ...prev,
                  frequency: { ...prev.frequency, invoiceReminders: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="reportSchedule">Report Schedule</Label>
              <Select 
                value={settings.frequency.reportSchedule} 
                onValueChange={(value) => setSettings(prev => ({
                  ...prev,
                  frequency: { ...prev.frequency, reportSchedule: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="digestFrequency">Digest Frequency</Label>
              <Select 
                value={settings.frequency.digestFrequency} 
                onValueChange={(value) => setSettings(prev => ({
                  ...prev,
                  frequency: { ...prev.frequency, digestFrequency: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white">
          Save Notification Settings
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettingsTab;
