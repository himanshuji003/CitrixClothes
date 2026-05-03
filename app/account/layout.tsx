'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/auth-context';

/**
 * Account Layout
 * Protected layout for /account/** routes
 * - Client-side: Checks auth context, redirects to /login if no token
 * - Waits for hydration before rendering children (prevents hydration mismatch)
 */
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { accessToken } = useAuthContext();

  const [isHydrated, setIsHydrated] = React.useState(false);

  // Hydrate and check auth
  useEffect(() => {
    setIsHydrated(true);

    // After hydration, if no token, redirect to login
    if (!accessToken) {
      router.push('/login');
    }
  }, [accessToken, router]);

  // Show nothing until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // If no token after hydration, don't render (redirect will happen in useEffect)
  if (!accessToken) {
    return null;
  }

  return <>{children}</>;
}
