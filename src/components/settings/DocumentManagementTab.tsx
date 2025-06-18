
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const DocumentManagementTab = () => {
  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <FileText className="h-5 w-5 mr-2" />
            Document Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Document management settings will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentManagementTab;
