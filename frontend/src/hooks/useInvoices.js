import { useState } from 'react';
import api from '../services/api';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentInvoice, setCurrentInvoice] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await api.get('/invoices');
      const invoicesWithClientFallback = response.data.map(invoice => ({
        ...invoice,
        client: invoice.client || { 
          name: 'Deleted Client',
          _id: null,
          isDeleted: true 
        }
      }));
      setInvoices(invoicesWithClientFallback);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceById = async (id) => {
    setLoading(true);
    try {
      const response = await api.get(`/invoices/${id}`);
      setCurrentInvoice(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoiceData) => {
    setLoading(true);
    try {
      const response = await api.post('/invoices', invoiceData);
      setInvoices([...invoices, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateInvoice = async (id, updatedData) => {
    setLoading(true);
    try {
      const response = await api.put(`/invoices/${id}`, updatedData);
      setInvoices(invoices.map(inv => inv.id === id ? response.data : inv));
      if (currentInvoice?.id === id) {
        setCurrentInvoice(response.data);
      }
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/invoices/${id}`);
      setInvoices(invoices.filter(inv => inv.id !== id));
      if (currentInvoice?.id === id) {
        setCurrentInvoice(null);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendInvoice = async (id) => {
    setLoading(true);
    try {
      const response = await api.post(`/invoices/${id}/send`);
      setInvoices(invoices.map(inv => inv.id === id ? response.data : inv));
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id) => {
    setLoading(true);
    try {
      const response = await api.patch(`/invoices/${id}/paid`);
      setInvoices(invoices.map(inv => inv.id === id ? response.data : inv));
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark invoice as paid');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentInvoice = () => {
    setCurrentInvoice(null);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    invoices,
    currentInvoice,
    loading,
    error,
    fetchInvoices,
    fetchInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    sendInvoice,
    markAsPaid,
    clearCurrentInvoice,
    clearError,
  };
};