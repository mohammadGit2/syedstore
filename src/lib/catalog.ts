import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import baseCatalog from '@/data/catalog.json';
import type { Catalog, Category, Product } from '@/types/product';

const DATA_FILE = path.join(process.cwd(), 'src/data/catalog.json');
const CACHE_TTL_MS = 30_000;
let cache: { value: Catalog; expires: number } | null = null;

export function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString('en-PK')}`;
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 90);
}

function fallbackCatalog(): Catalog {
  return JSON.parse(JSON.stringify(baseCatalog)) as Catalog;
}

async function readBlobCatalog() {
  if (!process.env.NETLIFY) return null;
  try {
    const { getStore } = await import('@netlify/blobs');
    const raw = await getStore('syed-store').get('catalog.json');
    return raw ? (JSON.parse(raw) as Catalog) : null;
  } catch {
    return null;
  }
}

async function writeBlobCatalog(catalog: Catalog) {
  if (!process.env.NETLIFY) return false;
  try {
    const { getStore } = await import('@netlify/blobs');
    await getStore('syed-store').set('catalog.json', JSON.stringify(catalog));
    return true;
  } catch {
    return false;
  }
}

export async function getCatalog(): Promise<Catalog> {
  if (cache && cache.expires > Date.now()) return cache.value;
  const blobCatalog = await readBlobCatalog();
  if (blobCatalog) {
    cache = { value: blobCatalog, expires: Date.now() + CACHE_TTL_MS };
    return blobCatalog;
  }
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const catalog = JSON.parse(raw) as Catalog;
    cache = { value: catalog, expires: Date.now() + CACHE_TTL_MS };
    return catalog;
  } catch {
    return fallbackCatalog();
  }
}

export async function saveCatalog(catalog: Catalog) {
  const normalized = normalizeCatalog(catalog);
  const wroteBlob = await writeBlobCatalog(normalized);
  if (!wroteBlob) await fs.writeFile(DATA_FILE, `${JSON.stringify(normalized, null, 2)}\n`);
  cache = { value: normalized, expires: Date.now() + CACHE_TTL_MS };
  return normalized;
}

export function normalizeCatalog(catalog: Catalog): Catalog {
  const categories = catalog.categories.map((category) => ({
    ...category,
    slug: slugify(category.slug || category.name),
    name: sanitizeText(category.name),
    description: sanitizeText(category.description),
    image: sanitizeUrl(category.image),
    featured: Boolean(category.featured),
  }));
  const categorySet = new Set(categories.map((category) => category.slug));
  const products = catalog.products.map((product) => normalizeProduct(product, categorySet));
  return { ...catalog, categories, products };
}

export function normalizeProduct(product: Product, categorySet?: Set<string>): Product {
  const stockQuantity = Math.max(0, Number(product.stockQuantity || 0));
  const stockStatus = stockQuantity === 0 ? 'Out of Stock' : stockQuantity <= 10 ? 'Low Stock' : 'In Stock';
  const category = categorySet?.has(product.category) ? product.category : product.category || 'home-essentials';
  return {
    ...product,
    id: product.id || randomUUID(),
    slug: slugify(product.slug || product.name),
    name: sanitizeText(product.name),
    shortDescription: sanitizeText(product.shortDescription).slice(0, 180),
    description: sanitizeText(product.description).slice(0, 2500),
    price: Math.max(0, Number(product.price || 0)),
    salePrice: product.salePrice ? Math.max(0, Number(product.salePrice)) : undefined,
    category,
    images: product.images.map(sanitizeUrl).filter(Boolean).slice(0, 6),
    features: product.features.map(sanitizeText).filter(Boolean).slice(0, 12),
    specifications: Object.fromEntries(Object.entries(product.specifications || {}).map(([key, value]) => [sanitizeText(key), sanitizeText(value)])),
    rating: Math.min(5, Math.max(0, Number(product.rating || 0))),
    reviewCount: Math.max(0, Number(product.reviewCount || 0)),
    stockQuantity,
    stockStatus,
    tags: product.tags.map((tag) => slugify(tag)).filter(Boolean).slice(0, 20),
    featured: Boolean(product.featured),
    updatedAt: new Date().toISOString(),
  };
}

export function sanitizeText(value: unknown) {
  return String(value ?? '').replace(/[<>]/g, '').trim();
}

export function sanitizeUrl(value: unknown) {
  const url = String(value ?? '').trim();
  if (!url) return '';
  if (url.startsWith('/')) return url;
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol) ? parsed.toString() : '';
  } catch {
    return '';
  }
}

export async function getProductBySlug(slug: string) {
  const catalog = await getCatalog();
  return catalog.products.find((product) => product.slug === slug);
}
