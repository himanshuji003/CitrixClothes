import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * ✅ Logout Handler
 * 
 * This endpoint clears the user's authentication session by deleting all auth cookies.
 * 
 * Security:
 * - Deletes all httpOnly cookies (cannot be accessed by JavaScript)
 * - Clears PKCE, state, nonce, and all token cookies
 * - Redirect happens server-side (atomic operation)
 * - No token exposure, clean session termination
 * - Works even if cookies already deleted (idempotent)
 * 
 * Flow:
 * 1. Receive POST request from authenticated user
 * 2. Delete all authentication cookies
 * 3. Redirect to homepage
 * 
 * Client-side:
 * - Called by AuthContext.logout()
 * - AuthContext clears user state
 * - UI updates to show login buttons
 * 
 * Reference: https://shopify.dev/docs/api/customer-account/latest
 */

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    console.log('[/api/auth/logout] Logout request received', {
      timestamp: new Date().toISOString(),
    });

    // Step 1: Delete all authentication cookies
    const cookieStore = await cookies();

    // Delete OAuth/token cookies
    cookieStore.delete('shopify_customer_access_token');
    cookieStore.delete('shopify_customer_refresh_token');
    cookieStore.delete('shopify_customer_id_token');

    // Delete temporary PKCE and security cookies (just in case)
    cookieStore.delete('pkce_verifier');
    cookieStore.delete('oauth_state');
    cookieStore.delete('oauth_nonce');

    // Delete legacy customer_token cookie if it exists
    cookieStore.delete('customer_token');

    console.log('[/api/auth/logout] All authentication cookies cleared', {
      timestamp: new Date().toISOString(),
    });

    // Step 2: Redirect to homepage
    // Using 303 (See Other) status for POST redirects (RFC 7231)
    // This ensures the browser performs a GET on the redirect target
    return NextResponse.redirect(new URL('/', req.url), { status: 303 });
  } catch (error) {
    console.error('[/api/auth/logout] Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Even on error, try to redirect home (logout should be safe)
    // This ensures logout is resilient to edge cases
    return NextResponse.redirect(new URL('/', req.url), { status: 303 });
  }
}
