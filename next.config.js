/** @type {import('next').NextConfig} */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

let allowedDevOrigins = [];

try {
  allowedDevOrigins = [new URL(baseUrl).host];
} catch {
  allowedDevOrigins = [];
}

const nextConfig = {
  // ✅ Production Security Settings
  reactStrictMode: true,

  // ✅ Prevent information leakage in production
  productionBrowserSourceMaps: false,

  // ✅ Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      // CSP header for sensitive routes
      {
        source: "/api/auth/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
          },
        ],
      },
    ];
  },

  // ✅ Redirect HTTP to HTTPS in production
  async redirects() {
    if (process.env.NODE_ENV === "production") {
      return [
        {
          source: "/:path*",
          destination: "/:path*",
          permanent: false,
          has: [
            {
              type: "header",
              key: "x-forwarded-proto",
              value: "http",
            },
          ],
        },
      ];
    }
    return [];
  },

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
