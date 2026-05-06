'use client';

import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthErrorAlertProps {
  error: string | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  showRetry?: boolean;
}

/**
 * Reusable Auth Error Alert Component
 * 
 * Displays OAuth or authentication errors with optional retry action.
 * Used in login, signup, and account pages.
 * 
 * Features:
 * - Clean, professional error display
 * - Optional dismiss button
 * - Optional retry button for recoverable errors
 * - Accessible and mobile-friendly
 */
export function AuthErrorAlert({
  error,
  onDismiss,
  onRetry,
  showRetry = true,
}: AuthErrorAlertProps) {
  if (!error) return null;

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-900">Authentication Error</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          
          {/* Actions */}
          {(onRetry || onDismiss) && (
            <div className="flex gap-2 mt-3">
              {showRetry && onRetry && (
                <Button
                  onClick={onRetry}
                  size="sm"
                  variant="outline"
                  className="text-red-700 border-red-200 hover:bg-red-100"
                >
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button
                  onClick={onDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-red-700 hover:bg-red-100"
                >
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Close Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 flex-shrink-0"
            aria-label="Close error message"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
