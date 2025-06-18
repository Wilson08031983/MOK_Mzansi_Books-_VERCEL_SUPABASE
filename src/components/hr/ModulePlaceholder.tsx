
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({ title, description, icon }) => (
  <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
    <CardContent className="p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2 font-sf-pro">{title}</h3>
      <p className="text-slate-600 mb-6 font-sf-pro">{description}</p>
      <Button className="bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 hover:from-mokm-orange-600 hover:to-mokm-pink-600 font-sf-pro">
        Coming Soon
      </Button>
    </CardContent>
  </Card>
);

export default ModulePlaceholder;
