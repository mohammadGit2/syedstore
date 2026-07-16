'use client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { Catalog, Category, Product } from '@/types/product';

type EditableProduct = Product & { featuresText: string; tagsText: string; imagesText: string; specificationsText: string };
const blankProduct = (category: string): EditableProduct => ({ id: '', slug: '', name: '', shortDescription: '', description: '', price: 0, salePrice: undefined, category, images: [], imagesText: '', features: [], featuresText: '', specifications: {}, specificationsText: '{}', rating: 0, reviewCount: 0, stockStatus: 'In Stock', stockQuantity: 0, tags: [], tagsText: '', featured: false, updatedAt: '' });

function toEditable(product: Product): EditableProduct {
  return { ...product, featuresText: product.features.join('\n'), tagsText: product.tags.join(', '), imagesText: product.images.join('\n'), specificationsText: JSON.stringify(product.specifications, null, 2) };
}
function fromEditable(product: EditableProduct): Product {
  let specifications: Record<string, string> = {};
  try { specifications = JSON.parse(product.specificationsText || '{}'); } catch { specifications = {}; }
  return { ...product, images: product.imagesText.split('\n').map((x) => x.trim()).filter(Boolean), features: product.featuresText.split('\n').map((x) => x.trim()).filter(Boolean), tags: product.tagsText.split(',').map((x) => x.trim()).filter(Boolean), specifications };
}

export function AdminDashboard({ initialCatalog }: { initialCatalog: Catalog }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [catalog, setCatalog] = useState(initialCatalog);
  const [selectedId, setSelectedId] = useState(initialCatalog.products[0]?.id || 'new');
  const [draft, setDraft] = useState<EditableProduct>(() => initialCatalog.products[0] ? toEditable(initialCatalog.products[0]) : blankProduct(initialCatalog.categories[0]?.slug || 'home-essentials'));
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const selectedProduct = useMemo(() => catalog.products.find((product) => product.id === selectedId), [catalog.products, selectedId]);

  useEffect(() => { fetch('/api/admin/session').then((res) => res.json()).then((data) => setAuthenticated(Boolean(data.authenticated))).catch(() => setAuthenticated(false)); }, []);
  useEffect(() => { setDraft(selectedProduct ? toEditable(selectedProduct) : blankProduct(catalog.categories[0]?.slug || 'home-essentials')); }, [selectedProduct, catalog.categories]);

  async function login(event: FormEvent) {
    event.preventDefault();
    const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password }) });
    setAuthenticated(response.ok);
    setMessage(response.ok ? 'Admin session started.' : 'Invalid password.');
  }

  async function refresh() {
    const response = await fetch('/api/products', { cache: 'no-store' });
    const nextCatalog = await response.json();
    setCatalog(nextCatalog);
    return nextCatalog as Catalog;
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const product = fromEditable(draft);
    const response = await fetch(product.id ? `/api/products/${product.id}` : '/api/products', { method: product.id ? 'PUT' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(product) });
    const payload = await response.json().catch(() => ({}));
    setMessage(response.ok ? 'Product saved and storefront cache refreshed.' : `Save failed: ${payload.error || 'Unknown error'}`);
    const next = await refresh();
    if (response.ok) setSelectedId(payload.id || next.products[0]?.id || 'new');
    setSaving(false);
  }

  async function deleteProduct() {
    if (!draft.id || !confirm(`Delete ${draft.name}? This cannot be undone.`)) return;
    const response = await fetch(`/api/products/${draft.id}`, { method: 'DELETE' });
    setMessage(response.ok ? 'Product deleted.' : `Delete failed: ${(await response.json()).error || 'Unknown error'}`);
    const next = await refresh();
    setSelectedId(next.products[0]?.id || 'new');
  }

  async function saveContent(event: FormEvent) {
    event.preventDefault();
    const response = await fetch('/api/products', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ categories: catalog.categories, homepage: catalog.homepage }) });
    setMessage(response.ok ? 'Homepage and category content saved.' : 'Content save failed.');
    await refresh();
  }

  if (!authenticated) return <section className="container py-16"><form onSubmit={login} className="card mx-auto max-w-md p-8"><h1 className="text-3xl font-black text-ocean">Syed Store Admin</h1><p className="mt-2 text-slate-600">Enter the admin password to manage products and homepage content.</p><label className="mt-6 block font-bold" htmlFor="password">Password</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-2xl border p-3" required /><button className="btn btn-primary mt-5 w-full">Login</button>{message && <p className="mt-4 text-sm text-slate-600">{message}</p>}</form></section>;

  return <section className="container py-10"><div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-4xl font-black text-ocean">Admin Dashboard</h1><p className="text-slate-600">Manage catalog data stored through the API and reflected on the storefront.</p></div><button className="btn btn-secondary" onClick={() => { fetch('/api/admin/logout', { method: 'POST' }); setAuthenticated(false); }}>Logout</button></div>{message && <div className="mt-5 rounded-2xl bg-surface p-4 font-semibold text-ocean">{message}</div>}<div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]"><aside className="card h-fit p-5"><button className="btn btn-primary w-full" onClick={() => setSelectedId('new')}>Add New Product</button><div className="mt-5 space-y-2">{catalog.products.map((product) => <button key={product.id} onClick={() => setSelectedId(product.id)} className={`w-full rounded-2xl p-3 text-left ${selectedId === product.id ? 'bg-ocean text-white' : 'bg-surface'}`}><b>{product.name}</b><span className="block text-sm">Stock: {product.stockQuantity}</span></button>)}</div></aside><form onSubmit={saveProduct} className="card grid gap-4 p-6"><h2 className="text-2xl font-black text-ocean">{draft.id ? 'Edit Product' : 'Add Product'}</h2><div className="grid gap-4 md:grid-cols-2"><label>Name<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="mt-1 w-full rounded-xl border p-3" required /></label><label>Slug<input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label><label>Price<input type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} className="mt-1 w-full rounded-xl border p-3" required /></label><label>Sale Price<input type="number" value={draft.salePrice || ''} onChange={(e) => setDraft({ ...draft, salePrice: e.target.value ? Number(e.target.value) : undefined })} className="mt-1 w-full rounded-xl border p-3" /></label><label>Stock Quantity<input type="number" value={draft.stockQuantity} onChange={(e) => setDraft({ ...draft, stockQuantity: Number(e.target.value) })} className="mt-1 w-full rounded-xl border p-3" /></label><label>Category<select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="mt-1 w-full rounded-xl border p-3">{catalog.categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label></div><label>Short Description<input value={draft.shortDescription} onChange={(e) => setDraft({ ...draft, shortDescription: e.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label><label>Description<textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="mt-1 min-h-28 w-full rounded-xl border p-3" /></label><label>Images (one URL per line)<textarea value={draft.imagesText} onChange={(e) => setDraft({ ...draft, imagesText: e.target.value })} className="mt-1 min-h-24 w-full rounded-xl border p-3" /></label><label>Features (one per line)<textarea value={draft.featuresText} onChange={(e) => setDraft({ ...draft, featuresText: e.target.value })} className="mt-1 min-h-24 w-full rounded-xl border p-3" /></label><label>Tags (comma separated)<input value={draft.tagsText} onChange={(e) => setDraft({ ...draft, tagsText: e.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label><label>Specifications JSON<textarea value={draft.specificationsText} onChange={(e) => setDraft({ ...draft, specificationsText: e.target.value })} className="mt-1 min-h-28 w-full rounded-xl border p-3 font-mono text-sm" /></label><label className="flex gap-2"><input type="checkbox" checked={draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} /> Featured product</label><div className="flex flex-wrap gap-3"><button disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save Product'}</button>{draft.id && <button type="button" onClick={deleteProduct} className="btn bg-red-600 text-white">Delete Product</button>}</div></form></div><form onSubmit={saveContent} className="card mt-8 grid gap-4 p-6"><h2 className="text-2xl font-black text-ocean">Homepage & Categories</h2><label>Announcement<input value={catalog.homepage.announcement} onChange={(e) => setCatalog({ ...catalog, homepage: { ...catalog.homepage, announcement: e.target.value } })} className="mt-1 w-full rounded-xl border p-3" /></label><label>Hero Headline<input value={catalog.homepage.heroHeadline} onChange={(e) => setCatalog({ ...catalog, homepage: { ...catalog.homepage, heroHeadline: e.target.value } })} className="mt-1 w-full rounded-xl border p-3" /></label><label>Hero Subheadline<textarea value={catalog.homepage.heroSubheadline} onChange={(e) => setCatalog({ ...catalog, homepage: { ...catalog.homepage, heroSubheadline: e.target.value } })} className="mt-1 w-full rounded-xl border p-3" /></label><div className="grid gap-4 md:grid-cols-2">{catalog.categories.map((category: Category, index) => <div className="rounded-2xl border p-4" key={category.slug}><input value={category.name} onChange={(e) => { const categories = [...catalog.categories]; categories[index] = { ...category, name: e.target.value }; setCatalog({ ...catalog, categories }); }} className="w-full rounded-xl border p-3 font-bold" /><textarea value={category.description} onChange={(e) => { const categories = [...catalog.categories]; categories[index] = { ...category, description: e.target.value }; setCatalog({ ...catalog, categories }); }} className="mt-2 w-full rounded-xl border p-3" /></div>)}</div><button className="btn btn-primary w-fit">Save Homepage Content</button></form></section>;
}
