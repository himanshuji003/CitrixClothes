import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-cream-100">
      <div className="container py-14 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2 max-w-md">
          <div className="font-serif text-2xl tracking-wide text-brand-900">Suitique Designs</div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mt-2">Luxe Collection</p>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">Handcrafted ethnic couture, woven with stories and stitched with intention. Every piece is made to be worn for a lifetime.</p>
        </div>
        <div>
          <h4 className="font-serif text-base text-brand-900 mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/collections/organza" className="hover:text-brand-700">Organza</Link></li>
            <li><Link href="/collections/silk" className="hover:text-brand-700">Silk</Link></li>
            <li><Link href="/collections/chanderi" className="hover:text-brand-700">Chanderi</Link></li>
            <li><Link href="/collections/muslin" className="hover:text-brand-700">Muslin</Link></li>
            <li><Link href="/wishlist" className="hover:text-brand-700">Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-base text-brand-900 mb-4">House</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="#" className="hover:text-brand-700">Our Story</Link></li>
            <li><Link href="#" className="hover:text-brand-700">Atelier</Link></li>
            <li><Link href="#" className="hover:text-brand-700">Care</Link></li>
            <li><Link href="#" className="hover:text-brand-700">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Suitique Designs. All rights reserved.</span>
          <span className="tracking-[0.2em] uppercase">Made with care · India</span>
        </div>
      </div>
    </footer>
  );
}
