
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Mail, 
  FileText, 
  Receipt,
  Phone,
  Building
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface ClientsGridProps {
  clients: Client[];
  selectedClients: string[];
  onSelectClient: (clientId: string) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
}

const ClientsGrid = ({
  clients,
  selectedClients,
  onSelectClient,
  getStatusIcon,
  getStatusColor
}: ClientsGridProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Eye className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-slate-900 font-semibold font-sf-pro mb-2">No clients found</h3>
        <p className="text-slate-600 font-sf-pro text-sm">Try adjusting your search terms or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clients.map((client) => (
        <Card
          key={client.id}
          className="glass backdrop-blur-sm bg-white/30 border border-white/20 hover:bg-white/40 transition-all duration-300 hover-lift"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedClients.includes(client.id)}
                  onChange={() => onSelectClient(client.id)}
                  className="rounded border-gray-300"
                />
                <div className="w-12 h-12 bg-gradient-to-br from-mokm-purple-500 to-mokm-blue-500 rounded-2xl flex items-center justify-center shadow-colored">
                  <span className="text-white font-semibold font-sf-pro text-lg">{client.avatar}</span>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Client
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Receipt className="h-4 w-4 mr-2" />
                    Create Quotation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-slate-900 font-sf-pro text-lg">{client.name}</h3>
                <div className="flex items-center space-x-2 text-slate-600 text-sm">
                  <Building className="h-4 w-4" />
                  <span className="font-sf-pro">{client.company}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-600 text-sm">
                  <Mail className="h-4 w-4" />
                  <span className="font-sf-pro truncate">{client.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600 text-sm">
                  <Phone className="h-4 w-4" />
                  <span className="font-sf-pro">{client.phone}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-white/20">
                <div>
                  <p className="text-xs text-slate-500 font-sf-pro">Total Value</p>
                  <p className="font-semibold text-slate-900 font-sf-pro">R{client.totalValue.toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(client.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium font-sf-pro ${getStatusColor(client.status)}`}>
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-slate-500 font-sf-pro">
                Last activity: {formatDate(client.lastActivity)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClientsGrid;
