'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, AuthState, Customer } from '@/types';
import { getStoredToken, getStoredCustomer, clearAuthToken } from '@/lib/auth-utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    customer: null,
    accessToken: null,
    isLoading: false,
    error: null,
  });

  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (SSR-safe)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const token = getStoredToken();
      const customer = getStoredCustomer();

      if (token && customer) {
        setAuthState((prev) => ({
          ...prev,
          accessToken: token,
          customer: customer,
        }));
      }
    } catch (error) {
      console.error('Error hydrating auth state:', error);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist to localStorage whenever auth state changes
  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;

    try {
      if (authState.accessToken && authState.customer) {
        localStorage.setItem(
          'suitique-auth-v1',
          JSON.stringify({
            accessToken: authState.accessToken,
            customer: authState.customer,
          })
        );
      } else {
        localStorage.removeItem('suitique-auth-v1');
      }
    } catch (error) {
      console.error('Error persisting auth state:', error);
    }
  }, [authState, hydrated]);

  const setToken = (token: string, customer: Customer) => {
    setAuthState((prev) => ({
      ...prev,
      accessToken: token,
      customer: customer,
      error: null,
    }));
  };

  const clearToken = () => {
    setAuthState({
      customer: null,
      accessToken: null,
      isLoading: false,
      error: null,
    });
    clearAuthToken();
  };

  const hydrate = () => {
    // Manual hydration trigger (useful for refreshing auth state)
    const token = getStoredToken();
    const customer = getStoredCustomer();

    if (token && customer) {
      setAuthState((prev) => ({
        ...prev,
        accessToken: token,
        customer: customer,
      }));
    }
  };

  const setError = (error: string | null) => {
    setAuthState((prev) => ({
      ...prev,
      error,
    }));
  };

  const value: AuthContextType = {
    ...authState,
    setToken,
    clearToken,
    hydrate,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
};
