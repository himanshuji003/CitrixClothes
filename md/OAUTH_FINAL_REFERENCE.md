# 🔐 SHOPIFY OAUTH - FINAL REFERENCE GUIDE

**Your Store**: storewallha.myshopify.com | **Shop ID**: 74597990554 | **Flow**: PKCE

---

## **FINAL OAUTH URLS FOR YOUR STORE**

### 1️⃣ Authorization URL (Step 1 - User clicks Login)

```
https://shopify.com/authentication/74597990554/oauth/authorize?
  client_id=2802dfde-76d6-4fe0-8a6f-e7f3741554eb&
  redirect_uri=http://localhost:3000/api/auth/callback&
  response_type=code&
  scope=openid%20email%20customer-account-api%3Afull&
  code_challenge=<SHA256-HASH>&
  code_challenge_method=S256&
  state=<RANDOM-STATE>
```

**Actual URL (without PKCE params):**

```
https://shopify.com/authentication/74597990554/oauth/authorize
```

### 2️⃣ Token Exchange URL (Step 2 - After user authorizes)

```
POST https://shopify.com/authentication/74597990554/oauth/token

Headers:
  Content-Type: application/json

Body:
{
  "client_id": "2802dfde-76d6-4fe0-8a6f-e7f3741554eb",
  "code": "<CODE_FROM_SHOPIFY>",
  "code_verifier": "<RANDOM_128_CHAR_STRING>",
  "grant_type": "authorization_code",
  "redirect_uri": "http://localhost:3000/api/auth/callback"
}
```

**Actual Endpoint:**

```
https://shopify.com/authentication/74597990554/oauth/token
```

### 3️⃣ Customer Profile API (Step 3 - Fetch user data)

```
POST https://shopify.com/authentication/74597990554/account/customer/api/2024-01/graphql

Headers:
  Authorization: Bearer <ACCESS_TOKEN>
  Content-Type: application/json

Body:
{
  "query": "query { customer { firstName lastName email } }"
}
```

**Actual Endpoint:**

```
https://shopify.com/authentication/74597990554/account/customer/api/2024-01/graphql
```

### 4️⃣ Customer Orders API (Step 4 - Fetch orders)

```
POST https://shopify.com/authentication/74597990554/account/customer/api/2024-01/graphql

Headers:
  Authorization: Bearer <ACCESS_TOKEN>
  Content-Type: application/json

Body:
{
  "query": "query { customer { orders(first: 10) { nodes { id number processedAt financialStatus fulfillmentStatus totalPrice { amount currencyCode } statusUrl lineItems(first: 5) { nodes { title quantity } } } } } }"
}
```

**Actual Endpoint:**

```
https://shopify.com/authentication/74597990554/account/customer/api/2024-01/graphql
```

---

## **ENVIRONMENT VARIABLES FOR YOUR STORE**

```env
# OAuth Configuration
NEXT_PUBLIC_SHOPIFY_CLIENT_ID=2802dfde-76d6-4fe0-8a6f-e7f3741554eb
NEXT_PUBLIC_SHOPIFY_SHOP_ID=74597990554
SHOPIFY_SHOP_ID=74597990554
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# For Production:
# NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

---

## **COMPLETE AUTHENTICATION FLOW**

```
1. USER VISITS /login
   └─> Page displays "Login with Shopify" button

2. USER CLICKS BUTTON
   └─> Frontend calls getShopifyLoginUrl()
   └─> Generates PKCE parameters:
       • code_verifier = random 128-char string
       • code_challenge = SHA256(code_verifier) → Base64URL

3. STORE PKCE VERIFIER
   └─> POST /api/auth/store-pkce
   └─> Stores code_verifier in httpOnly cookie (10-min expiry)

4. REDIRECT TO SHOPIFY
   └─> Browser redirects to:
       https://shopify.com/authentication/74597990554/oauth/authorize?
         client_id=2802dfde...&
         redirect_uri=http://localhost:3000/api/auth/callback&
         response_type=code&
         scope=openid email customer-account-api:full&
         code_challenge=E9Mroza...&
         code_challenge_method=S256&
         state=...

5. SHOPIFY LOGIN PAGE
   └─> User sees Shopify's login page
   └─> User enters email and password
   └─> User clicks "Authorize" to grant permissions

6. SHOPIFY REDIRECTS BACK
   └─> GET /api/auth/callback?code=AUTH_CODE&state=STATE

7. TOKEN EXCHANGE (Backend)
   └─> POST https://shopify.com/authentication/74597990554/oauth/token
   ├─> Send: client_id, code, code_verifier, redirect_uri
   ├─> Shopify verifies: SHA256(code_verifier) == code_challenge ✓
   └─> Receive: access_token (JWT), expires_in (3600)

8. STORE ACCESS TOKEN
   └─> POST /api/auth/callback stores access_token in httpOnly cookie
   └─> Delete PKCE verifier cookie (no longer needed)

9. REDIRECT TO ACCOUNT
   └─> GET /account (now authenticated)

10. FETCH USER DATA
    └─> AuthContext calls GET /api/auth/me
    └─> Backend retrieves access_token from httpOnly cookie
    └─> POST https://shopify.com/authentication/74597990554/account/customer/api/2024-01/graphql
    └─> Query: customer { firstName lastName email }
    └─> Return user data to frontend

11. RENDER ACCOUNT PAGE
    └─> Display user profile
    └─> Display order history (via /api/auth/orders)

AUTHENTICATED ✅
```

---

## **KEY DIFFERENCES FROM OLD IMPLEMENTATION**

| Old                      | New                                              | Change         |
| ------------------------ | ------------------------------------------------ | -------------- |
| `/auth/oauth/authorize`  | `/authentication/{shopId}/oauth/authorize`       | URL format     |
| `/auth/oauth/token`      | `/authentication/{shopId}/oauth/token`           | URL format     |
| `/account/customer/api/` | `/authentication/{shopId}/account/customer/api/` | URL format     |
| Generic errors           | 9 specific error codes                           | Error handling |
| Minimal logs             | 20+ debug logs                                   | Logging        |
| Basic validation         | Full env validation                              | Validation     |

---

## **SECURITY CHECKLIST**

✅ **PKCE**: Authorization code cannot be intercepted and reused
✅ **httpOnly Cookies**: JavaScript cannot access tokens (XSS protection)
✅ **Secure Flag**: Cookies only sent over HTTPS in production
✅ **SameSite=Lax**: CSRF protection enabled
✅ **Token Expiry**: Automatic 1-hour expiration
✅ **Session Timeout**: PKCE verifier expires in 10 minutes
✅ **No client_secret**: PKCE provides security instead
✅ **Error Logging**: Specific error codes for debugging
✅ **Input Validation**: Env vars validated at startup
✅ **State Parameter**: CSRF protection via state token

---

## **TESTING YOUR OAUTH FLOW**

### Quick Test (Local)

```bash
# 1. Start dev server
npm run dev

# 2. Open browser
http://localhost:3000/login

# 3. Click "Login with Shopify"

# 4. Open DevTools → Console
# Look for: [OAuth PKCE] Generated authorization URL

# 5. Check DevTools → Application → Cookies
# Should see: pkce_verifier (secure, httpOnly, 600s)

# 6. After logging in, check cookies again
# Should see: customer_token (secure, httpOnly)
# pkce_verifier should be deleted

# 7. Navigate to account page
# Should display your profile & orders
```

### Manual Testing with cURL

```bash
# 1. Start dev server
npm run dev

# 2. Call login API to get authorization URL
curl http://localhost:3000/api/auth/get-login-url

# 3. Manually visit the returned URL in browser
# (This would be the authorization URL)

# 4. After user authorizes, Shopify redirects with code
# That's when /api/auth/callback is called

# 5. Check stored token
curl -b "customer_token=..." http://localhost:3000/api/auth/me
```

---

## **PRODUCTION DEPLOYMENT**

### Shopify Admin Configuration

```
Store: storewallha.myshopify.com
Apps → Custom Apps → Your App
  ├─ Client ID: 2802dfde-76d6-4fe0-8a6f-e7f3741554eb
  └─ Redirect URI: https://yourdomain.com/api/auth/callback
```

### Environment Variables (Production)

```env
NEXT_PUBLIC_SHOPIFY_CLIENT_ID=2802dfde-76d6-4fe0-8a6f-e7f3741554eb
NEXT_PUBLIC_SHOPIFY_SHOP_ID=74597990554
SHOPIFY_SHOP_ID=74597990554
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Deployment Checklist

- [ ] SSL/TLS certificate installed
- [ ] HTTPS redirects working
- [ ] Environment variables set in hosting platform
- [ ] Shopify Custom App redirect URI updated
- [ ] PKCE cookies have `secure: true` flag
- [ ] No `.env` files committed to git
- [ ] Error logs monitored for errors

---

## **ERROR CODES & MEANINGS**

| Error Code                   | Cause                      | Solution                          |
| ---------------------------- | -------------------------- | --------------------------------- |
| `MISSING_AUTHORIZATION_CODE` | Shopify didn't return code | Try login again                   |
| `SHOPIFY_OAUTH_ERROR`        | User denied permission     | Check Shopify OAuth settings      |
| `PKCE_VERIFIER_NOT_FOUND`    | Session expired (10 min)   | User must click login again       |
| `MISSING_ENV_VARIABLES`      | Config missing             | Set env vars and restart          |
| `INVALID_JSON_RESPONSE`      | Bad API response           | Check Shopify status              |
| `TOKEN_EXCHANGE_FAILED`      | Token endpoint error       | Verify client_id and redirect_uri |
| `MISSING_ACCESS_TOKEN`       | No token in response       | Check Shopify API status          |
| `UNAUTHORIZED`               | Token invalid/expired      | User must log in again            |
| `API_ERROR`                  | Customer API failed        | Check token and API endpoint      |

---

## **CONSOLE LOGS TO EXPECT**

### Successful Flow

```
✅ [OAuth PKCE] Generated authorization URL: { ... }
✅ [Store PKCE] Code_verifier stored successfully
✅ [OAuth Callback] Callback request received { ... }
✅ [OAuth Callback] PKCE code_verifier retrieved from secure cookie
✅ [OAuth Callback] Token exchange successful with PKCE { ... }
✅ [OAuth Callback] PKCE OAuth flow complete - redirecting to account page
✅ [/api/auth/me] Customer data retrieved successfully { ... }
✅ [/api/auth/orders] Orders retrieved successfully { count: 5 }
```

### Error Flow

```
❌ [OAuth Callback] PKCE verification failed { errorCode: 'PKCE_VERIFIER_NOT_FOUND' }
❌ [OAuth Callback] Token exchange failed { errorCode: 'TOKEN_EXCHANGE_FAILED' }
❌ [/api/auth/me] Shopify API error { errorCode: 'UNAUTHORIZED', status: 401 }
```

---

## **TROUBLESHOOTING**

| Problem                       | Diagnosis                      | Fix                             |
| ----------------------------- | ------------------------------ | ------------------------------- |
| "Session expired" error       | PKCE cookie deleted or expired | User clicks login again         |
| 401 on /api/auth/me           | Token expired or invalid       | User logs out and logs in       |
| Authorization URL not showing | Missing env variables          | Set NEXT*PUBLIC*\* in .env      |
| Cookies show as "Not Secure"  | HTTP in development            | Expected; production uses HTTPS |
| Redirect loop                 | Mismatched redirect_uri        | Verify in Shopify Admin         |
| "Invalid response" error      | Shopify API down               | Check Shopify status page       |

---

## **FINAL STATUS**

✅ **Endpoints**: All 4 using `/authentication/` prefix
✅ **PKCE**: Correctly implemented (SHA256 + Base64URL)
✅ **Security**: httpOnly + Secure + SameSite cookies
✅ **Error Handling**: 9 specific error codes
✅ **Logging**: 20+ debug statements
✅ **Validation**: Env vars checked at startup
✅ **Environment**: All variables set in .env.local
✅ **Production**: Ready to deploy

**🟢 OAUTH IMPLEMENTATION COMPLETE AND READY FOR TESTING**

---

## **NEXT: START DEV SERVER & TEST**

```bash
npm run dev
# Navigate to http://localhost:3000/login
# Click "Login with Shopify"
# Follow the OAuth flow
# Verify account page loads with your profile
```
