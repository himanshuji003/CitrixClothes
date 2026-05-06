'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

/**
 * ✅ PHASE 3+: Authentication Context
 * 
 * Manages global authentication state for the application.
 * 
 * Flow:
 * 1. On app mount, AuthProvider fetches user from /api/auth/me
 * 2. If token exists in httpOnly cookie, user data is returned
 * 3. User state is stored in context (global state)
 * 4. All child components can access via useAuth() hook
 * 5. Navbar can show user info or login buttons based on state
 * 
 * Security:
 * - Token never exposed to frontend (stored in httpOnly cookie)
 * - Token sent automatically by browser with requests
 * - Only user data returned to frontend (not token)
 * - useAuth() hook ensures only authenticated components access data
 */

export interface User {
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * ✅ PHASE 3+: Fetch user data from /api/auth/me
   * 
   * Called on app mount to restore user session.
   * Endpoint checks for token in httpOnly cookie and returns user data.
   * Includes 10-second timeout to prevent indefinite loading if API fails.
   */
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[AuthContext] Fetching user data from /api/auth/me');

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include', // ⚠️ Important: Send cookies with request
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.statusText}`);
        }

        const data = await response.json();

        console.log('[AuthContext] User data response:', {
          hasUser: !!data.user,
          email: data.user?.email,
        });

        setUser(data.user);
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (err) {
      // Don't set error for abort errors - just clear user
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn('[AuthContext] User fetch timeout');
        setUser(null);
      } else {
        const message = err instanceof Error ? err.message : 'Failed to fetch user';
        console.error('[AuthContext] Error fetching user:', message);
        setError(message);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ✅ PHASE 3+: Check session on app mount
   * 
   * On initial load, fetch user data to restore authentication state.
   * This runs once when AuthProvider mounts.
   */
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  /**
   * ✅ PHASE 6: Logout functionality
   * 
   * Flow:
   * 1. Call /api/auth/logout to clear httpOnly cookie on server
   * 2. Clear user state in context
   * 3. Redirect to home page
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[AuthContext] Initiating logout');

      // Call logout API to delete cookie
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Send cookies with request
      });

      console.log('[AuthContext] Logout API response:', response.status);

      // Clear user state immediately (API will handle redirect)
      setUser(null);
      setError(null);

      // Optionally redirect to home (API already redirects, but this ensures it)
      // The window.location.href acts as a fallback if API redirect doesn't work
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      console.error('[AuthContext] Logout error:', message);
      setError(message);
      // Still clear user on error for safety
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * ✅ Hook to access authentication state anywhere in the app
 * 
 * Usage:
 * const { user, isAuthenticated, isLoading } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
