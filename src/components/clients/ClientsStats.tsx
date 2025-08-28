
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Clock, AlertTriangle, DollarSign } from 'lucide-react';
import { useLocalizationContext } from '@/contexts/LocalizationContext';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  totalValue: number;
  lastActivity: string;
  status: string;
  type: string;
  avatar: string;
}

interface ClientsStatsProps {
  clients: Client[];
}

const ClientsStats: React.FC<ClientsStatsProps> = ({ clients }) => {
  const { t, formatCurrency } = useLocalizationContext();
  const totalClients = clients.length;
  const activeClients = clients.filter(client => client.status === 'active').length;
  const inactiveClients = clients.filter(client => client.status === 'inactive').length;
  const overdueClients = clients.filter(client => client.status === 'overdue').length;
  const totalValue = clients.reduce((sum, client) => sum + client.totalValue, 0);
  const totalValueDisplay = formatCurrency(totalValue);

  const stats = [
    {
      title: t('clients.totalClients'),
      value: totalClients,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: t('clients.totalValue'),
      value: totalValueDisplay,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: t('clients.activeClients'),
      value: activeClients,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: t('clients.overdueClients'),
      value: overdueClients,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="glass backdrop-blur-sm bg-card border border-border shadow-business hover:shadow-business-lg transition-all duration-300 hover-lift group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-sf-pro">
              {stat.title}
            </CardTitle>
            <div className={`p-3 rounded-2xl ${stat.bgColor} transition-all duration-300 group-hover:scale-110`}>
              <stat.icon className={`h-5 w-5 ${stat.color || 'text-primary'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-sf-pro">
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClientsStats;
