
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  CreditCard, 
  Download, 
  Upload, 
  Grid3X3, 
  List,
  MoreHorizontal,
  ArrowLeft
} from 'lucide-react';

interface InvoicesHeaderProps {
  onCreateInvoice: () => void;
  onRecordPayment: () => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
}

const InvoicesHeader: React.FC<InvoicesHeaderProps> = ({
  onCreateInvoice,
  onRecordPayment,
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-4">
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-lg transition-colors font-sf-pro"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sf-pro">Invoices</h1>
          <p className="text-slate-600 font-sf-pro">Manage and track your invoices and payments</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-slate-200 rounded-lg">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('table')}
            className="rounded-r-none"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-l-none"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={onRecordPayment}
            className="font-sf-pro"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Receive Payment
          </Button>
          <Button 
            onClick={onCreateInvoice}
            className="font-sf-pro"
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
