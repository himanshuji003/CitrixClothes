'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/lib/wishlist-context';
import ProductGrid from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/skeletons/ProductCardSkeleton';
import type { Product } from '@/types';

export default function WishlistPage() {
  const { handles, hydrated } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products').then((r) => r.json()).then((d) => setProducts(d.products || [])).finally(() => setLoading(false));
  }, []);

  const wished = products.filter((p) => handles.includes(p.handle));

  return (
    <section className="container py-12 md:py-20">
      <div className="text-center mb-10 md:mb-14">
        <span className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">Saved for later</span>
        <h1 className="font-serif text-4xl md:text-6xl mt-3 text-brand-900">Your Wishlist</h1>
        <p className="text-sm text-muted-foreground mt-3">{hydrated ? `${wished.length} ${wished.length === 1 ? 'piece' : 'pieces'}` : '—'}</p>
      </div>

      {loading || !hydrated ? <ProductGridSkeleton count={4} /> : wished.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-2xl text-brand-900">Nothing saved yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Tap the heart on any piece to save it here.</p>
          <Link href="/collections" className="mt-8 inline-block bg-brand-700 hover:bg-brand-900 text-cream-50 px-8 h-12 leading-[3rem] text-xs uppercase tracking-[0.22em]">Discover Pieces</Link>
        </div>
      ) : <ProductGrid products={wished} />}
    </section>
  );
}
