import { useState, useEffect, useCallback } from 'react';
import { Invoice } from '../types/invoice';
import { createInvoice, updateInvoice, deleteInvoice, getInvoices } from '../services/invoiceService';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getInvoices();
      setInvoices(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch invoices');
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newInvoice = await createInvoice(invoiceData);
      setInvoices(prev => [newInvoice, ...prev]);
      return newInvoice;
    } catch (err) {
      console.error('Error creating invoice:', err);
      throw err;
    }
  };

  const editInvoice = async (id: string, invoiceData: Partial<Invoice>) => {
    try {
      const updatedInvoice = await updateInvoice(id, invoiceData);
      setInvoices(prev => prev.map(inv => inv.id === id ? updatedInvoice : inv));
      return updatedInvoice;
    } catch (err) {
      console.error('Error updating invoice:', err);
      throw err;
    }
  };

  const removeInvoice = async (id: string) => {
    try {
      await deleteInvoice(id);
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    } catch (err) {
      console.error('Error deleting invoice:', err);
      throw err;
    }
  };

  return {
    invoices,
    loading,
    error,
    addInvoice,
    editInvoice,
    removeInvoice,
    refreshInvoices: fetchInvoices
  };
};
