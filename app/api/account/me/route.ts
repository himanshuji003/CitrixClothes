import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  fetchCustomerAccountApiMetadata,
  getCookieSecurity,
  getRequestBaseUrl,
  getShopifyCustomerApiHeaders,
  refreshAccessToken,
} from '@/lib/shopify-auth';

/**
 * ✅ Account API - Get Current User
 * 
 * This endpoint retrieves the authenticated user's profile information
 * from Shopify Customer Account API.
 * 
 * Security:
 * - Token is read from httpOnly cookie (server-side only)
 * - Token never exposed to frontend JavaScript
 * - Called by AuthContext on app mount
 * - Called by /account page to fetch user data
 * 
 * Flow:
 * 1. Check if customer access_token cookie exists
 * 2. If exists, query Shopify Customer Account API
 * 3. If 401, attempt to refresh token using refresh_token
 * 4. Retry query with new token if refresh succeeds
 * 5. Return user data (id, firstName, lastName, email, phone)
 * 6. If no token or invalid, return 401 with user: null
 * 
 * GraphQL Schema (Shopify Customer Account API):
 * - emailAddress is a nested object: { emailAddress }
 * - phoneNumber is a nested object: { phoneNumber }
 * - Not a direct customer.email or customer.phone property
 * 
 * Reference: https://shopify.dev/docs/api/customer-account/latest
 */

interface CustomerData {
  id: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
}

interface MeResponse {
  user: CustomerData | null;
  error?: string;
}

export async function GET(req: NextRequest): Promise<NextResponse<MeResponse>> {
  try {
    console.log('[/api/account/me] User data request', {
      timestamp: new Date().toISOString(),
    });

    // Step 1: Get token from httpOnly cookie (server-side only)
    const cookieStore = await cookies();
    const token = cookieStore.get('shopify_customer_access_token')?.value;

    // If no token, user is not authenticated
    if (!token) {
      console.log('[/api/account/me] User not authenticated - no token found', {
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ user: null }, { status: 401 });
    }

    console.log('[/api/account/me] Fetching authenticated user data', {
      tokenLength: token.length,
      tokenPrefix: token.slice(0, 8),
      timestamp: new Date().toISOString(),
    });

    const baseUrl = getRequestBaseUrl(req);

    // Step 2: Fetch Customer Account API discovery metadata
    const apiMetadata = await fetchCustomerAccountApiMetadata();

    console.log('[/api/account/me] Retrieved Customer Account API endpoint', {
      graphqlUrl: apiMetadata.graphql_url,
      timestamp: new Date().toISOString(),
    });

    // Step 3: GraphQL Query to fetch customer data
    // NOTE: Customer Account API uses nested objects for email and phone
    const graphqlQuery = `
      query GetCustomer {
        customer {
          id
          firstName
          lastName
          displayName
          emailAddress {
            emailAddress
          }
          phoneNumber {
            phoneNumber
          }
        }
      }
    `;

    console.log('[/api/account/me] Sending GraphQL query to Shopify Customer Account API');

    // Step 4: Make request to Shopify Customer Account API
    const shopifyResponse = await fetch(apiMetadata.graphql_url, {
      method: 'POST',
      headers: getShopifyCustomerApiHeaders(token, baseUrl),
      body: JSON.stringify({ query: graphqlQuery }),
    });

    // Step 5: Parse response
    let responseData;

    try {
      responseData = await shopifyResponse.json();
    } catch (parseError) {
      console.error('[/api/account/me] Failed to parse Shopify API response', {
        status: shopifyResponse.status,
        error: parseError instanceof Error ? parseError.message : String(parseError),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ user: null, error: 'Invalid API response' }, { status: 500 });
    }

    console.log('[/api/account/me] Shopify API response received', {
      status: shopifyResponse.status,
      hasErrors: !!responseData.errors,
      hasData: !!responseData.data,
      timestamp: new Date().toISOString(),
    });

    // Check for HTTP errors
    if (!shopifyResponse.ok) {
      console.error('[/api/account/me] Shopify API error', {
        errorCode: shopifyResponse.status === 401 ? 'UNAUTHORIZED' : 'API_ERROR',
        status: shopifyResponse.status,
        statusText: shopifyResponse.statusText,
        errors: responseData.errors,
        timestamp: new Date().toISOString(),
      });

      // 401 means token is invalid/expired - attempt refresh
      if (shopifyResponse.status === 401) {
        console.log('[/api/account/me] Token returned 401 - attempting to refresh', {
          timestamp: new Date().toISOString(),
        });

        try {
          // Try to refresh the token
          const refreshToken = cookieStore.get('shopify_customer_refresh_token')?.value;
          
          if (refreshToken) {
            console.log('[/api/account/me] Refresh token found - attempting refresh');
            const newAccessToken = await refreshAccessToken(refreshToken, baseUrl);

            // Update the access token cookie
            const maxAge = 24 * 60 * 60; // 24 hours default
            const cookieSecurity = getCookieSecurity(baseUrl);

            cookieStore.set('shopify_customer_access_token', newAccessToken, {
              httpOnly: true,
              secure: cookieSecurity.secure,
              sameSite: cookieSecurity.sameSite,
              path: '/',
              maxAge,
            });

            console.log('[/api/account/me] Token refreshed successfully - retrying query');

            // Retry the GraphQL query with the new token
            const retryResponse = await fetch(apiMetadata.graphql_url, {
              method: 'POST',
              headers: getShopifyCustomerApiHeaders(newAccessToken, baseUrl),
              body: JSON.stringify({ query: graphqlQuery }),
            });

            let retryData;
            try {
              retryData = await retryResponse.json();
            } catch (parseError) {
              console.error('[/api/account/me] Failed to parse retry response', {
                error: parseError instanceof Error ? parseError.message : String(parseError),
                timestamp: new Date().toISOString(),
              });
              return NextResponse.json({ user: null, error: 'Invalid API response' }, { status: 500 });
            }

            if (retryResponse.ok && !retryData.errors && retryData.data?.customer) {
              console.log('[/api/account/me] Retry query succeeded after token refresh');
              const customer = retryData.data.customer;
              const customerData: CustomerData = {
                id: customer?.id ?? null,
                firstName: customer?.firstName ?? null,
                lastName: customer?.lastName ?? null,
                name: customer?.displayName ?? null,
                email: customer?.emailAddress?.emailAddress ?? null,
                phone: customer?.phoneNumber?.phoneNumber ?? null,
              };

              return NextResponse.json({
                user: customerData,
              });
            } else {
              console.log('[/api/account/me] Retry query failed after token refresh');
              // Fall through to clear cookies and return 401
            }
          } else {
            console.log('[/api/account/me] No refresh token available');
          }
        } catch (refreshError) {
          console.error('[/api/account/me] Token refresh failed', {
            error: refreshError instanceof Error ? refreshError.message : String(refreshError),
            timestamp: new Date().toISOString(),
          });
          // Fall through to clear cookies and return 401
        }

        // If refresh failed or wasn't attempted, clear tokens and return 401
        cookieStore.delete('shopify_customer_access_token');
        cookieStore.delete('shopify_customer_refresh_token');
        console.log('[/api/account/me] Token invalid (401) - clearing cookies', {
          timestamp: new Date().toISOString(),
        });
      }

      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Check for GraphQL errors
    if (responseData.errors) {
      console.error('[/api/account/me] GraphQL errors in response', {
        errors: responseData.errors,
        timestamp: new Date().toISOString(),
      });
      // Do NOT redirect to login for GraphQL schema errors
      // Return 400 Bad Request instead
      return NextResponse.json({ user: null, error: 'GraphQL error' }, { status: 400 });
    }

    // Extract customer data
    const customer = responseData.data?.customer;

    if (!customer) {
      console.warn('[/api/account/me] No customer data in response', {
        hasData: !!responseData.data,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ user: null, error: 'No customer data' }, { status: 400 });
    }

    console.log('[/api/account/me] Customer data retrieved successfully', {
      customerId: customer.id,
      hasEmail: !!customer.emailAddress?.emailAddress,
      hasFirstName: !!customer.firstName,
      hasLastName: !!customer.lastName,
      timestamp: new Date().toISOString(),
    });

    // Step 6: Extract nested email and phone from Customer Account API schema
    const customerData: CustomerData = {
      id: customer?.id ?? null,
      firstName: customer?.firstName ?? null,
      lastName: customer?.lastName ?? null,
      name: customer?.displayName ?? null,
      email: customer?.emailAddress?.emailAddress ?? null,
      phone: customer?.phoneNumber?.phoneNumber ?? null,
    };

    console.log('[/api/account/me] Returning user data', {
      userId: customerData.id,
      hasEmail: !!customerData.email,
      timestamp: new Date().toISOString(),
    });

    // Step 7: Return user data (never return tokens)
    return NextResponse.json({
      user: customerData,
    });
  } catch (error) {
    console.error('[/api/account/me] Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Return 500 for unexpected errors
    return NextResponse.json({ user: null, error: 'Server error' }, { status: 500 });
  }
}
