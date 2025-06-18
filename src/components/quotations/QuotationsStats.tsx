
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Eye,
  XCircle,
  BarChart3,
  Target
} from 'lucide-react';

interface QuotationsStatsProps {
  quotations: any[];
}

const QuotationsStats: React.FC<QuotationsStatsProps> = ({ quotations }) => {
  const totalQuotations = quotations.length;
  const totalValue = quotations.reduce((sum, quotation) => sum + quotation.amount, 0);
  const acceptedQuotations = quotations.filter(q => q.status === 'accepted').length;
  const pendingQuotations = quotations.filter(q => q.status === 'sent' || q.status === 'viewed').length;
  const expiredQuotations = quotations.filter(q => q.status === 'expired').length;
  const draftQuotations = quotations.filter(q => q.status === 'draft').length;
  const rejectedQuotations = quotations.filter(q => q.status === 'rejected').length;
  const viewedQuotations = quotations.filter(q => q.status === 'viewed').length;
  
  const conversionRate = totalQuotations > 0 ? Math.round((acceptedQuotations / totalQuotations) * 100) : 0;
  const averageValue = totalQuotations > 0 ? totalValue / totalQuotations : 0;
  const acceptedValue = quotations
    .filter(q => q.status === 'accepted')
    .reduce((sum, q) => sum + q.amount, 0);

  const stats = [
    {
      title: 'Total Quotations',
      value: totalQuotations,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'positive',
      description: 'All quotations created'
    },
    {
      title: 'Total Value',
      value: `R ${totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8.5%',
      changeType: 'positive',
      description: 'Combined quotation value'
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+3.2%',
      changeType: 'positive',
      description: 'Quotations to sales ratio'
    },
    {
      title: 'Average Value',
      value: `R ${averageValue.toLocaleString()}`,
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      change: '+5.1%',
      changeType: 'positive',
      description: 'Average quotation amount'
    },
    {
      title: 'Accepted',
      value: acceptedQuotations,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+15%',
      changeType: 'positive',
      description: `R ${acceptedValue.toLocaleString()} total`
    },
    {
      title: 'Pending',
      value: pendingQuotations,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      change: '-2%',
      changeType: 'negative',
      description: 'Awaiting client response'
    },
    {
      title: 'Viewed',
      value: viewedQuotations,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+7%',
      changeType: 'positive',
      description: 'Seen by clients'
    },
    {
      title: 'Draft',
      value: draftQuotations,
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      change: '+3%',
      changeType: 'positive',
      description: 'Not yet sent'
    },
    {
      title: 'Expired',
      value: expiredQuotations,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: '-5%',
      changeType: 'positive',
      description: 'Past expiry date'
    },
    {
      title: 'Rejected',
      value: rejectedQuotations,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: '-8%',
      changeType: 'positive',
      description: 'Declined by clients'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300 hover-lift group cursor-pointer"
        >
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center space-y-3">
              {/* Icon */}
              <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              
              {/* Title and Value */}
              <div className="space-y-1">
                <p className="text-slate-600 text-xs font-medium font-sf-pro leading-tight">
                  {stat.title}
                </p>
                <p className="text-xl font-bold text-slate-900 font-sf-pro">
                  {stat.value}
                </p>
              </div>
              
              {/* Change Indicator */}
              <div className="flex flex-col items-center space-y-1">
                <span className={`text-xs font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-xs text-slate-500 font-sf-pro leading-tight">
                  {stat.description}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuotationsStats;
