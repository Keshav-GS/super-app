import React, { createContext, useContext, useState, useEffect } from 'react';

// Define user roles type
export type UserRole = 'admin' | 'manager' | 'employee';

// User interface with role
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Auth context interface
interface AuthContextType {
  currentUser: User | null | undefined;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // signup: (email: string, password: string, name: string) => Promise<void>;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isEmployee: () => boolean;
  hasAccess: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, []);

  const isAdmin = () => currentUser?.role === 'admin';
  const isManager = () => currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const isEmployee = () => currentUser !== null && currentUser !== undefined;

  const hasAccess = (requiredRole: UserRole) => {
    if (!currentUser) return false;
    switch (requiredRole) {
      case 'admin':
        return currentUser.role === 'admin';
      case 'manager':
        return currentUser.role === 'admin' || currentUser.role === 'manager';
      case 'employee':
        return true;
      default:
        return false;
    }
  };

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    try {
      const userData = await window.api.login(email, password);
      setCurrentUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  };

  // const signup = async (email: string, password: string, name: string) => {
  //   throw new Error('Signup not implemented yet');
  // };

  const logout = async () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    // signup,
    isAdmin,
    isManager,
    isEmployee,
    hasAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}