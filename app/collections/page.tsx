import { getProducts } from '@/lib/shopify';
import CollectionsView from '@/components/collections/CollectionsView';

export const metadata = { title: 'All Pieces', description: 'Browse the complete Suitique Designs collection — Organza, Silk, Chanderi and Muslin.' };

export default async function CollectionsPage() {
  const products = await getProducts();
  return <CollectionsView products={products} initialCollection="all" title="All Pieces" />;
}
