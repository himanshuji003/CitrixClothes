import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * ✅ PHASE 3: Session Validation Endpoint
 * 
 * This endpoint verifies if the user has a valid session.
 * Called by AuthContext on app load to restore user session.
 * 
 * Flow:
 * 1. Check if customer_token cookie exists
 * 2. If exists, verify token is still valid
 * 3. Return user info or null if invalid
 * 
 * Security:
 * - Token is stored in httpOnly cookie (server retrieves automatically)
 * - Token is never exposed to client JavaScript
 * - Only returns public user info, not token itself
 */

interface SessionResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  } | null;
}

export async function GET(req: NextRequest): Promise<NextResponse<SessionResponse>> {
  try {
    console.log('[Session] Validating session', {
      timestamp: new Date().toISOString(),
    });

    // Step 1: Get token from httpOnly cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_token')?.value;

    // No token = not authenticated
    if (!token) {
      console.log('[Session] No token found - user not authenticated');
      return NextResponse.json({ user: null });
    }

    console.log('[Session] Token found, length:', token.length);

    // Step 2: Verify token with Shopify
    // In a real implementation, you would:
    // 1. Make a request to Shopify Customer Account API with the token
    // 2. If successful, get user info
    // 3. If fails (401), token is invalid/expired
    // 4. Cache user info in database or session store
    
    // TODO: Phase 3+ Implementation
    // For now, we assume token is valid if it exists
    // Add token refresh logic if expired

    console.log('[Session] Token validation placeholder - implement in Phase 3+');

    // Placeholder: return null until Phase 3+ is implemented
    // In Phase 3+, this would:
    // 1. Verify token is not expired
    // 2. Query Shopify API to get user info
    // 3. Return user data

    return NextResponse.json({ user: null });
  } catch (error) {
    console.error('[Session] Error validating session:', {
      error: error instanceof Error ? error.message : String(error),
    });

    // On error, return no user (user not authenticated)
    return NextResponse.json({ user: null });
  }
}
