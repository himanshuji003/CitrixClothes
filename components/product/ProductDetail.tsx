'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Truck, Sparkles, ShieldCheck } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { formatINR } from '@/lib/products';
import ProductGrid from './ProductGrid';
import { toast } from 'sonner';
import type { Product } from '@/types';

interface Props { product: Product; related: Product[] }

export default function ProductDetail({ product, related }: Props) {
  const { addItem } = useCart();
  const { has, toggle, hydrated } = useWishlist();
  const wished = hydrated && has(product.handle);
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [activeImg, setActiveImg] = useState(0);

  const onAdd = () => {
    if (!size && product.sizes.length > 1) { toast.error('Please select a size'); return; }
    addItem(product, size, 1);
    toast.success('Added to bag');
  };

  return (
    <>
      <section className="container pt-6 md:pt-12 pb-28 md:pb-20">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-6 hidden md:block">
          <Link href="/">Home</Link> <span className="mx-2 opacity-50">/</span>
          <Link href={`/collections/${product.collection || 'all'}`} className="capitalize">{product.collection?.replace('-', ' ') || 'Shop'}</Link> <span className="mx-2 opacity-50">/</span>
          <span className="text-brand-900">{product.title}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-12 lg:gap-16">
          <div>
            <div className="relative aspect-[3/4] bg-cream-100 overflow-hidden rounded-sm">
              {product.images && product.images.length > 0 ? (
                <motion.div key={activeImg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="absolute inset-0">
                  <Image src={product.images[activeImg]} alt={product.title} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                </motion.div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-muted-foreground">No Image Available</span>
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2 md:gap-3">
                {product.images.map((img, i) => (
                  img && (
                    <button key={i} onClick={() => setActiveImg(i)} aria-label={`View image ${i + 1}`} className={`relative aspect-[3/4] overflow-hidden rounded-sm bg-cream-100 ${i === activeImg ? 'ring-2 ring-brand-700' : 'ring-1 ring-border hover:ring-brand-300'}`}>
                      <Image src={img} alt={`thumb-${i}`} fill sizes="15vw" className="object-cover" />
                    </button>
                  )
                ))}
              </div>
            )}
          </div>

          <div className="md:sticky md:top-28 md:self-start">
            {product.tag && <span className="text-[11px] uppercase tracking-[0.28em] text-brand-500">{product.tag}</span>}
            <h1 className="font-serif text-3xl md:text-4xl text-brand-900 mt-2 leading-tight">{product.title}</h1>
            <div className="mt-3 flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl text-brand-900">{formatINR(product.price)}</span>
              {product.compareAt && product.compareAt > product.price && (
                <>
                  <span className="text-base text-muted-foreground line-through">{formatINR(product.compareAt)}</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-brand-500">{Math.round((1 - product.price / product.compareAt) * 100)}% off</span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">{product.description}</p>

            {product.sizes.length > 1 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-[0.22em] text-brand-900">Size</span>
                  <button className="text-xs uppercase tracking-[0.22em] text-muted-foreground underline-offset-4 underline hover:text-brand-700">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button key={s} onClick={() => setSize(s)} className={`min-w-[60px] h-12 px-4 text-sm border rounded-sm transition ${size === s ? 'bg-brand-700 text-cream-50 border-brand-700' : 'bg-cream-50 border-border hover:border-brand-300 text-brand-900'}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="hidden md:flex gap-3 mt-8">
              <Button onClick={onAdd} size="lg" className="flex-1 rounded-none bg-brand-700 hover:bg-brand-900 text-cream-50 h-14 tracking-[0.22em] uppercase text-xs">Add to Bag</Button>
              <button onClick={() => toggle(product.handle)} aria-label="Wishlist" className={`w-14 h-14 border rounded-sm transition flex items-center justify-center ${wished ? 'border-brand-700 bg-brand-700 text-cream-50' : 'border-border hover:border-brand-300 text-brand-900'}`}>
                <Heart className={`h-5 w-5 ${wished ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 border-y border-border py-5">
              <div className="flex flex-col items-center text-center gap-1"><Truck className="h-4 w-4 text-brand-700" /><span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Free Shipping</span></div>
              <div className="flex flex-col items-center text-center gap-1"><Sparkles className="h-4 w-4 text-brand-700" /><span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Hand Crafted</span></div>
              <div className="flex flex-col items-center text-center gap-1"><ShieldCheck className="h-4 w-4 text-brand-700" /><span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Easy Returns</span></div>
            </div>

            <Accordion type="single" collapsible className="mt-2">
              <AccordionItem value="details" className="border-border"><AccordionTrigger className="text-xs uppercase tracking-[0.22em] text-brand-900 hover:no-underline">Details & Care</AccordionTrigger><AccordionContent className="text-sm text-muted-foreground leading-relaxed">Hand-finished by master craftspeople. Dry clean only. Store in a muslin bag away from direct sunlight to preserve embroidery and colour.</AccordionContent></AccordionItem>
              <AccordionItem value="shipping" className="border-border"><AccordionTrigger className="text-xs uppercase tracking-[0.22em] text-brand-900 hover:no-underline">Shipping & Returns</AccordionTrigger><AccordionContent className="text-sm text-muted-foreground leading-relaxed">Free shipping across India on orders above ₹5,000. Dispatched in 3–5 business days. 7-day easy returns on unworn pieces with original tags.</AccordionContent></AccordionItem>
              <AccordionItem value="fit" className="border-border"><AccordionTrigger className="text-xs uppercase tracking-[0.22em] text-brand-900 hover:no-underline">Fit & Sizing</AccordionTrigger><AccordionContent className="text-sm text-muted-foreground leading-relaxed">Model is 5'8" wearing size S. Pieces run true to size. Custom sizing available on request — write to us at care@suitiquedesigns.com.</AccordionContent></AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container pb-20">
          <h2 className="font-serif text-2xl md:text-3xl text-brand-900 mb-8">You may also love</h2>
          <ProductGrid products={related} />
        </section>
      )}

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream-50/95 backdrop-blur-md border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex gap-2">
        <button onClick={() => toggle(product.handle)} aria-label="Wishlist" className={`w-12 h-12 border rounded-sm flex items-center justify-center flex-shrink-0 ${wished ? 'border-brand-700 bg-brand-700 text-cream-50' : 'border-border text-brand-900'}`}>
          <Heart className={`h-5 w-5 ${wished ? 'fill-current' : ''}`} />
        </button>
        <Button onClick={onAdd} className="flex-1 rounded-none bg-brand-700 hover:bg-brand-900 text-cream-50 h-12 tracking-[0.18em] uppercase text-xs">Add to Bag · {formatINR(product.price)}</Button>
      </div>
    </>
  );
}
