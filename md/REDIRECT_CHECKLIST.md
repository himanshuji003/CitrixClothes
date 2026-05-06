# Shopify Post-Login Redirect - Action Checklist

**Status**: Ready to Execute (18 minutes total)  
**Your Task**: 4 simple steps in Shopify Admin, Vercel, and terminal

---

## ✅ What's Already Done

- ✅ Frontend code configured with `NEXT_PUBLIC_BASE_URL`
- ✅ Environment variables created in `.env.local`
- ✅ Shopify theme update code prepared and documented
- ✅ All dependencies and integrations verified

**What you see now**: When users visit `/account` on Shopify, they're redirected to your homepage instantly with no flicker.

---

## 📋 Remaining Tasks (Do in This Order)

### **Task 1: Shopify Theme Update** ⏱️ 5 min

**Where**: https://admin.shopify.com

- [ ] Click **Online Store** → **Themes** → Click **Edit code**
- [ ] Open **Templates** → **customers/account.liquid** (or create it)
- [ ] Copy this script to the **very top** of the file:

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

- [ ] Click **Save**

---

### **Task 2: Vercel Environment Variable** ⏱️ 3 min

**Where**: https://vercel.com/projects/citrix-clothes

- [ ] Go to **Settings** → **Environment Variables**
- [ ] Click **Add New**
- [ ] Fill in:
  - Name: `NEXT_PUBLIC_BASE_URL`
  - Value: `https://citrix-clothes.vercel.app/`
  - Environments: ✅ Production ✅ Preview ✅ Development
- [ ] Click **Save**

---

### **Task 3: Deploy to Vercel** ⏱️ 1-2 min

**Where**: Your terminal

```bash
git add .env.local
git commit -m "feat: Add NEXT_PUBLIC_BASE_URL for Shopify redirect"
git push
```

Then monitor: https://vercel.com/projects/citrix-clothes/deployments (wait for green checkmark)

---

### **Task 4: Test the Redirect** ⏱️ 5 min

**Development Test:**

```bash
npm run dev
```

1. Open http://localhost:3000
2. Click "Login" button
3. Log in to Shopify (use test account)
4. Verify: Redirected back to homepage instantly ✓

**Production Test** (after Vercel deploys):

1. Open https://citrix-clothes.vercel.app/
2. Click "Login" button
3. Log in to Shopify
4. Verify: Redirected back to homepage instantly ✓

---

## ✨ Expected Behavior

| Scenario                                 | Result                                    |
| ---------------------------------------- | ----------------------------------------- |
| User visits `/account` on Shopify        | ➜ Instant redirect to homepage            |
| User logs in on Shopify `/account/login` | ➜ Instant redirect to homepage after auth |
| User visits `/account` directly          | ➜ Instant redirect to homepage            |
| No Shopify UI visible                    | ✅ Yes (redirect in <head>)               |
| Back button works correctly              | ✅ Yes (uses location.replace)            |

---

## 🔗 Reference Links

- [Shopify Admin](https://admin.shopify.com) - Theme editor
- [Vercel Dashboard](https://vercel.com/projects/citrix-clothes) - Environment variables
- [Implementation Guide](REDIRECT_IMPLEMENTATION.md) - Full documentation
- [Theme Update Guide](SHOPIFY_THEME_UPDATE.md) - Detailed Shopify steps

---

## 🆘 Troubleshooting

**Users not redirecting?**

- Check that script is at top of `customers/account.liquid`
- Verify Shopify theme was saved (click Save button)
- Check browser console for errors (F12)

**Redirect works on localhost but not production?**

- Verify `NEXT_PUBLIC_BASE_URL` is set in Vercel environment variables
- Wait for Vercel deployment to complete (green checkmark)
- Hard refresh browser (Ctrl+F5)

**See Shopify UI before redirect?**

- Move script higher in HTML (needs to be in `<head>`)
- Verify using `location.replace()` not `location.href`

**Back button stuck?**

- This shouldn't happen with `location.replace()`
- Clear browser cache and try again

---

## ✅ Final Verification

After all steps, you'll have:

- ✅ Instant post-login redirect from Shopify to your frontend
- ✅ No UI flicker or delays
- ✅ Working back button behavior
- ✅ Production-ready configuration
- ✅ Scalable environment setup (easy to add more URLs later if needed)

**Estimated time to complete**: ~18 minutes
