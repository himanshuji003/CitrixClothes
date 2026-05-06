/**
 * SEO Meta Tags Helper
 * 
 * Generates consistent Open Graph and Twitter meta tags for social sharing.
 * Used in page metadata configurations.
 */

export interface MetaTagsConfig {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'article';
}

/**
 * Generates Open Graph and Twitter meta tags
 * 
 * @param config - Meta tags configuration
 * @returns Object with meta property for Next.js metadata API
 * 
 * Usage:
 * export const metadata = generateMetaTags({
 *   title: 'Page Title',
 *   description: 'Page description',
 *   url: 'https://citrix-clothes.vercel.app/page',
 * });
 */
export function generateMetaTags(config: MetaTagsConfig) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://citrix-clothes.vercel.app';
  const imageUrl = config.image || `${baseUrl}/og-image.jpg`;

  return {
    title: config.title,
    description: config.description,
    canonical: config.url,
    openGraph: {
      title: config.title,
      description: config.description,
      url: config.url,
      type: config.type || 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: config.title,
        },
      ],
      siteName: 'Citrix Clothes',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [imageUrl],
      creator: '@citrixclothes',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Helper to generate canonical URL
 * 
 * @param path - Page path (e.g., '/products/item-123')
 * @returns Full canonical URL
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://citrix-clothes.vercel.app';
  return `${baseUrl}${path}`;
}

/**
 * Helper to noindex protected or meta pages
 * 
 * @returns robots meta configuration
 */
export function noindexMetadata() {
  return {
    robots: {
      index: false,
      follow: false,
    },
  };
}
