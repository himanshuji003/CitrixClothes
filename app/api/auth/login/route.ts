import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateEnv } from '@/lib/env-validation';
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  generateNonce,
  fetchOpenIDMetadata,
} from '@/lib/shopify-auth';

/**
 * ✅ OAuth Login Route Handler
 * 
 * This endpoint initiates the OAuth login flow by:
 * 1. Generating PKCE parameters (code_verifier, code_challenge)
 * 2. Generating state and nonce for security
 * 3. Storing all temporary parameters in secure httpOnly cookies
 * 4. Redirecting to Shopify's authorization endpoint
 * 
 * Security:
 * - code_verifier stored in httpOnly cookie (cannot be accessed by JavaScript)
 * - state stored in httpOnly cookie for CSRF protection
 * - nonce stored in httpOnly cookie for ID token verification
 * - All cookies are secure (HTTPS only in production) and sameSite=lax
 * - Authorization code is single-use and time-limited by Shopify
 * 
 * Flow:
 * 1. User clicks Login button
 * 2. Frontend redirects to /api/auth/login
 * 3. This route generates PKCE, state, nonce
 * 4. Stores in secure cookies
 * 5. Redirects to Shopify authorization_endpoint
 * 6. User authorizes on Shopify
 * 7. Shopify redirects back to /api/auth/callback?code=...&state=...
 */

export async function GET(req: NextRequest) {
  try {
    // Validate environment variables early
    validateEnv();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      throw new Error('Missing NEXT_PUBLIC_BASE_URL environment variable');
    }

    console.log('[/api/auth/login] Login flow initiated', {
      timestamp: new Date().toISOString(),
    });

    // Step 1: Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Step 2: Generate security parameters
    const state = generateState();
    const nonce = generateNonce();

    console.log('[/api/auth/login] Generated security parameters:', {
      codeVerifierLength: codeVerifier.length,
      codeChallengeLength: codeChallenge.length,
      stateLength: state.length,
      nonceLength: nonce.length,
      timestamp: new Date().toISOString(),
    });

    // Step 3: Fetch OpenID metadata to get authorization endpoint
    const metadata = await fetchOpenIDMetadata();

    console.log('[/api/auth/login] Retrieved OpenID metadata', {
      authorizationEndpoint: metadata.authorization_endpoint,
      timestamp: new Date().toISOString(),
    });

    // Step 4: Store PKCE parameters and security values in secure cookies
    const cookieStore = await cookies();

    // ✅ Detect HTTPS (including ngrok) from BASE_URL, not just NODE_ENV
    // ngrok uses HTTPS and requires secure: true or cookies won't be sent back
    const isHttpsUrl = baseUrl.startsWith('https://');
    const isProduction = process.env.NODE_ENV === 'production';
    const shouldSetSecure = isProduction || isHttpsUrl;

    if (process.env.NODE_ENV !== 'production') {
      console.log('[/api/auth/login] Cookie configuration:', {
        baseUrl: baseUrl,
        isHttpsUrl: isHttpsUrl,
        NODE_ENV: process.env.NODE_ENV,
        secureFlagWillBe: shouldSetSecure,
        timestamp: new Date().toISOString(),
      });
    }

    cookieStore.set('pkce_verifier', codeVerifier, {
      httpOnly: true,
      secure: shouldSetSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 600, // 10 minutes (authorization code expires quickly)
    });

    cookieStore.set('oauth_state', state, {
      httpOnly: true,
      secure: shouldSetSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 600, // 10 minutes
    });

    cookieStore.set('oauth_nonce', nonce, {
      httpOnly: true,
      secure: shouldSetSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 600, // 10 minutes
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('[/api/auth/login] Security parameters stored in secure cookies', {
        pkce_verifier: 'set ✓',
        oauth_state: 'set ✓',
        oauth_nonce: 'set ✓',
        secure: shouldSetSecure,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 600,
        timestamp: new Date().toISOString(),
      });
    }

    // Step 5: Build authorization URL
    const clientId = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;
    const scopes = process.env.SHOPIFY_CUSTOMER_SCOPES;
    const redirectUri = `${baseUrl}/api/auth/callback`;

    const authParams = new URLSearchParams({
      client_id: clientId!,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes!,
      state: state,
      nonce: nonce,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const authorizationUrl = `${metadata.authorization_endpoint}?${authParams.toString()}`;

    // ✅ ENHANCED: Log full URLs for verification (guarded by NODE_ENV)
    if (process.env.NODE_ENV !== 'production') {
      console.log('[/api/auth/login] OpenID Discovery Verification:', {
        discoveryUrl: `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/.well-known/openid-configuration`,
        discoveredEndpoints: {
          authorization_endpoint: metadata.authorization_endpoint,
          token_endpoint: metadata.token_endpoint,
          end_session_endpoint: metadata.end_session_endpoint || 'not provided',
        },
        authorizationUrlBase: metadata.authorization_endpoint.split('?')[0],
        finalAuthorizationUrl: authorizationUrl,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('[/api/auth/login] Redirecting to Shopify authorization endpoint', {
      timestamp: new Date().toISOString(),
    });

    // Step 6: Redirect to Shopify authorization endpoint
    return NextResponse.redirect(authorizationUrl, { status: 302 });
  } catch (error) {
    console.error('[/api/auth/login] Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(
        'An error occurred during login. Please try again.'
      )}`
    );
  }
}
