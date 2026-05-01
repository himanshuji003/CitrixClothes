function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-cream-200 rounded-sm" />
      <div className="mt-3 h-4 w-3/4 bg-cream-200 rounded" />
      <div className="mt-2 h-3 w-1/3 bg-cream-200 rounded" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
      {Array.from({ length: count }).map((_, i) => (<ProductCardSkeleton key={i} />))}
    </div>
  );
}

export default ProductCardSkeleton;
