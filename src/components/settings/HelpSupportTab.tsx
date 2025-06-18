
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

const HelpSupportTab = () => {
  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <HelpCircle className="h-5 w-5 mr-2" />
            Help & Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Help and support settings will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpSupportTab;
