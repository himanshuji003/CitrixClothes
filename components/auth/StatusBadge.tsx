'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FulfillmentStatus } from '@/types';
import { mapFulfillmentStatus } from '@/lib/auth-utils';

interface StatusBadgeProps {
  status: FulfillmentStatus;
  className?: string;
}

/**
 * StatusBadge Component
 * Displays order fulfillment status with appropriate color coding
 * - UNFULFILLED (gray) → "Order Placed"
 * - PARTIAL (amber) → "Shipped"
 * - FULFILLED (green) → "Delivered"
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const { label, color } = mapFulfillmentStatus(status);

  return (
    <Badge
      className={`${color} font-medium px-3 py-1 ${className}`}
      variant="secondary"
    >
      {label}
    </Badge>
  );
};
