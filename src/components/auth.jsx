// src/context/authcontext.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user on mount
  const fetchUser = async () => {
    try {
      const { data } = await axios.get(
        'http://localhost:8000/api/v1/users/current-user'
      );
      setUser(data.data); // Assuming backend returns { data: { userObject } }
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post(
      'http://localhost:8000/api/v1/users/login',
      { email, password }
    );
    setUser(data.data.user);
    return data;
  };

  const logout = async () => {
    await axios.post('http://localhost:8000/api/v1/users/logout');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await axios.get(
        'http://localhost:8000/api/v1/users/current-user'
      );
      setUser(data.data);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};