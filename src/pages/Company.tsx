
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CompanyDetails from '@/components/company/CompanyDetails';
import TeamManagement from '@/components/company/TeamManagement';
import ActivityLog from '@/components/company/ActivityLog';

const Company = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('company-details');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate('/company');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="p-8">
        {/* Header with Back Navigation */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-3">
                <Link to="/dashboard">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-slate-600 hover:text-mokm-purple-600 hover:bg-white/50 rounded-xl transition-all duration-300 font-sf-pro"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent font-sf-pro">
                My Company
              </h1>
              <p className="text-slate-600 text-lg font-sf-pro mt-2">
                Manage your company details, team and view activity logs
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
          <TabsList className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business mb-8 p-2 rounded-2xl">
            <TabsTrigger 
              value="company-details"
              className="font-sf-pro data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-orange-500 data-[state=active]:to-mokm-pink-500 data-[state=active]:text-white data-[state=active]:shadow-colored rounded-xl transition-all duration-300"
            >
              Company Details
            </TabsTrigger>
            <TabsTrigger 
              value="team-management"
              className="font-sf-pro data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-purple-500 data-[state=active]:to-mokm-blue-500 data-[state=active]:text-white data-[state=active]:shadow-colored rounded-xl transition-all duration-300"
            >
              Team Management
            </TabsTrigger>
            <TabsTrigger 
              value="activity-log"
              className="font-sf-pro data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-pink-500 data-[state=active]:to-mokm-orange-500 data-[state=active]:text-white data-[state=active]:shadow-colored rounded-xl transition-all duration-300"
            >
              Activity Log
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
