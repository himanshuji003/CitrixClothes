'use client';
import { useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ProductGrid from '@/components/product/ProductGrid';
import type { Product } from '@/types';

const SIZES = ['XS','S','M','L','XL','XXL','Free Size'];
const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'new', label: 'Newest' },
];

interface Props { products: Product[]; title: string; tagline?: string; initialCollection?: string }

export default function CollectionsView({ products, title, tagline }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sort, setSort] = useState('featured');

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.price <= maxPrice && (selectedSizes.length === 0 || p.sizes.some((s) => selectedSizes.includes(s))));
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, selectedSizes, maxPrice, sort]);

  const toggleSize = (s: string) => setSelectedSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const reset = () => { setSelectedSizes([]); setMaxPrice(50000); };

  return (
    <>
      <section className="container pt-10 md:pt-16 pb-6 md:pb-10 text-center">
        {tagline && <span className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">{tagline}</span>}
        <h1 className="font-serif text-4xl md:text-6xl mt-3 text-brand-900">{title}</h1>
        <p className="text-sm text-muted-foreground mt-3">{filtered.length} pieces</p>
      </section>

      <div className="sticky top-[60px] md:top-[72px] z-30 bg-cream-50/95 backdrop-blur-md border-y border-border">
        <div className="container flex items-center justify-between h-12">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-brand-900 hover:text-brand-700">
                <SlidersHorizontal className="h-4 w-4" /> Filter
                {(selectedSizes.length > 0 || maxPrice < 50000) && <span className="ml-1 inline-block w-1.5 h-1.5 bg-brand-700 rounded-full" />}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="md:!max-w-md md:!ml-auto md:!right-0 md:!left-auto md:h-full md:!rounded-none rounded-t-2xl bg-cream-50 border-border p-0 max-h-[85vh] md:max-h-full overflow-y-auto">
              <div className="px-6 py-6">
                <div className="font-serif text-2xl text-brand-900 mb-6">Filter</div>
                <div className="mb-8">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-3">Size</div>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((s) => (
                      <button key={s} onClick={() => toggleSize(s)} className={`min-w-[52px] h-11 px-4 text-sm border rounded-sm transition ${selectedSizes.includes(s) ? 'bg-brand-700 text-cream-50 border-brand-700' : 'bg-cream-50 border-border hover:border-brand-300'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Max Price</span>
                    <span className="text-sm text-brand-900">₹{maxPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <input type="range" min={5000} max={50000} step={1000} value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full accent-brand-700" />
                </div>
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button onClick={reset} className="flex-1 h-12 border border-border text-xs uppercase tracking-[0.2em] hover:bg-cream-100">Reset</button>
                  <button onClick={() => setOpen(false)} className="flex-[1.5] h-12 bg-brand-700 text-cream-50 text-xs uppercase tracking-[0.2em] hover:bg-brand-900">Show {filtered.length}</button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-brand-900" />
            <select aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} className="text-xs uppercase tracking-[0.2em] bg-transparent text-brand-900 focus:outline-none cursor-pointer">
              {SORTS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
            </select>
          </div>
        </div>
      </div>

      <section className="container py-10 md:py-14">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif text-2xl text-brand-900">Nothing fits these filters.</p>
            <button onClick={reset} className="mt-4 text-xs uppercase tracking-[0.22em] text-brand-700 border-b border-brand-700 pb-0.5">Clear filters</button>
          </div>
        ) : <ProductGrid products={filtered} />}
      </section>
    </>
  );
}
