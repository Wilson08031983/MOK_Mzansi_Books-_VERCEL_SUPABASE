
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCheck,
  FileText,
  Briefcase
} from 'lucide-react';

type ClientType = 'individual' | 'company' | 'government' | 'non-profit';

type Client = {
  id: string;
  name: string;
  type: ClientType;
  logoUrl?: string;
  totalProjects: number;
  totalInvoices: number;
};

interface ClientSidebarProps {
  client: Client;
}

export const ClientSidebar: React.FC<ClientSidebarProps> = ({ client }) => {
  return (
    <div className="space-y-6">
      {/* Client Logo */}
      <div className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business rounded-lg p-6 flex flex-col items-center">
        {client.logoUrl ? (
          <div className="w-32 h-32 rounded-lg border overflow-hidden bg-white mb-3">
            <img 
              src={client.logoUrl} 
              alt={`${client.name} Logo`} 
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-32 h-32 rounded-lg border flex items-center justify-center bg-white/50 mb-3">
            <div className="text-3xl font-bold text-blue-600 font-sf-pro">
              {client.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
            </div>
          </div>
        )}
        <span className="text-sm text-slate-500 font-sf-pro">{client.type.charAt(0).toUpperCase() + client.type.slice(1)}</span>
      </div>

      {/* Stats */}
      <div className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4 font-sf-pro">Client Statistics</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/50 p-4 rounded-lg">
            <div className="flex items-center justify-center mb-2 text-blue-600">
              <FileCheck className="h-6 w-6" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 mb-1 font-sf-pro">{client.totalProjects}</div>
              <div className="text-sm text-slate-500 font-sf-pro">Projects</div>
            </div>
          </div>
          
          <div className="bg-white/50 p-4 rounded-lg">
            <div className="flex items-center justify-center mb-2 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 mb-1 font-sf-pro">{client.totalInvoices}</div>
              <div className="text-sm text-slate-500 font-sf-pro">Invoices</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business rounded-lg p-6">
        <h3 className="text-lg font-medium mb-3 font-sf-pro">Quick Actions</h3>
        <div className="space-y-2">
          <Link 
            to={`/quotations/create?client=${client.id}`}
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-sf-pro"
          >
            <FileCheck className="h-4 w-4" />
            <span>Create Quotation</span>
          </Link>
          <Link 
            to={`/invoices/create?client=${client.id}`}
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-sf-pro"
          >
            <FileText className="h-4 w-4" />
            <span>Create Invoice</span>
          </Link>
          <Link 
            to={`/clients/${client.id}/projects/create`}
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-sf-pro"
          >
            <Briefcase className="h-4 w-4" />
            <span>Create Project</span>
          </Link>
        </div>
      </div>

      {/* Team */}
      {client.type !== 'individual' && (
        <div className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium font-sf-pro">Team Contacts</h3>
            <button className="text-sm text-blue-600 hover:underline font-sf-pro">Add</button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-white/50 rounded-lg">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-sf-pro">
                JS
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-900 font-sf-pro">John Smith</p>
                <p className="text-xs text-slate-500 font-sf-pro">Chief Financial Officer</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-white/50 rounded-lg">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-sf-pro">
                SD
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-900 font-sf-pro">Sarah Davis</p>
                <p className="text-xs text-slate-500 font-sf-pro">HR Manager</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
