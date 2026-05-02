'use client';
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { CartItem, Product } from '@/types';
import { findVariantBySize } from '@/lib/shopify';

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  hydrated: boolean;
  setOpen: (v: boolean) => void;
  addItem: (product: Product, size: string | null, qty?: number) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const LS_KEY = 'suitique-cart-v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch {}
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, size: string | null, qty = 1) => {
    const variantId = findVariantBySize(product.variants, size);
    
    if (!variantId && size) {
      console.error('[Cart] addItem: Failed to find variant ID for product with selected size', {
        productHandle: product.handle,
        selectedSize: size,
        availableSizes: product.sizes,
        variantCount: product.variants?.length,
      });
    }

    setItems((prev) => {
      const key = `${product.handle}__${size || 'default'}`;
      const existing = prev.find((i) => i.key === key);
      if (existing) return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      return [
        ...prev,
        {
          key,
          handle: product.handle,
          title: product.title,
          price: product.price,
          image: product.images?.[0],
          size,
          qty,
          variantId: variantId || undefined,
        },
      ];
    });
    
    console.log('[Cart] addItem: Item added to cart', {
      productHandle: product.handle,
      size,
      quantity: qty,
      variantId,
    });
    
    setOpen(true);
  }, []);

  const removeItem = useCallback((key: string) => setItems((prev) => prev.filter((i) => i.key !== key)), []);
  const updateQty = useCallback((key: string, qty: number) => setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i))), []);
  const clear = useCallback(() => setItems([]), []);

  const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const count = items.reduce((acc, i) => acc + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, count, subtotal, open, setOpen, addItem, removeItem, updateQty, clear, hydrated }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
