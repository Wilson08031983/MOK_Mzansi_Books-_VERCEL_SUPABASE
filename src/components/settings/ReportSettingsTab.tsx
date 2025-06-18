
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

const ReportSettingsTab = () => {
  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <BarChart3 className="h-5 w-5 mr-2" />
            Report Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Report settings will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportSettingsTab;
