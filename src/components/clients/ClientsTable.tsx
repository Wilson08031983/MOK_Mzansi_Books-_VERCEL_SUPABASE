
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import AddClientModal from './AddClientModal';

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

interface ClientsTableProps {
  clients: Client[];
  selectedClients: string[];
  onSelectClient: (clientId: string) => void;
  onSelectAll: () => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
}

const ClientsTable = ({
  clients,
  selectedClients,
  onSelectClient,
  onSelectAll,
  getStatusIcon,
  getStatusColor
}: ClientsTableProps) => {
  const [viewClientData, setViewClientData] = useState<string | null>(null);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={selectedClients.length === clients.length && clients.length > 0}
                onChange={onSelectAll}
                className="rounded border-gray-300"
              />
            </TableHead>
            <TableHead className="font-sf-pro">Client Name</TableHead>
            <TableHead className="font-sf-pro">Company</TableHead>
            <TableHead className="font-sf-pro">Email</TableHead>
            <TableHead className="font-sf-pro">Phone</TableHead>
            <TableHead className="font-sf-pro">Total Value</TableHead>
            <TableHead className="font-sf-pro">Last Activity</TableHead>
            <TableHead className="font-sf-pro">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className="hover:bg-white/40 transition-colors">
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedClients.includes(client.id)}
                  onChange={() => onSelectClient(client.id)}
                  className="rounded border-gray-300"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-mokm-purple-500 to-mokm-blue-500 rounded-xl flex items-center justify-center shadow-colored">
                    <span className="text-white font-semibold font-sf-pro text-sm">{client.avatar}</span>
                  </div>
                  <span className="font-semibold text-slate-900 font-sf-pro">{client.name}</span>
                </div>
              </TableCell>
              <TableCell className="font-sf-pro text-slate-700">{client.company}</TableCell>
              <TableCell className="font-sf-pro text-slate-600">{client.email}</TableCell>
              <TableCell className="font-sf-pro text-slate-600">{client.phone}</TableCell>
              <TableCell className="font-sf-pro font-semibold text-slate-900">
                R {client.totalValue.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="font-sf-pro text-slate-600">
                {formatDate(client.lastActivity)}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(client.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium font-sf-pro ${getStatusColor(client.status)}`}>
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Empty state handled at page-level in `src/pages/Clients.tsx` */}
      
      {/* View Client Modal */}
      {viewClientData && (
        <AddClientModal
          isOpen={viewClientData !== null}
          onClose={() => setViewClientData(null)}
          clientId={viewClientData}
          viewMode={true}
        />
      )}
    </div>
  );
};

export default ClientsTable;
