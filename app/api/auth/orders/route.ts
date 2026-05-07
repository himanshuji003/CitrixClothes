import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * ✅ PHASE 5: Fetch Customer Orders
 * 
 * This endpoint retrieves the authenticated user's order history
 * from Shopify Customer Account API.
 * 
 * Security:
 * - Token is read from httpOnly cookie (server-side only)
 * - Token never exposed to frontend
 * - Called by Account page component
 * 
 * Flow:
 * 1. Check if customer_token cookie exists
 * 2. If missing, return empty orders array
 * 3. If exists, query Shopify Customer Account API
 * 4. Return order data with all relevant fields
 * 5. If no token or invalid, return { orders: [] }
 * 
 * Reference: https://shopify.dev/docs/api/customer-account/latest
 */

export interface OrderLineItem {
  title: string;
  quantity: number;
}

export interface OrderTotalPrice {
  amount: string;
  currencyCode: string;
}

export interface Order {
  id: string;
  number: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: OrderTotalPrice;
  statusUrl: string;
  lineItems: OrderLineItem[];
}

interface OrdersResponse {
  orders: Order[];
  error?: string;
}

export async function GET(req: NextRequest): Promise<NextResponse<OrdersResponse>> {
  try {
    console.log('[/api/auth/orders] Order fetch request', {
      timestamp: new Date().toISOString(),
    });

    // Step 1: Get token from httpOnly cookie (server-side only)
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_token')?.value;

    // If no token, user is not authenticated - return empty orders
    if (!token) {
      console.log('[/api/auth/orders] User not authenticated - no token found', {
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ orders: [] });
    }

    console.log('[/api/auth/orders] Fetching customer orders', {
      tokenLength: token.length,
      timestamp: new Date().toISOString(),
    });

    // Step 2: Validate Shopify configuration
    const shopId = process.env.SHOPIFY_SHOP_ID;

    if (!shopId) {
      console.error('[/api/auth/orders] Shopify API configuration error', {
        errorCode: 'MISSING_SHOP_ID',
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ orders: [], error: 'Server configuration error' });
    }

    // Step 3: GraphQL Query to fetch customer orders
    const graphqlQuery = `
      query {
        customer {
          orders(first: 10) {
            nodes {
              id
              number
              processedAt
              financialStatus
              fulfillmentStatus
              totalPrice {
                amount
                currencyCode
              }
              statusUrl
              lineItems(first: 5) {
                nodes {
                  title
                  quantity
                }
              }
            }
          }
        }
      }
    `;

    console.log('[/api/auth/orders] Querying Shopify Customer Account API', {
      endpoint: `https://shopify.com/authentication/${shopId}/account/customer/api/2024-01/graphql`,
      timestamp: new Date().toISOString(),
    });

    // Step 4: Make request to Shopify Customer Account API
    const shopifyResponse = await fetch(
      `https://shopify.com/authentication/${shopId}/account/customer/api/2024-01/graphql`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: graphqlQuery }),
      }
    );

    // Step 5: Parse response
    let responseData;
    
    try {
      responseData = await shopifyResponse.json();
    } catch (parseError) {
      console.error('[/api/auth/orders] Failed to parse Shopify API response', {
        status: shopifyResponse.status,
        error: parseError instanceof Error ? parseError.message : String(parseError),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ orders: [] });
    }

    console.log('[/api/auth/orders] Shopify API response received', {
      status: shopifyResponse.status,
      hasErrors: !!responseData.errors,
      hasData: !!responseData.data,
      timestamp: new Date().toISOString(),
    });

    // Check for HTTP errors
    if (!shopifyResponse.ok) {
      console.error('[/api/auth/orders] Shopify API error', {
        errorCode: shopifyResponse.status === 401 ? 'UNAUTHORIZED' : 'API_ERROR',
        status: shopifyResponse.status,
        statusText: shopifyResponse.statusText,
        errors: responseData.errors,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({ orders: [] });
    }

    // Check for GraphQL errors
    if (responseData.errors) {
      console.error('[/api/auth/orders] GraphQL errors in response', {
        errors: responseData.errors,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ orders: [] });
    }

    // Extract orders from response
    const orders = responseData.data?.customer?.orders?.nodes || [];

    // Normalize orders data
    const normalizedOrders: Order[] = orders.map((order: any) => ({
      id: order.id,
      number: order.number,
      processedAt: order.processedAt,
      financialStatus: order.financialStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      totalPrice: {
        amount: order.totalPrice?.amount || '0',
        currencyCode: order.totalPrice?.currencyCode || 'USD',
      },
      statusUrl: order.statusUrl,
      lineItems: (order.lineItems?.nodes || []).map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
      })),
    }));

    console.log('[/api/auth/orders] Orders retrieved successfully', {
      count: normalizedOrders.length,
      timestamp: new Date().toISOString(),
    });

    // Step 6: Return orders data
    return NextResponse.json({
      orders: normalizedOrders,
    });
  } catch (error) {
    console.error('[/api/auth/orders] Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json({ orders: [], error: 'Internal server error' });
  }
}
