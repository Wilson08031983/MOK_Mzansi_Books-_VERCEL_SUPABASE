
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronDown, 
  Download, 
  MoreHorizontal,
  Mail,
  Phone,
  Building,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from 'lucide-react';

type ClientType = 'individual' | 'company' | 'government' | 'non-profit';

type Client = {
  id: string;
  name: string;
  type: ClientType;
  email: string;
  phone: string;
  address: string;
  contactPerson?: string;
  registrationNumber?: string;
  taxNumber?: string;
  industry?: string;
  createdAt: string;
  totalProjects: number;
  totalInvoices: number;
  status: 'active' | 'inactive';
};

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [clientType, setClientType] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Sample client data for demonstration
  const getSampleClients = (): Client[] => {
    return [
      {
        id: '1',
        name: 'ABC Corporation',
        type: 'company',
        email: 'info@abccorp.co.za',
        phone: '011 123 4567',
        address: '123 Main Street, Johannesburg, 2000',
        contactPerson: 'John Smith',
        registrationNumber: '2020/123456/07',
        taxNumber: '9876543210',
        industry: 'Technology',
        createdAt: '2023-01-15',
        totalProjects: 5,
        totalInvoices: 12,
        status: 'active'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        type: 'individual',
        email: 'sarah@example.com',
        phone: '082 555 1234',
        address: '456 Oak Avenue, Cape Town, 8001',
        createdAt: '2023-03-20',
        totalProjects: 2,
        totalInvoices: 4,
        status: 'active'
      },
      {
        id: '3',
        name: 'City Council',
        type: 'government',
        email: 'procurement@city.gov.za',
        phone: '021 400 9999',
        address: 'Civic Centre, Cape Town, 8001',
        contactPerson: 'Michael Brown',
        registrationNumber: 'GOV-2020-001',
        industry: 'Government',
        createdAt: '2023-02-10',
        totalProjects: 8,
        totalInvoices: 15,
        status: 'active'
      },
      {
        id: '4',
        name: 'Green Earth Foundation',
        type: 'non-profit',
        email: 'contact@greenearth.org.za',
        phone: '031 789 0123',
        address: '789 Green Street, Durban, 4001',
        contactPerson: 'Lisa Williams',
        registrationNumber: 'NPO-2019-456',
        industry: 'Environmental',
        createdAt: '2022-11-05',
        totalProjects: 3,
        totalInvoices: 6,
        status: 'inactive'
      }
    ];
  };
  
  // Fetch clients data when component mounts
  useEffect(() => {
    // In production this would fetch data from an API
    // For now, we'll use sample data
    setClients(getSampleClients());
  }, []);
  
  const itemsPerPage = 10;
  
  // Filter clients based on search, type, and status
  const filteredClients = clients.filter((client: Client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.contactPerson && client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = clientType === 'all' || client.type === clientType;
    const matchesStatus = status === 'all' || client.status === status;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  // Paginate clients
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleExportCSV = async () => {
    setLoading(true);
    try {
      // This would integrate with a real export API in production
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create CSV content
      const csvHeaders = ['Name', 'Type', 'Email', 'Phone', 'Status', 'Projects', 'Invoices'];
      const csvRows = filteredClients.map(client => [
        client.name,
        client.type,
        client.email,
        client.phone,
        client.status,
        client.totalProjects.toString(),
        client.totalInvoices.toString()
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      // Create a download by triggering a browser download dialog
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
      element.setAttribute('download', `clients-${new Date().toISOString().split('T')[0]}.csv`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      alert('Clients exported successfully!');
    } catch (error) {
      alert('Failed to export clients');
    } finally {
      setLoading(false);
    }
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setClientType('all');
    setStatus('all');
    setCurrentPage(1);
  };

  const getClientTypeIcon = (type: ClientType) => {
    switch (type) {
      case 'company':
        return <Building className="h-4 w-4" />;
      case 'government':
        return <Building className="h-4 w-4" />;
      case 'non-profit':
        return <Building className="h-4 w-4" />;
      case 'individual':
      default:
        return <UserPlus className="h-4 w-4" />;
    }
  };

  const getClientTypeColor = (type: ClientType) => {
    switch (type) {
      case 'company':
        return 'bg-blue-100 text-blue-800';
      case 'government':
        return 'bg-amber-100 text-amber-800';
      case 'non-profit':
        return 'bg-green-100 text-green-800';
      case 'individual':
      default:
        return 'bg-purple-100 text-mokm-purple-600';
    }
  };

  const handleDeleteClient = (client: Client) => {
    if (confirm(`Are you sure you want to delete ${client.name}?`)) {
      setClients(prev => prev.filter(c => c.id !== client.id));
      alert(`Client ${client.name} has been deleted`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sf-pro">Clients</h1>
          <p className="text-slate-600 mt-1 font-sf-pro">Manage your clients and their information</p>
        </div>
        <div className="flex space-x-2">
          <Link 
            to="/clients/add" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white rounded-xl shadow-colored hover:shadow-colored-lg transition-all duration-300 font-sf-pro"
          >
            <Plus className="h-4 w-4" />
            <span>Add Client</span>
          </Link>
          <button
            onClick={handleExportCSV}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 glass backdrop-blur-sm bg-white/80 border border-white/20 rounded-xl hover:bg-white/90 transition-colors font-sf-pro"
          >
            <Download className="h-4 w-4" />
            <span>{loading ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      <div className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business rounded-lg">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              />
            </div>
            
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-4 py-2 glass backdrop-blur-sm bg-white/80 border border-white/20 rounded-xl hover:bg-white/90 transition-colors font-sf-pro"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {(searchQuery || clientType !== 'all' || status !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-mokm-purple-600 hover:underline font-sf-pro"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
          
          {showFilters && (
            <div className="mb-6 p-4 glass backdrop-blur-sm bg-white/30 border border-white/20 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
                    Client Type
                  </label>
                  <select
                    value={clientType}
                    onChange={(e) => {
                      setClientType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                  >
                    <option value="all">All Types</option>
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                    <option value="government">Government</option>
                    <option value="non-profit">Non-profit</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="glass backdrop-blur-sm bg-white/30">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                    Projects
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="glass backdrop-blur-sm bg-white/20 divide-y divide-white/20">
                {paginatedClients.length > 0 ? (
                  paginatedClients.map((client) => (
                    <tr key={client.id} className="hover:bg-white/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 flex items-center justify-center text-white font-sf-pro">
                            {client.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900 font-sf-pro">{client.name}</div>
                            <div className="text-xs text-slate-500 font-sf-pro">Added {new Date(client.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 flex items-center font-sf-pro">
                          <Mail className="h-4 w-4 mr-1 text-slate-400" />
                          {client.email}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center mt-1 font-sf-pro">
                          <Phone className="h-4 w-4 mr-1 text-slate-400" />
                          {client.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sf-pro ${getClientTypeColor(client.type)}`}>
                          {getClientTypeIcon(client.type)}
                          <span className="ml-1">{client.type.charAt(0).toUpperCase() + client.type.slice(1)}</span>
                        </span>
                        {client.industry && (
                          <div className="text-xs text-slate-500 mt-1 font-sf-pro">
                            {client.industry}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 font-sf-pro">{client.totalProjects} Projects</div>
                        <div className="text-sm text-slate-500 font-sf-pro">{client.totalInvoices} Invoices</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sf-pro ${
                          client.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/clients/${client.id}`}
                            className="text-mokm-purple-600 hover:text-mokm-purple-700 font-sf-pro"
                          >
                            View
                          </Link>
                          <div className="relative group">
                            <button className="text-slate-500 hover:text-slate-700">
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 glass backdrop-blur-sm bg-white/90 border border-white/20 rounded-lg shadow-business py-1 z-10 hidden group-hover:block">
                              <Link to={`/clients/${client.id}/edit`} className="block px-4 py-2 text-sm text-slate-700 hover:bg-white/50 font-sf-pro">
                                Edit
                              </Link>
                              <Link to={`/quotations/create?client=${client.id}`} className="block px-4 py-2 text-sm text-slate-700 hover:bg-white/50 font-sf-pro">
                                Create Quotation
                              </Link>
                              <Link to={`/invoices/create?client=${client.id}`} className="block px-4 py-2 text-sm text-slate-700 hover:bg-white/50 font-sf-pro">
                                Create Invoice
                              </Link>
                              <button 
                                onClick={() => handleDeleteClient(client)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-sf-pro"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500 font-sf-pro">
                      No clients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-slate-700 font-sf-pro">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredClients.length)}
                </span>{' '}
                of <span className="font-medium">{filteredClients.length}</span> clients
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-xl ${
                    currentPage === 1 
                      ? 'text-slate-400 cursor-not-allowed' 
                      : 'text-slate-700 hover:bg-white/50'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Calculate page numbers to show (show 5 pages centered around current page)
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl font-sf-pro ${
                        currentPage === pageNum 
                          ? 'bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white' 
                          : 'text-slate-700 hover:bg-white/50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-xl ${
                    currentPage === totalPages 
                      ? 'text-slate-400 cursor-not-allowed' 
                      : 'text-slate-700 hover:bg-white/50'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
