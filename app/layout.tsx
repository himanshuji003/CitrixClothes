import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/lib/cart-context';
import { WishlistProvider } from '@/lib/wishlist-context';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const DEFAULT_SITE_URL = 'http://localhost:3000';

function getSafeSiteUrl(value?: string) {
  const candidate = value?.trim() || DEFAULT_SITE_URL;

  try {
    return new URL(candidate).toString();
  } catch {
    return DEFAULT_SITE_URL;
  }
}

const SITE_URL = getSafeSiteUrl(process.env.NEXT_PUBLIC_BASE_URL);

const OG_IMAGE =
  'https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?auto=format&fit=crop&w=1200&q=85';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Citrix Clothes — Premium Fashion Collection',
    template: '%s — Citrix Clothes',
  },
  description:
    'Discover premium fashion collection at Citrix Clothes. Shop exclusive designs, track orders, and enjoy secure checkout with Shopify authentication.',
  keywords: [
    'fashion',
    'premium clothing',
    'online shopping',
    'designer clothes',
    'citrix clothes',
  ],
  authors: [{ name: 'Citrix Clothes' }],
  openGraph: {
    title: 'Citrix Clothes — Premium Fashion Collection',
    description:
      'Discover exclusive fashion designs. Sign in to view your orders and enjoy personalized shopping.',
    url: SITE_URL,
    siteName: 'Citrix Clothes',
    images: [{ url: OG_IMAGE, width: 1200, height: 800 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Citrix Clothes — Premium Fashion Collection',
    description: 'Discover exclusive fashion designs at Citrix Clothes.',
    images: [OG_IMAGE],
    creator: '@citrixclothes',
  },
  icons: { icon: '/favicon.ico' },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Navbar />
              <main className="min-h-[60vh] pt-[108px] md:pt-[133px]">
                {children}
              </main>
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