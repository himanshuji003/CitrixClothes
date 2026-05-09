# 🚀 VERCEL DEPLOYMENT GUIDE

**Step-by-step instructions for deploying Citrix Clothes to Vercel**

---

## STEP 1: Prepare Code for Deployment

### 1.1 Test locally first

```bash
# Ensure all env vars are set in .env.local
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN=mystore.myshopify.com
NEXT_PUBLIC_SHOPIFY_CLIENT_ID=your_client_id
SHOPIFY_CUSTOMER_SCOPES=openid email customer-account-api:full

# Build locally to verify
npm run build

# If build fails, fix issues before deploying
# If build succeeds, you're ready
```

### 1.2 Commit code to GitHub

```bash
# Ensure .env.local is NOT committed
git add .
git commit -m "Production: ready for Vercel deployment"
git push origin main
```

---

## STEP 2: Set Up Vercel Project

### 2.1 Import repository to Vercel

1. Go to https://vercel.com
2. Click **"+ New Project"** (top right)
3. Select **"Import Git Repository"**
4. Search for your repository (e.g., "CitrixClothes-main")
5. Click **"Import"**

### 2.2 Configure project settings

1. **Project Name**: Leave default or customize
2. **Framework Preset**: Next.js (should auto-detect)
3. **Root Directory**: `./` (default)
4. Click **"Continue"**

### 2.3 Set environment variables in Vercel

On the "Environment Variables" screen:

**Add each variable:**

```
Variable Name: NEXT_PUBLIC_BASE_URL
Value: https://your-domain.com
(or https://your-project.vercel.app if using Vercel domain)
Scope: Production, Preview, Development
```

Repeat for:

- `NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN` = `mystore.myshopify.com`
- `NEXT_PUBLIC_SHOPIFY_CLIENT_ID` = `your_client_id_from_shopify`
- `SHOPIFY_CUSTOMER_SCOPES` = `openid email customer-account-api:full`

**IMPORTANT:** Make sure **"Production"** scope is selected for all variables!

### 2.4 Click "Deploy"

- Vercel will build and deploy your application
- Wait for build to complete (~2-3 minutes)
- Once deployed, you'll see "Congratulations! Your project has been deployed"

---

## STEP 3: Get Your Vercel URL

After successful deployment:

1. Go to **Deployments** tab
2. Click the latest deployment
3. Copy the URL (e.g., `https://citrix-clothes-xyz.vercel.app`)
4. This is your **temporary Vercel domain**

---

## STEP 4: Set Custom Domain (Optional but Recommended)

### 4.1 Add custom domain to Vercel

1. In Vercel dashboard, go to **Settings**
2. Click **"Domains"**
3. Enter your custom domain (e.g., `citrixclothes.com`)
4. Click **"Add"**

### 4.2 Update DNS records

Vercel will show required DNS records:

```
Type: CNAME
Name: www
Value: cname.vercel.app
```

OR for root domain:

```
Type: A
Name: @
Value: 76.76.19.89
```

Add these records in your domain registrar (GoDaddy, Namecheap, etc.)

### 4.3 Verify domain

- Vercel automatically checks your DNS
- Once verified, you'll see a checkmark
- Can take 5-30 minutes to propagate

---

## STEP 5: Update Shopify Admin

### 5.1 Get your final production URL

Use either:

- Custom domain: `https://citrixclothes.com`
- Vercel domain: `https://your-project.vercel.app`

### 5.2 Update redirect URI in Shopify

1. Go to Shopify Admin
2. Navigate to: **Apps and sales channels** → **Your app** → **Configuration**
3. Find **"Redirect URL"** or **"Allowed Callback URLs"**
4. Update to: `https://your-domain.com/api/auth/callback`
5. Save changes

### 5.3 Update environment variable

1. Go back to Vercel
2. Settings → Environment Variables
3. Update `NEXT_PUBLIC_BASE_URL` to your final domain
4. Click **"Save"**
5. Vercel will auto-redeploy with new variable

---

## STEP 6: Test Production Deployment

### 6.1 Test OAuth flow end-to-end

1. Open your production URL: `https://your-domain.com`
2. Click **"Login"**
3. Authorize on Shopify (use test account)
4. Should redirect to `/account`
5. Verify you can see:
   - Your profile information
   - Order history
   - No errors in console

### 6.2 Verify cookies are secure

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Cookies** → select your domain
4. Verify:
   - `shopify_customer_access_token`: httpOnly ✓, Secure ✓
   - `shopify_customer_refresh_token`: httpOnly ✓, Secure ✓
   - All should show green checkmarks

### 6.3 Check production logs

1. In Vercel dashboard, go to **Deployments**
2. Click latest deployment
3. Click **"View logs"**
4. No errors should appear
5. Look for `SUCCESS` messages in order logs

---

## STEP 7: Enable Auto-Deploy (Optional)

Vercel auto-deploys on every `git push` to main. To enable:

1. In Vercel dashboard, go to **Settings**
2. Click **"Git"**
3. Ensure **Auto-deploy** is enabled for main branch
4. Now every push to main automatically deploys

---

## MONITORING & ONGOING

### Monitor deployments

```bash
# View recent deployments
# In Vercel dashboard: Deployments tab

# View logs in real-time
# In Vercel dashboard: select deployment → View logs
```

### Monitor errors

```bash
# Check error logs
# In Vercel dashboard: Functions (serverless functions)
# Look for API route errors

# Check activity feed
# In Vercel dashboard: Activity tab
```

### Auto-redeploy specific deployment

If something breaks:

1. Fix code locally
2. `git push origin main`
3. Vercel auto-deploys in 2-3 minutes

OR manually redeploy:

1. Vercel Dashboard → Deployments
2. Find stable deployment
3. Click "..." → "Redeploy"
4. Click "Redeploy" again
5. Wait for deployment

---

## TROUBLESHOOTING

### Build fails: "Environment validation failed"

**Problem**: Environment variables not set in Vercel  
**Solution**:

1. Go to Vercel Settings → Environment Variables
2. Add all 4 required variables
3. Make sure scope is "Production"
4. Click "Save"
5. Redeploy

### Cookies not working

**Problem**: `secure` flag prevents cookies from being set  
**Solution**:

1. Verify BASE_URL is HTTPS in production
2. Check NEXT_PUBLIC_BASE_URL env var in Vercel
3. Should be: `https://your-domain.com` (not http://)
4. Redeploy after updating

### "Redirect validation failed"

**Problem**: Shopify redirect doesn't match  
**Solution**:

1. In Shopify Admin, check redirect URI
2. Should be: `https://your-domain.com/api/auth/callback`
3. Vercel URL format: `https://your-project.vercel.app/api/auth/callback`
4. Update Shopify Admin to match
5. Test again

### "Session validation failed"

**Problem**: State cookie expired or mismatched  
**Solution**:

1. Likely timeout during authorization
2. User took >10 min between clicking login and Shopify auth
3. Try logging in again
4. Check for clock skew (server time wrong)

### 500 Error in production

**Problem**: API endpoint not working  
**Solution**:

1. Check Vercel logs: Deployments → select deployment → View logs
2. Look for error messages
3. Check if auth token is being read correctly
4. Verify Shopify API credentials are correct

### Can't reach Vercel deployment

**Problem**: Domain not resolving  
**Solution**:

1. If using custom domain:
   - Verify DNS records are added correctly
   - Wait for propagation (5-30 min)
   - Use `nslookup your-domain.com` to check
2. If using Vercel domain:
   - Should work immediately
   - Try: `https://your-project.vercel.app`

---

## PRODUCTION CHECKLIST

Before calling deployment "done":

- [ ] OAuth flow works end-to-end (login → authorize → account page)
- [ ] Account page loads and shows orders
- [ ] Cookies are secure (httpOnly, Secure flags set)
- [ ] No errors in Vercel logs
- [ ] Custom domain resolves (if using custom domain)
- [ ] Email notifications working (if applicable)
- [ ] Can logout and re-login
- [ ] Mobile version works (responsive design)
- [ ] Loading states show while fetching data
- [ ] Error messages are user-friendly
- [ ] No console warnings/errors in browser DevTools

---

## ROLLBACK PROCEDURE

If production breaks:

### Quick rollback to previous deployment

```
Vercel Dashboard → Deployments → find last stable → "..." → "Redeploy"
```

### Full rollback (revert code)

```bash
git revert HEAD
git push origin main
# Vercel auto-deploys new revision
```

### Emergency: Disable the app

1. In Shopify Admin, disable app
2. Remove redirect URI temporarily
3. Debug issue locally
4. Deploy fix
5. Re-enable app in Shopify

---

## NEXT STEPS

After successful deployment:

1. **Monitor**: Check logs daily for errors
2. **Test**: Periodically test login/order flows
3. **Updates**: Keep dependencies updated (`npm audit`)
4. **Security**: Monitor for security advisories
5. **Performance**: Review Vercel analytics

---

**You're now running in production! 🎉**
