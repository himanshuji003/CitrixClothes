'use client';

import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthErrorAlertProps {
  error?: string | null;
  message?: string;
  type?: 'error' | 'warning' | 'info';
  onDismiss?: () => void;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
}

/**
 * Reusable error/warning/info alert component
 * Used in authentication flows (login, signup, account pages)
 * 
 * Features:
 * - Dismissible with close button
 * - Optional retry button
 * - Multiple alert types (error, warning, info)
 * - Tailwind-styled with luxury design
 * - Accessible with semantic HTML
 */
export function AuthErrorAlert({
  error,
  message,
  type = 'error',
  onDismiss,
  onRetry,
  showRetry = false,
  className,
}: AuthErrorAlertProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Support both 'error' and 'message' props
  const displayMessage = error || message;

  const handleDismiss = () => {
    setIsOpen(false);
    onDismiss?.();
  };

  if (!isOpen || !displayMessage) return null;

  const bgColorMap = {
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColorMap = {
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  };

  const iconColorMap = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  const buttonColorMap = {
    error: 'bg-red-100 hover:bg-red-200 text-red-800',
    warning: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
    info: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
  };

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 mb-4',
        bgColorMap[type],
        className
      )}
    >
      <AlertCircle className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColorMap[type])} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', textColorMap[type])}>{displayMessage}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {showRetry && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              buttonColorMap[type]
            )}
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={handleDismiss}
            className={cn(
              'flex-shrink-0 inline-flex p-1 rounded-md transition-colors',
              'hover:bg-white/50',
              textColorMap[type]
            )}
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default AuthErrorAlert;
