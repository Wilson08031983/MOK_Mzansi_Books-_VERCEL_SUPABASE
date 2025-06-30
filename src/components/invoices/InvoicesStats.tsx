import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  FileText,
  CheckCircle
} from 'lucide-react';
import { Invoice, getInvoiceStats } from '@/services/invoiceService';

interface InvoicesStatsProps {
  invoices: Invoice[];
}

const InvoicesStats: React.FC<InvoicesStatsProps> = ({ invoices }) => {
  const stats = getInvoiceStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statsData = [
    {
      title: 'Total Invoiced',
      value: formatCurrency(stats.totalInvoiced),
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: `${stats.totalInvoices} invoices`,
      trend: '+12%'
    },
    {
      title: 'Outstanding Balance',
      value: formatCurrency(stats.outstandingBalance),
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      description: `${stats.totalInvoices - stats.paidInvoices} unpaid`,
      trend: '-5%'
    },
    {
      title: 'Overdue Amount',
      value: formatCurrency(stats.overdueAmount),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: `${stats.overdueInvoices} overdue`,
      trend: '+8%'
    },
    {
      title: 'Paid This Period',
      value: formatCurrency(stats.paidThisPeriod),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: `${stats.paidInvoices} paid`,
      trend: '+15%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card 
            key={index} 
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border ${stat.borderColor} ${stat.bgColor}/30 backdrop-blur-sm`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.borderColor} border`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-medium">
                    {stat.trend}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </h3>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.description}
                </p>
              </div>
            </div>
            
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
          </Card>
        );
      })}
    </div>
  );
};

export default InvoicesStats;
