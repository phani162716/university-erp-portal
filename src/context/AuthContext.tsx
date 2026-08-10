import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readCachedUser(): User | null {
  try {
    const savedUser = localStorage.getItem('erp_user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => readCachedUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('erp_token'));
  // If we already have a cached session, don't block the whole UI on /auth/me
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const t = localStorage.getItem('erp_token');
    const u = localStorage.getItem('erp_user');
    return Boolean(t && !u);
  });

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Cached user: paint UI immediately, refresh in background
      if (user) {
        setIsLoading(false);
      }

      try {
        const res = await api.get('/auth/me', { timeout: 15000 });
        if (cancelled) return;
        if (res.data?.user) {
          const u = res.data.user;
          const safe: User = {
            id: u.id,
            email: u.email,
            registerNo: u.registerNo,
            name: u.name,
            role: u.role,
          };
          setUser(safe);
          localStorage.setItem('erp_user', JSON.stringify(safe));
        }
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    checkAuth();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('erp_token', newToken);
    localStorage.setItem('erp_user', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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
