import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-cream-100">
      <div className="container py-14 grid gap-12 md:grid-cols-5">
        <div className="md:col-span-2 max-w-md">
          <div className="font-serif text-2xl tracking-wide text-brand-900">Suitique Designs</div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mt-2">Luxe Collection</p>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">Handcrafted ethnic couture, woven with stories and stitched with intention. Every piece is made to be worn for a lifetime.</p>
        </div>
        <div>
          <h4 className="font-serif text-base text-brand-900 mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/collections/organza" className="hover:text-brand-700 transition-colors duration-200 cursor-pointer">Organza</Link></li>
            <li><Link href="/collections/silk" className="hover:text-brand-700 transition-colors duration-200 cursor-pointer">Silk</Link></li>
            <li><Link href="/collections/chanderi" className="hover:text-brand-700 transition-colors duration-200 cursor-pointer">Chanderi</Link></li>
            <li><Link href="/collections/muslin" className="hover:text-brand-700 transition-colors duration-200 cursor-pointer">Muslin</Link></li>
            <li><Link href="/wishlist" className="hover:text-brand-700 transition-colors duration-200 cursor-pointer">Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-base text-brand-900 mb-4">House</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="#" className="hover:text-brand-700 transition-colors duration-200 cursor-pointer">Our Story</Link></li>
            <li><Link href="#" className="hover:text-brand-700 transition-colors duration-200 cursor-pointer">Atelier</Link></li>
            <li><Link href="#" className="hover:text-brand-700 transition-colors duration-200 cursor-pointer">Care</Link></li>
            <li><Link href="#" className="hover:text-brand-700 transition-colors duration-200 cursor-pointer">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-base text-brand-900 mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/refund-policy" className="hover:text-brand-700 transition-colors duration-200 cursor-pointer">Refund Policy</Link></li>
            <li><Link href="/about-us" className="hover:text-brand-700 transition-colors duration-200 cursor-pointer">About Us</Link></li>
            <li><Link href="/contact-us" className="hover:text-brand-700 transition-colors duration-200 cursor-pointer">Contact Us</Link></li>
            <li><Link href="/faqs" className="hover:text-brand-700 transition-colors duration-200 cursor-pointer">FAQs</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-brand-700 transition-colors duration-200 cursor-pointer">Privacy Policy</Link></li>
            <li><Link href="/terms-and-conditions" className="hover:text-brand-700 transition-colors duration-200 cursor-pointer">Terms & Conditions</Link></li>
            <li><Link href="/shipping-and-return" className="hover:text-brand-700 transition-colors duration-200 cursor-pointer">Shipping & Return</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Suitique Designs. All rights reserved.</span>
          <span className="tracking-[0.2em] uppercase">Made with care · India</span>
        </div>
      </div>
      <div className="border-t border-border/50">
        <div className="container py-4 flex justify-center">
          <p className="text-xs text-muted-foreground">
            Built with <span className="text-brand-700">❤</span> by <Link href="https://himanshuji003.me/" target="_blank" rel="noopener noreferrer" className="text-brand-700 font-serif hover:underline transition-colors duration-200">Himanshu</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
