
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalization } from '@/hooks/useLocalization';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Users, 
  DollarSign, 
  Cog, 
  FileText, 
  Shield, 
  Bell, 
  Palette, 
  Database,
  Smartphone,
  CreditCard,
  HelpCircle,
  Info,
  Zap,
  User,
  Calendar,
  BarChart3,
  Lock,
  Monitor,
  ArrowLeft
} from 'lucide-react';
import GeneralSettingsTab from '@/components/settings/GeneralSettingsTab';
import UserManagementTab from '@/components/settings/UserManagementTab';
import FinancialSettingsTab from '@/components/settings/FinancialSettingsTab';
import SystemConfigurationTab from '@/components/settings/SystemConfigurationTab';
import DocumentManagementTab from '@/components/settings/DocumentManagementTab';
import SecuritySettingsTab from '@/components/settings/SecuritySettingsTab';
import NotificationSettingsTab from '@/components/settings/NotificationSettingsTab';
import CustomizationTab from '@/components/settings/CustomizationTab';
import DataManagementTab from '@/components/settings/DataManagementTab';
import MobileSettingsTab from '@/components/settings/MobileSettingsTab';
import BillingSubscriptionTab from '@/components/settings/BillingSubscriptionTab';
import HelpSupportTab from '@/components/settings/HelpSupportTab';
import AboutTab from '@/components/settings/AboutTab';
import AdvancedSettingsTab from '@/components/settings/AdvancedSettingsTab';
import UserPreferencesTab from '@/components/settings/UserPreferencesTab';
import IntegrationSettingsTab from '@/components/settings/IntegrationSettingsTab';
import ReportSettingsTab from '@/components/settings/ReportSettingsTab';
import DataSecurityTab from '@/components/settings/DataSecurityTab';
import SystemMaintenanceTab from '@/components/settings/SystemMaintenanceTab';

const Settings = () => {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState('general');

  // Update document title when language changes
  useEffect(() => {
    document.title = `${t('settings.title')} - MOK Mzansi Books`;
  }, [t]);

  const settingsTabs = [
    { id: 'general', label: 'General', icon: SettingsIcon, component: GeneralSettingsTab },
    { id: 'users', label: 'Users', icon: Users, component: UserManagementTab },
    { id: 'financial', label: 'Financial', icon: DollarSign, component: FinancialSettingsTab },
    { id: 'system', label: 'System', icon: Cog, component: SystemConfigurationTab },
    { id: 'documents', label: 'Documents', icon: FileText, component: DocumentManagementTab },
    { id: 'security', label: 'Security', icon: Shield, component: SecuritySettingsTab },
    { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationSettingsTab },
    { id: 'customization', label: 'Customization', icon: Palette, component: CustomizationTab },
    { id: 'data', label: 'Data', icon: Database, component: DataManagementTab },
    { id: 'mobile', label: 'Mobile', icon: Smartphone, component: MobileSettingsTab },
    { id: 'billing', label: 'Billing', icon: CreditCard, component: BillingSubscriptionTab },
    { id: 'help', label: 'Help', icon: HelpCircle, component: HelpSupportTab },
    { id: 'about', label: 'About', icon: Info, component: AboutTab },
    { id: 'advanced', label: 'Advanced', icon: Zap, component: AdvancedSettingsTab },
    { id: 'preferences', label: 'Preferences', icon: User, component: UserPreferencesTab },
    { id: 'integrations', label: 'Integrations', icon: Calendar, component: IntegrationSettingsTab },
    { id: 'reports', label: 'Reports', icon: BarChart3, component: ReportSettingsTab },
    { id: 'dataSecurity', label: 'Data Security', icon: Lock, component: DataSecurityTab },
    { id: 'maintenance', label: 'Maintenance', icon: Monitor, component: SystemMaintenanceTab }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto p-8">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center space-x-4 mb-6">
            <Link to="/dashboard">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-slate-600 hover:text-mokm-purple-600 hover:bg-white/50 rounded-xl transition-all duration-300 font-sf-pro"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back')}
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent mb-4 font-sf-pro">
            {t('settings.title')}
          </h1>
          <p className="text-xl text-slate-600 font-sf-pro">
            {t('settings.description')}
          </p>
        </div>

        <div className="animate-fade-in delay-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business rounded-lg p-4">
              <TabsList className="grid grid-cols-5 lg:grid-cols-10 xl:grid-cols-19 gap-2 h-auto bg-transparent p-0">
                {settingsTabs.map((tab) => {
                  const IconComponent = tab.icon;
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
              const ComponentToRender = tab.component;
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
