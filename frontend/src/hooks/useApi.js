// hooks/useApi.js - Hooks React pour l'API

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

// Hook générique pour les appels API
export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Hook pour tester la connexion API
export const useApiConnection = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const testConnection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await apiService.healthCheck();
      setConnected(true);
    } catch (err) {
      setConnected(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    testConnection();
  }, [testConnection]);

  return { connected, loading, error, retry: testConnection };
};

// Hook pour les actualités
export const useNews = (keyword = '', language = 'fr') => {
  return useApi(
    () => apiService.getNews({ keyword, language }),
    [keyword, language]
  );
};
