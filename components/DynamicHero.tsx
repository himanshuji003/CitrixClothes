/**
 * DynamicHero Server Component
 * Fetches hero data from Shopify metaobject and merges with fallback
 * Renders HeroSectionUI with validated data
 */

import { getHeroMetaobject } from '@/lib/shopify';
import { HERO_FALLBACK, mergeHeroData, type HeroData } from '@/lib/hero-fallback';
import {
  getValidImage,
  isValidImageUrl,
  optimizeImageUrl,
} from '@/lib/image-validator';
import HeroSectionUI from './HeroSectionUI';

/**
 * Parse Shopify metaobject fields to HeroData structure
 * Maps metaobject keys to HeroData interface
 */
function parseShopifyHeroData(
  shopifyFields: Record<string, string>
): Partial<HeroData> | null {
  if (!shopifyFields || Object.keys(shopifyFields).length === 0) {
    return null;
  }

  return {
    eyebrowTag: shopifyFields.eyebrow_tag,
    heading: shopifyFields.title,
    subheading: shopifyFields.subtitle,
    buttonText: shopifyFields.button_text,
    buttonLink: shopifyFields.button_link,
    buttonTextSecondary: shopifyFields.button_text_secondary,
    buttonLinkSecondary: shopifyFields.button_link_secondary,
    desktopImageUrl: shopifyFields.desktop_image,
    mobileImageUrl: shopifyFields.mobile_image || shopifyFields.desktop_image,
    imageAlt: shopifyFields.image_alt,
  };
}

/**
 * Validate hero data images
 * Ensures image URLs are valid, uses fallback if not
 */
function validateHeroImages(heroData: HeroData): HeroData {
  return {
    ...heroData,
    desktopImageUrl: getValidImage(heroData.desktopImageUrl, HERO_FALLBACK.desktopImageUrl),
    mobileImageUrl: getValidImage(heroData.mobileImageUrl, HERO_FALLBACK.mobileImageUrl),
  };
}

export default async function DynamicHero() {
  try {
    // Fetch hero metaobject from Shopify
    const shopifyMetaobject = await getHeroMetaobject();

    // Parse Shopify data
    const shopifyHeroData = shopifyMetaobject
      ? parseShopifyHeroData(shopifyMetaobject)
      : null;

    // Merge with fallback (uses fallback for any missing fields)
    let heroData = mergeHeroData(shopifyHeroData);

    // Validate and optimize images
    heroData = validateHeroImages(heroData);

    // Log warnings for missing Shopify fields (development only)
    if (shopifyHeroData && process.env.NODE_ENV === 'development') {
      const missingFields = Object.entries(shopifyHeroData)
        .filter(([, value]) => !value || value.trim() === '')
        .map(([key]) => key);

      if (missingFields.length > 0) {
        console.warn('[DynamicHero] Missing Shopify fields, using fallback', {
          missingFields,
        });
      }
    }

    // Render UI component with validated data
    return <HeroSectionUI heroData={heroData} />;
  } catch (error) {
    // Error boundary will catch and render fallback
    console.error('[DynamicHero] Error fetching hero data', {
      error: error instanceof Error ? error.message : String(error),
    });

    // Render with fallback data
    return <HeroSectionUI heroData={HERO_FALLBACK} />;
  }
}
