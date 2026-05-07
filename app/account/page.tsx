'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthErrorAlert } from '@/components/AuthErrorAlert';

/**
 * ✅ PHASE 5: Account Dashboard
 * 
 * This page displays:
 * - User profile information (name, email)
 * - Complete order history with details
 * - Track order links
 * 
 * Data Flow:
 * 1. On mount, fetch /api/auth/me for user data
 * 2. Fetch /api/auth/orders for order history
 * 3. Display in luxury card layout with responsive design
 * 4. Show empty state if no orders
 * 5. Show error state if API fails
 */

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

interface OrderLineItem {
  title: string;
  quantity: number;
}

interface OrderTotalPrice {
  amount: string;
  currencyCode: string;
}

interface Order {
  id: string;
  name: string;
  processedAt?: string;
  financialStatus?: string | null;
  fulfillmentStatus?: string | null;
  totalPrice?: OrderTotalPrice;
  statusUrl?: string | null;
  lineItems?: OrderLineItem[];
}

function getStatusColor(
  status?: string | null,
  type?: 'financial' | 'fulfillment'
): { bg: string; text: string; dot: string } {
  const normalizedStatus = (status ?? 'unknown').toLowerCase();

  if (type === 'financial') {
    if (normalizedStatus === 'paid') return { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' };
    if (normalizedStatus === 'pending') return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
    if (normalizedStatus === 'refunded') return { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' };
    return { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' };
  }

  if (normalizedStatus === 'fulfilled') return { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' };
  if (normalizedStatus === 'unshipped') return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
  if (normalizedStatus === 'partially_fulfilled')
    return { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' };
  if (normalizedStatus === 'cancelled') return { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
  return { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' };
}

function formatCurrency(amount?: string, currency?: string): string {
  if (!amount) return '--';
  try {
    const num = parseFloat(amount);
    if (isNaN(num)) return '--';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return '--';
  }
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'Date unavailable';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date unavailable';
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Date unavailable';
  }
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          // Fetch user data
          console.log('[Account] Fetching user data from /api/account/me');
          const userResponse = await fetch('/api/account/me', {
            signal: controller.signal,
          });

          console.log('[Account] User data response status:', userResponse.status);

          if (userResponse.status === 401) {
            // Token invalid or expired, redirect to login
            console.log('[Account] ❌ Unauthorized response (401) - redirecting to login');
            clearTimeout(timeoutId);
            router.push('/login');
            return;
          }

          const userData = await userResponse.json();

          console.log('[Account] User data retrieved:', {
            hasUser: !!userData.user,
            userId: userData.user?.id,
            userEmail: userData.user?.email,
          });

          if (!userData.user) {
            console.log('[Account] ❌ No user found in response, redirecting to login');
            clearTimeout(timeoutId);
            router.push('/login');
            return;
          }

          setUser(userData.user);

          // Fetch orders data
          console.log('[Account] Fetching orders from /api/account/orders');
          const ordersResponse = await fetch('/api/account/orders', {
            signal: controller.signal,
          });

          console.log('[Account] Orders response status:', ordersResponse.status);

          const ordersData = await ordersResponse.json();

          console.log('[Account] Orders data retrieved:', {
            orderCount: ordersData.orders?.length || 0,
            hasOrders: !!ordersData.orders,
            ordersLength: ordersData.orders?.length,
          });

          clearTimeout(timeoutId);

          if (ordersData.orders) {
            setOrders(ordersData.orders);
            console.log('[Account] ✅ Successfully set', ordersData.orders.length, 'orders');
          } else {
            console.log('[Account] ⚠️  ordersData.orders is falsy:', ordersData);
          }
        } catch (err) {
          clearTimeout(timeoutId);
          throw err;
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.error('[Account] ❌ Request timeout');
          setError('Request timeout. Please refresh the page or try again.');
        } else {
          console.error('[Account] ❌ Error fetching data:', err);
          setError('Unable to load account data. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="container py-12 md:py-20">
        <div className="max-w-4xl">
          <div className="h-12 bg-gray-200 rounded animate-pulse mb-8" />
          <div className="space-y-4">
            <div className="h-40 bg-gray-100 rounded animate-pulse" />
            <div className="h-60 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-20">
      <div className="max-w-4xl">
        {/* Header */}
        <h1 className="font-serif text-4xl md:text-5xl text-brand-900 mb-2">My Account</h1>
        <p className="text-muted-foreground mb-12">Welcome, {user?.firstName}</p>

        {/* Error State */}
        <AuthErrorAlert 
          error={error} 
          onDismiss={() => setError(null)}
          onRetry={() => window.location.reload()}
          showRetry={true}
        />

        {/* User Info Section */}
        <div className="mb-12">
          <div className="bg-white border border-border rounded-lg p-6 md:p-8">
            <h2 className="text-lg font-serif text-brand-900 mb-6">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Full Name</p>
                <p className="text-base text-brand-900">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Email Address</p>
                <p className="text-base text-brand-900">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div>
          <h2 className="text-lg font-serif text-brand-900 mb-6">Order History</h2>

          {orders.length === 0 ? (
            // Empty State
            <div className="bg-cream-100 border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">No orders found.</p>
              <p className="text-sm text-muted-foreground mb-6">You haven't placed any orders yet, or your order history is not available. Check the browser console for debugging details.</p>
              <Link href="/collections" className="inline-block text-sm text-brand-900 font-medium hover:text-brand-700 transition-colors underline">
                Browse Collections →
              </Link>
            </div>
          ) : (
            // Orders Grid
            <div className="space-y-4">
              {orders.map((order) => {
                const financialStatus = getStatusColor(order.financialStatus, 'financial');
                const fulfillmentStatus = getStatusColor(order.fulfillmentStatus, 'fulfillment');
                const hasLineItems = order.lineItems && order.lineItems.length > 0;
                const hasStatusUrl = order.statusUrl && order.statusUrl.trim().length > 0;

                return (
                  <div key={order.id} className="bg-white border border-border rounded-lg p-6 md:p-8 hover:shadow-md transition-shadow">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-6 border-b border-border">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Order Number</p>
                        <p className="text-xl font-serif text-brand-900">{order.name}</p>
                        <p className="text-sm text-muted-foreground mt-2">{formatDate(order.processedAt)}</p>
                      </div>
                      <div className="mt-4 md:mt-0 text-right">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Total</p>
                        <p className="text-xl font-serif text-brand-900">{formatCurrency(order.totalPrice?.amount, order.totalPrice?.currencyCode)}</p>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-border">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Payment Status</p>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${financialStatus.bg} ${financialStatus.text}`}>
                          <span className={`w-2 h-2 rounded-full ${financialStatus.dot}`} />
                          {order.financialStatus ?? 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Fulfillment Status</p>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${fulfillmentStatus.bg} ${fulfillmentStatus.text}`}>
                          <span className={`w-2 h-2 rounded-full ${fulfillmentStatus.dot}`} />
                          {order.fulfillmentStatus ?? 'Unknown'}
                        </div>
                      </div>
                    </div>

                    {/* Line Items */}
                    {hasLineItems && (
                      <div className="mb-6 pb-6 border-b border-border">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Items</p>
                        <div className="space-y-2">
                          {order.lineItems!.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-brand-900">{item.title}</span>
                              <span className="text-muted-foreground">Qty: {item.quantity}</span>
                            </div>
                          ))}
                          {order.lineItems!.length > 3 && (
                            <p className="text-sm text-muted-foreground mt-2">+{order.lineItems!.length - 3} more items</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Track Order Button */}
                    {hasStatusUrl && (
                      <div className="flex justify-end">
                        <a
                          href={order.statusUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm font-medium text-brand-900 hover:text-brand-700 transition-colors group"
                        >
                          Track Order
                          <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/" className="text-sm text-muted-foreground hover:text-brand-700 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
