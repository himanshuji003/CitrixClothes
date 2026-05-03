// Mock order data for development
// Structure matches Shopify Customer Storefront API Order schema
// TODO: Replace with real Shopify Customer API calls

import { Order } from '@/types';

export const mockOrders: Order[] = [
  {
    id: 'gid://shopify/Order/4567890123',
    orderNumber: '#1001',
    processedAt: '2024-01-15T10:30:00Z',
    fulfillmentStatus: 'FULFILLED',
    totalPrice: 12500,
    currency: 'INR',
    lineItems: [
      {
        title: 'Silk Organza Saree with Embroidery',
        quantity: 1,
        price: 12500,
        image: '/placeholder-product.jpg',
      },
    ],
  },
  {
    id: 'gid://shopify/Order/4567890124',
    orderNumber: '#1002',
    processedAt: '2024-02-22T14:15:00Z',
    fulfillmentStatus: 'FULFILLED',
    totalPrice: 8999,
    currency: 'INR',
    lineItems: [
      {
        title: 'Chanderi Cotton Saree',
        quantity: 1,
        price: 8999,
        image: '/placeholder-product.jpg',
      },
    ],
  },
  {
    id: 'gid://shopify/Order/4567890125',
    orderNumber: '#1003',
    processedAt: '2024-03-05T09:45:00Z',
    fulfillmentStatus: 'PARTIAL',
    totalPrice: 15500,
    currency: 'INR',
    lineItems: [
      {
        title: 'Silk Blend Saree Set (2 pieces)',
        quantity: 1,
        price: 15500,
        image: '/placeholder-product.jpg',
      },
    ],
  },
  {
    id: 'gid://shopify/Order/4567890126',
    orderNumber: '#1004',
    processedAt: '2024-04-10T16:20:00Z',
    fulfillmentStatus: 'UNFULFILLED',
    totalPrice: 11200,
    currency: 'INR',
    lineItems: [
      {
        title: 'Muslin Saree with Gold Border',
        quantity: 1,
        price: 11200,
        image: '/placeholder-product.jpg',
      },
    ],
  },
  {
    id: 'gid://shopify/Order/4567890127',
    orderNumber: '#1005',
    processedAt: '2024-04-28T11:00:00Z',
    fulfillmentStatus: 'FULFILLED',
    totalPrice: 22300,
    currency: 'INR',
    lineItems: [
      {
        title: 'Organza Saree Premium Collection',
        quantity: 1,
        price: 15000,
        image: '/placeholder-product.jpg',
      },
      {
        title: 'Silk Dupatta Accessory',
        quantity: 1,
        price: 7300,
        image: '/placeholder-product.jpg',
      },
    ],
  },
];

/**
 * Get mock orders for a customer (simulates API call)
 * TODO: Replace with Shopify Customer API query
 */
export const getMockCustomerOrders = (customerId?: string): Order[] => {
  // In future, filter by customerId from Shopify API
  // For now, return all mock orders
  return mockOrders;
};

/**
 * Get single order by ID
 */
export const getMockOrderById = (orderId: string): Order | undefined => {
  return mockOrders.find((order) => order.id === orderId);
};
