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

async function shopifyFetch<T = any>({ query, variables = {} }: { query: string; variables?: Record<string, any> }): Promise<T> {
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
        (v.selectedOptions || []).filter((o: any) => o.name.toLowerCase() === 'size').map((o: any) => o.value)
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

/**
 * Find the Shopify variant ID for a given size.
 * Searches through product variants to match selectedOptions with the chosen size.
 * @param variants - Array of Shopify variants with selectedOptions
 * @param selectedSize - The size selected by user (e.g., "M", "L")
 * @returns The variant's Shopify ID (e.g., "gid://shopify/ProductVariant/123456789") or null if not found
 */
export function findVariantBySize(variants: any[] | undefined, selectedSize: string | null): string | null {
  if (!selectedSize || !variants || variants.length === 0) {
    console.warn('[Shopify] findVariantBySize: No size or variants provided', { selectedSize, variantCount: variants?.length });
    return null;
  }

  const variant = variants.find((v) => {
    const sizeOption = (v.selectedOptions || []).find((o: any) => o.name.toLowerCase() === 'size');
    return sizeOption?.value === selectedSize;
  });

  if (variant) {
    console.log('[Shopify] findVariantBySize: Found variant', {
      selectedSize,
      variantId: variant.id,
      allOptions: variant.selectedOptions,
    });
    return variant.id;
  }

  console.warn('[Shopify] findVariantBySize: No variant found for size', {
    selectedSize,
    availableSizes: variants
      .map((v) => (v.selectedOptions || []).find((o: any) => o.name.toLowerCase() === 'size')?.value)
      .filter(Boolean),
  });
  return null;
}

export async function getProducts(): Promise<Product[]> {
  if (!isShopifyConfigured()) return PRODUCTS;
  try {
    const data = await shopifyFetch<{ products: { edges: { node: any }[] } }>({ query: PRODUCTS_QUERY });
    return data.products.edges.map((e) => normalizeShopifyProduct(e.node)).filter(Boolean) as Product[];
  } catch (e) {
    console.error('Shopify getProducts failed, using mock', e);
    return PRODUCTS;
  }
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  if (!isShopifyConfigured()) return PRODUCTS.find((p) => p.handle === handle) || null;
  try {
    const data = await shopifyFetch<{ productByHandle: any }>({ query: PRODUCT_BY_HANDLE_QUERY, variables: { handle } });
    return normalizeShopifyProduct(data.productByHandle);
  } catch (e) {
    console.error('Shopify getProductByHandle failed, using mock', e);
    return PRODUCTS.find((p) => p.handle === handle) || null;
  }
}

export async function getCollections(): Promise<Collection[]> {
  if (!isShopifyConfigured()) return COLLECTIONS;
  try {
    const data = await shopifyFetch<{ collections: { edges: { node: any }[] } }>({ query: COLLECTIONS_QUERY });
    return data.collections.edges.map((e) => ({
      handle: e.node.handle,
      title: e.node.title,
      image: e.node.image?.url || '',
      tagline: e.node.description?.slice(0, 40) || '',
    }));
  } catch (e) {
    console.error('Shopify getCollections failed, using mock', e);
    return COLLECTIONS;
  }
}

export async function createCart(lines: CartLineInput[]): Promise<Cart> {
  if (!isShopifyConfigured()) {
    console.log('[Shopify] createCart: Mock mode - Shopify not configured');
    return { id: 'mock-cart', checkoutUrl: '#mock-checkout', totalQuantity: lines.reduce((a, l) => a + (l.quantity || 1), 0) };
  }
  
  console.log('[Shopify] createCart: Creating cart with lines', {
    lineCount: lines.length,
    lines: lines.map((l) => ({ merchandiseId: l.merchandiseId, quantity: l.quantity })),
  });

  try {
    const data = await shopifyFetch<{ cartCreate: { cart: Cart; userErrors: any[] } }>({
      query: CART_CREATE_MUTATION,
      variables: { lines },
    });

    const cart = data.cartCreate.cart;
    const userErrors = data.cartCreate.userErrors || [];

    if (userErrors && userErrors.length > 0) {
      console.error('[Shopify] createCart: Shopify returned user errors', { userErrors });
    }

    console.log('[Shopify] createCart: Cart created successfully', {
      cartId: cart.id,
      checkoutUrl: cart.checkoutUrl,
      totalQuantity: cart.totalQuantity,
      hasCheckoutUrl: !!cart.checkoutUrl,
    });

    return cart;
  } catch (error) {
    console.error('[Shopify] createCart: API call failed', {
      error: error instanceof Error ? error.message : String(error),
      lines: lines.map((l) => ({ merchandiseId: l.merchandiseId, quantity: l.quantity })),
    });
    throw error;
  }
}

export async function addToCart(cartId: string, lines: CartLineInput[]): Promise<Cart> {
  if (!isShopifyConfigured()) return { id: cartId, checkoutUrl: '#mock-checkout', totalQuantity: 0 };
  const data = await shopifyFetch<{ cartLinesAdd: { cart: Cart } }>({ query: CART_LINES_ADD_MUTATION, variables: { cartId, lines } });
  return data.cartLinesAdd.cart;
}

export async function updateCartQuantity(cartId: string, lineId: string, quantity: number): Promise<Cart> {
  if (!isShopifyConfigured()) return { id: cartId, checkoutUrl: '#mock-checkout', totalQuantity: quantity };
  const data = await shopifyFetch<{ cartLinesUpdate: { cart: Cart } }>({
    query: CART_LINES_UPDATE_MUTATION,
    variables: { cartId, lines: [{ id: lineId, quantity }] },
  });
  return data.cartLinesUpdate.cart;
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  if (!isShopifyConfigured()) return { id: cartId, checkoutUrl: '#mock-checkout', totalQuantity: 0 };
  const data = await shopifyFetch<{ cartLinesRemove: { cart: Cart } }>({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds },
  });
  return data.cartLinesRemove.cart;
}
