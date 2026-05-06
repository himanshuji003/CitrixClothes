# Shopify Theme Update Instructions

## What This Does

After users login/signup on Shopify's hosted pages, they'll be automatically redirected back to your Next.js site at `http://localhost:3000` (or your production domain).

---

## Step-by-Step Instructions

### 1. Log in to Shopify Admin

- Go to: https://admin.shopify.com
- Log in with your credentials
- Select your store: **storewallha**

### 2. Navigate to Theme Files

- Click **Sales channels** → **Online Store** (or go directly to **Themes** if you don't see Online Store)
- You should see your current theme (e.g., "Dawn" or a custom theme)
- Click **Edit code** or **Customize**
- Look for the **Files** or **Templates** section on the left sidebar

### 3. Find the Account Template

- In the left sidebar, look for **Templates** folder
- Find **`customers/account.liquid`**
  - If you don't see it, click **Add a new file**
  - Name it: `customers/account.liquid`
  - Choose template type: **Liquid**

### 4. Add the Redirect Script

- Open `customers/account.liquid`
- **At the very top** of the file (before any existing content), add this code:

**For Production:**

```liquid
<script>
  (function() {
    // Redirect back to your frontend after Shopify authentication
    // Immediately redirects all /account page visits to your Next.js site
    var frontendUrl = "https://citrix-clothes.vercel.app/";
    if (window.location.href !== frontendUrl) {
      window.location.replace(frontendUrl);
    }
  })();
</script>

<!-- Rest of account page content below -->
```

**For Development (localhost:3000):**

```liquid
<script>
  (function() {
    // Redirect back to your frontend after Shopify authentication
    var frontendUrl = "http://localhost:3000/";
    if (window.location.href !== frontendUrl) {
      window.location.replace(frontendUrl);
    }
  })();
</script>

<!-- Rest of account page content below -->
```

### 5. Production Configuration

- The redirect script should be configured with your production URL: `https://citrix-clothes.vercel.app/`
- This matches the `NEXT_PUBLIC_BASE_URL` environment variable in your `.env.local`

### 6. Save & Publish

- Click **Save**
- Your changes are automatically published

---

## Testing the Flow

### Development (localhost:3000)

1. **Click "Login" button** on your Next.js site
   - ✅ You'll be redirected to: `https://storewallha.myshopify.com/account/login`

2. **Log in with credentials**
   - Use an existing Shopify customer account
   - Or create a test account first

3. **After successful login**
   - ✅ You'll see the Shopify account page for a moment
   - ✅ Then automatically redirected to: `http://localhost:3000`

4. **Test signup**
   - Click "Sign Up" button on your site
   - Go through Shopify's signup process
   - Confirm automatic redirect back

### Production (https://citrix-clothes.vercel.app/)

After you deploy:

1. The theme file is already updated with the production URL: `https://citrix-clothes.vercel.app/`
2. Verify `NEXT_PUBLIC_BASE_URL` environment variable is set in Vercel
3. Test the login flow on your production domain
4. Users should redirect instantly to your frontend homepage

---

## Troubleshooting

### Users not redirecting back

- **Check**: Is `customers/account.liquid` saved?
- **Check**: Is the redirect script at the very top of the file?
- **Check**: Is the URL correct (no typos)?
- **Fix**: Clear browser cache (`Ctrl+Shift+Del`) and test again

### Redirect URL not working

- **Check**: Is it a valid URL with `http://` or `https://`?
- **Check**: For localhost, make sure port `3000` is correct
- **Check**: Is your Next.js server running?

### Users stuck in a redirect loop

- **Check**: Remove any conflicting redirects in Shopify theme
- **Check**: Don't add the script to other pages (only `customers/account.liquid`)

---

## What Users See

### Current User Flow

1. On your site → Click "Login" button
2. Redirected to: `https://storewallha.myshopify.com/account/login`
3. Shopify login page loads
4. User enters email & password
5. User logs in successfully
6. Shopify account page shows for ~1 second
7. **Automatically redirected back to your site**

### After Setup

- **No custom auth needed** - Everything is handled by Shopify
- **No passwords stored** - Shopify manages all auth security
- **No email verification needed** - Shopify handles account validation
- **No password reset pages** - Users can reset on Shopify if needed

---

## Next Steps After This Works

Once the redirect is working:

1. ✅ Users can login via Shopify
2. ✅ Products, cart, wishlist work independently
3. ✅ No custom auth code to maintain

### Optional Enhancements (Future)

- Add a user detection method (check if Shopify session exists)
- Sync user's cart with Shopify after login
- Show personalized recommendations based on Shopify orders
- Add a "Manage Account" button that links back to Shopify

---

## Questions?

If you run into issues:

1. Check browser console for JavaScript errors
2. Verify the Shopify theme file was saved
3. Make sure the redirect URL is exactly correct
4. Test in a private/incognito window to bypass caching
