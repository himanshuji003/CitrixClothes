import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateEnv } from '@/lib/env-validation';
import {
  fetchOpenIDMetadata,
  getCookieSecurity,
  getRequestBaseUrl,
  getShopifyTokenHeaders,
} from '@/lib/shopify-auth';

/**
 * ✅ OAuth Callback Handler
 * 
 * This endpoint handles the OAuth callback from Shopify after user authorization.
 * 
 * Security Flow:
 * 1. User authorizes on Shopify's secure OAuth page
 * 2. Shopify redirects to /api/auth/callback?code=XYZ&state=ABC
 * 3. Validate returned state matches stored state (CSRF protection)
 * 4. Exchange code + code_verifier for tokens using PKCE
 * 5. Store access_token, refresh_token, id_token in secure httpOnly cookies
 * 6. Clear temporary PKCE/state/nonce cookies
 * 7. Redirect to /account dashboard
 * 
 * Why httpOnly Cookie?
 * - JavaScript cannot access it (prevents XSS attacks)
 * - Only sent over HTTPS with Secure flag
 * - Automatically sent with every request (no manual handling)
 * - Server-side validation ensures security
 * 
 * Why exchange code on server?
 * - client_secret NEVER sent to browser (kept secret via environment variable)
 * - Code is single-use and time-limited
 * - Token exchange is server-to-server (Shopify's servers)
 * 
 * Reference: https://shopify.dev/docs/api/customer-account/latest
 */

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
}

interface ErrorResponse {
  error: string;
  error_description?: string;
}

export async function GET(req: NextRequest) {
  try {
    // Validate environment variables early
    validateEnv();

    // Step 1: Extract authorization code and state from query params
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const returnedState = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (process.env.NODE_ENV !== 'production') {
      console.log('[OAuth Callback] ✅ Callback request received from Shopify', {
        hasCode: !!code,
        codeLength: code?.length || 0,
        hasStateParam: !!returnedState,
        stateParamLength: returnedState?.length || 0,
        hasError: !!error,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('[OAuth Callback] Callback query params received', {
      hasCode: !!code,
      hasStateParam: !!returnedState,
      hasError: !!error,
      timestamp: new Date().toISOString(),
    });

    // Check for OAuth errors from Shopify
    if (error) {
      const message = errorDescription || error;
      console.error('[OAuth Callback] Shopify returned error', {
        errorCode: 'SHOPIFY_OAUTH_ERROR',
        error: error,
        description: message,
        timestamp: new Date().toISOString(),
      });
      const baseUrl = getRequestBaseUrl(req);
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent(message)}`
      );
    }

    // Validate authorization code exists
    if (!code) {
      console.error('[OAuth Callback] Missing authorization code', {
        errorCode: 'MISSING_AUTHORIZATION_CODE',
        hasCode: !!code,
        timestamp: new Date().toISOString(),
      });
      const baseUrl = getRequestBaseUrl(req);
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent('Authorization code not received from Shopify')}`
      );
    }

    console.log('[OAuth Callback] Authorization code received', {
      codeLength: code.length,
      hasState: !!returnedState,
    });

    // Step 2: Validate state for CSRF protection
    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;
    const stateMatches = returnedState === storedState;

    if (process.env.NODE_ENV !== 'production') {
      console.log('[OAuth Callback] 🔐 State Validation Check:', {
        hasStateParam: !!returnedState,
        hasStoredStateCookie: !!storedState,
        stateParamLength: returnedState?.length || 0,
        storedStateLength: storedState?.length || 0,
        stateMatches: stateMatches,
        timestamp: new Date().toISOString(),
      });
    }

    if (!storedState || !stateMatches) {
      console.error('[OAuth Callback] State validation failed', {
        errorCode: 'STATE_MISMATCH',
        hasStoredStateCookie: !!storedState,
        hasStateParam: !!returnedState,
        stateMatches: stateMatches,
        timestamp: new Date().toISOString(),
      });
      const baseUrl = getRequestBaseUrl(req);
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent('Session validation failed - please login again')}`
      );
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[OAuth Callback] ✅ State validation successful', {
        stateMatches: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Step 3: Retrieve stored PKCE code_verifier from cookie
    const codeVerifier = cookieStore.get('pkce_verifier')?.value;
    const hasCodeVerifierCookie = !!codeVerifier;

    if (process.env.NODE_ENV !== 'production') {
      console.log('[OAuth Callback] 🔑 PKCE Code Verifier Check:', {
        hasCodeVerifierCookie: hasCodeVerifierCookie,
        codeVerifierLength: codeVerifier?.length || 0,
        timestamp: new Date().toISOString(),
      });
    }

    if (!codeVerifier) {
      console.error('[OAuth Callback] PKCE verification failed', {
        errorCode: 'PKCE_VERIFIER_NOT_FOUND',
        hasCodeVerifierCookie: false,
        reason: 'Session may have expired (10-minute limit) or cookie was not set during login',
        timestamp: new Date().toISOString(),
      });
      const baseUrl = getRequestBaseUrl(req);
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent('Session expired - please login again')}`
      );
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[OAuth Callback] ✅ PKCE code_verifier retrieved from secure cookie', {
        verifierLength: codeVerifier.length,
        timestamp: new Date().toISOString(),
      });
    }

    // Step 4: Get environment variables for token exchange
    const baseUrl = getRequestBaseUrl(req);
    const clientId = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;

    if (!baseUrl || !clientId) {
      console.error('[OAuth Callback] Environment configuration error', {
        errorCode: 'MISSING_ENV_VARIABLES',
        hasBaseUrl: !!baseUrl,
        hasClientId: !!clientId,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { error: 'Server configuration error. Missing OAuth environment variables.' },
        { status: 500 }
      );
    }

    // Step 5: Fetch OpenID metadata to get token endpoint
    const metadata = await fetchOpenIDMetadata();

    console.log('[OAuth Callback] Retrieved token endpoint from discovery', {
      tokenEndpoint: metadata.token_endpoint,
      timestamp: new Date().toISOString(),
    });

    // Step 6: Exchange code for access token using PKCE
    // NO client_secret needed - PKCE provides security instead
    const redirectUri = `${baseUrl}/api/auth/callback`;

    if (process.env.NODE_ENV !== 'production') {
      console.log('[OAuth Callback] 🔄 Token Exchange Preparation:', {
        redirectUri: redirectUri,
        redirectUriIsHttps: redirectUri.startsWith('https://'),
        codeLength: code.length,
        verifierLength: codeVerifier.length,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('[OAuth Callback] Exchanging authorization code for token with PKCE', {
      clientId: clientId.substring(0, 10) + '***',
      redirectUri: redirectUri,
      codeChallengeMethod: 'S256',
      codeLength: code.length,
      timestamp: new Date().toISOString(),
    });

    // ✅ Shopify Customer Account OAuth requires application/x-www-form-urlencoded
    // NOT JSON. This is a public-client PKCE flow (no client_secret sent).
    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      code: code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier, // ✅ PKCE: Send code_verifier instead of client_secret
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('[OAuth Callback] Token exchange request body (form-urlencoded):', {
        grant_type: 'authorization_code',
        client_id: clientId.substring(0, 10) + '***',
        code: 'present',
        redirect_uri: redirectUri,
        code_verifier: 'present (length: ' + codeVerifier.length + ')',
        timestamp: new Date().toISOString(),
      });
    }

    const tokenResponse = await fetch(metadata.token_endpoint, {
      method: 'POST',
      headers: getShopifyTokenHeaders(baseUrl),
      body: tokenBody.toString(),
    });

    // Step 7: Parse token response
    let tokenData: TokenResponse | ErrorResponse;

    try {
      tokenData = await tokenResponse.json();
    } catch (parseError) {
      console.error('[OAuth Callback] Failed to parse token response', {
        errorCode: 'INVALID_JSON_RESPONSE',
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: parseError instanceof Error ? parseError.message : String(parseError),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent('Invalid response from authentication server')}`
      );
    }

    console.log('[OAuth Callback] Token response received', {
      status: tokenResponse.status,
      hasAccessToken: 'access_token' in tokenData,
      hasRefreshToken: 'refresh_token' in tokenData,
      hasIdToken: 'id_token' in tokenData,
      timestamp: new Date().toISOString(),
    });

    // Check if token exchange was successful
    if (!tokenResponse.ok) {
      const errorData = tokenData as ErrorResponse;
      const errorCode = errorData.error || 'UNKNOWN_ERROR';
      console.error('[OAuth Callback] Token exchange failed', {
        errorCode: 'TOKEN_EXCHANGE_FAILED',
        shopifyError: errorCode,
        status: tokenResponse.status,
        description: errorData.error_description,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent(
          errorData.error_description || 'Authentication failed'
        )}`
      );
    }

    const { access_token, refresh_token, id_token, expires_in } = tokenData as TokenResponse;

    if (!access_token) {
      console.error('[OAuth Callback] No access token in response', {
        errorCode: 'MISSING_ACCESS_TOKEN',
        responseKeys: Object.keys(tokenData),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent('Failed to obtain access token')}`
      );
    }

    // ✅ Log only safe info (never log actual token values or prefixes)
    console.log('[OAuth Callback] Token received from Shopify:', {
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token,
      hasIdToken: !!id_token,
      expiresIn: expires_in,
      tokenType: (tokenData as TokenResponse).token_type || 'Bearer',
      timestamp: new Date().toISOString(),
    });

    // Step 8: Store tokens in secure httpOnly cookies
    // These cookies will be sent with every request automatically
    // Browser JavaScript cannot access them (XSS protection)

    // ✅ Detect HTTPS (including ngrok) from BASE_URL for cookie security
    const isHttpsUrl = baseUrl.startsWith('https://');
    const cookieSecurity = getCookieSecurity(baseUrl);

    if (process.env.NODE_ENV !== 'production') {
      console.log('[OAuth Callback] 🍪 Cookie Configuration:', {
        baseUrl: baseUrl,
        isHttpsUrl: isHttpsUrl,
        NODE_ENV: process.env.NODE_ENV,
        secureFlagWillBe: cookieSecurity.secure,
        timestamp: new Date().toISOString(),
      });
    }

    const maxAge = expires_in ? expires_in - 60 : 24 * 60 * 60; // Subtract 60s buffer

    cookieStore.set('shopify_customer_access_token', access_token, {
      httpOnly: true,
      secure: cookieSecurity.secure,
      sameSite: cookieSecurity.sameSite,
      path: '/',
      maxAge: maxAge,
    });

    if (refresh_token) {
      cookieStore.set('shopify_customer_refresh_token', refresh_token, {
        httpOnly: true,
        secure: cookieSecurity.secure,
        sameSite: cookieSecurity.sameSite,
        path: '/',
        maxAge: 365 * 24 * 60 * 60, // 1 year
      });
    }

    if (id_token) {
      cookieStore.set('shopify_customer_id_token', id_token, {
        httpOnly: true,
        secure: cookieSecurity.secure,
        sameSite: cookieSecurity.sameSite,
        path: '/',
        maxAge: maxAge,
      });
    }

    // Step 9: Clear temporary PKCE and security cookies (AFTER token exchange)
    cookieStore.delete('pkce_verifier');
    cookieStore.delete('oauth_state');
    cookieStore.delete('oauth_nonce');

    console.log('[OAuth Callback] Authentication complete - tokens stored securely', {
      action: 'TOKENS_STORED',
      tokensSet: {
        accessToken: !!access_token,
        refreshToken: !!refresh_token,
        idToken: !!id_token,
      },
      temporarysCleaned: true,
      secure: cookieSecurity.secure,
      timestamp: new Date().toISOString(),
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('[OAuth Callback] 🔐 Token Storage Verification:', {
        accessTokenLength: access_token?.length || 0,
        accessTokenPrefix: access_token?.slice(0, 8) || 'N/A',
        refreshTokenExists: !!refresh_token,
        idTokenExists: !!id_token,
        message: 'Tokens are about to be stored in cookies - they will be available after redirect',
        timestamp: new Date().toISOString(),
      });
    }

    // Step 10: Redirect to /account dashboard
    // Profile completion check will happen client-side after tokens are established
    console.log('[OAuth Callback] Redirecting to account dashboard', {
      baseUrl: baseUrl,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.redirect(`${baseUrl}/account`, {
      status: 302,
    });
  } catch (error) {
    console.error('[OAuth Callback] Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    const baseUrl = getRequestBaseUrl(req);
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent('An unexpected error occurred. Please try again.')}`
    );
  }
}
