/**
 * Image validation utility
 * Ensures image URLs are valid before rendering, provides fallbacks for broken images
 */

/**
 * Validate if a URL is a valid image URL
 * @param url - URL to validate
 * @returns true if URL appears valid
 */
export function isValidImageUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  if (!url.trim()) return false;

  try {
    const urlObj = new URL(url);
    // Check for common image URL patterns
    return (
      urlObj.protocol === 'http:' ||
      urlObj.protocol === 'https:' ||
      urlObj.hostname.includes('unsplash') ||
      urlObj.hostname.includes('cdn') ||
      urlObj.hostname.includes('shopify') ||
      urlObj.hostname.includes('images')
    );
  } catch {
    return false;
  }
}

/**
 * Get valid image URL or fallback
 * @param primaryUrl - Primary image URL
 * @param fallbackUrl - Fallback image URL
 * @returns Valid image URL or fallback
 */
export function getValidImage(primaryUrl: unknown, fallbackUrl: string): string {
  if (isValidImageUrl(primaryUrl)) {
    return primaryUrl as string;
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[HeroImageValidator] Invalid primary image URL, using fallback',
      { primaryUrl, fallbackUrl }
    );
  }

  return fallbackUrl;
}

/**
 * Optimize image URL for display
 * Ensures consistent sizing and format parameters
 */
export function optimizeImageUrl(url: string): string {
  if (!url.includes('unsplash')) {
    return url; // Not an Unsplash image, return as-is
  }

  // Remove existing params if any and add optimized params
  const baseUrl = url.split('?')[0];
  return `${baseUrl}?auto=format&fit=crop&w=2000&q=85`;
}
