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
