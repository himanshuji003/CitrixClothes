import { NextResponse, NextRequest } from 'next/server';
import {
  getProducts,
  getProductByHandle,
  getCollections,
} from '@/lib/shopify';

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path: pathArray } = await context.params;
  const path = (pathArray || []).join('/');

  try {
    /* HEALTH CHECK */
    if (path === '' || path === 'health') {
      return NextResponse.json({
        status: 'ok',
        service: 'citrix-clothes',
      });
    }

    /* PRODUCTS */
    if (path === 'products') {
      const products = await getProducts();
      return NextResponse.json({ products });
    }

    /* COLLECTIONS */
    if (path === 'collections') {
      const collections = await getCollections();
      return NextResponse.json({ collections });
    }

    /* SINGLE PRODUCT */
    if (path.startsWith('products/')) {
      const handle = path.replace('products/', '');
      const product = await getProductByHandle(handle);

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ product });
    }

    /* FALLBACK */
    return NextResponse.json(
      { error: 'Route not found' },
      { status: 404 }
    );

  } catch (e: any) {
    console.error('[API Error]', path, e);
    return NextResponse.json(
      { error: e.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = handler;
export const POST = handler;