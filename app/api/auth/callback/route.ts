import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateEnv } from '@/lib/env-validation';

/**
 * ✅ PHASE 3: OAuth Callback Handler
 * 
 * This endpoint handles the OAuth callback from Shopify Customer Account API.
 * 
 * Security Flow:
 * 1. User authorizes on Shopify's secure OAuth page
 * 2. Shopify redirects to /api/auth/callback?code=XYZ
 * 3. We exchange code + client_secret for access token (server-side)
 * 4. Access token stored in secure httpOnly cookie (never exposed to browser)
 * 5. Redirect to /account dashboard
 * 
 * Why httpOnly Cookie?
 * - JavaScript cannot access it (prevents XSS attacks)
 * - Only sent over HTTPS with Secure flag
 * - Automatically sent with every request (no manual handling)
 * - Server-side validation ensures security
 * 
 * Why exchange code on server?
 * - client_secret NEVER sent to browser (kept secret)
 * - Code is single-use and time-limited
 * - Token exchange is server-to-server (Shopify's servers)
 * 
 * Reference: https://shopify.dev/docs/api/customer-account/latest
 */

interface TokenResponse {
  access_token: string;
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

    console.log('[OAuth Callback] Request received', {
      url: req.url,
      timestamp: new Date().toISOString(),
    });

    // Step 1: Extract authorization code from query params
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Check for OAuth errors from Shopify
    if (error) {
      const message = errorDescription || error;
      console.error('[OAuth Callback] Shopify returned error:', { error, message });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/login?error=${encodeURIComponent(message)}`
      );
    }

    // Validate authorization code exists
    if (!code) {
      console.error('[OAuth Callback] Missing authorization code');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/login?error=${encodeURIComponent('Missing authorization code')}`
      );
    }

    console.log('[OAuth Callback] Authorization code received', {
      codeLength: code.length,
      hasState: !!state,
    });

    // Step 2: Validate environment variables
    const clientId = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;
    const shopId = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!clientId || !shopId || !baseUrl) {
      console.error('[OAuth Callback] Missing required environment variables', {
        hasClientId: !!clientId,
        hasShopId: !!shopId,
        hasBaseUrl: !!baseUrl,
      });
      return NextResponse.json(
        { error: 'Server configuration error. Contact support.' },
        { status: 500 }
      );
    }

    // Step 3: Retrieve stored code_verifier from PKCE cookie
    // This was stored by /api/auth/store-pkce when user initiated login
    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get('pkce_verifier')?.value;

    if (!codeVerifier) {
      console.error('[OAuth Callback] Missing PKCE code_verifier from cookie');
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent('PKCE verification failed - session expired')}`
      );
    }

    console.log('[OAuth Callback] Retrieved PKCE code_verifier from secure cookie', {
      verifierLength: codeVerifier.length,
      timestamp: new Date().toISOString(),
    });

    // Step 4: Exchange code for access token using PKCE
    // NO client_secret needed - PKCE provides security instead
    const redirectUri = `${baseUrl}/api/auth/callback`;

    console.log('[OAuth Callback] Exchanging authorization code for token with PKCE', {
      shopId,
      clientId: clientId.substring(0, 10) + '***', // Log partial for security
      redirectUri,
      codeChallengeMethod: 'S256',
      timestamp: new Date().toISOString(),
    });

    const tokenResponse = await fetch(
      `https://shopify.com/${shopId}/auth/oauth/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          code: code,
          code_verifier: codeVerifier, // ✅ PKCE: Send code_verifier instead of client_secret
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      }
    );

    // Step 4: Parse token response
    const tokenData: TokenResponse | ErrorResponse = await tokenResponse.json();

    // Check if token exchange was successful
    if (!tokenResponse.ok) {
      const errorData = tokenData as ErrorResponse;
      console.error('[OAuth Callback] Token exchange failed', {
        status: tokenResponse.status,
        error: errorData.error,
        description: errorData.error_description,
      });
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent(errorData.error_description || 'Token exchange failed')}`
      );
    }

    const { access_token, expires_in } = tokenData as TokenResponse;

    if (!access_token) {
      console.error('[OAuth Callback] No access token in response');
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent('Failed to obtain access token')}`
      );
    }

    console.log('[OAuth Callback] Token exchange successful', {
      tokenLength: access_token.length,
      expiresIn: expires_in,
    });

    // Step 6: Store token in secure httpOnly cookie
    // This cookie will be sent with every request automatically
    // Browser JavaScript cannot access it (XSS protection)

    cookieStore.set('customer_token', access_token, {
      // Security flags
      httpOnly: true, // ⚠️ JavaScript cannot access this cookie
      secure: process.env.NODE_ENV === 'production', // Only sent over HTTPS in production
      sameSite: 'lax', // CSRF protection
      path: '/',
      // Token expiry
      maxAge: expires_in ? expires_in - 60 : 24 * 60 * 60, // Subtract 60s buffer
    });

    // Step 7: Clear PKCE verifier cookie (no longer needed)
    // This improves security by removing the temporary PKCE data
    cookieStore.delete('pkce_verifier');

    console.log('[OAuth Callback] Token stored in secure cookie, PKCE verifier cleared', {
      secure: process.env.NODE_ENV === 'production',
      maxAge: expires_in ? expires_in - 60 : 24 * 60 * 60,
      timestamp: new Date().toISOString(),
    });

    // Step 8: Redirect to account/dashboard
    // User is now authenticated
    console.log('[OAuth Callback] Authentication successful with PKCE, redirecting to /account');

    return NextResponse.redirect(`${baseUrl}/account`, {
      status: 302,
    });
  } catch (error) {
    // Step 7: Error handling
    console.error('[OAuth Callback] Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      console.error('[OAuth Callback] NEXT_PUBLIC_BASE_URL not configured');
      return NextResponse.json(
        { error: 'Configuration error. Please contact support.' },
        { status: 500 }
      );
    }
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent('An unexpected error occurred. Please try again.')}`
    );
  }
}
