// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token is valid
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      // Try to get current user info to verify token
      await api.get('users/me/');
      setUser({ isAuthenticated: true });
    } catch {
      // Token is invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post('token/', { username, password });
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      setUser({ isAuthenticated: true });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      // Return a stable code so consumers can translate it; `detail` is a
      // server-supplied message that is only shown as extra context.
      let errorKey = 'authLoginFailed';
      let detail = null;

      if (error.response?.status === 401) {
        errorKey = 'authInvalidCredentials';
      } else if (error.response?.status === 400) {
        errorKey = 'authInvalidRequest';
        detail = error.response?.data?.detail || null;
      } else if (error.code === 'ERR_NETWORK') {
        errorKey = 'authServerUnreachable';
      }

      return {
        success: false,
        errorKey,
        detail,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};