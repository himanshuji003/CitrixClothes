'use client';

import React, { useEffect, useState } from 'react';

/**
 * Loading Bar Component
 * 
 * Displays an animated progress bar at the top of the page.
 * Useful for long-running operations like OAuth redirects.
 * 
 * Features:
 * - Smooth animation
 * - Auto-hides after completion
 * - Mobile-friendly
 * 
 * Usage:
 * <LoadingBar isVisible={isLoading} />
 */
export function LoadingBar({ isVisible = true }: { isVisible?: boolean }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setWidth(0);
      return;
    }

    setWidth(10);

    // Gradually increase progress
    const intervals = [
      setTimeout(() => setWidth(30), 100),
      setTimeout(() => setWidth(60), 500),
      setTimeout(() => setWidth(90), 1500),
    ];

    return () => intervals.forEach(clearTimeout);
  }, [isVisible]);

  return (
    <div
      className={`fixed top-0 left-0 h-1 bg-gradient-to-r from-brand-700 to-brand-500 transition-all duration-300 z-50 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ width: `${width}%` }}
      role="progressbar"
      aria-valuenow={width}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
