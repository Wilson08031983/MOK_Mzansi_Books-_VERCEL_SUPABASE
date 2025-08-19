
import { useState, useEffect } from 'react';
import { getInvoices } from '@/services/invoiceService';
import { getQuotations } from '@/services/quotationService';
import { getClients } from '@/services/clientService';
import expenseStorageService from '@/services/expenseStorageService';
import type { InvoiceResponse, InvoiceStatus } from '@/types/invoice';
import type { Quotation } from '@/services/quotationService';
import type { Client } from '@/services/clientService';
import type { StoredExpense } from '@/services/expenseStorageService';

// Dashboard-compatible data types for the components
interface DashboardInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
  invoiceDate: string; // added for revenue series
  date: string; // alias for invoice date for compatibility
}

interface DashboardExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface DashboardClient {
  id: string;
  name: string;
  createdAt: string;
}

interface DashboardQuotation {
  id: string;
  clientName: string;
  createdAt: string;
}

// Helper function to map invoice data to dashboard format
const mapInvoiceToDashboard = (invoice: InvoiceResponse): DashboardInvoice => ({
  id: invoice.id,
  invoiceNumber: invoice.number,
  clientName: invoice.clientName,
  total: invoice.total,
  status: invoice.status,
  dueDate: invoice.dueDate,
  createdAt: invoice.createdAt,
  invoiceDate: (invoice as any).invoiceDate || (invoice as any).date || invoice.createdAt,
  date: (invoice as any).date || (invoice as any).invoiceDate || invoice.createdAt
});

// Helper function to map expense data to dashboard format
const mapExpenseToDashboard = (expense: StoredExpense): DashboardExpense => ({
  id: expense.id,
  description: expense.description,
  amount: expense.amount,
  category: expense.category,
  date: expense.date,
  status: expense.status
});

// Helper function to map client data to dashboard format
const mapClientToDashboard = (client: Client): DashboardClient => ({
  id: client.id,
  name: client.companyName || client.contactPerson,
  createdAt: client.createdAt || new Date().toISOString()
});

// Helper function to map quotation data to dashboard format
const mapQuotationToDashboard = (quotation: Quotation): DashboardQuotation => ({
  id: quotation.id,
  clientName: quotation.client,
  createdAt: quotation.date
});

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<DashboardInvoice[]>([]);
  const [expenses, setExpenses] = useState<DashboardExpense[]>([]);
  const [clients, setClients] = useState<DashboardClient[]>([]);
  const [quotations, setQuotations] = useState<DashboardQuotation[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load data from services
        const [invoiceData, expenseData, clientData, quotationData] = await Promise.all([
          Promise.resolve(getInvoices()),
          Promise.resolve(expenseStorageService.getAllExpenses()),
          Promise.resolve(getClients()),
          Promise.resolve(getQuotations())
        ]);

        // Map to dashboard format
        setInvoices(invoiceData.map(mapInvoiceToDashboard));
        setExpenses(expenseData.map(mapExpenseToDashboard));
        setClients(clientData.map(mapClientToDashboard));
        setQuotations(quotationData.map(mapQuotationToDashboard));
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Keep empty arrays on error
        setInvoices([]);
        setExpenses([]);
        setClients([]);
        setQuotations([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return {
    invoices,
    expenses,
    clients,
    quotations,
    loading
  };
};
