'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { formatINR } from '@/lib/products';
import { useWishlist } from '@/lib/wishlist-context';
import type { Product } from '@/types';

interface ProductCardProps { product: Product; index?: number; priority?: boolean }

export default function ProductCard({ product, index = 0, priority = false }: ProductCardProps) {
  const { has, toggle, hydrated } = useWishlist();
  const wished = hydrated && has(product.handle);
  const [first, second] = product.images || [];
  
  // Skip rendering if no images available
  if (!first) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3), ease: 'easeOut' }}
      className="group"
    >
      <Link href={`/products/${product.handle}`} className="block">
        <div className="relative overflow-hidden bg-cream-100 aspect-[3/4] rounded-sm">
          <Image src={first} alt={product.title} fill priority={priority} sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-opacity duration-700 group-hover:opacity-0" />
          {second && <Image src={second} alt={`${product.title} alternate`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100 hidden md:block" />}
          {product.tag && <span className="absolute top-3 left-3 bg-cream-50/90 backdrop-blur-sm text-brand-900 text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-sm">{product.tag}</span>}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.handle); }}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${wished ? 'bg-brand-700 text-cream-50' : 'bg-cream-50/85 text-brand-900 hover:bg-cream-50'}`}
          >
            <Heart className={`h-4 w-4 ${wished ? 'fill-current' : ''}`} />
          </button>
        </div>
        <div className="mt-3 md:mt-4 px-0.5">
          <h3 className="font-serif text-[15px] md:text-base text-brand-900 leading-snug line-clamp-2">{product.title}</h3>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-sm text-brand-900">{formatINR(product.price)}</span>
            {product.compareAt && product.compareAt > product.price && (
              <span className="text-xs text-muted-foreground line-through">{formatINR(product.compareAt)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
