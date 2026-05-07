/**
 * Environment Variable Validation
 * 
 * Validates all required Shopify Customer Account API environment variables.
 * Fails fast if any critical vars are missing, preventing mysterious errors in production.
 */

/**
 * ✅ Validated Environment Variables
 * 
 * All NEXT_PUBLIC_ variables are available in browser.
 * PKCE (RFC 7636) provides security without client_secret.
 * Scopes come from Shopify Developer dashboard.
 */
interface ValidatedEnv {
  NEXT_PUBLIC_BASE_URL: string;
  NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: string;
  NEXT_PUBLIC_SHOPIFY_CLIENT_ID: string;
  SHOPIFY_CUSTOMER_SCOPES: string;
}

/**
 * Validates all required OAuth environment variables
 * Called at server startup to fail fast on misconfiguration
 * 
 * @throws Error if any required variable is missing
 * @returns Object with all validated environment variables
 */
export function validateEnv(): ValidatedEnv {
  const errors: string[] = [];

  // Check NEXT_PUBLIC_BASE_URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    errors.push(
      'NEXT_PUBLIC_BASE_URL is required (e.g., http://localhost:3000 or https://yourdomain.com)'
    );
  } else if (!baseUrl.startsWith('http')) {
    errors.push('NEXT_PUBLIC_BASE_URL must start with http:// or https://');
  }

  // Check NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
  const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN;
  if (!shopDomain) {
    errors.push(
      'NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN is required (e.g., mystore.myshopify.com). Get from Shopify Admin.'
    );
  } else if (!shopDomain.includes('myshopify.com') && !shopDomain.includes('.com')) {
    errors.push(
      `NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN must be a valid Shopify domain, got: "${shopDomain}". ` +
      'Format: mystore.myshopify.com or yourdomain.com'
    );
  }

  // Check NEXT_PUBLIC_SHOPIFY_CLIENT_ID
  const clientId = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;
  if (!clientId) {
    errors.push(
      'NEXT_PUBLIC_SHOPIFY_CLIENT_ID is required. Get from Shopify Admin → Apps and sales channels → App.'
    );
  }

  // Check SHOPIFY_CUSTOMER_SCOPES (server-side only)
  const scopes = process.env.SHOPIFY_CUSTOMER_SCOPES;
  if (!scopes) {
    errors.push(
      'SHOPIFY_CUSTOMER_SCOPES is required (e.g., "openid email customer-account-api:full"). Set in .env.local'
    );
  }

  // If any validation failed, throw error with all missing vars
  if (errors.length > 0) {
    const message = [
      '❌ Environment Validation Failed:',
      ...errors.map((e) => `  - ${e}`),
      '',
      '📋 Required Environment Variables:',
      '  NEXT_PUBLIC_BASE_URL - Your app URL (http://localhost:3000 or https://yourdomain.com)',
      '  NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN - Shopify store domain (mystore.myshopify.com)',
      '  NEXT_PUBLIC_SHOPIFY_CLIENT_ID - OAuth client ID from Shopify Admin',
      '  SHOPIFY_CUSTOMER_SCOPES - OAuth scopes (openid email customer-account-api:full)',
      '',
      '📋 Setup Instructions:',
      '  1. Create .env.local in project root',
      '  2. Add the above variables with your values',
      '  3. For Vercel: Settings → Environment Variables',
      '  4. Add each variable and redeploy',
    ].join('\n');

    throw new Error(message);
  }

  return {
    NEXT_PUBLIC_BASE_URL: baseUrl as string,
    NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: shopDomain as string,
    NEXT_PUBLIC_SHOPIFY_CLIENT_ID: clientId as string,
    SHOPIFY_CUSTOMER_SCOPES: scopes as string,
  };
}

/**
 * Validates environment on module load (server-side only)
 * This runs when any server-side file imports from lib/env-validation.ts
 */
if (typeof window === 'undefined') {
  // Only validate on server-side, not in browser
  try {
    validateEnv();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

export default validateEnv;
