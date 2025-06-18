
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Clock, AlertTriangle, DollarSign } from 'lucide-react';

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
  const totalClients = clients.length;
  const activeClients = clients.filter(client => client.status === 'active').length;
  const inactiveClients = clients.filter(client => client.status === 'inactive').length;
  const overdueClients = clients.filter(client => client.status === 'overdue').length;
  const totalValue = clients.reduce((sum, client) => sum + client.totalValue, 0);

  const stats = [
    {
      title: 'Total Clients',
      value: totalClients,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      bgGradient: 'from-mokm-blue-500 to-mokm-purple-500'
    },
    {
      title: 'Total Value',
      value: `R${totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      bgGradient: 'from-mokm-purple-500 to-mokm-pink-500'
    },
    {
      title: 'Active Clients',
      value: activeClients,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      bgGradient: 'from-mokm-pink-500 to-mokm-orange-500'
    },
    {
      title: 'Overdue Clients',
      value: overdueClients,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      bgGradient: 'from-mokm-orange-500 to-mokm-pink-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300 hover-lift group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 font-sf-pro">
              {stat.title}
            </CardTitle>
            <div className={`p-3 rounded-2xl bg-gradient-to-r ${stat.bgGradient} shadow-colored group-hover:shadow-colored-lg transition-all duration-300 group-hover:scale-110`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 font-sf-pro">
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClientsStats;
