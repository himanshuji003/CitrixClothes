'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { formatINR } from '@/lib/products';
import type { Product } from '@/types';

interface Props { open: boolean; onOpenChange: (v: boolean) => void }

export default function SearchDialog({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || products.length > 0) return;
    setLoading(true);
    fetch('/api/products').then((r) => r.json()).then((d) => setProducts(d.products || [])).finally(() => setLoading(false));
  }, [open, products.length]);

  useEffect(() => { if (!open) setQuery(''); }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return products.slice(0, 6);
    const q = query.toLowerCase();
    return products.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.collection?.toLowerCase().includes(q)).slice(0, 8);
  }, [query, products]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 bg-cream-50 border-border gap-0 overflow-hidden">
        <DialogTitle asChild>
          <VisuallyHidden>Search Products</VisuallyHidden>
        </DialogTitle>
        <DialogDescription asChild>
          <VisuallyHidden>Search for products by name, collection, or description</VisuallyHidden>
        </DialogDescription>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Search className="h-5 w-5 text-brand-900" />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Organza, Silk, Chanderi…" className="flex-1 bg-transparent text-base placeholder:text-muted-foreground focus:outline-none text-brand-900" />
          <button onClick={() => onOpenChange(false)} aria-label="Close" className="text-muted-foreground hover:text-brand-900 p-1"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {!query.trim() && <div className="px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Trending</div>}
          {loading && <div className="px-5 py-8 text-sm text-muted-foreground">Loading…</div>}
          {!loading && results.length === 0 && <div className="px-5 py-12 text-center"><p className="font-serif text-xl text-brand-900">No matches found</p><p className="text-sm text-muted-foreground mt-1">Try “Organza” or “Silk”</p></div>}
          <div className="divide-y divide-border">
            {results.map((p) => (
              <Link key={p.handle} href={`/products/${p.handle}`} onClick={() => onOpenChange(false)} className="flex items-center gap-4 px-5 py-3 hover:bg-cream-100 transition-colors">
                <div className="relative w-14 h-16 flex-shrink-0 bg-cream-100 overflow-hidden rounded-sm">
                  {p.images?.[0] && <Image src={p.images[0]} alt={p.title} fill sizes="56px" className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-[15px] text-brand-900 truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{p.collection?.replace('-', ' ')}</div>
                </div>
                <div className="text-sm text-brand-900">{formatINR(p.price)}</div>
              </Link>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
