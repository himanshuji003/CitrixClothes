// Shopify Storefront API client.
// Auto-falls back to mock data when env is not configured.

import { PRODUCTS, COLLECTIONS } from './products';
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  COLLECTIONS_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
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

export async function getCollectionByHandle(
  handle: string
): Promise<Collection | null> {
  console.log('Collection Handle:', handle);
  
  if (!isShopifyConfigured()) {
    const mockCollection = COLLECTIONS.find((c) => c.handle === handle);
    console.log('Using mock data - Collection found:', !!mockCollection);
    return mockCollection || null;
  }

  try {
    const data = await shopifyFetch<{ collectionByHandle: any }>({
      query: COLLECTION_BY_HANDLE_QUERY,
      variables: { handle },
    });

    console.log('Shopify Response:', data);

    if (!data.collectionByHandle) {
      console.log('Collection not found in Shopify');
      return null;
    }

    const collection: Collection = {
      handle: data.collectionByHandle.handle,
      title: data.collectionByHandle.title,
      image: data.collectionByHandle.image?.url || '',
      tagline: data.collectionByHandle.description?.slice(0, 40) || '',
    };

    console.log('Returning collection:', collection);
    return collection;
  } catch (error) {
    console.error('Error fetching collection from Shopify:', error);
    // Fallback to mock data
    const mockCollection = COLLECTIONS.find((c) => c.handle === handle);
    console.log('Fallback to mock - Collection found:', !!mockCollection);
    return mockCollection || null;
  }
}

export async function getCollectionWithProductsByHandle(
  handle: string
): Promise<{ collection: Collection | null; products: Product[] }> {
  console.log('\n=== getCollectionWithProductsByHandle ===');
  console.log('Requested handle:', handle);
  
  if (!isShopifyConfigured()) {
    console.log('Shopify not configured - using mock data');
    const mockCollection = COLLECTIONS.find((c) => c.handle === handle);
    console.log('Mock collection found:', !!mockCollection);
    
    if (!mockCollection) {
      console.log('Mock collection not found, returning empty');
      return { collection: null, products: [] };
    }
    
    // For mock data, filter products by collection property
    const mockProducts = PRODUCTS.filter((p) => p.collection === handle);
    console.log(`Mock products for "${handle}":`, mockProducts.length);
    return { collection: mockCollection, products: mockProducts };
  }

  try {
    const data = await shopifyFetch<{ collectionByHandle: any }>({
      query: COLLECTION_BY_HANDLE_QUERY,
      variables: { handle },
    });

    console.log('Shopify response received');
    
    if (!data.collectionByHandle) {
      console.log('Collection not found in Shopify');
      return { collection: null, products: [] };
    }

    const shopifyCollection = data.collectionByHandle;
    console.log('Collection title:', shopifyCollection.title);
    console.log('Collection products.edges.length:', shopifyCollection.products?.edges?.length || 0);

    const collection: Collection = {
      handle: shopifyCollection.handle,
      title: shopifyCollection.title,
      image: shopifyCollection.image?.url || '',
      tagline: shopifyCollection.description?.slice(0, 40) || '',
    };

    // Normalize products from collection response
    const products = (shopifyCollection.products?.edges || [])
      .map((e: any) => normalizeShopifyProduct(e.node))
      .filter(Boolean) as Product[];

    console.log('Normalized products count:', products.length);
    console.log('=== End getCollectionWithProductsByHandle ===\n');

    return { collection, products };
  } catch (error) {
    console.error('Error fetching collection with products:', error);
    
    // Fallback to mock data
    const mockCollection = COLLECTIONS.find((c) => c.handle === handle);
    console.log('Fallback: Mock collection found:', !!mockCollection);
    
    if (!mockCollection) {
      return { collection: null, products: [] };
    }
    
    const mockProducts = PRODUCTS.filter((p) => p.collection === handle);
    console.log(`Fallback: Mock products for "${handle}":`, mockProducts.length);
    return { collection: mockCollection, products: mockProducts };
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