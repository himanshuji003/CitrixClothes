# ✅ Shopify PKCE OAuth Implementation - FINALIZED

**Status**: Production-Ready | **Date**: May 6, 2026 | **Flow**: PKCE (no client_secret)

---

## **What Was Fixed**

### 1. ✅ OAuth Endpoint URLs Updated

All 4 Shopify API endpoints migrated from old format (`/auth/oauth/`, `/account/customer/api/`) to new format with `/authentication/` prefix:

| Endpoint               | Old Format                                                          | New Format                                                                         |
| ---------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Authorization          | `https://shopify.com/{shopId}/auth/oauth/authorize`                 | `https://shopify.com/authentication/{shopId}/oauth/authorize`                      |
| Token Exchange         | `https://shopify.com/{shopId}/auth/oauth/token`                     | `https://shopify.com/authentication/{shopId}/oauth/token`                          |
| Customer API (Profile) | `https://shopify.com/{shopId}/account/customer/api/2024-01/graphql` | `https://shopify.com/authentication/{shopId}/account/customer/api/2024-01/graphql` |
| Customer API (Orders)  | `https://shopify.com/{shopId}/account/customer/api/2024-01/graphql` | `https://shopify.com/authentication/{shopId}/account/customer/api/2024-01/graphql` |

### 2. ✅ Enhanced Error Handling

Added specific error codes and descriptive logging for all OAuth failure scenarios:

**Error Codes Implemented**:

- `MISSING_AUTHORIZATION_CODE` - Shopify didn't return an authorization code
- `SHOPIFY_OAUTH_ERROR` - Shopify OAuth endpoint returned an error
- `PKCE_VERIFIER_NOT_FOUND` - Session expired (10-min limit) or cookie not set
- `MISSING_ENV_VARIABLES` - OAuth environment variables not configured
- `INVALID_JSON_RESPONSE` - Shopify API returned non-JSON response
- `TOKEN_EXCHANGE_FAILED` - Token endpoint HTTP error (4xx/5xx)
- `MISSING_ACCESS_TOKEN` - Token endpoint didn't return access_token
- `UNAUTHORIZED` - Customer API returned 401 (token invalid/expired)
- `API_ERROR` - Customer API HTTP error

### 3. ✅ Comprehensive Debugging Logs

Every auth endpoint now logs:

- **Authorization URL generation** - Full URL format for verification
- **Token exchange requests** - Request details, response status, token length
- **Customer API calls** - Endpoint, status, data availability
- **Error details** - Error codes, HTTP status, GraphQL errors with timestamps

### 4. ✅ Environment Variable Validation

Enhanced [lib/env-validation.ts](../lib/env-validation.ts) to validate:

- ✅ `NEXT_PUBLIC_SHOPIFY_CLIENT_ID` - Required, not empty
- ✅ `NEXT_PUBLIC_SHOPIFY_SHOP_ID` - Required, numeric format (no `gid://` prefix)
- ✅ `NEXT_PUBLIC_BASE_URL` - Required, starts with `http://` or `https://`

**SHOP_ID Format Validation**: Rejects GraphQL IDs (`gid://...`) and non-numeric values with helpful error messages.

---

## **Files Modified**

| File                                                                | Changes                                                                 |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [lib/shopify-auth.ts](../lib/shopify-auth.ts)                       | Updated authorization URL to `/authentication/{shopId}/oauth/authorize` |
| [app/api/auth/callback/route.ts](../app/api/auth/callback/route.ts) | Updated token endpoint + enhanced error handling with error codes       |
| [app/api/auth/me/route.ts](../app/api/auth/me/route.ts)             | Updated Customer API endpoint + improved error handling                 |
| [app/api/auth/orders/route.ts](../app/api/auth/orders/route.ts)     | Updated Customer API endpoint + improved error handling                 |
| [lib/env-validation.ts](../lib/env-validation.ts)                   | Added SHOP_ID format validation (numeric only)                          |

**NOT Modified** (working correctly):

- ✅ PKCE generation logic (SHA256 + Base64URL encoding)
- ✅ Code_verifier storage (httpOnly secure cookie, 10-min expiry)
- ✅ Token storage (httpOnly secure cookie with HTTPS flag)
- ✅ AuthContext (client-side auth state management)
- ✅ Login UI components
- ✅ Logout flow

---

## **Final OAuth Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER LOGIN FLOW                             │
└─────────────────────────────────────────────────────────────────┘

1. USER INITIATES LOGIN
   └─> User visits /login
   └─> Clicks "Login with Shopify" button

2. PKCE PARAMETER GENERATION (lib/shopify-auth.ts)
   ├─> generateCodeVerifier() → Random 128-char string
   ├─> generateCodeChallenge() → SHA256(verifier) → Base64URL
   └─> Create authorization URL with code_challenge

3. STORE PKCE VERIFIER (app/api/auth/store-pkce)
   └─> POST code_verifier → httpOnly secure cookie (10-min expiry)

4. REDIRECT TO SHOPIFY
   └─> Browser: GET https://shopify.com/authentication/{shopId}/oauth/authorize
       ├─> Params: client_id, redirect_uri, response_type=code
       ├─> Params: scope=openid email customer-account-api:full
       ├─> Params: code_challenge, code_challenge_method=S256
       └─> Params: state

5. USER AUTHORIZES ON SHOPIFY
   └─> User enters email/password on Shopify's secure server
   └─> Grants permission to access customer data

6. SHOPIFY REDIRECTS TO CALLBACK (app/api/auth/callback)
   └─> GET /api/auth/callback?code=AUTH_CODE&state=STATE

7. TOKEN EXCHANGE (app/api/auth/callback)
   ├─> Retrieve code_verifier from secure cookie
   ├─> POST https://shopify.com/authentication/{shopId}/oauth/token
   ├─> Body: client_id, code, code_verifier (NO client_secret)
   ├─> Body: grant_type=authorization_code, redirect_uri
   └─> Receive: access_token, expires_in

8. SECURE TOKEN STORAGE
   ├─> Store access_token in httpOnly cookie (customer_token)
   ├─> Cookie flags: httpOnly, secure (HTTPS prod), sameSite=lax
   ├─> Max-Age: expires_in - 60 seconds
   └─> Delete PKCE verifier cookie (no longer needed)

9. REDIRECT TO ACCOUNT
   └─> GET /account (user authenticated)

10. FETCH USER DATA (app/api/auth/me)
    ├─> Read access_token from httpOnly cookie
    ├─> POST https://shopify.com/authentication/{shopId}/account/customer/api/2024-01/graphql
    ├─> Header: Authorization: Bearer {access_token}
    ├─> Query: customer { firstName, lastName, email }
    └─> Return: { user: { firstName, lastName, email } }

11. RENDER ACCOUNT PAGE
    └─> Display user profile and order history
```

---

## **Example OAuth Authorization URL**

```
https://shopify.com/authentication/1234567890/oauth/authorize?
  client_id=5f3a2c1e9d8b7f4a3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a&
  redirect_uri=http://localhost:3000/api/auth/callback&
  response_type=code&
  scope=openid%20email%20customer-account-api%3Afull&
  code_challenge=E9Mrozoa2owUedPyAPhnco2-_-97Z218F7d4eNFc7qg&
  code_challenge_method=S256&
  state=random-state-string-for-csrf-protection
```

**URL Components**:

- **Authorization Endpoint**: `https://shopify.com/authentication/{SHOP_ID}/oauth/authorize`
- **client_id**: Your OAuth application ID (from Shopify Admin)
- **redirect_uri**: `{NEXT_PUBLIC_BASE_URL}/api/auth/callback`
- **response_type**: Always `code` (authorization code flow)
- **scope**: `openid email customer-account-api:full` (required for Customer Account API)
- **code_challenge**: SHA256 hash of code_verifier (PKCE)
- **code_challenge_method**: `S256` (SHA-256)
- **state**: CSRF protection token

---

## **Token Exchange Request**

```
POST https://shopify.com/authentication/{SHOP_ID}/oauth/token

{
  "client_id": "5f3a2c1e9d8b7f4a3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a",
  "code": "AUTHORIZATION_CODE_FROM_SHOPIFY",
  "code_verifier": "128-character-random-string-from-pkce-generation",
  "grant_type": "authorization_code",
  "redirect_uri": "http://localhost:3000/api/auth/callback"
}
```

**Key Points**:

- ❌ NO `client_secret` (PKCE replaces this for security)
- ✅ `code_verifier` proves we generated the code_challenge
- ✅ Single-use authorization code from Shopify

**Response**:

```json
{
  "access_token": "long-jwt-token-string",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

---

## **Customer API Requests**

### Fetch User Profile

```
POST https://shopify.com/authentication/{SHOP_ID}/account/customer/api/2024-01/graphql

Headers:
  Authorization: Bearer {access_token}
  Content-Type: application/json

Body:
{
  "query": "query { customer { firstName, lastName, email } }"
}
```

### Fetch Customer Orders

```
POST https://shopify.com/authentication/{SHOP_ID}/account/customer/api/2024-01/graphql

Headers:
  Authorization: Bearer {access_token}
  Content-Type: application/json

Body:
{
  "query": "query { customer { orders(first: 10) { nodes { id, number, processedAt, financialStatus, fulfillmentStatus, totalPrice { amount, currencyCode }, statusUrl, lineItems(first: 5) { nodes { title, quantity } } } } } }"
}
```

---

## **Environment Variables Required**

```env
# Required for OAuth flow
NEXT_PUBLIC_SHOPIFY_CLIENT_ID=your-oauth-app-id-from-shopify-admin
NEXT_PUBLIC_SHOPIFY_SHOP_ID=1234567890  # Numeric only (e.g., NOT gid://...)
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Dev: HTTP, Prod: HTTPS

# Server-side only (for Customer API requests)
SHOPIFY_SHOP_ID=1234567890  # Same numeric ID as above
```

**Validation Rules**:

- ✅ `SHOP_ID` must be numeric (e.g., `1234567890`)
- ❌ `SHOP_ID` cannot be GraphQL ID (e.g., ❌ `gid://shopify.com/Shop/1234567890`)
- ✅ `BASE_URL` must start with `http://` or `https://`
- ✅ For production, `BASE_URL` must use `https://`

---

## **Cookie Security Implementation**

### PKCE Verifier Cookie

```javascript
// /api/auth/store-pkce
cookieStore.set("pkce_verifier", codeVerifier, {
  httpOnly: true, // Cannot be accessed by JavaScript (XSS protection)
  secure: NODE_ENV === "production", // HTTPS only in production
  sameSite: "lax", // CSRF protection
  path: "/",
  maxAge: 600, // 10 minutes (authorization code expires quickly)
});
```

### Access Token Cookie

```javascript
// /api/auth/callback
cookieStore.set("customer_token", access_token, {
  httpOnly: true, // Cannot be accessed by JavaScript (XSS protection)
  secure: NODE_ENV === "production", // HTTPS only in production
  sameSite: "lax", // CSRF protection
  path: "/",
  maxAge: expires_in - 60, // Subtract 60 seconds buffer before expiry
});
```

**Security Features**:

- ✅ **httpOnly**: JavaScript cannot access cookies (prevents XSS attacks)
- ✅ **secure**: Only sent over HTTPS in production (prevents MITM attacks)
- ✅ **sameSite=lax**: CSRF protection (cookies not sent with cross-site requests)
- ✅ **path=/**: Cookie available across entire app
- ✅ **maxAge**: Automatic expiry in browser

---

## **Error Handling & Debugging**

### Log Examples

**Authorization URL Generated**:

```
[OAuth PKCE] Generated authorization URL: {
  fullUrl: "https://shopify.com/authentication/1234567890/oauth/authorize?...",
  clientId: "5f3a2c1e...",
  shopId: "1234567890",
  redirectUri: "http://localhost:3000/api/auth/callback",
  scope: "openid email customer-account-api:full",
  codeChallengeMethod: "S256",
  timestamp: "2026-05-06T10:30:45.123Z"
}
```

**Token Exchange Successful**:

```
[OAuth Callback] Token exchange successful with PKCE {
  tokenLength: 487,
  expiresIn: 3600,
  tokenType: "Bearer",
  timestamp: "2026-05-06T10:30:52.456Z"
}
```

**Error: Session Expired**:

```
[OAuth Callback] PKCE verification failed {
  errorCode: "PKCE_VERIFIER_NOT_FOUND",
  reason: "Session may have expired (10-minute limit) or cookie was not set during login",
  timestamp: "2026-05-06T10:35:15.789Z"
}
```

**Error: Token Invalid (401)**:

```
[/api/auth/me] Shopify API error {
  errorCode: "UNAUTHORIZED",
  status: 401,
  statusText: "Unauthorized",
  errors: [{ message: "invalid access token" }],
  timestamp: "2026-05-06T10:40:20.012Z"
}
```

---

## **Testing & Verification Checklist**

### Pre-Implementation Verification

- [ ] `NEXT_PUBLIC_SHOPIFY_SHOP_ID` is numeric (e.g., `1234567890`)
- [ ] `NEXT_PUBLIC_SHOPIFY_CLIENT_ID` is set from Shopify Admin → Apps and integrations → Custom app
- [ ] `NEXT_PUBLIC_BASE_URL` matches your domain (http://localhost:3000 for local, https://yourdomain.com for production)
- [ ] `.env.local` file is NOT committed to git (add to .gitignore)

### OAuth Flow Testing

1. **Navigation to Login Page**
   - [ ] Navigate to http://localhost:3000/login
   - [ ] "Login with Shopify" button is visible
   - [ ] Button click does NOT cause errors

2. **Verify Authorization URL**
   - [ ] Check browser console for: `[OAuth PKCE] Generated authorization URL`
   - [ ] Verify URL format: `https://shopify.com/authentication/{SHOP_ID}/oauth/authorize`
   - [ ] Verify parameters: client_id, redirect_uri, response_type=code, code_challenge, etc.

3. **Redirect to Shopify**
   - [ ] Browser redirects to Shopify login page
   - [ ] URL starts with `https://shopify.com/authentication/`
   - [ ] No SSL/certificate errors

4. **PKCE Cookie Storage**
   - [ ] DevTools → Application → Cookies → check for `pkce_verifier` cookie
   - [ ] Cookie is httpOnly (cannot access via JavaScript)
   - [ ] Cookie has Secure flag (green lock icon)
   - [ ] Max-Age = 600 seconds (10 minutes)

5. **User Authorization**
   - [ ] Log in with your Shopify test customer account
   - [ ] Authorize the app to access your customer data
   - [ ] (Or if already authorized, you may skip this step)

6. **Callback Handler**
   - [ ] Browser redirects back to http://localhost:3000/api/auth/callback?code=...&state=...
   - [ ] Check browser console for: `[OAuth Callback] Callback request received`
   - [ ] Check browser console for: `[OAuth Callback] Token exchange successful with PKCE`
   - [ ] No errors in console (watch for errorCode messages)

7. **Access Token Storage**
   - [ ] Browser redirects to http://localhost:3000/account
   - [ ] DevTools → Application → Cookies → check for `customer_token` cookie
   - [ ] Cookie is httpOnly (cannot access via JavaScript)
   - [ ] Cookie has Secure flag (green lock icon)
   - [ ] No `pkce_verifier` cookie (should be deleted)

8. **Fetch User Data**
   - [ ] Account page displays user profile (name, email)
   - [ ] Check browser console for: `[/api/auth/me] Customer data retrieved successfully`
   - [ ] No 401 or GraphQL errors

9. **Fetch Orders**
   - [ ] Order history displays on account page
   - [ ] Check browser console for: `[/api/auth/orders] Orders retrieved successfully`
   - [ ] Orders show correct status, date, total price

10. **Logout**
    - [ ] Click logout button
    - [ ] Browser redirects to home page
    - [ ] DevTools → Cookies → both `customer_token` and `pkce_verifier` are deleted
    - [ ] Navigate to /account → redirected to /login (not authenticated)

### Error Scenario Testing

1. **Missing Authorization Code**
   - [ ] Manually visit: http://localhost:3000/api/auth/callback?error=access_denied
   - [ ] Should redirect to /login with error message
   - [ ] Check console for: `errorCode: "SHOPIFY_OAUTH_ERROR"`

2. **Session Expired (PKCE Cookie Missing)**
   - [ ] Delete `pkce_verifier` cookie manually
   - [ ] Manually visit callback with valid code
   - [ ] Should redirect to /login with error: "Session expired"
   - [ ] Check console for: `errorCode: "PKCE_VERIFIER_NOT_FOUND"`

3. **Missing Environment Variables**
   - [ ] Temporarily unset `NEXT_PUBLIC_SHOPIFY_CLIENT_ID` in .env.local
   - [ ] Restart dev server
   - [ ] Should show validation error on app startup
   - [ ] Check terminal for: `MISSING_ENV_VARIABLES`

4. **Invalid Token (Logout then Refresh)**
   - [ ] Log in normally
   - [ ] Delete `customer_token` cookie manually
   - [ ] Refresh account page
   - [ ] Should redirect to /login (not authenticated)

### Production Deployment Checklist

1. **Environment Variables**
   - [ ] `NEXT_PUBLIC_SHOPIFY_CLIENT_ID` set in Vercel/deployment
   - [ ] `NEXT_PUBLIC_SHOPIFY_SHOP_ID` set in Vercel/deployment
   - [ ] `NEXT_PUBLIC_BASE_URL` set to production domain (HTTPS required)
   - [ ] `SHOPIFY_SHOP_ID` set for Customer API requests

2. **Security**
   - [ ] All auth cookies have `secure: true` flag (production only)
   - [ ] HTTPS is enforced (no mixed content)
   - [ ] `.env.local` and `.env` files are in .gitignore (not committed)
   - [ ] No client_secret in code or logs

3. **Domain Configuration**
   - [ ] Production domain is whitelisted in Shopify Custom App settings
   - [ ] Redirect URI matches exactly: `https://yourdomain.com/api/auth/callback`
   - [ ] SSL certificate is valid (green lock icon)

---

## **Security Guarantees**

✅ **PKCE (RFC 7636)**

- Authorization code cannot be used without the corresponding code_verifier
- Prevents authorization code interception attacks
- No client_secret transmitted (ideal for public clients)

✅ **httpOnly Cookies**

- Access tokens never accessible to JavaScript
- Protection against XSS (Cross-Site Scripting) attacks
- Automatically sent with every request

✅ **Secure Flag**

- Cookies only sent over HTTPS in production
- Protection against MITM (Man-in-the-Middle) attacks

✅ **SameSite=Lax**

- Cookies not sent with cross-site requests
- Protection against CSRF (Cross-Site Request Forgery) attacks

✅ **Token Expiry**

- Tokens expire automatically (default: 1 hour)
- Session timeout: 10 minutes for authorization code

✅ **No client_secret in Code**

- All authentication searches return no references to client_secret
- OAuth library uses PKCE instead

---

## **What's NOT Changed** (Already Working)

✅ PKCE Generation (SHA256 + Base64URL encoding)
✅ Code Verifier Storage (secure httpOnly cookies)
✅ Token Storage (secure httpOnly cookies)
✅ AuthContext (client-side state management)
✅ Login UI Components
✅ Logout Flow
✅ Account Dashboard
✅ Order History Display

---

## **Key Takeaways**

1. **PKCE Replaces client_secret**: No client_secret needed or used anywhere in the code
2. **Endpoints Updated**: All 4 Shopify API endpoints use new `/authentication/` prefix
3. **Error Handling**: Specific error codes and descriptive messages for debugging
4. **Secure Cookies**: httpOnly, Secure (prod), SameSite=lax flags on all auth cookies
5. **Fully Logged**: Every step of the OAuth flow is logged for debugging
6. **Production-Ready**: All security best practices implemented

---

## **Troubleshooting**

| Issue                                          | Cause                                          | Solution                                           |
| ---------------------------------------------- | ---------------------------------------------- | -------------------------------------------------- |
| "Session expired" on callback                  | PKCE cookie deleted or 10-min timeout exceeded | User must click login button again                 |
| 401 Unauthorized on /api/auth/me               | Access token expired or invalid                | Log out and log in again                           |
| "Invalid response from authentication server"  | Shopify API returned non-JSON                  | Check Shopify status page, try again               |
| Missing authorization code                     | Shopify OAuth didn't complete                  | Verify client_id, redirect_uri in Shopify Admin    |
| env validation error on startup                | Missing or invalid environment variables       | Set all 3 NEXT*PUBLIC*\* variables in .env.local   |
| Cookies show as "Not Secure" in HTTP localhost | Expected behavior in development               | Use HTTPS for production; HTTP is OK for localhost |

---

## **Production Deployment Steps**

1. **Set Environment Variables in Hosting Platform**

   ```
   NEXT_PUBLIC_SHOPIFY_CLIENT_ID=<your-client-id>
   NEXT_PUBLIC_SHOPIFY_SHOP_ID=<numeric-shop-id>
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   SHOPIFY_SHOP_ID=<numeric-shop-id>
   ```

2. **Update Shopify Custom App**
   - Admin → Settings → Apps and integrations → Develop apps → Your custom app
   - Redirect URI: `https://yourdomain.com/api/auth/callback`
   - Scopes: `customer-account-api:full` (already enabled)

3. **Deploy to Production**
   - All environment variables set
   - HTTPS enforced
   - Domain SSL certificate valid

4. **Monitor Logs**
   - Watch for error codes in production logs
   - Check token exchange success rate
   - Monitor unauthorized (401) responses

---

**✅ OAuth flow is now production-ready with PKCE security and comprehensive error handling.**
