
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor } from 'lucide-react';

const SystemMaintenanceTab = () => {
  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Monitor className="h-5 w-5 mr-2" />
            System Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">System maintenance settings will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMaintenanceTab;
