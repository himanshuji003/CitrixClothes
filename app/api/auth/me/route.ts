import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  fetchCustomerAccountApiMetadata,
  getRequestBaseUrl,
  getShopifyCustomerApiHeaders,
} from '@/lib/shopify-auth';

/**
 * ✅ PHASE 3+: Fetch Current User Data
 * 
 * This endpoint retrieves the authenticated user's profile information
 * from Shopify Customer Account API using OpenID Discovery for endpoints.
 * 
 * Security:
 * - Token is read from httpOnly cookie (server-side only)
 * - Token never exposed to frontend
 * - Called by AuthContext on app mount
 * 
 * Flow:
 * 1. Check if shopify_customer_access_token cookie exists
 * 2. Discover Customer Account API GraphQL endpoint
 * 3. Query Shopify Customer Account API with token
 * 4. Return user data (firstName, lastName, email)
 * 5. If no token or invalid, return { user: null }
 * 
 * Reference: https://shopify.dev/docs/api/customer-account/latest
 */

interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
}

interface MeResponse {
  user: CustomerData | null;
  error?: string;
}

export async function GET(req: NextRequest): Promise<NextResponse<MeResponse>> {
  try {
    console.log('[/api/auth/me] User data request', {
      timestamp: new Date().toISOString(),
    });

    // Step 1: Get token from httpOnly cookie (server-side only)
    const cookieStore = await cookies();
    const token = cookieStore.get('shopify_customer_access_token')?.value;

    // If no token, user is not authenticated
    if (!token) {
      console.log('[/api/auth/me] User not authenticated - no token found', {
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ user: null });
    }

    console.log('[/api/auth/me] Fetching authenticated user data', {
      tokenLength: token.length,
      timestamp: new Date().toISOString(),
    });

    // Step 2: Discover Customer Account API GraphQL endpoint
    let graphqlUrl: string;
    
    try {
      const apiMetadata = await fetchCustomerAccountApiMetadata();
      graphqlUrl = apiMetadata.graphql_url || apiMetadata.graphql_api;
      
      if (!graphqlUrl) {
        throw new Error('No GraphQL endpoint in metadata');
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log('[/api/auth/me] Customer Account API discovered:', {
          graphqlUrl: graphqlUrl,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (discoveryError) {
      console.error('[/api/auth/me] Failed to discover Customer Account API endpoint', {
        error: discoveryError instanceof Error ? discoveryError.message : String(discoveryError),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ user: null, error: 'Failed to discover API endpoint' });
    }

    // Step 3: GraphQL Query to fetch customer data
    const graphqlQuery = `
      query {
        customer {
          firstName
          lastName
          email
        }
      }
    `;

    if (process.env.NODE_ENV !== 'production') {
      console.log('[/api/auth/me] Sending GraphQL query to Customer Account API', {
        endpoint: graphqlUrl,
        timestamp: new Date().toISOString(),
      });
    }

    // Step 4: Make request to Shopify Customer Account API
    // ✅ Authorization header: plain token (not "Bearer {token}")
    // Shopify Customer Account API expects Authorization: {token}
    const shopifyResponse = await fetch(graphqlUrl, {
      method: 'POST',
      headers: getShopifyCustomerApiHeaders(token, getRequestBaseUrl(req)),
      body: JSON.stringify({ query: graphqlQuery }),
    });

    // Step 5: Parse response
    let responseData;
    
    try {
      responseData = await shopifyResponse.json();
    } catch (parseError) {
      console.error('[/api/auth/me] Failed to parse Shopify API response', {
        status: shopifyResponse.status,
        error: parseError instanceof Error ? parseError.message : String(parseError),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ user: null, error: 'Invalid API response' });
    }

    console.log('[/api/auth/me] Shopify API response received', {
      status: shopifyResponse.status,
      hasErrors: !!responseData.errors,
      hasData: !!responseData.data,
      timestamp: new Date().toISOString(),
    });

    // Check for HTTP errors
    if (!shopifyResponse.ok) {
      console.error('[/api/auth/me] Shopify API error', {
        errorCode: shopifyResponse.status === 401 ? 'UNAUTHORIZED' : 'API_ERROR',
        status: shopifyResponse.status,
        statusText: shopifyResponse.statusText,
        errors: responseData.errors,
        timestamp: new Date().toISOString(),
      });

      // 401 means token is invalid/expired
      if (shopifyResponse.status === 401) {
        // Clear the invalid cookie
        cookieStore.delete('shopify_customer_access_token');
        console.log('[/api/auth/me] Token invalid (401) - clearing cookie', {
          timestamp: new Date().toISOString(),
        });
      }

      return NextResponse.json({ user: null });
    }

    // Check for GraphQL errors
    if (responseData.errors) {
      console.error('[/api/auth/me] GraphQL errors in response', {
        errors: responseData.errors,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ user: null });
    }

    // Extract customer data
    const customer = responseData.data?.customer;

    if (!customer) {
      console.warn('[/api/auth/me] No customer data in response', {
        hasData: !!responseData.data,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ user: null });
    }

    console.log('[/api/auth/me] Customer data retrieved successfully', {
      hasEmail: !!customer.email,
      hasFirstName: !!customer.firstName,
      hasLastName: !!customer.lastName,
      timestamp: new Date().toISOString(),
    });

    console.log('[/api/auth/me] User data retrieved successfully', {
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
    });

    // Step 6: Return user data
    return NextResponse.json({
      user: {
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email,
      },
    });
  } catch (error) {
    console.error('[/api/auth/me] Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return null user on error (fail gracefully)
    return NextResponse.json({ user: null });
  }
}
