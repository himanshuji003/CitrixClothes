import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Proxy for route protection
 * NOTE: Proxy runs on the server and doesn't have access to client-side localStorage.
 * Route protection is handled client-side in app/account/layout.tsx using useAuthContext.
 * This proxy acts as a fallback, but for now it's disabled to allow proper client-side hydration.
 */
export function proxy(request: NextRequest) {
  // Proxy route protection disabled - using client-side protection instead
  // This allows the auth context to hydrate before checking authentication
  return NextResponse.next();
}

// Configure which routes to apply proxy to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};