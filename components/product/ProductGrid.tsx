import ProductCard from './ProductCard';
import type { Product } from '@/types';

interface ProductGridProps { products: Product[]; columns?: '2-3' | '2-4' }

export default function ProductGrid({ products, columns = '2-4' }: ProductGridProps) {
  const cls = columns === '2-3'
    ? 'grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14'
    : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14';
  return (
    <div className={cls}>
      {products.map((p, i) => (<ProductCard key={p.handle} product={p} index={i} priority={i < 4} />))}
    </div>
  );
}
