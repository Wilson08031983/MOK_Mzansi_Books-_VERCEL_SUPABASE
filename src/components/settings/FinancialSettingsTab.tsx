
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Calculator, Receipt } from 'lucide-react';

const FinancialSettingsTab = () => {
  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <DollarSign className="h-5 w-5 mr-2" />
            Financial Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Financial settings configuration will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSettingsTab;
