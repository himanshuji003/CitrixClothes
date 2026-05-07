/** @type {import('next').NextConfig} */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

let allowedDevOrigins = [];

try {
  allowedDevOrigins = [new URL(baseUrl).host];
} catch {
  allowedDevOrigins = [];
}

const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "customer-assets.emergentagent.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
};
module.exports = nextConfig;
