import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use environment variable for API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const AUTH_URL = `${API_URL}/auth`;

  // Configure axios
  axios.defaults.withCredentials = true;

  // Global Axios Interceptor to handle session expiration (401)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await axios.get(`${AUTH_URL}/me`);
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, [AUTH_URL]);

  const signup = async (userData) => {
    const response = await axios.post(`${AUTH_URL}/signup`, userData);
    setUser(response.data);
    return response.data;
  };

  const login = async (userData) => {
    const response = await axios.post(`${AUTH_URL}/login`, userData);
    setUser(response.data);
    return response.data;
  };

  const logout = async () => {
    try {
      await axios.post(`${AUTH_URL}/logout`);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};
