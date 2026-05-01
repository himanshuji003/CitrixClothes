import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { ArrowRight } from 'lucide-react';
import { getProducts, getCollections } from '@/lib/shopify';
import ProductGrid from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/skeletons/ProductCardSkeleton';

async function NewArrivals() {
  const products = await getProducts();
  return <ProductGrid products={products.slice(0, 8)} />;
}

async function FeaturedCollections() {
  const collections = await getCollections();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {collections.map((c) => (
        <Link key={c.handle} href={`/collections/${c.handle}`} className="group relative block aspect-[4/5] overflow-hidden bg-cream-100 rounded-sm">
          <Image src={c.image} alt={c.title} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 text-cream-50">
            <p className="text-[10px] uppercase tracking-[0.28em] opacity-85">{c.tagline}</p>
            <h3 className="font-serif text-2xl md:text-3xl mt-1">{c.title}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="relative w-full h-[78vh] md:h-[88vh] min-h-[520px] overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?auto=format&fit=crop&w=2000&q=85" alt="Suitique Designs Hero" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/55" />
        <div className="relative h-full container flex flex-col justify-end pb-14 md:pb-24 text-cream-50">
          <span className="text-[11px] md:text-xs uppercase tracking-[0.32em] mb-4 opacity-90">Festive Edit · 2025</span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl leading-[1.05] max-w-2xl text-balance">Heirlooms for the modern muse.</h1>
          <p className="mt-4 max-w-md text-sm md:text-base text-cream-50/85 leading-relaxed">Hand-crafted Organza, Silk and Chanderi — woven with stories from across India.</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link href="/collections" className="inline-flex items-center justify-center bg-cream-50 text-brand-900 hover:bg-cream-100 transition-colors px-8 h-12 text-xs uppercase tracking-[0.22em]">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
            <Link href="/collections/silk" className="inline-flex items-center justify-center border border-cream-50/70 hover:bg-cream-50/10 text-cream-50 transition-colors px-8 h-12 text-xs uppercase tracking-[0.22em]">The Bridal Edit</Link>
          </div>
        </div>
      </section>

      <div className="border-y border-border bg-cream-100">
        <div className="container py-3 flex items-center justify-center gap-8 text-[11px] uppercase tracking-[0.28em] text-brand-900/70 overflow-x-auto scrollbar-hide whitespace-nowrap">
          <span>Hand Embroidered</span><span className="opacity-40">·</span>
          <span>Made in India</span><span className="opacity-40">·</span>
          <span>Free Shipping over ₹5,000</span><span className="opacity-40">·</span>
          <span>Atelier Crafted</span>
        </div>
      </div>

      <section className="container py-16 md:py-24">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Curated</span>
            <h2 className="font-serif text-3xl md:text-5xl mt-2 text-brand-900">Featured Collections</h2>
          </div>
          <Link href="/collections" className="hidden md:inline-flex items-center text-xs uppercase tracking-[0.22em] text-brand-700 hover:text-brand-900">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </div>
        <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">{Array.from({length:4}).map((_,i)=><div key={i} className="aspect-[4/5] bg-cream-200 rounded-sm animate-pulse"/>)}</div>}>
          <FeaturedCollections />
        </Suspense>
      </section>

      <section className="container pb-16 md:pb-24">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Just In</span>
            <h2 className="font-serif text-3xl md:text-5xl mt-2 text-brand-900">New Arrivals</h2>
          </div>
          <Link href="/collections" className="hidden md:inline-flex items-center text-xs uppercase tracking-[0.22em] text-brand-700 hover:text-brand-900">Shop All <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <NewArrivals />
        </Suspense>
      </section>

      <section className="relative w-full h-[60vh] min-h-[420px] overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1668371459824-094a960a227d?auto=format&fit=crop&w=2000&q=85" alt="Atelier story" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container h-full flex flex-col items-center justify-center text-center text-cream-50">
          <span className="text-[11px] uppercase tracking-[0.32em] opacity-85">The Atelier</span>
          <h2 className="font-serif text-3xl md:text-5xl mt-4 max-w-2xl text-balance">Where craftsmanship meets quiet luxury.</h2>
          <p className="mt-5 max-w-xl text-sm md:text-base text-cream-50/85 leading-relaxed">Every Suitique piece is hand-finished in our Mumbai atelier — block prints from Kutch, zardozi from Lucknow, weaves from Banaras.</p>
          <Link href="/collections" className="mt-8 inline-flex items-center border border-cream-50/70 hover:bg-cream-50/10 px-8 h-12 text-xs uppercase tracking-[0.22em]">Discover the Story</Link>
        </div>
      </section>

      <section className="container py-20 md:py-28 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="relative aspect-[4/5] overflow-hidden bg-cream-100">
          <Image src="https://images.unsplash.com/photo-1618901185975-d59f7091bcfe?auto=format&fit=crop&w=1400&q=85" alt="Heritage" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Heritage</span>
          <h2 className="font-serif text-3xl md:text-5xl mt-3 text-brand-900">Threads of memory, stitched with care.</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">From the resham embroidery of Uttar Pradesh to the gota-patti of Rajasthan, our collections celebrate techniques passed down through generations. We work directly with artisan clusters to create heirlooms — not trends.</p>
          <Link href="/collections" className="mt-8 inline-flex items-center text-xs uppercase tracking-[0.22em] text-brand-700 border-b border-brand-700 pb-1 hover:text-brand-900 hover:border-brand-900">Explore the Edit</Link>
        </div>
      </section>
    </>
  );
}
