// src/hooks/useClients.js
import { useState } from 'react';
import api from '../services/api';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData) => {
    setLoading(true);
    try {
      const response = await api.post('/clients', clientData);
      setClients([...clients, response.data]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create client');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async (id, clientData) => {
    setLoading(true);
    try {
      const response = await api.put(`/clients/${id}`, clientData);
      setClients(clients.map(c => c._id === id ? response.data : c));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update client');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/clients/${id}`);
      setClients(clients.filter(c => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete client');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient
  };
};