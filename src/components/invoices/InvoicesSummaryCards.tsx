
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowUpRight,
  ArrowDownRight,
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Invoice } from '@/services/invoiceService';

interface InvoicesSummaryCardsProps {
  invoices: Invoice[];
}

const InvoicesSummaryCards: React.FC<InvoicesSummaryCardsProps> = ({ invoices }) => {
  const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalOutstanding = invoices.reduce((sum, invoice) => sum + invoice.balance, 0);
  const totalPaid = invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  
  const overdueAmount = invoices
    .filter(invoice => {
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      return dueDate < today && invoice.balance > 0;
    })
    .reduce((sum, invoice) => sum + invoice.balance, 0);

  const summaryCards = [
    {
      title: 'Total Invoiced',
      value: `R ${totalInvoiced.toLocaleString()}`,
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
      bgColor: 'bg-gradient-to-r from-orange-500 to-pink-500',
      iconColor: 'text-white',
      trendColor: 'text-green-600'
    },
    {
      title: 'Outstanding Balance',
      value: `R ${totalOutstanding.toLocaleString()}`,
      icon: Clock,
      trend: '-8.2%',
      trendUp: false,
      bgColor: 'bg-gradient-to-r from-blue-500 to-purple-500',
      iconColor: 'text-white',
      trendColor: 'text-red-600'
    },
    {
      title: 'Overdue Amount',
      value: `R ${overdueAmount.toLocaleString()}`,
      icon: AlertTriangle,
      trend: '+15.3%',
      trendUp: false,
      bgColor: 'bg-gradient-to-r from-red-500 to-orange-500',
      iconColor: 'text-white',
      trendColor: 'text-red-600'
    },
    {
      title: 'Paid This Period',
      value: `R ${totalPaid.toLocaleString()}`,
      icon: CheckCircle,
      trend: '+22.1%',
      trendUp: true,
      bgColor: 'bg-gradient-to-r from-green-500 to-teal-500',
      iconColor: 'text-white',
      trendColor: 'text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {summaryCards.map((card, index) => (
        <Card 
          key={index} 
          className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-500 hover-lift animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 font-sf-pro">{card.title}</p>
                <div className="mt-3">
                  <p className="text-lg font-bold text-slate-900 font-sf-pro truncate">
                    {card.value}
                  </p>
                </div>
                <p className="text-sm mt-2 flex items-center font-medium font-sf-pro">
                  {card.trendUp ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={card.trendColor}>
                    {card.trend}
                  </span>
                  <span className="text-sm text-slate-500 ml-1 font-sf-pro">vs last period</span>
                </p>
              </div>
              <div 
                className={`p-4 rounded-2xl ${card.bgColor} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
              >
                <card.icon className={`h-7 w-7 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InvoicesSummaryCards;
