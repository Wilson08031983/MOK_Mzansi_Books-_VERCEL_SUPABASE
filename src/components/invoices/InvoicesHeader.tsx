
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  CreditCard, 
  Grid3X3, 
  List,
  ArrowLeft
} from 'lucide-react';
import { useLocalization } from '@/hooks/useLocalization';

interface InvoicesHeaderProps {
  title?: string;
  description?: string;
  onCreateInvoice: () => void;
  onRecordPayment: () => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  className?: string;
  hasSelectedInvoice?: boolean;
}

const InvoicesHeader: React.FC<InvoicesHeaderProps> = ({
  title,
  description,
  onCreateInvoice,
  onRecordPayment,
  viewMode,
  onViewModeChange,
  className = '',
  hasSelectedInvoice = false
}) => {
  const { t } = useLocalization();
  return (
    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${className}`}>
      <div className="flex items-center gap-4">
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-white/10 rounded-lg transition-colors font-sf-pro"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t('common.backToDashboard')}</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-sf-pro">{title || t('invoices.title')}</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-sf-pro">{description || t('invoices.description')}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center glass backdrop-blur-md bg-white/10 dark:bg-black/30 p-1 rounded-xl border border-white/10 shadow-business">
          <Button
            variant={viewMode === 'table' ? 'gradient' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('table')}
            className={`rounded-md ${viewMode === 'table' ? 'text-white shadow' : 'glass backdrop-blur-md bg-white/5 dark:bg-white/5 border border-white/10 text-slate-300 hover:bg-white/15 dark:hover:bg-white/10'}`}
            title={t('common.view')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'gradient' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={`rounded-md ${viewMode === 'grid' ? 'text-white shadow' : 'glass backdrop-blur-md bg-white/5 dark:bg-white/5 border border-white/10 text-slate-300 hover:bg-white/15 dark:hover:bg-white/10'}`}
            title={t('common.view')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
        
<div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={onRecordPayment}
            className={`font-sf-pro border-slate-200 dark:border-slate-700 transition-colors ${
              hasSelectedInvoice 
                ? 'hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-slate-100' 
                : 'text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
            }`}
            title={hasSelectedInvoice ? t('invoices.recordPaymentTooltip') : t('invoices.selectInvoiceToRecordPayment')}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {t('invoices.receivePayment')}
          </Button>
          <Button 
            variant="gradient"
            onClick={onCreateInvoice}
            className="font-sf-pro hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('invoices.createInvoice')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoicesHeader;
