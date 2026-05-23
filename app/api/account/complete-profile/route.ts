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
 * ✅ POST /api/account/complete-profile
 * 
 * Save customer profile data to Shopify metafields.
 * 
 * Security:
 * - Token read from httpOnly cookie (server-side only)
 * - Validates all inputs before sending to Shopify
 * - Never exposes token in response
 * - No token in error messages
 * 
 * Token Refresh:
 * - Automatically attempts to refresh token if it returns 401
 * - Uses stored refresh token for renewal
 * - Retries mutation with new token
 * 
 * Request:
 * {
 *   fullName: string (required, max 100 chars)
 *   mobileNumber: string (required, 10-digit Indian format)
 *   age: number (required, 13-120)
 *   gender: string (required, one of: Male, Female, Other, Prefer not to say)
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   redirectUrl: "/account"
 * }
 * 
 * Errors:
 * - 400: Validation failed (detailed error message)
 * - 401: Not authenticated
 * - 500: API error (no details exposed)
 * 
 * Reference: https://shopify.dev/docs/api/customer-account/2026-04
 */

interface CompleteProfileRequest {
  fullName?: string;
  mobileNumber?: string;
  age?: number | string;
  gender?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

interface CompleteProfileResponse {
  success?: boolean;
  redirectUrl?: string;
  errors?: ValidationError[];
  error?: string;
  message?: string;
  details?: any;
}

const VALID_GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

// Indian mobile number validation: 10 digits, starts with 6-9
const INDIA_MOBILE_REGEX = /^[6-9]\d{9}$/;

function validateInput(data: CompleteProfileRequest): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate fullName
  if (!data.fullName || typeof data.fullName !== 'string') {
    errors.push({ field: 'fullName', message: 'Full name is required' });
  } else if (data.fullName.trim().length === 0) {
    errors.push({ field: 'fullName', message: 'Full name cannot be empty' });
  } else if (data.fullName.length > 100) {
    errors.push({ field: 'fullName', message: 'Full name must be 100 characters or less' });
  }

  // Validate mobileNumber (Indian format)
  if (!data.mobileNumber || typeof data.mobileNumber !== 'string') {
    errors.push({ field: 'mobileNumber', message: 'Mobile number is required' });
  } else {
    const cleanNumber = data.mobileNumber.replace(/^\+91/, '').trim();
    if (!INDIA_MOBILE_REGEX.test(cleanNumber)) {
      errors.push({
        field: 'mobileNumber',
        message: 'Invalid mobile number. Please enter a 10-digit Indian mobile number (e.g., 9876543210)',
      });
    }
  }

  // Validate age
  if (data.age === undefined || data.age === null || data.age === '') {
    errors.push({ field: 'age', message: 'Age is required' });
  } else {
    const ageNum = typeof data.age === 'string' ? parseInt(data.age, 10) : data.age;
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      errors.push({ field: 'age', message: 'Age must be between 13 and 120' });
    }
  }

  // Validate gender
  if (!data.gender || typeof data.gender !== 'string') {
    errors.push({ field: 'gender', message: 'Gender is required' });
  } else if (!VALID_GENDERS.includes(data.gender)) {
    errors.push({
      field: 'gender',
      message: `Gender must be one of: ${VALID_GENDERS.join(', ')}`,
    });
  }

  return errors;
}

export async function POST(req: NextRequest): Promise<NextResponse<CompleteProfileResponse>> {
  try {
    console.log('[/api/account/complete-profile] Profile completion request', {
      timestamp: new Date().toISOString(),
    });

    // Step 1: Parse request body
    let body: CompleteProfileRequest;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('[/api/account/complete-profile] Failed to parse request body', {
        error: parseError instanceof Error ? parseError.message : String(parseError),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        {
          errors: [
            { field: 'request', message: 'Invalid request body' },
          ],
        },
        { status: 400 }
      );
    }

    // Step 2: Validate inputs
    const validationErrors = validateInput(body);
    if (validationErrors.length > 0) {
      console.log('[/api/account/complete-profile] Validation failed', {
        errors: validationErrors.map(e => `${e.field}: ${e.message}`),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ errors: validationErrors }, { status: 400 });
    }

    // Step 3: Get token from httpOnly cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('shopify_customer_access_token')?.value;

    if (!token) {
      console.log('[/api/account/complete-profile] No token - user not authenticated', {
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { errors: [{ field: 'auth', message: 'Not authenticated' }] },
        { status: 401 }
      );
    }

    const baseUrl = getRequestBaseUrl(req);

    // Step 4: Fetch Customer Account API metadata
    const apiMetadata = await fetchCustomerAccountApiMetadata();

    // Step 5: Fetch customer ID using GetCustomerId query
    const getCustomerIdQuery = `
      query GetCustomerId {
        customer {
          id
          displayName
          emailAddress {
            emailAddress
          }
        }
      }
    `;

    console.log('[/api/account/complete-profile] Fetching customer ID', {
      timestamp: new Date().toISOString(),
    });

    const customerIdResponse = await fetch(apiMetadata.graphql_url, {
      method: 'POST',
      headers: getShopifyCustomerApiHeaders(token, baseUrl),
      body: JSON.stringify({
        query: getCustomerIdQuery,
      }),
    });

    let customerData;
    try {
      customerData = await customerIdResponse.json();
    } catch (parseError) {
      console.error('[/api/account/complete-profile] Failed to parse customer ID response', {
        status: customerIdResponse.status,
        error: parseError instanceof Error ? parseError.message : String(parseError),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        {
          success: false,
          error: 'CUSTOMER_FETCH_FAILED',
          message: 'Unable to fetch customer information.',
        },
        { status: 500 }
      );
    }

    // Parse customer ID safely
    const customerId = customerData?.data?.customer?.id;

    if (!customerId) {
      console.error('[/api/account/complete-profile] Missing customerId before metafieldsSet', {
        hasData: !!customerData?.data,
        hasCustomer: !!customerData?.data?.customer,
        errors: customerData?.errors,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: false,
          error: 'CUSTOMER_ID_NOT_FOUND',
          message: 'Unable to identify authenticated customer.',
          details: customerData?.errors ?? null,
        },
        { status: 500 }
      );
    }

    console.log('[/api/account/complete-profile] Customer ID resolved', {
      hasCustomerId: !!customerId,
      customerIdPrefix: customerId?.slice(0, 24),
      timestamp: new Date().toISOString(),
    });

    // Step 6: Clean and prepare data for saving
    const fullName = body.fullName!.trim();
    const normalizedMobileNumber = body.mobileNumber!.replace(/^\+91/, '').trim();
    const age = typeof body.age === 'string' ? parseInt(body.age, 10) : body.age;
    const gender = body.gender!;

    // Step 7: Build metafields with customerId
    const metafields = [
      {
        ownerId: customerId,
        namespace: 'custom',
        key: 'full_name',
        type: 'single_line_text_field',
        value: fullName,
      },
      {
        ownerId: customerId,
        namespace: 'custom',
        key: 'mobile_number',
        type: 'single_line_text_field',
        value: normalizedMobileNumber,
      },
      {
        ownerId: customerId,
        namespace: 'custom',
        key: 'age',
        type: 'number_integer',
        value: String(age),
      },
      {
        ownerId: customerId,
        namespace: 'custom',
        key: 'gender',
        type: 'single_line_text_field',
        value: gender,
      },
    ];

    console.log('[/api/account/complete-profile] Metafields ownerId check', {
      count: metafields.length,
      allHaveOwnerId: metafields.every(m => Boolean(m.ownerId)),
      keys: metafields.map(m => m.key),
      timestamp: new Date().toISOString(),
    });

    // Step 8: Create metafieldsSet mutation
    const metafieldsSetMutation = `
      mutation SetCustomerMetafields($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
            value
            type
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    console.log('[/api/account/complete-profile] Calling metafieldsSet mutation', {
      keysToSet: ['full_name', 'mobile_number', 'age', 'gender'],
      timestamp: new Date().toISOString(),
    });

    console.log('[/api/account/complete-profile] Mutation debug', {
      usesCorrectMetafieldsArg: metafieldsSetMutation.includes('metafieldsSet(metafields: $metafields)'),
      usesWrongInputArg: metafieldsSetMutation.includes('metafieldsSet(input:'),
      variablesShape: Object.keys({ metafields }),
      timestamp: new Date().toISOString(),
    });

    // Step 9: Send mutation to Shopify
    const shopifyResponse = await fetch(apiMetadata.graphql_url, {
      method: 'POST',
      headers: getShopifyCustomerApiHeaders(token, baseUrl),
      body: JSON.stringify({
        query: metafieldsSetMutation,
        variables: {
          metafields,
        },
      }),
    });

    let responseData;
    try {
      responseData = await shopifyResponse.json();
    } catch (parseError) {
      console.error('[/api/account/complete-profile] Failed to parse Shopify API response', {
        status: shopifyResponse.status,
        error: parseError instanceof Error ? parseError.message : String(parseError),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { errors: [{ field: 'api', message: 'Failed to save profile' }] },
        { status: 500 }
      );
    }

    // Handle HTTP errors
    if (!shopifyResponse.ok) {
      if (shopifyResponse.status === 401) {
        console.log('[/api/account/complete-profile] Token returned 401 - attempting to refresh', {
          timestamp: new Date().toISOString(),
        });

        try {
          // Try to refresh the token
          const refreshToken = cookieStore.get('shopify_customer_refresh_token')?.value;

          if (refreshToken) {
            console.log('[/api/account/complete-profile] Refresh token found - attempting refresh');
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

            console.log('[/api/account/complete-profile] Token refreshed successfully - retrying mutation');

            // Retry the mutation with the new token
            const retryResponse = await fetch(apiMetadata.graphql_url, {
              method: 'POST',
              headers: getShopifyCustomerApiHeaders(newAccessToken, baseUrl),
              body: JSON.stringify({
                query: metafieldsSetMutation,
                variables: {
                  metafields,
                },
              }),
            });

            let retryData;
            try {
              retryData = await retryResponse.json();
            } catch (parseError) {
              console.error('[/api/account/complete-profile] Failed to parse retry response', {
                error: parseError instanceof Error ? parseError.message : String(parseError),
                timestamp: new Date().toISOString(),
              });
              return NextResponse.json(
                { errors: [{ field: 'api', message: 'Failed to save profile' }] },
                { status: 500 }
              );
            }

            if (retryResponse.ok && retryData.data?.metafieldsSet) {
              const mutationResult = retryData.data.metafieldsSet;
              if (!mutationResult.userErrors || mutationResult.userErrors.length === 0) {
                const savedMetafields = mutationResult.metafields || [];
                const requiredKeysSet = new Set(['full_name', 'mobile_number', 'age', 'gender']);
                const savedKeysSet = new Set(savedMetafields.map((m: any) => m.key));
                const allSaved = Array.from(requiredKeysSet).every(key => savedKeysSet.has(key));

                if (allSaved) {
                  console.log('[/api/account/complete-profile] Profile saved successfully after token refresh');
                  return NextResponse.json({
                    success: true,
                    redirectUrl: '/account',
                  });
                }
              }
            }
            // Fall through to clear cookies and return 401
          } else {
            console.log('[/api/account/complete-profile] No refresh token available');
          }
        } catch (refreshError) {
          console.error('[/api/account/complete-profile] Token refresh failed', {
            error: refreshError instanceof Error ? refreshError.message : String(refreshError),
            timestamp: new Date().toISOString(),
          });
          // Fall through to clear cookies and return 401
        }

        // If refresh failed or wasn't attempted, clear tokens and return 401
        cookieStore.delete('shopify_customer_access_token');
        cookieStore.delete('shopify_customer_refresh_token');
        console.log('[/api/account/complete-profile] Token invalid (401) - clearing cookies', {
          timestamp: new Date().toISOString(),
        });

        return NextResponse.json(
          { errors: [{ field: 'auth', message: 'Session expired' }] },
          { status: 401 }
        );
      }

      console.error('[/api/account/complete-profile] Shopify API error', {
        status: shopifyResponse.status,
        errors: responseData.errors,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { errors: [{ field: 'api', message: 'Failed to save profile' }] },
        { status: 500 }
      );
    }

    // Handle GraphQL errors (mutation response)
    const mutationResult = responseData.data?.metafieldsSet;
    if (!mutationResult) {
      console.error('[/api/account/complete-profile] No mutation result in response', {
        responseData,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { errors: [{ field: 'api', message: 'Failed to save profile' }] },
        { status: 500 }
      );
    }

    // Check for user errors in mutation response
    if (mutationResult.userErrors && mutationResult.userErrors.length > 0) {
      console.error('[/api/account/complete-profile] Shopify mutation errors', {
        userErrors: mutationResult.userErrors,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        {
          errors: [
            {
              field: 'api',
              message: 'Failed to save profile data. Please try again.',
            },
          ],
        },
        { status: 500 }
      );
    }

    // Verify metafields were saved
    const savedMetafields = mutationResult.metafields || [];
    const requiredKeysSet = new Set(['full_name', 'mobile_number', 'age', 'gender']);
    const savedKeysSet = new Set(savedMetafields.map((m: any) => m.key));

    const allSaved = Array.from(requiredKeysSet).every(key => savedKeysSet.has(key));

    if (!allSaved) {
      console.error('[/api/account/complete-profile] Not all metafields were saved', {
        expected: Array.from(requiredKeysSet),
        saved: Array.from(savedKeysSet),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { errors: [{ field: 'api', message: 'Failed to save all profile fields' }] },
        { status: 500 }
      );
    }

    console.log('[/api/account/complete-profile] Initial save confirmed, now verifying with Shopify', {
      savedKeys: Array.from(savedKeysSet),
      timestamp: new Date().toISOString(),
    });

    // Step 11: Wait for Shopify replication (500ms buffer)
    console.log('[/api/account/complete-profile] Waiting for Shopify replication before verification');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 12: Read back metafields to verify they were persisted
    const verifyQuery = `
      query VerifyMetafields {
        customer {
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

    console.log('[/api/account/complete-profile] Verifying metafields were persisted to Shopify', {
      timestamp: new Date().toISOString(),
    });

    const verifyResponse = await fetch(apiMetadata.graphql_url, {
      method: 'POST',
      headers: getShopifyCustomerApiHeaders(token, baseUrl),
      body: JSON.stringify({ query: verifyQuery }),
    });

    let verifyData;
    try {
      verifyData = await verifyResponse.json();
    } catch (parseError) {
      console.error('[/api/account/complete-profile] Failed to parse verification response', {
        error: parseError instanceof Error ? parseError.message : String(parseError),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { errors: [{ field: 'api', message: 'Profile verification failed' }] },
        { status: 500 }
      );
    }

    const verifiedMetafields = verifyData.data?.customer;

    // Check all fields exist
    const allExist = Boolean(
      verifiedMetafields?.fullName?.value &&
      verifiedMetafields?.mobileNumber?.value &&
      verifiedMetafields?.age?.value &&
      verifiedMetafields?.gender?.value
    );

    console.log('[/api/account/complete-profile] Metafield verification check', {
      allExist,
      has: {
        fullName: !!verifiedMetafields?.fullName?.value,
        mobileNumber: !!verifiedMetafields?.mobileNumber?.value,
        age: !!verifiedMetafields?.age?.value,
        gender: !!verifiedMetafields?.gender?.value,
      },
      timestamp: new Date().toISOString(),
    });

    if (!allExist) {
      console.error('[/api/account/complete-profile] Verification failed - metafields not fully persisted yet', {
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { errors: [{ field: 'api', message: 'Profile save verification failed. Please try again.' }] },
        { status: 500 }
      );
    }

    console.log('[/api/account/complete-profile] ✅ Verification successful - all metafields confirmed persisted', {
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      redirectUrl: '/account',
    });
  } catch (error) {
    console.error('[/api/account/complete-profile] Unexpected error', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { errors: [{ field: 'api', message: 'An unexpected error occurred' }] },
      { status: 500 }
    );
  }
}
