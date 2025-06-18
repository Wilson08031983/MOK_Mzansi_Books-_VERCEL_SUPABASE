
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Users, Plus, Receipt } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      title: 'Create Invoice',
      icon: FileText,
      bgGradient: 'from-mokm-blue-500 to-mokm-purple-500',
      hoverGradient: 'from-mokm-blue-600 to-mokm-purple-600',
      onClick: () => console.log('Navigate to create invoice')
    },
    {
      title: 'Add Client',
      icon: Users,
      bgGradient: 'from-mokm-purple-500 to-mokm-pink-500',
      hoverGradient: 'from-mokm-purple-600 to-mokm-pink-600',
      onClick: () => console.log('Navigate to add client')
    },
    {
      title: 'New Quotation',
      icon: Plus,
      bgGradient: 'from-mokm-pink-500 to-mokm-orange-500',
      hoverGradient: 'from-mokm-pink-600 to-mokm-orange-600',
      onClick: () => console.log('Navigate to create quotation')
    },
    {
      title: 'Record Expense',
      icon: Receipt,
      bgGradient: 'from-mokm-orange-500 to-mokm-pink-500',
      hoverGradient: 'from-mokm-orange-600 to-mokm-pink-600',
      onClick: () => console.log('Navigate to record expense')
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {actions.map((action, index) => (
        <div
          key={index}
          className={`glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-2xl p-6 shadow-business hover:shadow-business-lg transition-all duration-500 hover-lift animate-fade-in delay-${index * 100} group cursor-pointer`}
          onClick={action.onClick}
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${action.bgGradient} group-hover:bg-gradient-to-r group-hover:${action.hoverGradient} shadow-colored group-hover:shadow-colored-lg transition-all duration-300 group-hover:scale-110`}>
              <action.icon className="h-7 w-7 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors font-sf-pro">
              {action.title}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickActions;
