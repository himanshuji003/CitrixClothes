/**
 * Fallback hero data - uses current live hero section content
 * Used when Shopify data is missing, broken, or invalid
 */

export interface HeroData {
  eyebrowTag: string;
  heading: string;
  subheading: string;
  buttonText: string;
  buttonLink: string;
  buttonTextSecondary?: string;
  buttonLinkSecondary?: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  imageAlt: string;
}

export const HERO_FALLBACK: HeroData = {
  eyebrowTag: 'Festive Edit · 2025',
  heading: 'Heirlooms for the modern muse.',
  subheading:
    'Hand-crafted Organza, Silk and Chanderi — woven with stories from across India.',
  buttonText: 'Shop Now',
  buttonLink: '/collections',
  buttonTextSecondary: 'The Bridal Edit',
  buttonLinkSecondary: '/collections/silk',
  desktopImageUrl:
    'https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?auto=format&fit=crop&w=2000&q=85',
  mobileImageUrl:
    'https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?auto=format&fit=crop&w=1200&q=85',
  imageAlt: 'Suitique Designs Hero',
};

/**
 * Merge Shopify hero data with fallback
 * Uses fallback for any missing, null, undefined, or empty fields
 */
export function mergeHeroData(shopifyData: Partial<HeroData> | null): HeroData {
  if (!shopifyData) return HERO_FALLBACK;

  return {
    eyebrowTag: shopifyData.eyebrowTag?.trim() || HERO_FALLBACK.eyebrowTag,
    heading: shopifyData.heading?.trim() || HERO_FALLBACK.heading,
    subheading: shopifyData.subheading?.trim() || HERO_FALLBACK.subheading,
    buttonText: shopifyData.buttonText?.trim() || HERO_FALLBACK.buttonText,
    buttonLink: shopifyData.buttonLink?.trim() || HERO_FALLBACK.buttonLink,
    buttonTextSecondary:
      shopifyData.buttonTextSecondary?.trim() || HERO_FALLBACK.buttonTextSecondary,
    buttonLinkSecondary:
      shopifyData.buttonLinkSecondary?.trim() || HERO_FALLBACK.buttonLinkSecondary,
    desktopImageUrl: shopifyData.desktopImageUrl?.trim() || HERO_FALLBACK.desktopImageUrl,
    mobileImageUrl: shopifyData.mobileImageUrl?.trim() || HERO_FALLBACK.mobileImageUrl,
    imageAlt: shopifyData.imageAlt?.trim() || HERO_FALLBACK.imageAlt,
  };
}
