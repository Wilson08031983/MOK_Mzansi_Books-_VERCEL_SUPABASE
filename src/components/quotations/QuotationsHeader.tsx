
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Upload,
  Download,
  RefreshCw,
  List,
  Grid3X3,
  Settings,
  Plus,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuotationsHeaderProps {
  viewMode: 'table' | 'grid';
  setViewMode: (mode: 'table' | 'grid') => void;
  setIsCreateQuotationModalOpen: (open: boolean) => void;
}

const QuotationsHeader: React.FC<QuotationsHeaderProps> = ({
  viewMode,
  setViewMode,
  setIsCreateQuotationModalOpen
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-sf-pro">Quotations</h1>
          <p className="text-slate-600 font-sf-pro">Create, manage, and track your quotations</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Import/Export Actions */}
        <div className="relative">
          <Button
            variant="outline"
            className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl transition-all duration-300"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="relative">
          <Button
            variant="outline"
            className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl transition-all duration-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl transition-all duration-300"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        
        {/* View Toggle */}
        <div className="flex items-center border border-slate-300 rounded-xl p-1">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="rounded-lg"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-lg"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Settings */}
        <Button
          variant="outline"
          className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl transition-all duration-300"
        >
          <Settings className="h-4 w-4" />
        </Button>
        
        {/* Create Quotation */}
        <Button
          onClick={() => setIsCreateQuotationModalOpen(true)}
          className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white font-sf-pro rounded-xl shadow-colored hover:shadow-colored-lg transition-all duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Quotation
        </Button>
      </div>
    </div>
  );
};

export default QuotationsHeader;
