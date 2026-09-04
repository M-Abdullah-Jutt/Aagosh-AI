import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import storageService from '../services/storageService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storageService.getUser());
  const [token, setToken] = useState(() => storageService.getToken());
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and verify authentication state on app load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = storageService.getToken();
      if (savedToken) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          storageService.setUser(currentUser);
        } catch (error) {
          console.error('Session validation failed:', error);
          storageService.clearAuth();
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login handler
  const login = useCallback(async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const { access_token, user: loggedUser } = response;

      storageService.setToken(access_token);
      storageService.setUser(loggedUser);

      setToken(access_token);
      setUser(loggedUser);

      return { success: true, user: loggedUser };
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        'Failed to log in. Please check your credentials.';
      return { success: false, error: message };
    }
  }, []);

  // Register handler
  const register = useCallback(async (full_name, email, password) => {
    try {
      const registeredUser = await authService.register({ full_name, email, password });
      return { success: true, user: registeredUser };
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        'Registration failed. Please try again.';
      return { success: false, error: message };
    }
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    storageService.clearAuth();
    setUser(null);
    setToken(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
