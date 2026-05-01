/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'customer-assets.emergentagent.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
    ],
  },
};
module.exports = nextConfig;
