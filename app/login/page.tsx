'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthErrorAlert } from '@/components/AuthErrorAlert';
import { LoadingBar } from '@/components/LoadingBar';
import { Loader2 } from 'lucide-react';

/**
 * 🔐 OAuth Login Page
 * 
 * User Flow:
 * 1. User visits /login
 * 2. Click "Login with Shopify" button
 * 3. Redirects to Shopify's hosted auth page (getShopifyLoginUrl())
 * 4. User enters email/password on Shopify's secure server
 * 5. Shopify redirects back to /api/auth/callback with authorization code
 * 6. Access token is obtained and stored in httpOnly cookie (Phase 3)
 * 7. User is redirected to dashboard
 * 
 * This implements the first part of OAuth flow: login initiation
 * Token exchange happens in Phase 3
 */

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle login button click
   * Redirects to /api/auth/login server-side route which handles:
   * 1. PKCE generation
   * 2. State and nonce generation
   * 3. Secure cookie storage
   * 4. Redirect to Shopify OAuth endpoint
   */
  const handleLogin = async () => {
    console.log("LOGIN CLICKED");
    setIsLoading(true);
    setError(null);

    try {
      console.log('[Login Page] Starting OAuth login flow via /api/auth/login');

      // Redirect to server-side login route
      // The /api/auth/login route will:
      // 1. Generate PKCE parameters
      // 2. Generate state and nonce
      // 3. Store them in secure cookies
      // 4. Redirect to Shopify authorization endpoint
      window.location.href = '/api/auth/login';
      console.log('[Login Page] Redirected to /api/auth/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initiate login';
      console.error('[Login Page] Login failed with error:', {
        error: message,
        errorType: err instanceof Error ? err.constructor.name : typeof err,
        fullError: err,
        timestamp: new Date().toISOString(),
      });
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 px-4">
      <LoadingBar isVisible={isLoading} />
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl text-brand-900 mb-2">Login</h1>
          <p className="text-muted-foreground">Sign in to your Suitique account</p>
        </div>

        {/* Error Alert */}
        <AuthErrorAlert 
          error={error} 
          onDismiss={() => setError(null)}
          onRetry={handleLogin}
          showRetry={true}
        />

        {/* Login Card */}
        <div className="bg-white rounded-lg border border-border p-6 md:p-8">
          {/* Info Text */}
          <p className="text-sm text-muted-foreground mb-6">
             OAuth Authentication — Secure login via Shopify Customer Account API.
            <br />
            <span className="text-xs mt-2 inline-block">
              Your login credentials are never stored on our servers.
            </span>
          </p>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            size="lg"
            className="w-full mb-4 bg-brand-700 hover:bg-brand-900 text-cream-50 h-12 tracking-[0.22em] uppercase text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Redirecting to Shopify...
              </>
            ) : (
              'Login with Shopify'
            )}
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-white text-muted-foreground">or</span>
            </div>
          </div>

          {/* Signup Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="text-brand-700 hover:text-brand-900 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-brand-700">
            ← Back to home
          </Link>
        </div>


      </div>
    </div>
  );
}
