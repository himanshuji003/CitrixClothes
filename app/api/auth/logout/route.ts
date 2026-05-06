import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * ✅ PHASE 6: Logout Handler
 * 
 * This endpoint clears the user's authentication session by deleting the httpOnly cookie.
 * 
 * Security:
 * - Deletes the httpOnly cookie (cannot be accessed by JavaScript)
 * - Redirect happens server-side (atomic operation)
 * - No token exposure, clean session termination
 * - Works even if cookie already deleted (idempotent)
 * 
 * Flow:
 * 1. Receive POST request from authenticated user
 * 2. Delete customer_token cookie
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

    // Step 1: Delete the customer token cookie
    const cookieStore = await cookies();
    cookieStore.delete('customer_token');

    console.log('[/api/auth/logout] Cookie deleted, redirecting to home');

    // Step 2: Redirect to homepage
    // Using 303 (See Other) status for POST redirects (RFC 7231)
    return NextResponse.redirect(new URL('/', req.url), { status: 303 });
  } catch (error) {
    console.error('[/api/auth/logout] Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Even on error, try to redirect home (logout should be safe)
    // This ensures logout is resilient to edge cases
    return NextResponse.redirect(new URL('/', req.url), { status: 303 });
  }
}
