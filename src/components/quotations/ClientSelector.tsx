
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, User, Building, Plus, X } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
  type: string;
}

interface ClientSelectorProps {
  selectedClient: Client | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSelectClient: (clientId: string) => void;
  onOpenSelector: () => void;
  clients: Client[];
}

const ClientSelector: React.FC<ClientSelectorProps> = ({
  selectedClient,
  isOpen,
  onClose,
  onSelectClient,
  onOpenSelector,
  clients
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredClients = clients.filter(
    client =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClientSelect = (clientId: string) => {
    onSelectClient(clientId);
    onClose();
    setSearchQuery('');
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
          Client *
        </label>
        {selectedClient ? (
          <div className="flex justify-between items-center p-3 border border-slate-300 rounded-lg bg-slate-50">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-mokm-purple-100 flex items-center justify-center text-mokm-purple-600">
                {selectedClient.type === 'individual' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Building className="h-4 w-4" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-900 font-sf-pro">{selectedClient.name}</p>
                <p className="text-xs text-slate-500 font-sf-pro">{selectedClient.email}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenSelector}
              className="text-mokm-purple-600 hover:text-mokm-purple-700 font-sf-pro"
            >
              Change
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={onOpenSelector}
            className="w-full justify-center font-sf-pro"
          >
            <User className="h-4 w-4 mr-2" />
            Select Client
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900 font-sf-pro">Select Client</h3>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              />
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {filteredClients.length > 0 ? (
                  filteredClients.map(client => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleClientSelect(client.id)}
                      className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-mokm-purple-100 flex items-center justify-center text-mokm-purple-600">
                        {client.type === 'individual' ? (
                          <User className="h-5 w-5" />
                        ) : (
                          <Building className="h-5 w-5" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-slate-900 font-sf-pro">{client.name}</p>
                        <p className="text-xs text-slate-500 font-sf-pro">{client.email}</p>
                        <p className="text-xs text-slate-500 font-sf-pro">{client.address}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500 font-sf-pro">
                    No clients found matching your search
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
              <Button
                variant="ghost"
                className="text-mokm-purple-600 hover:text-mokm-purple-700 font-sf-pro"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add New Client
              </Button>
              
              <Button
                variant="outline"
                onClick={onClose}
                className="font-sf-pro"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientSelector;
