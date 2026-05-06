import { getProducts } from '@/lib/shopify';
import { COLLECTIONS } from '@/lib/products';
import CollectionsView from '@/components/collections/CollectionsView';
import { notFound } from 'next/navigation';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ handle: string }> 
}) {
  const { handle } = await params;
  const c = COLLECTIONS.find((x) => x.handle === handle);
  return { title: c?.title || 'Collection', description: `Shop ${c?.title || 'this collection'} — ${c?.tagline || 'Suitique Designs'}.` };
}

export default async function CollectionHandlePage({ 
  params 
}: { 
  params: Promise<{ handle: string }> 
}) {
  const { handle } = await params;
  const all = await getProducts();
  const collection = COLLECTIONS.find((c) => c.handle === handle);
  if (!collection && handle !== 'all') return notFound();
  const filtered = handle === 'all' ? all : all.filter((p) => p.collection === handle);
  return <CollectionsView products={filtered} initialCollection={handle} title={collection?.title || 'Collection'} tagline={collection?.tagline} />;
}
