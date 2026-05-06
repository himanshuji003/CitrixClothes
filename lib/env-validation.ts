/**
 * Environment Variable Validation
 * 
 * This module validates all required environment variables at startup.
 * Fails fast if any critical vars are missing, preventing mysterious errors in production.
 */

/**
 * ✅ Validated Environment Variables
 * 
 * All variables use NEXT_PUBLIC_ prefix for browser access
 * PKCE (RFC 7636) provides security without client_secret
 */
interface ValidatedEnv {
  NEXT_PUBLIC_BASE_URL: string;
  NEXT_PUBLIC_SHOPIFY_CLIENT_ID: string;
  NEXT_PUBLIC_SHOPIFY_SHOP_ID: string;
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

  // Check NEXT_PUBLIC_SHOPIFY_CLIENT_ID
  const clientId = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;
  if (!clientId) {
    errors.push(
      'NEXT_PUBLIC_SHOPIFY_CLIENT_ID is required. Get from Shopify Admin dashboard.'
    );
  }

  // Check NEXT_PUBLIC_SHOPIFY_SHOP_ID
  const shopId = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID;
  if (!shopId) {
    errors.push('NEXT_PUBLIC_SHOPIFY_SHOP_ID is required. Get from your Shopify store.');
  }

  // If any validation failed, throw error with all missing vars
  if (errors.length > 0) {
    const message = [
      '❌ Environment Validation Failed:',
      ...errors.map((e) => `  - ${e}`),
      '',
      '📋 Setup Instructions:',
      '  1. Copy .env.production.example to .env.production (local development)',
      '  2. In Vercel Dashboard: Settings → Environment Variables',
      '  3. Add each variable from .env.production.example',
      '  4. Redeploy after setting variables',
    ].join('\n');

    throw new Error(message);
  }

  return {
    NEXT_PUBLIC_BASE_URL: baseUrl as string,
    NEXT_PUBLIC_SHOPIFY_CLIENT_ID: clientId as string,
    NEXT_PUBLIC_SHOPIFY_SHOP_ID: shopId as string,
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
