import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  FileText, 
  Eye, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Upload,
  Download
} from 'lucide-react';
import { generateTaxHistoryPDF } from '../../utils/taxHistoryPdfGenerator';

export interface BusinessTaxReturn {
  id: string;
  name: string;
  description: string;
  type: 'VAT201' | 'PAYE_EMP201' | 'IRP6' | 'ITR14' | 'DTR01' | 'CUSTOMS' | 'TURNOVER';
  status: 'pending' | 'submitted' | 'overdue' | 'completed';
  dueDate: string;
  amount?: number;
  period: string;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

interface BusinessTaxCardProps {
  taxReturn: BusinessTaxReturn;
  onSubmit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  allTaxReturns: BusinessTaxReturn[]; // Added for PDF generation
}

const BusinessTaxCard: React.FC<BusinessTaxCardProps> = ({ 
  taxReturn, 
  onSubmit, 
  onView, 
  onDelete,
  allTaxReturns 
}) => {
  
  // Handle PDF download for tax history
  const handleDownloadHistory = async () => {
    try {
      await generateTaxHistoryPDF(taxReturn.type, allTaxReturns);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'submitted':
        return <Upload className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const isOverdue = () => {
    const today = new Date();
    const due = new Date(taxReturn.dueDate);
    return due < today && taxReturn.status !== 'completed' && taxReturn.status !== 'submitted';
  };

  const getDaysUntilDue = () => {
    const today = new Date();
    const due = new Date(taxReturn.dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="glass backdrop-blur-xl bg-white/90 border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-slate-900 font-sf-pro mb-1">
              {taxReturn.name}
            </CardTitle>
            <p className="text-sm text-slate-600 leading-relaxed">
              {taxReturn.description}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {getStatusIcon(taxReturn.status)}
            <Badge 
              variant="outline" 
              className={`${getStatusColor(taxReturn.status)} font-medium text-xs px-2 py-1`}
            >
              {taxReturn.status.charAt(0).toUpperCase() + taxReturn.status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Tax Return Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 font-medium">Period:</span>
            <span className="text-slate-900 font-semibold">{taxReturn.period}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Due Date:
            </span>
            <span className={`font-semibold ${
              isOverdue() ? 'text-red-600' : 
              getDaysUntilDue() <= 7 ? 'text-yellow-600' : 'text-slate-900'
            }`}>
              {formatDate(taxReturn.dueDate)}
              {getDaysUntilDue() > 0 && (
                <span className="text-xs ml-1 text-slate-500">
                  ({getDaysUntilDue()} days)
                </span>
              )}
            </span>
          </div>
          
          {taxReturn.amount && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">Amount:</span>
              <span className="text-slate-900 font-bold">
                R{taxReturn.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          
          {taxReturn.reference && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">Reference:</span>
              <span className="text-slate-700 font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                {taxReturn.reference}
              </span>
            </div>
          )}
        </div>
        
        {/* Urgency Indicator */}
        {isOverdue() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-800 text-sm font-medium">
                Overdue by {Math.abs(getDaysUntilDue())} days
              </span>
            </div>
          </div>
        )}
        
        {getDaysUntilDue() <= 7 && getDaysUntilDue() > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-yellow-800 text-sm font-medium">
                Due in {getDaysUntilDue()} days
              </span>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            onClick={handleDownloadHistory}
            className="flex-1 bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white hover:shadow-lg transition-all duration-300 font-medium"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Download History
          </Button>
          
          <Button
            onClick={() => onView(taxReturn.id)}
            variant="outline"
            className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
            size="sm"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => onDelete(taxReturn.id)}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
            size="sm"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessTaxCard;