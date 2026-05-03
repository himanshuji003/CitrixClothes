import { NextResponse, NextRequest } from 'next/server';
import { getProducts, getProductByHandle, getCollections } from '@/lib/shopify';

async function handler(
  _req: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path: pathArray } = await context.params;
  const path = (pathArray || []).join('/');

  try {
    if (path === '' || path === 'health') {
      return NextResponse.json({ status: 'ok', service: 'suitique-designs' });
    }

    if (path === 'products') {
      const products = await getProducts();
      return NextResponse.json({ products });
    }

    if (path === 'collections') {
      const collections = await getCollections();
      return NextResponse.json({ collections });
    }

    if (path.startsWith('products/')) {
      const handle = path.replace('products/', '');
      const product = await getProductByHandle(handle);

      if (!product) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      return NextResponse.json({ product });
    }

    return NextResponse.json({ error: 'Route not found' }, { status: 404 });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;