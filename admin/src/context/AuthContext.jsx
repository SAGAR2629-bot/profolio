/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, removeAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const user = await api.getMe();
        setAdminUser(user);
      } catch (err) {
        console.warn("Auth check failed:", err.message);
        removeAuthToken();
        setAdminUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    const handleExpired = () => {
      setAdminUser(null);
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    const user = await api.getMe();
    setAdminUser(user);
    return data;
  };

  const logout = () => {
    api.logout();
    setAdminUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        isAuthenticated: !!adminUser,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
