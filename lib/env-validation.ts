/**
 * Environment variable validation
 * Ensures all required environment variables are configured
 * Used primarily for OAuth and Shopify integration
 */

export interface ValidatedEnv {
  shopifyApiUrl: string | undefined;
  shopifyAccessToken: string | undefined;
  shopifyStoreName: string | undefined;
  shopifyStoreDomain: string | undefined;
  shopifyStorefrontToken: string | undefined;
  isShopifyConfigured: boolean;
}

/**
 * Validates that all required environment variables are present
 * Throws an error if critical variables are missing
 * @throws {Error} If required env vars are missing
 */
export function validateEnv(): ValidatedEnv {
  const errors: string[] = [];

  // Shopify Storefront API configuration
  const shopifyStoreDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const shopifyStorefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  // Check Shopify Storefront config (required for product fetching)
  if (!shopifyStoreDomain) {
    errors.push('Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN');
  }
  if (!shopifyStorefrontToken) {
    errors.push('Missing NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN');
  }

  // Optional: Shopify admin API (for order fulfillment, webhooks, etc.)
  const shopifyApiUrl = process.env.SHOPIFY_API_URL || '';
  const shopifyAccessToken = process.env.SHOPIFY_ACCESS_TOKEN || '';
  const shopifyStoreName = process.env.SHOPIFY_STORE_NAME || '';

  // Throw error if Storefront API is not configured (critical)
  // This prevents silent failures when fetching products
  if (errors.length > 0) {
    const errorMessage = `Environment validation failed:\n${errors.join('\n')}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  return {
    shopifyApiUrl,
    shopifyAccessToken,
    shopifyStoreName,
    shopifyStoreDomain,
    shopifyStorefrontToken,
    isShopifyConfigured: !!(shopifyStoreDomain && shopifyStorefrontToken),
  };
}

/**
 * Safe version of validateEnv that doesn't throw
 * Returns validation result and errors separately
 */
export function validateEnvSafe(): {
  isValid: boolean;
  errors: string[];
  env: Partial<ValidatedEnv>;
} {
  try {
    const env = validateEnv();
    return {
      isValid: true,
      errors: [],
      env,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : String(error)],
      env: {},
    };
  }
}
