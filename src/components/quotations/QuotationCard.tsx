
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical,
  Calendar,
  User
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import QuotationCardMenu from './QuotationCardMenu';
import QuotationCardActions from './QuotationCardActions';

import { Quotation as QuotationType } from '@/services/quotationService';

interface QuotationCardProps {
  quotation: QuotationType;
  isSelected: boolean;
  onSelect: (quotationId: string) => void;
  onAction: (action: string, quotation: QuotationType) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
}

const QuotationCard: React.FC<QuotationCardProps> = ({
  quotation,
  isSelected,
  onSelect,
  onAction,
  getStatusIcon,
  getStatusColor
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300 hover-lift group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(quotation.id)}
              className="rounded border-slate-300 text-mokm-purple-600 focus:ring-mokm-purple-500"
            />
            <div>
              <Link 
                to={`/quotations/${quotation.id}`}
                className="text-lg font-semibold text-mokm-purple-600 hover:text-mokm-purple-700 hover:underline font-sf-pro"
              >
                {quotation.number}
              </Link>
              <p className="text-sm text-slate-500 font-sf-pro">{quotation.reference}</p>
            </div>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="text-slate-600 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            <QuotationCardMenu
              isOpen={showMenu}
              onClose={() => setShowMenu(false)}
              quotation={quotation}
              onAction={onAction}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(quotation.status)} font-sf-pro`}>
              <span className="mr-1.5 flex-shrink-0">
                {getStatusIcon(quotation.status)}
              </span>
              <span className="truncate">
                {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
              </span>
            </div>
            <span className="text-lg font-bold text-slate-900 font-sf-pro">
              {formatCurrency(quotation.amount)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-slate-600">
              <User className="h-4 w-4 mr-2" />
              <span className="font-sf-pro">{quotation.client}</span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="font-sf-pro">{formatDate(quotation.date)}</span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="font-sf-pro">Expires: {formatDate(quotation.expiryDate)}</span>
            </div>
          </div>

          <QuotationCardActions quotation={quotation} onAction={onAction} />
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotationCard;
