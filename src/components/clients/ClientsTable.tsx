import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, XCircle, HelpCircle } from 'lucide-react';
import { useLocalization } from '@/hooks/useLocalization';
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
  statusReason?: string;
  type: string;
  avatar: string;
  creditLimit: number;
  outstanding: number;
  overCredit: boolean;
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
  getStatusIcon: statusIconFn,
  getStatusColor: statusColorFn
}: ClientsTableProps) => {
  const [viewClientData, setViewClientData] = useState<string | null>(null);
  const [tooltipClient, setTooltipClient] = useState<string | null>(null);
  const { t, formatCurrency, formatDate } = useLocalization();

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
            <TableHead className="font-sf-pro">{t('clients.clientName')}</TableHead>
            <TableHead className="font-sf-pro">{t('clients.company')}</TableHead>
            <TableHead className="font-sf-pro">{t('clients.email')}</TableHead>
            <TableHead className="font-sf-pro">{t('clients.phone')}</TableHead>
            <TableHead className="font-sf-pro">{t('clients.totalValue')}</TableHead>
            <TableHead className="font-sf-pro">{t('clients.lastActivity')}</TableHead>
            <TableHead className="font-sf-pro">{t('clients.status')}</TableHead>
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
                  <span className="font-semibold text-slate-900 dark:text-slate-100 font-sf-pro">{client.name}</span>
                </div>
              </TableCell>
              <TableCell className="font-sf-pro text-slate-700 dark:text-slate-300">{client.company}</TableCell>
              <TableCell className="font-sf-pro text-slate-600 dark:text-slate-400">{client.email}</TableCell>
              <TableCell className="font-sf-pro text-slate-600 dark:text-slate-400">{client.phone}</TableCell>
              <TableCell className="font-sf-pro font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrency(client.totalValue)}
              </TableCell>
              <TableCell className="font-sf-pro text-slate-600 dark:text-slate-400">
                {formatDate(new Date(client.lastActivity))}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {statusIconFn(client.status)}
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium font-sf-pro ${statusColorFn(client.status)}`}
                    onMouseOver={() => setTooltipClient(client.id)}
                    onMouseOut={() => setTooltipClient(null)}
                  >
                    {t(`clients.${client.status}`)}
                  </span>
                  {client.overCredit && (
                    <span
                      className="px-2 py-1 rounded-full text-xs font-semibold font-sf-pro bg-red-100 text-red-700 inline-flex items-center"
                      title={`Outstanding ${formatCurrency(client.outstanding)} > Limit ${formatCurrency(client.creditLimit)}`}
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Over credit
                    </span>
                  )}
                  {client.statusReason && tooltipClient === client.id && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium font-sf-pro bg-gray-100 text-gray-800 inline-flex items-center">
                      <HelpCircle className="h-3 w-3 mr-1" />
                      {client.statusReason}
                    </span>
                  )}
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
