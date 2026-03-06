'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  role: 'Admin' | 'Sales Agent' | 'Viewer';
  avatar: string;
  phone: string;
  joined: string;
  properties: number;
  leads: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Record<string, User & { password: string }> = {
  'admin@elago.com': {
    password: 'admin123',
    name: 'Rohan Sharma',
    email: 'admin@elago.com',
    role: 'Admin',
    avatar: 'RS',
    phone: '+91 98765 43210',
    joined: 'Jan 2024',
    properties: 124,
    leads: 87,
  },
  'agent@elago.com': {
    password: 'agent123',
    name: 'Priya Menon',
    email: 'agent@elago.com',
    role: 'Sales Agent',
    avatar: 'PM',
    phone: '+91 91234 56789',
    joined: 'Mar 2024',
    properties: 38,
    leads: 42,
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('elago_user');
      if (saved) setUser(JSON.parse(saved));
    } catch {}
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const match = DEMO_USERS[email.toLowerCase()];
    if (match && match.password === password) {
      const { password: _, ...userData } = match;
      setUser(userData);
      localStorage.setItem('elago_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('elago_user');
  };

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
