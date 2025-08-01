import React, { createContext, useContext, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { getAccessToken, clearFCMToken } from '../utils/mmkvStore';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = () => {
    const token = getAccessToken();
    const authenticated = !!token;
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  };

  const logout = () => {
    // Clear all stored data
    clearFCMToken(); // Clear FCM token when user logs out
    setIsAuthenticated(false);
    router.replace('/login');
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        router.replace('/');
      }
    }
  }, [isAuthenticated, isLoading]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 