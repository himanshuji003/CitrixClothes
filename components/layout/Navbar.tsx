'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search, ShoppingBag, X, Heart, LogOut, LogIn, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useAuthContext } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import SearchDialog from '@/components/search/SearchDialog';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_refined-retail-1/artifacts/7sv48thr_image.png';

const NAV_LINKS = [
  { href: '/collections/organza', label: 'Organza' },
  { href: '/collections/silk', label: 'Silk' },
  { href: '/collections/chanderi', label: 'Chanderi' },
  { href: '/collections/muslin', label: 'Muslin' },
  { href: '/collections', label: 'All' },
];

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();
  const { count: wishCount } = useWishlist();
  const { accessToken, customer, clearToken } = useAuthContext();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hydrate after mount
  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleLogout = () => {
    clearToken();
    router.push('/');
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent',
        scrolled ? 'bg-cream-50/95 backdrop-blur-md border-border/60' : 'bg-cream-50/80 backdrop-blur-sm'
      )}>
        <div className="container relative">
          <div className={cn('grid grid-cols-3 items-center transition-all duration-300', scrolled ? 'h-[60px] md:h-[72px]' : 'h-[68px] md:h-[88px]')}>
            <div className="flex items-center gap-1 md:gap-6">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <button aria-label="Open menu" className="md:hidden -ml-2 p-2 text-brand-900">
                    <Menu className="h-6 w-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-md bg-cream-50 border-r border-border p-0">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                      <span className="font-serif text-lg tracking-[0.2em] text-brand-900">MENU</span>
                      <button onClick={() => setOpen(false)} className="p-2 -mr-2" aria-label="Close"><X className="h-5 w-5" /></button>
                    </div>
                    <nav className="flex flex-col px-6 py-6 gap-1">
                      {NAV_LINKS.map((l) => (
                        <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="font-serif text-2xl py-3 text-brand-900 border-b border-border/50 last:border-0 hover:text-brand-500 transition-colors">{l.label}</Link>
                      ))}
                      <Link href="/wishlist" onClick={() => setOpen(false)} className="font-serif text-2xl py-3 text-brand-900 border-b border-border/50 hover:text-brand-500 transition-colors">Wishlist</Link>
                      
                      {/* Mobile Auth Section */}
                      <div className="border-t border-border/50 mt-6 pt-6">
                        {hydrated && accessToken && customer ? (
                          <>
                            <p className="text-xs uppercase tracking-[0.1em] text-slate-600 mb-4">Account</p>
                            <Link href="/account/orders" onClick={() => setOpen(false)} className="font-serif text-lg py-2 text-brand-900 hover:text-brand-500 transition-colors flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4" />
                              My Orders
                            </Link>
                            <button onClick={() => { handleLogout(); setOpen(false); }} className="font-serif text-lg py-2 text-brand-900 hover:text-red-600 transition-colors flex items-center gap-2 w-full text-left">
                              <LogOut className="h-4 w-4" />
                              Logout
                            </button>
                          </>
                        ) : (
                          <button onClick={() => { handleLoginClick(); setOpen(false); }} className="font-serif text-lg py-3 text-brand-900 hover:text-brand-500 transition-colors flex items-center gap-2 w-full">
                            <LogIn className="h-4 w-4" />
                            Sign In
                          </button>
                        )}
                      </div>
                    </nav>
                    <div className="mt-auto px-6 py-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">Suitique Designs · Luxe Collection</div>
                  </div>
                </SheetContent>
              </Sheet>
              <nav className="hidden md:flex items-center gap-7">
                {NAV_LINKS.slice(0, 4).map((l) => (
                  <Link key={l.href} href={l.href} className="text-[12px] tracking-[0.18em] uppercase text-brand-900/80 hover:text-brand-700 transition-colors">{l.label}</Link>
                ))}
              </nav>
            </div>

            <Link href="/" className="flex items-center justify-center select-none" aria-label="Suitique Designs Home">
              <Image
              src={LOGO_URL}
              alt="Suitique Designs"
              width={300}
              height={100}
              priority
              className={cn(
                "object-contain w-auto transition-all duration-300",
                scrolled ? "h-12 md:h-14" : "h-16 md:h-20"
              )}/>
            </Link>

            <div className="flex items-center justify-end gap-0 md:gap-1 text-brand-900">
              <button aria-label="Search" onClick={() => setSearchOpen(true)} className="p-2.5 hover:text-brand-500 transition-colors"><Search className="h-5 w-5" /></button>
              <Link href="/wishlist" aria-label="Wishlist" className="hidden sm:inline-flex relative p-2.5 hover:text-brand-500 transition-colors">
                <Heart className="h-5 w-5" />
                {wishCount > 0 && <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-brand-700 text-cream-50 text-[9px] font-medium flex items-center justify-center">{wishCount}</span>}
              </Link>
              <button aria-label="Open cart" onClick={() => setCartOpen(true)} className="relative p-2.5 hover:text-brand-500 transition-colors">
                <ShoppingBag className="h-5 w-5" />
                {count > 0 && <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-700 text-cream-50 text-[10px] font-medium flex items-center justify-center">{count}</span>}
              </button>

              {/* Desktop Auth Menu */}
              {hydrated && (
                accessToken && customer ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        aria-label="Account menu"
                        className="hidden md:flex ml-2 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-sm font-medium text-slate-900"
                      >
                        {customer.firstName || 'Account'}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-2 py-1.5 text-sm font-medium text-slate-900">
                        {customer.email}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/account/orders" className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4" />
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <button
                    onClick={handleLoginClick}
                    className="hidden md:inline-flex ml-2 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-sm font-medium text-slate-900 items-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </header>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
