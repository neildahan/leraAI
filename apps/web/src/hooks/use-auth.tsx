import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (data: { firstName?: string; lastName?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'lera_access_token';
const REFRESH_KEY = 'lera_refresh_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
  const getStoredRefreshToken = () => localStorage.getItem(REFRESH_KEY);

  const storeTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  };

  const clearTokens = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  };

  const fetchUser = useCallback(async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await api.get<User>('/users/me');
      setUser(response.data as User);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const response = await api.post<AuthTokens>('/auth/login', { email, password });
    const { accessToken, refreshToken } = response.data as AuthTokens;
    storeTokens(accessToken, refreshToken);
    await fetchUser();
    navigate('/dashboard');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearTokens();
      setUser(null);
      navigate('/login');
    }
  };

  const refreshToken = async () => {
    const storedRefreshToken = getStoredRefreshToken();
    if (!storedRefreshToken) {
      throw new Error('No refresh token');
    }

    const response = await api.post<AuthTokens>('/auth/refresh', {
      refreshToken: storedRefreshToken,
    });
    const { accessToken, refreshToken: newRefreshToken } = response.data as AuthTokens;
    storeTokens(accessToken, newRefreshToken);
  };

  const updateUser = async (data: { firstName?: string; lastName?: string }) => {
    try {
      const response = await api.patch<User>('/users/me', data);
      setUser(response.data as User);
    } catch {
      // If API fails, update local state anyway for demo
      setUser((prev) => prev ? { ...prev, ...data } : null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshToken,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
