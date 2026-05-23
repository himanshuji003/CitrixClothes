import { getCollectionByHandle, getCollectionWithProductsByHandle } from '@/lib/shopify';
import CollectionsView from '@/components/collections/CollectionsView';
import { notFound } from 'next/navigation';

// ISR every 60 seconds: revalidates product list to show latest items in collection
export const revalidate = 60;
// dynamicParams=true allows new collection pages to render without 404
export const dynamicParams = true;

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ handle: string }> 
}) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);
  return { 
    title: collection?.title || 'Collection', 
    description: `Shop ${collection?.title || 'this collection'} — ${collection?.tagline || 'Suitique Designs'}.` 
  };
}

export default async function CollectionHandlePage({ 
  params 
}: { 
  params: Promise<{ handle: string }> 
}) {
  const { handle } = await params;
  
  console.log(`\n=== CollectionHandlePage ===`);
  console.log('Requested handle:', handle);
  
  // Fetch collection with products from Shopify (with mock fallback)
  const { collection, products } = await getCollectionWithProductsByHandle(handle);
  
  console.log('Collection found:', !!collection);
  console.log('Products fetched:', products.length);
  
  // Return 404 ONLY if collection doesn't exist
  // Empty products is NOT an error - show "No products found" message instead
  if (!collection && handle !== 'all') {
    console.log(`Collection "${handle}" not found - returning 404`);
    return notFound();
  }
  
  console.log(`=== End CollectionHandlePage ===\n`);
  
  return (
    <CollectionsView 
      products={products} 
      initialCollection={handle} 
      title={collection?.title || 'Collection'}
      tagline={collection?.tagline}
    />
  );
}
