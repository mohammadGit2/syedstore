import { notFound } from 'next/navigation';
import { getCatalog, getProductBySlug } from '@/lib/catalog';
import { formatPrice } from '@/lib/pricing';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { OrderButtons } from '@/components/product/OrderButtons';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  return { title: product?.name ?? 'Product', description: product?.shortDescription };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return notFound();
  const catalog = await getCatalog();
  const related = catalog.products.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <section className="container py-12">
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: '/products', label: 'Products' }, { href: `/products/${product.slug}`, label: product.name }]} />

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.images[0] || '/placeholder-product.svg'} alt={product.name} className="w-full rounded-lg object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <p className="mt-2 text-sm text-slate-600">{product.shortDescription}</p>
              <div className="mt-4 flex items-center gap-4">
                <strong className="text-2xl text-ocean">{formatPrice(product.salePrice ?? product.price)}</strong>
                {product.salePrice && <span className="text-sm line-through text-slate-400">{formatPrice(product.price)}</span>}
              </div>

              <div className="mt-4">
                <AddToCartButton product={product} />
                {/* @ts-expect-error Server component importing client */}
                <OrderButtons product={product} />
              </div>

              <div className="mt-6">
                <h3 className="font-bold">Product Details</h3>
                <p className="mt-2 text-slate-700">{product.description}</p>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-xl font-bold">Frequently asked</h3>
            <FAQ items={[{ q: 'Where do you deliver?', a: 'Next Market delivers across Pakistan through courier partners.' }]} />
          </div>
        </div>

        <aside>
          <div className="card p-4">
            <h4 className="font-bold">Why buy from Next Market?</h4>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
              <li>Cash on Delivery Available</li>
              <li>Fast Delivery Across Pakistan</li>
              <li>Secure Ordering Process</li>
              <li>Customer Support via WhatsApp</li>
            </ul>
          </div>

          <div className="mt-6">
            <h4 className="font-bold">You may also like</h4>
            <div className="mt-3 grid gap-3">
              {related.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <img src={p.images[0] || '/placeholder-product.svg'} alt={p.name} className="h-12 w-12 rounded object-cover" />
                  <div>
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-sm text-slate-600">{formatPrice(p.salePrice ?? p.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
