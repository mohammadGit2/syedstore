import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getCatalog, normalizeProduct, saveCatalog, slugify } from '@/lib/catalog';
import type { Product } from '@/types/product';

export async function GET() {
  const catalog = await getCatalog();
  return NextResponse.json(catalog, { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' } });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const catalog = await getCatalog();
  const body = (await request.json()) as Partial<Product>;
  const categorySet = new Set(catalog.categories.map((category) => category.slug));
  const product = normalizeProduct({
    id: randomUUID(),
    slug: slugify(body.slug || body.name || 'product'),
    name: body.name || 'New Product',
    shortDescription: body.shortDescription || '',
    description: body.description || '',
    price: Number(body.price || 0),
    salePrice: body.salePrice ? Number(body.salePrice) : undefined,
    category: body.category || catalog.categories[0]?.slug || 'home-essentials',
    images: body.images?.length ? body.images : ['/placeholder-product.svg'],
    features: body.features || [],
    specifications: body.specifications || {},
    rating: Number(body.rating || 0),
    reviewCount: Number(body.reviewCount || 0),
    stockStatus: 'In Stock',
    stockQuantity: Number(body.stockQuantity || 0),
    tags: body.tags || [],
    featured: Boolean(body.featured),
    updatedAt: new Date().toISOString(),
  }, categorySet);
  catalog.products.unshift(product);
  await saveCatalog(catalog);
  return NextResponse.json(product, { status: 201 });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const catalog = await getCatalog();
  const body = await request.json();
  if (Array.isArray(body.categories)) catalog.categories = body.categories;
  if (body.homepage) catalog.homepage = { ...catalog.homepage, ...body.homepage };
  const saved = await saveCatalog(catalog);
  return NextResponse.json(saved);
}
