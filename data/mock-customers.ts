// Mock customer credentials for development
// TODO: Replace with real Shopify Customer Storefront API authentication

export const mockCustomerCredentials = {
  'test@example.com': 'password123',
  'demo@suitique.com': 'demo1234',
  'user@example.com': 'secure123',
};

/**
 * Validate mock credentials
 * TODO: Replace with Shopify customerAccessTokenCreate mutation
 * GraphQL endpoint: https://graphql.myshopify.com/api/2024-10/graphql.json
 */
export const validateMockCredentials = (email: string, password: string): boolean => {
  return mockCustomerCredentials[email as keyof typeof mockCustomerCredentials] === password;
};
