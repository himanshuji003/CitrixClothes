# Post-Login Redirect Implementation Guide

**Status**: Ready for Manual Shopify Configuration & Testing  
**Date Started**: May 5, 2026  
**Last Updated**: May 5, 2026  
**Target**: Redirect users from Shopify `/account` page to `https://citrix-clothes.vercel.app/`

---

## Summary of Remaining Work

All **frontend code changes are complete**. You now need to:

1. ✅ **DONE** - Frontend environment configured with production URL
2. ⏳ **NEXT** - Update Shopify theme file manually (5 min in Shopify Admin)
3. ⏳ **THEN** - Add environment variable to Vercel (3 min in Vercel Dashboard)
4. ⏳ **FINALLY** - Test the redirect flow (10 min)

---

## 🚀 Quick Start: Remaining Actions (Do These in Order)

### Action 1: Update Shopify Theme File (5 minutes)

**Go to**: https://admin.shopify.com/admin/themes → Click **Edit code**

**In the theme editor**:

1. Find file: **Templates → `customers/account.liquid`** (create if doesn't exist)
2. Add this script at the **very top** of the file:

```liquid
<script>
  (function() {
    var frontendUrl = "https://citrix-clothes.vercel.app/";
    if (window.location.href !== frontendUrl) {
      window.location.replace(frontendUrl);
    }
  })();
</script>
```

3. Click **Save**
4. ✅ Done

---

### Action 2: Add Environment Variable to Vercel (3 minutes)

**Go to**: https://vercel.com → **citrix-clothes** → **Settings** → **Environment Variables**

**Add variable**:

- Name: `NEXT_PUBLIC_BASE_URL`
- Value: `https://citrix-clothes.vercel.app/`
- Environments: Check all (Production, Preview, Development)
- Click **Save**

---

### Action 3: Deploy Changes (1-2 minutes)

**In your terminal**:

```bash
git add .env.local
git commit -m "feat: Add NEXT_PUBLIC_BASE_URL environment variable for Shopify redirect"
git push
```

**Monitor**: https://vercel.com/projects/citrix-clothes (check Deployments tab, wait for ✅)

---

### Action 4: Test the Redirect (5 minutes)

**Test Development** (localhost):

```bash
npm run dev
```

- Open `http://localhost:3000`
- Click "Login"
- Complete Shopify login
- ✅ Should redirect to `http://localhost:3000` instantly

**Test Production** (after Vercel deploys):

- Open `https://citrix-clothes.vercel.app/`
- Click "Login"
- Complete Shopify login
- ✅ Should redirect to `https://citrix-clothes.vercel.app/` instantly

**Verify**:

- [ ] No Shopify account page UI visible
- [ ] Redirect happens immediately (< 100ms)
- [ ] Back button works correctly
- [ ] No console errors (F12 → Console tab)

---

## ✅ Phase 1: Environment Configuration (COMPLETED)

### What Was Done

1. ✅ Created `.env.local` with `NEXT_PUBLIC_BASE_URL=https://citrix-clothes.vercel.app/`
2. ✅ Updated `SHOPIFY_THEME_UPDATE.md` with production redirect URL and code samples

### Files Modified

- [.env.local](.env.local) - Added `NEXT_PUBLIC_BASE_URL` environment variable
- [SHOPIFY_THEME_UPDATE.md](SHOPIFY_THEME_UPDATE.md) - Updated with production URL and improved code

### Next: Environment Variables on Vercel

You'll need to add this variable to your Vercel project:

- Go to: https://vercel.com/projects/citrix-clothes
- Navigate to: Settings → Environment Variables
- Add new variable:
  - **Name**: `NEXT_PUBLIC_BASE_URL`
  - **Value**: `https://citrix-clothes.vercel.app/`
  - **Environments**: Production, Preview, Development

---

## ⏳ Phase 2: Shopify Theme Modification (MANUAL - NEXT STEP)

### What You Need to Do

1. **Log in to Shopify Admin**
   - URL: https://admin.shopify.com
   - Store: storewallha

2. **Navigate to Theme Files**
   - Go to: **Sales channels** → **Online Store** → **Themes**
   - Click **Edit code** on your current theme

3. **Open customers/account.liquid**
   - Look in the left sidebar for: **Templates** → **customers/account.liquid**
   - If the file doesn't exist, click **Add a new file** and create it

4. **Replace the Redirect Script**
   - Delete any existing redirect script in the file
   - Add this code at the **very top** of the file (before all other content):

```liquid
<script>
  (function() {
    // Redirect all /account page visits to your Next.js frontend
    var frontendUrl = "https://citrix-clothes.vercel.app/";
    if (window.location.href !== frontendUrl) {
      window.location.replace(frontendUrl);
    }
  })();
</script>
```

**Why this code:**

- Uses `location.replace()` instead of `location.href` to prevent infinite back-button loops
- Wrapped in IIFE for safety
- Quick equality check to avoid unnecessary redirects
- Executes instantly when page loads (script in <head>)

5. **Save and Publish**
   - Click **Save** in the Shopify theme editor
   - Changes are published automatically

---

## 🧪 Phase 3: Testing (AFTER THEME MODIFICATION)

### Test 1: Development Environment

```bash
npm run dev
# Start your Next.js app on http://localhost:3000
```

1. Open your local site and click "Login"
2. You'll redirect to: `https://storewallha.myshopify.com/account/login`
3. Log in with a test Shopify account
4. You should instantly redirect to: `http://localhost:3000`

**Success Indicators:**

- ✅ Redirect happens instantly (no Shopify UI visible)
- ✅ No flicker or delay
- ✅ Back button takes you to previous page (not stuck redirecting)

### Test 2: Production Domain (After Vercel Deployment)

1. Visit your production domain: `https://citrix-clothes.vercel.app/`
2. Click "Login"
3. Log in to Shopify account
4. Verify instant redirect back to: `https://citrix-clothes.vercel.app/`

**Success Indicators:**

- ✅ Same as development
- ✅ Works on production Shopify store (not just test store)

### Test 3: Behavior Verification

| Scenario                              | Expected Behavior                    | Status |
| ------------------------------------- | ------------------------------------ | ------ |
| Visit `/account` while **logged out** | Redirect to homepage                 | [ ]    |
| Visit `/account` while **logged in**  | Redirect to homepage                 | [ ]    |
| Check Network tab                     | Redirect happens before body renders | [ ]    |
| Open DevTools Console                 | No JavaScript errors                 | [ ]    |
| Press back button after redirect      | Goes to previous page                | [ ]    |

---

## 🚀 Phase 4: Production Deployment

### Pre-Deployment Checklist

- [x] `NEXT_PUBLIC_BASE_URL` is set in `.env.local` to `https://citrix-clothes.vercel.app/`
- [ ] Shopify theme has been updated with the production redirect script
- [ ] Manual testing on development (`localhost:3000`) was successful
- [ ] `NEXT_PUBLIC_BASE_URL` has been added to Vercel environment variables

### Deployment Steps

1. **Deploy to Vercel** (AFTER completing Shopify theme update)

   ```bash
   git add .env.local
   git commit -m "feat: Add NEXT_PUBLIC_BASE_URL environment variable for Shopify post-login redirect"
   git push
   ```

   - Vercel will auto-detect and deploy your changes
   - Deployment will complete in 1-3 minutes

2. **Verify Environment Variables in Vercel**
   - Go to: https://vercel.com/projects/citrix-clothes
   - Check: Settings → Environment Variables
   - Confirm: `NEXT_PUBLIC_BASE_URL=https://citrix-clothes.vercel.app/`
   - If not present, add it manually (apply to all environments)

3. **Test Production Redirect**
   - Visit: `https://citrix-clothes.vercel.app/`
   - Click "Login"
   - Go through Shopify authentication
   - Verify instant redirect back to homepage
   - Click Login and test the redirect flow
   - Verify: Redirect to homepage works instantly

### Post-Deployment Monitoring

- [ ] Check Vercel deployment logs for any errors
- [ ] Monitor application performance (no increased redirect latency)
- [ ] Verify user feedback: are users being redirected correctly?

---

## 📋 Architecture Overview

```
┌─────────────────────────────────────────┐
│ User visits Shopify /account page       │
│ (after login or directly)               │
└────────────────┬────────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │  HTML loads    │
        │ (head section) │
        └────────┬───────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ JavaScript redirect script executes:    │
│ location.replace() called               │
│ (happens before body renders)           │
└────────────────┬────────────────────────┘
                 │
                 ▼
  ┌──────────────────────────────┐
  │ User redirected to frontend  │
  │ https://citrix-clothes...    │
  │ (no Shopify UI visible)      │
  └──────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Issue: Users not redirecting

**Checklist:**

1. Is `customers/account.liquid` updated in Shopify?
   - Go to Shopify Admin → Theme Editor → search for the script
2. Is the script at the **top** of the file?
   - Should be first thing in `<head>` or beginning of `<body>`
3. Did you click **Save** after editing?
   - Changes won't apply until saved
4. Check browser console:
   - Open DevTools → Console tab on `/account` page
   - Look for any JavaScript errors

### Issue: Users see flicker or Shopify UI

**Solution:**

- Move the redirect script higher in the HTML file
- Ensure script is in `<head>` section, not body

### Issue: Back button stuck in redirect loop

**This shouldn't happen** because we use `location.replace()` instead of `location.href`. If it occurs:

1. Check that you're using `location.replace()` not `location.href`
2. Check for multiple redirect scripts in the file
3. Clear browser cache and test again

### Issue: Different redirect on localhost vs production

**This is expected.** Make sure:

1. Development: Script is using `http://localhost:3000/`
2. Production: Script is using `https://citrix-clothes.vercel.app/`
3. Match the environment you're testing in

---

## 📚 Additional Resources

- [Shopify Liquid Documentation](https://shopify.dev/api/liquid)
- [Shopify Theme Development](https://shopify.dev/themes)
- [SHOPIFY_THEME_UPDATE.md](SHOPIFY_THEME_UPDATE.md) - Original setup guide
- [.env.local](.env.local) - Environment variables

---

## Summary

**What's Done:**

- ✅ Environment variable `NEXT_PUBLIC_BASE_URL` configured
- ✅ Documentation updated with production URL
- ✅ Improved redirect code ready for Shopify theme

**What's Left:**

- ⏳ Manually update `customers/account.liquid` in Shopify Admin
- ⏳ Add `NEXT_PUBLIC_BASE_URL` to Vercel environment variables
- ⏳ Test development and production redirects
- ⏳ Monitor for any issues

**Next Action:**
👉 Go to Shopify Admin and update the theme file with the redirect script provided above
