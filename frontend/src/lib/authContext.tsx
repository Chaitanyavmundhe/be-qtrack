import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { apiRequest, setAuthToken, clearAuthToken, getAuthToken } from './api';

export type AppMode = 'desktop' | 'tablet';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: Role) => Promise<void>;
  demoAccounts: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState<boolean>(true);
  const [demoAccounts, setDemoAccounts] = useState<User[]>([]);

  // Default appMode: if screen is wide (>= 1024), default to desktop KPI view, otherwise tablet
  const [appMode, setAppMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem('beqtrack_app_mode') as AppMode;
    if (saved) return saved;
    return window.innerWidth >= 1024 ? 'desktop' : 'tablet';
  });

  const handleSetAppMode = (mode: AppMode) => {
    setAppMode(mode);
    localStorage.setItem('beqtrack_app_mode', mode);
  };

  useEffect(() => {
    // Load demo accounts list
    apiRequest<User[]>('/auth/demo-accounts')
      .then(setDemoAccounts)
      .catch((err) => console.warn('Could not load demo accounts:', err));

    // Verify existing token
    if (token) {
      apiRequest<User>('/auth/me')
        .then((userData) => {
          setUser(userData);
          setLoading(false);
        })
        .catch(() => {
          clearAuthToken();
          setToken(null);
          setUser(null);
          setLoading(false);
        });
    } else {
      // Auto-login as Quality Inspector or Quality Head for immediate evaluation
      apiRequest<{ token: string; user: User }>('/auth/demo-switch', {
        method: 'POST',
        body: JSON.stringify({ role: 'QUALITY_MANAGER' }),
      })
        .then((res) => {
          setAuthToken(res.token);
          setToken(res.token);
          setUser(res.user);
        })
        .catch((e) => console.warn('Auto-login skipped:', e))
        .finally(() => setLoading(false));
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiRequest<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (role: Role) => {
    setLoading(true);
    try {
      const data = await apiRequest<{ token: string; user: User }>('/auth/demo-switch', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      setAuthToken(data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        appMode,
        setAppMode: handleSetAppMode,
        login,
        logout,
        switchRole,
        demoAccounts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
