import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware for route protection
 * NOTE: Middleware runs on the server and doesn't have access to client-side localStorage.
 * Route protection is handled client-side in app/account/layout.tsx using useAuthContext.
 * This middleware acts as a fallback, but for now it's disabled to allow proper client-side hydration.
 */
export function middleware(request: NextRequest) {
  // Middleware route protection disabled - using client-side protection instead
  // This allows the auth context to hydrate before checking authentication
  return NextResponse.next();
}

// Configure which routes to apply middleware to
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

