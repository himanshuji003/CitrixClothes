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
    // ISR revalidation: 60 seconds to auto-update Shopify products without redeploy
    next: { revalidate: 60 },
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

  const product: Product = {
    handle: p.handle,
    title: p.title,
    description: p.description,
    price: Math.round(parseFloat(p.priceRange?.minVariantPrice?.amount || '0')),
    compareAt: p.compareAtPriceRange?.minVariantPrice?.amount
      ? Math.round(parseFloat(p.compareAtPriceRange.minVariantPrice.amount))
      : null,
    currency: p.priceRange?.minVariantPrice?.currencyCode || 'INR',
    images: (p.images?.edges || []).map((e: any) => e.node.url),
    sizes: sizes.length > 0 ? sizes : ['Free Size'], // Default to Free Size if no sizes found
    variants: variants.length > 0 ? variants : [], // Ensure variants is always an array
    tag: (p.tags || [])[0] || null,
  };

  console.log('[normalizeShopifyProduct] Normalized product', {
    handle: product.handle,
    title: product.title,
    variantCount: product.variants.length,
    sizes: product.sizes,
    variantIds: product.variants.map((v: any) => v.id),
  });

  return product;
}

/**
 * Find a variant by size, with fallback for single-variant products.
 * For single-variant products, automatically uses the first variant's ID.
 * For multi-variant products, matches by size selectedOption.
 */
export function findVariantBySize(
  variants: any[] | undefined,
  selectedSize: string | null
): string | null {
  console.log('[findVariantBySize] Called with', {
    variantsArray: variants,
    variantCount: variants?.length,
    selectedSize,
    variantIds: variants?.map((v: any) => v.id),
  });

  if (!variants || variants.length === 0) {
    console.warn('[findVariantBySize] No variants available');
    return null;
  }

  // For single-variant products, always use the first variant
  if (variants.length === 1) {
    const variantId = variants[0]?.id;
    console.log('[findVariantBySize] Single variant product, using first variant', {
      variantId,
      variantObject: variants[0],
    });
    return variantId || null;
  }

  // For multi-variant products, find by size
  if (!selectedSize) {
    console.warn('[findVariantBySize] No size selected for multi-variant product');
    return null;
  }

  const variant = variants.find((v) => {
    const sizeOption = (v.selectedOptions || []).find(
      (o: any) => o.name.toLowerCase() === 'size'
    );
    return sizeOption?.value === selectedSize;
  });

  const result = variant?.id || null;
  console.log('[findVariantBySize] Result for multi-variant', {
    selectedSize,
    foundVariant: variant,
    variantId: result,
  });

  return result;
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
  console.log('[getProductByHandle] Fetching product', { handle, shopifyConfigured: isShopifyConfigured() });

  if (!isShopifyConfigured()) {
    console.log('[getProductByHandle] Shopify not configured, using mock data');
    const mock = PRODUCTS.find((p) => p.handle === handle);
    console.log('[getProductByHandle] Mock product result', {
      found: !!mock,
      handle: mock?.handle,
      variants: mock?.variants?.length,
    });
    return mock || null;
  }

  try {
    const data = await shopifyFetch<{ productByHandle: any }>({
      query: PRODUCT_BY_HANDLE_QUERY,
      variables: { handle },
    });

    console.log('[getProductByHandle] Shopify fetch succeeded, normalizing...');
    const product = normalizeShopifyProduct(data.productByHandle);
    console.log('[getProductByHandle] Shopify product normalized', {
      handle: product?.handle,
      variants: product?.variants?.length,
    });
    return product;
  } catch (error) {
    console.error('[getProductByHandle] Shopify fetch failed, falling back to mock', {
      error: error instanceof Error ? error.message : String(error),
      handle,
    });
    const mock = PRODUCTS.find((p) => p.handle === handle);
    return mock || null;
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
  console.log('[Shopify] createCart: Received lines', {
    lineCount: lines.length,
    lines: lines.map((l) => ({
      merchandiseId: l.merchandiseId,
      quantity: l.quantity,
      merchandiseIdType: typeof l.merchandiseId,
    })),
  });

  if (!isShopifyConfigured()) {
    console.warn('[Shopify] createCart: Shopify not configured, returning mock cart');
    return {
      id: 'mock-cart',
      checkoutUrl: '#mock-checkout',
      totalQuantity: lines.reduce((a, l) => a + (l.quantity || 1), 0),
    };
  }

  try {
    const data = await shopifyFetch<{
      cartCreate: { cart: Cart };
    }>({
      query: CART_CREATE_MUTATION,
      variables: { lines },
    });

    console.log('[Shopify] createCart: Success', {
      cartId: data.cartCreate.cart.id,
      checkoutUrl: data.cartCreate.cart.checkoutUrl,
    });

    return data.cartCreate.cart;
  } catch (error) {
    console.error('[Shopify] createCart: Failed', {
      error: error instanceof Error ? error.message : String(error),
      lines,
    });
    throw error;
  }
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

/* AUTH - FIXED: Parameterized GraphQL (no string interpolation) */

export async function customerLogin(email: string, password: string) {
  if (!isShopifyConfigured()) {
    throw new Error('Shopify not configured');
  }

  const query = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
        }
        customerUserErrors {
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<any>({
    query,
    variables: {
      input: { email, password },
    },
  });

  return data.customerAccessTokenCreate;
}

export async function getCustomerProfile(token: string) {
  if (!isShopifyConfigured()) return null;

  const query = `
    query GetCustomer($token: String!) {
      customer(customerAccessToken: $token) {
        id
        email
        firstName
        lastName
        phone
      }
    }
  `;

  try {
    const data = await shopifyFetch<any>({
      query,
      variables: { token },
    });

    const customer = data.customer;
    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
    };
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    return null;
  }
}

/* ORDERS - FIXED: Parameterized GraphQL (no string interpolation) */

export async function getCustomerOrders(token: string) {
  if (!isShopifyConfigured()) {
    return [];
  }

  const query = `
    query GetCustomerOrders($token: String!) {
      customer(customerAccessToken: $token) {
        orders(first: 10) {
          edges {
            node {
              id
              orderNumber
              processedAt
              fulfillmentStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                    variant {
                      priceV2 {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch<any>({
      query,
      variables: { token },
    });

    return (data.customer?.orders?.edges || []).map((e: any) => {
      const order = e.node;
      const totalPrice = parseFloat(order.totalPriceSet?.shopMoney?.amount || '0');
      const currency = order.totalPriceSet?.shopMoney?.currencyCode || 'USD';

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        processedAt: order.processedAt,
        fulfillmentStatus: order.fulfillmentStatus || 'UNFULFILLED',
        totalPrice: Math.round(totalPrice * 100) / 100,
        currency: currency,
        lineItems: (order.lineItems?.edges || []).map((item: any) => ({
          title: item.node.title,
          quantity: item.node.quantity,
          price: parseFloat(item.node.variant?.priceV2?.amount || '0'),
        })),
      };
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

/* SIGNUP - Create new customer account */

export async function customerCreate(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  if (!isShopifyConfigured()) {
    throw new Error('Shopify not configured');
  }

  const query = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          firstName
          lastName
        }
        customerUserErrors {
          code
          message
          field
        }
      }
    }
  `;

  const data = await shopifyFetch<any>({
    query,
    variables: {
      input: {
        email,
        password,
        firstName,
        lastName,
      },
    },
  });

  return data.customerCreate;
}

/* PROFILE UPDATE - Update customer information */

export async function customerUpdate(
  token: string,
  input: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  }
) {
  if (!isShopifyConfigured()) {
    throw new Error('Shopify not configured');
  }

  const query = `
    mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
      customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
        customer {
          id
          email
          firstName
          lastName
          phone
        }
        customerUserErrors {
          code
          message
          field
        }
      }
    }
  `;

  const data = await shopifyFetch<any>({
    query,
    variables: {
      customerAccessToken: token,
      customer: input,
    },
  });

  return data.customerUpdate;
}

/* PASSWORD UPDATE - Change customer password */

export async function updateCustomerPassword(
  token: string,
  oldPassword: string,
  newPassword: string
) {
  if (!isShopifyConfigured()) {
    throw new Error('Shopify not configured');
  }

  const query = `
    mutation updateCustomerPassword($customerAccessToken: String!, $newPassword: String!) {
      customerUpdate(customerAccessToken: $customerAccessToken, customer: {password: $newPassword}) {
        customer {
          id
          email
        }
        customerUserErrors {
          code
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<any>({
    query,
    variables: {
      customerAccessToken: token,
      newPassword,
    },
  });

  return data.customerUpdate;
}

/* ============================================= */
/* CUSTOMER ACCOUNT API - Profile Management    */
/* Used in /api/account/* endpoints             */
/* ============================================= */

/**
 * GraphQL Query to fetch customer with metafields
 * Used by GET /api/account/profile-status
 * Customer Account API v2026-04
 */
export const GET_CUSTOMER_WITH_METAFIELDS_QUERY = `
  query GetCustomerWithMetafields {
    customer {
      id
      displayName
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      phoneNumber {
        phoneNumber
      }
      metafields(first: 10, namespace: "custom") {
        edges {
          node {
            key
            value
          }
        }
      }
    }
  }
`;

/**
 * GraphQL Mutation to set customer metafields
 * Used by POST /api/account/complete-profile
 * Customer Account API v2026-04
 * 
 * Saves profile data:
 * - custom.full_name: string
 * - custom.mobile_number: string
 * - custom.age: number
 * - custom.gender: string
 */
export const SET_CUSTOMER_METAFIELDS_MUTATION = `
  mutation SetCustomerMetafields($input: MetafieldsSetInput!) {
    metafieldsSet(input: $input) {
      metafields {
        key
        namespace
        value
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;