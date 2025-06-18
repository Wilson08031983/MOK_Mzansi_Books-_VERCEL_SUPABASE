
import { useState, useEffect } from 'react';

// Mock data types - in a real app these would come from your API/database
interface MockInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
}

interface MockExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'approved';
}

interface MockClient {
  id: string;
  name: string;
  createdAt: string;
}

interface MockQuotation {
  id: string;
  clientName: string;
  createdAt: string;
}

// Mock data for demonstration
const mockInvoices: MockInvoice[] = [
  { id: '1', invoiceNumber: 'INV-001', clientName: 'ABC Corp', total: 15000, status: 'paid', dueDate: '2024-01-15', createdAt: '2024-01-01' },
  { id: '2', invoiceNumber: 'INV-002', clientName: 'XYZ Ltd', total: 8500, status: 'sent', dueDate: '2024-01-30', createdAt: '2024-01-10' },
];

const mockExpenses: MockExpense[] = [
  { id: '1', description: 'Office Supplies', amount: 1200, category: 'office', date: '2024-01-15', status: 'approved' },
  { id: '2', description: 'Travel Expenses', amount: 3500, category: 'travel', date: '2024-01-20', status: 'pending' },
];

const mockClients: MockClient[] = [
  { id: '1', name: 'ABC Corp', createdAt: '2024-01-01' },
  { id: '2', name: 'XYZ Ltd', createdAt: '2024-01-05' },
];

const mockQuotations: MockQuotation[] = [
  { id: '1', clientName: 'ABC Corp', createdAt: '2024-01-01' },
  { id: '2', clientName: 'DEF Inc', createdAt: '2024-01-12' },
];

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    invoices: mockInvoices,
    expenses: mockExpenses,
    clients: mockClients,
    quotations: mockQuotations,
    loading
  };
};
