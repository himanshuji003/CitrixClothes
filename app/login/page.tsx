import React from 'react';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { getStoredToken } from '@/lib/auth-utils';

/**
 * Login Page
 * - Displays centered login form
 * - If user is already logged in (token exists), redirect to /account/orders
 * - Mobile-responsive layout
 */
export const metadata = {
  title: 'Sign In - Suitique Designs',
  description: 'Sign in to your Suitique Designs account to view orders and manage your account.',
};

export default function LoginPage() {
  // Server-side check: if token exists, redirect to orders
  const token = getStoredToken();
  if (token) {
    redirect('/account/orders');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="w-full flex justify-center">
        <LoginForm />
      </div>
    </main>
  );
}
