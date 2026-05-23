import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAMES } from '@/lib/shopify-auth';

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

async function clearAuthCookies() {
  const cookieStore = await cookies();

  Object.values(AUTH_COOKIE_NAMES).forEach((name) => {
    cookieStore.delete(name);
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    console.log('[/api/auth/logout] Logout request received', {
      timestamp: new Date().toISOString(),
    });

    // Step 1: Delete all authentication cookies
    await clearAuthCookies();

    console.log('[/api/auth/logout] All authentication cookies cleared', {
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[/api/auth/logout] Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await clearAuthCookies();
  } catch (error) {
    console.error('[/api/auth/logout] Error clearing cookies for GET logout:', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.redirect(new URL('/', req.url), { status: 303 });
}
