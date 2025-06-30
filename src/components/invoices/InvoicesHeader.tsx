
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

interface InvoicesHeaderProps {
  title?: string;
  description?: string;
  onCreateInvoice: () => void;
  onRecordPayment: () => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  className?: string;
}

const InvoicesHeader: React.FC<InvoicesHeaderProps> = ({
  title = 'Invoices',
  description = 'Manage and track your invoices and payments',
  onCreateInvoice,
  onRecordPayment,
  viewMode,
  onViewModeChange,
  className = ''
}) => {
  return (
    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${className}`}>
      <div className="flex items-center gap-4">
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-lg transition-colors font-sf-pro"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sf-pro">{title}</h1>
          <p className="text-xs text-slate-600 font-sf-pro">{description}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
          <Button
            variant={viewMode === 'table' ? 'gradient' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('table')}
            className={`rounded-md ${viewMode === 'table' ? 'text-white shadow' : 'text-slate-600'}`}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'gradient' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={`rounded-md ${viewMode === 'grid' ? 'text-white shadow' : 'text-slate-600'}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
        
<div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={onRecordPayment}
            className="font-sf-pro border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Receive Payment
          </Button>
          <Button 
            variant="gradient"
            onClick={onCreateInvoice}
            className="font-sf-pro hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoicesHeader;
