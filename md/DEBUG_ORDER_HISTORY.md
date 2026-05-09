# 🔍 Shopify Order History API - Complete Debug Guide

## Overview

The order history API has been enhanced with **comprehensive logging** to identify exactly where retrieval fails. This document explains the changes, how to use the logs, and how to troubleshoot.

---

## 📋 Changes Made

### 1. **Backend: `/api/account/orders/route.ts`** ✅ Enhanced

**What Changed:**

- Added detailed logging at every step of order retrieval
- Includes visual indicators (✅ ✅ ❌ ⚠️ ) for success/failure
- Logs customer ID, email, and order count
- Tests both minimal query (test phase) and full query (with details)
- Validates endpoint discovery returns a valid URL
- Logs complete GraphQL errors (not just count)
- Tracks whether customer has 0 orders vs API failure

**Key Logging Points:**

```
[/api/account/orders] ====== ORDER FETCH REQUEST START ======
  └─ Token validation (format check)
  └─ API metadata discovery (.well-known endpoint)
  └─ Minimal test query (customer ID, email, 0 orders)
  └─ Full detailed query (with all order fields)
  └─ Complete GraphQL response parsing
[/api/account/orders] ====== ORDER FETCH REQUEST END (SUCCESS/ERROR) ======
```

### 2. **Frontend: `/app/account/page.tsx`** ✅ Enhanced

**What Changed:**

- Added browser console logs for API responses
- Logs user ID, email, and order count
- Logs response status codes
- Shows empty state message with debugging hint: _"Check the browser console for debugging details"_
- No redirect on empty orders (only on 401 Unauthorized)

**Key Logging Points:**

```javascript
[Account] Fetching user data from /api/account/me
[Account] User data response status: 200
[Account] User data retrieved: { hasUser: true, userId: "...", userEmail: "..." }
[Account] Orders data retrieved: { orderCount: 0, hasOrders: true }
```

---

## 🧪 How to Debug Order Retrieval Issues

### **Step 1: Start the App and Navigate to Account**

1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000`
3. Login with your Shopify test account
4. Navigate to `/account` page
5. **Open Browser DevTools:** `F12` → **Console** tab

### **Step 2: Check Browser Console (Frontend Logs)**

In **DevTools Console**, look for logs starting with `[Account]`:

```
[Account] Fetching user data from /api/account/me
[Account] User data response status: 200
[Account] User data retrieved: {
  hasUser: true,
  userId: "gid://shopify/Customer/...",
  userEmail: "your-email@example.com"
}
[Account] Fetching orders from /api/account/orders
[Account] Orders response status: 200
[Account] Orders data retrieved: {
  orderCount: 0,
  hasOrders: true,
  ordersLength: 0
}
```

**Interpret the logs:**

- ✅ `orderCount: 0` = API returned successfully, but customer has 0 orders
- ⚠️ `ordersLength: undefined` = API response is malformed
- ✅ `Orders response status: 200` = Backend didn't error

### **Step 3: Check Server Logs (Backend Logs)**

In **terminal where `npm run dev` is running**, look for logs starting with `[/api/account/orders]`:

```
[/api/account/orders] ====== ORDER FETCH REQUEST START ======
[/api/account/orders] ✅ Token found {
  tokenLength: 52,
  tokenPrefix: shcat_,
  timestamp: "2026-05-07T10:30:45.123Z"
}
[/api/account/orders] ✅ Token format valid
[/api/account/orders] Fetching Customer Account API metadata (.well-known endpoint)...
[/api/account/orders] ✅ API metadata retrieved successfully {
  graphqlUrl: "https://...",
  timestamp: "..."
}
```

### **Step 4: Identify Failure Point**

The logs will show exactly where the issue occurs:

#### **Scenario A: ✅ All logs green, but 0 orders**

```
[/api/account/orders] ⚠️ NO ORDERS FOUND - Customer has 0 orders in Shopify {
  customerId: "gid://shopify/Customer/...",
  customerEmail: "your-email@example.com",
  timestamp: "..."
}
```

**This means:**

- Token is valid ✅
- API connection is working ✅
- Customer is authenticated ✅
- **But:** Customer has 0 orders in Shopify database
- **Root cause:** Guest checkout orders or customer account mismatch

**Next steps:**

1. Go to Shopify Admin → Customers → Find your customer
2. Check if orders are linked to this customer
3. If not, you may have placed orders as guest checkout
4. See **Guest Checkout Migration** section below

#### **Scenario B: ❌ Token validation fails**

```
[/api/account/orders] ❌ FAILURE: Invalid token format {
  errorCode: "INVALID_TOKEN_PREFIX",
  tokenPrefix: "xxxx",
  expected: "shcat_"
}
```

**Root cause:** Token doesn't start with `shcat_`

**Fix:**

- Clear cookies: `document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires="+new Date().toUTCString()+";path=/"))`
- Logout and re-login with OAuth flow
- Check OAuth scope configuration

#### **Scenario C: ❌ API endpoint discovery fails**

```
[/api/account/orders] ❌ FAILURE: API endpoint is empty/undefined {
  apiMetadata: "{\"graphql_url\": null}"
}
```

**Root cause:** `.well-known/customer-account-api` endpoint discovery not working

**Fix:**

1. Check `lib/shopify-auth.ts` → `fetchCustomerAccountApiMetadata()` function
2. Verify Shopify shop domain is correct: `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`
3. Test discovery endpoint manually:
   ```bash
   curl "https://{SHOP_DOMAIN}/.well-known/customer-account-api"
   ```

#### **Scenario D: ❌ GraphQL query fails**

```
[/api/account/orders] ❌ FAILURE: GraphQL errors in test query response {
  errors: [
    {
      "message": "Field 'orders' doesn't exist on type 'Customer'",
      "extensions": { "code": "GRAPHQL_ERROR" }
    }
  ]
}
```

**Root cause:** GraphQL schema issue or wrong API endpoint

**Possible issues:**

1. Using Admin API instead of Customer Account API
2. Missing required scope: `customer-account-api:full`
3. Order fields not available in Customer Account API schema

**Fix:**

1. Verify OAuth scopes in `.env.local`:
   ```
   SHOPIFY_CUSTOMER_SCOPES=openid email profile phone customer-account-api:full
   ```
2. Check endpoint is Customer Account API (not Admin API)
3. Verify query structure matches Shopify schema

#### **Scenario E: ❌ 401 Unauthorized**

```
[/api/account/orders] ❌ FAILURE: Shopify API HTTP error {
  status: 401,
  statusText: "Unauthorized"
}
[/api/account/orders] Token invalid (401) - clearing cookie
```

**Root cause:** Token expired or invalid

**Fix:**

1. Logout: `/api/auth/logout`
2. Re-login with OAuth flow
3. Token will be refreshed from Shopify

---

## 🧬 Code-Level Debugging

### **Add Custom Logging to `lib/shopify-auth.ts`**

If endpoint discovery fails, add logging to `fetchCustomerAccountApiMetadata()`:

```typescript
export async function fetchCustomerAccountApiMetadata() {
  const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  console.log("[shopify-auth] Fetching Customer Account API metadata from:", {
    shopDomain,
    url: `https://${shopDomain}/.well-known/customer-account-api`,
  });

  const response = await fetch(
    `https://${shopDomain}/.well-known/customer-account-api`,
  );
  const data = await response.json();

  console.log("[shopify-auth] Retrieved metadata:", {
    status: response.status,
    graphql_url: data.graphql_url,
    graphql_api: data.graphql_api,
  });

  return data;
}
```

### **Test GraphQL Query Manually**

Use this test query directly in your API route with `console.log`:

```graphql
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
        }
      }
    }
  }
}
```

---

## 🔐 Verify OAuth Configuration

### **Check Scopes**

Your app must have these scopes in `.env.local`:

```env
SHOPIFY_CUSTOMER_SCOPES=openid email profile phone customer-account-api:full
```

**Each scope is critical:**

- `openid` - OpenID Connect support
- `email` - Access to customer email
- `profile` - Access to customer profile (name, display name)
- `phone` - Access to phone number
- `customer-account-api:full` - **Required for order history**

### **Verify Callback URL**

The OAuth redirect URI must match in:

1. **`.env.local`:**

   ```env
   SHOPIFY_CALLBACK_URL=http://localhost:3000/api/auth/callback
   # or for production:
   # SHOPIFY_CALLBACK_URL=https://yourdomain.com/api/auth/callback
   ```

2. **Shopify Admin** → App & integrations → Your app → Configuration:
   - Redirection URLs: `http://localhost:3000/api/auth/callback`

### **Test OAuth Token**

After logging in, test if token is valid:

```javascript
// In browser console after login
fetch("/api/account/me")
  .then((r) => r.json())
  .then(console.log);
```

Expected response:

```json
{
  "user": {
    "id": "gid://shopify/Customer/...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

---

## 👥 Guest Checkout Order Migration

If old orders are missing but exist in Shopify Admin as **guest checkout orders**, here's how to fix:

### **Identify Guest Orders in Shopify Admin**

1. Go to **Shopify Admin** → **Customers**
2. Search for your email or name
3. View customer details
4. Scroll to **Orders** section
5. Check if orders appear there

### **Solution: Associate Guest Orders with Customer Account**

**In Shopify Admin:**

1. Find the **guest checkout order** (search by order number)
2. Click the order to open details
3. Scroll to **Customer** section
4. Click **Edit**
5. Select your customer account from dropdown
6. Click **Save**

**Alternative: Use Shopify GraphQL Admin API**

Update your backend to associate orders with customer (requires `orders:manage` scope):

```graphql
mutation AssignOrderToCustomer {
  orderUpdate(
    input: {
      id: "gid://shopify/Order/1234567890"
      customerId: "gid://shopify/Customer/..."
    }
  ) {
    order {
      id
      customer {
        id
      }
    }
  }
}
```

---

## 📊 Order Retrieval Test Checklist

Use this checklist to systematically verify order retrieval:

- [ ] **Authenticated User**
  - [ ] `/api/account/me` returns user with ID and email
  - [ ] Token starts with `shcat_`
  - [ ] Token is in httpOnly cookie

- [ ] **OAuth Scopes**
  - [ ] `.env.local` includes `customer-account-api:full`
  - [ ] Shopify app OAuth credentials are correct
  - [ ] Callback URL matches Shopify Admin configuration

- [ ] **API Endpoint**
  - [ ] `.well-known/customer-account-api` returns valid GraphQL URL
  - [ ] GraphQL endpoint is reachable
  - [ ] Request headers include `Authorization: {token}`

- [ ] **GraphQL Query**
  - [ ] Query syntax is correct (nested `emailAddress`)
  - [ ] Query uses Customer Account API schema (not Admin API)
  - [ ] `orders` field is included
  - [ ] First parameter is set (e.g., `first: 20`)

- [ ] **Customer Account**
  - [ ] Customer ID matches Shopify Admin
  - [ ] Customer has orders linked (not guest checkout)
  - [ ] Orders are `processed` status (not draft/pending)

- [ ] **Browser Console**
  - [ ] No 401 errors
  - [ ] No parsing errors
  - [ ] Order count matches (0 or actual count)

- [ ] **Server Logs**
  - [ ] All ✅ indicators in order fetch logs
  - [ ] No ❌ or ⚠️ errors
  - [ ] Customer email logs correctly

---

## 🚀 Next Steps After Debug

### **If orders are now showing:**

1. Verify all order fields display correctly (total, date, status)
2. Test order tracking links (`statusUrl`)
3. Performance: Check if pagination needed for 100+ orders
4. Clear old browser cache: `Cmd/Ctrl + Shift + Delete`

### **If orders are still zero:**

1. Review **Scenario A** section above
2. Verify all guest orders are migrated to customer account
3. Test with Shopify GraphQL Admin API to confirm orders exist
4. Check Shopify app permissions and scope settings

### **If API errors occur:**

1. Review applicable scenario (B, C, D, or E)
2. Follow the specific fix instructions
3. Re-run the flow and check logs again

---

## 📝 Example Log Output (Successful Scenario)

**Server Terminal:**

```
[/api/account/orders] ====== ORDER FETCH REQUEST START ======
[/api/account/orders] ✅ Token found {
  tokenLength: 52,
  tokenPrefix: "shcat_",
  tokenSuffix: "abc123xyz",
  timestamp: "2026-05-07T10:45:32.123Z"
}
[/api/account/orders] ✅ Token format valid
[/api/account/orders] Fetching Customer Account API metadata (.well-known endpoint)...
[/api/account/orders] ✅ API metadata retrieved successfully {
  graphqlUrl: "https://storewallha.myshopify.com/api/2024-10/graphql",
  timestamp: "2026-05-07T10:45:32.145Z"
}
[/api/account/orders] Sending minimal test GraphQL query
[/api/account/orders] Test query HTTP response received {
  status: 200,
  statusText: "OK",
  timestamp: "2026-05-07T10:45:32.234Z"
}
[/api/account/orders] Test query response parsed {
  status: 200,
  hasErrors: false,
  hasData: true,
  timestamp: "2026-05-07T10:45:32.245Z"
}
[/api/account/orders] ✅ Test query succeeded - Customer data retrieved {
  customerId: "gid://shopify/Customer/7123456789",
  customerDisplayName: "John Doe",
  customerEmail: "john@example.com",
  orderEdgeCount: 3,
  timestamp: "2026-05-07T10:45:32.256Z"
}
[/api/account/orders] Sending full detailed GraphQL query
[/api/account/orders] ✅ SUCCESS: Orders retrieved and normalized {
  count: 3,
  orderIds: "gid://shopify/Order/1, gid://shopify/Order/2, gid://shopify/Order/3",
  timestamp: "2026-05-07T10:45:32.301Z"
}
[/api/account/orders] ====== ORDER FETCH REQUEST END (SUCCESS) ======
```

**Browser Console:**

```
[Account] Fetching user data from /api/account/me
[Account] User data response status: 200
[Account] User data retrieved: {
  hasUser: true,
  userId: "gid://shopify/Customer/7123456789",
  userEmail: "john@example.com"
}
[Account] Fetching orders from /api/account/orders
[Account] Orders response status: 200
[Account] Orders data retrieved: {
  orderCount: 3,
  hasOrders: true,
  ordersLength: 3
}
[Account] ✅ Successfully set 3 orders
```

---

## ⚡ Quick Troubleshooting Commands

```bash
# Clear session and re-login
1. DevTools → Application → Cookies → Delete all
2. Reload page
3. Login again with OAuth

# Check if orders exist in Shopify
# Use Shopify CLI:
shopify admin api graphql -q '
query {
  customers(first: 1, query: "email:your-email@example.com") {
    edges {
      node {
        id
        email
        orders(first: 20) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }
  }
}
'

# Verify token format in cookie
document.cookie.split('; ').find(c => c.startsWith('shopify_customer_access_token')).split('=')[1]
# Should start with: shcat_
```

---

## 📞 Support

If debugging steps don't resolve the issue:

1. **Enable full debug logging:**
   - Add `console.log` for every variable in routes
   - Check browser Network tab for API requests/responses

2. **Verify Shopify configuration:**
   - Correct shop domain: `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`
   - Correct app credentials: `NEXT_PUBLIC_SHOPIFY_CUSTOMER_CLIENT_ID`
   - Scopes match app setup

3. **Check Shopify documentation:**
   - Customer Account API: https://shopify.dev/docs/api/customer-account/latest
   - Orders schema: https://shopify.dev/docs/api/customer-account/latest/objects/Order

---

**Last Updated:** May 7, 2026  
**Status:** ✅ Debugging infrastructure complete  
**Next Review:** After orders display successfully
