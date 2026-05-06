import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Store PKCE code_verifier in secure cookie
 * 
 * Called from /login page before redirecting to Shopify.
 * The code_verifier is later retrieved in /api/auth/callback.
 * 
 * PKCE Flow:
 * 1. /login generates code_verifier
 * 2. /login calls /api/auth/store-pkce to store it
 * 3. /login redirects to Shopify with code_challenge
 * 4. User authorizes on Shopify
 * 5. /api/auth/callback retrieves code_verifier from cookie
 * 6. /api/auth/callback exchanges code + code_verifier for token
 * 
 * Security:
 * - httpOnly cookie (cannot be accessed by JavaScript)
 * - Secure flag (only sent over HTTPS in production)
 * - sameSite=lax (CSRF protection)
 * - 10 minute expiry (authorization code expires quickly)
 */
export async function POST(req: NextRequest) {
  try {
    const { codeVerifier } = await req.json();

    if (!codeVerifier || typeof codeVerifier !== 'string') {
      console.error('[Store PKCE] Invalid code_verifier:', {
        hasVerifier: !!codeVerifier,
        type: typeof codeVerifier,
      });
      return NextResponse.json(
        { error: 'Invalid code_verifier' },
        { status: 400 }
      );
    }

    console.log('[Store PKCE] Storing code_verifier in secure cookie', {
      verifierLength: codeVerifier.length,
      timestamp: new Date().toISOString(),
    });

    // Store in secure httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('pkce_verifier', codeVerifier, {
      httpOnly: true, // Cannot be accessed by JavaScript (XSS protection)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      sameSite: 'lax', // CSRF protection
      path: '/',
      maxAge: 600, // 10 minutes (authorization code expires quickly)
    });

    console.log('[Store PKCE] Code_verifier stored successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Store PKCE] Error:', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: 'Failed to store PKCE verifier' },
      { status: 500 }
    );
  }
}
