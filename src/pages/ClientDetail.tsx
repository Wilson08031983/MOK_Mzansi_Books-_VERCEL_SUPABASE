
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { ClientDetailHeader } from '../components/clients/ClientDetailHeader';
import { ClientInformation } from '../components/clients/ClientInformation';
import { ClientTransactions } from '../components/clients/ClientTransactions';
import { ClientSidebar } from '../components/clients/ClientSidebar';
import { DeleteClientModal } from '../components/clients/DeleteClientModal';

// Type definitions
type ClientType = 'individual' | 'company' | 'government' | 'non-profit';

type ClientTransaction = {
  id: string;
  type: 'invoice' | 'quotation' | 'payment';
  number: string;
  date: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'accepted' | 'declined';
};

type Client = {
  id: string;
  name: string;
  type: ClientType;
  email: string;
  phone: string;
  address: string;
  contactPerson?: string;
  position?: string;
  registrationNumber?: string;
  taxNumber?: string;
  industry?: string;
  website?: string;
  createdAt: string;
  logoUrl?: string;
  totalProjects: number;
  totalInvoices: number;
  status: 'active' | 'inactive';
  notes?: string;
};

// Sample client data for demonstration
const getSampleClient = (id: string): Client => {
  return {
    id,
    name: 'ABC Corporation',
    type: 'company',
    email: 'info@abccorp.co.za',
    phone: '011 123 4567',
    address: '123 Main Street, Johannesburg, 2000',
    contactPerson: 'John Smith',
    position: 'Chief Financial Officer',
    registrationNumber: '2020/123456/07',
    taxNumber: '9876543210',
    industry: 'Technology',
    website: 'https://www.abccorp.co.za',
    createdAt: '2023-01-15',
    logoUrl: '', // Would be a real URL in production
    totalProjects: 5,
    totalInvoices: 12,
    status: 'active',
    notes: 'ABC Corporation is a long-term client since 2023. They prefer detailed quotations and typically pay within 14 days.'
  };
};

// Sample transactions for demonstration
const getSampleTransactions = (): ClientTransaction[] => {
  return [
    {
      id: '1',
      type: 'invoice',
      number: 'INV-2025-001',
      date: '2025-05-15',
      amount: 12500.00,
      status: 'paid',
    },
    {
      id: '2',
      type: 'quotation',
      number: 'QUO-2025-003',
      date: '2025-05-28',
      amount: 18750.00,
      status: 'sent',
    },
    {
      id: '3',
      type: 'payment',
      number: 'PMT-2025-001',
      date: '2025-05-20',
      amount: 12500.00,
      status: 'paid',
    },
    {
      id: '4',
      type: 'invoice',
      number: 'INV-2025-002',
      date: '2025-06-01',
      amount: 4320.00,
      status: 'draft',
    },
    {
      id: '5',
      type: 'quotation',
      number: 'QUO-2025-002',
      date: '2025-04-10',
      amount: 9600.00,
      status: 'accepted',
    },
  ];
};

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientId = id || '';
  
  const [client, setClient] = useState<Client | null>(null);
  const [transactions, setTransactions] = useState<ClientTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // In a real app, fetch client data from API
    // For now, simulate an API call with a timeout
    setLoading(true);
    
    setTimeout(() => {
      try {
        const clientData = getSampleClient(clientId);
        const transactionsData = getSampleTransactions();
        
        setClient(clientData);
        setTransactions(transactionsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load client details');
        setLoading(false);
      }
    }, 800);
  }, [clientId]);

  const handleDeleteClient = async () => {
    setLoading(true);
    
    try {
      // In a real app, delete client from API
      // For now, simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowDeleteModal(false);
      navigate('/clients');
    } catch (err) {
      setError('Failed to delete client');
      setLoading(false);
    }
  };

  if (loading && !client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 font-sf-pro">Loading client...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="p-6 glass backdrop-blur-sm bg-red-50/50 border border-red-200/20 shadow-business rounded-lg text-red-600 flex items-center">
          <AlertCircle className="h-6 w-6 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="p-6 glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business rounded-lg text-slate-600">
          Client not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-4 lg:p-6 space-y-6">
        <ClientDetailHeader 
          client={client}
          onDeleteClick={() => setShowDeleteModal(true)}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <ClientInformation client={client} />
            <ClientTransactions 
              transactions={transactions}
              clientId={client.id}
            />
          </div>

          <ClientSidebar client={client} />
        </div>

        <DeleteClientModal
          isOpen={showDeleteModal}
          clientName={client.name}
          loading={loading}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteClient}
        />
      </div>
    </div>
  );
};

export default ClientDetail;
