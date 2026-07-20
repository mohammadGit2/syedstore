import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/catalog';
import OrderForm from '@/components/product/OrderForm';

export default async function OrderEmailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const product = await getProductBySlug(slug);
  if (!product) return notFound();

  return (
    <section className="container py-12">
      <h1 className="text-3xl font-black text-ocean">Order via Email</h1>
      <p className="mt-2 text-slate-600">You can review and edit the message before it opens in your email client.</p>
      <div className="mt-6">
        {/* @ts-expect-error Server component passing plain object */}
        <OrderForm product={product} />
      </div>
    </section>
  );
}
