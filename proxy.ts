import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Proxy for request handling
 */
export function proxy(request: NextRequest) {
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