# 🚀 PRODUCTION DEPLOYMENT CHECKLIST

**Application:** Citrix Clothes - Shopify Customer Account OAuth  
**Tech Stack:** Next.js App Router, TypeScript, Tailwind, Shopify Customer Account API  
**Deployment Target:** Vercel  
**Last Updated:** May 7, 2026

---

## ✅ PRE-DEPLOYMENT VERIFICATION

### 1. Environment Configuration

- [ ] All required env vars validated in `.env.local`
  - `NEXT_PUBLIC_BASE_URL` (HTTPS in production)
  - `NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN`
  - `NEXT_PUBLIC_SHOPIFY_CLIENT_ID`
  - `SHOPIFY_CUSTOMER_SCOPES`
- [ ] `.env.local` is in `.gitignore` (never committed)
- [ ] `.env.example` updated with current requirements
- [ ] No hardcoded secrets in codebase
- [ ] No credentials in git history (`git log --all --source --full-history -- "*password*"`)

### 2. Code Quality

- [ ] TypeScript compilation succeeds: `npm run build`
- [ ] No TypeScript errors or warnings
- [ ] No ESLint warnings: `npm run lint` (if configured)
- [ ] All console.log statements reviewed (no sensitive data)
- [ ] Dead code removed
- [ ] Unused imports cleaned up
- [ ] No `any` types used (use proper typing)
- [ ] React warnings/errors resolved
- [ ] No hydration mismatches (SSR/client differences)

### 3. Security Audit

- [ ] All auth cookies use `httpOnly: true`
- [ ] All auth cookies use `secure: process.env.NODE_ENV === 'production'`
- [ ] All auth cookies use `sameSite: 'lax'`
- [ ] PKCE flow implemented correctly
- [ ] State parameter validation enabled
- [ ] CSRF tokens validated
- [ ] XSS protection reviewed (no innerHTML usage)
- [ ] No sensitive data in localStorage
- [ ] API error responses don't leak stack traces
- [ ] API error responses don't leak secrets
- [ ] Redirect URLs are validated (no open redirects)
- [ ] rate limiting implemented (if applicable)

### 4. Error Handling

- [ ] API endpoints don't return stack traces in production
- [ ] User-facing errors are generic (never leak implementation details)
- [ ] 401/403 responses handled correctly
- [ ] 500 errors don't expose sensitive data
- [ ] Token expiration handled gracefully
- [ ] Network timeouts handled with clear error messages
- [ ] Database errors don't leak connection strings

### 5. Performance & Optimization

- [ ] Build succeeds without warnings
- [ ] Bundle size reviewed
- [ ] Images optimized and lazy-loaded
- [ ] Database queries optimized
- [ ] No N+1 query problems
- [ ] API caching implemented where appropriate
- [ ] Static assets have cache headers

### 6. Testing

- [ ] OAuth login flow tested end-to-end
- [ ] OAuth callback validated (state, PKCE)
- [ ] Token refresh tested
- [ ] Account page loads with valid token
- [ ] Order history displays correctly
- [ ] Unauthenticated access redirects to login
- [ ] Token expiration handled
- [ ] Logout clears cookies properly
- [ ] Error scenarios tested (wrong credentials, network timeout, etc.)

---

## 🔧 SHOPIFY ADMIN CONFIGURATION

### 1. OAuth Application Setup

- [ ] App created in Shopify Admin
- [ ] App name set correctly
- [ ] App icon uploaded (optional)
- [ ] "Customer Account API" is enabled
- [ ] Scopes configured:
  - [ ] `openid` (OpenID Connect)
  - [ ] `email` (Read customer email)
  - [ ] `customer-account-api:full` (Full API access)
- [ ] Redirect URI set to: `https://yourproductionurl.com/api/auth/callback`
- [ ] All redirect URIs removed except production URL
- [ ] API credentials saved (Client ID, etc.)

### 2. API Credentials

- [ ] Client ID obtained: `NEXT_PUBLIC_SHOPIFY_CLIENT_ID`
- [ ] Client Secret stored securely (NOT used in PKCE flow)
- [ ] Customer Account API endpoint verified
- [ ] API version set to latest stable

---

## 🌐 VERCEL DEPLOYMENT SETUP

### 1. Repository Setup

- [ ] Code pushed to GitHub (or GitLab/Bitbucket)
- [ ] Main branch is stable and tested
- [ ] No uncommitted changes
- [ ] No sensitive files in repo
- [ ] `.gitignore` includes `.env.local`

### 2. Vercel Project Configuration

- [ ] Project imported to Vercel from Git
- [ ] Production branch set to `main` (or `master`)
- [ ] Build command verified: `next build`
- [ ] Output directory verified: `.next`
- [ ] Node.js version set to LTS (v18 or v20)

### 3. Environment Variables in Vercel

- [ ] Navigate to: Project → Settings → Environment Variables
- [ ] Add each variable with correct value:
  - [ ] `NEXT_PUBLIC_BASE_URL=https://yourproductionurl.com`
  - [ ] `NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN=mystore.myshopify.com`
  - [ ] `NEXT_PUBLIC_SHOPIFY_CLIENT_ID=your_client_id`
  - [ ] `SHOPIFY_CUSTOMER_SCOPES=openid email customer-account-api:full`
- [ ] ALL variables set for "Production" environment
- [ ] Variables NOT exposed to client (only NEXT*PUBLIC*\* are)
- [ ] Save and redeploy

### 4. Domain Configuration

- [ ] Custom domain added to Vercel project
- [ ] DNS records configured correctly
- [ ] SSL certificate auto-issued (Vercel handles this)
- [ ] HTTPS working for domain
- [ ] Vercel auto-redirect HTTP → HTTPS enabled

### 5. Redirects in Shopify Admin

- [ ] Update Shopify app redirect URI to: `https://yourdomain.com/api/auth/callback`
- [ ] Verify in Shopify Admin under: Apps and sales channels → Your app → Configuration
- [ ] Test the redirect URI works

---

## 📋 VERCEL DEPLOYMENT STEPS

### Initial Deployment

1. **Push code to GitHub:**

   ```bash
   git add .
   git commit -m "Production: ready for deployment"
   git push origin main
   ```

2. **Import to Vercel:**
   - Visit https://vercel.com
   - Click "New Project"
   - Select your Git repository
   - Click "Import"

3. **Configure environment variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add all 4 required variables
   - Set scope to "Production"

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Verify deployment was successful

5. **Update Shopify Admin:**
   - Get your Vercel URL (e.g., https://citrix-clothes.vercel.app)
   - Set custom domain if desired
   - Update redirect URI in Shopify Admin

6. **Test in production:**
   - Visit https://yourdomain.com
   - Click Login
   - Authorize on Shopify
   - Verify redirect to /account works
   - Check /account/orders displays correctly

### Redeployment After Code Changes

```bash
git add .
git commit -m "Production: feature/fix description"
git push origin main
# Vercel auto-deploys within 2-3 minutes
```

---

## 🔍 MONITORING & MAINTENANCE

### Daily Checks

- [ ] Application is responding (status code 200)
- [ ] Login flow works end-to-end
- [ ] Orders display correctly
- [ ] No error logs in Vercel

### Weekly Checks

- [ ] Review Vercel analytics
- [ ] Check error rates
- [ ] Monitor performance metrics
- [ ] Verify uptime

### Monthly Checks

- [ ] Review and update dependencies
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Review Shopify API for deprecations
- [ ] Test token refresh flow
- [ ] Verify backup/recovery procedures

---

## 🚨 ROLLBACK PROCEDURE

If something breaks in production:

### 1. Quick Rollback (revert to previous deployment)

```bash
# In Vercel Dashboard:
# 1. Go to Deployments
# 2. Find last stable deployment
# 3. Click "..." → "Redeploy"
# 4. Wait for deployment to complete
```

### 2. Full Rollback (revert code)

```bash
# If code is broken:
git revert HEAD  # Revert last commit
git push origin main  # Push revert
# Vercel auto-deploys
```

### 3. Emergency: Disable app

```bash
# If security issue:
# 1. Disable app in Shopify Admin
# 2. Remove redirect URI
# 3. Investigate locally
# 4. Fix code
# 5. Retest
# 6. Redeploy
```

---

## 🔐 SECURITY CHECKLIST

### Cookies

- [x] `httpOnly: true` (prevents XSS)
- [x] `secure: true` (HTTPS only in prod)
- [x] `sameSite: 'lax'` (CSRF protection)
- [x] `path: '/'` (available everywhere)
- [x] `maxAge` set (tokens expire)

### Tokens

- [x] PKCE implemented (no client_secret sent to browser)
- [x] State parameter validated (CSRF protection)
- [x] Tokens never logged (no debug output of secrets)
- [x] Tokens cleared on logout
- [x] Refresh tokens rotated automatically

### API Endpoints

- [x] Auth required for `/account` and `/orders`
- [x] Unauthenticated access redirects to login
- [x] Token validation on every request
- [x] Expired tokens trigger refresh or logout
- [x] Error responses don't leak secrets

### Frontend

- [x] No hardcoded secrets in code
- [x] No sensitive data in localStorage
- [x] All forms have CSRF tokens (handled by httpOnly cookies)
- [x] Input validation on all forms
- [x] Output encoding prevents XSS
- [x] Redirects validated

---

## 📊 PRODUCTION ENV VARIABLES REFERENCE

| Variable                          | Example                                  | Required | Public? | Notes                  |
| --------------------------------- | ---------------------------------------- | -------- | ------- | ---------------------- |
| `NEXT_PUBLIC_BASE_URL`            | `https://yourdomain.com`                 | ✅       | ✅      | Must be HTTPS in prod  |
| `NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN` | `mystore.myshopify.com`                  | ✅       | ✅      | Without https://       |
| `NEXT_PUBLIC_SHOPIFY_CLIENT_ID`   | `xxxxx`                                  | ✅       | ✅      | Get from Shopify Admin |
| `SHOPIFY_CUSTOMER_SCOPES`         | `openid email customer-account-api:full` | ✅       | ❌      | Server-side only       |

---

## 🆘 TROUBLESHOOTING

### "Environment validation failed" at deploy

- [ ] Check all env vars are set in Vercel
- [ ] Variable names are case-sensitive
- [ ] BASE_URL must be HTTPS in production
- [ ] Redeploy after fixing

### Cookies not being set

- [ ] Verify BASE_URL is HTTPS
- [ ] Check Secure flag is true
- [ ] Cookies require HTTPS to persist
- [ ] Test with: curl -v https://yourdomain.com

### "Session validation failed" error

- [ ] State token expired (10 min limit)
- [ ] User took too long authorizing on Shopify
- [ ] Try again or clear browser cookies

### Login redirects to wrong URL

- [ ] Check Shopify redirect URI matches Vercel URL
- [ ] Verify BASE_URL env var is correct
- [ ] Check NEXT_PUBLIC_BASE_URL in Vercel settings

### Orders not displaying

- [ ] Check customer token in cookies: `DevTools → Application → Cookies`
- [ ] Verify token starts with `shcat_` (Customer Account API)
- [ ] Check Shopify API scopes include `customer-account-api:full`
- [ ] Review Vercel logs for API errors

---

## ✅ FINAL SIGN-OFF

- [ ] All pre-deployment checks completed
- [ ] Code deployed to Vercel successfully
- [ ] All production tests passed
- [ ] Team notified of deployment
- [ ] Monitoring configured
- [ ] Rollback plan documented
- [ ] Ready for customer usage

**Deployed by:** `_____________________`  
**Deployment date:** `_____________________`  
**Status:** `☐ STAGING  ☐ PRODUCTION`

---

## 📞 SUPPORT & ESCALATION

For issues:

1. Check Vercel logs: Project → Deployments → [latest] → "View logs"
2. Check Shopify API status: https://status.shopify.com
3. Review this checklist for common issues
4. Contact Shopify support if API issue

---

**This checklist must be completed before ANY production deployment.**
