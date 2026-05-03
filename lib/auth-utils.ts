// Authentication utilities and helpers

import { FulfillmentStatus } from '@/types';

/**
 * Map Shopify fulfillment status to UI-friendly label
 */
export const mapFulfillmentStatus = (status: FulfillmentStatus): { label: string; color: string } => {
  const statusMap: Record<FulfillmentStatus, { label: string; color: string }> = {
    UNFULFILLED: {
      label: 'Order Placed',
      color: 'bg-slate-100 text-slate-800',
    },
    PARTIAL: {
      label: 'Shipped',
      color: 'bg-amber-100 text-amber-800',
    },
    FULFILLED: {
      label: 'Delivered',
      color: 'bg-green-100 text-green-800',
    },
  };

  return statusMap[status];
};

/**
 * Check if auth token exists in localStorage
 */
export const isTokenValid = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const stored = localStorage.getItem('suitique-auth-v1');
    if (!stored) return false;

    const { accessToken } = JSON.parse(stored);
    return !!accessToken;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
};

/**
 * Get stored access token from localStorage
 */
export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('suitique-auth-v1');
    if (!stored) return null;

    const { accessToken } = JSON.parse(stored);
    return accessToken || null;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

/**
 * Get stored customer data from localStorage
 */
export const getStoredCustomer = () => {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('suitique-auth-v1');
    if (!stored) return null;

    const { customer } = JSON.parse(stored);
    return customer || null;
  } catch (error) {
    console.error('Error retrieving customer:', error);
    return null;
  }
};

/**
 * Clear auth token from localStorage
 */
export const clearAuthToken = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('suitique-auth-v1');
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password (placeholder for future Shopify integration)
 * Future: Replace with Shopify Customer Storefront API validation
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 5;
};

/**
 * PLACEHOLDER: Mock login function
 * TODO: Replace with Shopify Customer Storefront API call
 * Shopify endpoint: https://graphql.myshopify.com/api/2024-10/graphql.json
 * Query: customerAccessTokenCreate mutation
 */
export const mockLoginCall = async (email: string, password: string): Promise<{
  success: boolean;
  token?: string;
  customer?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  error?: string;
}> => {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock validation
  const validCredentials = {
    'test@example.com': 'password123',
    'demo@suitique.com': 'demo1234',
  } as Record<string, string>;

  if (validCredentials[email] === password) {
    return {
      success: true,
      token: `shopify_token_${Date.now()}`,
      customer: {
        id: `gid://shopify/Customer/${Math.random() * 1000000}`,
        email: email,
        firstName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        lastName: 'User',
      },
    };
  }

  return {
    success: false,
    error: 'Invalid email or password',
  };
};

/**
 * PLACEHOLDER: Fetch customer orders
 * TODO: Replace with Shopify Customer Storefront API call
 * Query: Orders query using customerAccessToken
 */
export const fetchCustomerOrders = async (accessToken: string) => {
  // Placeholder for Shopify API integration
  console.log('Fetching orders for token:', accessToken);
  // Mock will be used from data/mock-orders.ts for now
};

/**
 * Format date for display
 */
export const formatOrderDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};
