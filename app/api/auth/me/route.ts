import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * ✅ PHASE 3+: Fetch Current User Data
 * 
 * This endpoint retrieves the authenticated user's profile information
 * from Shopify Customer Account API.
 * 
 * Security:
 * - Token is read from httpOnly cookie (server-side only)
 * - Token never exposed to frontend
 * - Called by AuthContext on app mount
 * 
 * Flow:
 * 1. Check if customer_token cookie exists
 * 2. If exists, query Shopify Customer Account API
 * 3. Return user data (firstName, lastName, email)
 * 4. If no token or invalid, return { user: null }
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
    const token = cookieStore.get('customer_token')?.value;

    // If no token, user is not authenticated
    if (!token) {
      console.log('[/api/auth/me] No token found - user not authenticated');
      return NextResponse.json({ user: null });
    }

    console.log('[/api/auth/me] Token found, querying Shopify API');

    // Step 2: Validate Shopify configuration
    const shopId = process.env.SHOPIFY_SHOP_ID;

    if (!shopId) {
      console.error('[/api/auth/me] Missing SHOPIFY_SHOP_ID environment variable');
      return NextResponse.json({ user: null, error: 'Server configuration error' });
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

    console.log('[/api/auth/me] Sending GraphQL query to Shopify');

    // Step 4: Make request to Shopify Customer Account API
    const shopifyResponse = await fetch(
      `https://shopify.com/${shopId}/account/customer/api/2024-01/graphql`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: graphqlQuery }),
      }
    );

    // Step 5: Parse response
    const responseData = await shopifyResponse.json();

    console.log('[/api/auth/me] Shopify API response status:', shopifyResponse.status);

    // Check for errors
    if (!shopifyResponse.ok) {
      console.error('[/api/auth/me] Shopify API error', {
        status: shopifyResponse.status,
        errors: responseData.errors,
      });

      // 401 means token is invalid/expired
      if (shopifyResponse.status === 401) {
        // Clear the invalid cookie
        cookieStore.delete('customer_token');
        console.log('[/api/auth/me] Token was invalid, clearing cookie');
      }

      return NextResponse.json({ user: null });
    }

    // Check for GraphQL errors
    if (responseData.errors) {
      console.error('[/api/auth/me] GraphQL errors:', responseData.errors);
      return NextResponse.json({ user: null });
    }

    // Extract customer data
    const customer = responseData.data?.customer;

    if (!customer) {
      console.warn('[/api/auth/me] No customer data in response');
      return NextResponse.json({ user: null });
    }

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
