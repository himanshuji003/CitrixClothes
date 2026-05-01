import { notFound } from 'next/navigation';
import { getProductByHandle, getProducts } from '@/lib/shopify';
import ProductDetail from '@/components/product/ProductDetail';

interface Params { handle: string }

export async function generateMetadata({ params }: { params: Params }) {
  const product = await getProductByHandle(params.handle);
  if (!product) return { title: 'Not found' };
  return {
    title: product.title,
    description: product.description.slice(0, 160),
    openGraph: { title: product.title, description: product.description.slice(0, 160), images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const product = await getProductByHandle(params.handle);
  if (!product) return notFound();
  const all = await getProducts();
  const related = all.filter((p) => p.handle !== params.handle && p.collection === product.collection).slice(0, 4);
  return <ProductDetail product={product} related={related} />;
}
