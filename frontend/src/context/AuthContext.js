import React, { createContext, useState, useCallback } from 'react';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:5000/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('token') !== null
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser')
    return savedUser ? JSON.parse(savedUser) : null
  });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token')
  });

  const login = useCallback(async (username, password) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        const { user: userData, token: authToken } = data.data;
        
        setIsAuthenticated(true);
        setUser(userData);
        setToken(authToken);
        
        localStorage.setItem('token', authToken);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        message.success('Login successful');
        return true;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.message || 'Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    
    message.success('Logged out successfully');
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        message.success('Registration successful! Please login with your credentials.');
        return true;
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      message.error(error.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        loading,
        token,
        login, 
        logout,
        register,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

