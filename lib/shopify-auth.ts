/**
 * ✅ OAuth Login Implementation with PKCE
 * 
 * This module handles Shopify Customer Account API OAuth flow using PKCE.
 * 
 * PKCE (RFC 7636) is a security extension that:
 * - Eliminates need for client_secret
 * - Protects against authorization code interception attacks
 * - Ideal for public clients (Next.js app)
 * 
 * Customer Account API Docs:
 * https://shopify.dev/docs/api/customer-account/latest
 * 
 * OAuth Flow with PKCE:
 * 1. Generate code_verifier (random string)
 * 2. Generate code_challenge = SHA256(code_verifier)
 * 3. Redirect to Shopify with code_challenge
 * 4. Store code_verifier in secure cookie
 * 5. User authorizes on Shopify
 * 6. Exchange code + code_verifier (no client_secret needed)
 * 7. Receive access token
 */

const SHOPIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;
const SHOPIFY_SHOP_ID = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

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
 * ✅ Generate Shopify OAuth authorization URL with PKCE
 * 
 * This initiates the OAuth login flow:
 * 1. Generate code_verifier (random string)
 * 2. Generate code_challenge from code_verifier
 * 3. Build authorization URL with code_challenge
 * 4. Return URL and code_verifier (code_verifier stored by caller in cookie)
 * 
 * User Flow:
 * 1. User clicks Login button
 * 2. Frontend calls getShopifyLoginUrl()
 * 3. Code_verifier is returned and stored in secure cookie by caller
 * 4. Redirects to Shopify's hosted auth page
 * 5. User enters email/password on Shopify's secure server
 * 6. Shopify redirects back to /api/auth/callback with authorization code
 * 7. Code + stored code_verifier are exchanged for access token (NO client_secret)
 * 
 * @returns Object with authorization URL and code_verifier
 * @throws {Error} If required environment variables are missing or PKCE generation fails
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
  if (!SHOPIFY_SHOP_ID) {
    throw new Error('Missing NEXT_PUBLIC_SHOPIFY_SHOP_ID environment variable');
  }
  if (!NEXT_PUBLIC_BASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_BASE_URL environment variable');
  }

  try {
    // Step 1: Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    console.log('[OAuth PKCE] Generated PKCE parameters:', {
      codeVerifier: codeVerifier.substring(0, 20) + '...', // Log partial for security
      codeVerifierLength: codeVerifier.length,
      codeChallengeLength: codeChallenge.length,
      timestamp: new Date().toISOString(),
    });

    // Step 2: Build OAuth parameters
    const scope = 'openid email customer-account-api:full';
    const responseType = 'code';
    const redirectUri = `${NEXT_PUBLIC_BASE_URL}/api/auth/callback`;
    const codeChallengeMethod = 'S256'; // SHA-256

    // Use URLSearchParams for proper encoding
    const params = new URLSearchParams({
      client_id: SHOPIFY_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: responseType,
      scope: scope,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
    });

    // Step 3: Build authorization URL
    const loginUrl = `https://shopify.com/${SHOPIFY_SHOP_ID}/auth/oauth/authorize?${params.toString()}`;

    console.log('[OAuth PKCE] Generated authorization URL:', {
      url: loginUrl.substring(0, 80) + '...', // Log partial
      clientId: SHOPIFY_CLIENT_ID,
      shopId: SHOPIFY_SHOP_ID,
      redirectUri: redirectUri,
      scope: scope,
      codeChallengeMethod: codeChallengeMethod,
      timestamp: new Date().toISOString(),
    });

    return {
      loginUrl,
      codeVerifier,
      codeChallenge,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[OAuth PKCE] Error generating login URL:', message);
    throw error;
  }
}

/**
 * ✅ TODO - Phase 4: Fetch customer data using access token
 * 
 * This queries the Shopify Customer Account API to get user info.
 * Called after token exchange in /api/auth/callback.
 * 
 * We send the access token (obtained from OAuth) to fetch customer details.
 * This verifies token is valid and gets user info for display.
 */
export async function fetchCustomerData(accessToken: string): Promise<{
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}> {
  throw new Error('Fetch customer data not yet implemented - Phase 3');
  // TODO: Implement in Phase 3
  // Query Shopify Customer Account API with token
  // GraphQL query to get customer id, email, firstName, lastName
}

/**
 * ⚠️ TODO - Phase 3+: Refresh expired access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  throw new Error('Token refresh not yet implemented - Phase 3+');
  // TODO: Implement in Phase 3+
  // Exchange refresh token for new access token
}

/**
 * ⚠️ TODO - Phase 3+: Validate token expiry
 */
export function isTokenExpired(expiresAt: number): boolean {
  throw new Error('Token expiry check not yet implemented - Phase 3+');
  // TODO: Implement in Phase 3+
  // Check if current time > expiresAt
}

/**
 * ⚠️ TODO - Phase 3+: Clear user session
 */
export function clearAuthSession(): void {
  throw new Error('Logout not yet implemented - Phase 3+');
  // TODO: Implement in Phase 3+
  // Delete httpOnly cookie
  // Clear any auth state
}
