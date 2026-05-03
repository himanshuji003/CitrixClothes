'use client';

import React from 'react';
import { useAuthContext } from '@/lib/auth-context';
import { OrderCard } from '@/components/auth/OrderCard';
import { getMockCustomerOrders } from '@/data/mock-orders';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * OrdersContent Component
 * Client component that displays list of customer orders
 * - Uses mock data (prepares for Shopify Customer API integration)
 * - Shows customer name and email
 * - Responsive grid layout (1 column on mobile, adapts on larger screens)
 */
export const OrdersContent: React.FC = () => {
  const { customer } = useAuthContext();
  const orders = getMockCustomerOrders();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header Section */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Orders</h1>
              {customer && (
                <p className="text-sm text-slate-600 mt-2">
                  Welcome back, <span className="font-medium text-slate-900">{customer.firstName || 'Customer'}</span>
                </p>
              )}
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2 w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <svg
                  className="w-8 h-8 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Orders Yet</h2>
            <p className="text-slate-600 mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Link href="/collections">
              <Button>Browse Collections</Button>
            </Link>
          </div>
        ) : (
          /* Orders Grid */
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {/* Order Count */}
            <div className="mb-2">
              <p className="text-sm font-medium text-slate-600">
                Showing <span className="font-semibold text-slate-900">{orders.length}</span> order
                {orders.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Orders List */}
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {orders.length > 0 && (
        <div className="border-t border-slate-200 bg-white mt-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Need Help?</h3>
                <p className="text-sm text-slate-600">
                  Contact our customer support team for order tracking and assistance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Account Info</h3>
                {customer && (
                  <p className="text-sm text-slate-600">
                    Email: <span className="font-medium">{customer.email}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
