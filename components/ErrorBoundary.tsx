'use client';

import React, { ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * 
 * Catches client-side errors in child components and displays a friendly error UI.
 * Allows users to retry the operation.
 * 
 * Usage:
 * <ErrorBoundary fallback={(error, retry) => <CustomError error={error} onRetry={retry} />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('[ErrorBoundary] Caught error:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-cream-50 px-4">
          <div className="max-w-md">
            <div className="bg-white rounded-lg border border-red-200 p-8">
              <div className="flex gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div>
                  <h2 className="font-semibold text-red-900">Something went wrong</h2>
                  <p className="text-sm text-red-700 mt-1 break-words">{this.state.error.message}</p>
                </div>
              </div>
              <Button
                onClick={this.handleRetry}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
