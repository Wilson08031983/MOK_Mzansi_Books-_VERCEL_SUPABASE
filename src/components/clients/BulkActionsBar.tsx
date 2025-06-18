
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Download, 
  Trash2, 
  X, 
  Users, 
  Settings 
} from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
}

const BulkActionsBar = ({ selectedCount, onClearSelection }: BulkActionsBarProps) => {
  return (
    <Card className="glass backdrop-blur-sm bg-white/80 border border-white/40 shadow-business">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-mokm-purple-500" />
              <span className="font-semibold text-slate-900 font-sf-pro">
                {selectedCount} client{selectedCount !== 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl"
              >
                <Settings className="h-4 w-4 mr-2" />
                Change Status
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl"
              >
                <Users className="h-4 w-4 mr-2" />
                Add to Group
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Selected
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-50 font-sf-pro rounded-xl"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-slate-500 hover:text-slate-700 hover:bg-white/50 rounded-xl"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Selection
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BulkActionsBar;
