/**
 * Environment Variable Validation
 * 
 * Validates all required Shopify Customer Account API environment variables.
 * Enforces security requirements for production deployments.
 * Fails fast if any critical vars are missing, preventing mysterious errors in production.
 */

/**
 * ✅ Validated Environment Variables
 * 
 * All NEXT_PUBLIC_ variables are available in browser.
 * PKCE (RFC 7636) provides security without client_secret.
 * Scopes come from Shopify Developer dashboard.
 * 
 * Production Requirements:
 * - BASE_URL must use HTTPS (secure cookies)
 * - Shop domain must be valid Shopify domain
 * - CLIENT_ID must not be empty
 * - SCOPES must include required permissions
 */
interface ValidatedEnv {
  NEXT_PUBLIC_BASE_URL: string;
  NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: string;
  NEXT_PUBLIC_SHOPIFY_CLIENT_ID: string;
  SHOPIFY_CUSTOMER_SCOPES: string;
  NODE_ENV: 'development' | 'production';
}

/**
 * Validates all required OAuth environment variables
 * Called at server startup to fail fast on misconfiguration
 * 
 * Production Requirements:
 * - BASE_URL must be HTTPS (for secure cookie flag)
 * - Shop domain must be valid
 * - All OAuth credentials present
 * 
 * @throws Error if any required variable is invalid
 * @returns Object with all validated environment variables
 */
export function validateEnv(): ValidatedEnv {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === 'production';

  // Check NEXT_PUBLIC_BASE_URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    errors.push(
      'NEXT_PUBLIC_BASE_URL is required (e.g., http://localhost:3000 or https://yourdomain.com)'
    );
  } else if (!baseUrl.startsWith('http')) {
    errors.push('NEXT_PUBLIC_BASE_URL must start with http:// or https://');
  } else if (isProduction && !baseUrl.startsWith('https://')) {
    errors.push(
      '🔒 PRODUCTION ERROR: NEXT_PUBLIC_BASE_URL must use HTTPS in production (secure cookies require HTTPS). ' +
      `Current: ${baseUrl}. Use format: https://yourdomain.com`
    );
  } else if (!isProduction && !baseUrl.startsWith('https://')) {
    warnings.push(
      '⚠️  WARNING: HTTPS is recommended for local testing to match production cookie settings. ' +
      `Use ngrok or similar to tunnel localhost. Current: ${baseUrl}`
    );
  }

  // Check NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
  const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN;
  if (!shopDomain) {
    errors.push(
      'NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN is required (e.g., mystore.myshopify.com). Get from Shopify Admin.'
    );
  } else if (!shopDomain.includes('.')) {
    errors.push(
      `NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN must be a valid domain, got: "${shopDomain}". ` +
      'Format: mystore.myshopify.com or yourdomain.com'
    );
  } else if (shopDomain.includes('..') || shopDomain.includes('://') || shopDomain.includes('/')) {
    errors.push(
      `NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN contains invalid characters: "${shopDomain}". ` +
      'Use only domain name without protocol or paths.'
    );
  }

  // Check NEXT_PUBLIC_SHOPIFY_CLIENT_ID
  const clientId = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;
  if (!clientId) {
    errors.push(
      'NEXT_PUBLIC_SHOPIFY_CLIENT_ID is required. Get from Shopify Admin → Apps and sales channels → App.'
    );
  } else if (clientId.length < 10) {
    errors.push(
      'NEXT_PUBLIC_SHOPIFY_CLIENT_ID appears too short (got: ' + clientId.length + ' chars). ' +
      'Verify you copied it correctly from Shopify Admin.'
    );
  }

  // Check SHOPIFY_CUSTOMER_SCOPES (server-side only)
  const scopes = process.env.SHOPIFY_CUSTOMER_SCOPES;
  if (!scopes) {
    errors.push(
      'SHOPIFY_CUSTOMER_SCOPES is required (e.g., "openid email customer-account-api:full"). Set in .env.local'
    );
  } else if (!scopes.includes('openid')) {
    errors.push(
      'SHOPIFY_CUSTOMER_SCOPES must include "openid" scope. ' +
      `Current: "${scopes}". ` +
      'Required format: "openid email customer-account-api:full"'
    );
  }

  // If any validation failed, throw error with all missing vars
  if (errors.length > 0) {
    const message = [
      '❌ ENVIRONMENT VALIDATION FAILED:',
      ...errors.map((e) => `  ❌ ${e}`),
      ...(warnings.length > 0 ? ['', '⚠️  WARNINGS:', ...warnings.map((w) => `  ${w}`)] : []),
      '',
      '📋 REQUIRED ENVIRONMENT VARIABLES:',
      '  NEXT_PUBLIC_BASE_URL=http://localhost:3000 (or https://yourdomain.com)',
      '  NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN=mystore.myshopify.com',
      '  NEXT_PUBLIC_SHOPIFY_CLIENT_ID=your_client_id_here',
      '  SHOPIFY_CUSTOMER_SCOPES=openid email customer-account-api:full',
      '',
      '📋 SETUP INSTRUCTIONS:',
      '  1. Create .env.local in project root (next to package.json)',
      '  2. Copy all REQUIRED ENVIRONMENT VARIABLES above',
      '  3. Fill in your actual values from Shopify Admin',
      '  4. Save file (do NOT commit .env.local)',
      '  5. Restart dev server: npm run dev',
      '',
      '📋 VERCEL DEPLOYMENT:',
      '  1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables',
      '  2. Add each variable above',
      '  3. Make sure NEXT_PUBLIC_BASE_URL is your production domain with HTTPS',
      '  4. Redeploy: git push (or click Redeploy in Vercel)',
      '',
      '❌ Build blocked until all errors are fixed',
    ].join('\n');

    throw new Error(message);
  }

  if (warnings.length > 0 && isProduction) {
    console.warn('[ENV VALIDATION]', warnings.join('\n'));
  }

  return {
    NEXT_PUBLIC_BASE_URL: baseUrl as string,
    NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: shopDomain as string,
    NEXT_PUBLIC_SHOPIFY_CLIENT_ID: clientId as string,
    SHOPIFY_CUSTOMER_SCOPES: scopes as string,
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production',
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
