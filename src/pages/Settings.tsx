
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalization } from '@/hooks/useLocalization';
import { 
  Settings as SettingsIcon, 
  Users, 
  // Cog, // removed unused icon
  Shield, 
  Bell, 
  Database,
  Smartphone,
  CreditCard,
  HelpCircle,
  Info,
  // Zap, // removed unused icon
  // User, // removed unused icon
  BarChart3,
  Lock,
  Monitor,
  ArrowLeft
} from 'lucide-react';
import GeneralSettingsTab from '@/components/settings/GeneralSettingsTab';
import UserManagementTab from '@/components/settings/UserManagementTab';
// Removed unused: FinancialSettingsTab
// import SystemConfigurationTab from '@/components/settings/SystemConfigurationTab'; // removed unused import
// Removed unused: DocumentManagementTab
import SecuritySettingsTab from '@/components/settings/SecuritySettingsTab';
import NotificationSettingsTab from '@/components/settings/NotificationSettingsTab';
// Removed unused: CustomizationTab
import DataManagementTab from '@/components/settings/DataManagementTab';
import MobileSettingsTab from '@/components/settings/MobileSettingsTab';
import BillingSubscriptionTab from '@/components/settings/BillingSubscriptionTab';
import HelpSupportTab from '@/components/settings/HelpSupportTab';
import AboutTab from '@/components/settings/AboutTab';
// import AdvancedSettingsTab from '@/components/settings/AdvancedSettingsTab'; // removed unused import
// import UserPreferencesTab from '@/components/settings/UserPreferencesTab'; // removed unused import
// Removed unused: IntegrationSettingsTab
import ReportSettingsTab from '@/components/settings/ReportSettingsTab';
import DataSecurityTab from '@/components/settings/DataSecurityTab';
import SystemMaintenanceTab from '@/components/settings/SystemMaintenanceTab';

const Settings = () => {
  const { t } = useLocalization();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');

  // Define tabs configuration used by TabsList and TabsContent
  const settingsTabs = [
    { id: 'general', label: 'General', icon: SettingsIcon, component: GeneralSettingsTab },
    { id: 'users', label: 'Users', icon: Users, component: UserManagementTab },
    { id: 'security', label: 'Security', icon: Shield, component: SecuritySettingsTab },
    { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationSettingsTab },
    { id: 'data', label: 'Data', icon: Database, component: DataManagementTab },
    { id: 'mobile', label: 'Mobile', icon: Smartphone, component: MobileSettingsTab },
    { id: 'billing', label: 'Billing', icon: CreditCard, component: BillingSubscriptionTab },
    { id: 'help', label: 'Help', icon: HelpCircle, component: HelpSupportTab },
    { id: 'about', label: 'About', icon: Info, component: AboutTab },
    { id: 'reports', label: 'Reports', icon: BarChart3, component: ReportSettingsTab },
    { id: 'dataSecurity', label: 'Data Security', icon: Lock, component: DataSecurityTab },
    { id: 'maintenance', label: 'Maintenance', icon: Monitor, component: SystemMaintenanceTab }
  ] as const;

  // Initialize/Sync active tab from URL (query ?tab=...)
  useEffect(() => {
    // Read query param `tab`
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && settingsTabs.some(t => t.id === tab)) {
      setActiveTab(tab as any);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    // If on users tab and there's a hash, scroll to anchor
    if (activeTab === 'users' && location.hash === '#admin-users') {
      const el = document.getElementById('admin-users');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      }
    }

    // Also, if a specific user is selected via query, dispatch an event for the Users tab to highlight it
    if (activeTab === 'users') {
      const params = new URLSearchParams(location.search);
      const selectedUser = params.get('selectedUser');
      if (selectedUser) {
        // Defer to ensure the Users tab content has mounted
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('settings:selectedUser', { detail: { userId: selectedUser } }));
        }, 100);
      }
    }
  }, [activeTab, location.hash, location.search]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate({ pathname: location.pathname, search: params.toString(), hash: tab === 'users' ? location.hash : '' }, { replace: false });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center space-x-4 mb-6">
            <Link to="/dashboard">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-mokm-purple-600 hover:bg-muted/50 rounded-xl transition-all duration-300 font-sf-pro"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back')}
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent mb-4 font-sf-pro">
            {t('settings.title')}
          </h1>
          <p className="text-xl text-muted-foreground font-sf-pro">
            {t('settings.description')}
          </p>
        </div>

        <div className="animate-fade-in delay-200">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <div className="glass glass-soft border-border/20 shadow-business rounded-lg p-4">
              <TabsList className="grid grid-cols-5 lg:grid-cols-10 xl:grid-cols-19 gap-2 h-auto bg-transparent p-0">
                {settingsTabs.map((tab) => {
                  const IconComponent = tab.icon as any;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-orange-500 data-[state=active]:via-mokm-pink-500 data-[state=active]:to-mokm-purple-500 data-[state=active]:text-white flex flex-col items-center justify-center px-3 py-4 h-auto min-h-[80px] font-sf-pro text-xs"
                    >
                      <IconComponent className="h-5 w-5 mb-1" />
                      <span className="text-center leading-tight">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {settingsTabs.map((tab) => {
              const ComponentToRender = tab.component as any;
              return (
                <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                  <ComponentToRender />
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
