// Shopify Storefront API client.
// Auto-falls back to mock data when env is not configured.

import { PRODUCTS, COLLECTIONS } from './products';
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  COLLECTIONS_QUERY,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
} from './queries';

import type { Cart, CartLineInput, Collection, Product } from '@/types';

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = '2024-10';

export const isShopifyConfigured = (): boolean => Boolean(DOMAIN && TOKEN);

async function shopifyFetch<T = any>({
  query,
  variables = {},
}: {
  query: string;
  variables?: Record<string, any>;
}): Promise<T> {
  if (!isShopifyConfigured()) throw new Error('Shopify not configured');

  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN as string,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  });

  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));

  return json.data as T;
}

function normalizeShopifyProduct(p: any): Product | null {
  if (!p) return null;

  const variants = (p.variants?.edges || []).map((e: any) => e.node);

  const sizes = Array.from(
    new Set(
      variants.flatMap((v: any) =>
        (v.selectedOptions || [])
          .filter((o: any) => o.name.toLowerCase() === 'size')
          .map((o: any) => o.value)
      )
    )
  ) as string[];

  return {
    handle: p.handle,
    title: p.title,
    description: p.description,
    price: Math.round(parseFloat(p.priceRange?.minVariantPrice?.amount || '0')),
    compareAt: p.compareAtPriceRange?.minVariantPrice?.amount
      ? Math.round(parseFloat(p.compareAtPriceRange.minVariantPrice.amount))
      : null,
    currency: p.priceRange?.minVariantPrice?.currencyCode || 'INR',
    images: (p.images?.edges || []).map((e: any) => e.node.url),
    sizes,
    variants,
    tag: (p.tags || [])[0] || null,
  };
}

export function findVariantBySize(
  variants: any[] | undefined,
  selectedSize: string | null
): string | null {
  if (!selectedSize || !variants || variants.length === 0) return null;

  const variant = variants.find((v) => {
    const sizeOption = (v.selectedOptions || []).find(
      (o: any) => o.name.toLowerCase() === 'size'
    );
    return sizeOption?.value === selectedSize;
  });

  return variant?.id || null;
}

/* ---------------- PRODUCTS ---------------- */

export async function getProducts(): Promise<Product[]> {
  if (!isShopifyConfigured()) return PRODUCTS;

  try {
    const data = await shopifyFetch<{ products: { edges: { node: any }[] } }>({
      query: PRODUCTS_QUERY,
    });

    return data.products.edges
      .map((e) => normalizeShopifyProduct(e.node))
      .filter(Boolean) as Product[];
  } catch {
    return PRODUCTS;
  }
}

export async function getProductByHandle(
  handle: string
): Promise<Product | null> {
  if (!isShopifyConfigured())
    return PRODUCTS.find((p) => p.handle === handle) || null;

  try {
    const data = await shopifyFetch<{ productByHandle: any }>({
      query: PRODUCT_BY_HANDLE_QUERY,
      variables: { handle },
    });

    return normalizeShopifyProduct(data.productByHandle);
  } catch {
    return PRODUCTS.find((p) => p.handle === handle) || null;
  }
}

export async function getCollections(): Promise<Collection[]> {
  if (!isShopifyConfigured()) return COLLECTIONS;

  try {
    const data = await shopifyFetch<{
      collections: { edges: { node: any }[] };
    }>({ query: COLLECTIONS_QUERY });

    return data.collections.edges.map((e) => ({
      handle: e.node.handle,
      title: e.node.title,
      image: e.node.image?.url || '',
      tagline: e.node.description?.slice(0, 40) || '',
    }));
  } catch {
    return COLLECTIONS;
  }
}

/* ---------------- CART ---------------- */

export async function createCart(lines: CartLineInput[]): Promise<Cart> {
  if (!isShopifyConfigured()) {
    return {
      id: 'mock-cart',
      checkoutUrl: '#mock-checkout',
      totalQuantity: lines.reduce((a, l) => a + (l.quantity || 1), 0),
    };
  }

  const data = await shopifyFetch<{
    cartCreate: { cart: Cart };
  }>({
    query: CART_CREATE_MUTATION,
    variables: { lines },
  });

  return data.cartCreate.cart;
}

export async function addToCart(
  cartId: string,
  lines: CartLineInput[]
): Promise<Cart> {
  if (!isShopifyConfigured())
    return { id: cartId, checkoutUrl: '#mock-checkout', totalQuantity: 0 };

  const data = await shopifyFetch<{ cartLinesAdd: { cart: Cart } }>({
    query: CART_LINES_ADD_MUTATION,
    variables: { cartId, lines },
  });

  return data.cartLinesAdd.cart;
}
