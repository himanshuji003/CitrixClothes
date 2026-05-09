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
 * ✅ GET /api/account/profile-status
 * 
 * Check if customer profile is complete (all required metafields exist).
 * Uses Customer Account API v2026-04 with individual metafield queries.
 * 
 * Security:
 * - Token read from httpOnly cookie (server-side only)
 * - Never exposed to frontend
 * - No token in response
 */

interface ProfileStatusResponse {
  success: boolean;
  isComplete?: boolean;
  customer?: {
    id: string;
    name: string | null;
    email: string | null;
  };
  profile?: {
    fullName: string | null;
    mobileNumber: string | null;
    age: string | null;
    gender: string | null;
  };
  error?: string;
  details?: any;
}

export async function GET(req: NextRequest): Promise<NextResponse<ProfileStatusResponse>> {
  try {
    console.log('[/api/account/profile-status] ▶ Route started', {
      timestamp: new Date().toISOString(),
    });

    // Step 1: Get token from httpOnly cookie OR Authorization header
    const cookieStore = await cookies();
    let token = cookieStore.get('shopify_customer_access_token')?.value;

    // Fallback: Check Authorization header if no cookie
    if (!token) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
      } else if (authHeader && !authHeader.includes(' ')) {
        // Raw token format (for server-to-server calls)
        token = authHeader;
      }
    }

    console.log('[/api/account/profile-status] 🔑 Access token check', {
      hasToken: !!token,
      fromCookie: !!cookieStore.get('shopify_customer_access_token')?.value,
      fromAuthHeader: !!req.headers.get('Authorization'),
      tokenPresent: !!token,
      timestamp: new Date().toISOString(),
    });

    if (!token) {
      console.log('[/api/account/profile-status] ❌ No token - user not authenticated', {
        hasCookie: !!cookieStore.get('shopify_customer_access_token'),
        hasAuthHeader: !!req.headers.get('Authorization'),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { success: false, error: 'NOT_AUTHENTICATED', isComplete: false },
        { status: 401 }
      );
    }

    const baseUrl = getRequestBaseUrl(req);

    // Step 2: Fetch Customer Account API metadata
    const apiMetadata = await fetchCustomerAccountApiMetadata();
    
    console.log('[/api/account/profile-status] 🌐 Shopify endpoint', {
      endpoint: apiMetadata.graphql_url,
      timestamp: new Date().toISOString(),
    });

    // Step 3: Query customer with individual metafield queries
    // Using metafield(namespace:, key:) syntax for each custom field
    const graphqlQuery = `
      query GetProfileStatus {
        customer {
          id
          displayName
          emailAddress {
            emailAddress
          }
          fullName: metafield(namespace: "custom", key: "full_name") {
            value
          }
          mobileNumber: metafield(namespace: "custom", key: "mobile_number") {
            value
          }
          age: metafield(namespace: "custom", key: "age") {
            value
          }
          gender: metafield(namespace: "custom", key: "gender") {
            value
          }
        }
      }
    `;

    console.log('[/api/account/profile-status] 📤 Sending GraphQL query to Shopify', {
      timestamp: new Date().toISOString(),
    });

    const shopifyResponse = await fetch(apiMetadata.graphql_url, {
      method: 'POST',
      headers: getShopifyCustomerApiHeaders(token, baseUrl),
      body: JSON.stringify({ query: graphqlQuery }),
    });

    console.log('[/api/account/profile-status] 📥 Shopify response received', {
      status: shopifyResponse.status,
      statusText: shopifyResponse.statusText,
      timestamp: new Date().toISOString(),
    });

    let responseData;
    try {
      responseData = await shopifyResponse.json();
    } catch (parseError) {
      console.error('[/api/account/profile-status] ❌ Failed to parse Shopify response', {
        status: shopifyResponse.status,
        error: parseError instanceof Error ? parseError.message : String(parseError),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'RESPONSE_PARSE_ERROR',
          isComplete: false 
        },
        { status: 500 }
      );
    }

    // Log GraphQL errors
    if (responseData.errors) {
      console.error('[/api/account/profile-status] ❌ GraphQL errors', {
        errors: responseData.errors,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        {
          success: false,
          error: 'SHOPIFY_GRAPHQL_ERROR',
          details: responseData.errors,
          isComplete: false,
        },
        { status: 500 }
      );
    }

    // Handle HTTP errors
    if (!shopifyResponse.ok) {
      if (shopifyResponse.status === 401) {
        console.log('[/api/account/profile-status] 🔄 Token 401 - attempting refresh', {
          timestamp: new Date().toISOString(),
        });

        try {
          const refreshToken = cookieStore.get('shopify_customer_refresh_token')?.value;

          if (refreshToken) {
            console.log('[/api/account/profile-status] 🔑 Refresh token found - attempting exchange');
            const newAccessToken = await refreshAccessToken(refreshToken, baseUrl);

            // Update the access token cookie
            const maxAge = 24 * 60 * 60;
            const cookieSecurity = getCookieSecurity(baseUrl);

            cookieStore.set('shopify_customer_access_token', newAccessToken, {
              httpOnly: true,
              secure: cookieSecurity.secure,
              sameSite: cookieSecurity.sameSite,
              path: '/',
              maxAge,
            });

            console.log('[/api/account/profile-status] ✅ Token refreshed - retrying query');

            // Retry with new token
            const retryResponse = await fetch(apiMetadata.graphql_url, {
              method: 'POST',
              headers: getShopifyCustomerApiHeaders(newAccessToken, baseUrl),
              body: JSON.stringify({ query: graphqlQuery }),
            });

            let retryData;
            try {
              retryData = await retryResponse.json();
            } catch (parseError) {
              console.error('[/api/account/profile-status] ❌ Failed to parse retry response', {
                error: parseError instanceof Error ? parseError.message : String(parseError),
                timestamp: new Date().toISOString(),
              });
              return NextResponse.json(
                { success: false, error: 'RETRY_PARSE_ERROR', isComplete: false },
                { status: 500 }
              );
            }

            if (retryData.errors) {
              console.error('[/api/account/profile-status] ❌ GraphQL errors in retry', {
                errors: retryData.errors,
                timestamp: new Date().toISOString(),
              });
              return NextResponse.json(
                {
                  success: false,
                  error: 'SHOPIFY_GRAPHQL_ERROR',
                  details: retryData.errors,
                  isComplete: false,
                },
                { status: 500 }
              );
            }

            if (retryResponse.ok && retryData.data?.customer) {
              console.log('[/api/account/profile-status] ✅ Retry succeeded after refresh');
              const customer = retryData.data.customer;

              // Extract profile field values
              const fullName = customer.fullName?.value ?? null;
              const mobileNumber = customer.mobileNumber?.value ?? null;
              const age = customer.age?.value ?? null;
              const gender = customer.gender?.value ?? null;

              // Check completion
              const isComplete = Boolean(
                fullName &&
                mobileNumber &&
                age &&
                gender
              );

              console.log('[/api/account/profile-status] ✅ Profile status determined', {
                isComplete,
                hasFullName: !!fullName,
                hasMobileNumber: !!mobileNumber,
                hasAge: !!age,
                hasGender: !!gender,
                timestamp: new Date().toISOString(),
              });

              return NextResponse.json({
                success: true,
                isComplete,
                customer: {
                  id: customer.id,
                  name: customer.displayName,
                  email: customer.emailAddress?.emailAddress ?? null,
                },
                profile: {
                  fullName,
                  mobileNumber,
                  age,
                  gender,
                },
              });
            } else {
              console.log('[/api/account/profile-status] ❌ Retry response not ok', {
                status: retryResponse.status,
                hasData: !!retryData.data,
                timestamp: new Date().toISOString(),
              });
            }
          } else {
            console.log('[/api/account/profile-status] ⚠️  No refresh token available');
          }
        } catch (refreshError) {
          console.error('[/api/account/profile-status] ❌ Token refresh failed', {
            error: refreshError instanceof Error ? refreshError.message : String(refreshError),
            timestamp: new Date().toISOString(),
          });
        }

        // Clear tokens and return 401
        cookieStore.delete('shopify_customer_access_token');
        cookieStore.delete('shopify_customer_refresh_token');
        console.log('[/api/account/profile-status] 🗑️ Tokens cleared (401)', {
          timestamp: new Date().toISOString(),
        });

        return NextResponse.json(
          { success: false, error: 'TOKEN_REFRESH_FAILED', isComplete: false },
          { status: 401 }
        );
      }

      console.error('[/api/account/profile-status] ❌ Shopify HTTP error', {
        status: shopifyResponse.status,
        errors: responseData.errors,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        {
          success: false,
          error: 'SHOPIFY_HTTP_ERROR',
          details: responseData.errors,
          isComplete: false,
        },
        { status: 500 }
      );
    }

    // Extract customer data
    const customer = responseData.data?.customer;
    if (!customer) {
      console.error('[/api/account/profile-status] ❌ No customer data in response', {
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { success: false, error: 'NO_CUSTOMER_DATA', isComplete: false },
        { status: 500 }
      );
    }

    // Extract profile field values
    const fullName = customer.fullName?.value ?? null;
    const mobileNumber = customer.mobileNumber?.value ?? null;
    const age = customer.age?.value ?? null;
    const gender = customer.gender?.value ?? null;

    // Check completion - all fields must be present
    const isComplete = Boolean(
      fullName &&
      mobileNumber &&
      age &&
      gender
    );

    console.log('[/api/account/profile-status] ✅ Profile status determined', {
      isComplete,
      hasFullName: !!fullName,
      hasMobileNumber: !!mobileNumber,
      hasAge: !!age,
      hasGender: !!gender,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      isComplete,
      customer: {
        id: customer.id,
        name: customer.displayName,
        email: customer.emailAddress?.emailAddress ?? null,
      },
      profile: {
        fullName,
        mobileNumber,
        age,
        gender,
      },
    });
  } catch (error) {
    console.error('[/api/account/profile-status] ❌ Unexpected error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { 
        success: false, 
        error: 'UNEXPECTED_ERROR',
        isComplete: false 
      },
      { status: 500 }
    );
  }
}
