'use client';
import Image from 'next/image';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatINR } from '@/lib/products';
import { createCart } from '@/lib/shopify';
import { toast } from 'sonner';
import { useState } from 'react';
import Link from 'next/link';

export default function CartDrawer() {
  const { items, open, setOpen, subtotal, removeItem, updateQty, count } = useCart();
  const [loading, setLoading] = useState(false);

  const onCheckout = async () => {
    setLoading(true);
    try {
      console.log('[CartDrawer] onCheckout: Starting checkout', { itemCount: items.length, items });
      
      // Validate cart items have variant IDs
      const itemsWithoutVariants = items.filter((i) => !i.variantId);
      if (itemsWithoutVariants.length > 0) {
        console.error('[CartDrawer] onCheckout: Cart contains items without valid variant IDs', {
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

      console.log('[CartDrawer] onCheckout: Initiating checkout', {
        itemCount: items.length,
        lines,
      });

      const cart = await createCart(lines);

      // Validate checkout URL
      if (!cart?.checkoutUrl) {
        console.error('[CartDrawer] onCheckout: No checkoutUrl in response', { cart });
        toast.error('Failed to initialize checkout. Please try again.');
        return;
      }

      if (cart.checkoutUrl === '#mock-checkout') {
        console.warn('[CartDrawer] onCheckout: Mock checkout URL detected', { cart });
        toast.info('Demo mode — connect your Shopify store to enable checkout.');
        return;
      }

      console.log('[CartDrawer] onCheckout: Valid checkout URL received, redirecting', {
        checkoutUrl: cart.checkoutUrl,
      });

      // Redirect to Shopify checkout
      window.location.href = cart.checkoutUrl;
    } catch (error) {
      console.error('[CartDrawer] onCheckout: Checkout failed', {
        error: error instanceof Error ? error.message : String(error),
        itemCount: items.length,
      });
      toast.error('Checkout failed. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-cream-50 border-l border-border p-0 flex flex-col">
        <SheetTitle className="font-serif text-xl text-brand-900 px-5 py-5 border-b border-border">Your Bag</SheetTitle>
        <SheetDescription className="text-xs uppercase tracking-[0.2em] text-muted-foreground px-5 pb-3">{count} {count === 1 ? 'piece' : 'pieces'}</SheetDescription>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <ShoppingBag className="h-10 w-10 text-brand-300 mb-4" strokeWidth={1.25} />
            <p className="font-serif text-xl text-brand-900">Your bag is empty</p>
            <p className="text-sm text-muted-foreground mt-2">Discover pieces made to be loved.</p>
            <Button onClick={() => setOpen(false)} asChild className="mt-6 rounded-none bg-brand-700 hover:bg-brand-900 text-cream-50 px-8">
              <Link href="/collections">Shop Collections</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-border">
              {items.map((item) => (
                <div key={item.key} className="flex gap-4 py-4">
                  <div className="relative w-20 h-28 flex-shrink-0 bg-cream-100 overflow-hidden rounded-sm">
                    {item.image && <Image src={item.image} alt={item.title} fill sizes="80px" className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif text-[15px] text-brand-900 leading-snug line-clamp-2">{item.title}</h4>
                      <button onClick={() => removeItem(item.key)} className="text-muted-foreground hover:text-destructive p-1 -mr-1" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    {item.size && <div className="text-xs text-muted-foreground mt-1">Size · {item.size}</div>}
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <div className="flex items-center border border-border rounded-sm">
                        <button onClick={() => updateQty(item.key, item.qty - 1)} className="p-2 hover:bg-cream-100 disabled:opacity-40" disabled={item.qty <= 1} aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="px-3 text-sm w-8 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.key, item.qty + 1)} className="p-2 hover:bg-cream-100" aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="text-sm text-brand-900">{formatINR(item.price * item.qty)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border bg-cream-100/60 px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Subtotal</span>
                <span className="font-serif text-xl text-brand-900">{formatINR(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Shipping & taxes calculated at checkout.</p>
              <Button onClick={onCheckout} disabled={loading} size="lg" className="w-full rounded-none bg-brand-700 hover:bg-brand-900 text-cream-50 h-12 tracking-[0.18em] uppercase text-xs">{loading ? 'Preparing…' : 'Checkout'}</Button>
              <button onClick={() => setOpen(false)} className="w-full text-center mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-brand-700">Continue Shopping</button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
