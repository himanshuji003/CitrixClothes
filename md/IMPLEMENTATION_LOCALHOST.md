# Local Development: Shopify Redirect Implementation

**Status**: Ready to implement  
**Dev Server**: ✅ Running on `http://localhost:3000`  
**Target**: Redirect from Shopify `/account` to localhost

---

## Code Snippet

Copy and paste this into **`customers/account.liquid`** at the very top of the file:

```liquid
<script>
  (function() {
    window.location.replace('http://localhost:3000');
  })();
</script>
```

---

## Implementation Steps

### Step 1: Access Shopify Theme Editor

1. Go to: https://admin.shopify.com
2. Select store: **storewallha**
3. Navigate to: **Online Store** → **Themes**
4. Click **Edit code** on your active theme

### Step 2: Open `customers/account.liquid`

1. In the left sidebar, find: **Templates** → **`customers/account.liquid`**
2. If file doesn't exist:
   - Click **Add a new file**
   - Name: `customers/account.liquid`
   - Type: **Liquid**

### Step 3: Add the Redirect Script

1. Open the file
2. Go to the **very top** (before any existing content)
3. Paste the code snippet above
4. Click **Save**

---

## Testing the Redirect

### From Your Local Site

1. **Ensure dev server is running**: `npm run dev` (already running on port 3000)
2. Open: http://localhost:3000
3. Click the **"Login"** button
4. Complete the Shopify login/signup flow
5. ✅ You should be instantly redirected back to http://localhost:3000

### Expected Behavior

✅ Shopify account page does NOT appear
✅ Redirect happens instantly (< 100ms)
✅ No console errors (open DevTools with F12)
✅ Back button works normally (takes you to previous page)

---

## How It Works

- **`window.location.replace()`**: Replaces current page with new URL (no back-button loops)
- **Runs instantly**: Script executes before page renders (no flicker)
- **No timeout needed**: Redirect happens immediately upon page load
- **Minimal**: Only 3 lines of code

---

## Troubleshooting

| Issue                              | Solution                                                 |
| ---------------------------------- | -------------------------------------------------------- |
| Users not redirecting              | Verify script is at top of file and **Save** was clicked |
| Shopify UI visible before redirect | Move script higher in HTML file                          |
| Back button loops                  | Verify using `location.replace()` not `location.href`    |
| Not working in production later    | Change `http://localhost:3000` to your production domain |

---

## Next Steps

After verifying this works locally:

1. For production, update the script with your Vercel URL
2. Add `NEXT_PUBLIC_BASE_URL` environment variable (already configured in `.env.local`)
3. Deploy to Vercel and test the production redirect

See `REDIRECT_IMPLEMENTATION.md` and `REDIRECT_CHECKLIST.md` for full production setup.

---

## Dev Server Status

✅ Running: http://localhost:3000  
✅ Ready for testing  
✅ Shopify redirects will target this URL

**Do NOT stop the dev server** until you're done testing.
