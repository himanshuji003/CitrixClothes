# Production Deployment Checklist

## 🔐 Pre-Deployment Verification

### Environment Variables

- [ ] ✅ `.env.local` created with development credentials
- [ ] ✅ `.env.production.example` created (reference for setup)
- [ ] ✅ All env files are in `.gitignore` (not committed)
- [ ] ✅ `NEXT_PUBLIC_BASE_URL=http://localhost:3000` set in development
- [ ] ✅ Environment validation module created: `lib/env-validation.ts`

### Code Changes

- [ ] ✅ All localhost references removed from production code
- [ ] ✅ No `|| 'http://localhost:3000'` fallbacks remain
- [ ] ✅ Deprecated components deleted:
  - `components/auth/ShopifyLoginButton.tsx` ❌ DELETED
  - `components/auth/ShopifySignupButton.tsx` ❌ DELETED
- [ ] ✅ All `process.env.*` references checked:
  - Only `NEXT_PUBLIC_*` used in client code
  - `SHOPIFY_OAUTH_CLIENT_SECRET` never exposed
  - Server-side secrets only used in `/api/auth/*` routes

### Error Handling & UI

- [ ] ✅ `components/ErrorBoundary.tsx` created (client error catching)
- [ ] ✅ `components/AuthErrorAlert.tsx` created (reusable error display)
- [ ] ✅ `components/LoadingBar.tsx` created (loading indicator)
- [ ] ✅ All auth pages use new error components:
  - `app/login/page.tsx` - Uses `<AuthErrorAlert />` and `<LoadingBar />`
  - `app/signup/page.tsx` - Uses `<AuthErrorAlert />` and `<LoadingBar />`
  - `app/account/page.tsx` - Uses `<AuthErrorAlert />` with retry logic
- [ ] ✅ Debug UI removed from auth pages (development-only sections)
- [ ] ✅ API timeout handling added (10-second fetch timeout in AuthContext)

### Security

- [ ] ✅ Cookie settings verified in `app/api/auth/callback/route.ts`:
  - `httpOnly: true` ✓ (prevents XSS)
  - `secure: NODE_ENV === 'production'` ✓ (HTTPS only)
  - `sameSite: 'lax'` ✓ (CSRF protection)
- [ ] ✅ Env validation added to callback handler (fails fast if missing)
- [ ] ✅ Error messages are user-friendly (no technical details exposed)
- [ ] ✅ No SHOPIFY_OAUTH_CLIENT_SECRET in error messages or logs

### SEO & Performance

- [ ] ✅ `lib/meta.ts` helper created for SEO meta tags
- [ ] ✅ `app/layout.tsx` updated with:
  - Correct site title and description
  - Open Graph meta tags (OG image, title, description, URL)
  - Twitter card meta tags
  - Canonical URLs
- [ ] ✅ Protected pages marked with `robots: { index: false }`:
  - `/login` - Not indexed
  - `/signup` - Not indexed
  - `/account` - Not indexed

### Code Quality

- [ ] ✅ No hydration warnings in console
- [ ] ✅ TypeScript compilation successful: `npx tsc --noEmit`
- [ ] ✅ Build test successful: `npm run build`
- [ ] ✅ No console warnings about process.env in client code

---

## 🌐 Vercel Dashboard Setup

### Project Configuration

- [ ] GitHub repository connected to Vercel
- [ ] Branch: `main` (or your production branch)
- [ ] Build command: `npm run build` (or `yarn build`)
- [ ] Output directory: `.next`
- [ ] Install command: `npm install` (or `yarn install`)

### Environment Variables in Vercel

Add the following in **Settings → Environment Variables**:

```
NEXT_PUBLIC_BASE_URL=https://citrix-clothes.vercel.app
NEXT_PUBLIC_SHOPIFY_CLIENT_ID={your-production-client-id}
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET={your-production-secret}
NEXT_PUBLIC_SHOPIFY_SHOP_ID={your-shop-id}
```

**Important**:

- ✅ Mark `NEXT_PUBLIC_*` variables with the NEXT_PUBLIC prefix in Vercel UI
- ✅ `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET` should NOT start with `NEXT_PUBLIC_`
- ✅ All variables should be available in all environments (Production, Preview, Development)
- ✅ Click "Save" after adding each variable
- ✅ Redeploy after adding all variables

### Production Domain

- [ ] Custom domain configured (optional): `yourdomain.com`
- [ ] SSL certificate auto-renewed (Vercel handles this)
- [ ] Vercel auto-generated domain: `citrix-clothes.vercel.app` works
- [ ] Domain DNS configured if using custom domain

---

## 🔑 Shopify OAuth Configuration

### Shopify Admin Setup

- [ ] OAuth redirect URI registered in Shopify dashboard:
  - **URL**: `https://citrix-clothes.vercel.app/api/auth/callback`
  - Note: Must match `NEXT_PUBLIC_BASE_URL + /api/auth/callback`
- [ ] Production client ID confirmed
- [ ] Production client secret confirmed (never share or commit)
- [ ] Shop ID verified (numeric or `storewallha` format)

### Testing OAuth in Production

- [ ] Test login flow:
  1. Visit `https://citrix-clothes.vercel.app/login`
  2. Click "Login with Shopify"
  3. Verify redirect to `shopify.com/{shop-id}/auth/oauth/authorize?...`
  4. Authorize with test account
  5. Verify callback receives authorization code
  6. Verify token exchange succeeds
  7. Verify user redirected to `/account` with data loaded

---

## ✅ Post-Deployment Testing

### Authentication Flow

- [ ] **Login Flow** (Happy Path)
  - Navigate to `/login` → Click login button → Redirect to Shopify → Authorize → Redirect to `/account`
  - Verify user name and email display correctly
  - Check Network tab: NO `SHOPIFY_OAUTH_CLIENT_SECRET` exposed

- [ ] **Signup Flow** (New User)
  - Navigate to `/signup` → Click signup button → Shopify creates account → Redirect to `/account`
  - Verify user can complete signup flow

- [ ] **Protected Route** (Unauthenticated)
  - Open `/account` in private/incognito window (no auth cookies)
  - Verify redirect to `/login`

- [ ] **Logout**
  - Click logout button on `/account` page
  - Verify redirect to home page (`/`)
  - Verify `customer_token` cookie is cleared
  - Verify accessing `/account` redirects to `/login`

### Error Handling

- [ ] **OAuth Error** (Invalid credentials)
  - `AuthErrorAlert` displays user-friendly message
  - "Try Again" button works
  - No technical error details exposed

- [ ] **Network Timeout**
  - Disable network in DevTools
  - Trigger API call (e.g., reload `/account`)
  - After 10 seconds: Error message appears
  - "Try Again" button works after re-enabling network

- [ ] **API Failure** (500 error from `/api/auth/me`)
  - Mock API error in DevTools
  - Verify error message displayed
  - "Try Again" button retries request

### Performance & UX

- [ ] **Loading Indicators**
  - Login page: Spinner shows while redirecting
  - Login page: LoadingBar shows at top
  - Account page: Skeleton UI shows while loading
  - No flashing or layout shifts

- [ ] **Mobile Responsiveness**
  - Test on iPhone (Safari) and Android (Chrome)
  - All buttons are tap-friendly (44px minimum)
  - Forms responsive on small screens
  - No horizontal scroll
  - Load times acceptable

- [ ] **Hydration**
  - Console: No hydration mismatch warnings
  - Account page: Data loads correctly after page refresh
  - No "Warning: useLayoutEffect does nothing on the server" messages

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iPhone Safari, Android Chrome)

### DevTools Verification

- [ ] **Network Tab**
  - ✅ No SHOPIFY_OAUTH_CLIENT_SECRET in request headers
  - ✅ No env vars visible in API responses
  - ✅ Redirect URI is `https://citrix-clothes.vercel.app/api/auth/callback`
  - ✅ Token endpoint is `https://shopify.com/{shopId}/auth/oauth/token`
  - ✅ Customer API endpoint is `https://shopify.com/{shopId}/account/customer/api/2024-01/graphql`

- [ ] **Console Tab**
  - ✅ No errors
  - ✅ No warnings about process.env
  - ✅ No XSS warnings
  - ✅ No CORS warnings

- [ ] **Application/Storage Tab**
  - ✅ `customer_token` cookie visible
  - ✅ `httpOnly` flag: ✓ Yes
  - ✅ `Secure` flag: ✓ Yes (production)
  - ✅ `SameSite`: ✓ Lax
  - ✅ Expires: Matches token expiry time

### SEO Verification

- [ ] **Robots Meta Tags**
  - `/` - `robots: { index: true, follow: true }`
  - `/login` - `robots: { index: false }`
  - `/account` - `robots: { index: false }`
  - `/signup` - `robots: { index: false }`

- [ ] **Open Graph Tags**
  - `og:title` - "Citrix Clothes — Premium Fashion Collection"
  - `og:description` - Correctly set
  - `og:image` - Valid URL, accessible
  - `og:url` - `https://citrix-clothes.vercel.app`
  - `og:site_name` - "Citrix Clothes"

- [ ] **Twitter Card Tags**
  - `twitter:card` - "summary_large_image"
  - `twitter:title` - Correct
  - `twitter:description` - Correct
  - `twitter:image` - Valid URL

### Analytics & Monitoring

- [ ] Vercel Analytics enabled (if desired)
- [ ] Error tracking configured (e.g., Sentry) - Optional
- [ ] Performance metrics visible in Vercel dashboard
- [ ] Build logs show no warnings or errors

---

## 🚀 Go-Live Checklist

### Before Flipping DNS

- [ ] All tests passing
- [ ] All checkboxes above are ✅
- [ ] Team sign-off obtained
- [ ] Rollback plan documented (if using custom domain)

### DNS Switch (Custom Domain Only)

- [ ] Update domain DNS records to point to Vercel
- [ ] Wait for DNS propagation (up to 48 hours, usually <1 hour)
- [ ] Verify domain resolves to production app
- [ ] SSL certificate auto-renews

### Launch Communication

- [ ] Update documentation for team
- [ ] Notify customers (if beta testing)
- [ ] Monitor error logs for first 24 hours
- [ ] Be ready for support questions

---

## 📋 Future Considerations

### Phase 8 Items (Optional, Post-Launch)

- [ ] Add Sentry for error tracking
- [ ] Implement token refresh logic (if tokens expire)
- [ ] Add password reset flow (if needed)
- [ ] Implement two-factor authentication
- [ ] Add email verification (if needed)
- [ ] Setup automated backups

### Performance Optimization

- [ ] Lazy load components where possible
- [ ] Optimize images (use Next.js Image component)
- [ ] Enable caching headers for static assets
- [ ] Consider CDN for static resources
- [ ] Monitor Core Web Vitals

### Security Hardening

- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Monitor for vulnerability reports
- [ ] Implement rate limiting on API routes
- [ ] Add CAPTCHA for login attempts if needed

---

## ✅ Deployment Complete

Once all checkboxes are complete:

1. ✅ Your app is production-ready
2. ✅ OAuth authentication is secure
3. ✅ No localhost references remain
4. ✅ All secrets are properly secured
5. ✅ Error handling is user-friendly
6. ✅ Performance is optimized
7. ✅ SEO is configured
8. ✅ Mobile UX is responsive

**Deployment Date**: ******\_\_\_******

**Deployed By**: ******\_\_\_******

**Vercel URL**: `https://citrix-clothes.vercel.app`

**Custom Domain**: ******\_\_\_******

---

## 🆘 Troubleshooting Common Issues

### Issue: "Missing environment variables" error

**Solution**:

1. Verify all env vars are set in Vercel dashboard
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding variables
4. Wait 1-2 minutes for Vercel to cache new deployment

### Issue: "Invalid redirect_uri" from Shopify

**Solution**:

1. Verify `NEXT_PUBLIC_BASE_URL` matches Shopify OAuth settings
2. Ensure redirect URI in Shopify is exactly: `https://citrix-clothes.vercel.app/api/auth/callback`
3. Check for trailing slashes or typos

### Issue: Token not working (401 Unauthorized from Customer API)

**Solution**:

1. Verify token exchange succeeded (check logs in Vercel)
2. Ensure `SHOPIFY_OAUTH_CLIENT_SECRET` is correct
3. Check token has not expired
4. Verify scope includes `customer-account-api:full`

### Issue: CORS errors from Shopify

**Solution**:

1. Shopify CORS is handled server-side (no browser CORS issue)
2. If seeing CORS errors, auth request is originating from browser
3. Ensure `/api/auth/*` routes are being called, not direct Shopify API calls

### Issue: Hydration mismatch warning

**Solution**:

1. Ensure conditional rendering is not based on `typeof window` on initial render
2. All auth checks happen in `useEffect`, not during SSR
3. Clear `.next` folder: `rm -rf .next` and rebuild

### Issue: 404 errors on login/signup pages

**Solution**:

1. Verify `app/login/page.tsx` and `app/signup/page.tsx` exist
2. Ensure routes are spelled correctly: `/login`, `/signup`
3. Clear build cache: `npm run build` and redeploy

### Issue: Logout not working

**Solution**:

1. Verify `/api/auth/logout` route exists and is called with `method: POST`
2. Check `customer_token` cookie is being deleted
3. Verify redirect after logout works
4. Test in DevTools: Application → Cookies → Look for `customer_token`

---

## 📞 Support

For issues or questions:

1. Check this checklist for your specific scenario
2. Review error messages in Vercel logs
3. Check browser console for errors
4. Review Shopify admin for OAuth configuration
5. Consult Shopify Customer Account API documentation

---

**Last Updated**: 2026-05-06  
**Status**: Ready for Production
