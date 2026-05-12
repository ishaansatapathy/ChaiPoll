import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Listen for 401 events from the API interceptor
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await API.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const signup = async (userData) => {
    const response = await API.post('/auth/signup', userData);
    setUser(response.data);
    return response.data;
  };

  const login = async (userData) => {
    const response = await API.post('/auth/login', userData);
    setUser(response.data);
    return response.data;
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const setDisplayName = async (displayName) => {
    const response = await API.patch('/auth/update-callsign', { callsign: displayName });
    setUser(response.data);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, setDisplayName, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};
