import React, { createContext, useState, useCallback } from 'react';
import { message } from 'antd';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true'
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser')
    return savedUser ? JSON.parse(savedUser) : null
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (username, password) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Replace with actual authentication logic
      if (username && password) {
        const userData = { 
          username,
          role: 'admin' // Add actual role from your auth system
        }
        setIsAuthenticated(true);
        setUser(userData);
        
        // Save to localStorage
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('currentUser', JSON.stringify(userData))
        
        message.success('Login successful');
        return true;
      }
      throw new Error('Invalid credentials');
    } catch (error) {
      message.error(error.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('currentUser')
    
    message.success('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        loading,
        login, 
        logout,
        setUser // Optional for user updates
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

