import { NextResponse, NextRequest } from 'next/server';
import {
  getProducts,
  getProductByHandle,
  getCollections,
  getCustomerOrders,
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

    /* SECURE ORDERS ENDPOINT - FIXED: Now uses cookie + parameterized GraphQL */
    if (path === 'orders') {
      // Read token from HTTP-only cookie (only available on server)
      const token = req.cookies.get('shopify_token')?.value;

      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized - Please login' },
          { status: 401 }
        );
      }

      try {
        const orders = await getCustomerOrders(token);
        return NextResponse.json({ orders });
      } catch (error: any) {
        // If token is invalid or expired, return 401
        if (error.message?.includes('Invalid access token')) {
          return NextResponse.json(
            { error: 'Token expired - Please login again' },
            { status: 401 }
          );
        }
        throw error;
      }
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