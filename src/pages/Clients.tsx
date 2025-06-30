import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  RefreshCw,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Mail,
  FileText,
  Receipt,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientsTable from '@/components/clients/ClientsTable';
import ClientsGrid from '@/components/clients/ClientsGrid';
import AddClientModal from '@/components/clients/AddClientModal';
import BulkActionsBar from '@/components/clients/BulkActionsBar';
import ClientsStats from '@/components/clients/ClientsStats';
import { Client, getClients, initializeClients } from '@/services/clientService';

// Interface for displaying clients in the UI
interface ClientDisplay {
  id: string;
  name: string; // maps to contactPerson in Client
  company: string; // maps to companyName in Client
  email: string;
  phone: string;
  totalValue: number;
  lastActivity: string;
  status: string;
  type: string;
  avatar: string;
}

const Clients = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<ClientDisplay[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  
  // Ref for container to save scroll position
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const [filters, setFilters] = useState({
    status: 'all',
    clientType: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    // Load clients from localStorage on component mount
    const loadClients = async () => {
      try {
        await loadClientsFromStorage();
      } catch (error) {
        console.error('Failed to load clients:', error);
      }
    };
    
    loadClients();
  }, []);

  // Function to save current scroll position
  const saveScrollPosition = (): void => {
    if (contentContainerRef.current) {
      scrollPositionRef.current = contentContainerRef.current.scrollTop;
    }
  };

  // Function to restore scroll position
  const restoreScrollPosition = (): void => {
    if (contentContainerRef.current) {
      setTimeout(() => {
        if (contentContainerRef.current) {
          contentContainerRef.current.scrollTop = scrollPositionRef.current;
        }
      }, 10);
    }
  };
  
  // Function to load clients from localStorage
  const loadClientsFromStorage = async (): Promise<void> => {
    try {
      // Import clientService using dynamic import
      const clientService = await import('@/services/clientService');
      let clientsToProcess: Client[] = [];
      
      // Try to get existing clients
      const existingClients = clientService.getClients();
      
      if (existingClients && existingClients.length > 0) {
        clientsToProcess = existingClients;
      } else {
        // Initialize with mock clients if no clients exist
        clientService.initializeClients();
        clientsToProcess = clientService.getClients() || [];
      }
      
      // Process and set clients with proper types
      const processedClients = clientsToProcess
        .filter((client: Client | null | undefined): client is Client => Boolean(client))
        .map((client: Client) => ({
          id: client.id || '',
          name: client.contactPerson || 'No Name',
          company: client.companyName || 'No Company',
          email: client.email || '',
          phone: client.phone || '',
          totalValue: Number(client.totalValue) || 0,
          lastActivity: client.lastActivity || new Date().toISOString(),
          status: client.status || 'inactive',
          type: client.clientType || 'individual',
          avatar: client.avatar || ''
        }));
      
      setClients(processedClients);
    } catch (error) {
      console.error('Error loading clients:', error);
      setClients([]);
    }
  };

  // Handle client added/updated
  const handleClientAdded = (newClient?: Client): void => {
    loadClientsFromStorage(); // Reload all clients from localStorage
  };

  // Handle refresh button click
  const handleRefresh = (): void => {
    saveScrollPosition();
    loadClientsFromStorage();
    // Restore scroll position after data is loaded and rendered
    setTimeout(restoreScrollPosition, 50);
  };

  // Get status icon and color for a client
  const getStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Clock className="h-4 w-4 text-slate-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <XCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-slate-100 text-slate-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Filter clients based on search query
  const filteredClients = clients.filter((client: ClientDisplay) => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || client.status === filters.status;
    const matchesType = filters.clientType === 'all' || client.type === filters.clientType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectClient = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(client => client.id));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: 'all',
      clientType: 'all',
      dateRange: 'all'
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-sf-pro">Clients</h1>
            <p className="text-slate-600 font-sf-pro">Manage your business clients and their information</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl transition-all duration-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <div className="flex items-center border border-slate-300 rounded-xl p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-lg"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-lg"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            onClick={() => setIsAddClientModalOpen(true)}
            className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white font-sf-pro rounded-xl shadow-colored hover:shadow-colored-lg transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Client Stats */}
      <ClientsStats clients={clients} />

      {/* Search and Filters */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients by name, email, or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              )}
            </div>
            
            {/* Filter Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="overdue">Overdue</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <select
                value={filters.clientType}
                onChange={(e) => setFilters(prev => ({ ...prev, clientType: e.target.value }))}
                className="px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              >
                <option value="all">All Types</option>
                <option value="individual">Individual</option>
                <option value="business">Business</option>
                <option value="government">Government</option>
              </select>
              
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl transition-all duration-300"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedClients.length > 0 && (
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-700 font-sf-pro">
                  {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-sf-pro rounded-lg"
                  >
                    Change Status
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-sf-pro rounded-lg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-sf-pro rounded-lg text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedClients([])}
                className="font-sf-pro"
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clients List */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-slate-900 font-sf-pro text-xl">
            {filteredClients.length} Client{filteredClients.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'table' ? (
            <div 
              ref={contentContainerRef}
              className="rounded-lg border" 
              style={{ flex: 1, overflow: 'auto' }}
            >
              <ClientsTable 
                clients={filteredClients}
                selectedClients={selectedClients}
                onSelectClient={(id) => {
                  if (selectedClients.includes(id)) {
                    setSelectedClients(selectedClients.filter(clientId => clientId !== id));
                  } else {
                    setSelectedClients([...selectedClients, id]);
                  }
                }}
                onSelectAll={() => {
                  if (selectedClients.length === filteredClients.length) {
                    setSelectedClients([]);
                  } else {
                    setSelectedClients(filteredClients.map(client => client.id));
                  }
                }}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
              />
            </div>
          ) : (
            <div 
              ref={contentContainerRef}
              className="rounded-lg border" 
              style={{ flex: 1, overflow: 'auto' }}
            >
              <ClientsGrid 
                clients={filteredClients}
                selectedClients={selectedClients}
                onSelectClient={(id) => {
                  if (selectedClients.includes(id)) {
                    setSelectedClients(selectedClients.filter(clientId => clientId !== id));
                  } else {
                    setSelectedClients([...selectedClients, id]);
                  }
                }}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
              />
            </div>
          )}
          
          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-slate-900 font-semibold font-sf-pro mb-2">No clients found</h3>
              <p className="text-slate-600 font-sf-pro text-sm mb-4">Try adjusting your search terms or filters</p>
              <Button
                onClick={() => setIsAddClientModalOpen(true)}
                className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white font-sf-pro rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Client
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Client Modal */}
      {isAddClientModalOpen && <AddClientModal isOpen={isAddClientModalOpen} onClose={() => setIsAddClientModalOpen(false)} onClientAdded={handleClientAdded} />}
    </div>
  );
};

export default Clients;
