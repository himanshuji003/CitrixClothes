# Shopify Dynamic Hero Section - Setup & Testing Guide

## ✅ Implementation Status

All components are built and deployed. The hero section now:

- ✅ Fetches content dynamically from Shopify metaobjects
- ✅ Falls back to current live content if Shopify data is missing/broken
- ✅ Validates image URLs and uses fallback if image fails
- ✅ Preserves exact UI design, layout, typography, animations
- ✅ Revalidates every 1 hour (ISR)

The build is successful and hero renders with fallback data. Now you need to create the Shopify metaobject.

---

## Part 1: Create Hero Section Metaobject in Shopify Admin

### Step 1: Access Metaobject Definitions

1. Go to Shopify admin → **Settings**
2. Select **Metaobjects** (under Data section)
3. Click **Create definition**

### Step 2: Create "Hero Section" Metaobject Definition

Fill in:

- **Name:** Hero Section
- **Definition ID (type):** `hero_section` (automatically generated from name)
- **Display name:** Hero Section

### Step 3: Add Field Configuration

Add these fields in order:

#### Field 1: Eyebrow Tag

| Property        | Value                |
| --------------- | -------------------- |
| Field name      | Eyebrow Tag          |
| Field key       | `eyebrow_tag`        |
| Field type      | **Single line text** |
| Character limit | 100                  |
| Required        | No                   |
| Display name    | Eyebrow Tag          |

#### Field 2: Title (Heading)

| Property        | Value                |
| --------------- | -------------------- |
| Field name      | Title                |
| Field key       | `title`              |
| Field type      | **Single line text** |
| Character limit | 200                  |
| Required        | No                   |
| Display name    | Hero Heading         |

#### Field 3: Subtitle (Subheading)

| Property        | Value               |
| --------------- | ------------------- |
| Field name      | Subtitle            |
| Field key       | `subtitle`          |
| Field type      | **Multi-line text** |
| Character limit | 500                 |
| Required        | No                  |
| Display name    | Hero Subheading     |

#### Field 4: Button Text

| Property        | Value                |
| --------------- | -------------------- |
| Field name      | Button Text          |
| Field key       | `button_text`        |
| Field type      | **Single line text** |
| Character limit | 50                   |
| Required        | No                   |
| Display name    | Primary Button Text  |

#### Field 5: Button Link

| Property        | Value                |
| --------------- | -------------------- |
| Field name      | Button Link          |
| Field key       | `button_link`        |
| Field type      | **Single line text** |
| Character limit | 500                  |
| Required        | No                   |
| Display name    | Primary Button URL   |

#### Field 6: Button Text Secondary

| Property        | Value                   |
| --------------- | ----------------------- |
| Field name      | Button Text Secondary   |
| Field key       | `button_text_secondary` |
| Field type      | **Single line text**    |
| Character limit | 50                      |
| Required        | No                      |
| Display name    | Secondary Button Text   |

#### Field 7: Button Link Secondary

| Property        | Value                   |
| --------------- | ----------------------- |
| Field name      | Button Link Secondary   |
| Field key       | `button_link_secondary` |
| Field type      | **Single line text**    |
| Character limit | 500                     |
| Required        | No                      |
| Display name    | Secondary Button URL    |

#### Field 8: Desktop Image

| Property        | Value                              |
| --------------- | ---------------------------------- |
| Field name      | Desktop Image                      |
| Field key       | `desktop_image`                    |
| Field type      | **Single line text**               |
| Character limit | 1000                               |
| Required        | No                                 |
| Display name    | Desktop Hero Image URL             |
| Help text       | Full URL to hero image for desktop |

#### Field 9: Mobile Image

| Property        | Value                                                                      |
| --------------- | -------------------------------------------------------------------------- |
| Field name      | Mobile Image                                                               |
| Field key       | `mobile_image`                                                             |
| Field type      | **Single line text**                                                       |
| Character limit | 1000                                                                       |
| Required        | No                                                                         |
| Display name    | Mobile Hero Image URL                                                      |
| Help text       | Full URL to hero image for mobile (optional, defaults to desktop if empty) |

#### Field 10: Image Alt

| Property        | Value                |
| --------------- | -------------------- |
| Field name      | Image Alt            |
| Field key       | `image_alt`          |
| Field type      | **Single line text** |
| Character limit | 200                  |
| Required        | No                   |
| Display name    | Image Alt Text       |

### Step 4: Save Definition

Click **Save** to create the metaobject definition.

---

## Part 2: Create Hero Section Metaobject Entry

### Step 1: Add Entry

1. In Shopify admin, go to **Settings** → **Metaobjects**
2. Find **Hero Section** and click to open
3. Click **Add entry**

### Step 2: Set Handle

- **Handle:** `hero-section` (important: must match exactly)
- This makes it accessible via GraphQL query

### Step 3: Populate with Current Content

Copy-paste these values from current live hero:

```
Eyebrow Tag: Festive Edit · 2025
Title: Heirlooms for the modern muse.
Subtitle: Hand-crafted Organza, Silk and Chanderi — woven with stories from across India.
Button Text: Shop Now
Button Link: /collections
Button Text Secondary: The Bridal Edit
Button Link Secondary: /collections/silk
Desktop Image: https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?auto=format&fit=crop&w=2000&q=85
Mobile Image: (leave empty - uses desktop image by default)
Image Alt: Suitique Designs Hero
```

### Step 4: Publish

Click **Publish** to save the metaobject entry.

---

## Part 3: Testing

### Test 1: Local Development

```bash
cd d:\Project2\CitrixClothes-main
npm run dev
```

Open http://localhost:3000 and verify:

- ✅ Hero section displays with current content
- ✅ No layout changes
- ✅ Styling identical to current live version
- ✅ Animations work (fade-in/fade-up)
- ✅ Buttons are clickable
- ✅ Responsive on mobile/tablet/desktop

### Test 2: Update Hero in Shopify

1. Go to Shopify admin → **Metaobjects** → **Hero Section** → `hero-section`
2. Change title to: **"Test: Updated Heading"**
3. Click **Publish**
4. Wait 2-5 seconds for ISR
5. Refresh http://localhost:3000
6. Verify new heading appears ✅

### Test 3: Fallback - Empty Field

1. In Shopify, delete the "Title" field value (leave blank)
2. Publish
3. Refresh page
4. Verify heading reverts to fallback: "Heirlooms for the modern muse." ✅

### Test 4: Fallback - Broken Image

1. In Shopify, change Desktop Image to invalid URL: `https://broken-url-test.invalid/image.jpg`
2. Publish
3. Refresh page
4. Verify image fails gracefully and fallback image loads without layout shift ✅
5. Check browser console for warning: `[HeroSectionUI] Image failed to load, using fallback`

### Test 5: Fallback - Delete Entire Metaobject

1. In Shopify admin, delete the `hero-section` metaobject entry
2. Wait for ISR
3. Refresh page
4. Verify hero displays with original current content (full fallback) ✅
5. Check console for warning: `[HeroMetaobject] Metaobject not found in Shopify`

### Test 6: Production Deployment

After local testing passes:

```bash
npm run build  # Verify no errors
git add .
git commit -m "feat: Add dynamic Shopify-controlled hero section with fallback protection"
git push
```

Deploy to production (Vercel or your hosting):

- Verify build succeeds
- Test hero renders with fallback
- Populate Shopify metaobject with production content
- Verify dynamic updates work in production

---

## Part 4: Troubleshooting

### Hero shows fallback content

✅ **Expected if:** Metaobject not created yet, or fields are empty

- **Solution:** Create metaobject entry with handle `hero-section` and populate fields

### Hero image broken on page

✅ **Expected fallback behavior**

- **Check:** Browser console for `[HeroSectionUI] Image failed to load`
- **Solution:** Update image URL in Shopify metaobject

### Changes not appearing after update

- **ISR revalidates every 1 hour** - wait or manually clear cache
- **Check:** Console logs: `[HeroMetaobject]` shows fetch result
- **Solution:** Wait 1 hour for automatic revalidation, or redeploy for immediate update

### "Metaobject not found" in console

✅ **This is normal** if metaobject not created yet

- Hero will render with fallback content
- No errors or blank space

### Styling looks different

❌ **Should not happen** - UI is locked

- **Check:** Hero layout, colors, typography should be identical
- **If broken:** Verify `HeroSectionUI.tsx` styling matches original

---

## Part 5: Console Logging (for debugging)

During development, you'll see console logs:

```
✅ Normal (Shopify configured, metaobject exists):
[HeroMetaobject] Successfully fetched from Shopify { keys: [ ... ] }

✅ Expected (Shopify configured, metaobject not yet created):
[HeroMetaobject] Metaobject not found in Shopify
→ Falls back to current content

✅ Expected (Missing Shopify fields):
[DynamicHero] Missing Shopify fields, using fallback { missingFields: [...] }

✅ Expected (Image fails):
[HeroSectionUI] Image failed to load, using fallback { failedUrl: '...', fallbackUrl: '...' }

❌ Error (should not see):
If you see errors that block rendering, check:
1. Metaobject query syntax
2. Shopify token/domain configuration
3. GraphQL API errors
```

---

## File Changes Summary

### New Files Created

- `lib/hero-fallback.ts` — Fallback data + merge logic
- `lib/image-validator.ts` — Image URL validation
- `components/DynamicHero.tsx` — Server component (fetches + merges)
- `components/HeroSectionUI.tsx` — Client component (renders UI)

### Files Modified

- `lib/queries.ts` — Added HERO_METAOBJECT_QUERY
- `lib/shopify.ts` — Added getHeroMetaobject() function, imported new query
- `app/page.tsx` — Replaced hardcoded hero with `<DynamicHero />`

### UI/Styling

- **NO CHANGES** — All CSS, Tailwind, animations, layout preserved exactly
- Hero height: 78vh mobile, 88vh desktop (unchanged)
- Colors, fonts, spacing, hover effects all identical
- Only content (text, images) changes dynamically

---

## Key Features Implemented

| Feature            | Status | Details                                            |
| ------------------ | ------ | -------------------------------------------------- |
| Fetch from Shopify | ✅     | GraphQL metaobject query                           |
| Fallback System    | ✅     | Entire hero falls back if any field missing        |
| Image Validation   | ✅     | URL validation + onError handler                   |
| Image Fallback     | ✅     | Automatic switch to hardcoded image if broken      |
| Zero UI Changes    | ✅     | Exact same design, layout, typography, animations  |
| Performance        | ✅     | LCP optimized, priority loading, 1hr ISR           |
| Error Handling     | ✅     | Console warnings, no crashes, graceful degradation |
| Mobile Responsive  | ✅     | All responsive behavior preserved                  |
| TypeScript         | ✅     | Full type safety, no errors                        |

---

## Production Readiness Checklist

- [ ] Metaobject created in Shopify admin
- [ ] `hero-section` entry populated with content
- [ ] Local testing passed (all 6 tests above)
- [ ] Build successful on production
- [ ] Hero renders correctly in production
- [ ] Fallback tested (empty/broken data)
- [ ] Images load without layout shift
- [ ] Console logs show expected behavior
- [ ] Team trained on Shopify metaobject editing

---

## Support

If you encounter issues:

1. Check console logs for diagnostic messages
2. Verify Shopify metaobject configuration matches above
3. Ensure `hero-section` handle is exactly correct
4. Test with sample data before live content
5. Check your Shopify Storefront API token is valid

**Hero section is now fully dynamic, protected by fallback, and ready for production.** ✅
