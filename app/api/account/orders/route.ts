import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchCustomerAccountApiMetadata } from '@/lib/shopify-auth';

/**
 * ✅ Account API - Get Customer Orders
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
 * 1. Check if customer access_token cookie exists
 * 2. If missing, return empty orders array
 * 3. If exists, query Shopify Customer Account API with safe fields only
 * 4. Return order data with supported fields
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
  name: string;
  processedAt: string;
  totalPrice: OrderTotalPrice;
  lineItems: OrderLineItem[];
}

interface OrdersResponse {
  success: boolean;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  orders: Order[];
  count?: number;
  error?: string;
  details?: any;
}

export async function GET(req: NextRequest): Promise<NextResponse<OrdersResponse>> {
  try {
    console.log('[/api/account/orders] ====== ORDER FETCH REQUEST START ======', {
      timestamp: new Date().toISOString(),
    });

    // Step 1: Get token from httpOnly cookie (server-side only)
    const cookieStore = await cookies();
    const token = cookieStore.get('shopify_customer_access_token')?.value;

    // If no token, user is not authenticated - return empty orders
    if (!token) {
      console.log('[/api/account/orders] ❌ FAILURE: User not authenticated - no token found', {
        hasCustomerToken: !!cookieStore.get('shopify_customer_access_token'),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ success: false, orders: [] });
    }

    console.log('[/api/account/orders] ✅ Token found', {
      tokenLength: token.length,
      tokenPrefix: token.slice(0, 8),
      tokenSuffix: token.slice(-8),
      timestamp: new Date().toISOString(),
    });

    // Validate token has correct prefix for Customer Account API
    if (!token.startsWith('shcat_')) {
      console.error('[/api/account/orders] ❌ FAILURE: Invalid token format', {
        errorCode: 'INVALID_TOKEN_PREFIX',
        tokenPrefix: token.slice(0, 8),
        expected: 'shcat_',
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ success: false, orders: [] });
    }

    console.log('[/api/account/orders] ✅ Token format valid');

    // Step 2: Fetch Customer Account API discovery metadata
    console.log('[/api/account/orders] Fetching Customer Account API metadata (.well-known endpoint)...');
    let apiMetadata;
    try {
      apiMetadata = await fetchCustomerAccountApiMetadata();
      console.log('[/api/account/orders] ✅ API metadata retrieved successfully', {
        graphqlUrl: apiMetadata.graphql_url,
        timestamp: new Date().toISOString(),
      });

      // Validate that endpoint was actually resolved
      if (!apiMetadata.graphql_url) {
        console.error('[/api/account/orders] ❌ FAILURE: API endpoint is empty/undefined', {
          apiMetadata: JSON.stringify(apiMetadata),
          timestamp: new Date().toISOString(),
        });
        return NextResponse.json({ success: false, orders: [] });
      }
    } catch (discoveryError) {
      console.error('[/api/account/orders] ❌ FAILURE: Error fetching API metadata', {
        error: discoveryError instanceof Error ? discoveryError.message : String(discoveryError),
        stack: discoveryError instanceof Error ? discoveryError.stack : undefined,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ success: false, orders: [] });
    }

    // Step 3: Build GraphQL query with ONLY supported fields
    // Removed: statusUrl, financialStatus, fulfillmentStatus (not supported by Customer Account API)
    const graphqlQuery = `
      query GetCustomerOrders {
        customer {
          id
          displayName
          emailAddress {
            emailAddress
          }
          orders(first: 20) {
            edges {
              node {
                id
                name
                processedAt
                totalPrice {
                  amount
                  currencyCode
                }
                lineItems(first: 10) {
                  edges {
                    node {
                      title
                      quantity
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    console.log('[/api/account/orders] Sending GraphQL query to Customer Account API', {
      queryPreview: graphqlQuery.substring(0, 100) + '...',
      timestamp: new Date().toISOString(),
    });

    // Step 4: Make request to Shopify Customer Account API
    let response;
    try {
      response = await fetch(apiMetadata.graphql_url, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: graphqlQuery }),
      });

      console.log('[/api/account/orders] GraphQL query HTTP response received', {
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString(),
      });
    } catch (fetchError) {
      console.error('[/api/account/orders] ❌ FAILURE: Network error during GraphQL query', {
        error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ success: false, orders: [] });
    }

    // Step 5: Parse response
    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error('[/api/account/orders] ❌ FAILURE: Failed to parse response as JSON', {
        status: response.status,
        error: parseError instanceof Error ? parseError.message : String(parseError),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ success: false, orders: [] });
    }

    console.log('[/api/account/orders] GraphQL response parsed', {
      status: response.status,
      hasErrors: !!result.errors,
      hasData: !!result.data,
      hasCustomer: !!result.data?.customer,
      timestamp: new Date().toISOString(),
    });

    // Step 6: Check for HTTP errors
    if (!response.ok) {
      console.error('[/api/account/orders] ❌ FAILURE: Shopify API HTTP error', {
        errorCode: response.status === 401 ? 'UNAUTHORIZED' : 'API_ERROR',
        status: response.status,
        statusText: response.statusText,
        errors: result.errors,
        timestamp: new Date().toISOString(),
      });

      if (response.status === 401) {
        cookieStore.delete('shopify_customer_access_token');
        console.log('[/api/account/orders] Token invalid (401) - clearing cookie', {
          timestamp: new Date().toISOString(),
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: 'SHOPIFY_API_ERROR',
          details: result.errors,
        },
        { status: 500 }
      );
    }

    // Step 7: Check for GraphQL errors
    if (result.errors) {
      console.error('[/api/account/orders] ❌ FAILURE: GraphQL errors in response', {
        errors: JSON.stringify(result.errors, null, 2),
        errorCount: result.errors.length,
        firstError: result.errors[0],
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: false,
          error: 'SHOPIFY_GRAPHQL_ERROR',
          details: result.errors,
        },
        { status: 500 }
      );
    }

    // Step 8: Extract and validate customer data
    const data = result.data;
    if (!data?.customer) {
      console.error('[/api/account/orders] ❌ FAILURE: No customer data in response', {
        dataStructure: JSON.stringify(data || {}),
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: false,
          error: 'NO_CUSTOMER_DATA',
          details: 'Customer data not found in Shopify response',
        },
        { status: 500 }
      );
    }

    const customer = data.customer;

    console.log('[/api/account/orders] ✅ Customer data retrieved', {
      customerId: customer.id,
      customerDisplayName: customer.displayName,
      customerEmail: customer.emailAddress?.emailAddress,
      orderEdgeCount: customer.orders?.edges?.length || 0,
      timestamp: new Date().toISOString(),
    });

    // Step 9: Map orders response with safe field extraction
    const orders = (customer.orders?.edges || []).map((edge: any) => {
      const order = edge.node;

      return {
        id: order.id,
        name: order.name,
        processedAt: order.processedAt,
        totalPrice: {
          amount: order.totalPrice?.amount || '0',
          currencyCode: order.totalPrice?.currencyCode || 'USD',
        },
        lineItems: (order.lineItems?.edges || []).map((itemEdge: any) => ({
          title: itemEdge.node.title,
          quantity: itemEdge.node.quantity,
        })),
      };
    });

    console.log('[/api/account/orders] ✅ SUCCESS: Orders retrieved and normalized', {
      count: orders.length,
      orderIds: orders.map(o => o.id).join(', '),
      timestamp: new Date().toISOString(),
    });

    if (orders.length === 0) {
      console.log('[/api/account/orders] ⚠️  NO ORDERS FOUND - Customer has 0 orders in Shopify', {
        customerId: customer.id,
        customerEmail: customer.emailAddress?.emailAddress,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('[/api/account/orders] ====== ORDER FETCH REQUEST END (SUCCESS) ======\n');

    // Step 10: Return success response with customer and order data
    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.displayName,
        email: customer.emailAddress?.emailAddress,
      },
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('[/api/account/orders] ❌ FAILURE: Unexpected error during order fetch:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    console.log('[/api/account/orders] ====== ORDER FETCH REQUEST END (ERROR) ======\n');

    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
