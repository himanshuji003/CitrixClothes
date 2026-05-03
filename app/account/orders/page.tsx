import React from 'react';
import { OrdersContent } from '@/components/auth/OrdersContent';

/**
 * Orders Page
 * Server component that handles metadata
 * Actual content rendered by OrdersContent client component
 */
export const metadata = {
  title: 'My Orders - Suitique Designs',
  description: 'View and track your Suitique Designs orders.',
};

export default function OrdersPage() {
  return <OrdersContent />;
}
