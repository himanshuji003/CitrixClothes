import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/lib/cart-context';
import { WishlistProvider } from '@/lib/wishlist-context';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://suitiquedesigns.com';
const OG_IMAGE = 'https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?auto=format&fit=crop&w=1200&q=85';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'SUITIQUE DESIGNS — Premium Ethnic Wear Collection', template: '%s — Suitique Designs' },
  description: 'Premium Ethnic Wear Collection. Hand-crafted Organza, Silk, Chanderi and Muslin, made in India.',
  keywords: ['Indian ethnic wear', 'Organza', 'Silk', 'Chanderi', 'Muslin', 'luxury ethnic', 'bridal wear', 'Suitique Designs'],
  authors: [{ name: 'Suitique Designs' }],
  openGraph: {
    title: 'SUITIQUE DESIGNS — Premium Ethnic Wear Collection',
    description: 'Hand-crafted Organza, Silk, Chanderi and Muslin. Heirlooms for the modern muse.',
    url: SITE_URL,
    siteName: 'Suitique Designs',
    images: [{ url: OG_IMAGE, width: 1200, height: 800 }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SUITIQUE DESIGNS — Premium Ethnic Wear Collection',
    description: 'Hand-crafted Organza, Silk, Chanderi and Muslin.',
    images: [OG_IMAGE],
  },
  icons: { icon: '/favicon.ico' },
  robots: { index: true, follow: true },
};

export const viewport = { themeColor: '#FBF8F3', width: 'device-width', initialScale: 1, maximumScale: 5 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Navbar />
              <main className="min-h-[60vh] pt-[68px] md:pt-[88px]">{children}</main>
              <Footer />
              <CartDrawer />
              <Toaster richColors position="top-center" />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
