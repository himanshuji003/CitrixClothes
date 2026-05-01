'use client';
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';

interface WishlistContextValue {
  handles: string[];
  hydrated: boolean;
  toggle: (handle: string) => void;
  has: (handle: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const LS_KEY = 'suitique-wishlist-v1';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [handles, setHandles] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null;
      if (raw) setHandles(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(LS_KEY, JSON.stringify(handles)); } catch {}
  }, [handles, hydrated]);

  const toggle = useCallback((handle: string) => {
    setHandles((prev) => (prev.includes(handle) ? prev.filter((h) => h !== handle) : [...prev, handle]));
  }, []);

  const has = useCallback((handle: string) => handles.includes(handle), [handles]);

  return (
    <WishlistContext.Provider value={{ handles, hydrated, toggle, has, count: handles.length }}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}
