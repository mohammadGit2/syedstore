import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getCatalog, normalizeProduct, saveCatalog } from '@/lib/catalog';
import type { Product } from '@/types/product';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const catalog = await getCatalog();
  const index = catalog.products.findIndex((product) => product.id === id);
  if (index < 0) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  const body = (await request.json()) as Partial<Product>;
  const categorySet = new Set(catalog.categories.map((category) => category.slug));
  catalog.products[index] = normalizeProduct({ ...catalog.products[index], ...body }, categorySet);
  await saveCatalog(catalog);
  return NextResponse.json(catalog.products[index]);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const catalog = await getCatalog();
  const product = catalog.products.find((item) => item.id === id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  if (catalog.products.length <= 1) return NextResponse.json({ error: 'At least one product is required' }, { status: 400 });
  catalog.products = catalog.products.filter((item) => item.id !== id);
  await saveCatalog(catalog);
  return NextResponse.json({ ok: true });
}
