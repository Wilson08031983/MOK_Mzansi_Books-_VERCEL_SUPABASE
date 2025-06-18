
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette } from 'lucide-react';

const CustomizationTab = () => {
  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Palette className="h-5 w-5 mr-2" />
            Customization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Customization settings will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomizationTab;
