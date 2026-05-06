'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthErrorAlert } from '@/components/AuthErrorAlert';
import { LoadingBar } from '@/components/LoadingBar';
import { getShopifyLoginUrl } from '@/lib/shopify-auth';
import { Loader2 } from 'lucide-react';

/**
 * 📝 OAuth Signup Page
 * 
 * User Flow:
 * 1. User visits /signup
 * 2. Click "Sign up with Shopify" button
 * 3. Redirects to Shopify's hosted signup page (getShopifyLoginUrl())
 * 4. User creates account on Shopify's secure server
 * 5. Shopify redirects back to /api/auth/callback with authorization code
 * 6. Access token is obtained and stored in httpOnly cookie (Phase 3)
 * 7. User is redirected to dashboard
 * 
 * NOTE: OAuth handles both signup and login via the same flow.
 * If user doesn't exist, Shopify creates account automatically.
 */

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle signup button click
   * Generates OAuth URL with PKCE, stores code_verifier, then redirects to Shopify
   */
  const handleSignup = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get authorization URL and PKCE parameters
      // Note: Shopify handles both signup and login via the same OAuth endpoint
      const { loginUrl, codeVerifier } = await getShopifyLoginUrl();

      console.log('[Signup Page] Got PKCE parameters from server', {
        hasLoginUrl: !!loginUrl,
        hasCodeVerifier: !!codeVerifier,
        timestamp: new Date().toISOString(),
      });

      // Step 2: Store code_verifier in secure cookie
      const storeResponse = await fetch('/api/auth/store-pkce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeVerifier }),
      });

      if (!storeResponse.ok) {
        throw new Error('Failed to store PKCE verifier');
      }

      console.log('[Signup Page] PKCE verifier stored, redirecting to Shopify OAuth');

      // Step 3: Redirect user to Shopify's hosted auth page
      // Shopify handles signup automatically if user is new
      window.location.href = loginUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initiate signup';
      console.error('[Signup Page] Error:', message);
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
          <h1 className="font-serif text-4xl text-brand-900 mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join Suitique's exclusive collection</p>
        </div>

        {/* Error Alert */}
        <AuthErrorAlert 
          error={error} 
          onDismiss={() => setError(null)}
          onRetry={handleSignup}
          showRetry={true}
        />

        {/* Signup Card */}
        <div className="bg-white rounded-lg border border-border p-6 md:p-8">
          {/* Benefits */}
          <div className="mb-6">
            <p className="text-sm font-medium text-brand-900 mb-3">Benefits of joining:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-brand-700 font-bold mt-0.5">✓</span>
                <span>Save your favorite items to wishlist</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-700 font-bold mt-0.5">✓</span>
                <span>Track your orders and shipments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-700 font-bold mt-0.5">✓</span>
                <span>Receive exclusive offers and updates</span>
              </li>
            </ul>
          </div>

          {/* Info Text */}
          <p className="text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
            ✅ OAuth Authentication — Secure signup via Shopify Customer Account API.
            <br />
            <span className="text-xs mt-2 inline-block">
              Your personal information is protected by Shopify's security standards.
            </span>
          </p>

          {/* Signup Button */}
          <Button
            onClick={handleSignup}
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
              'Sign Up with Shopify'
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

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-700 hover:text-brand-900 font-medium">
                Login
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
