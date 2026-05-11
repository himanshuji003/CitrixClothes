'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatINR } from '@/lib/products';
import { createCart } from '@/lib/shopify';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, subtotal, removeItem, updateQty, hydrated } = useCart();
  const [loading, setLoading] = useState(false);

  const onCheckout = async () => {
    setLoading(true);
    try {
      console.log('[Cart] onCheckout: Starting checkout', { itemCount: items.length, items });
      
      // Validate cart items have variant IDs
      const itemsWithoutVariants = items.filter((i) => !i.variantId);
      if (itemsWithoutVariants.length > 0) {
        console.error('[Cart] onCheckout: Cart contains items without valid variant IDs', {
          count: itemsWithoutVariants.length,
          itemsWithoutVariants,
          allItems: items.map((i) => ({
            title: i.title,
            handle: i.handle,
            size: i.size,
            key: i.key,
            variantId: i.variantId,
            variantIdType: typeof i.variantId,
          })),
        });
        toast.error('Some items in your cart are missing variant information. Please remove and re-add them.');
        return;
      }

      // Build cart lines with ONLY real Shopify variant IDs
      const lines = items.map((i) => ({
        merchandiseId: i.variantId as string,
        quantity: i.qty,
      }));

      console.log('[Cart] onCheckout: Initiating checkout', {
        itemCount: items.length,
        lines,
      });

      const cart = await createCart(lines);

      // Validate checkout URL
      if (!cart?.checkoutUrl) {
        console.error('[Cart] onCheckout: No checkoutUrl in response', { cart });
        toast.error('Failed to initialize checkout. Please try again.');
        return;
      }

      if (cart.checkoutUrl === '#mock-checkout') {
        console.warn('[Cart] onCheckout: Mock checkout URL detected', { cart });
        toast.info('Demo mode — connect your Shopify store to enable checkout.');
        return;
      }

      console.log('[Cart] onCheckout: Valid checkout URL received, redirecting', {
        checkoutUrl: cart.checkoutUrl,
      });

      // Redirect to Shopify checkout
      window.location.href = cart.checkoutUrl;
    } catch (error) {
      console.error('[Cart] onCheckout: Checkout failed', {
        error: error instanceof Error ? error.message : String(error),
        itemCount: items.length,
      });
      toast.error('Checkout failed. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  

  if (!hydrated) return <div className="container py-20"><div className="h-10 w-48 bg-cream-200 rounded animate-pulse" /></div>;

  return (
    <section className="container py-12 md:py-20">
      <h1 className="font-serif text-4xl md:text-5xl text-brand-900 mb-2">Your Bag</h1>
      <p className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? 'piece' : 'pieces'}</p>

      {items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-2xl text-brand-900">Your bag is empty.</p>
          <Link href="/collections" className="mt-6 inline-block bg-brand-700 hover:bg-brand-900 text-cream-50 px-8 h-12 leading-[3rem] text-xs uppercase tracking-[0.22em]">Shop Collections</Link>
        </div>
      ) : (
        <div className="mt-10 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 divide-y divide-border">
            {items.map((item) => (
              <div key={item.key} className="flex gap-4 md:gap-6 py-6">
                <div className="relative w-24 md:w-32 aspect-[3/4] bg-cream-100 overflow-hidden rounded-sm flex-shrink-0">
                  {item.image && <Image src={item.image} alt={item.title} fill sizes="128px" className="object-cover" />}
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/products/${item.handle}`} className="font-serif text-lg text-brand-900 hover:text-brand-700">{item.title}</Link>
                      {item.size && <div className="text-xs text-muted-foreground mt-1">Size · {item.size}</div>}
                    </div>
                    <button onClick={() => removeItem(item.key)} className="text-muted-foreground hover:text-destructive p-1" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex items-center border border-border rounded-sm">
                      <button onClick={() => updateQty(item.key, item.qty - 1)} disabled={item.qty <= 1} className="p-2 disabled:opacity-40" aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="px-3 text-sm w-8 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.key, item.qty + 1)} className="p-2" aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="text-base text-brand-900">{formatINR(item.price * item.qty)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start bg-cream-100 p-6 md:p-8 rounded-sm">
            <h2 className="font-serif text-2xl text-brand-900">Order Summary</h2>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-brand-900">{formatINR(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-brand-900">{subtotal >= 5000 ? 'Free' : 'Calculated at checkout'}</span></div>
            </div>
            <div className="border-t border-border mt-5 pt-5 flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-[0.22em]">Total</span>
              <span className="font-serif text-2xl text-brand-900">{formatINR(subtotal)}</span>
            </div>
            <Button onClick={onCheckout} disabled={loading} size="lg" className="w-full mt-6 rounded-none bg-brand-700 hover:bg-brand-900 text-cream-50 h-12 tracking-[0.22em] uppercase text-xs">{loading ? 'Preparing…' : 'Checkout'}</Button>
          </aside>
        </div>
      )}
    </section>
  );
}
