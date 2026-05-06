// Domain types for Suitique Designs

export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
}

export interface Product {
  handle: string;
  title: string;
  collection?: string;
  price: number;
  compareAt?: number | null;
  currency: string;
  description: string;
  images: string[];
  sizes: string[];
  variants?: ShopifyVariant[];
  tag?: string | null;
}

export interface Collection {
  handle: string;
  title: string;
  image: string;
  tagline?: string;
}

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface CartItem {
  key: string;
  handle: string;
  title: string;
  price: number;
  image?: string;
  size: string | null;
  qty: number;
  variantId?: string;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
}

// Authentication & Customer Types
export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface LineItem {
  title: string;
  quantity: number;
  price?: number;
  image?: string;
}

export type FulfillmentStatus = 'UNFULFILLED' | 'PARTIAL' | 'FULFILLED';

export interface Order {
  id: string;
  orderNumber?: string;
  processedAt: string;
  fulfillmentStatus: FulfillmentStatus;
  totalPrice?: number;
  currency?: string;
  lineItems: LineItem[];
}

export interface AuthState {
  customer: Customer | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export type AuthContextType = AuthState & {
  setToken: (token: string | null, customer: Customer | null) => void;
  clearToken: () => void;
  setError: (error: string | null) => void;
};
