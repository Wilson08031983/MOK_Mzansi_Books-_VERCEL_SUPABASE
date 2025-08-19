
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Users, Plus, Receipt } from 'lucide-react';
import { useLocalization } from '@/hooks/useLocalization';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  
  const actions = [
    {
      title: t('invoices.createInvoice'),
      icon: FileText,
      onClick: () => navigate('/invoices', { state: { openCreateInvoiceModal: true } })
    },
    {
      title: t('clients.addClient'),
      icon: Users,
      onClick: () => navigate('/clients', { state: { openAddClientModal: true } })
    },
    {
      title: t('quotations.createQuotation'),
      icon: Plus,
      onClick: () => navigate('/quotations', { state: { openCreateQuotationModal: true } })
    },
    {
      title: t('common.recordExpense'),
      icon: Receipt,
      onClick: () => navigate('/accounting', { state: { openAddExpenseModal: true } })
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {actions.map((action, index) => (
        <div
          key={index}
          className={`glass backdrop-blur-sm bg-card border border-border rounded-2xl p-6 shadow-business hover:shadow-business-lg transition-all duration-500 hover-lift animate-fade-in delay-${index * 100} group cursor-pointer`}
          onClick={action.onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { action.onClick(); } }}
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className={`p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110`}>
              <action.icon className="h-7 w-7 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors font-sf-pro">
              {action.title}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickActions;
