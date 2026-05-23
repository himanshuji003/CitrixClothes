'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Menu, Search, ShoppingBag, X, Heart, LogOut, User } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { cn } from '@/lib/utils';
import SearchDialog from '@/components/search/SearchDialog';
import TopInfoBar from '@/components/layout/TopInfoBar';

const LOGO_URL =
  'https://customer-assets.emergentagent.com/job_refined-retail-1/artifacts/7sv48thr_image.png';

const NAV_LINKS = [
  { href: '/collections/organza', label: 'Organza' },
  { href: '/collections/silk', label: 'Silk' },
  { href: '/collections/chanderi', label: 'Chanderi' },
  { href: '/collections/muslin', label: 'Muslin' },
  { href: '/collections', label: 'All' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { count, setOpen: setCartOpen } = useCart();
  const { count: wishCount } = useWishlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <TopInfoBar show={!scrolled} />

        <div
          className={cn(
            'transition-all duration-300 border-b border-transparent',
            scrolled
              ? 'bg-cream-50/95 backdrop-blur-md border-border/60'
              : 'bg-cream-50/80 backdrop-blur-sm'
          )}
        >
          <div className="container relative">
            <div
              className={cn(
                'grid grid-cols-3 items-center transition-all duration-300',
                scrolled ? 'h-[60px] md:h-[72px]' : 'h-[68px] md:h-[88px]'
              )}
            >
              <div className="flex items-center gap-1 md:gap-6">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <button
                      aria-label="Open menu"
                      className="md:hidden -ml-2 p-2 text-brand-900"
                    >
                      <Menu className="h-6 w-6" />
                    </button>
                  </SheetTrigger>

                  <SheetContent
                    side="left"
                    className="w-full sm:max-w-md bg-cream-50 border-r border-border p-0"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                        <SheetTitle className="font-serif text-lg tracking-[0.2em] text-brand-900">
                          MENU
                        </SheetTitle>
                        <SheetDescription className="hidden">
                          Navigation menu
                        </SheetDescription>
                        <button
                          onClick={() => setOpen(false)}
                          className="p-2 -mr-2"
                          aria-label="Close"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <nav className="flex flex-col px-6 py-6 gap-1">
                        {NAV_LINKS.map((l) => (
                          <Link
                            key={l.href}
                            href={l.href}
                            onClick={() => setOpen(false)}
                            className="font-serif text-2xl py-3 text-brand-900 border-b border-border/50 last:border-0 hover:text-brand-500 transition-colors"
                          >
                            {l.label}
                          </Link>
                        ))}

                        <Link
                          href="/wishlist"
                          onClick={() => setOpen(false)}
                          className="font-serif text-2xl py-3 text-brand-900 border-b border-border/50 hover:text-brand-500 transition-colors"
                        >
                          Wishlist
                        </Link>

                        <div className="border-t border-border/50 mt-6 pt-6 flex flex-col gap-3">
                          {isLoading ? (
                            <div className="h-10 bg-cream-200 rounded animate-pulse" />
                          ) : isAuthenticated && user ? (
                            <>
                              <Link
                                href="/account"
                                onClick={() => setOpen(false)}
                                className="w-full px-4 py-2 text-center text-sm uppercase tracking-[0.18em] text-brand-900 border border-brand-900 rounded hover:bg-brand-900 hover:text-cream-50 transition-colors flex items-center justify-center gap-2"
                              >
                                <User className="h-4 w-4" />
                                {user.firstName || 'Account'}
                              </Link>

                              <button
                                onClick={async () => {
                                  await logout();
                                  setOpen(false);
                                }}
                                disabled={isLoading}
                                className="w-full px-4 py-2 text-center text-sm uppercase tracking-[0.18em] text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-cream-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <LogOut className="h-4 w-4" />
                                Logout
                              </button>
                            </>
                          ) : (
                            <>
                              <Link
                                href="/login"
                                onClick={() => setOpen(false)}
                                className="w-full px-4 py-2 text-center text-sm uppercase tracking-[0.18em] text-brand-900 border border-brand-900 rounded hover:bg-brand-900 hover:text-cream-50 transition-colors"
                              >
                                Login
                              </Link>

                              <Link
                                href="/signup"
                                onClick={() => setOpen(false)}
                                className="w-full px-4 py-2 text-center text-sm uppercase tracking-[0.18em] text-cream-50 bg-brand-700 rounded hover:bg-brand-900 transition-colors"
                              >
                                Sign Up
                              </Link>
                            </>
                          )}
                        </div>
                      </nav>

                      <div className="mt-auto px-6 py-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                        Suitique Designs · Luxe Collection
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <nav className="hidden md:flex items-center gap-7">
                  {NAV_LINKS.slice(0, 4).map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="text-[12px] tracking-[0.18em] uppercase text-brand-900/80 hover:text-brand-700 transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <Link
                href="/"
                className="flex items-center justify-center select-none"
                aria-label="Suitique Designs Home"
              >
                <Image
                  src={LOGO_URL}
                  alt="Suitique Designs"
                  width={300}
                  height={100}
                  priority
                  className={cn(
                    'object-contain w-auto transition-all duration-300',
                    scrolled ? 'h-12 md:h-14' : 'h-16 md:h-20'
                  )}
                />
              </Link>

              <div className="flex items-center justify-end gap-0 md:gap-1 text-brand-900">
                <button
                  aria-label="Search"
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 hover:text-brand-500 transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>

                <Link
                  href="/wishlist"
                  aria-label="Wishlist"
                  className="hidden sm:inline-flex relative p-2.5 hover:text-brand-500 transition-colors"
                >
                  <Heart className="h-5 w-5" />
                  {wishCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-brand-700 text-cream-50 text-[9px] font-medium flex items-center justify-center">
                      {wishCount}
                    </span>
                  )}
                </Link>

                <button
                  aria-label="Open cart"
                  onClick={() => setCartOpen(true)}
                  className="relative p-2.5 hover:text-brand-500 transition-colors"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {count > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-700 text-cream-50 text-[10px] font-medium flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </button>

                <div className="hidden md:flex items-center gap-2 ml-2">
                  {isLoading ? (
                    <div className="h-8 w-24 bg-cream-200 rounded animate-pulse" />
                  ) : isAuthenticated && user ? (
                    <>
                      <Link
                        href="/account"
                        className="px-4 py-1 text-xs uppercase tracking-[0.18em] text-brand-900 border border-brand-900 rounded hover:bg-brand-900 hover:text-cream-50 transition-colors flex items-center gap-1"
                      >
                        <User className="h-4 w-4" />
                        {user.firstName || 'Account'}
                      </Link>

                      <button
                        onClick={logout}
                        disabled={isLoading}
                        className="px-3 py-1 text-xs text-red-600 hover:text-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Logout"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="px-4 py-1 text-xs uppercase tracking-[0.18em] text-brand-900 border border-brand-900 rounded hover:bg-brand-900 hover:text-cream-50 transition-colors"
                      >
                        Login
                      </Link>

                      <Link
                        href="/signup"
                        className="px-4 py-1 text-xs uppercase tracking-[0.18em] text-cream-50 bg-brand-700 rounded hover:bg-brand-900 transition-colors"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}