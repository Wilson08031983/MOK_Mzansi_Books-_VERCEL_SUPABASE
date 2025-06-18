
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Clock
} from 'lucide-react';

type Client = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
};

interface ClientDetailHeaderProps {
  client: Client;
  onDeleteClick: () => void;
}

export const ClientDetailHeader: React.FC<ClientDetailHeaderProps> = ({
  client,
  onDeleteClick
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center space-x-4">
        <Link to="/clients" className="p-2 rounded-full hover:bg-white/80 transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sf-pro">{client.name}</h1>
          <div className="flex items-center mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 font-sf-pro ${
              client.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
            </span>
            <span className="text-slate-600 flex items-center font-sf-pro">
              <Clock className="h-4 w-4 mr-1" />
              Client since {new Date(client.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Link to={`/clients/${client.id}/edit`} className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 border border-white/20 rounded-lg hover:bg-white/90 transition-colors font-sf-pro">
          <Edit className="h-4 w-4" />
          <span>Edit</span>
        </Link>

        <button 
          onClick={onDeleteClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-sf-pro"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </button>

        <div className="relative group">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 border border-white/20 rounded-lg hover:bg-white/90 transition-colors font-sf-pro">
            <MoreHorizontal className="h-5 w-5" />
          </button>
          <div className="absolute right-0 mt-2 w-48 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-lg shadow-business py-1 z-10 hidden group-hover:block">
            <Link to={`/quotations/create?client=${client.id}`} className="block px-4 py-2 text-sm text-slate-700 hover:bg-white/50 font-sf-pro">
              Create Quotation
            </Link>
            <Link to={`/invoices/create?client=${client.id}`} className="block px-4 py-2 text-sm text-slate-700 hover:bg-white/50 font-sf-pro">
              Create Invoice
            </Link>
            <button className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-white/50 font-sf-pro">
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
