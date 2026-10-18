// hooks/useDashboardStats.js
import { useState, useEffect } from 'react';
import api from '../services/api';

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    clientCount: 0,
    totalRevenue: 0,
    isLoading: true,
    error: null
  });

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, isLoading: true }));
      const response = await api.get('/dashboard/stats');
      setStats({
        clientCount: response.data.clientCount,
        totalRevenue: response.data.totalRevenue,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setStats({
        clientCount: 0,
        totalRevenue: 0,
        isLoading: false,
        error: error.response?.data?.message || 'Failed to load stats'
      });
    }
  };
  useEffect(() => {
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);
  return { ...stats, refetch: fetchStats };
};