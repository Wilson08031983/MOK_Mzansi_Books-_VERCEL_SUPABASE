
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useLocalization } from '@/hooks/useLocalization';

import CompanyDetails from '@/components/company/CompanyDetails';
import TeamManagement from '@/components/company/TeamManagement';
import ActivityLog from '@/components/company/ActivityLog';
import DashboardBackground from '@/components/dashboard/DashboardBackground';

const Company = () => {
  const { t, formatDateTime, getTimezoneDisplayName, formatCurrency, settings } = useLocalization();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('company-details');

  // Update document title when language changes
  useEffect(() => {
    document.title = `${t('company.title')} - MOK Mzansi Books`;
  }, [t]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate('/company');
  };

  return (
    <div className="min-h-screen bg-background relative">
      <DashboardBackground />
      <div className="p-8 relative z-10">
        {/* Header with Back Navigation */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-3">
                <Link 
                  to="/dashboard"
                  className="inline-flex items-center px-4 py-2 glass backdrop-blur-md bg-white/10 dark:bg-white/5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white/15 dark:hover:bg-white/10 rounded-xl border border-white/10 shadow-business hover:shadow-business-lg transition-all duration-300 animate-fade-in"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> {t('common.backToDashboard')}
                </Link>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent font-sf-pro">
                {t('company.title')}
              </h1>
              <p className="text-slate-600 text-lg font-sf-pro mt-2">
                {t('company.details')}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="w-full animate-fade-in delay-200"
        >
          <TabsList className="glass glass-soft backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 shadow-business mb-8 p-2 rounded-2xl">
            <TabsTrigger 
              value="company-details"
              className="font-sf-pro data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-orange-500 data-[state=active]:to-mokm-pink-500 data-[state=active]:text-white data-[state=active]:shadow-colored rounded-xl transition-all duration-300"
            >
              {t('company.tabs.companyDetails')}
            </TabsTrigger>
            <TabsTrigger 
              value="team-management"
              className="font-sf-pro data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-purple-500 data-[state=active]:to-mokm-blue-500 data-[state=active]:text-white data-[state=active]:shadow-colored rounded-xl transition-all duration-300"
            >
              {t('company.tabs.teamManagement')}
            </TabsTrigger>
            <TabsTrigger 
              value="activity-log"
              className="font-sf-pro data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-pink-500 data-[state=active]:to-mokm-orange-500 data-[state=active]:text-white data-[state=active]:shadow-colored rounded-xl transition-all duration-300"
            >
              {t('company.tabs.activityLog')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="company-details" className="animate-fade-in">
            <CompanyDetails />
          </TabsContent>
          
          <TabsContent value="team-management" className="animate-fade-in">
            <TeamManagement />
          </TabsContent>
          
          <TabsContent value="activity-log" className="animate-fade-in">
            <ActivityLog />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Company;
