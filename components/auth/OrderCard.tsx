'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/auth/StatusBadge';
import { Order } from '@/types';
import { formatOrderDate } from '@/lib/auth-utils';
import { ChevronDown } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  className?: string;
}

/**
 * OrderCard Component
 * Displays a single order with ID, date, status, and line items
 * Expandable on mobile for better readability
 */
export const OrderCard: React.FC<OrderCardProps> = ({ order, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={`hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-base sm:text-lg font-semibold">
              {order.orderNumber || 'Order'}
            </CardTitle>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {formatOrderDate(order.processedAt)}
            </p>
          </div>

          <div className="flex-shrink-0">
            <StatusBadge status={order.fulfillmentStatus} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order ID */}
        <div className="text-xs sm:text-sm space-y-1">
          <p className="text-slate-500 font-medium">Order ID</p>
          <p className="font-mono text-slate-700 break-all">{order.id.split('/').pop()}</p>
        </div>

        {/* Price (if available) */}
        {order.totalPrice && (
          <div className="text-xs sm:text-sm space-y-1">
            <p className="text-slate-500 font-medium">Total</p>
            <p className="text-slate-700">
              {order.currency} {order.totalPrice.toLocaleString()}
            </p>
          </div>
        )}

        {/* Line Items */}
        <div className="space-y-2">
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Items</p>

          {/* Desktop: Always show all items */}
          <div className="hidden sm:block space-y-2">
            {order.lineItems.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between text-sm p-2 bg-slate-50 rounded-md">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 line-clamp-1">{item.title}</p>
                  {item.price && (
                    <p className="text-xs text-slate-600">
                      {order.currency} {item.price.toLocaleString()}
                    </p>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-700 ml-2 flex-shrink-0">
                  x{item.quantity}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile: Expandable items */}
          <div className="sm:hidden space-y-2">
            {!isExpanded && order.lineItems.length > 0 ? (
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full flex items-center justify-between p-2 bg-slate-50 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span>{order.lineItems.length} item(s)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-2">
                {order.lineItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between text-xs p-2 bg-slate-50 rounded-md"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 line-clamp-2">{item.title}</p>
                      {item.price && (
                        <p className="text-xs text-slate-600 mt-1">
                          {order.currency} {item.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-700 ml-2 flex-shrink-0">
                      x{item.quantity}
                    </p>
                  </div>
                ))}
                {isExpanded && (
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-full p-1 text-xs text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Show less
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
