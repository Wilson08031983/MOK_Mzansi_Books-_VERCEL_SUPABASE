
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Invoice } from '@/pages/Invoices';

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
      color: 'blue'
    },
    {
      title: 'Outstanding Balance',
      value: `R ${totalOutstanding.toLocaleString()}`,
      icon: Clock,
      trend: '-8.2%',
      trendUp: false,
      color: 'orange'
    },
    {
      title: 'Overdue Amount',
      value: `R ${overdueAmount.toLocaleString()}`,
      icon: AlertTriangle,
      trend: '+15.3%',
      trendUp: false,
      color: 'red'
    },
    {
      title: 'Paid This Period',
      value: `R ${totalPaid.toLocaleString()}`,
      icon: CheckCircle,
      trend: '+22.1%',
      trendUp: true,
      color: 'green'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryCards.map((card, index) => (
        <Card key={index} className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 font-sf-pro">{card.title}</p>
                <p className="text-2xl font-bold text-slate-900 font-sf-pro">{card.value}</p>
                <div className="flex items-center mt-2">
                  {card.trendUp ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium font-sf-pro ${
                    card.trendUp ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.trend}
                  </span>
                  <span className="text-sm text-slate-500 ml-1 font-sf-pro">vs last period</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${
                card.color === 'blue' ? 'bg-blue-100' :
                card.color === 'orange' ? 'bg-orange-100' :
                card.color === 'red' ? 'bg-red-100' :
                'bg-green-100'
              }`}>
                <card.icon className={`h-6 w-6 ${
                  card.color === 'blue' ? 'text-blue-600' :
                  card.color === 'orange' ? 'text-orange-600' :
                  card.color === 'red' ? 'text-red-600' :
                  'text-green-600'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InvoicesSummaryCards;
