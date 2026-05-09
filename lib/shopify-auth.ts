/**
 * ✅ Shopify OAuth with PKCE and OpenID Discovery
 * 
 * This module handles Shopify Customer Account API OAuth flow using PKCE
 * and dynamically discovers OAuth endpoints from Shopify's OpenID configuration.
 * 
 * PKCE (RFC 7636):
 * - Eliminates need for client_secret
 * - Protects against authorization code interception
 * - Required for public clients (single-page apps, mobile apps)
 * 
 * OpenID Discovery:
 * - Dynamically fetches OAuth endpoints from Shopify
 * - Adapts to Shopify API changes without code updates
 * - Ensures forward compatibility
 * 
 * Customer Account API Docs:
 * https://shopify.dev/docs/api/customer-account/latest
 */

const SHOPIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;
const SHOPIFY_SHOP_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const SHOPIFY_CUSTOMER_SCOPES = process.env.SHOPIFY_CUSTOMER_SCOPES;

// Log env vars at module load time to diagnose missing configuration
if (typeof window === 'undefined') {
  console.log('[OAuth Module Load] Environment variables status:', {
    SHOPIFY_CLIENT_ID: SHOPIFY_CLIENT_ID ? '✓ Set' : '❌ MISSING',
    SHOPIFY_SHOP_DOMAIN: SHOPIFY_SHOP_DOMAIN ? '✓ Set' : '❌ MISSING',
    NEXT_PUBLIC_BASE_URL: NEXT_PUBLIC_BASE_URL ? '✓ Set' : '❌ MISSING',
    SHOPIFY_CUSTOMER_SCOPES: SHOPIFY_CUSTOMER_SCOPES ? '✓ Set' : '❌ MISSING',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Cache for OpenID discovery metadata
 * Avoids repeated network calls to fetch the same endpoints
 */
let openidMetadataCache: any = null;
let customerAccountApiCache: any = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 3600000; // 1 hour

export const AUTH_COOKIE_NAMES = {
  accessToken: 'shopify_customer_access_token',
  refreshToken: 'shopify_customer_refresh_token',
  idToken: 'shopify_customer_id_token',
  pkceVerifier: 'pkce_verifier',
  oauthState: 'oauth_state',
  oauthNonce: 'oauth_nonce',
  legacyCustomerToken: 'customer_token',
} as const;

export function getRequestBaseUrl(req: Request): string {
  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto = req.headers.get('x-forwarded-proto');
  const host = forwardedHost || req.headers.get('host');

  if (host) {
    const proto =
      forwardedProto?.split(',')[0]?.trim() ||
      (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');

    return `${proto}://${host}`;
  }

  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

export function getCookieSecurity(baseUrl: string): { secure: boolean; sameSite: 'lax' } {
  return {
    secure: process.env.NODE_ENV === 'production' || baseUrl.startsWith('https://'),
    sameSite: 'lax',
  };
}

export function getShopifyCustomerApiHeaders(accessToken: string, origin?: string) {
  return {
    'Authorization': accessToken,
    'Content-Type': 'application/json',
    ...(origin ? { 'Origin': origin } : {}),
    'User-Agent': 'CitrixClothes/1.0',
  };
}

export function getShopifyTokenHeaders(origin: string) {
  return {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
    'Origin': origin,
    'User-Agent': 'CitrixClothes/1.0',
  };
}

/**
 * Fetch OpenID discovery metadata from Shopify
 * https://{shopDomain}/.well-known/openid-configuration
 * 
 * Caches result for 1 hour to avoid repeated network calls.
 */
export async function fetchOpenIDMetadata(): Promise<{
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint?: string;
  issuer: string;
}> {
  // Return cached metadata if fresh
  if (openidMetadataCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[OpenID Discovery] Using cached metadata');
    }
    return openidMetadataCache;
  }

  if (!SHOPIFY_SHOP_DOMAIN) {
    throw new Error('NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN environment variable is required');
  }

  const discoveryUrl = `https://${SHOPIFY_SHOP_DOMAIN}/.well-known/openid-configuration`;

  if (process.env.NODE_ENV !== 'production') {
    console.log('[OpenID Discovery] Fetching metadata from:', discoveryUrl);
  }

  try {
    const response = await fetch(discoveryUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch OpenID metadata: ${response.status} ${response.statusText}`
      );
    }

    const metadata = await response.json();

    // ✅ ENHANCED: Log full endpoint URLs (not sensitive, safe to log)
    if (process.env.NODE_ENV !== 'production') {
      console.log('[OpenID Discovery] Metadata fetched successfully:', {
        discoveryUrl: discoveryUrl,
        authorization_endpoint: metadata.authorization_endpoint,
        token_endpoint: metadata.token_endpoint,
        end_session_endpoint: metadata.end_session_endpoint || 'not provided',
        issuer: metadata.issuer || 'not provided',
        timestamp: new Date().toISOString(),
      });
    }

    // Validate required endpoints
    if (!metadata.authorization_endpoint || !metadata.token_endpoint) {
      throw new Error(
        'Invalid OpenID metadata: missing authorization_endpoint or token_endpoint'
      );
    }

    // Cache the metadata
    openidMetadataCache = metadata;
    cacheTimestamp = Date.now();

    return metadata;
  } catch (error) {
    console.error('[OpenID Discovery] Error fetching metadata:', error);
    throw error;
  }
}

/**
 * Fetch Customer Account API discovery metadata
 * https://{shopDomain}/.well-known/customer-account-api
 * 
 * Returns the GraphQL endpoint for querying customer data.
 * Shopify may return graphql_api, graphql_url, or graphqlEndpoint - we support all.
 */
export async function fetchCustomerAccountApiMetadata(): Promise<{
  graphql_url: string;
  graphql_api: string;
}> {
  // Return cached metadata if fresh
  if (customerAccountApiCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Customer Account API Discovery] Using cached metadata');
    }
    return customerAccountApiCache;
  }

  if (!SHOPIFY_SHOP_DOMAIN) {
    throw new Error('NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN environment variable is required');
  }

  const discoveryUrl = `https://${SHOPIFY_SHOP_DOMAIN}/.well-known/customer-account-api`;

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Customer Account API Discovery] Fetching metadata from:', discoveryUrl);
  }

  try {
    const response = await fetch(discoveryUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Customer Account API metadata: ${response.status} ${response.statusText}`
      );
    }

    const metadata = await response.json();

    // ✅ Support multiple field names for GraphQL endpoint
    // Shopify may return: graphql_api, graphql_url, or graphqlEndpoint
    const graphqlEndpoint =
      metadata.graphql_api ||
      metadata.graphql_url ||
      metadata.graphqlEndpoint;

    if (!graphqlEndpoint) {
      console.error('[Customer Account API Discovery] Full metadata received:', {
        ...metadata,
        timestamp: new Date().toISOString(),
      });
      throw new Error('Invalid Customer Account API metadata: missing GraphQL endpoint (graphql_api, graphql_url, or graphqlEndpoint)');
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[Customer Account API Discovery] Metadata fetched successfully:', {
        graphqlEndpoint: graphqlEndpoint,
        sourceField: metadata.graphql_api ? 'graphql_api' : metadata.graphql_url ? 'graphql_url' : 'graphqlEndpoint',
        allMetadata: metadata,
        timestamp: new Date().toISOString(),
      });
    }

    // Normalize to both field names for compatibility
    const normalizedMetadata = {
      ...metadata,
      graphql_url: graphqlEndpoint,
      graphql_api: graphqlEndpoint,
    };

    // Cache the metadata
    customerAccountApiCache = normalizedMetadata;
    cacheTimestamp = Date.now();

    return normalizedMetadata;
  } catch (error) {
    console.error('[Customer Account API Discovery] Error fetching metadata:', error);
    throw error;
  }
}

/**
 * Generate a cryptographically secure code_verifier for PKCE
 * 
 * PKCE requires a random string between 43-128 unreserved characters.
 * We use 128 characters for maximum security.
 * 
 * Unreserved characters: [A-Z] [a-z] [0-9] - . _ ~
 * 
 * @returns Random code_verifier string
 */
export function generateCodeVerifier(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let verifier = '';

  try {
    // Generate 96 random bytes (encodes to 128 base64url characters)
    const randomValues = new Uint8Array(96);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < randomValues.length; i++) {
      verifier += charset[randomValues[i] % charset.length];
    }

    return verifier;
  } catch (error) {
    // Fallback for environments without crypto.getRandomValues
    console.warn('[PKCE] crypto.getRandomValues not available, using Math.random fallback');
    for (let i = 0; i < 128; i++) {
      verifier += charset[Math.floor(Math.random() * charset.length)];
    }
    return verifier;
  }
}

/**
 * Generate code_challenge from code_verifier using SHA-256
 * 
 * Performs SHA-256 hash and Base64URL encoding:
 * code_challenge = BASE64URL(SHA256(code_verifier))
 * 
 * @param codeVerifier - The code verifier string from generateCodeVerifier()
 * @returns Base64URL encoded SHA256 hash
 */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  try {
    if (typeof window !== 'undefined') {
      // Browser environment
      const encoder = new TextEncoder();
      const data = encoder.encode(codeVerifier);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);

      // Convert ArrayBuffer to Base64URL
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const base64 = btoa(String.fromCharCode(...hashArray));

      // Convert Base64 to Base64URL: + → -, / → _, remove =
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    } else {
      // Node.js server-side environment
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256').update(codeVerifier).digest();
      const base64 = hash.toString('base64');

      // Convert Base64 to Base64URL
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
  } catch (error) {
    console.error('[PKCE] Error generating code challenge:', error);
    throw new Error('Failed to generate PKCE code challenge');
  }
}

/**
 * Generate a cryptographically secure random state parameter
 * Used for CSRF protection and session verification
 * 
 * @returns Random state string
 */
export function generateState(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let state = '';

  try {
    const randomValues = new Uint8Array(32);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < randomValues.length; i++) {
      state += charset[randomValues[i] % charset.length];
    }

    return state;
  } catch (error) {
    console.warn('[OAuth] crypto.getRandomValues not available for state, using fallback');
    for (let i = 0; i < 32; i++) {
      state += charset[Math.floor(Math.random() * charset.length)];
    }
    return state;
  }
}

/**
 * Generate a cryptographically secure random nonce parameter
 * Used for ID token verification
 * 
 * @returns Random nonce string
 */
export function generateNonce(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let nonce = '';

  try {
    const randomValues = new Uint8Array(32);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < randomValues.length; i++) {
      nonce += charset[randomValues[i] % charset.length];
    }

    return nonce;
  } catch (error) {
    console.warn('[OAuth] crypto.getRandomValues not available for nonce, using fallback');
    for (let i = 0; i < 32; i++) {
      nonce += charset[Math.floor(Math.random() * charset.length)];
    }
    return nonce;
  }
}

/**
 * ✅ OAuth login helper (kept for backward compatibility with login page)
 * 
 * Used by /login and /signup pages to generate OAuth URL and PKCE parameters.
 * The URL and code_verifier are passed back to the frontend.
 * Frontend stores code_verifier in secure cookie via /api/auth/store-pkce.
 * 
 * @returns Object with authorization URL and code_verifier
 * @throws {Error} If environment variables are missing or PKCE generation fails
 */
export async function getShopifyLoginUrl(): Promise<{
  loginUrl: string;
  codeVerifier: string;
  codeChallenge: string;
}> {
  // Validate environment variables
  if (!SHOPIFY_CLIENT_ID) {
    throw new Error('Missing NEXT_PUBLIC_SHOPIFY_CLIENT_ID environment variable');
  }
  if (!SHOPIFY_SHOP_DOMAIN) {
    throw new Error('Missing NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN environment variable');
  }
  if (!NEXT_PUBLIC_BASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_BASE_URL environment variable');
  }
  if (!SHOPIFY_CUSTOMER_SCOPES) {
    throw new Error('Missing SHOPIFY_CUSTOMER_SCOPES environment variable');
  }

  console.log('[OAuth Helper] Generating login URL with discovery endpoints');

  try {
    // Step 1: Fetch OpenID metadata to get authorization endpoint
    const metadata = await fetchOpenIDMetadata();

    // Step 2: Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    console.log('[OAuth Helper] Generated PKCE parameters:', {
      codeVerifierLength: codeVerifier.length,
      codeChallengeLength: codeChallenge.length,
      timestamp: new Date().toISOString(),
    });

    // Step 3: Build OAuth parameters
    const redirectUri = `${NEXT_PUBLIC_BASE_URL}/api/auth/callback`;
    const codeChallengeMethod = 'S256';

    const params = new URLSearchParams({
      client_id: SHOPIFY_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: SHOPIFY_CUSTOMER_SCOPES,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
    });

    // Step 4: Build authorization URL from discovery endpoint
    const loginUrl = `${metadata.authorization_endpoint}?${params.toString()}`;

    console.log('[OAuth Helper] Generated authorization URL (discovery-based):', {
      discoveryEndpoint: metadata.authorization_endpoint,
      timestamp: new Date().toISOString(),
    });

    return {
      loginUrl,
      codeVerifier,
      codeChallenge,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[OAuth Helper] Error generating login URL:', message);
    throw error;
  }
}

/**
 * ✅ Refresh Customer Access Token
 * 
 * Exchanges a refresh token for a new access token.
 * Call this when the access token is close to expiry or returns 401.
 * 
 * Flow:
 * 1. Get refresh token from cookies
 * 2. Exchange refresh token for new access token at token endpoint
 * 3. Update cookies with new tokens
 * 4. Return new access token or throw error
 * 
 * Usage (server-side only):
 * ```typescript
 * try {
 *   const newToken = await refreshAccessToken(refreshToken);
 * } catch (error) {
 *   // Refresh failed - clear cookies and redirect to login
 * }
 * ```
 * 
 * Security:
 * - NEVER call from browser (tokens are httpOnly)
 * - Always use server-side (API endpoints, middleware)
 * - Returns new token as string for server use only
 * - Never store new token in localStorage
 * 
 * @param refreshToken - The refresh token from cookies
 * @returns New access token string
 * @throws Error if refresh fails
 */
export async function refreshAccessToken(refreshToken: string, baseUrl = NEXT_PUBLIC_BASE_URL): Promise<string> {
  if (!SHOPIFY_CLIENT_ID || !baseUrl) {
    throw new Error('Missing OAuth environment variables');
  }

  console.log('[OAuth Refresh] Attempting to refresh access token');

  try {
    // Step 1: Fetch token endpoint from metadata
    const metadata = await fetchOpenIDMetadata();
    const redirectUri = `${baseUrl}/api/auth/callback`;

    // Step 2: Exchange refresh token for new access token
    const tokenResponse = await fetch(metadata.token_endpoint, {
      method: 'POST',
      headers: getShopifyTokenHeaders(baseUrl),
      body: new URLSearchParams({
        client_id: SHOPIFY_CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('[OAuth Refresh] Token refresh failed', {
        status: tokenResponse.status,
        error: (errorData as any).error,
        timestamp: new Date().toISOString(),
      });
      throw new Error(`Token refresh failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();

    console.log('[OAuth Refresh] Token refreshed successfully', {
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      timestamp: new Date().toISOString(),
    });

    return tokenData.access_token;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[OAuth Refresh] Error refreshing token:', message);
    throw error;
  }
}
